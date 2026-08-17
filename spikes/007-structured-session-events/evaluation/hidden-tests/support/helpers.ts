// Shared scaffolding for Spike 007 hidden tests. Deliberately mirrors the
// already-proven patterns in the public repository's own integration suite
// (test/session-backend.integration.test.ts, test/session-lifecycle.integration.test.ts)
// rather than inventing new test mechanics.

import assert from "node:assert/strict";
import { once } from "node:events";

import { WebSocket, type RawData } from "ws";

import type {
  BackendInputResult,
  HarnessHost,
  SessionBackend,
} from "../../../../../harness/src/index.ts";

export class Deferred<T> {
  readonly promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/** Minimal in-memory SessionBackend double, for deterministic control over
 * startup, exit, and finalization timing/outcome. */
export class MemoryBackend implements SessionBackend {
  readonly inputs: string[] = [];
  stopCalls = 0;
  exitDuringStop = false;
  readonly stopped = new Deferred<void>();
  #dataListener: ((output: string) => void) | undefined;
  #exitListener: (() => void) | undefined;

  write(input: string): BackendInputResult {
    this.inputs.push(input);
    return { accepted: true };
  }

  onData(listener: (output: string) => void): void {
    this.#dataListener = listener;
  }

  onError(): void {}

  onExit(listener: () => void): void {
    this.#exitListener = listener;
  }

  stop(): Promise<void> {
    this.stopCalls += 1;
    if (this.exitDuringStop) this.exit();
    return this.stopped.promise;
  }

  output(data: string): void {
    this.#dataListener?.(data);
  }

  exit(): void {
    this.#exitListener?.();
  }
}

export async function createSession(host: HarnessHost): Promise<string> {
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  assert.equal(response.status, 201);
  const body = (await response.json()) as { id: string };
  return body.id;
}

export async function attemptCreateSession(
  host: HarnessHost,
): Promise<{ status: number; id: string | undefined }> {
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  if (response.status !== 201) return { status: response.status, id: undefined };
  const body = (await response.json()) as { id: string };
  return { status: response.status, id: body.id };
}

export async function deleteSession(
  host: HarnessHost,
  id: string,
): Promise<number> {
  const response = await fetch(`${host.url}/sessions/${id}`, {
    method: "DELETE",
  });
  return response.status;
}

export async function sessionStatus(
  host: HarnessHost,
  id: string,
): Promise<number> {
  return (await fetch(`${host.url}/sessions/${id}`)).status;
}

async function awaitOpen(socket: WebSocket, timeoutMs = 5_000): Promise<WebSocket> {
  await Promise.race([
    once(socket, "open"),
    once(socket, "unexpected-response").then(([, response]) => {
      throw new Error(
        `WebSocket upgrade rejected with status ${String(
          (response as { statusCode?: number }).statusCode,
        )}`,
      );
    }),
    once(socket, "error").then(([error]) => {
      throw error as Error;
    }),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`WebSocket did not open within ${String(timeoutMs)}ms`));
      }, timeoutMs);
    }),
  ]);
  return socket;
}

export async function connectSession(
  host: HarnessHost,
  id: string,
): Promise<WebSocket> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + `/sessions/${id}/ws`,
  );
  return awaitOpen(socket);
}

export async function connectEvents(host: HarnessHost): Promise<WebSocket> {
  const socket = new WebSocket(host.url.replace("http://", "ws://") + "/events/ws");
  return awaitOpen(socket);
}

export function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return data.toString("utf8");
}

export interface SessionMessage {
  type: string;
  data?: string;
  code?: string;
}

export function parseSessionMessage(raw: RawData): SessionMessage {
  return JSON.parse(rawDataToString(raw)) as SessionMessage;
}

/** Buffers every text frame received on `socket` from the moment this is
 * called, as raw strings, in arrival order. */
export function collectRaw(socket: WebSocket): {
  readonly messages: string[];
} {
  const messages: string[] = [];
  socket.on("message", (data: RawData) => {
    messages.push(rawDataToString(data));
  });
  return { messages };
}

export async function waitUntil(
  predicate: () => boolean | Promise<boolean>,
  attempts = 200,
  intervalMs = 5,
): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  assert.fail("condition was not reached");
}

/** A bounded wait used only to assert an event does NOT arrive; kept short
 * because the live channel is otherwise proven responsive within a few
 * event-loop turns throughout this suite. */
export async function settle(ms = 150): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function disconnect(socket: WebSocket): Promise<void> {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close();
    await once(socket, "close");
  }
}
