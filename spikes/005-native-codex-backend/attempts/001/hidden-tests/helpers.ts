import { type ChildProcess, fork } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { IncomingMessage } from "node:http";
import { createServer } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { WebSocket, type RawData } from "ws";

import {
  startHarnessHost,
  type HarnessHost,
} from "../../../../harness/src/index.ts";
import type { SessionBackend } from "../../../../harness/src/session-backend.ts";

// Support code for Spike 005 hidden tests. Not itself a set of evaluation
// cases; see manifest.json (marked "support"). The connection/PTY-query
// helpers below (postJson/deleteJson/getJson/connect/rejectedUpgrade/
// disconnect/sendInput/waitUntil/pidAlive/waitForPidExit/readBashPid/
// randomFreePort/buildQueryCommand) are carried over, largely unchanged, from
// Spike 004's promoted, previously-validated hidden-test suite
// (spikes/004-session-backend-abstraction/evaluation/hidden-tests/
// helpers.ts, public historical record), per spike.md's own "Existing tests
// may be reused or adjusted where appropriate" and the evaluator skill's
// "minimize evaluator cleverness" guidance. Message parsing is extended to
// also recognize the new "error" control-message type this spike introduces.
// Everything from "Codex backend construction seam" onward is new for Spike
// 005.

export const HARNESS_ROOT = path.resolve(
  import.meta.dirname,
  "../../../../harness",
);
export const HARNESS_ENTRY = path.join(HARNESS_ROOT, "src/index.ts");
const CODEX_BACKEND_MODULE_PATH = path.join(
  HARNESS_ROOT,
  "src/codex-backend.ts",
);
const FAKE_APP_SERVER_PATH = path.join(
  import.meta.dirname,
  "fixtures/fake-app-server.ts",
);

function wsUrlFor(hostUrl: string, id: string): string {
  return hostUrl.replace("http://", "ws://") + `/sessions/${id}/ws`;
}

export interface JsonResponse {
  status: number;
  contentType: string | null;
  body: unknown;
}

async function toJsonResponse(response: Response): Promise<JsonResponse> {
  const contentType = response.headers.get("content-type");
  const text = await response.text();
  let body: unknown;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: response.status, contentType, body };
}

export async function postJson(url: string): Promise<JsonResponse> {
  const response = await fetch(url, { method: "POST" });
  return toJsonResponse(response);
}

export async function deleteJson(url: string): Promise<JsonResponse> {
  const response = await fetch(url, { method: "DELETE" });
  return toJsonResponse(response);
}

export async function getJson(url: string): Promise<JsonResponse> {
  const response = await fetch(url);
  return toJsonResponse(response);
}

export async function createSession(hostUrl: string): Promise<string> {
  const response = await postJson(`${hostUrl}/sessions`);
  if (response.status !== 201) {
    throw new Error(
      `createSession helper expected 201, got ${String(response.status)}`,
    );
  }
  return (response.body as { id: string }).id;
}

/** Positive path: attach and wait for the upgrade to complete. */
export async function connect(hostUrl: string, id: string): Promise<WebSocket> {
  const socket = new WebSocket(wsUrlFor(hostUrl, id));
  await once(socket, "open");
  return socket;
}

/**
 * Negative path: attempt to attach expecting the HTTP upgrade itself to be
 * rejected (never reaching 101). Deliberately does not call .terminate() on
 * the socket — see Spike 003/004's own eval-spec for why.
 */
export function rejectedUpgrade(
  hostUrl: string,
  id: string,
): Promise<number | undefined> {
  const socket = new WebSocket(wsUrlFor(hostUrl, id));
  socket.on("error", () => undefined);
  return new Promise((resolve) => {
    socket.once(
      "unexpected-response",
      (_request: unknown, response: IncomingMessage) => {
        resolve(response.statusCode);
      },
    );
  });
}

export async function disconnect(socket: WebSocket): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return;
  socket.close();
  await once(socket, "close");
}

export function waitForClose(
  socket: WebSocket,
  timeoutMs = 5000,
): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for socket close"));
    }, timeoutMs);
    once(socket, "close").then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return data.toString("utf8");
}

export type ServerMessage =
  | { type: "output"; data: string }
  | { type: "error"; code: string; data: string };

/**
 * Parses a message Harness sent to the browser: the established "output"
 * shape (Spike 003/004 baseline) plus the two new "error" control messages
 * this spike introduces (turn_active / turn_start_failed). Unrecognized
 * shapes are ignored, mirroring the server's own tolerant parsing.
 */
export function parseServerMessage(
  rawData: RawData,
): ServerMessage | undefined {
  let message: unknown;
  try {
    message = JSON.parse(rawDataToString(rawData));
  } catch {
    return undefined;
  }
  if (typeof message !== "object" || message === null || !("type" in message)) {
    return undefined;
  }
  const typed = message as { type: unknown };
  if (
    typed.type === "output" &&
    "data" in message &&
    typeof (message as { data: unknown }).data === "string"
  ) {
    return { type: "output", data: (message as { data: string }).data };
  }
  if (
    typed.type === "error" &&
    "code" in message &&
    typeof (message as { code: unknown }).code === "string" &&
    "data" in message &&
    typeof (message as { data: unknown }).data === "string"
  ) {
    return {
      type: "error",
      code: (message as { code: string }).code,
      data: (message as { data: string }).data,
    };
  }
  return undefined;
}

export function sendInput(socket: WebSocket, data: string): void {
  socket.send(JSON.stringify({ type: "input", data }));
}

/** Collects every recognized server message received over `durationMs`. */
export function collectMessagesFor(
  socket: WebSocket,
  durationMs: number,
): Promise<ServerMessage[]> {
  return new Promise((resolve) => {
    const messages: ServerMessage[] = [];
    const onMessage = (rawData: RawData): void => {
      const message = parseServerMessage(rawData);
      if (message !== undefined) messages.push(message);
    };
    socket.on("message", onMessage);
    setTimeout(() => {
      socket.off("message", onMessage);
      resolve(messages);
    }, durationMs);
  });
}

/** Resolves with the next server message matching `predicate`, with a timeout. */
export function waitForServerMessage(
  socket: WebSocket,
  predicate: (message: ServerMessage) => boolean,
  timeoutMs = 5000,
): Promise<ServerMessage> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for a matching server message`));
    }, timeoutMs);

    const onMessage = (rawData: RawData): void => {
      const message = parseServerMessage(rawData);
      if (message !== undefined && predicate(message)) {
        cleanup();
        resolve(message);
      }
    };

    function cleanup(): void {
      clearTimeout(timeout);
      socket.off("message", onMessage);
    }

    socket.on("message", onMessage);
  });
}

export function waitForOutput(
  socket: WebSocket,
  pattern: RegExp,
  timeoutMs = 5000,
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
    }, timeoutMs);

    const onMessage = (rawData: RawData): void => {
      const message = parseServerMessage(rawData);
      if (message?.type !== "output") return;
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

export async function sendAndWait(
  socket: WebSocket,
  input: string,
  pattern: RegExp,
  timeoutMs = 5000,
): Promise<RegExpMatchArray> {
  const result = waitForOutput(socket, pattern, timeoutMs);
  sendInput(socket, `${input}\r`);
  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface QueryCommand {
  command: string;
  pattern: RegExp;
  head: string;
  tail: string;
}

export function buildQueryCommand(label: string, expr = ""): QueryCommand {
  const nonce = Math.random().toString(36).slice(2, 8);
  const head = `__HARNESS_${label}_`;
  const tail = `${nonce}__`;
  const command = `h=${head}; echo "\${h}${tail}:${expr}"`;
  const pattern = new RegExp(`${escapeRegExp(head + tail)}:(.*)\\r?\\n`);
  return { command, pattern, head, tail };
}

export function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") return false;
    if (code === "EPERM") return true;
    throw error;
  }
}

export function waitUntil(
  predicate: () => boolean,
  timeoutMs = 3000,
  intervalMs = 50,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = (): void => {
      if (predicate()) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Timed out waiting for condition"));
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

/**
 * Resolves `true` if `promise` has not settled within `ms`; `false` if it
 * settled (fulfilled or rejected) before `ms` elapsed. Never throws — settling
 * via rejection still counts as "settled". Does not consume the original
 * promise's eventual value/error for the caller.
 */
export function isPendingAfter(
  promise: Promise<unknown>,
  ms: number,
): Promise<boolean> {
  return Promise.race([
    promise.then(
      () => false,
      () => false,
    ),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(true), ms)),
  ]);
}

export function waitForPidExit(pid: number, timeoutMs = 3000): Promise<void> {
  return waitUntil(() => !pidAlive(pid), timeoutMs);
}

export async function readBashPid(socket: WebSocket): Promise<number> {
  const { command, pattern } = buildQueryCommand("PID", "$BASHPID");
  const match = await sendAndWait(socket, command, pattern);
  return Number(match[1]);
}

export function randomFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(new Error("failed to allocate a free port"));
        return;
      }
      const port = address.port;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

export function startHost(
  port: number,
  options?: { createBackend?: () => SessionBackend | Promise<SessionBackend> },
): Promise<HarnessHost> {
  return startHarnessHost(port, options);
}

// --- Codex backend construction seam (T1/T2/T3, eval-requirements.md) ----

export interface AppServerProcess {
  readonly stdin: NodeJS.WritableStream;
  readonly stdout: NodeJS.ReadableStream;
  readonly stderr?: NodeJS.ReadableStream;
  readonly pid?: number;
  on(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): unknown;
  kill(signal?: NodeJS.Signals | number): boolean;
}

export interface CodexBackendOptions {
  cwd?: string;
  spawnAppServer?: () => AppServerProcess;
  interruptGraceMs?: number;
}

type CreateCodexBackendFn = (
  options?: CodexBackendOptions,
) => Promise<SessionBackend>;

/**
 * Invokes the real, implementation-provided `createCodexBackend` (T1),
 * loaded via a dynamic `import()` whose specifier is a runtime-computed
 * `file://` URL, not a string literal — so TypeScript does not attempt
 * static module resolution against `src/codex-backend.ts` (which does not
 * exist prior to implementation) and every *other* hidden-test file's
 * typecheck/discovery is unaffected by whether this module exists yet. Once
 * implemented, this always calls the one real exported function; nothing
 * here bypasses normal module construction. See eval-spec.md's Pre-Freeze
 * Integrity Gate for how the pre-implementation failure mode of this import
 * was validated.
 */
export async function createCodexBackend(
  options?: CodexBackendOptions,
): Promise<SessionBackend> {
  const moduleUrl = pathToFileURL(CODEX_BACKEND_MODULE_PATH).href;
  const mod = (await import(moduleUrl)) as {
    createCodexBackend: CreateCodexBackendFn;
  };
  return mod.createCodexBackend(options);
}

// --- Deterministic App Server peer -----------------------------------------

export interface PendingRequest {
  id: unknown;
  method: string;
  params: unknown;
}

export interface JsonRpcErrorPayload {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Wraps one `fork()`-ed instance of fixtures/fake-app-server.ts: a genuinely
 * separate OS process speaking real newline-delimited JSON-RPC on its own
 * stdio (consumed by the Codex-backend implementation under test exactly as
 * the real `codex app-server --stdio` binary would be), controlled out of
 * band over Node's IPC channel. `.appServerProcess` is passed directly as the
 * return value of a `spawnAppServer` override (T2) — it structurally
 * satisfies `AppServerProcess`. (`fork()`'s TypeScript return type always
 * types `stdin`/`stdout` as nullable, even though this specific `stdio`
 * configuration guarantees them non-null at runtime; `.appServerProcess`
 * isolates that one known-safe narrowing to a single place instead of
 * scattering non-null assertions across every call site.)
 */
export interface FakeAppServer {
  readonly child: ChildProcess;
  readonly pid: number | undefined;
  /** Guaranteed non-null: this `stdio` configuration always pipes stdin/stdout/stderr. */
  readonly stdin: NodeJS.WritableStream;
  readonly stdout: NodeJS.ReadableStream;
  /** Structurally satisfies `AppServerProcess` (T2); pass as a `spawnAppServer` return value. */
  readonly appServerProcess: AppServerProcess;
  /** Resolves once the peer process has registered its signal handler and is ready to receive commands. */
  readonly ready: Promise<void>;
  /** Every JSON-RPC request received so far, in receipt order. */
  readonly requestLog: PendingRequest[];
  /** Resolves with the next not-yet-claimed request for `method`. */
  waitForRequest(method: string): Promise<PendingRequest>;
  respond(id: unknown, result: unknown): void;
  respondError(id: unknown, error: JsonRpcErrorPayload): void;
  notify(method: string, params: unknown): void;
  /** Commands the fake peer process to exit on its own. */
  exit(code?: number): void;
  /** Commands the fake peer process to ignore SIGTERM (simulates a stuck backend process, for E24). */
  ignoreSigterm(): void;
  waitForExit(
    timeoutMs?: number,
  ): Promise<{ code: number | null; signal: NodeJS.Signals | null }>;
}

export function makeFakeAppServer(): FakeAppServer {
  const child = fork(FAKE_APP_SERVER_PATH, [], {
    stdio: ["pipe", "pipe", "pipe", "ipc"],
  });
  const requestLog: PendingRequest[] = [];
  const queues = new Map<string, PendingRequest[]>();
  const waiters = new Map<string, ((request: PendingRequest) => void)[]>();
  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  child.on("message", (raw: unknown) => {
    const event = raw as { event: string } & Record<string, unknown>;
    if (event.event === "ready") {
      resolveReady();
      return;
    }
    if (event.event !== "request") return;
    const request: PendingRequest = {
      id: event.id,
      method: event.method as string,
      params: event.params,
    };
    requestLog.push(request);
    const waiterList = waiters.get(request.method);
    if (waiterList !== undefined && waiterList.length > 0) {
      const resolve = waiterList.shift();
      resolve?.(request);
      return;
    }
    const queue = queues.get(request.method) ?? [];
    queue.push(request);
    queues.set(request.method, queue);
  });

  return {
    child,
    get pid() {
      return child.pid;
    },
    get stdin() {
      if (child.stdin === null)
        throw new Error(
          "fake app-server child has no stdin (unexpected stdio configuration)",
        );
      return child.stdin;
    },
    get stdout() {
      if (child.stdout === null)
        throw new Error(
          "fake app-server child has no stdout (unexpected stdio configuration)",
        );
      return child.stdout;
    },
    get appServerProcess() {
      return child as unknown as AppServerProcess;
    },
    ready,
    requestLog,
    waitForRequest(method) {
      const queue = queues.get(method);
      const queued = queue?.shift();
      if (queued !== undefined) return Promise.resolve(queued);
      return new Promise((resolve) => {
        const list = waiters.get(method) ?? [];
        list.push(resolve);
        waiters.set(method, list);
      });
    },
    respond(id, result) {
      child.send({ cmd: "respond", id, result });
    },
    respondError(id, error) {
      child.send({ cmd: "respondError", id, error });
    },
    notify(method, params) {
      child.send({ cmd: "notify", method, params });
    },
    exit(code) {
      child.send({ cmd: "exit", code });
    },
    ignoreSigterm() {
      child.send({ cmd: "ignoreSigterm" });
    },
    waitForExit(timeoutMs = 5000) {
      if (child.exitCode !== null || child.signalCode !== null) {
        return Promise.resolve({
          code: child.exitCode,
          signal: child.signalCode,
        });
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Timed out waiting for fake app-server exit"));
        }, timeoutMs);
        child.once("exit", (code, signal) => {
          clearTimeout(timer);
          resolve({ code, signal });
        });
      });
    },
  };
}

// --- Codex protocol choreography -------------------------------------------
// Realistic response/notification shapes below were captured from a real
// handshake/turn/interrupt exchange against the actual installed
// `codex-cli 0.147.0` App Server binary (see eval-spec.md's Pre-Freeze
// Integrity Gate) — not solely inferred from the schema bundle. Only the
// fields these hidden tests actually depend on are modeled; see
// eval-spec.md's Limitations.

export interface HandshakeResult {
  threadId: string;
  initializeParams: { capabilities?: { experimentalApi?: boolean } | null };
  threadStartParams: { cwd?: string | null };
}

/** Waits for and satisfies exactly one `initialize` + one `thread/start` request. */
export async function autoHandshake(
  peer: FakeAppServer,
  options: { threadId?: string } = {},
): Promise<HandshakeResult> {
  const threadId = options.threadId ?? randomUUID();
  const nowSec = Math.floor(Date.now() / 1000);

  const init = await peer.waitForRequest("initialize");
  peer.respond(init.id, {
    userAgent: "fake-app-server/0.0.0",
    codexHome: "/fake/codex/home",
    platformFamily: "unix",
    platformOs: "linux",
  });

  const start = await peer.waitForRequest("thread/start");
  const cwd =
    (start.params as { cwd?: string | null } | undefined)?.cwd ?? "/tmp";
  peer.respond(start.id, {
    thread: {
      id: threadId,
      sessionId: threadId,
      cliVersion: "0.147.0-fake",
      createdAt: nowSec,
      updatedAt: nowSec,
      cwd,
      ephemeral: false,
      modelProvider: "openai",
      preview: "",
      source: "appServer",
      status: { type: "idle" },
      turns: [],
    },
  });

  return {
    threadId,
    initializeParams: init.params as HandshakeResult["initializeParams"],
    threadStartParams: start.params as HandshakeResult["threadStartParams"],
  };
}

export interface TurnStartRequest {
  id: unknown;
  threadId: string;
  text: string;
}

/**
 * Waits for the next `turn/start` request and returns it decoded, without
 * responding to it. Callers that need to control exactly when `turn/start`'s
 * own response arrives (e.g. active-turn-rejection cases) use this directly;
 * `driveNormalTurn` below is a convenience wrapper for cases that just want a
 * complete, realistic turn.
 */
export async function waitForTurnStart(
  peer: FakeAppServer,
): Promise<TurnStartRequest> {
  const request = await peer.waitForRequest("turn/start");
  const params = request.params as {
    threadId: string;
    input: { type: string; text?: string }[];
  };
  const textInput = params.input.find((item) => item.type === "text");
  return {
    id: request.id,
    threadId: params.threadId,
    text: textInput?.text ?? "",
  };
}

export function respondTurnStarted(
  peer: FakeAppServer,
  requestId: unknown,
  turnId?: string,
): string {
  const id = turnId ?? randomUUID();
  peer.respond(requestId, {
    turn: { id, items: [], status: "inProgress" },
  });
  return id;
}

export interface DriveTurnOptions {
  threadId: string;
  turnId?: string;
  deltas?: string[];
  finalText: string;
  status?: "completed" | "failed";
}

export interface DrivenTurn {
  turnId: string;
  userItemId: string;
  agentItemId: string;
}

/**
 * Drives one complete, realistic agent-message turn to completion: responds
 * to the already-observed `turn/start` request, then emits the same
 * notification sequence observed against the real App Server (turn/started,
 * userMessage item lifecycle, agentMessage item lifecycle with deltas,
 * turn/completed). Returns the provider-generated ids used, for cases that
 * need to inspect them (e.g. confirming they never leak into Harness
 * identity).
 */
export async function driveNormalTurn(
  peer: FakeAppServer,
  turnStart: TurnStartRequest,
  options: DriveTurnOptions,
): Promise<DrivenTurn> {
  const turnId = respondTurnStarted(peer, turnStart.id, options.turnId);
  const userItemId = randomUUID();
  const agentItemId = randomUUID();

  peer.notify("turn/started", {
    threadId: options.threadId,
    turn: { id: turnId, items: [], status: "inProgress" },
  });
  peer.notify("item/started", {
    item: {
      type: "userMessage",
      id: userItemId,
      clientId: null,
      content: [{ type: "text", text: turnStart.text }],
    },
    startedAtMs: Date.now(),
    threadId: options.threadId,
    turnId,
  });
  peer.notify("item/completed", {
    item: {
      type: "userMessage",
      id: userItemId,
      clientId: null,
      content: [{ type: "text", text: turnStart.text }],
    },
    completedAtMs: Date.now(),
    threadId: options.threadId,
    turnId,
  });

  peer.notify("item/started", {
    item: {
      type: "agentMessage",
      id: agentItemId,
      text: "",
      phase: "final_answer",
      memoryCitation: null,
    },
    startedAtMs: Date.now(),
    threadId: options.threadId,
    turnId,
  });

  const deltas = options.deltas ?? [options.finalText];
  for (const delta of deltas) {
    if (delta.length === 0) continue;
    peer.notify("item/agentMessage/delta", {
      threadId: options.threadId,
      turnId,
      itemId: agentItemId,
      delta,
    });
  }

  peer.notify("item/completed", {
    item: {
      type: "agentMessage",
      id: agentItemId,
      text: options.finalText,
      phase: "final_answer",
      memoryCitation: null,
    },
    completedAtMs: Date.now(),
    threadId: options.threadId,
    turnId,
  });

  peer.notify("turn/completed", {
    threadId: options.threadId,
    turn: { id: turnId, items: [], status: options.status ?? "completed" },
  });

  return { turnId, userItemId, agentItemId };
}

/** Emits an interrupted terminal `turn/completed` for an already-started turn. */
export function emitInterruptedTurnCompleted(
  peer: FakeAppServer,
  threadId: string,
  turnId: string,
): void {
  peer.notify("turn/completed", {
    threadId,
    turn: { id: turnId, items: [], status: "interrupted" },
  });
}

// --- Multi-attempt Codex backend factory controller -------------------------

export interface CodexAttempt {
  peer: FakeAppServer;
  options: CodexBackendOptions;
}

export interface CodexBackendFactoryController {
  /** Pass as `createBackend` to `startHost`. */
  readonly factory: () => Promise<SessionBackend>;
  /** Resolves once the Nth (1-indexed) attempt's `spawnAppServer` has actually been invoked. */
  attempt(n: number): Promise<CodexAttempt>;
  readonly invocationCount: number;
}

/**
 * Hands out a fresh `FakeAppServer` (and fresh `CodexBackendOptions`
 * targeting it) on every `createBackend` invocation, needed for cases that
 * exercise more than one session-creation attempt against the same host
 * (e.g. failed startup followed by a successful retry).
 */
export function makeCodexBackendFactoryController(
  optionsFor: (
    attemptNumber: number,
    peer: FakeAppServer,
  ) => CodexBackendOptions = (_n, peer) => ({
    cwd: "/tmp",
    spawnAppServer: () => peer.appServerProcess,
  }),
): CodexBackendFactoryController {
  const attempts: CodexAttempt[] = [];
  const waiters: { n: number; resolve: (attempt: CodexAttempt) => void }[] = [];

  function notify(): void {
    for (let i = waiters.length - 1; i >= 0; i--) {
      const waiter = waiters[i];
      const attempt = waiter === undefined ? undefined : attempts[waiter.n - 1];
      if (waiter !== undefined && attempt !== undefined) {
        waiter.resolve(attempt);
        waiters.splice(i, 1);
      }
    }
  }

  return {
    factory: () => {
      const peer = makeFakeAppServer();
      const options = optionsFor(attempts.length + 1, peer);
      attempts.push({ peer, options });
      notify();
      return createCodexBackend(options);
    },
    attempt(n) {
      const existing = attempts[n - 1];
      if (existing !== undefined) return Promise.resolve(existing);
      return new Promise((resolve) => {
        waiters.push({ n, resolve });
      });
    },
    get invocationCount() {
      return attempts.length;
    },
  };
}

// --- End-to-end convenience: start a fully-handshaked Codex session --------

export interface CodexSession {
  host: HarnessHost;
  id: string;
  peer: FakeAppServer;
  threadId: string;
  socket: WebSocket;
}

/**
 * Starts a host with a single Codex-backed session, completes the
 * initialize/thread-start handshake, and attaches a WebSocket client. Used
 * by cases that don't need to control startup timing/failure themselves.
 */
export async function startAttachedCodexSession(
  port: number,
  cwd = "/tmp",
  extraOptions: Pick<CodexBackendOptions, "interruptGraceMs"> = {},
): Promise<CodexSession> {
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd,
        spawnAppServer: () => peer.appServerProcess,
        ...extraOptions,
      }),
  });
  const handshakeDone = autoHandshake(peer);
  const created = await postJson(`${host.url}/sessions`);
  if (created.status !== 201) {
    throw new Error(
      `startAttachedCodexSession: expected 201, got ${String(created.status)}`,
    );
  }
  const { threadId } = await handshakeDone;
  const id = (created.body as { id: string }).id;
  const socket = await connect(host.url, id);
  return { host, id, peer, threadId, socket };
}
