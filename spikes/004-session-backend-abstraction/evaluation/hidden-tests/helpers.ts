import { spawn, type ChildProcessByStdio } from "node:child_process";
import { once } from "node:events";
import type { IncomingMessage } from "node:http";
import { createServer } from "node:net";
import path from "node:path";
import type { Readable } from "node:stream";

import { WebSocket, type RawData } from "ws";

import {
  startHarnessHost,
  type HarnessHost,
} from "../../../../harness/src/index.ts";

// Support code for spike 004 hidden tests. Not itself a set of evaluation
// cases; see manifest.json (marked "support"). The connection/PTY-query
// helpers below (postJson/deleteJson/createSession/connect/rejectedUpgrade/
// disconnect/sendInput/waitForOutput/collectOutputFor/sendAndWait/
// buildQueryCommand/pidAlive/waitUntil/waitForPidExit/readBashPid/
// randomFreePort/spawnHarnessCli) are carried over verbatim from spike 003's
// promoted, previously verified hidden-test suite
// (spikes/003-session-lifecycle/evaluation/hidden-tests/helpers.ts, public
// historical record), per spike.md's own "Existing tests may be reused or
// adjusted where appropriate" and the evaluator skill's "minimize evaluator
// cleverness" guidance. Only `getJson` and the `ControllableBackend` family
// (needed for spike 004's new startup/backend-independence/finalization
// coverage) are new.

export const HARNESS_ROOT = path.resolve(
  import.meta.dirname,
  "../../../../harness",
);
export const HARNESS_ENTRY = path.join(HARNESS_ROOT, "src/index.ts");

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

/** New in spike 004: wraps `GET /sessions/:id`. */
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
 * rejected (never reaching 101). Resolves with the observed status code.
 *
 * Deliberately does not call .terminate()/.close() on the socket — doing so
 * on a socket that never finished connecting was a confirmed evaluator
 * defect during spike 003's first attempt (see that spike's eval-spec.md,
 * "Relationship to Attempt 001"). This exact pattern is already used by the
 * project's own visible test and by spike 003's promoted hidden tests.
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

function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return data.toString("utf8");
}

function parseOutputMessage(rawData: RawData): string | undefined {
  let message: unknown;
  try {
    message = JSON.parse(rawDataToString(rawData));
  } catch {
    return undefined;
  }
  if (
    typeof message !== "object" ||
    message === null ||
    !("type" in message) ||
    (message as { type: unknown }).type !== "output" ||
    !("data" in message) ||
    typeof (message as { data: unknown }).data !== "string"
  ) {
    return undefined;
  }
  return (message as { data: string }).data;
}

export function sendInput(socket: WebSocket, data: string): void {
  socket.send(JSON.stringify({ type: "input", data }));
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
      const data = parseOutputMessage(rawData);
      if (data === undefined) return;
      output += data;
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

export function collectOutputFor(
  socket: WebSocket,
  durationMs: number,
): Promise<string> {
  return new Promise((resolve) => {
    let output = "";
    const onMessage = (rawData: RawData): void => {
      const data = parseOutputMessage(rawData);
      if (data !== undefined) output += data;
    };
    socket.on("message", onMessage);
    setTimeout(() => {
      socket.off("message", onMessage);
      resolve(output);
    }, durationMs);
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

/**
 * Builds a shell command/pattern pair that proves genuine Bash execution
 * rather than PTY local-echo of the typed input: the target substring is
 * assembled from a shell variable at runtime and never appears contiguously
 * in the raw command text itself, so it cannot arrive via echo alone.
 * Carried over unchanged from spike 003's validated helper.
 */
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

export interface HarnessProcess {
  readonly url: string;
  readonly pid: number;
  waitForExit(): Promise<number | null>;
  signal(sig: NodeJS.Signals): void;
}

export function spawnHarnessCli(port: number): Promise<HarnessProcess> {
  return new Promise((resolve, reject) => {
    const child: ChildProcessByStdio<null, Readable, Readable> = spawn(
      process.execPath,
      [HARNESS_ENTRY],
      {
        cwd: HARNESS_ROOT,
        env: { ...process.env, PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.stdout.off("data", onData);
      child.kill("SIGKILL");
      reject(
        new Error(
          `Timed out waiting for Harness CLI to start listening. stdout=${stdout} stderr=${stderr}`,
        ),
      );
    }, 10_000);

    const onData = (chunk: Buffer): void => {
      stdout += chunk.toString("utf8");
      if (/listening/i.test(stdout)) {
        clearTimeout(timer);
        child.stdout.off("data", onData);
        if (child.pid === undefined) {
          reject(new Error("Harness CLI process has no pid"));
          return;
        }
        resolve({
          url: `http://127.0.0.1:${String(port)}`,
          pid: child.pid,
          waitForExit(): Promise<number | null> {
            return new Promise((res) => {
              child.once("exit", (code) => res(code));
            });
          },
          signal(sig: NodeJS.Signals): void {
            child.kill(sig);
          },
        });
      }
    };

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.stdout.on("data", onData);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// --- New for spike 004: backend construction seam (T1/T2) ---------------

/**
 * The minimal backend contract published as T2 in eval-requirements.md.
 * Declared locally rather than imported: the production module does not
 * export this type yet (it doesn't exist prior to implementation). This is
 * a type-only declaration of what the seam is expected to accept — see
 * `startHost` below for the one place this expectation meets the real,
 * possibly-not-yet-updated function signature.
 */
export interface SessionBackend {
  write(input: string): void;
  onData(listener: (output: string) => void): void;
  onExit(listener: () => void): void;
  stop(): void | Promise<void>;
}

export type BackendFactory = () => SessionBackend | Promise<SessionBackend>;

type StartHarnessHostWithBackend = (
  port: number,
  options?: { createBackend?: BackendFactory },
) => Promise<HarnessHost>;

/**
 * Calls the real `startHarnessHost` with the T1 construction seam. The cast
 * below exists only because, prior to implementation, `startHarnessHost`'s
 * declared type does not yet accept a second argument — TypeScript's static
 * arity check would otherwise reject this call. At runtime this always
 * invokes the same, single, real exported function; nothing here bypasses
 * normal construction or reaches into module internals (see N8). Once the
 * seam is implemented with a compatible signature, this cast becomes a
 * no-op precisely describing the real type, and `verify` will still be
 * calling the one real function either way. See eval-spec.md's Pre-Freeze
 * Integrity Gate for how this was validated.
 */
export function startHost(
  port: number,
  options?: { createBackend?: BackendFactory },
): Promise<HarnessHost> {
  return (startHarnessHost as unknown as StartHarnessHostWithBackend)(
    port,
    options,
  );
}

export interface ControllableBackend {
  /**
   * Narrower than `BackendFactory` (always returns a real `Promise`, never
   * a bare `SessionBackend`) — this is an implementation detail of this
   * specific fake backend, not a claim about what the seam requires; it
   * remains structurally assignable wherever a `BackendFactory` is
   * expected (e.g. `startHost`'s `createBackend` option), and lets test
   * code call `.then()`/pass it to `assert.rejects` without an extra
   * `Promise.resolve()` wrapper at every call site.
   */
  readonly factory: () => Promise<SessionBackend>;
  /** Resolve the pending createBackend() call: startup succeeds. */
  resolveStart(): void;
  /** Reject the pending createBackend() call: startup fails. */
  rejectStart(error?: Error): void;
  /** Simulate backend-produced output reaching the attached client. */
  emitOutput(data: string): void;
  /** Simulate the backend ending on its own. */
  emitExit(): void;
  /** Input this backend received via write(), in order. */
  readonly received: string[];
  /** Number of times Harness called stop() on this backend. */
  readonly stopCalls: number;
  /** Configure how long stop() takes to resolve (default: immediate). */
  setStopDelayMs(ms: number): void;
}

/**
 * Builds one controllable fake `SessionBackend` plus a `BackendFactory`
 * that always resolves to it (single-session use — most cases only ever
 * create one session per host). Every knob is test-controlled from outside
 * the real Harness code path, matching T1/T2 in eval-requirements.md.
 * Independently self-checked in helpers.selfcheck.test.ts before any
 * mandatory case relies on it (see eval-spec.md's Pre-Freeze Integrity
 * Gate).
 */
export function makeControllableBackend(): ControllableBackend {
  let startResolve!: (backend: SessionBackend) => void;
  let startReject!: (error: Error) => void;
  const startPromise = new Promise<SessionBackend>((resolve, reject) => {
    startResolve = resolve;
    startReject = reject;
  });

  const received: string[] = [];
  let stopCalls = 0;
  let stopDelayMs = 0;
  let dataListener: ((data: string) => void) | undefined;
  let exitListener: (() => void) | undefined;

  const backend: SessionBackend = {
    write(input) {
      received.push(input);
    },
    onData(listener) {
      dataListener = listener;
    },
    onExit(listener) {
      exitListener = listener;
    },
    async stop() {
      stopCalls++;
      if (stopDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, stopDelayMs));
      }
    },
  };

  return {
    factory: () => startPromise,
    resolveStart() {
      startResolve(backend);
    },
    rejectStart(error = new Error("simulated startup failure")) {
      startReject(error);
    },
    emitOutput(data) {
      dataListener?.(data);
    },
    emitExit() {
      exitListener?.();
    },
    received,
    get stopCalls() {
      return stopCalls;
    },
    setStopDelayMs(ms) {
      stopDelayMs = ms;
    },
  };
}

export interface BackendFactoryController {
  /** See the equivalent narrowing note on `ControllableBackend.factory`. */
  readonly factory: () => Promise<SessionBackend>;
  /**
   * Resolves with the Nth (1-indexed) backend Harness actually requested
   * from this factory, once that invocation has happened. Lets a test
   * control startup timing/outcome per-attempt without needing to know in
   * advance how many times the factory will be called.
   */
  attempt(n: number): Promise<ControllableBackend>;
  /** Number of times Harness has invoked this factory so far. */
  readonly invocationCount: number;
}

/**
 * A `BackendFactory` that hands out a fresh `ControllableBackend` on every
 * invocation, needed for cases that exercise more than one
 * session-creation attempt against the same host (e.g. startup failure
 * followed by a successful retry — E6; or asserting a rejected concurrent
 * `POST` never triggers a second factory invocation at all — E5).
 */
export function makeBackendFactoryController(): BackendFactoryController {
  const attempts: ControllableBackend[] = [];
  const waiters: {
    n: number;
    resolve: (backend: ControllableBackend) => void;
  }[] = [];

  function notify(): void {
    for (let i = waiters.length - 1; i >= 0; i--) {
      const waiter = waiters[i];
      if (waiter !== undefined && attempts.length >= waiter.n) {
        resolveWaiter(waiter, attempts[waiter.n - 1]);
        waiters.splice(i, 1);
      }
    }
  }

  function resolveWaiter(
    waiter: { n: number; resolve: (backend: ControllableBackend) => void },
    backend: ControllableBackend | undefined,
  ): void {
    if (backend !== undefined) waiter.resolve(backend);
  }

  return {
    factory: () => {
      const backend = makeControllableBackend();
      attempts.push(backend);
      notify();
      return backend.factory();
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

/** Waits for a WebSocket's "close" event, with a timeout. */
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
