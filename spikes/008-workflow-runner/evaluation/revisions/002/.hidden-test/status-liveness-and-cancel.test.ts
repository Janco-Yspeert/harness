// Case E10 — `status` liveness is computed from real OS process state, not
// from reading the job's log content.
// Case E11 — `cancel` terminates only the targeted phase's currently
// recorded live job, leaving a different phase's simultaneously live job
// untouched.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { runWorkflow, parseStatusJson, jobFor, isProcessAlive, waitUntil } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";
import { createFixtureBin, pathWithFixtureBin } from "./support/fixture-bin.ts";

await test("status liveness reflects real process state, not log content", async () => {
  const fixture = await createSpikeFixture("liveness");
  // Marker withheld until just before exit: while the log is still empty,
  // the process is nonetheless alive, so a log-content-based liveness
  // heuristic would get this wrong.
  const fixtureBin = await createFixtureBin([
    { name: "codex", sleepMs: 600, marker: "LATE-MARKER", writeMarkerBeforeExit: true },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    const env = { ...process.env, PATH: pathWithFixtureBin(fixtureBin) };
    const dispatch = await runWorkflow(
      ["dispatch", "brief-readiness", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);

    const statusWhileEmpty = await runWorkflow(["status", fixture.relPath]);
    const { records: r1 } = parseStatusJson(statusWhileEmpty.stdout);
    const job1 = jobFor(r1, "brief-readiness", 1);
    assert.ok(job1);
    assert.equal(job1.live, true, "job must report live while the log is still empty");

    const logWhileLive = await readFile(job1.logPath, "utf8").catch(() => "");
    assert.equal(logWhileLive, "", "the fixture withholds output until just before exit");

    await waitUntil(() => !isProcessAlive(job1.pid), 400, 20);
    const statusAfter = await runWorkflow(["status", fixture.relPath]);
    const { records: r2 } = parseStatusJson(statusAfter.stdout);
    const job2 = jobFor(r2, "brief-readiness", 1);
    assert.equal(job2?.live, false, "job must report not-live once the process has actually exited");
  } finally {
    await fixture.cleanup();
    await fixtureBin.cleanup();
  }
});

await test("cancel terminates only the targeted phase's live job, leaving another phase's job untouched", async () => {
  const fixture = await createSpikeFixture("cancel-isolation");
  const fixtureBin = await createFixtureBin([
    { name: "codex", sleepMs: 3000, marker: "CODEX-LONG-RUNNING" },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    const env = { ...process.env, PATH: pathWithFixtureBin(fixtureBin) };

    // Start a live job for brief-readiness, then explicitly record it
    // complete (recording is independent of job liveness) so design-map can
    // also start a live job while brief-readiness's is still running.
    const dispatch1 = await runWorkflow(
      ["dispatch", "brief-readiness", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch1.exitCode, 0, dispatch1.stderr);
    const record1 = await runWorkflow(["record", "brief-readiness", fixture.relPath, "complete"]);
    assert.equal(record1.exitCode, 0, record1.stderr);

    const dispatch2 = await runWorkflow(
      ["dispatch", "design-map", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch2.exitCode, 0, dispatch2.stderr);

    const statusBefore = await runWorkflow(["status", fixture.relPath]);
    const { records: before } = parseStatusJson(statusBefore.stdout);
    const briefJob = jobFor(before, "brief-readiness", 1);
    const designJob = jobFor(before, "design-map", 1);
    assert.ok(briefJob && isProcessAlive(briefJob.pid), "brief-readiness job must be live before cancel");
    assert.ok(designJob && isProcessAlive(designJob.pid), "design-map job must be live before cancel");
    assert.notEqual(briefJob.pid, designJob.pid);

    const cancel = await runWorkflow(["cancel", "brief-readiness", fixture.relPath]);
    assert.equal(cancel.exitCode, 0, cancel.stderr);

    await waitUntil(() => !isProcessAlive(briefJob.pid), 400, 20);
    assert.ok(
      isProcessAlive(designJob.pid),
      "cancelling brief-readiness's job must not affect design-map's simultaneously live job",
    );

    const statusAfter = await runWorkflow(["status", fixture.relPath]);
    const { records: after } = parseStatusJson(statusAfter.stdout);
    assert.equal(jobFor(after, "brief-readiness", 1)?.live, false);
    assert.equal(jobFor(after, "design-map", 1)?.live, true);
  } finally {
    await fixture.cleanup();
    await fixtureBin.cleanup();
  }
});
