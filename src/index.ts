import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { WebSocket, WebSocketServer, type RawData } from "ws";

import { PtyBackend } from "./pty-backend.ts";
import type {
  SessionBackend,
  SessionBackendFactory,
} from "./session-backend.ts";

export type {
  SessionBackend,
  SessionBackendFactory,
} from "./session-backend.ts";

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

interface Session {
  readonly id: string;
  readonly backend: SessionBackend;
  attaching?: boolean;
  socket: WebSocket | undefined;
  ending?: Promise<void>;
}

export interface HarnessHost {
  readonly url: string;
  close(): Promise<void>;
}

export interface HarnessHostOptions {
  createBackend?: SessionBackendFactory;
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

function rejectUpgrade(
  socket: import("node:stream").Duplex,
  status: 404 | 409,
): void {
  const reason = status === 404 ? "Not Found" : "Conflict";
  socket.end(
    `HTTP/1.1 ${String(status)} ${reason}\r\nConnection: close\r\n\r\n`,
  );
}

export async function startHarnessHost(
  port = DEFAULT_PORT,
  options: HarnessHostOptions = {},
): Promise<HarnessHost> {
  const server = createServer();
  const webSockets = new WebSocketServer({ noServer: true });
  const issuedSessionIds = new Set<string>();
  const createBackend = options.createBackend ?? (() => new PtyBackend());
  let activeSession: Session | undefined;
  let creatingSession = false;
  let closed = false;

  function removeSession(session: Session): void {
    session.socket?.terminate();
    session.socket = undefined;
    if (activeSession === session) {
      activeSession = undefined;
    }
  }

  function endSession(session: Session): Promise<void> {
    if (session.ending !== undefined) {
      return session.ending;
    }

    let resolveEnding!: () => void;
    let rejectEnding!: (error: unknown) => void;
    session.ending = new Promise<void>((resolve, reject) => {
      resolveEnding = resolve;
      rejectEnding = reject;
    });

    void (async () => {
      try {
        await session.backend.stop();
        removeSession(session);
        resolveEnding();
      } catch (error) {
        removeSession(session);
        rejectEnding(error);
      }
    })();

    return session.ending;
  }

  async function createSession(): Promise<Session> {
    let id = randomUUID();
    while (issuedSessionIds.has(id)) {
      id = randomUUID();
    }
    issuedSessionIds.add(id);

    const backend = await createBackend();
    const session: Session = {
      id,
      backend,
      socket: undefined,
    };

    backend.onData((data) => {
      if (session.socket?.readyState === WebSocket.OPEN) {
        session.socket.send(JSON.stringify({ type: "output", data }));
      }
    });
    backend.onExit(() => {
      void endSession(session).catch((error: unknown) => {
        console.error("Failed to finalize ended session", error);
      });
    });

    return session;
  }

  server.on("request", (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

    if (request.method === "POST" && pathname === "/sessions") {
      if (closed || creatingSession || activeSession !== undefined) {
        response.writeHead(409).end("Session already active\n");
        return;
      }

      creatingSession = true;
      void createSession().then(
        (session) => {
          creatingSession = false;
          if (closed || session.ending !== undefined) {
            void endSession(session).then(
              () =>
                response
                  .writeHead(closed ? 409 : 500)
                  .end(
                    closed
                      ? "Host is closed\n"
                      : "Backend ended during startup\n",
                  ),
              (error: unknown) => {
                console.error(
                  "Failed to finalize session during shutdown",
                  error,
                );
                response.writeHead(500).end("Internal server error\n");
              },
            );
            return;
          }
          activeSession = session;
          const body = JSON.stringify({ id: session.id });
          response.writeHead(201, {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(body),
          });
          response.end(body);
        },
        (error: unknown) => {
          creatingSession = false;
          console.error("Failed to start session backend", error);
          response.writeHead(500).end("Internal server error\n");
        },
      );
      return;
    }

    const sessionMatch = pathname.match(/^\/sessions\/([^/]+)$/);
    if (request.method === "GET" && sessionMatch !== null) {
      const session = activeSession;
      response
        .writeHead(
          session !== undefined && sessionMatch[1] === session.id ? 200 : 404,
        )
        .end();
      return;
    }

    const deleteMatch = sessionMatch;
    if (request.method === "DELETE" && deleteMatch !== null) {
      const session = activeSession;
      if (session === undefined || deleteMatch[1] !== session.id) {
        response.writeHead(404).end("Not found\n");
        return;
      }

      void endSession(session).then(
        () => response.writeHead(204).end(),
        (error: unknown) => {
          console.error("Failed to stop session", error);
          response.writeHead(500).end("Internal server error\n");
        },
      );
      return;
    }

    void serveStatic(pathname, response);
  });

  webSockets.on("connection", (socket, request) => {
    const session = activeSession;
    const id = new URL(request.url ?? "/", "http://localhost").pathname.match(
      /^\/sessions\/([^/]+)\/ws$/,
    )?.[1];

    if (session === undefined || id !== session.id) {
      socket.terminate();
      return;
    }
    session.socket = socket;

    socket.on("message", (data) => {
      const message = parseInputMessage(data);
      if (
        message !== undefined &&
        activeSession === session &&
        session.ending === undefined &&
        session.socket === socket
      ) {
        session.backend.write(message.data);
      }
    });

    socket.on("close", () => {
      if (session.socket === socket) {
        session.socket = undefined;
      }
    });
  });

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const id = pathname.match(/^\/sessions\/([^/]+)\/ws$/)?.[1];
    const session = activeSession;

    if (
      id === undefined ||
      session === undefined ||
      id !== session.id ||
      session.ending !== undefined
    ) {
      rejectUpgrade(socket, 404);
      return;
    }

    if (session.attaching === true || session.socket !== undefined) {
      rejectUpgrade(socket, 409);
      return;
    }

    // Reserve the attachment synchronously so competing upgrades cannot both
    // pass the check before handleUpgrade finishes.
    session.attaching = true;
    webSockets.handleUpgrade(request, socket, head, (webSocket) => {
      session.attaching = false;
      session.socket = webSocket;
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

      if (activeSession !== undefined) {
        await endSession(activeSession);
      }

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
  const port =
    process.env.PORT === undefined ? DEFAULT_PORT : Number(process.env.PORT);
  const host = await startHarnessHost(port);
  console.log(`Harness session lifecycle spike listening at ${host.url}`);

  const shutDown = async (): Promise<void> => {
    await host.close();
    process.exitCode = 0;
  };

  process.once("SIGINT", () => void shutDown());
  process.once("SIGTERM", () => void shutDown());
}
