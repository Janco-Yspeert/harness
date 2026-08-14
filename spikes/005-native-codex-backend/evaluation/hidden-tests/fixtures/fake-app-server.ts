// Deterministic App Server peer for Spike 005 hidden-test evaluation.
//
// This script is `fork()`-ed as a real, separate Node.js child process (see
// helpers.ts's `makeFakeAppServer`). It speaks the real, empirically
// confirmed App Server wire protocol — one JSON-RPC message per line,
// terminated by `\n` — on its own stdin/stdout, exactly as the real local
// `codex app-server --stdio` process does. The Codex-backend implementation
// under test only ever sees that stdio channel.
//
// A second, entirely separate channel — Node's built-in IPC channel,
// available because this script is `fork()`-ed rather than plain-`spawn()`-ed
// — carries test-control traffic in both directions: this script reports
// every JSON-RPC request it receives up to the parent test process, and the
// parent test process commands exactly when and how to respond, and what
// notifications to emit, and when to exit. The implementation under test has
// no visibility into this control channel.
//
// This script deliberately contains no Codex-specific choreography (no
// knowledge of "turns" or "threads" as concepts) — it is a generic,
// controllable JSON-RPC-over-newline-delimited-stdio responder. All
// Codex-specific request/response shaping lives in helpers.ts, on the parent
// side, where it can be reviewed and unit-tested independently of this
// process-boundary plumbing.

import { createInterface } from "node:readline";

interface JsonRpcRequestLike {
  id: unknown;
  method: string;
  params?: unknown;
}

type ControlCommand =
  | { cmd: "respond"; id: unknown; result: unknown }
  | {
      cmd: "respondError";
      id: unknown;
      error: { code: number; message: string; data?: unknown };
    }
  | { cmd: "notify"; method: string; params: unknown }
  | { cmd: "exit"; code?: number }
  | { cmd: "ignoreSigterm" };

let ignoringSigterm = false;

process.on("SIGTERM", () => {
  if (!ignoringSigterm) {
    process.exit(0);
  }
  // Otherwise: deliberately do nothing. Used by the bounded-fallback-failure
  // case (E24) to simulate a backend process that does not exit gracefully.
});

function writeLine(payload: unknown): void {
  process.stdout.write(JSON.stringify(payload) + "\n");
}

function report(event: unknown): void {
  process.send?.(event);
}

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });

lines.on("line", (line) => {
  const trimmed = line.trim();
  if (trimmed.length === 0) return;

  let message: unknown;
  try {
    message = JSON.parse(trimmed);
  } catch {
    report({ event: "parseError", line: trimmed });
    return;
  }

  if (
    typeof message === "object" &&
    message !== null &&
    "method" in message &&
    "id" in message
  ) {
    const request = message as JsonRpcRequestLike;
    report({
      event: "request",
      id: request.id,
      method: request.method,
      params: request.params,
    });
  } else {
    report({ event: "unrecognized", message });
  }
});

process.on("message", (raw: unknown) => {
  const command = raw as ControlCommand;
  switch (command.cmd) {
    case "respond":
      writeLine({ id: command.id, result: command.result });
      break;
    case "respondError":
      writeLine({ id: command.id, error: command.error });
      break;
    case "notify":
      writeLine({ method: command.method, params: command.params });
      break;
    case "exit":
      process.exit(command.code ?? 1);
      break;
    case "ignoreSigterm":
      ignoringSigterm = true;
      break;
  }
});

report({ event: "ready" });
