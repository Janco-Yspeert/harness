import assert from "node:assert/strict";
import test from "node:test";
import { fixture, refused, retire } from "./support.ts";

void test("E3: a retired grant is denied for inspection, allocation, retry, replacement and spawned work", (t) => {
  const f = fixture(t, "e3");
  const control = f.authorize();
  const grant = f.authorize();
  // Both grants carry an identical retry-eligible blocked execution, so only
  // retirement distinguishes them.
  const controlPrior = f.terminal(control);
  const prior = f.terminal(grant);
  const executionCount = f.kernel.executions(f.workflow).length;
  retire(f, grant.id);
  const kernels = [f.kernel, f.fresh()];
  for (const k of kernels) {
    const resolution = k.inspect(f.workflow, grant.id);
    assert.equal(resolution.kind, "denied");
    assert.match(resolution.reason, /retired/i);
    assert.doesNotMatch(resolution.reason, /pre-implementation|recovery/i);
    assert.equal(k.inspect(f.workflow, grant.id, "produce").kind, "denied");
    const sessions = [f.session(), f.session(), f.session(), f.session()];
    refused(f, () => k.allocate(f.workflow, grant.id, { mode: "attached", session: sessions[0].id, role: "produce" }), /retired/i);
    refused(f, () => k.allocate(f.workflow, grant.id, { mode: "attached", session: sessions[1].id, role: "produce", predecessor: prior.execution.id }), /retired/i);
    refused(f, () => k.allocate(f.workflow, grant.id, { mode: "spawned", session: sessions[2].id, role: "produce" }), /retired/i);
    refused(f, () => k.allocate(f.workflow, grant.id, { mode: "spawned", session: sessions[3].id, role: "produce", predecessor: prior.execution.id }), /retired/i);
  }
  // Allocation accounting is unchanged: nothing launched, nothing consumed.
  assert.equal(f.kernel.executions(f.workflow).length, executionCount);
  // Control: the identical retry request is honored for the unretired sibling.
  const retry = f.start(control, { predecessor: controlPrior.execution.id });
  assert.equal(retry.execution.predecessor, controlPrior.execution.id);
  assert.equal(retry.execution.workflowGrant, control.id);
  assert.equal(f.kernel.executions(f.workflow).length, executionCount + 1);
});

void test("E3: the unused budget of a retired grant stays unused and unusable", (t) => {
  const f = fixture(t, "e3b");
  const grant = f.authorize(f.workflow, { maxAllocations: 5, maxAutomaticWork: 5 });
  f.terminal(grant);
  const recorded = structuredClone(f.kernel.grant(f.workflow, grant.id));
  retire(f, grant.id);
  assert.deepEqual(f.kernel.grant(f.workflow, grant.id), recorded);
  assert.equal(recorded.maxAllocations, 5);
  const used = f.kernel.executions(f.workflow).filter((e: any) => e.workflowGrant === grant.id);
  assert.equal(used.length, 1);
  assert.equal(f.kernel.inspect(f.workflow, grant.id).kind, "denied");
});
