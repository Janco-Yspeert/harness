import assert from "node:assert/strict";
import test from "node:test";
import { fixture, refused, retire, retiredEvents } from "./support.ts";

void test("E2: a grant with an allocated or running execution cannot be retired", (t) => {
  const f = fixture(t, "e2a");
  const grant = f.authorize();
  const a = f.start(grant);
  refused(f, () => retire(f, grant.id), /./);
  f.kernel.process(f.workflow, a.execution.id, "running", 4242);
  refused(f, () => retire(f, grant.id), /./);
  f.kernel.result(f.workflow, a.execution.id, "blocked", {});
  refused(f, () => retire(f, grant.id), /./);
  f.kernel.process(f.workflow, a.execution.id, "exited");
  assert.equal(retiredEvents(f).length, 0);
  assert.equal(retire(f, grant.id).workflowGrant, grant.id);
});

void test("E2: an unresolved human request fails closed until it is answered", (t) => {
  const f = fixture(t, "e2b");
  const grant = f.authorize();
  const a = f.start(grant);
  f.kernel.process(f.workflow, a.execution.id, "running", 4242);
  const request = f.kernel.ask(f.workflow, a.execution.id, "input", "which way?", null);
  refused(f, () => retire(f, grant.id), /./);
  // Even once the execution is terminal, the unanswered decision is not discarded.
  f.kernel.process(f.workflow, a.execution.id, "exited");
  assert.equal(f.kernel.execution(f.workflow, a.execution.id).process, "exited");
  refused(f, () => retire(f, grant.id), /./);
  f.kernel.respond(f.workflow, a.execution.id, request.id, "left");
  assert.equal(retire(f, grant.id).workflowGrant, grant.id);
  assert.equal(retiredEvents(f).length, 1);
});

void test("E2: repeat retirement is a deterministic refusal that appends no second event", (t) => {
  const f = fixture(t, "e2c");
  const grant = f.authorize();
  f.terminal(grant);
  retire(f, grant.id);
  const after = f.bytes();
  for (const reason of ["again", "retire stranded", "third"])
    assert.throws(() => retire(f, grant.id, reason), /already retired/i);
  assert.equal(f.bytes(), after);
  assert.equal(retiredEvents(f).length, 1);
  // A restarted kernel refuses identically.
  assert.throws(
    () => f.fresh().retireWorkflowGrant(f.workflow, { workflowGrant: grant.id, reason: "x" }),
    /already retired/i,
  );
  assert.equal(f.bytes(), after);
});
