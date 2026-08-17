// Cases E1, E2, E3.
//
// E1 — a successful PTY-backed session start emits exactly one
//      session.started, conforming to the frozen envelope shape, delivered
//      to a client connected before session creation.
// E2 — explicit deletion of that session emits exactly one session.ended,
//      strictly after session.started, for the same client.
// E3 — an equivalent Codex-backed session lifecycle produces the same
//      sequence of public event types/shape (ignoring id/timestamp/streamId
//      values), with its own distinct streamId equal to its own Harness
//      session id.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  startHarnessHost,
  type SessionBackendFactory,
} from "../../../../harness/src/index.ts";
import { createCodexBackend } from "../../../../harness/src/codex-backend.ts";
import { assertEnvelope } from "./support/envelope.ts";
import {
  collectRaw,
  connectEvents,
  createSession,
  deleteSession,
  disconnect,
  sessionStatus,
  waitUntil,
} from "./support/helpers.ts";

const fixture = new URL(
  "../../../../harness/fixtures/fake-app-server.mjs",
  import.meta.url,
);

async function runLifecycle(
  createBackend: SessionBackendFactory | undefined,
): Promise<{ id: string; envelopes: ReturnType<typeof assertEnvelope>[] }> {
  const host = await startHarnessHost(0, { createBackend });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      await waitUntil(() => messages.length >= 1);
      assert.equal(await deleteSession(host, id), 204);
      await waitUntil(() => messages.length >= 2);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await settleFanout();

      assert.equal(messages.length, 2, "expected exactly start+end, no more");
      const envelopes = messages.map((raw) => assertEnvelope(raw));
      return { id, envelopes };
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
}

async function settleFanout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

await test("PTY: successful start emits exactly one conforming session.started before deletion", async () => {
  const { id, envelopes } = await runLifecycle(undefined);
  const [started] = envelopes;
  assert.equal(started.meta.type, "session.started");
  assert.equal(started.meta.streamId, id);
});

await test("PTY: explicit deletion emits exactly one session.ended strictly after session.started", async () => {
  const { id, envelopes } = await runLifecycle(undefined);
  const [started, ended] = envelopes;
  assert.equal(started.meta.type, "session.started");
  assert.equal(ended.meta.type, "session.ended");
  assert.equal(ended.meta.streamId, id);
  assert.notEqual(started.meta.id, ended.meta.id);
});

await test("Codex: equivalent lifecycle produces the same public event sequence with its own streamId", async () => {
  const directory = await mkdtemp(join(tmpdir(), "spike007-codex-core-"));
  const { id: codexId, envelopes: codexEnvelopes } = await runLifecycle(() =>
    createCodexBackend({
      cwd: directory,
      spawnAppServer: () =>
        spawn(process.execPath, [fixture.pathname, "success"], {
          stdio: ["pipe", "pipe", "pipe"],
        }),
    }),
  );
  const { id: ptyId, envelopes: ptyEnvelopes } = await runLifecycle(undefined);

  assert.deepEqual(
    codexEnvelopes.map((e) => e.meta.type),
    ptyEnvelopes.map((e) => e.meta.type),
    "PTY and Codex sessions must produce an equivalent public lifecycle event sequence",
  );
  assert.equal(codexEnvelopes[0].meta.streamId, codexId);
  assert.equal(codexEnvelopes[1].meta.streamId, codexId);
  assert.notEqual(codexId, ptyId);

  for (const envelope of [...codexEnvelopes, ...ptyEnvelopes]) {
    assert.equal(envelope.meta.kind, "event");
    assert.equal(envelope.meta.version, "1.0.0");
    assert.equal(envelope.meta.source, "harness");
    assert.deepEqual(envelope.data, {});
  }
});
