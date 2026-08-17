import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import {
  startHarnessHost,
  type HarnessHost,
  type SessionBackend,
} from "../src/index.ts";

class EventBackend implements SessionBackend {
  #exitListener: (() => void) | undefined;
  readonly stopError: Error | undefined;

  constructor(stopError?: Error) {
    this.stopError = stopError;
  }

  write(): void {}
  onData(): void {}
  onError(): void {}

  onExit(listener: () => void): void {
    this.#exitListener = listener;
  }

  stop(): Promise<void> {
    return this.stopError === undefined
      ? Promise.resolve()
      : Promise.reject(this.stopError);
  }

  exit(): void {
    this.#exitListener?.();
  }
}

interface SessionEvent {
  meta: {
    id: string;
    kind: string;
    type: string;
    version: string;
    streamId: string;
    correlationId: string;
    timestamp: string;
    source: string;
  };
  data: Record<string, unknown>;
}

async function connectEvents(host: HarnessHost): Promise<WebSocket> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + "/events/ws",
  );
  await once(socket, "open");
  return socket;
}

async function connectSession(
  host: HarnessHost,
  sessionId: string,
): Promise<WebSocket> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + `/sessions/${sessionId}/ws`,
  );
  await once(socket, "open");
  return socket;
}

async function createSession(host: HarnessHost): Promise<string> {
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  assert.equal(response.status, 201);
  return ((await response.json()) as { id: string }).id;
}

async function nextEvent(socket: WebSocket): Promise<SessionEvent> {
  const [rawData] = (await once(socket, "message")) as [RawData];
  const text = Array.isArray(rawData)
    ? Buffer.concat(rawData).toString("utf8")
    : rawData instanceof ArrayBuffer
      ? Buffer.from(rawData).toString("utf8")
      : rawData.toString("utf8");
  return JSON.parse(text) as SessionEvent;
}

function assertLifecycleEvent(
  event: SessionEvent,
  type: "session.started" | "session.ended",
  sessionId: string,
): void {
  assert.deepEqual(Object.keys(event).sort(), ["data", "meta"]);
  assert.deepEqual(Object.keys(event.meta).sort(), [
    "correlationId",
    "id",
    "kind",
    "source",
    "streamId",
    "timestamp",
    "type",
    "version",
  ]);
  assert.deepEqual(event.data, {});
  assert.ok(event.meta.id.length > 0);
  assert.equal(event.meta.correlationId, event.meta.id);
  assert.equal(event.meta.kind, "event");
  assert.equal(event.meta.type, type);
  assert.equal(event.meta.version, "1.0.0");
  assert.equal(event.meta.streamId, sessionId);
  assert.equal(event.meta.source, "harness");
  assert.match(event.meta.timestamp, /^\d{4}-\d{2}-\d{2}T.*Z$/);
}

await test("broadcasts one closed lifecycle envelope to every live observer", async () => {
  const backend = new EventBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  const first = await connectEvents(host);
  const second = await connectEvents(host);

  try {
    const firstStarted = nextEvent(first);
    const secondStarted = nextEvent(second);
    const id = await createSession(host);
    const starts = await Promise.all([firstStarted, secondStarted]);
    assert.deepEqual(starts[0], starts[1]);
    assertLifecycleEvent(starts[0], "session.started", id);

    const firstEnded = nextEvent(first);
    const secondEnded = nextEvent(second);
    assert.equal(
      (await fetch(`${host.url}/sessions/${id}`, { method: "DELETE" })).status,
      204,
    );
    const ends = await Promise.all([firstEnded, secondEnded]);
    assert.deepEqual(ends[0], ends[1]);
    assertLifecycleEvent(ends[0], "session.ended", id);
    assert.notEqual(ends[0].meta.id, starts[0].meta.id);
  } finally {
    first.close();
    second.close();
    await host.close();
  }
});

await test("does not replay lifecycle events to late observers", async () => {
  const backend = new EventBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  const id = await createSession(host);
  const events = await connectEvents(host);

  try {
    const session = await connectSession(host, id);
    session.close();
    await once(session, "close");

    const ended = nextEvent(events);
    assert.equal(
      (await fetch(`${host.url}/sessions/${id}`, { method: "DELETE" })).status,
      204,
    );
    assertLifecycleEvent(await ended, "session.ended", id);
  } finally {
    events.close();
    await host.close();
  }
});

await test("emits no start for failed startup and ends after backend exit", async () => {
  const backend = new EventBackend();
  let attempt = 0;
  const host = await startHarnessHost(0, {
    createBackend: () => {
      if (attempt++ === 0) throw new Error("deliberate startup failure");
      return backend;
    },
  });
  const events = await connectEvents(host);

  try {
    assert.equal(
      (await fetch(`${host.url}/sessions`, { method: "POST" })).status,
      500,
    );
    const started = nextEvent(events);
    const id = await createSession(host);
    assertLifecycleEvent(await started, "session.started", id);
    const ended = nextEvent(events);
    backend.exit();
    assertLifecycleEvent(await ended, "session.ended", id);
  } finally {
    events.close();
    await host.close();
  }
});

await test("ends a removed session even when backend finalization fails", async () => {
  const backend = new EventBackend(new Error("deliberate stop failure"));
  const host = await startHarnessHost(0, { createBackend: () => backend });
  const events = await connectEvents(host);

  try {
    const started = nextEvent(events);
    const id = await createSession(host);
    await started;
    const ended = nextEvent(events);
    assert.equal(
      (await fetch(`${host.url}/sessions/${id}`, { method: "DELETE" })).status,
      500,
    );
    assertLifecycleEvent(await ended, "session.ended", id);
    assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 404);
  } finally {
    events.close();
    await host.close();
  }
});
