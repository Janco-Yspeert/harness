import { spawn, type ChildProcessByStdio } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import type { Readable } from "node:stream";

import { WebSocket, type RawData } from "ws";

// Support code for spike 003 hidden tests. Not itself a set of evaluation
// cases; see manifest.json.

export const HARNESS_ROOT = path.resolve(
  import.meta.dirname,
  "../../../../harness",
);
export const HARNESS_ENTRY = path.join(HARNESS_ROOT, "src/index.ts");

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

export type AttachResult =
  { ok: true; socket: WebSocket } | { ok: false; status: number };

export function attemptAttach(
  url: string,
  timeoutMs = 5000,
): Promise<AttachResult> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      socket.terminate();
      reject(new Error(`Timed out attempting to attach to ${url}`));
    }, timeoutMs);

    const onOpen = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ ok: true, socket });
    };

    const onUnexpectedResponse = (
      _req: unknown,
      res: { statusCode?: number },
    ): void => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        socket.terminate();
      } catch {
        // already closed
      }
      resolve({ ok: false, status: res.statusCode ?? -1 });
    };

    const onError = (error: Error): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    function cleanup(): void {
      clearTimeout(timer);
      socket.off("open", onOpen);
      socket.off("unexpected-response", onUnexpectedResponse as never);
      socket.off("error", onError);
    }

    socket.on("open", onOpen);
    socket.on("unexpected-response", onUnexpectedResponse as never);
    socket.on("error", onError);
  });
}

export async function connect(url: string): Promise<WebSocket> {
  const result = await attemptAttach(url);
  if (!result.ok) {
    throw new Error(
      `Expected attach to succeed at ${url}, got status ${result.status}`,
    );
  }
  return result.socket;
}

export function waitForClose(
  socket: WebSocket,
  timeoutMs = 5000,
): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("close", onClose);
      reject(new Error("Timed out waiting for socket close"));
    }, timeoutMs);
    function onClose(): void {
      clearTimeout(timer);
      resolve();
    }
    socket.once("close", onClose);
  });
}

export async function disconnect(socket: WebSocket): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return;
  const closed = waitForClose(socket);
  socket.close();
  await closed;
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
  const match = await sendAndWait(
    socket,
    "echo __HARNESS_PID__:$BASHPID",
    /__HARNESS_PID__:(\d+)\r?\n/,
  );
  return Number(match[1]);
}

export async function spawnBackgroundJob(
  socket: WebSocket,
  command: string,
): Promise<number> {
  const match = await sendAndWait(
    socket,
    `(${command}) & echo __HARNESS_BGPID__:$!`,
    /__HARNESS_BGPID__:(\d+)\r?\n/,
  );
  return Number(match[1]);
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
