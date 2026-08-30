import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const spike = `spikes/999-workflow-test-${String(process.pid)}`;
const spikePath = join(repositoryRoot, spike);

function run(args: string[], environment: NodeJS.ProcessEnv = process.env) {
  const cleanEnvironment = { ...environment };
  delete cleanEnvironment.NODE_TEST_CONTEXT;
  return spawnSync("node", ["tools/workflow.ts", ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: cleanEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function git(args: string[], input?: string): string {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    input,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Harness test",
      GIT_AUTHOR_EMAIL: "harness-test@example.invalid",
      GIT_COMMITTER_NAME: "Harness test",
      GIT_COMMITTER_EMAIL: "harness-test@example.invalid",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function provenanceCommit(
  files: Record<string, string>,
  fixture: string,
): {
  commit: string;
  identities: Record<string, string>;
} {
  const identities: Record<string, string> = {};
  const entries = Object.entries(files).map(([name, contents]) => {
    identities[name] =
      `sha256:${createHash("sha256").update(contents).digest("hex")}`;
    return `100644 blob ${git(["hash-object", "-w", "--stdin"], contents)}\t${name}`;
  });
  const leaf = git(["mktree"], `${entries.join("\n")}\n`);
  const spikeDirectory = fixture.split("/")[1];
  assert.ok(spikeDirectory);
  const spikes = git(["mktree"], `040000 tree ${leaf}\t${spikeDirectory}\n`);
  const root = git(["mktree"], `040000 tree ${spikes}\tspikes\n`);
  return {
    commit: git(["commit-tree", root, "-m", "workflow fixture"]),
    identities,
  };
}

function complete(phase: string): void {
  assert.equal(run(["dispatch", phase, spike]).status, 0);
  assert.equal(run(["record", phase, spike, "complete"]).status, 0);
}

function waitForLog(logPath: string): string {
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const output = readFileSync(logPath, "utf8");
      if (output.includes("fixture started")) return output;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    Atomics.wait(sleeper, 0, 0, 10);
  }
  assert.fail("fixture did not write its log");
}

void test("workflow runner independently numbers verification attempts", (t) => {
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });

  assert.equal(run(["init", spike]).status, 0);
  const before = readFileSync(
    join(spikePath, ".workflow", "state.json"),
    "utf8",
  );
  const skipped = run(["dispatch", "implementation", spike]);
  assert.notEqual(skipped.status, 0);
  assert.equal(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
    before,
  );

  complete("brief-readiness");
  complete("design-map");
  complete("evaluator-prepare");
  complete("implementation");
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  assert.equal(run(["record", "evaluator-verify", spike, "failed"]).status, 0);
  assert.equal(run(["dispatch", "implementation", spike]).status, 0);
  assert.equal(run(["record", "implementation", spike, "complete"]).status, 0);
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);

  const duplicate = run(["record", "implementation", spike, "complete"]);
  assert.notEqual(duplicate.status, 0);
  assert.notEqual(run(["dispatch", "not-a-phase", spike]).status, 0);
  assert.notEqual(run(["dispatch", "evaluator-prepare", spike]).status, 0);
  const state = JSON.parse(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
  ) as {
    records: Array<{ phase: string; attempt: number }>;
  };
  assert.ok(
    state.records.some(
      (record) => record.phase === "implementation" && record.attempt === 2,
    ),
  );
  const verifies = state.records.filter(
    (record) => record.phase === "evaluator-verify",
  );
  assert.ok(verifies.some((record) => record.attempt === 1));
  assert.ok(verifies.some((record) => record.attempt === 2));
});

void test("blocked verification retries the unchanged implementation", (t) => {
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });
  assert.equal(run(["init", spike]).status, 0);
  complete("brief-readiness");
  complete("design-map");
  complete("evaluator-prepare");
  complete("implementation");
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  assert.equal(run(["record", "evaluator-verify", spike, "blocked"]).status, 0);
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  const state = JSON.parse(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
  ) as {
    records: Array<{
      event: string;
      phase: string;
      attempt: number;
      implementationAttempt?: number;
    }>;
  };
  assert.deepEqual(
    state.records
      .filter(
        (record) =>
          record.phase === "evaluator-verify" && record.event === "dispatch",
      )
      .map((record) => [record.attempt, record.implementationAttempt]),
    [
      [1, 1],
      [2, 1],
    ],
  );
});

void test("execute records a detached job and cancel terminates it", (t) => {
  mkdirSync(spikePath, { recursive: true });
  let jobPid: number | undefined;
  t.after(() => {
    if (jobPid !== undefined) process.kill(jobPid, "SIGTERM");
    rmSync(spikePath, { recursive: true, force: true });
  });
  const bin = mkdtempSync(join(tmpdir(), "harness-workflow-bin-"));
  t.after(() => {
    rmSync(bin, { recursive: true, force: true });
  });
  const codex = join(bin, "codex");
  writeFileSync(
    codex,
    "#!/usr/bin/env node\nconsole.log('fixture started'); setInterval(() => {}, 1000);\n",
  );
  chmodSync(codex, 0o755);

  assert.equal(run(["init", spike]).status, 0);
  const environment = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH ?? ""}`,
  };
  assert.equal(
    run(["dispatch", "brief-readiness", spike, "--execute"], environment)
      .status,
    0,
  );
  const state = JSON.parse(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
  ) as {
    records: Array<{
      job?: { pid: number; command: string[]; logPath: string; live: boolean };
    }>;
  };
  const job = state.records.find((record) => record.job !== undefined)?.job;
  assert.ok(job);
  jobPid = job.pid;
  assert.equal(job.command[0], "codex");
  assert.match(waitForLog(job.logPath), /fixture started/);
  assert.equal(run(["cancel", "brief-readiness", spike]).status, 0);
  jobPid = undefined;
});

void test("authority accepts valid repository-relative provenance", () => {
  const evidence = JSON.stringify({
    path: "spike.md",
    identity:
      "sha256:a3e81619e2bca965eac7b40789cbc7b98f5a29f5be7ef98b7c14714d85e5ddb4",
    commit: "51d020b",
  });
  const result = run([
    "authority",
    "validate",
    "spikes/010-workflow-authority",
    "brief-frozen",
    evidence,
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    allowed: true,
    recorded: false,
  });
});

void test("authority recognizes successor spike identifiers and exposes coverage state", () => {
  const result = run([
    "authority",
    "status",
    "spikes/010a-evaluation-coverage-human-rejection-recovery",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(result.stdout) as {
    history: Array<{ transition: string }>;
    humanDecision: string;
    technicalVerification: string;
  };
  assert.deepEqual(
    status.history.slice(0, 3).map((event) => event.transition),
    ["brief-frozen", "design-map-frozen", "evaluation-prepared"],
  );
  assert.equal(status.technicalVerification, "NOT_PASSED");
  assert.equal(status.humanDecision, "NOT_READY");
});

void test("authority preserves a complete PASS through human rejection", (t) => {
  const fixture = `spikes/998a-authority-fixture-${String(process.pid)}`;
  const path = join(repositoryRoot, fixture);
  const coverage = JSON.stringify({
    criteria: [
      { id: "AC01", mode: "PUBLIC_REGRESSION", required: true },
      { id: "AC02", mode: "MANUAL_PUBLIC_EVIDENCE", required: true },
    ],
  });
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": `${coverage}\n`,
    "acceptance.md": "rejected\n",
  };
  mkdirSync(path, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(path, name), contents);
  }
  t.after(() => {
    rmSync(path, { recursive: true, force: true });
  });
  const provenance = provenanceCommit(files, fixture);
  const evidence = (name: string) => ({
    path: name,
    identity: provenance.identities[name],
    commit: provenance.commit,
  });
  const record = (transition: string, data: object) => {
    const result = run([
      "authority",
      "record",
      fixture,
      transition,
      JSON.stringify(data),
    ]);
    assert.equal(result.status, 0, result.stderr);
  };
  record("brief-frozen", evidence("spike.md"));
  record("design-map-frozen", evidence("design-map.md"));
  record("evaluation-prepared", evidence("coverage-map.json"));
  record("implementation-handoff", { commit: provenance.commit, attempt: 1 });
  record("verification-allocated", {
    commit: provenance.commit,
    implementationAttempt: 1,
    attempt: 1,
  });
  const beforeMissingResult = readFileSync(
    join(path, "workflow.jsonl"),
    "utf8",
  );
  const incompletePass = run([
    "authority",
    "record",
    fixture,
    "verification-finalized",
    JSON.stringify({
      attempt: 1,
      result: "PASS",
      coverageResults: { AC01: "SATISFIED" },
    }),
  ]);
  assert.notEqual(incompletePass.status, 0);
  assert.equal(
    readFileSync(join(path, "workflow.jsonl"), "utf8"),
    beforeMissingResult,
  );
  const results = { AC01: "SATISFIED", AC02: "SATISFIED" };
  record("verification-finalized", {
    attempt: 1,
    result: "PASS",
    coverageResults: results,
  });
  record("promotion-recorded", {});
  record("as-built-recorded", {});
  const before = readFileSync(join(path, "workflow.jsonl"), "utf8");
  record("human-rejected", {
    ...evidence("acceptance.md"),
    classification: "EVALUATOR_COVERAGE_DEFECT",
  });
  const status = JSON.parse(run(["authority", "status", fixture]).stdout) as {
    technicalVerification: string;
    humanDecision: string;
    successorPermitted: boolean;
  };
  assert.equal(status.technicalVerification, "PASS");
  assert.equal(status.humanDecision, "REJECTED");
  assert.equal(status.successorPermitted, true);
  assert.ok(
    readFileSync(join(path, "workflow.jsonl"), "utf8").startsWith(before),
  );
  assert.notEqual(
    run(["authority", "record", fixture, "outcome-recorded", "{} "]).status,
    0,
  );
  assert.notEqual(
    run([
      "authority",
      "record",
      fixture,
      "human-accepted",
      JSON.stringify(evidence("acceptance.md")),
    ]).status,
    0,
  );
});
