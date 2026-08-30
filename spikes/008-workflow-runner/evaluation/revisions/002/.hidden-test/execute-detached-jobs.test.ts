// Case E7/E8 — `--execute` launches the owner's real CLI as a detached,
// non-blocking process with the exact stated argument vector, and records
// its PID/command/logPath/launch time.
// Case E9 — a process's exit is never itself an outcome; only explicit
// `record` unlocks the next phase.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { runWorkflow, parseStatusJson, jobFor, isProcessAlive, waitUntil, REPO_ROOT } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";
import { createFixtureBin, pathWithFixtureBin } from "./support/fixture-bin.ts";

const SLEEP_MS = 2000;

await test("--execute launches Codex as a detached, non-blocking process with the exact command", async () => {
  const fixture = await createSpikeFixture("execute-codex");
  const fixtureBin = await createFixtureBin([
    { name: "codex", sleepMs: SLEEP_MS, marker: "CODEX-RAN" },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    const env = { ...process.env, PATH: pathWithFixtureBin(fixtureBin) };

    const dispatch = await runWorkflow(
      ["dispatch", "brief-readiness", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);
    assert.ok(
      dispatch.durationMs < SLEEP_MS / 2,
      `dispatch --execute must return promptly (took ${String(dispatch.durationMs)}ms) instead of waiting for the ${String(SLEEP_MS)}ms fixture`,
    );

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    const job = jobFor(records, "brief-readiness", 1);
    if (!job) throw new Error("an --execute dispatch must record job metadata");
    assert.equal(typeof job.pid, "number");
    assert.ok(isProcessAlive(job.pid), "the detached process must still be alive shortly after dispatch returns");
    assert.equal(job.live, true, "status must report the job as live while it is still running");

    const commandText = typeof job.command === "string" ? job.command : job.command.join(" ");
    assert.match(commandText, /codex/);
    assert.match(commandText, /exec/);
    assert.match(commandText, /--cd/);
    assert.ok(
      commandText.includes(REPO_ROOT.replace(/\/$/, "")) || commandText.includes(REPO_ROOT),
      "the recorded command must pass the repository root to --cd",
    );

    const invocations = await fixtureBin.invocations();
    assert.equal(invocations.length, 1, "codex must be invoked exactly once");
    assert.match(invocations[0]?.args.join(" ") ?? "", /^exec --cd /);

    await waitUntil(() => !isProcessAlive(job.pid), 400, 20);

    const logContent = await readFile(job.logPath, "utf8");
    assert.match(logContent, /CODEX-RAN/, "the job's combined output must land in the recorded log file");

    const statusAfterExit = await runWorkflow(["status", fixture.relPath]);
    const { records: recordsAfterExit } = parseStatusJson(statusAfterExit.stdout);
    const jobAfterExit = jobFor(recordsAfterExit, "brief-readiness", 1);
    assert.equal(jobAfterExit?.live, false, "status must report the job as no longer live after natural exit");
  } finally {
    await fixture.cleanup();
    await fixtureBin.cleanup();
  }
});

await test("--execute launches Claude with the exact stated command for a Claude-owned phase", async () => {
  const fixture = await createSpikeFixture("execute-claude");
  const fixtureBin = await createFixtureBin([
    { name: "claude", sleepMs: 200, marker: "CLAUDE-RAN" },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    for (const phase of ["brief-readiness", "design-map"]) {
      await runWorkflow(["dispatch", phase, fixture.relPath]);
      await runWorkflow(["record", phase, fixture.relPath, "complete"]);
    }

    const env = { ...process.env, PATH: pathWithFixtureBin(fixtureBin) };
    const dispatch = await runWorkflow(
      ["dispatch", "evaluator-prepare", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    const job = jobFor(records, "evaluator-prepare", 1);
    if (!job) throw new Error("an --execute dispatch must record job metadata");
    const commandText = typeof job.command === "string" ? job.command : job.command.join(" ");
    assert.match(commandText, /claude/);
    assert.match(commandText, /-p/);
    assert.match(commandText, /--permission-mode/);
    assert.match(commandText, /manual/);

    const invocations = await fixtureBin.invocations();
    assert.equal(invocations.length, 1);
    assert.match(invocations[0]?.args.join(" ") ?? "", /^-p --permission-mode manual /);
  } finally {
    await fixture.cleanup();
    await fixtureBin.cleanup();
  }
});

await test("a job's successful exit is never treated as an implicit outcome", async () => {
  const fixture = await createSpikeFixture("no-implicit-outcome");
  const fixtureBin = await createFixtureBin([
    { name: "codex", sleepMs: 50, exitCode: 0, marker: "DONE-CLEANLY" },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    const env = { ...process.env, PATH: pathWithFixtureBin(fixtureBin) };
    const dispatch = await runWorkflow(
      ["dispatch", "brief-readiness", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);

    const status1 = await runWorkflow(["status", fixture.relPath]);
    const { records: r1 } = parseStatusJson(status1.stdout);
    const job1 = jobFor(r1, "brief-readiness", 1);
    assert.ok(job1);
    await waitUntil(() => !isProcessAlive(job1.pid), 400, 20);

    // Even though the fixture exited 0, the next phase must remain locked.
    const nextDispatch = await runWorkflow(["dispatch", "design-map", fixture.relPath]);
    assert.notEqual(
      nextDispatch.exitCode,
      0,
      "a clean process exit must not itself unlock the next phase",
    );

    const status2 = await runWorkflow(["status", fixture.relPath]);
    const { records: r2 } = parseStatusJson(status2.stdout);
    assert.equal(
      r2.some((r) => r.phase === "brief-readiness" && r.attempt === 1 && r.outcome),
      false,
      "no outcome may appear until record is called explicitly",
    );

    const record = await runWorkflow(["record", "brief-readiness", fixture.relPath, "complete"]);
    assert.equal(record.exitCode, 0, record.stderr);
    const nextDispatchNow = await runWorkflow(["dispatch", "design-map", fixture.relPath]);
    assert.equal(nextDispatchNow.exitCode, 0, "explicit record must be what unlocks the next phase");
  } finally {
    await fixture.cleanup();
    await fixtureBin.cleanup();
  }
});
