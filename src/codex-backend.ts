import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import type { Writable } from "node:stream";

import type {
  BackendInputResult,
  HarnessErrorMessage,
  SessionBackend,
} from "./session-backend.ts";

const DEFAULT_INTERRUPT_GRACE_MS = 5_000;
const PROCESS_EXIT_GRACE_MS = 1_000;

export interface AppServerProcess {
  readonly stdin: NodeJS.WritableStream;
  readonly stdout: NodeJS.ReadableStream;
  readonly stderr?: NodeJS.ReadableStream;
  readonly pid?: number | undefined;
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

interface JsonObject {
  [key: string]: unknown;
}

interface PendingRequest {
  readonly method: string;
  readonly resolve: (result: unknown) => void;
  readonly reject: (error: Error) => void;
}

class AppServerRequestError extends Error {
  constructor(method: string, code: unknown) {
    super(
      `Codex App Server request ${method} failed` +
        (typeof code === "number" ? ` (code ${String(code)})` : ""),
    );
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, key: string): string | undefined {
  return isObject(value) && typeof value[key] === "string"
    ? value[key]
    : undefined;
}

function defaultSpawnAppServer(): AppServerProcess {
  return spawn("codex", ["app-server", "--stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
}

export async function createCodexBackend(
  options: CodexBackendOptions = {},
): Promise<SessionBackend> {
  const backend = new CodexBackend(options);
  await backend.start();
  return backend;
}

class CodexBackend implements SessionBackend {
  readonly #process: AppServerProcess;
  readonly #cwd: string;
  readonly #interruptGraceMs: number;
  readonly #pending = new Map<number, PendingRequest>();
  readonly #messageItemsWithDeltas = new Set<string>();
  readonly #completedTurns = new Map<string, string>();
  readonly #exited: Promise<void>;
  #resolveExited!: () => void;
  #nextRequestId = 1;
  #threadId: string | undefined;
  #turnId: string | undefined;
  #busy = false;
  #hasExited = false;
  #stopping = false;
  #stopPromise: Promise<void> | undefined;
  #interruptedTurn: Promise<void> | undefined;
  #resolveInterruptedTurn: (() => void) | undefined;
  #dataListener: ((output: string) => void) | undefined;
  #errorListener: ((error: HarnessErrorMessage) => void) | undefined;
  #exitListener: (() => void) | undefined;

  constructor(options: CodexBackendOptions) {
    this.#cwd = resolve(options.cwd ?? process.cwd());
    this.#interruptGraceMs =
      options.interruptGraceMs ?? DEFAULT_INTERRUPT_GRACE_MS;
    this.#process = (options.spawnAppServer ?? defaultSpawnAppServer)();
    this.#exited = new Promise<void>((resolveExited) => {
      this.#resolveExited = resolveExited;
    });

    const lines = createInterface({ input: this.#process.stdout });
    lines.on("line", (line) => {
      this.#receiveLine(line);
    });
    this.#process.stderr?.on("data", () => {
      console.warn("Codex App Server produced diagnostic output on stderr");
    });
    this.#process.on("exit", (code, signal) => {
      this.#hasExited = true;
      this.#resolveExited();
      const error = new Error(
        `Codex App Server exited (code ${String(code)}, signal ${String(signal)})`,
      );
      for (const request of this.#pending.values()) request.reject(error);
      this.#pending.clear();
      this.#resolveInterruptedTurn?.();
      if (!this.#stopping) {
        console.error("Codex App Server backend terminated", {
          code,
          signal,
        });
        this.#exitListener?.();
      }
    });
    const processWithErrors = this.#process as AppServerProcess & {
      once?: (event: "error", listener: () => void) => unknown;
    };
    processWithErrors.once?.("error", () => {
      console.error("Codex App Server process could not be started");
    });
  }

  async start(): Promise<void> {
    try {
      await this.#request("initialize", {
        clientInfo: {
          name: "harness",
          title: "Harness",
          version: "0.0.0",
        },
      });
      this.#notify("initialized", {});
      const result = await this.#request("thread/start", {
        cwd: this.#cwd,
        approvalPolicy: "never",
        sandbox: "read-only",
        serviceName: "harness",
      });
      const threadId = readString(
        isObject(result) ? result.thread : undefined,
        "id",
      );
      if (threadId === undefined) {
        throw new Error("Codex App Server returned no thread id");
      }
      this.#threadId = threadId;
    } catch (error) {
      console.error("Codex backend startup failed", diagnostic(error));
      this.#stopping = true;
      await this.#terminateProcess();
      throw new Error("Codex backend startup failed", { cause: error });
    }
  }

  write(input: string): BackendInputResult {
    if (this.#busy) {
      return {
        accepted: false,
        error: {
          type: "error",
          code: "turn_active",
          data: "Codex is already working on a turn.",
        },
      };
    }

    const threadId = this.#threadId;
    if (threadId === undefined || this.#stopping || this.#hasExited) {
      return {
        accepted: false,
        error: turnStartFailed(),
      };
    }

    this.#busy = true;
    const text = input.endsWith("\r") ? input.slice(0, -1) : input;
    void this.#startTurn(threadId, text);
    return { accepted: true };
  }

  onData(listener: (output: string) => void): void {
    this.#dataListener = listener;
  }

  onError(listener: (error: HarnessErrorMessage) => void): void {
    this.#errorListener = listener;
  }

  onExit(listener: () => void): void {
    this.#exitListener = listener;
    if (this.#hasExited && !this.#stopping) queueMicrotask(listener);
  }

  stop(): Promise<void> {
    this.#stopPromise ??= this.#stop();
    return this.#stopPromise;
  }

  async #startTurn(threadId: string, text: string): Promise<void> {
    try {
      const result = await this.#request("turn/start", {
        threadId,
        input: [{ type: "text", text }],
      });
      const turnId = readString(
        isObject(result) ? result.turn : undefined,
        "id",
      );
      if (turnId === undefined)
        throw new Error("turn/start returned no turn id");
      this.#turnId = turnId;
      const completedStatus = this.#completedTurns.get(turnId);
      if (completedStatus !== undefined)
        this.#finishTurn(turnId, completedStatus);
    } catch (error) {
      if (this.#stopping) return;
      this.#busy = false;
      this.#turnId = undefined;
      console.error("Codex turn start failed", diagnostic(error));
      this.#errorListener?.(turnStartFailed());
    }
  }

  async #stop(): Promise<void> {
    this.#stopping = true;
    const turnId = this.#turnId;
    const threadId = this.#threadId;

    if (this.#busy && turnId !== undefined && threadId !== undefined) {
      this.#interruptedTurn = new Promise<void>((resolve) => {
        this.#resolveInterruptedTurn = resolve;
      });
      const graceful = Promise.all([
        this.#request("turn/interrupt", { threadId, turnId }),
        this.#interruptedTurn,
      ]).then(
        () => true,
        () => false,
      );
      await Promise.race([
        graceful,
        new Promise<false>((resolveTimeout) => {
          setTimeout(() => {
            resolveTimeout(false);
          }, this.#interruptGraceMs);
        }),
      ]);
    }

    await this.#terminateProcess();
  }

  async #terminateProcess(): Promise<void> {
    if (this.#hasExited) return;
    this.#process.kill("SIGTERM");
    if (await this.#waitForExit(PROCESS_EXIT_GRACE_MS)) return;

    this.#process.kill("SIGKILL");
    if (await this.#waitForExit(PROCESS_EXIT_GRACE_MS)) return;

    throw new Error("Codex App Server could not be terminated");
  }

  #waitForExit(timeoutMs: number): Promise<boolean> {
    if (this.#hasExited) return Promise.resolve(true);

    return new Promise<boolean>((resolveExit) => {
      const timeout = setTimeout(() => {
        resolveExit(false);
      }, timeoutMs);
      void this.#exited.then(() => {
        clearTimeout(timeout);
        resolveExit(true);
      });
    });
  }

  #request(method: string, params: JsonObject): Promise<unknown> {
    if (this.#hasExited) return Promise.reject(new Error("App Server exited"));
    const id = this.#nextRequestId++;
    const promise = new Promise<unknown>((resolve, reject) => {
      this.#pending.set(id, { method, resolve, reject });
    });
    this.#send({ method, id, params });
    return promise;
  }

  #notify(method: string, params: JsonObject): void {
    this.#send({ method, params });
  }

  #send(message: JsonObject): void {
    (this.#process.stdin as Writable).write(`${JSON.stringify(message)}\n`);
  }

  #receiveLine(line: string): void {
    let message: unknown;
    try {
      message = JSON.parse(line);
    } catch {
      console.error("Codex App Server sent invalid JSON");
      return;
    }
    if (!isObject(message)) return;

    if (typeof message.id === "number") {
      const pending = this.#pending.get(message.id);
      if (pending === undefined) return;
      this.#pending.delete(message.id);
      if (isObject(message.error)) {
        pending.reject(
          new AppServerRequestError(pending.method, message.error.code),
        );
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (typeof message.method === "string") {
      this.#notification(message.method, message.params);
    }
  }

  #notification(method: string, params: unknown): void {
    if (
      !isObject(params) ||
      readString(params, "threadId") !== this.#threadId
    ) {
      return;
    }

    if (method === "item/agentMessage/delta") {
      const itemId = readString(params, "itemId");
      const delta = readString(params, "delta");
      if (itemId !== undefined && delta !== undefined) {
        this.#messageItemsWithDeltas.add(itemId);
        this.#dataListener?.(delta);
      }
      return;
    }

    if (method === "item/completed" && isObject(params.item)) {
      const itemId = readString(params.item, "id");
      if (
        params.item.type === "agentMessage" &&
        itemId !== undefined &&
        !this.#messageItemsWithDeltas.has(itemId)
      ) {
        const text = readString(params.item, "text");
        if (text !== undefined) this.#dataListener?.(text);
      }
      if (itemId !== undefined) this.#messageItemsWithDeltas.delete(itemId);
      return;
    }

    if (method === "turn/completed" && isObject(params.turn)) {
      const completedTurnId = readString(params.turn, "id");
      const status = readString(params.turn, "status");
      if (completedTurnId !== undefined && status !== undefined) {
        if (completedTurnId === this.#turnId) {
          this.#finishTurn(completedTurnId, status);
        } else if (this.#busy && this.#turnId === undefined) {
          this.#completedTurns.set(completedTurnId, status);
        }
      }
    }
  }

  #finishTurn(turnId: string, status: string): void {
    this.#completedTurns.delete(turnId);
    this.#busy = false;
    this.#turnId = undefined;
    if (status === "interrupted") this.#resolveInterruptedTurn?.();
  }
}

function turnStartFailed(): HarnessErrorMessage {
  return {
    type: "error",
    code: "turn_start_failed",
    data: "Codex could not start the turn.",
  };
}

function diagnostic(error: unknown): { name: string; message: string } {
  if (error instanceof AppServerRequestError) {
    return { name: error.name, message: error.message };
  }
  if (error instanceof Error) {
    return { name: error.name, message: "Codex operation failed" };
  }
  return { name: "Error", message: "Codex operation failed" };
}
