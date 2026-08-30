import assert from "node:assert/strict";
import test from "node:test";
import { beforeImplementation, cleanup, complete, init, run, spike, state } from "./support/fixture.ts";

void test("implementation failure creates a new implementation and verification attempt", (t) => {
  t.after(cleanup); init(); beforeImplementation(); complete("implementation");
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  assert.equal(run(["record", "evaluator-verify", spike, "failed"]).status, 0);
  complete("implementation"); assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  const verifies = state().records.filter((r) => r.phase === "evaluator-verify" && r.event === "dispatch");
  assert.deepEqual(verifies.map((r) => [r.attempt, r.implementationAttempt]), [[1, 1], [2, 2]]);
});

void test("blocked verification retries against unchanged implementation", (t) => {
  t.after(cleanup); init(); beforeImplementation(); complete("implementation");
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  assert.equal(run(["record", "evaluator-verify", spike, "blocked"]).status, 0);
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  const verifies = state().records.filter((r) => r.phase === "evaluator-verify" && r.event === "dispatch");
  assert.deepEqual(verifies.map((r) => [r.attempt, r.implementationAttempt]), [[1, 1], [2, 1]]);
});
