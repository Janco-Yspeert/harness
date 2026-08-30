import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { cleanup, fixtureBin, init, run, spike, spikePath, state } from "./support/fixture.ts";

void test("an unavailable executor does not consume the phase attempt", (t) => {
  const fixture = fixtureBin(); t.after(() => { fixture.cleanup(); cleanup(); }); init();
  const missing = { ...fixture.environment, PATH: fixture.bin };
  assert.notEqual(run(["dispatch", "brief-readiness", spike, "--execute"], missing).status, 0);
  assert.equal(run(["dispatch", "brief-readiness", spike, "--execute"], fixture.environment).status, 0);
  const dispatches = state().records.filter((r) => r.phase === "brief-readiness" && r.event === "dispatch");
  assert.equal(dispatches.length, 1); assert.equal(dispatches[0]?.attempt, 1);
});

void test("local state and logs have owner-restricted modes and runner is tooling", (t) => {
  const fixture = fixtureBin(); t.after(() => { fixture.cleanup(); cleanup(); }); init();
  const workflow = join(spikePath, ".workflow"); const statePath = join(workflow, "state.json");
  assert.equal(statSync(workflow).mode & 0o777, 0o700); assert.equal(statSync(statePath).mode & 0o777, 0o600);
  assert.equal(run(["dispatch", "brief-readiness", spike, "--execute"], fixture.environment).status, 0);
  const job = state().records.find((r) => r.event === "job")?.job as { logPath: string };
  assert.ok(existsSync(job.logPath)); assert.equal(statSync(job.logPath).mode & 0o777, 0o600);
  assert.match(run(["status", spike]).stdout, /"records"/);
  assert.equal(existsSync(join(process.cwd(), "src", "workflow.ts")), false);
  assert.equal(existsSync(join(process.cwd(), "tools", "workflow.ts")), true);
});
