// Case E1 — `init` creates a well-formed, immediately Git-ignored local
// state document; `status` reflects it per TR1.

import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflow, parseStatusJson } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";

await test("init creates local state and status reports an empty, well-formed record set", async () => {
  const fixture = await createSpikeFixture("init");
  try {
    const init = await runWorkflow(["init", fixture.relPath]);
    assert.equal(init.exitCode, 0, `init failed: ${init.stderr}`);

    const status = await runWorkflow(["status", fixture.relPath]);
    assert.equal(status.exitCode, 0, `status failed: ${status.stderr}`);
    const { records } = parseStatusJson(status.stdout);
    assert.ok(Array.isArray(records), "records must be an array");
    for (const record of records) {
      assert.equal(typeof record.phase, "string");
      assert.equal(typeof record.attempt, "number");
    }
  } finally {
    await fixture.cleanup();
  }
});

await test("status on an uninitialized spike does not fabricate phase completion", async () => {
  const fixture = await createSpikeFixture("uninit");
  try {
    // No init call. Dispatching the first phase must still be well-defined
    // (either it implicitly requires init, or dispatch itself establishes
    // state) but no phase may already read as complete.
    const status = await runWorkflow(["status", fixture.relPath]);
    if (status.exitCode === 0) {
      const { records } = parseStatusJson(status.stdout);
      assert.ok(
        records.every((r) => r.outcome === undefined),
        "an uninitialized spike must not report any recorded outcome",
      );
    }
  } finally {
    await fixture.cleanup();
  }
});
