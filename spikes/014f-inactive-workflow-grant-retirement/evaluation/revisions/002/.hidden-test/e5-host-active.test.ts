import assert from "node:assert/strict";
import test from "node:test";
import { api, fixture, profiles, retiredEvents, rootToken, startHarnessHost } from "./support.ts";

void test("E5: the host refuses retirement while work is active or a human decision is unresolved", async (t) => {
  const f = fixture(t, "e5");
  const host = await startHarnessHost(0, { governed: { project: f.project, executors: profiles, rootToken } });
  t.after(() => host.close());
  f.trust();
  const { json: { grant } } = await api(host.url, "grants", {
    continuation: false, delegation: ["attached"], maxAllocations: 3, inline: true,
  });
  const started = await api(host.url, "continue", { workflowGrant: grant.id, mode: "attached", session: f.session().id });
  const id = started.json.execution.id;
  const body = { workflowGrant: grant.id, reason: "too early" };
  const attempt = async () => {
    const before = f.bytes();
    const response = await api(host.url, "grant-retirements", body);
    assert.equal(response.status, 409);
    assert.equal(typeof response.json.error, "string");
    assert.equal(f.bytes(), before);
  };
  await attempt(); // allocated
  f.kernel.process(f.workflow, id, "running", 4242);
  await attempt(); // running
  const request = f.kernel.ask(f.workflow, id, "input", "proceed?", null);
  await attempt(); // running and waiting
  f.kernel.process(f.workflow, id, "exited");
  await attempt(); // terminal, request unresolved
  f.kernel.respond(f.workflow, id, request.id, "yes");
  assert.equal(retiredEvents(f).length, 0);
  const done = await api(host.url, "grant-retirements", body);
  assert.equal(done.status, 201);
  assert.equal(retiredEvents(f).length, 1);
});
