// Shared oracle for the Spike 007 Conduit-derived lifecycle envelope shape.
// Validated by envelope.selfcheck.test.ts against hand-built conforming and
// deliberately non-conforming samples before this evaluator revision froze.

export interface LifecycleEnvelope {
  meta: {
    id: string;
    kind: "event";
    type: "session.started" | "session.ended";
    version: "1.0.0";
    streamId: string;
    correlationId: string;
    timestamp: string;
    source: "harness";
  };
  data: Record<string, never>;
}

const RFC3339_UTC =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const ROOT_KEYS = new Set(["meta", "data"]);
const META_KEYS = new Set([
  "id",
  "kind",
  "type",
  "version",
  "streamId",
  "correlationId",
  "timestamp",
  "source",
]);

/**
 * Parses a single raw WebSocket text frame and asserts it conforms to the
 * frozen Design Map envelope shape. Throws with a descriptive message on any
 * violation; returns the parsed envelope on success.
 */
export function assertEnvelope(raw: string): LifecycleEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`not valid JSON: ${String(error)}`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("envelope root is not an object");
  }
  const root = parsed as Record<string, unknown>;

  const rootKeys = Object.keys(root);
  for (const key of rootKeys) {
    if (!ROOT_KEYS.has(key)) {
      throw new Error(`unexpected root property "${key}"`);
    }
  }
  if (!("meta" in root) || !("data" in root)) {
    throw new Error("envelope root missing meta or data");
  }

  const meta = root.meta;
  if (typeof meta !== "object" || meta === null) {
    throw new Error("meta is not an object");
  }
  const metaRecord = meta as Record<string, unknown>;
  const metaKeys = Object.keys(metaRecord);
  for (const key of metaKeys) {
    if (!META_KEYS.has(key)) {
      throw new Error(`unexpected meta property "${key}"`);
    }
  }
  for (const key of META_KEYS) {
    if (!(key in metaRecord)) {
      throw new Error(`meta missing required property "${key}"`);
    }
  }

  if (typeof metaRecord.id !== "string" || metaRecord.id.length === 0) {
    throw new Error("meta.id must be a non-empty string");
  }
  if (metaRecord.kind !== "event") {
    throw new Error(`meta.kind must be "event", got ${String(metaRecord.kind)}`);
  }
  if (
    metaRecord.type !== "session.started" &&
    metaRecord.type !== "session.ended"
  ) {
    throw new Error(`meta.type has unexpected value ${String(metaRecord.type)}`);
  }
  if (metaRecord.version !== "1.0.0") {
    throw new Error(
      `meta.version must be "1.0.0", got ${String(metaRecord.version)}`,
    );
  }
  if (
    typeof metaRecord.streamId !== "string" ||
    metaRecord.streamId.length === 0
  ) {
    throw new Error("meta.streamId must be a non-empty string");
  }
  if (metaRecord.correlationId !== metaRecord.id) {
    throw new Error("meta.correlationId must equal meta.id");
  }
  if (
    typeof metaRecord.timestamp !== "string" ||
    !RFC3339_UTC.test(metaRecord.timestamp)
  ) {
    throw new Error(
      `meta.timestamp must be a UTC RFC 3339 date-time, got ${String(metaRecord.timestamp)}`,
    );
  }
  if (metaRecord.source !== "harness") {
    throw new Error(`meta.source must be "harness", got ${String(metaRecord.source)}`);
  }

  const data = root.data;
  if (typeof data !== "object" || data === null) {
    throw new Error("data must be an object");
  }
  if (Object.keys(data).length !== 0) {
    throw new Error("data must be empty for Spike 007 lifecycle events");
  }

  return parsed as LifecycleEnvelope;
}

/** Returns true when a raw text frame parses as *any* structured envelope
 * (used to distinguish it from session output/error JSON, which uses a
 * different, non-`meta`/`data` shape). */
export function looksLikeEnvelope(raw: string): boolean {
  try {
    const parsed: unknown = JSON.parse(raw);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "meta" in parsed &&
      "data" in parsed
    );
  } catch {
    return false;
  }
}
