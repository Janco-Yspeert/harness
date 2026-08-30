import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
