import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";

import { WebSocket, WebSocketServer, type RawData } from "ws";

import { PtyBackend } from "./pty-backend.ts";
import type {
  HarnessErrorMessage,
  SessionBackend,
  SessionBackendFactory,
} from "./session-backend.ts";
import { createLocalWorkflowBackend } from "./workflow-backend.ts";
import {
  parseWorkflowReplaceRequest,
  parseWorkflowRunRequest,
  WorkflowRunConflictError,
  WorkflowRunNotFoundError,
  WorkflowRunRegistry,
  WorkflowRunRequestError,
  type WorkflowRunBackendFactory,
} from "./workflow-run.ts";

export type {
  BackendInputResult,
  HarnessErrorMessage,
  SessionBackend,
  SessionBackendFactory,
} from "./session-backend.ts";
export {
  buildExecutorCommand,
  createLocalWorkflowBackend,
} from "./workflow-backend.ts";
export type {
  ResolvedWorkflowRunSpec,
  WorkflowInvocationMode,
  WorkflowPermissionProfile,
  WorkflowRunBackend,
  WorkflowRunBackendContext,
  WorkflowRunBackendFactory,
  WorkflowRunExitOutcome,
  WorkflowRunRecord,
  WorkflowRunStatus,
} from "./workflow-run.ts";

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

type SessionEventType = "session.started" | "session.ended";

interface HarnessEvent {
  readonly meta: {
    readonly id: string;
    readonly kind: "event";
    readonly type: string;
    readonly version: "1.0.0";
    readonly streamId: string;
    readonly correlationId: string;
    readonly timestamp: string;
    readonly source: "harness";
  };
  readonly data: Record<string, unknown>;
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
  createWorkflowBackend?: WorkflowRunBackendFactory;
}

function sendError(socket: WebSocket | undefined, error: HarnessErrorMessage) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(error));
  }
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

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > 1_000_000) {
      throw new SyntaxError("request body is too large");
    }
    chunks.push(buffer);
  }
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(
  response: ServerResponse,
  status: number,
  payload: unknown,
): void {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
  });
  response.end(body);
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
  const eventSockets = new Set<WebSocket>();
  const issuedSessionIds = new Set<string>();
  const createBackend = options.createBackend ?? (() => new PtyBackend());
  let activeSession: Session | undefined;
  let creatingSession = false;
  let closed = false;

  function publishEvent(
    type: string,
    streamId: string,
    data: Record<string, unknown>,
  ): void {
    const id = randomUUID();
    const event: HarnessEvent = {
      meta: {
        id,
        kind: "event",
        type,
        version: "1.0.0",
        streamId,
        correlationId: id,
        timestamp: new Date().toISOString(),
        source: "harness",
      },
      data,
    };
    const message = JSON.stringify(event);

    for (const socket of eventSockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    }
  }

  function publishSessionEvent(
    type: SessionEventType,
    sessionId: string,
  ): void {
    publishEvent(type, sessionId, {});
  }

  const workflowRuns = new WorkflowRunRegistry({
    createBackend: options.createWorkflowBackend ?? createLocalWorkflowBackend,
    publishEvent,
  });

  async function handleWorkflowRequest(
    request: IncomingMessage,
    response: ServerResponse,
    pathname: string,
  ): Promise<void> {
    const method = request.method ?? "GET";
    try {
      if (pathname === "/workflow-runs") {
        if (method === "POST") {
          const { run, duplicate } = await workflowRuns.allocate(
            parseWorkflowRunRequest(await readJsonBody(request)),
          );
          sendJson(response, duplicate ? 200 : 201, { run, duplicate });
          return;
        }
        if (method === "GET") {
          sendJson(response, 200, { runs: workflowRuns.list() });
          return;
        }
        response.writeHead(405).end("Method not allowed\n");
        return;
      }

      const runMatch = pathname.match(
        /^\/workflow-runs\/([^/]+)(\/log|\/cancel|\/replace)?$/,
      );
      if (runMatch === null) {
        response.writeHead(404).end("Not found\n");
        return;
      }
      const runId = decodeURIComponent(runMatch[1] ?? "");
      const suffix = runMatch[2];

      if (suffix === undefined && method === "GET") {
        const run = workflowRuns.get(runId);
        if (run === undefined) {
          response.writeHead(404).end("Not found\n");
          return;
        }
        sendJson(response, 200, { run });
        return;
      }
      if (suffix === "/log" && method === "GET") {
        const log = workflowRuns.log(runId);
        if (log === undefined) {
          response.writeHead(404).end("Not found\n");
          return;
        }
        response.writeHead(200, {
          "content-type": "text/plain; charset=utf-8",
          "x-content-type-options": "nosniff",
        });
        response.end(log);
        return;
      }
      if (suffix === "/cancel" && method === "POST") {
        const body = await readJsonBody(request);
        const reason =
          typeof body === "object" &&
          body !== null &&
          "reason" in body &&
          typeof body.reason === "string"
            ? body.reason
            : undefined;
        sendJson(response, 200, {
          run: await workflowRuns.cancel(runId, reason),
        });
        return;
      }
      if (suffix === "/replace" && method === "POST") {
        const replacement = await workflowRuns.replace(
          runId,
          parseWorkflowReplaceRequest(await readJsonBody(request)),
        );
        sendJson(response, 201, replacement);
        return;
      }
      response.writeHead(405).end("Method not allowed\n");
    } catch (error) {
      if (
        error instanceof WorkflowRunRequestError ||
        error instanceof SyntaxError
      ) {
        sendJson(response, 400, { error: error.message });
        return;
      }
      if (error instanceof WorkflowRunNotFoundError) {
        sendJson(response, 404, { error: error.message });
        return;
      }
      if (error instanceof WorkflowRunConflictError) {
        sendJson(response, 409, { error: error.message });
        return;
      }
      console.error("Failed to handle workflow-run request", error);
      if (!response.headersSent) {
        response.writeHead(500).end("Internal server error\n");
      }
    }
  }

  function removeSession(session: Session): void {
    session.socket?.terminate();
    session.socket = undefined;
    if (activeSession === session) {
      activeSession = undefined;
      publishSessionEvent("session.ended", session.id);
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
    backend.onError((error) => {
      sendError(session.socket, error);
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

    if (
      pathname === "/workflow-runs" ||
      pathname.startsWith("/workflow-runs/")
    ) {
      void handleWorkflowRequest(request, response, pathname);
      return;
    }

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
          publishSessionEvent("session.started", session.id);
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
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (pathname === "/events/ws") {
      eventSockets.add(socket);
      socket.on("close", () => eventSockets.delete(socket));
      return;
    }

    const session = activeSession;
    const id = pathname.match(/^\/sessions\/([^/]+)\/ws$/)?.[1];

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
        const result = session.backend.write(message.data);
        if (result !== undefined && !result.accepted) {
          sendError(socket, result.error);
        }
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
    if (pathname === "/events/ws") {
      webSockets.handleUpgrade(request, socket, head, (webSocket) => {
        webSockets.emit("connection", webSocket, request);
      });
      return;
    }

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

      await workflowRuns.close();

      if (activeSession !== undefined) {
        await endSession(activeSession);
      }

      for (const socket of eventSockets) {
        socket.close();
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
  const createBackend =
    process.env.HARNESS_BACKEND === "codex"
      ? async (): Promise<SessionBackend> => {
          const { createCodexBackend } = await import("./codex-backend.ts");
          const cwd = process.env.HARNESS_CODEX_CWD;
          return createCodexBackend(cwd === undefined ? {} : { cwd });
        }
      : undefined;
  const host = await startHarnessHost(
    port,
    createBackend === undefined ? {} : { createBackend },
  );
  console.log(`Harness session lifecycle spike listening at ${host.url}`);

  const shutDown = async (): Promise<void> => {
    await host.close();
    process.exitCode = 0;
  };

  process.once("SIGINT", () => void shutDown());
  process.once("SIGTERM", () => void shutDown());
}
