// Evaluator helper integrity self-test. This establishes that the shared
// envelope oracle is falsifiable in both directions: it accepts a conforming
// sample and rejects each deliberately broken variant for the expected
// reason. This is evaluator infrastructure, not Spike 007 product coverage,
// and must not be counted toward the mandatory case set.

import assert from "node:assert/strict";
import test from "node:test";

import { assertEnvelope, looksLikeEnvelope } from "./envelope.ts";

function valid(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    meta: {
      id: "evt-1",
      kind: "event",
      type: "session.started",
      version: "1.0.0",
      streamId: "session-1",
      correlationId: "evt-1",
      timestamp: "2026-08-17T12:00:00.000Z",
      source: "harness",
      ...overrides,
    },
    data: {},
  });
}

await test("accepts a fully conforming envelope", () => {
  assert.doesNotThrow(() => assertEnvelope(valid()));
});

await test("accepts a timestamp without fractional seconds", () => {
  assert.doesNotThrow(() =>
    assertEnvelope(valid({ timestamp: "2026-08-17T12:00:00Z" })),
  );
});

await test("rejects an unexpected root property", () => {
  const raw = JSON.stringify({
    meta: JSON.parse(valid()).meta,
    data: {},
    causationId: "evt-0",
  });
  assert.throws(() => assertEnvelope(raw), /unexpected root property/);
});

await test("rejects an unexpected meta property (extensions leak)", () => {
  assert.throws(
    () => assertEnvelope(valid({ extensions: {} })),
    /unexpected meta property/,
  );
});

await test("rejects a missing meta property", () => {
  const parsed = JSON.parse(valid()) as { meta: Record<string, unknown> };
  delete parsed.meta.streamId;
  assert.throws(
    () => assertEnvelope(JSON.stringify(parsed)),
    /missing required property "streamId"/,
  );
});

await test("rejects a wrong meta.kind", () => {
  assert.throws(
    () => assertEnvelope(valid({ kind: "notification" })),
    /meta\.kind must be "event"/,
  );
});

await test("rejects an unknown meta.type", () => {
  assert.throws(
    () => assertEnvelope(valid({ type: "session.attached" })),
    /meta\.type has unexpected value/,
  );
});

await test("rejects a mismatched correlationId", () => {
  assert.throws(
    () => assertEnvelope(valid({ correlationId: "evt-999" })),
    /correlationId must equal meta\.id/,
  );
});

await test("rejects a non-RFC3339 timestamp", () => {
  assert.throws(
    () => assertEnvelope(valid({ timestamp: "08/17/2026 12:00:00" })),
    /must be a UTC RFC 3339 date-time/,
  );
});

await test("rejects a non-UTC timestamp (missing Z)", () => {
  assert.throws(
    () => assertEnvelope(valid({ timestamp: "2026-08-17T12:00:00+02:00" })),
    /must be a UTC RFC 3339 date-time/,
  );
});

await test("rejects a non-empty data payload", () => {
  const raw = JSON.stringify({
    meta: JSON.parse(valid()).meta,
    data: { extra: true },
  });
  assert.throws(() => assertEnvelope(raw), /data must be empty/);
});

await test("rejects malformed JSON", () => {
  assert.throws(() => assertEnvelope("{not json"), /not valid JSON/);
});

await test("looksLikeEnvelope distinguishes envelopes from session output/error frames", () => {
  assert.equal(looksLikeEnvelope(valid()), true);
  assert.equal(
    looksLikeEnvelope(JSON.stringify({ type: "output", data: "hello" })),
    false,
  );
  assert.equal(
    looksLikeEnvelope(
      JSON.stringify({ type: "error", code: "turn_active", data: "busy" }),
    ),
    false,
  );
});
