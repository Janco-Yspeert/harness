import assert from "node:assert/strict";

import { runWorkflow } from "./cli.ts";
import { PHASE_ORDER, type Phase } from "./phases.ts";

/** Dispatches and records `complete` for every phase strictly before
 * `upTo` (exclusive), in canonical order, on an already-`init`ed spike. */
export async function advanceTo(
  spikeRelPath: string,
  upTo: Phase,
): Promise<void> {
  const stopIndex = PHASE_ORDER.indexOf(upTo);
  assert.ok(stopIndex >= 0, `unknown phase ${upTo}`);
  for (const phase of PHASE_ORDER.slice(0, stopIndex)) {
    const dispatch = await runWorkflow(["dispatch", phase, spikeRelPath]);
    assert.equal(dispatch.exitCode, 0, `setup dispatch ${phase} failed: ${dispatch.stderr}`);
    const record = await runWorkflow(["record", phase, spikeRelPath, "complete"]);
    assert.equal(record.exitCode, 0, `setup record ${phase} failed: ${record.stderr}`);
  }
}
