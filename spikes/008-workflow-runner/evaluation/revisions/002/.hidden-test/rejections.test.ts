// Case E5 — the four mandated rejections (TR2): unknown phase, non-spike
// path, a transition skipping a prior phase, and a duplicate terminal
// outcome for the same numbered phase attempt. Each leaves state unchanged.

import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflow, parseStatusJson } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";

await test("unknown phase is rejected for dispatch and record", async () => {
  const fixture = await createSpikeFixture("unknown-phase");
  try {
    await runWorkflow(["init", fixture.relPath]);

    const dispatch = await runWorkflow(["dispatch", "not-a-real-phase", fixture.relPath]);
    assert.notEqual(dispatch.exitCode, 0);

    const record = await runWorkflow(["record", "not-a-real-phase", fixture.relPath, "complete"]);
    assert.notEqual(record.exitCode, 0);

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    assert.ok(
      !records.some((r) => r.phase === "not-a-real-phase"),
      "an unknown phase must never appear in state",
    );
  } finally {
    await fixture.cleanup();
  }
});

await test("a non-spike path is rejected for every command", async () => {
  const badPaths = [
    "not-a-spike-at-all",
    "spikes/not-numeric-prefix",
    "../outside-the-repo",
    "spikes/../../etc",
    "/etc/passwd",
  ];
  for (const badPath of badPaths) {
    const init = await runWorkflow(["init", badPath]);
    assert.notEqual(init.exitCode, 0, `init must reject path: ${badPath}`);

    const status = await runWorkflow(["status", badPath]);
    assert.notEqual(status.exitCode, 0, `status must reject path: ${badPath}`);

    const dispatch = await runWorkflow(["dispatch", "brief-readiness", badPath]);
    assert.notEqual(dispatch.exitCode, 0, `dispatch must reject path: ${badPath}`);
  }
});

await test("a transition that skips a prior phase is rejected", async () => {
  const fixture = await createSpikeFixture("skip-phase");
  try {
    await runWorkflow(["init", fixture.relPath]);
    // design-map before brief-readiness has ever been dispatched at all.
    const skip = await runWorkflow(["dispatch", "design-map", fixture.relPath]);
    assert.notEqual(skip.exitCode, 0);

    // Two phases ahead: evaluator-verify before implementation exists.
    const skipFar = await runWorkflow(["dispatch", "evaluator-verify", fixture.relPath]);
    assert.notEqual(skipFar.exitCode, 0);

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    assert.ok(!records.some((r) => r.phase === "design-map"));
    assert.ok(!records.some((r) => r.phase === "evaluator-verify"));
  } finally {
    await fixture.cleanup();
  }
});

await test("a duplicate terminal outcome for the same numbered phase attempt is rejected", async () => {
  const fixture = await createSpikeFixture("dup-outcome");
  try {
    await runWorkflow(["init", fixture.relPath]);
    await runWorkflow(["dispatch", "brief-readiness", fixture.relPath]);
    const first = await runWorkflow(["record", "brief-readiness", fixture.relPath, "complete"]);
    assert.equal(first.exitCode, 0, first.stderr);

    const duplicateSame = await runWorkflow(["record", "brief-readiness", fixture.relPath, "complete"]);
    assert.notEqual(duplicateSame.exitCode, 0, "a second identical terminal outcome must be rejected");

    const duplicateDifferent = await runWorkflow(["record", "brief-readiness", fixture.relPath, "failed"]);
    assert.notEqual(
      duplicateDifferent.exitCode,
      0,
      "a second, different terminal outcome for the same attempt must also be rejected",
    );

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    const outcomes = records.filter((r) => r.phase === "brief-readiness" && r.attempt === 1 && r.outcome);
    assert.equal(outcomes.length, 1, "exactly one terminal outcome must remain recorded");
    assert.equal(outcomes[0]?.outcome, "complete");
  } finally {
    await fixture.cleanup();
  }
});
