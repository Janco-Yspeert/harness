// Case E12 — the rendered prompt/command names the target spike and the
// owning phase's repository skill, for both a Codex-owned and a
// Claude-owned phase, and never embeds evaluator-private paths or test
// mechanics.

import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflow } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";

const FORBIDDEN_SUBSTRINGS = [
  "-hidden",
  ".hidden-test",
  ".eval/",
  "eval-spec.md",
  "freeze.json",
  "attempt-ledger",
];

await test("dry-run output names the spike and the owning skill; forbids evaluator-private mechanics", async () => {
  const fixture = await createSpikeFixture("prompt-ownership");
  try {
    await runWorkflow(["init", fixture.relPath]);

    const briefDispatch = await runWorkflow(["dispatch", "brief-readiness", fixture.relPath]);
    assert.equal(briefDispatch.exitCode, 0, briefDispatch.stderr);
    assert.ok(
      briefDispatch.stdout.includes(fixture.relPath),
      "the printed command must name the target spike",
    );
    assert.match(
      briefDispatch.stdout,
      /brief-readiness/,
      "the printed command must name the owning repository skill (brief-readiness)",
    );
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      assert.ok(
        !briefDispatch.stdout.includes(forbidden),
        `printed command must not contain evaluator-private mechanics: ${forbidden}`,
      );
    }

    await runWorkflow(["record", "brief-readiness", fixture.relPath, "complete"]);
    await runWorkflow(["dispatch", "design-map", fixture.relPath]);
    await runWorkflow(["record", "design-map", fixture.relPath, "complete"]);

    const prepDispatch = await runWorkflow(["dispatch", "evaluator-prepare", fixture.relPath]);
    assert.equal(prepDispatch.exitCode, 0, prepDispatch.stderr);
    assert.ok(
      prepDispatch.stdout.includes(fixture.relPath),
      "the printed command must name the target spike for the Claude-owned phase too",
    );
    assert.match(
      prepDispatch.stdout,
      /evaluator/,
      "the printed command must name the owning repository skill (evaluator)",
    );
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      assert.ok(
        !prepDispatch.stdout.includes(forbidden),
        `printed command must not contain evaluator-private mechanics: ${forbidden}`,
      );
    }
  } finally {
    await fixture.cleanup();
  }
});
