import assert from "node:assert/strict";
import test from "node:test";
import {
  api, auth, fixture, profiles, retiredEvents, rootToken, startHarnessHost,
} from "./support.ts";

async function boot(t: any, name: string) {
  const f = fixture(t, name);
  const governed = { project: f.project, executors: profiles, rootToken };
  const host = await startHarnessHost(0, { governed });
  t.after(() => host.close());
  f.trust();
  const created = await api(host.url, "grants", {
    continuation: true,
    delegation: ["attached", "spawned"],
    maxAllocations: 8,
    inline: true,
  });
  assert.equal(created.status, 201);
  return { f, host, governed, grant: created.json.grant };
}
const found = (text: string, id: string) => text.includes(id);

void test("E4: the host operation is root-only, records one bound event and lists it", async (t) => {
  const { f, host, grant } = await boot(t, "e4a");
  const first = await api(host.url, "continue", {
    workflowGrant: grant.id, mode: "attached", session: f.session().id,
  });
  assert.ok(first.status >= 200 && first.status < 300);
  const id = first.json.execution.id;
  f.kernel.process(f.workflow, id, "running", 4242);
  f.kernel.result(f.workflow, id, "blocked", {});
  f.kernel.process(f.workflow, id, "exited");
  const body = { workflowGrant: grant.id, reason: "retire stranded" };
  // Anonymous, executor-session and malformed requests are refused without effect.
  const anonymous = await api(host.url, "grant-retirements", body, { "content-type": "application/json" });
  assert.ok(anonymous.status >= 400 && anonymous.status < 500, `anonymous ${String(anonymous.status)}`);
  const sess = await api(host.url, "sessions", { profile: "fixture" });
  const worker = {
    ...auth,
    authorization: `Bearer ${sess.json.token}`,
    "x-harness-session": sess.json.session.id,
  };
  const viaSession = await api(host.url, "grant-retirements", body, worker);
  assert.ok(viaSession.status >= 400 && viaSession.status < 500, `session ${String(viaSession.status)}`);
  const viaListing = await api(host.url, "grant-retirements", undefined, worker);
  assert.ok(viaListing.status >= 400, "executor sessions cannot list");
  const before = f.bytes();
  for (const bad of [{}, { workflowGrant: grant.id }, { workflowGrant: grant.id, reason: "" }, { workflowGrant: 7, reason: "x" }, { workflowGrant: "unknown-grant", reason: "x" }]) {
    const refused = await api(host.url, "grant-retirements", bad);
    assert.ok(refused.status >= 400 && refused.status < 500, JSON.stringify(bad));
    assert.equal(typeof refused.json?.error, "string");
  }
  assert.equal(f.bytes(), before, "all refusals leave the ledger untouched");
  const ok = await api(host.url, "grant-retirements", body);
  assert.equal(ok.status, 201);
  const evidence = ok.json.evidence ?? ok.json;
  assert.deepEqual(
    { workflowGrant: evidence.workflowGrant, origin: evidence.origin, reason: evidence.reason },
    { workflowGrant: grant.id, origin: "human", reason: "retire stranded" },
  );
  assert.equal(retiredEvents(f).length, 1);
  assert.ok(f.bytes().startsWith(before));
  const listed = await api(host.url, "grant-retirements");
  assert.equal(listed.status, 200);
  assert.ok(found(listed.text, grant.id));
  // Repeat: deterministic refusal in the existing 409 envelope, no second event.
  const afterOne = f.bytes();
  const again = await api(host.url, "grant-retirements", body);
  assert.equal(again.status, 409);
  assert.match(again.json.error, /already retired/i);
  assert.equal(f.bytes(), afterOne);
  assert.equal(retiredEvents(f).length, 1);
});

void test("E4: manual, spawned, retry and automatic-continuation requests are refused before any work exists, across restart", async (t) => {
  const { f, host, governed, grant } = await boot(t, "e4b");
  const first = await api(host.url, "continue", {
    workflowGrant: grant.id, mode: "attached", session: f.session().id,
  });
  const id = first.json.execution.id;
  f.kernel.process(f.workflow, id, "running", 4242);
  f.kernel.result(f.workflow, id, "blocked", {});
  f.kernel.process(f.workflow, id, "exited");
  assert.equal((await api(host.url, "grant-retirements", { workflowGrant: grant.id, reason: "retire" })).status, 201);
  const shapes = (session: string): object[] => [
    { workflowGrant: grant.id, mode: "attached", session },
    { workflowGrant: grant.id, mode: "attached", session, role: "produce" },
    { workflowGrant: grant.id, mode: "attached", session, role: "produce", predecessor: id },
    // The exact request the host itself issues for automatic continuation.
    { workflowGrant: grant.id, mode: "spawned", role: "produce" },
    { workflowGrant: grant.id, mode: "spawned", role: "produce", predecessor: id },
  ];
  const probe = async (url: string) => {
    for (const request of shapes(f.session().id)) {
      const before = f.bytes();
      const count = f.kernel.executions(f.workflow).length;
      const response = await api(url, "continue", request);
      assert.equal(response.status, 409, JSON.stringify(request));
      assert.match(String(response.json?.error ?? response.text), /retired/i);
      assert.equal(f.bytes(), before, "no allocation, session or process is recorded");
      assert.equal(f.kernel.executions(f.workflow).length, count);
    }
  };
  await probe(host.url);
  assert.equal(f.kernel.executions(f.workflow).length, 1);
  // A restarted host and a fresh kernel replay the same permanent refusal.
  await host.close();
  const restarted = await startHarnessHost(0, { governed });
  t.after(() => restarted.close());
  await probe(restarted.url);
  assert.equal(f.fresh().inspect(f.workflow, grant.id).kind, "denied");
  assert.match(f.fresh().inspect(f.workflow, grant.id).reason, /retired/i);
  const listed = await api(restarted.url, "grant-retirements");
  assert.ok(found(listed.text, grant.id));
  assert.equal(retiredEvents(f).length, 1);
});
