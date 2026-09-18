// Hidden test for Spike 013a AC35 ("Blocked execution is retryable") and
// AC22 ("Historical executions preserved").
//
// Revision 002 correction (see .eval/revisions/002/repair-record.md): revision
// 001 of this test simulated "attempt 1" using an inspection-only
// (`dispatch <phase> <spike>`, no `--execute`) call. Once the implementation
// correctly separated planning from execution (AC20: inspection now writes a
// `plan` event, never a `dispatch` event - see
// dispatch-inspection-non-consuming.test.ts), that construction stopped
// representing a genuine host-owned execution attempt at all, per the
// already-frozen Design Map "Shared contracts": "Preview/planning is
// read-only. A real allocation begins operational execution history only
// once the host has committed a run." AC35 is explicitly about "a governed
// methodology phase or attempt [requiring] more than one host-owned
// EXECUTION run" - not planning. This revision constructs a genuine
// execution-attempt record directly (the same `dispatch`+`job` shape a real
// `--execute` dispatch produces, per tools/workflow.ts `dispatch()`) so the
// test exercises what AC35 actually names, without depending on a live
// Harness host.
//
// Baseline behavior (still true against the implementation at project commit
// 33fa7c4): `attemptForDispatch()` only increments the attempt counter for
// the `implementation` and `evaluator-verify` phases; every other phase
// (including brief-readiness) always computes attempt 1. Once attempt 1 has
// a genuine `dispatch` record and any `outcome` record - even `blocked` -
// `canDispatch()` unconditionally refuses a further dispatch for that phase
// with "already been dispatched", even under `--execute`, and even though
// canonical authority still requires the phase. This is exactly why Spike
// 013a itself needed the "pre-freeze retry bootstrap" exception recorded in
// its own manifest.md Run 002.
//
// This test asserts:
//   AC35 - after a still-pending phase's prior genuine execution ends
//          non-successful (blocked), a fresh execution attempt for that same
//          phase can be allocated (via `--execute`, distinguished from a
//          "no Harness host reachable" allocation failure by its error
//          message);
//   AC22 - the first (blocked) execution's dispatch/outcome records are
//          preserved unchanged, not deleted or rewritten, once the second
//          attempt is allocated.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const spike = `spikes/997d-eval013a-blocked-retry-${String(process.pid)}`;
const spikePath = join(repositoryRoot, spike);
const UNREACHABLE_HOST = "http://127.0.0.1:19";

function run(args: string[], extraEnv: NodeJS.ProcessEnv = {}) {
  const environment = { ...process.env, ...extraEnv };
  delete environment.NODE_TEST_CONTEXT;
  return spawnSync("node", ["tools/workflow.ts", ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

interface StateRecord {
  readonly event: string;
  readonly phase: string;
  readonly attempt: number;
  readonly outcome?: string;
}

void test("a blocked genuine execution of a still-pending phase can be retried and its record is preserved (AC22, AC35)", (t) => {
  rmSync(spikePath, { recursive: true, force: true });
  mkdirSync(join(spikePath, ".workflow"), { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });

  // Construct the same `dispatch`+`job` execution-attempt shape a real
  // `--execute` dispatch produces (tools/workflow.ts `dispatch()`), so this
  // fixture represents a genuine host-owned execution attempt without
  // depending on a live Harness host being reachable in this environment.
  const initialState = {
    version: 2,
    records: [
      {
        event: "init",
        phase: "brief-readiness",
        attempt: 1,
        at: "2026-01-01T00:00:00.000Z",
      },
      {
        event: "dispatch",
        phase: "brief-readiness",
        attempt: 1,
        at: "2026-01-01T00:00:01.000Z",
      },
      {
        event: "job",
        phase: "brief-readiness",
        attempt: 1,
        at: "2026-01-01T00:00:01.000Z",
        job: {
          runId: "00000000-0000-0000-0000-000000000000",
          hostUrl: UNREACHABLE_HOST,
          executor: "codex",
          permissionProfile: "repo-local-worker",
          slot: { workflow: spike.split("/")[1], phase: "brief-readiness", methodologyAttempt: "1" },
          launchedAt: "2026-01-01T00:00:01.000Z",
        },
      },
    ],
  };
  writeFileSync(
    join(spikePath, ".workflow/state.json"),
    `${JSON.stringify(initialState, null, 2)}\n`,
    { mode: 0o600 },
  );
  assert.equal(run(["record", "brief-readiness", spike, "blocked"]).status, 0);

  const stateAfterBlock: { records: StateRecord[] } = JSON.parse(
    readFileSync(join(spikePath, ".workflow/state.json"), "utf8"),
  );
  const firstOutcome = stateAfterBlock.records.find(
    (record) =>
      record.phase === "brief-readiness" &&
      record.event === "outcome" &&
      record.outcome === "blocked",
  );
  assert.ok(firstOutcome, "fixture setup sanity check: attempt 1 recorded blocked");
  const firstDispatch = stateAfterBlock.records.find(
    (record) => record.phase === "brief-readiness" && record.event === "dispatch",
  );
  assert.ok(
    firstDispatch,
    "fixture setup sanity check: attempt 1 is a genuine execution record, not a plan",
  );

  // A fresh --execute attempt for the same still-pending phase. Distinguish
  // "the retry was refused because attempt 1 was already dispatched" (the
  // AC35 defect) from "the retry was refused only because the host is
  // unreachable" (a separate, already-covered concern - see
  // recoverable-preexecution-failure.test.ts) by checking the error text.
  const retry = run(["dispatch", "brief-readiness", spike, "--execute"], {
    HARNESS_HOST_URL: UNREACHABLE_HOST,
  });
  assert.doesNotMatch(
    retry.stderr,
    /already been dispatched/,
    "canonical authority still requires brief-readiness after a blocked genuine execution; a fresh execution attempt must be allocatable rather than permanently refused",
  );

  const stateAfterRetry: { records: StateRecord[] } = JSON.parse(
    readFileSync(join(spikePath, ".workflow/state.json"), "utf8"),
  );
  const preservedFirstOutcome = stateAfterRetry.records.find(
    (record) =>
      record.phase === "brief-readiness" &&
      record.event === "outcome" &&
      record.outcome === "blocked",
  );
  assert.deepEqual(
    preservedFirstOutcome,
    firstOutcome,
    "the first (blocked) execution's outcome record must remain exactly as recorded, not rewritten",
  );
  const preservedFirstDispatch = stateAfterRetry.records.find(
    (record) =>
      record.phase === "brief-readiness" &&
      record.event === "dispatch" &&
      record.at === firstDispatch?.at,
  );
  assert.deepEqual(
    preservedFirstDispatch,
    firstDispatch,
    "the first execution's dispatch record must remain exactly as recorded, not rewritten",
  );
});
