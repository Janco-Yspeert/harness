import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import {
  createCodexBackend,
  type AppServerProcess,
  type CodexBackendOptions,
} from "../src/codex-backend.ts";
import { startHarnessHost, type HarnessHost } from "../src/index.ts";

type ClientMessage =
  | { type: "output"; data: string }
  | { type: "error"; code: string; data: string };

const fixture = new URL("../fixtures/fake-app-server.mjs", import.meta.url);

async function setup(mode = "success", interruptGraceMs = 100) {
  const directory = await mkdtemp(join(tmpdir(), "harness-codex-test-"));
  const logPath = join(directory, "protocol.jsonl");
  const options: CodexBackendOptions = {
    cwd: directory,
    interruptGraceMs,
    spawnAppServer: () =>
      spawn(process.execPath, [fixture.pathname, mode, logPath], {
        stdio: ["pipe", "pipe", "pipe"],
      }),
  };
  const host = await startHarnessHost(0, {
    createBackend: () => createCodexBackend(options),
  });
  return { directory, host, logPath, options };
}

async function createSession(host: HarnessHost): Promise<string> {
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  assert.equal(response.status, 201);
  return ((await response.json()) as { id: string }).id;
}

async function connect(host: HarnessHost, id: string): Promise<WebSocket> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + `/sessions/${id}/ws`,
  );
  await once(socket, "open");
  return socket;
}

function parseMessage(rawData: RawData): ClientMessage {
  const text = Array.isArray(rawData)
    ? Buffer.concat(rawData).toString("utf8")
    : rawData instanceof ArrayBuffer
      ? Buffer.from(rawData).toString("utf8")
      : rawData.toString("utf8");
  return JSON.parse(text) as ClientMessage;
}

async function nextMessage(socket: WebSocket): Promise<ClientMessage> {
  return parseMessage((await once(socket, "message"))[0] as RawData);
}

async function protocolLog(
  logPath: string,
): Promise<Record<string, unknown>[]> {
  try {
    return (await readFile(logPath, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  } catch {
    return [];
  }
}

async function waitUntil(predicate: () => boolean | Promise<boolean>) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail("condition was not reached");
}

await test("runs sequential Codex turns over JSONL without duplicated text", async () => {
  const { directory, host, logPath } = await setup();
  const id = await createSession(host);
  const socket = await connect(host, id);
  try {
    const first = nextMessage(socket);
    socket.send(JSON.stringify({ type: "input", data: "first\r" }));
    assert.deepEqual(await first, { type: "output", data: "reply-1" });

    const second = nextMessage(socket);
    socket.send(JSON.stringify({ type: "input", data: "second\r" }));
    assert.deepEqual(await second, { type: "output", data: "reply-2" });
    await new Promise((resolve) => setTimeout(resolve, 25));

    const log = await protocolLog(logPath);
    assert.deepEqual(
      log.slice(0, 3).map(({ method }) => method),
      ["initialize", "initialized", "thread/start"],
    );
    const threadStart = log.find(({ method }) => method === "thread/start");
    assert.deepEqual(threadStart?.params, {
      cwd: directory,
      approvalPolicy: "never",
      sandbox: "read-only",
      serviceName: "harness",
    });
    const turns = log.filter(({ method }) => method === "turn/start");
    assert.deepEqual(
      turns.map((turn) => turn.params),
      [
        {
          threadId: "provider-thread",
          input: [{ type: "text", text: "first" }],
        },
        {
          threadId: "provider-thread",
          input: [{ type: "text", text: "second" }],
        },
      ],
    );
  } finally {
    await host.close();
  }
});

await test("rejects input while turn startup is unresolved", async () => {
  const { host } = await setup();
  const id = await createSession(host);
  const socket = await connect(host, id);
  try {
    socket.send(JSON.stringify({ type: "input", data: "hold\r" }));
    const rejected = nextMessage(socket);
    socket.send(JSON.stringify({ type: "input", data: "overlap\r" }));
    assert.deepEqual(await rejected, {
      type: "error",
      code: "turn_active",
      data: "Codex is already working on a turn.",
    });
  } finally {
    await host.close();
  }
});

await test("recovers from a rejected turn start on the same session and thread", async () => {
  const { host, logPath } = await setup("fail-turn-once");
  const id = await createSession(host);
  const socket = await connect(host, id);
  try {
    const failed = nextMessage(socket);
    socket.send(JSON.stringify({ type: "input", data: "fail\r" }));
    assert.deepEqual(await failed, {
      type: "error",
      code: "turn_start_failed",
      data: "Codex could not start the turn.",
    });

    const output = nextMessage(socket);
    socket.send(JSON.stringify({ type: "input", data: "retry\r" }));
    assert.deepEqual(await output, { type: "output", data: "reply-1" });
    const turns = (await protocolLog(logPath)).filter(
      ({ method }) => method === "turn/start",
    );
    assert.equal(turns.length, 2);
  } finally {
    await host.close();
  }
});

await test("projects completed agent text when no deltas were emitted", async () => {
  const { host } = await setup();
  const id = await createSession(host);
  const socket = await connect(host, id);
  try {
    const output = nextMessage(socket);
    socket.send(JSON.stringify({ type: "input", data: "no-delta\r" }));
    assert.deepEqual(await output, { type: "output", data: "reply-1" });
  } finally {
    await host.close();
  }
});

await test("continues a turn while detached and permits reattachment", async () => {
  const { host, logPath } = await setup();
  const id = await createSession(host);
  const firstSocket = await connect(host, id);
  firstSocket.send(JSON.stringify({ type: "input", data: "detached\r" }));
  firstSocket.close();
  await once(firstSocket, "close");
  await waitUntil(async () =>
    (await protocolLog(logPath)).some(({ method }) => method === "turn/start"),
  );
  await new Promise((resolve) => setTimeout(resolve, 25));

  const secondSocket = await connect(host, id);
  const output = nextMessage(secondSocket);
  secondSocket.send(JSON.stringify({ type: "input", data: "after detach\r" }));
  assert.deepEqual(await output, { type: "output", data: "reply-2" });
  await host.close();
});

await test("failed thread creation releases the singleton slot", async () => {
  const directory = await mkdtemp(join(tmpdir(), "harness-codex-startup-"));
  let attempt = 0;
  const host = await startHarnessHost(0, {
    createBackend: () => {
      const mode = attempt++ === 0 ? "fail-thread" : "success";
      return createCodexBackend({
        cwd: directory,
        spawnAppServer: () =>
          spawn(process.execPath, [fixture.pathname, mode], {
            stdio: ["pipe", "pipe", "pipe"],
          }),
      });
    },
  });
  try {
    assert.notEqual(
      (await fetch(`${host.url}/sessions`, { method: "POST" })).status,
      201,
    );
    const id = await createSession(host);
    assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 200);
  } finally {
    await host.close();
  }
});

await test("interrupts an active turn before finalizing", async () => {
  const { host, logPath } = await setup();
  const id = await createSession(host);
  const socket = await connect(host, id);
  socket.send(JSON.stringify({ type: "input", data: "hold\r" }));
  await waitUntil(async () =>
    (await protocolLog(logPath)).some(({ method }) => method === "turn/start"),
  );
  const closed = once(socket, "close");
  assert.equal(
    (await fetch(`${host.url}/sessions/${id}`, { method: "DELETE" })).status,
    204,
  );
  await closed;
  assert.ok(
    (await protocolLog(logPath)).some(
      ({ method }) => method === "turn/interrupt",
    ),
  );
  await host.close();
});

await test("deleting an idle session stops infrastructure without deleting the thread", async () => {
  const { host, logPath } = await setup();
  const id = await createSession(host);
  assert.equal(
    (await fetch(`${host.url}/sessions/${id}`, { method: "DELETE" })).status,
    204,
  );
  const methods = (await protocolLog(logPath)).map(({ method }) => method);
  assert.ok(!methods.includes("thread/delete"));
  await host.close();
});

await test("uses bounded fallback when interruption never completes", async () => {
  const { host, logPath } = await setup("hang-interrupt", 20);
  const id = await createSession(host);
  const socket = await connect(host, id);
  socket.send(JSON.stringify({ type: "input", data: "hold\r" }));
  await waitUntil(async () =>
    (await protocolLog(logPath)).some(({ method }) => method === "turn/start"),
  );
  assert.equal(
    (await fetch(`${host.url}/sessions/${id}`, { method: "DELETE" })).status,
    204,
  );
  assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 404);
  await host.close();
});

await test("returns 500 when forced App Server teardown cannot finalize", async () => {
  const directory = await mkdtemp(join(tmpdir(), "harness-codex-stuck-"));
  const child = spawn(process.execPath, [fixture.pathname, "success"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  const signals: (NodeJS.Signals | number | undefined)[] = [];
  const processThatNeverExits: AppServerProcess = {
    stdin: child.stdin,
    stdout: child.stdout,
    stderr: child.stderr,
    pid: child.pid,
    on: (event, listener) => child.on(event, listener),
    kill: (signal) => {
      signals.push(signal);
      return true;
    },
  };
  const host = await startHarnessHost(0, {
    createBackend: () =>
      createCodexBackend({
        cwd: directory,
        spawnAppServer: () => processThatNeverExits,
      }),
  });

  try {
    const id = await createSession(host);
    const startedAt = Date.now();
    const response = await fetch(`${host.url}/sessions/${id}`, {
      method: "DELETE",
    });
    assert.equal(response.status, 500);
    assert.ok(Date.now() - startedAt < 3_000);
    assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
    assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 404);
  } finally {
    child.kill("SIGKILL");
    await once(child, "exit");
    await host.close();
  }
});

await test("backend process exit ends the session and frees the slot", async () => {
  const { host } = await setup();
  const id = await createSession(host);
  const socket = await connect(host, id);
  const closed = once(socket, "close");
  socket.send(JSON.stringify({ type: "input", data: "exit-backend\r" }));
  await closed;
  assert.equal((await fetch(`${host.url}/sessions/${id}`)).status, 404);
  await createSession(host);
  await host.close();
});
