import { readFile } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import * as pty from "node-pty";
import { WebSocket, WebSocketServer, type RawData } from "ws";

const LOOPBACK_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;

const staticFiles = new Map([
  [
    "/",
    { file: "../public/index.html", contentType: "text/html; charset=utf-8" },
  ],
  [
    "/client.js",
    {
      file: "../public/client.js",
      contentType: "text/javascript; charset=utf-8",
    },
  ],
  [
    "/styles.css",
    { file: "../public/styles.css", contentType: "text/css; charset=utf-8" },
  ],
]);

interface InputMessage {
  type: "input";
  data: string;
}

export interface HarnessHost {
  readonly url: string;
  close(): Promise<void>;
}

function parseInputMessage(data: RawData): InputMessage | undefined {
  try {
    const message: unknown = JSON.parse(rawDataToString(data));

    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      message.type === "input" &&
      "data" in message &&
      typeof message.data === "string"
    ) {
      return { type: "input", data: message.data };
    }
  } catch {
    // Invalid spike-protocol messages are ignored.
  }

  return undefined;
}

function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString("utf8");
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }

  return data.toString("utf8");
}

async function serveStatic(
  pathname: string,
  response: ServerResponse,
): Promise<void> {
  const asset = staticFiles.get(pathname);

  if (asset === undefined) {
    response.writeHead(404).end("Not found\n");
    return;
  }

  try {
    const body = await readFile(new URL(asset.file, import.meta.url));
    response.writeHead(200, {
      "content-type": asset.contentType,
      "x-content-type-options": "nosniff",
    });
    response.end(body);
  } catch (error) {
    console.error("Failed to serve browser client", error);
    response.writeHead(500).end("Internal server error\n");
  }
}

export async function startHarnessHost(
  port = DEFAULT_PORT,
): Promise<HarnessHost> {
  const bash = pty.spawn("/bin/bash", ["--noprofile", "--norc", "-i"], {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: { ...process.env, TERM: "xterm-256color" },
  });

  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    void serveStatic(pathname, response);
  });
  const webSockets = new WebSocketServer({ noServer: true });
  let activeSocket: WebSocket | undefined;
  let closed = false;

  bash.onData((data) => {
    if (activeSocket?.readyState === WebSocket.OPEN) {
      activeSocket.send(JSON.stringify({ type: "output", data }));
    }
  });

  bash.onExit(({ exitCode }) => {
    if (activeSocket?.readyState === WebSocket.OPEN) {
      activeSocket.close(1011, `Bash exited with status ${String(exitCode)}`);
    }
  });

  webSockets.on("connection", (socket) => {
    activeSocket = socket;

    socket.on("message", (data) => {
      const message = parseInputMessage(data);
      if (message !== undefined) {
        bash.write(message.data);
      }
    });

    socket.on("close", () => {
      if (activeSocket === socket) {
        activeSocket = undefined;
      }
    });
  });

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

    if (pathname !== "/ws") {
      socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    if (activeSocket !== undefined) {
      socket.write("HTTP/1.1 409 Conflict\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    webSockets.handleUpgrade(request, socket, head, (webSocket) => {
      webSockets.emit("connection", webSocket, request);
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, LOOPBACK_HOST, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address() as AddressInfo;
  const url = `http://${LOOPBACK_HOST}:${String(address.port)}`;

  return {
    url,
    async close(): Promise<void> {
      if (closed) {
        return;
      }
      closed = true;

      activeSocket?.close(1001, "Harness host shutting down");
      bash.kill();

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          webSockets.close((error) => {
            if (error === undefined) {
              resolve();
            } else {
              reject(error);
            }
          });
        }),
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error === undefined) {
              resolve();
            } else {
              reject(error);
            }
          });
        }),
      ]);
    },
  };
}

if (import.meta.main) {
  const host = await startHarnessHost();
  console.log(`Harness PTY spike listening at ${host.url}`);

  const shutDown = async (): Promise<void> => {
    await host.close();
    process.exitCode = 0;
  };

  process.once("SIGINT", () => void shutDown());
  process.once("SIGTERM", () => void shutDown());
}
