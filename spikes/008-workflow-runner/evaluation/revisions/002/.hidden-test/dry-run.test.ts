// Case E6 — default `dispatch` (no `--execute`) is a true dry run: it
// prints the selected executor command and writes only a dispatch record,
// but starts no process — proven with poisoned `codex`/`claude`/`git`
// fixtures on PATH that would leave unmistakable evidence if invoked.

import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflow, jobFor, parseStatusJson } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";
import { createFixtureBin, pathWithFixtureBin } from "./support/fixture-bin.ts";

await test("dry-run dispatch prints the command and never spawns codex, claude, or git", async () => {
  const fixture = await createSpikeFixture("dry-run");
  const poison = await createFixtureBin([
    { name: "codex", marker: "POISON-CODEX" },
    { name: "claude", marker: "POISON-CLAUDE" },
    { name: "git", marker: "POISON-GIT" },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);

    const env = { ...process.env, PATH: pathWithFixtureBin(poison) };
    const dispatch = await runWorkflow(["dispatch", "brief-readiness", fixture.relPath], { env });
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);

    // The command must be visible somewhere in stdout without starting it.
    const printed = dispatch.stdout;
    assert.match(printed, /codex/, "dry-run must print the selected executor command");

    const invocations = await poison.invocations();
    assert.deepEqual(invocations, [], "no poisoned binary may ever be invoked during a dry run");

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    assert.equal(
      jobFor(records, "brief-readiness", 1),
      undefined,
      "a dry-run dispatch must not record job metadata",
    );
  } finally {
    await fixture.cleanup();
    await poison.cleanup();
  }
});

await test("dry-run dispatch for a Claude-owned phase prints claude and never invokes it", async () => {
  const fixture = await createSpikeFixture("dry-run-claude");
  const poison = await createFixtureBin([
    { name: "codex", marker: "POISON-CODEX" },
    { name: "claude", marker: "POISON-CLAUDE" },
  ]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    // advance to evaluator-prepare using the real (non-executing) path.
    for (const phase of ["brief-readiness", "design-map"]) {
      await runWorkflow(["dispatch", phase, fixture.relPath]);
      await runWorkflow(["record", phase, fixture.relPath, "complete"]);
    }

    const env = { ...process.env, PATH: pathWithFixtureBin(poison) };
    const dispatch = await runWorkflow(["dispatch", "evaluator-prepare", fixture.relPath], { env });
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);
    assert.match(dispatch.stdout, /claude/, "dry-run must print the claude command for a Claude-owned phase");

    const invocations = await poison.invocations();
    assert.deepEqual(invocations, []);
  } finally {
    await fixture.cleanup();
    await poison.cleanup();
  }
});
