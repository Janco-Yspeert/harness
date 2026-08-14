import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import {
  startHarnessHost,
  type BackendInputResult,
  type HarnessHost,
  type SessionBackend,
} from "../src/index.ts";

class Deferred<T> {
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

class MemoryBackend implements SessionBackend {
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

async function createSession(host: HarnessHost): Promise<string> {
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  assert.equal(response.status, 201);
  const body = (await response.json()) as { id: string };
  return body.id;
}

async function connect(host: HarnessHost, id: string): Promise<WebSocket> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + `/sessions/${id}/ws`,
  );
  await once(socket, "open");
  return socket;
}

function messageData(rawData: RawData): string | undefined {
  let text: string;
  if (Array.isArray(rawData)) {
    text = Buffer.concat(rawData).toString("utf8");
  } else if (rawData instanceof ArrayBuffer) {
    text = Buffer.from(rawData).toString("utf8");
  } else {
    text = rawData.toString("utf8");
  }
  const message: unknown = JSON.parse(text);
  if (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === "output" &&
    "data" in message &&
    typeof message.data === "string"
  ) {
    return message.data;
  }
  return undefined;
}

async function waitUntil(
  predicate: () => boolean | Promise<boolean>,
): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail("condition was not reached");
}

await test("reserves creation during async startup and recovers from startup failure", async () => {
  const firstFactory = new Deferred<SessionBackend>();
  const backend = new MemoryBackend();
  let attempts = 0;
  const host = await startHarnessHost(0, {
    createBackend: () => {
      attempts += 1;
      if (attempts === 1) return firstFactory.promise;
      return backend;
    },
  });

  try {
    let firstSettled = false;
    const first = fetch(`${host.url}/sessions`, { method: "POST" }).then(
      (response) => {
        firstSettled = true;
        return response;
      },
    );
    await waitUntil(() => attempts === 1);
    assert.equal(firstSettled, false);
    assert.equal(
      (await fetch(`${host.url}/sessions`, { method: "POST" })).status,
      409,
    );
    assert.equal(attempts, 1);

    firstFactory.reject(new Error("deliberate startup failure"));
    assert.notEqual((await first).status, 201);
    const id = await createSession(host);
    assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 200);
  } finally {
    backend.stopped.resolve();
    await host.close();
  }
});

await test("drives a non-process backend through attach, I/O, detach, and reattach", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  const id = await createSession(host);
  let socket = await connect(host, id);

  try {
    socket.send(JSON.stringify({ type: "input", data: "hello" }));
    await waitUntil(() => backend.inputs.length === 1);
    assert.deepEqual(backend.inputs, ["hello"]);

    const output = once(socket, "message");
    backend.output("world");
    assert.equal(messageData((await output)[0] as RawData), "world");

    socket.close();
    await once(socket, "close");
    assert.equal(backend.stopCalls, 0);
    assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 200);
    socket = await connect(host, id);
    socket.send(JSON.stringify({ type: "input", data: "again" }));
    await waitUntil(() => backend.inputs.length === 2);
  } finally {
    backend.stopped.resolve();
    await host.close();
  }
});

await test("waits for explicit finalization before returning 204", async () => {
  const backend = new MemoryBackend();
  backend.exitDuringStop = true;
  const host = await startHarnessHost(0, { createBackend: () => backend });
  const id = await createSession(host);
  const socket = await connect(host, id);
  const closed = once(socket, "close");

  let deleteSettled = false;
  const deletion = fetch(`${host.url}/sessions/${id}`, {
    method: "DELETE",
  }).then((response) => {
    deleteSettled = true;
    return response;
  });
  await waitUntil(() => backend.stopCalls === 1);
  assert.equal(deleteSettled, false);
  backend.stopped.resolve();
  assert.equal((await deletion).status, 204);
  await closed;
  assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 404);
  assert.equal(backend.stopCalls, 1);
  await host.close();
});

await test("finalizes backend-initiated exit and permits a fully usable replacement", async () => {
  const first = new MemoryBackend();
  const second = new MemoryBackend();
  const backends = [first, second];
  const host = await startHarnessHost(0, {
    createBackend: () => {
      const backend = backends.shift();
      assert.ok(backend !== undefined);
      return backend;
    },
  });
  const firstId = await createSession(host);
  const firstSocket = await connect(host, firstId);
  const closed = once(firstSocket, "close");

  first.exit();
  await waitUntil(() => first.stopCalls === 1);
  first.stopped.resolve();
  await closed;
  await waitUntil(
    async () => (await fetch(`${host.url}/sessions/${firstId}`)).status === 404,
  );

  const secondId = await createSession(host);
  const secondSocket = await connect(host, secondId);
  const output = once(secondSocket, "message");
  secondSocket.send(JSON.stringify({ type: "input", data: "new input" }));
  await waitUntil(() => second.inputs.length === 1);
  second.output("new output");
  assert.equal(messageData((await output)[0] as RawData), "new output");

  second.stopped.resolve();
  await host.close();
});

await test("host shutdown and close-together termination finalize once", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  await createSession(host);

  const closing = host.close();
  await waitUntil(() => backend.stopCalls === 1);
  backend.exit();
  backend.stopped.resolve();
  await closing;
  assert.equal(backend.stopCalls, 1);
});

await test("coalesces backend exit and a close-together delete", async () => {
  const backend = new MemoryBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  const id = await createSession(host);

  backend.exit();
  const deletion = fetch(`${host.url}/sessions/${id}`, { method: "DELETE" });
  await waitUntil(() => backend.stopCalls === 1);
  backend.stopped.resolve();
  const response = await deletion;
  assert.ok(response.status === 204 || response.status === 404);
  assert.equal(backend.stopCalls, 1);
  assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 404);
  await host.close();
});
