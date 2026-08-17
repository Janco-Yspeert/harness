// Cases E9, E10.
//
// E9  — every event client connected before a lifecycle transition receives
//       the identical emitted envelope for that transition (same content,
//       not independently generated equivalents).
// E10 — a client that connects only after a lifecycle event was already
//       emitted does not receive that historical event, but does receive
//       subsequent live events normally. This is the live-only/no-replay
//       requirement, and was empirically validated against the `ws` library
//       broadcast primitive directly during prepare before this suite froze.

import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";
import {
  collectRaw,
  connectEvents,
  createSession,
  deleteSession,
  disconnect,
  MemoryBackend,
  sessionStatus,
  waitUntil,
} from "./support/helpers.ts";

await test("two clients connected before a transition receive identical envelopes for both lifecycle events", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  try {
    const a = await connectEvents(host);
    const b = await connectEvents(host);
    try {
      const aMessages = collectRaw(a).messages;
      const bMessages = collectRaw(b).messages;

      const id = await createSession(host);
      await waitUntil(() => aMessages.length === 1 && bMessages.length === 1);
      assert.equal(aMessages[0], bMessages[0]);

      backend.stopped.resolve();
      assert.equal(await deleteSession(host, id), 204);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await waitUntil(() => aMessages.length === 2 && bMessages.length === 2);
      assert.equal(aMessages[1], bMessages[1]);
    } finally {
      await disconnect(a);
      await disconnect(b);
    }
  } finally {
    await host.close();
  }
});

await test("a client connecting after session.started does not receive it, but does receive the subsequent session.ended", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  try {
    const early = await connectEvents(host);
    try {
      const earlyMessages = collectRaw(early).messages;
      const id = await createSession(host);
      await waitUntil(() => earlyMessages.length === 1);

      const late = await connectEvents(host);
      try {
        const lateMessages = collectRaw(late).messages;

        backend.stopped.resolve();
        assert.equal(await deleteSession(host, id), 204);
        await waitUntil(async () => (await sessionStatus(host, id)) === 404);
        await waitUntil(() => lateMessages.length === 1);

        assert.equal(
          lateMessages.length,
          1,
          "a late-joining client must only see events emitted after it connected",
        );
        assert.equal(JSON.parse(lateMessages[0]).meta.type, "session.ended");
        assert.equal(earlyMessages.length, 2);
        assert.equal(JSON.parse(earlyMessages[0]).meta.type, "session.started");
        assert.equal(JSON.parse(earlyMessages[1]).meta.type, "session.ended");
      } finally {
        await disconnect(late);
      }
    } finally {
      await disconnect(early);
    }
  } finally {
    await host.close();
  }
});
