// Case E3 — the sole permitted reopening: a failed `evaluator-verify`
// attempt opens the next numbered `implementation` attempt, and earlier
// attempt records remain present afterward.
// Case E4 — `evaluator-prepare` can never be redispatched by this runner,
// regardless of its own recorded outcome or any later implementation retry.
// Covered by two independent fixtures (one recording a non-complete
// outcome, one recording `complete`) rather than one fixture recording two
// outcomes for the same attempt, since R7 forbids a second terminal outcome
// for the same numbered phase+attempt regardless of value.

import assert from "node:assert/strict";
import test from "node:test";

import {
  runWorkflow,
  parseStatusJson,
  outcomeFor,
  recordsFor,
} from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";
import { advanceTo } from "./support/progress.ts";

await test("a failed evaluator-verify opens the next implementation attempt; prior attempts remain recorded", async () => {
  const fixture = await createSpikeFixture("retry");
  try {
    const init = await runWorkflow(["init", fixture.relPath]);
    assert.equal(init.exitCode, 0);
    await advanceTo(fixture.relPath, "evaluator-prepare");
    const prepDispatch = await runWorkflow([
      "dispatch",
      "evaluator-prepare",
      fixture.relPath,
    ]);
    assert.equal(prepDispatch.exitCode, 0);
    const prepRecord = await runWorkflow([
      "record",
      "evaluator-prepare",
      fixture.relPath,
      "complete",
    ]);
    assert.equal(prepRecord.exitCode, 0);

    // Attempt 1: implementation -> evaluator-verify, verify fails.
    const impl1Dispatch = await runWorkflow([
      "dispatch",
      "implementation",
      fixture.relPath,
    ]);
    assert.equal(impl1Dispatch.exitCode, 0, impl1Dispatch.stderr);
    const impl1Record = await runWorkflow([
      "record",
      "implementation",
      fixture.relPath,
      "complete",
    ]);
    assert.equal(impl1Record.exitCode, 0, impl1Record.stderr);

    const verify1Dispatch = await runWorkflow([
      "dispatch",
      "evaluator-verify",
      fixture.relPath,
    ]);
    assert.equal(verify1Dispatch.exitCode, 0, verify1Dispatch.stderr);
    const verify1Record = await runWorkflow([
      "record",
      "evaluator-verify",
      fixture.relPath,
      "failed",
    ]);
    assert.equal(verify1Record.exitCode, 0, verify1Record.stderr);

    // as-built must remain locked: implementation/evaluator-verify did not
    // reach a complete verify outcome.
    const asBuiltTooEarly = await runWorkflow([
      "dispatch",
      "as-built",
      fixture.relPath,
    ]);
    assert.notEqual(
      asBuiltTooEarly.exitCode,
      0,
      "as-built must stay locked after a failed verify",
    );

    // The retry: implementation attempt 2 must now be dispatchable.
    const impl2Dispatch = await runWorkflow([
      "dispatch",
      "implementation",
      fixture.relPath,
    ]);
    assert.equal(
      impl2Dispatch.exitCode,
      0,
      `retry dispatch should be permitted: ${impl2Dispatch.stderr}`,
    );
    const impl2Record = await runWorkflow([
      "record",
      "implementation",
      fixture.relPath,
      "complete",
    ]);
    assert.equal(impl2Record.exitCode, 0, impl2Record.stderr);

    // evaluator-verify attempt 2 must now be dispatchable and completable.
    const verify2Dispatch = await runWorkflow([
      "dispatch",
      "evaluator-verify",
      fixture.relPath,
    ]);
    assert.equal(verify2Dispatch.exitCode, 0, verify2Dispatch.stderr);
    const verify2Record = await runWorkflow([
      "record",
      "evaluator-verify",
      fixture.relPath,
      "complete",
    ]);
    assert.equal(verify2Record.exitCode, 0, verify2Record.stderr);

    // Now as-built is unlocked.
    const asBuiltNow = await runWorkflow([
      "dispatch",
      "as-built",
      fixture.relPath,
    ]);
    assert.equal(
      asBuiltNow.exitCode,
      0,
      `as-built should now unlock: ${asBuiltNow.stderr}`,
    );

    // Attempt-1 history must remain intact (append-only, immutable).
    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    assert.equal(outcomeFor(records, "implementation", 1), "complete");
    assert.equal(outcomeFor(records, "evaluator-verify", 1), "failed");
    assert.equal(outcomeFor(records, "implementation", 2), "complete");
    assert.equal(outcomeFor(records, "evaluator-verify", 2), "complete");
    assert.ok(recordsFor(records, "implementation", 1).length > 0);
  } finally {
    await fixture.cleanup();
  }
});

await test("evaluator-prepare cannot be redispatched after a non-complete terminal outcome", async () => {
  const fixture = await createSpikeFixture("no-reopen-prepare-blocked");
  try {
    const init = await runWorkflow(["init", fixture.relPath]);
    assert.equal(init.exitCode, 0);
    await advanceTo(fixture.relPath, "evaluator-prepare");

    const prepDispatch = await runWorkflow([
      "dispatch",
      "evaluator-prepare",
      fixture.relPath,
    ]);
    assert.equal(prepDispatch.exitCode, 0);
    // Record a non-complete terminal outcome for evaluator-prepare.
    const prepRecord = await runWorkflow([
      "record",
      "evaluator-prepare",
      fixture.relPath,
      "blocked",
    ]);
    assert.equal(prepRecord.exitCode, 0, prepRecord.stderr);

    const redispatch = await runWorkflow([
      "dispatch",
      "evaluator-prepare",
      fixture.relPath,
    ]);
    assert.notEqual(
      redispatch.exitCode,
      0,
      "evaluator-prepare must never be redispatchable by this runner, even after a non-complete outcome",
    );
  } finally {
    await fixture.cleanup();
  }
});

await test("evaluator-prepare cannot be redispatched after a complete outcome, before, during, or after a later retry loop", async () => {
  const fixture = await createSpikeFixture("no-reopen-prepare-complete");
  try {
    const init = await runWorkflow(["init", fixture.relPath]);
    assert.equal(init.exitCode, 0);
    await advanceTo(fixture.relPath, "evaluator-prepare");

    const prepDispatch = await runWorkflow([
      "dispatch",
      "evaluator-prepare",
      fixture.relPath,
    ]);
    assert.equal(prepDispatch.exitCode, 0);
    const prepComplete = await runWorkflow([
      "record",
      "evaluator-prepare",
      fixture.relPath,
      "complete",
    ]);
    assert.equal(prepComplete.exitCode, 0, prepComplete.stderr);

    const redispatchAfterComplete = await runWorkflow([
      "dispatch",
      "evaluator-prepare",
      fixture.relPath,
    ]);
    assert.notEqual(redispatchAfterComplete.exitCode, 0);

    const implDispatch = await runWorkflow([
      "dispatch",
      "implementation",
      fixture.relPath,
    ]);
    assert.equal(implDispatch.exitCode, 0, implDispatch.stderr);
    const implRecord = await runWorkflow([
      "record",
      "implementation",
      fixture.relPath,
      "complete",
    ]);
    assert.equal(implRecord.exitCode, 0);
    const verifyDispatch = await runWorkflow([
      "dispatch",
      "evaluator-verify",
      fixture.relPath,
    ]);
    assert.equal(verifyDispatch.exitCode, 0);
    const verifyFail = await runWorkflow([
      "record",
      "evaluator-verify",
      fixture.relPath,
      "failed",
    ]);
    assert.equal(verifyFail.exitCode, 0);

    const redispatchDuringRetry = await runWorkflow([
      "dispatch",
      "evaluator-prepare",
      fixture.relPath,
    ]);
    assert.notEqual(
      redispatchDuringRetry.exitCode,
      0,
      "the implementation retry loop must not reopen evaluator-prepare",
    );
  } finally {
    await fixture.cleanup();
  }
});
