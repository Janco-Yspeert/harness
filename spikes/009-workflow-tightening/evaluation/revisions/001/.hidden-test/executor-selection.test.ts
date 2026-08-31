import assert from "node:assert/strict";
import test from "node:test";
import { beforeImplementation, cleanup, fixtureBin, init, run, spike, state } from "./support/fixture.ts";

void test("public and evaluator roles select independently", (t) => {
  const fixture = fixtureBin(); t.after(() => { fixture.cleanup(); cleanup(); }); init();
  const publicEnv = { ...fixture.environment, HARNESS_WORKFLOW_PUBLIC_EXECUTOR: "claude" };
  assert.equal(run(["dispatch", "brief-readiness", spike, "--execute"], publicEnv).status, 0);
  assert.equal(run(["record", "brief-readiness", spike, "complete"], publicEnv).status, 0);
  assert.equal(run(["dispatch", "design-map", spike], publicEnv).status, 0); assert.equal(run(["record", "design-map", spike, "complete"], publicEnv).status, 0);
  const evaluatorEnv = { ...fixture.environment, HARNESS_WORKFLOW_EVALUATOR_EXECUTOR: "codex" };
  assert.equal(run(["dispatch", "evaluator-prepare", spike, "--execute"], evaluatorEnv).status, 0);
  const jobs = state().records.filter((r) => r.event === "job");
  assert.equal((jobs[0]?.job as { command: string[] }).command[0], "claude");
  assert.equal((jobs[1]?.job as { command: string[] }).command[0], "codex");
});
