import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREFIX = "HARNESS_ROLE_RESULT ";
const MAX = 64 * 1024;
const model = { model: "gpt-5.6-terra", reasoning: "medium" };
const need = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`missing ${key}`);
  return value;
};
const url = need("HARNESS_URL");
const workflow = need("HARNESS_WORKFLOW");
const session = need("HARNESS_SESSION");
const token = need("HARNESS_SESSION_TOKEN");
const headers = { authorization: `Bearer ${token}`, "x-harness-session": session };
let execution;
const evidence = {
  schemaVersion: 1,
  bridge: "design-map-semantic-bridge-001",
  bridgeIdentity: `sha256:${createHash("sha256").update(readFileSync(new URL(import.meta.url))).digest("hex")}`,
  workflow,
  session,
  model: { requested: model, hostConfigured: model, runtimeAttested: null },
};
function capture(stream) {
  let bytes = 0;
  let tail = Buffer.alloc(0);
  const hash = createHash("sha256");
  stream.on("data", (chunk) => {
    const data = Buffer.from(chunk);
    bytes += data.length;
    hash.update(data);
    tail = Buffer.concat([tail, data]).subarray(-MAX);
  });
  return () => ({ bytes, identity: `sha256:${hash.digest("hex")}`, truncated: bytes > tail.length, tail: tail.toString("utf8") });
}
function parseResult(stdout) {
  const line = stdout.tail.split(/\r?\n/).filter(Boolean).at(-1);
  if (!line?.startsWith(PREFIX)) throw new Error("provider omitted terminal HARNESS_ROLE_RESULT");
  let value;
  try { value = JSON.parse(line.slice(PREFIX.length)); } catch { throw new Error("provider emitted malformed HARNESS_ROLE_RESULT JSON"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("provider result is not an object");
  if (!Object.hasOwn(value, "disposition") || !Object.hasOwn(value, "methodology")) throw new Error("provider result lacks disposition or methodology");
  if (!['succeeded', 'blocked', 'refused', 'failed'].includes(value.disposition)) throw new Error("provider result has invalid disposition");
  if (!value.methodology || typeof value.methodology !== "object" || Array.isArray(value.methodology) || Object.keys(value.methodology).length !== 0) throw new Error("Design Map contract requires an empty methodology object");
  if (!Object.keys(value).every((key) => ['disposition', 'methodology', 'reason'].includes(key))) throw new Error("provider result contains unsupported fields");
  if (value.reason !== undefined && typeof value.reason !== "string") throw new Error("provider result reason must be a string");
  return value;
}
function git(...args) { return execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" }).trim(); }
function save() {
  const directory = join(process.cwd(), "spikes/014a-kernel-hardening-authority-cutover/bootstrap");
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `design-map-semantic-bridge-${execution ?? session}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
}
try {
  const response = await fetch(`${url}/governed/${workflow}/sessions/${session}`, { headers });
  if (!response.ok) throw new Error(`assignment fetch failed: HTTP ${response.status}`);
  const assignment = await response.json();
  if (!Array.isArray(assignment.assignments) || assignment.assignments.length !== 1) throw new Error("expected exactly one Harness assignment");
  const assigned = assignment.assignments[0];
  execution = assigned.execution?.id;
  if (!execution || assigned.grant?.role !== "design-map") throw new Error("assignment is not an exact Design Map execution");
  evidence.assignment = { execution, roleGrant: assigned.grant.id, role: assigned.grant.role, contractIdentity: assigned.grant.contractIdentity, skillIdentity: assigned.grant.skillIdentity, inputs: assigned.grant.inputs, capabilities: assigned.grant.capabilities };
  evidence.preExecutionHead = git("rev-parse", "HEAD");
  const prompt = `You are the worker for one already-authorized Harness Design Map assignment. This wrapper owns semantic-result submission, which is deliberately deferred until a separately authorized bootstrap publication check. Perform only the exact governed role, skill, and contract below. Read the frozen brief, write design-map.md and the skill-required manifest.md, inspect your diff, and create one local Git checkpoint commit containing only the authorized Design Map checkpoint. Do not push, fetch, use legacy workflow tooling, inspect evaluator-private paths, invoke another role, or edit the frozen spike.md. End with exactly one line ${PREFIX}{"disposition":"succeeded","methodology":{}} if the role succeeds. For blocked/refused/failed, return that disposition with an empty methodology object and an optional reason.\n\nExact Role Grant:\n${JSON.stringify(assigned.grant)}\n\nExact skill:\n${JSON.stringify(assigned.skill)}\n\nExact contract:\n${JSON.stringify(assigned.contract)}`;
  const child = spawn("codex", ["exec", "--ephemeral", "--sandbox", "workspace-write", "--model", model.model, "-c", 'model_reasoning_effort="medium"', prompt], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
  const out = capture(child.stdout);
  const err = capture(child.stderr);
  const exit = await new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", (code, signal) => resolve({ code, signal })); });
  evidence.provider = { exit, stdout: out(), stderr: err() };
  evidence.postExecutionHead = git("rev-parse", "HEAD");
  if (exit.code !== 0 || exit.signal) throw new Error(`provider execution failed: code ${exit.code}, signal ${exit.signal}`);
  evidence.semanticResult = parseResult(evidence.provider.stdout);
  evidence.status = "pending-bootstrap-publication-and-result-submission";
  save();
} catch (error) {
  evidence.status = "bootstrap-failed";
  evidence.failure = error instanceof Error ? error.message : String(error);
  try { evidence.postExecutionHead = git("rev-parse", "HEAD"); } catch {}
  save();
  console.error(evidence.failure);
  process.exitCode = 1;
}
