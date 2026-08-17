// Case E11.
//
// - Structured events and session text/output must never mix: the event
//   socket must never carry an {type:"output"|"error"} session message, and
//   the session socket must never carry a structured envelope.
// - Connecting or disconnecting the event socket must not itself change
//   session lifecycle: the session must remain creatable, attachable, and
//   usable regardless of event-socket presence, and detaching/reattaching
//   the session socket must not itself produce any additional event type
//   beyond session.started/session.ended (no session.attached/detached).

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";
import { looksLikeEnvelope } from "./support/envelope.ts";
import {
  collectRaw,
  connectEvents,
  connectSession,
  createSession,
  deleteSession,
  disconnect,
  sessionStatus,
  waitUntil,
} from "./support/helpers.ts";

await test("session text/output and structured events never appear on each other's channel", async () => {
  const host = await startHarnessHost(0);
  try {
    const events = await connectEvents(host);
    try {
      const eventMessages = collectRaw(events).messages;
      const id = await createSession(host);
      const session = await connectSession(host, id);
      const sessionMessages = collectRaw(session).messages;
      try {
        const output = once(session, "message");
        session.send(
          JSON.stringify({ type: "input", data: "printf '%s\\n' __ISO_MARK__\r" }),
        );
        await output;
        await waitUntil(() =>
          sessionMessages.some((raw) => rawIncludesMarker(raw)),
        );

        assert.ok(sessionMessages.length > 0);
        for (const raw of sessionMessages) {
          assert.equal(
            looksLikeEnvelope(raw),
            false,
            "a structured envelope must never appear on the session socket",
          );
        }
      } finally {
        await disconnect(session);
      }

      assert.equal(await deleteSession(host, id), 204);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await waitUntil(() => eventMessages.length === 2);

      for (const raw of eventMessages) {
        assert.equal(
          looksLikeEnvelope(raw),
          true,
          "only structured envelopes may appear on the event socket",
        );
        const parsed = JSON.parse(raw) as { type?: string };
        assert.equal(
          "type" in parsed && (parsed.type === "output" || parsed.type === "error"),
          false,
          "session output/error frames must never appear on the event socket",
        );
      }
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});

function rawIncludesMarker(raw: string): boolean {
  const message = JSON.parse(raw) as { type?: string; data?: string };
  return message.type === "output" && (message.data ?? "").includes("__ISO_MARK__");
}

await test("event-socket connect/disconnect has no session side effects", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host);
    const early = await connectEvents(host);
    await disconnect(early);

    assert.equal(await sessionStatus(host, id), 200);
    const session = await connectSession(host, id);
    const output = once(session, "message");
    session.send(JSON.stringify({ type: "input", data: "printf '%s\\n' __STILL_ALIVE__\r" }));
    await output;
    await disconnect(session);

    assert.equal(await deleteSession(host, id), 204);
    assert.equal(await sessionStatus(host, id), 404);
  } finally {
    await host.close();
  }
});

await test("session detach and reattach produce no event beyond session.started/session.ended", async () => {
  const host = await startHarnessHost(0);
  try {
    const events = await connectEvents(host);
    try {
      const messages = collectRaw(events).messages;
      const id = await createSession(host);
      await waitUntil(() => messages.length === 1);

      const first = await connectSession(host, id);
      await disconnect(first);
      const second = await connectSession(host, id);
      await disconnect(second);

      assert.equal(await deleteSession(host, id), 204);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await waitUntil(() => messages.length === 2);

      const types = messages.map((raw) => (JSON.parse(raw) as { meta: { type: string } }).meta.type);
      assert.deepEqual(types, ["session.started", "session.ended"]);
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});
