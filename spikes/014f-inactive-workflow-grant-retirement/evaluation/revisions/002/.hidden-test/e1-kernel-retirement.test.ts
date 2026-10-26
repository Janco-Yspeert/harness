import assert from "node:assert/strict";
import test from "node:test";
import { authorityBasis, fixture, refused, retire, retiredEvents } from "./support.ts";

void test("E1: an inactive terminal grant is retired by one durable event bound to the exact grant", (t) => {
  const f = fixture(t, "e1");
  const grant = f.authorize();
  const prior = f.terminal(grant);
  const before = f.bytes();
  const grantBefore = structuredClone(f.kernel.grant(f.workflow, grant.id));
  const executionsBefore = structuredClone(f.kernel.executions(f.workflow));
  const basisBefore = authorityBasis(f.kernel.events(f.workflow));
  const returned = retire(f, grant.id, "stranded after canary");
  const expected = {
    workflowGrant: grant.id,
    origin: "human",
    reason: "stranded after canary",
  };
  assert.deepEqual(returned, expected);
  // Exactly one appended line; every earlier byte is untouched.
  assert.ok(f.bytes().startsWith(before), "history is append-only");
  const added = f.lines().length - before.split("\n").filter(Boolean).length;
  assert.equal(added, 1, "exactly one event is appended");
  const events = retiredEvents(f);
  assert.equal(events.length, 1);
  assert.deepEqual(events[0].evidence, expected);
  assert.equal(
    f.kernel.events(f.workflow).at(-1)?.transition,
    "kernel.workflow-grant-retired",
  );
  // It is not a revocation and carries no recovery field.
  assert.equal(
    f.kernel.events(f.workflow).some((e: any) => e.transition === "kernel.workflow-grant-revoked"),
    false,
  );
  assert.equal("recovery" in events[0].evidence, false);
  // No allocation, execution, session or successor grant is created or consumed.
  assert.deepEqual(f.kernel.executions(f.workflow), executionsBefore);
  assert.deepEqual(f.kernel.grant(f.workflow, grant.id), grantBefore);
  const tail = f.kernel.events(f.workflow).slice(-1).map((e: any) => e.transition);
  assert.deepEqual(tail, ["kernel.workflow-grant-retired"]);
  assert.equal(
    f.kernel.executions(f.workflow).filter((e: any) => e.workflowGrant === grant.id).length,
    1,
  );
  assert.equal(f.kernel.execution(f.workflow, prior.execution.id).result?.disposition, "blocked");
  // Retirement is ledger mechanics: it must not move the authority basis.
  assert.equal(authorityBasis(f.kernel.events(f.workflow)), basisBefore);
});

void test("E1: binding and input refusals append nothing", (t) => {
  const f = fixture(t, "e1b");
  const grant = f.authorize();
  f.terminal(grant);
  const foreign = f.authorize(f.other);
  refused(f, () => retire(f, "00000000-0000-4000-8000-000000000000"), /unknown workflow grant/);
  refused(f, () => retire(f, foreign.id), /unknown workflow grant/);
  const otherBefore = f.bytes(f.other);
  refused(f, () => retire(f, grant.id, ""), /./);
  refused(f, () => retire(f, ""), /./);
  assert.equal(retiredEvents(f).length, 0);
  assert.equal(retiredEvents(f, f.other).length, 0);
  // The exact grant remains retirable afterwards: refusals were not terminal.
  assert.equal(retire(f, grant.id).workflowGrant, grant.id);
  assert.equal(f.bytes(f.other), otherBefore);
  assert.equal(f.kernel.inspect(f.other, foreign.id).kind, "grant");
});
