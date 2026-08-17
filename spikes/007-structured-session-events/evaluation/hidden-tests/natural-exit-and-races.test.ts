// Cases E5, E6.
//
// E5 — natural backend/process termination that causes Harness to remove
//      the session emits exactly one session.ended, for both PTY and Codex
//      backends.
// E6 — a coalesced race between backend-initiated exit and a close-together
//      explicit deletion must still produce exactly one session.ended (no
//      duplicate), mirroring the public repo's own proven coalescing
//      behaviour for the underlying session lifecycle.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";
import { createCodexBackend } from "../../../../harness/src/codex-backend.ts";
import { assertEnvelope } from "./support/envelope.ts";
import {
  collectRaw,
  connectEvents,
  connectSession,
  createSession,
  deleteSession,
  disconnect,
  MemoryBackend,
  sessionStatus,
  settle,
  waitUntil,
} from "./support/helpers.ts";

const fixture = new URL(
  "../../../../harness/fixtures/fake-app-server.mjs",
  import.meta.url,
);

await test("PTY: natural shell exit emits exactly one session.ended", async () => {
  const host = await startHarnessHost(0);
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      const socket = await connectSession(host, id);
      const closed = once(socket, "close");
      socket.send(JSON.stringify({ type: "input", data: "exit\r" }));
      await closed;
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await settle();
      assert.equal(messages.length, 2);
      assert.equal(assertEnvelope(messages[1]).meta.type, "session.ended");
      assert.equal(assertEnvelope(messages[1]).meta.streamId, id);
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});

await test("Codex: natural App Server process exit emits exactly one session.ended", async () => {
  const directory = await mkdtemp(join(tmpdir(), "spike007-codex-natural-exit-"));
  const host = await startHarnessHost(0, {
    createBackend: () =>
      createCodexBackend({
        cwd: directory,
        spawnAppServer: () =>
          spawn(process.execPath, [fixture.pathname, "success"], {
            stdio: ["pipe", "pipe", "pipe"],
          }),
      }),
  });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      const socket = await connectSession(host, id);
      const closed = once(socket, "close");
      socket.send(JSON.stringify({ type: "input", data: "exit-backend\r" }));
      await closed;
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await settle();
      assert.equal(messages.length, 2);
      assert.equal(assertEnvelope(messages[1]).meta.type, "session.ended");
      assert.equal(assertEnvelope(messages[1]).meta.streamId, id);
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});

await test("coalesced backend exit and a close-together delete still produce exactly one session.ended", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      await waitUntil(() => messages.length === 1);

      backend.exit();
      const deletion = deleteSession(host, id);
      await waitUntil(() => backend.stopCalls === 1);
      backend.stopped.resolve();
      const status = await deletion;
      assert.ok(status === 204 || status === 404);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await settle();

      assert.equal(
        messages.length,
        2,
        "a race between backend exit and delete must not double-publish session.ended",
      );
      assert.equal(assertEnvelope(messages[1]).meta.type, "session.ended");
      assert.equal(backend.stopCalls, 1);
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});
