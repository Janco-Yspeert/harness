// Case E8.
//
// Strict conformance of real, live-emitted envelopes to the frozen Design
// Map shape: exact closed key sets at root and meta, correct constant
// values, correlationId === id, a UTC RFC 3339 timestamp, non-empty unique
// ids across the two lifecycle events for a session, and an empty data
// payload. assertEnvelope (validated in support/envelope.selfcheck.test.ts)
// is the oracle; this case exercises it against the real channel.

import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";
import { assertEnvelope } from "./support/envelope.ts";
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

await test("live session.started and session.ended envelopes conform to the frozen closed shape", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      await waitUntil(() => messages.length === 1);
      backend.stopped.resolve();
      assert.equal(await deleteSession(host, id), 204);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await waitUntil(() => messages.length === 2);

      const [started, ended] = messages.map((raw) => assertEnvelope(raw));

      assert.equal(started.meta.type, "session.started");
      assert.equal(ended.meta.type, "session.ended");

      for (const envelope of [started, ended]) {
        assert.equal(envelope.meta.kind, "event");
        assert.equal(envelope.meta.version, "1.0.0");
        assert.equal(envelope.meta.source, "harness");
        assert.equal(envelope.meta.streamId, id);
        assert.equal(envelope.meta.correlationId, envelope.meta.id);
        assert.deepEqual(envelope.data, {});
        assert.deepEqual(Object.keys(envelope).sort(), ["data", "meta"]);
        assert.deepEqual(
          Object.keys(envelope.meta).sort(),
          [
            "correlationId",
            "id",
            "kind",
            "source",
            "streamId",
            "timestamp",
            "type",
            "version",
          ],
        );
      }

      assert.notEqual(
        started.meta.id,
        ended.meta.id,
        "each lifecycle fact must carry its own event identity",
      );
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});
