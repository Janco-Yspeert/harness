import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const RESULT_PREFIX = "HARNESS_ROLE_RESULT ";
const MAX_CAPTURE_BYTES = 64 * 1024;
const requested = { model: "gpt-5.6-terra", reasoning: "medium" };

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`missing ${name}`);
  return value;
};

const url = required("HARNESS_URL");
const workflow = required("HARNESS_WORKFLOW");
const session = required("HARNESS_SESSION");
const token = required("HARNESS_SESSION_TOKEN");
const headers = {
  authorization: `Bearer ${token}`,
  "x-harness-session": session,
};

function boundedCapture(stream) {
  let bytes = 0;
  let tail = Buffer.alloc(0);
  const digest = createHash("sha256");
  stream.on("data", (chunk) => {
    const data = Buffer.from(chunk);
    bytes += data.length;
    digest.update(data);
    tail = Buffer.concat([tail, data]).subarray(-MAX_CAPTURE_BYTES);
  });
  return () => ({
    bytes,
    identity: `sha256:${digest.digest("hex")}`,
    truncated: bytes > tail.length,
    tail: tail.toString("utf8"),
  });
}

function terminalResult(stdout) {
  const lines = stdout.tail.split(/\r?\n/).filter(Boolean);
  const line = lines.at(-1);
  if (!line?.startsWith(RESULT_PREFIX))
    throw new Error("provider omitted terminal HARNESS_ROLE_RESULT");
  let raw;
  try {
    raw = JSON.parse(line.slice(RESULT_PREFIX.length));
  } catch {
    throw new Error("provider emitted malformed HARNESS_ROLE_RESULT JSON");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("provider result is not an object");
  if (!Object.hasOwn(raw, "disposition") || !Object.hasOwn(raw, "methodology"))
    throw new Error("provider result lacks disposition or methodology");
  if (![
    "succeeded",
    "blocked",
    "refused",
    "failed",
  ].includes(raw.disposition))
    throw new Error("provider result has an invalid disposition");
  if (!raw.methodology || typeof raw.methodology !== "object" || Array.isArray(raw.methodology))
    throw new Error("provider result has invalid methodology");
  if (raw.disposition === "succeeded" && !["READY", "NOT_READY"].includes(raw.methodology.verdict))
    throw new Error("successful Brief Readiness requires READY or NOT_READY verdict");
  if (!Object.keys(raw).every((key) => key === "disposition" || key === "methodology" || key === "reason"))
    throw new Error("provider result contains unsupported fields");
  if (raw.reason !== undefined && typeof raw.reason !== "string")
    throw new Error("provider result reason must be a string");
  return raw;
}

function evidencePath(execution) {
  const directory = join(
    process.cwd(),
    "spikes/014a-kernel-hardening-authority-cutover/bootstrap",
  );
  mkdirSync(directory, { recursive: true });
  return join(directory, `brief-readiness-semantic-bridge-${execution ?? session}.json`);
}

const evidence = {
  schemaVersion: 1,
  bridge: "brief-readiness-semantic-bridge-001",
  bridgeIdentity: `sha256:${createHash("sha256").update(readFileSync(new URL(import.meta.url))).digest("hex")}`,
  workflow,
  session,
  model: {
    requested,
    hostConfigured: requested,
    runtimeAttested: null,
  },
};
let execution;

function preserveEvidence() {
  writeFileSync(evidencePath(execution), `${JSON.stringify(evidence, null, 2)}\n`);
}

try {
  const assignmentResponse = await fetch(
    `${url}/governed/${workflow}/sessions/${session}`,
    { headers },
  );
  if (!assignmentResponse.ok)
    throw new Error(`assignment fetch failed: HTTP ${assignmentResponse.status}`);
  const assignment = await assignmentResponse.json();
  if (!Array.isArray(assignment.assignments) || assignment.assignments.length !== 1)
    throw new Error("expected exactly one Harness assignment");
  const assigned = assignment.assignments[0];
  execution = assigned.execution?.id;
  if (!execution || assigned.grant?.role !== "brief-readiness")
    throw new Error("assignment is not an exact Brief Readiness execution");
  evidence.assignment = {
    execution,
    roleGrant: assigned.grant.id,
    role: assigned.grant.role,
    contractIdentity: assigned.grant.contractIdentity,
    skillIdentity: assigned.grant.skillIdentity,
    inputs: assigned.grant.inputs,
  };

  const prompt = `You are the worker for one already-authorized Harness Brief Readiness assignment. This wrapper, not this prose, owns result submission. Perform only the assigned role against the exact public contract and then emit exactly one final line:\n${RESULT_PREFIX}{"disposition":"succeeded","methodology":{"verdict":"READY"}}\nUse READY only if the brief is ready; use NOT_READY when appropriate. For blocked/refused/failed use a valid disposition, a methodology object, and optional reason. Do not invoke or dispatch any other role, do not use legacy workflow tooling, and do not inspect evaluator-private paths.\n\nExact Role Grant:\n${JSON.stringify(assigned.grant)}\n\nExact skill:\n${JSON.stringify(assigned.skill)}\n\nExact contract:\n${JSON.stringify(assigned.contract)}`;
  const child = spawn(
    "codex",
    [
      "exec",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--model",
      requested.model,
      "-c",
      'model_reasoning_effort="medium"',
      prompt,
    ],
    { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
  );
  const stdoutCapture = boundedCapture(child.stdout);
  const stderrCapture = boundedCapture(child.stderr);
  const exit = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  evidence.provider = { exit, stdout: stdoutCapture(), stderr: stderrCapture() };
  if (exit.code !== 0 || exit.signal)
    throw new Error(`provider execution failed: code ${exit.code}, signal ${exit.signal}`);
  const result = terminalResult(evidence.provider.stdout);
  evidence.semanticResult = result;
  const resultResponse = await fetch(
    `${url}/governed/${workflow}/executions/${execution}/result`,
    {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify(result),
    },
  );
  evidence.submission = { status: resultResponse.status, body: await resultResponse.text() };
  if (!resultResponse.ok)
    throw new Error(`result submission failed: HTTP ${resultResponse.status}`);
  evidence.status = "submitted";
  preserveEvidence();
} catch (error) {
  evidence.status = "bootstrap-failed";
  evidence.failure = error instanceof Error ? error.message : String(error);
  preserveEvidence();
  console.error(evidence.failure);
  process.exitCode = 1;
}
