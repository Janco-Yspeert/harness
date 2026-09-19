// Hidden test for Spike 013a AC21 ("Recoverable pre-execution failure").
//
// spike.md Observed Failure #6: when the Harness host was unreachable during
// a real (`--execute`) dispatch, retrying required manual `.workflow` state
// repair. This test freezes the required invariant as a regression: a
// host-unreachable allocation failure before any worker/run was genuinely
// established must leave local operational state untouched, and the same
// still-pending phase must remain dispatchable on retry without manual
// intervention.
//
// This is exercised as a positive control against the pre-implementation
// baseline (the current `dispatch()` execute-path only mutates
// `.workflow/state.json` after `allocateHostRun` resolves, so a fetch failure
// already leaves state untouched). It is frozen so implementation cannot
// regress it while adding execution-binding/role-result machinery to the same
// code path.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const spike = `spikes/997c-eval013a-recoverable-failure-${String(process.pid)}`;
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

void test("a host-unreachable dispatch failure is retryable without manual .workflow mutation (AC21)", (t) => {
  rmSync(spikePath, { recursive: true, force: true });
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });

  assert.equal(run(["init", spike]).status, 0);

  const stateFile = join(spikePath, ".workflow/state.json");
  const before = readFileSync(stateFile, "utf8");

  const firstAttempt = run(["dispatch", "brief-readiness", spike, "--execute"], {
    HARNESS_HOST_URL: UNREACHABLE_HOST,
  });
  assert.notEqual(
    firstAttempt.status,
    0,
    "the allocation is expected to fail against an unreachable host",
  );

  const afterFirstAttempt = readFileSync(stateFile, "utf8");
  assert.equal(
    afterFirstAttempt,
    before,
    "a pre-execution allocation failure must not mutate local operational state",
  );

  const secondAttempt = run(["dispatch", "brief-readiness", spike, "--execute"], {
    HARNESS_HOST_URL: UNREACHABLE_HOST,
  });
  assert.notEqual(
    secondAttempt.status,
    0,
    "the retry is expected to fail identically against the still-unreachable host",
  );
  assert.doesNotMatch(
    secondAttempt.stderr,
    /already been dispatched/,
    "retry after a pre-execution failure must not require manual .workflow repair",
  );
});
