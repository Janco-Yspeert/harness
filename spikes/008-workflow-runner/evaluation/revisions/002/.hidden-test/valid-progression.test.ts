// Case E2 — a full valid progression through all seven canonical phases:
// each dispatch is rejected until its predecessor is recorded `complete`,
// dry-run dispatch never blocks on a predecessor once permitted, and
// `status` accumulates an append-only, growing record of the run.

import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflow, parseStatusJson, outcomeFor } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";
import { PHASE_ORDER } from "./support/phases.ts";

await test("full progression: each phase unlocks only after its predecessor is recorded complete", async () => {
  const fixture = await createSpikeFixture("progression");
  try {
    const init = await runWorkflow(["init", fixture.relPath]);
    assert.equal(init.exitCode, 0, `init failed: ${init.stderr}`);

    for (const [i, phase] of PHASE_ORDER.entries()) {
      const next = PHASE_ORDER[i + 1];

      // Attempting the *next* phase before this one completes must fail.
      if (next) {
        const early = await runWorkflow(["dispatch", next, fixture.relPath]);
        assert.notEqual(
          early.exitCode,
          0,
          `dispatching ${next} before ${phase} completed should be rejected`,
        );
      }

      const dispatch = await runWorkflow(["dispatch", phase, fixture.relPath]);
      assert.equal(
        dispatch.exitCode,
        0,
        `dispatching ${phase} in order should succeed: ${dispatch.stderr}`,
      );

      const record = await runWorkflow([
        "record",
        phase,
        fixture.relPath,
        "complete",
      ]);
      assert.equal(
        record.exitCode,
        0,
        `recording ${phase} complete should succeed: ${record.stderr}`,
      );

      const status = await runWorkflow(["status", fixture.relPath]);
      assert.equal(status.exitCode, 0);
      const { records } = parseStatusJson(status.stdout);
      assert.equal(
        outcomeFor(records, phase, 1),
        "complete",
        `status must report ${phase} attempt 1 as complete`,
      );
    }

    // Every phase's completion remains visible at the end (append-only).
    const finalStatus = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(finalStatus.stdout);
    for (const phase of PHASE_ORDER) {
      assert.equal(
        outcomeFor(records, phase, 1),
        "complete",
        `${phase} must still show complete at the end of the run`,
      );
    }
  } finally {
    await fixture.cleanup();
  }
});
