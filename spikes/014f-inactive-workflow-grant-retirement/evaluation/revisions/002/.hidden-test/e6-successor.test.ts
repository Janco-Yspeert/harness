import assert from "node:assert/strict";
import test from "node:test";
import {
  api, fixture, profiles, retire, retiredEvents, rootToken, startHarnessHost,
} from "./support.ts";

void test("E6: history is unchanged and a fresh successor grant operates normally after retirement", async (t) => {
  const f = fixture(t, "e6");
  const host = await startHarnessHost(0, { governed: { project: f.project, executors: profiles, rootToken } });
  t.after(() => host.close());
  f.trust();
  const old = (await api(host.url, "grants", {
    continuation: false, delegation: ["attached"], maxAllocations: 4, inline: true,
  })).json.grant;
  const first = (await api(host.url, "continue", { workflowGrant: old.id, mode: "attached", session: f.session().id })).json.execution;
  f.kernel.process(f.workflow, first.id, "running", 4242);
  f.kernel.result(f.workflow, first.id, "blocked", {});
  f.kernel.process(f.workflow, first.id, "exited");
  const snapshot = {
    bytes: f.bytes(),
    grant: structuredClone(f.kernel.grant(f.workflow, old.id)),
    executions: structuredClone(f.kernel.executions(f.workflow)),
    roleGrant: structuredClone(f.kernel.roleGrant(f.workflow, first.roleGrant)),
    view: (await api(host.url, `executions/${first.id}`)).text,
    grants: (await api(host.url, "grants")).text,
  };
  retire(f, old.id);
  const events = f.kernel.events(f.workflow);
  assert.ok(f.bytes().startsWith(snapshot.bytes));
  assert.deepEqual(f.kernel.grant(f.workflow, old.id), snapshot.grant);
  assert.deepEqual(f.kernel.executions(f.workflow), snapshot.executions);
  assert.deepEqual(f.kernel.roleGrant(f.workflow, first.roleGrant), snapshot.roleGrant);
  assert.equal((await api(host.url, `executions/${first.id}`)).text, snapshot.view);
  assert.equal((await api(host.url, "grants")).text, snapshot.grants);
  assert.equal(events.at(-1)?.transition, "kernel.workflow-grant-retired");
  // The successor is issued through the ordinary path and starts afresh.
  const created = await api(host.url, "grants", {
    continuation: false, delegation: ["attached"], maxAllocations: 2, inline: true,
  });
  assert.equal(created.status, 201);
  const next = created.json.grant;
  assert.notEqual(next.id, old.id);
  assert.equal(next.supersedes, undefined);
  assert.equal(next.maxAllocations, 2);
  assert.equal(f.kernel.inspect(f.workflow, next.id).kind, "grant");
  const run = await api(host.url, "continue", { workflowGrant: next.id, mode: "attached", session: f.session().id });
  assert.ok(run.status >= 200 && run.status < 300);
  assert.equal(run.json.execution.workflowGrant, next.id);
  const id = run.json.execution.id;
  f.kernel.process(f.workflow, id, "running", 4243);
  f.kernel.result(f.workflow, id, "succeeded", { verification: "PASS" });
  f.kernel.process(f.workflow, id, "exited");
  assert.equal(f.kernel.execution(f.workflow, id).result?.disposition, "succeeded");
  // Nothing transferred: the old grant is still retired with its budget untouched.
  assert.equal(f.kernel.inspect(f.workflow, old.id).kind, "denied");
  assert.equal(f.kernel.grant(f.workflow, old.id).maxAllocations, 4);
  assert.equal(f.kernel.executions(f.workflow).filter((e: any) => e.workflowGrant === old.id).length, 1);
  assert.equal(retiredEvents(f).length, 1);
  assert.deepEqual(f.kernel.execution(f.workflow, first.id), snapshot.executions[0]);
});
