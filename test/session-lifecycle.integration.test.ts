import assert from "node:assert/strict";
import { once } from "node:events";
import type { IncomingMessage } from "node:http";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import { startHarnessHost, type HarnessHost } from "../src/index.ts";

async function createSession(host: HarnessHost): Promise<string> {
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  assert.equal(response.status, 201);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^application\/json/,
  );
  const body: unknown = await response.json();
  assert.ok(
    typeof body === "object" &&
      body !== null &&
      "id" in body &&
      typeof body.id === "string",
  );
  return body.id;
}

async function connect(host: HarnessHost, id: string): Promise<WebSocket> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + `/sessions/${id}/ws`,
  );
  await once(socket, "open");
  return socket;
}

async function rejectedUpgrade(
  host: HarnessHost,
  id: string,
): Promise<number | undefined> {
  const socket = new WebSocket(
    host.url.replace("http://", "ws://") + `/sessions/${id}/ws`,
  );
  socket.on("error", () => undefined);
  return new Promise((resolve) => {
    socket.once(
      "unexpected-response",
      (_request, response: IncomingMessage) => {
        resolve(response.statusCode);
      },
    );
  });
}

function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return data.toString("utf8");
}

function waitForOutput(
  socket: WebSocket,
  pattern: RegExp,
): Promise<RegExpMatchArray> {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          `Timed out waiting for ${String(pattern)}; received ${JSON.stringify(output)}`,
        ),
      );
    }, 5_000);
    const onMessage = (rawData: RawData): void => {
      const message: unknown = JSON.parse(rawDataToString(rawData));
      if (
        typeof message !== "object" ||
        message === null ||
        !("type" in message) ||
        message.type !== "output" ||
        !("data" in message) ||
        typeof message.data !== "string"
      ) {
        return;
      }
      output += message.data;
      const match = output.match(pattern);
      if (match !== null) {
        cleanup();
        resolve(match);
      }
    };
    function cleanup(): void {
      clearTimeout(timeout);
      socket.off("message", onMessage);
    }
    socket.on("message", onMessage);
  });
}

async function sendAndWait(
  socket: WebSocket,
  input: string,
  pattern: RegExp,
): Promise<RegExpMatchArray> {
  const output = waitForOutput(socket, pattern);
  socket.send(JSON.stringify({ type: "input", data: `${input}\r` }));
  return output;
}

async function disconnect(socket: WebSocket): Promise<void> {
  socket.close();
  await once(socket, "close");
}

await test("creates, detaches, and reattaches to the same shell state", async () => {
  const host = await startHarnessHost(0);
  let socket: WebSocket | undefined;
  try {
    const id = await createSession(host);
    socket = await connect(host, id);
    await sendAndWait(
      socket,
      "export HARNESS_REATTACH=survived; printf '%s%s\\n' __SETUP_ OK__",
      /__SETUP_OK__\r?\n/,
    );
    const firstPid = await sendAndWait(
      socket,
      "echo __PID__:$BASHPID",
      /__PID__:(\d+)\r?\n/,
    );
    await disconnect(socket);
    socket = await connect(host, id);
    const state = await sendAndWait(
      socket,
      "echo __STATE__:$BASHPID:$HARNESS_REATTACH",
      /__STATE__:(\d+):survived\r?\n/,
    );
    assert.equal(state[1], firstPid[1]);
  } finally {
    if (socket?.readyState === WebSocket.OPEN) await disconnect(socket);
    await host.close();
  }
});

await test("serializes creation and rejects a second attachment", async () => {
  const host = await startHarnessHost(0);
  let socket: WebSocket | undefined;
  try {
    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        fetch(`${host.url}/sessions`, { method: "POST" }),
      ),
    );
    assert.deepEqual(
      responses.map(({ status }) => status).sort(),
      [201, 409, 409, 409, 409, 409],
    );
    const winner = responses.find(({ status }) => status === 201);
    assert.ok(winner !== undefined);
    const { id } = (await winner.json()) as { id: string };
    socket = await connect(host, id);
    assert.equal(await rejectedUpgrade(host, id), 409);
    await sendAndWait(
      socket,
      "printf '%s%s\\n' __ATTACHMENT_ SURVIVED__",
      /__ATTACHMENT_SURVIVED__\r?\n/,
    );
  } finally {
    if (socket?.readyState === WebSocket.OPEN) await disconnect(socket);
    await host.close();
  }
});

await test("stops a session, invalidates its id, and frees the slot", async () => {
  const host = await startHarnessHost(0);
  const firstId = await createSession(host);
  const socket = await connect(host, firstId);
  const closed = once(socket, "close");
  const deleted = await fetch(`${host.url}/sessions/${firstId}`, {
    method: "DELETE",
  });
  assert.equal(deleted.status, 204);
  assert.equal(await deleted.text(), "");
  await closed;
  assert.equal(await rejectedUpgrade(host, firstId), 404);
  assert.equal(await rejectedUpgrade(host, "unknown"), 404);
  const secondId = await createSession(host);
  assert.notEqual(secondId, firstId);
  assert.equal(
    (await fetch(`${host.url}/sessions/${firstId}`, { method: "DELETE" }))
      .status,
    404,
  );
  await host.close();
});

await test("natural shell exit closes the attachment and frees the slot", async () => {
  const host = await startHarnessHost(0);
  const id = await createSession(host);
  const socket = await connect(host, id);
  const closed = once(socket, "close");
  socket.send(JSON.stringify({ type: "input", data: "exit\r" }));
  await closed;
  assert.equal(await rejectedUpgrade(host, id), 404);
  assert.notEqual(await createSession(host), id);
  await host.close();
});
