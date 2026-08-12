import { spawn, type ChildProcessByStdio } from "node:child_process";
import { once } from "node:events";
import type { IncomingMessage } from "node:http";
import { createServer } from "node:net";
import path from "node:path";
import type { Readable } from "node:stream";

import { WebSocket, type RawData } from "ws";

// Support code for spike 003 hidden tests. Not itself a set of evaluation
// cases; see manifest.json (marked "support"). Connection-handling helpers
// deliberately mirror the patterns already proven in the project's own
// visible test (../../../../harness/test/spike.integration.test.ts) rather
// than inventing new ones, per the evaluator skill's "minimize evaluator
// cleverness" guidance.

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
 * Deliberately does not call .terminate()/.close() on the socket: doing so
 * on a socket that never finished connecting is what caused attempt 001's
 * evaluator-defect crash (see eval-spec.md "Relationship to Attempt 001").
 * The `ws` client fires 'unexpected-response' synchronously with the real
 * HTTP response and needs no further cleanup here; this exact pattern is
 * already used by the project's own visible test.
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
 *
 * `expr` (default none) lets the caller query a live shell value, e.g.
 * `"$PWD"` or `"$SOME_VAR"`, without risking an echo/regex collision on the
 * marker's own head/colon (attempt 001's second confirmed defect). Validated
 * empirically against this project's actual PTY/Bash behaviour before use;
 * see eval-spec.md's Pre-Freeze Integrity Gate.
 */
export interface QueryCommand {
  command: string;
  pattern: RegExp;
  /** Exposed for the helper self-check's positive control; not needed by
   * ordinary callers, who should use `command` + `pattern` together. */
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
