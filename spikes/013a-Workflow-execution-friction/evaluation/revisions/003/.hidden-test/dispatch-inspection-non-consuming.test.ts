// Hidden test for Spike 013a AC20 ("Non-consuming inspection").
//
// Baseline (pre-implementation, evaluator revision 001): a dispatch call with
// no `--execute` flag is documented as inspection/planning, but the current
// `dispatch()` in tools/workflow.ts unconditionally appends a `dispatch`
// record to `.workflow/state.json` before printing the command, exactly like
// a real dispatch. A second inspection of the same phase/attempt then fails
// with "already been dispatched", and the phase can never be genuinely
// dispatched afterward without manual state repair. This is the exact defect
// spike.md Observed Failure #5 describes.
//
// This test asserts the frozen invariant: inspecting/planning a prospective
// dispatch must never consume an execution attempt. Repeated inspection must
// stay repeatable, and a subsequent real (`--execute`) dispatch for the same
// still-pending phase/attempt must remain legal.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const spike = `spikes/997a-eval013a-dispatch-inspect-${String(process.pid)}`;
const spikePath = join(repositoryRoot, spike);

function run(args: string[]) {
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  return spawnSync("node", ["tools/workflow.ts", ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

void test("dispatch inspection does not consume an execution attempt (AC20)", (t) => {
  rmSync(spikePath, { recursive: true, force: true });
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });

  assert.equal(run(["init", spike]).status, 0);

  const first = run(["dispatch", "brief-readiness", spike]);
  assert.equal(first.status, 0, first.stderr);

  const second = run(["dispatch", "brief-readiness", spike]);
  assert.equal(
    second.status,
    0,
    `a second inspection of the same still-pending phase must remain legal; got: ${second.stderr}`,
  );
  assert.equal(
    second.stdout.trim(),
    first.stdout.trim(),
    "repeated inspection of the same pending phase must be idempotent",
  );

  const stateAfterInspection: { records: { event: string }[] } = JSON.parse(
    readFileSync(join(spikePath, ".workflow/state.json"), "utf8"),
  );
  assert.equal(
    stateAfterInspection.records.some((record) => record.event === "dispatch"),
    false,
    "inspection alone must not create operational dispatch history",
  );

  const executed = run(["dispatch", "brief-readiness", spike, "--execute"]);
  // A host may legitimately be unreachable in this evaluation environment;
  // that is a separate allocation failure (AC21), not evidence about
  // inspection consumption. Only a prior "already been dispatched" refusal
  // would indicate inspection wrongly consumed the attempt.
  assert.doesNotMatch(
    executed.stderr,
    /already been dispatched/,
    "a genuine dispatch for the still-pending phase must not be refused because inspection ran first",
  );
});
