import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import { startHarnessHost } from "../src/index.ts";

async function connect(url: string): Promise<WebSocket> {
  const socket = new WebSocket(url.replace("http://", "ws://") + "/ws");
  await once(socket, "open");
  return socket;
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
      let data: string;
      if (Array.isArray(rawData)) {
        data = Buffer.concat(rawData).toString("utf8");
      } else if (rawData instanceof ArrayBuffer) {
        data = Buffer.from(rawData).toString("utf8");
      } else {
        data = rawData.toString("utf8");
      }
      const message: unknown = JSON.parse(data);
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

await test("controls one Bash PTY over WebSocket without coupling it to the socket", async () => {
  const host = await startHarnessHost(0);
  let socket: WebSocket | undefined;

  try {
    socket = await connect(host.url);

    const pwd = await sendAndWait(
      socket,
      `printf '%s:%s\\n' __HARNESS_PWD__ "$PWD"`,
      /__HARNESS_PWD__:(.+)\r?\n/,
    );
    assert.equal(pwd[1], process.cwd());

    await sendAndWait(
      socket,
      'marker=__HARNESS_; echo "${marker}HELLO__"',
      /__HARNESS_HELLO__\r?\n/,
    );
    await sendAndWait(socket, "ls", /README\.md/);

    const firstPid = await sendAndWait(
      socket,
      "echo __HARNESS_PID__:$BASHPID",
      /__HARNESS_PID__:(\d+)\r?\n/,
    );

    await disconnect(socket);
    socket = await connect(host.url);

    const secondPid = await sendAndWait(
      socket,
      "echo __HARNESS_PID__:$BASHPID",
      /__HARNESS_PID__:(\d+)\r?\n/,
    );
    assert.equal(secondPid[1], firstPid[1]);
  } finally {
    if (socket?.readyState === WebSocket.OPEN) {
      await disconnect(socket);
    }
    await host.close();
  }
});
