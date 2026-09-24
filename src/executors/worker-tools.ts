// Repository-owned Harness worker tool server (MCP over stdio).
//
// A registered provider adapter starts this exact file as the provider's only
// Harness tool server. It exposes the four version 1 worker operations and
// relays each call over loopback to its adapter's per-execution relay, which
// holds the host session credential and binds every call to its own
// execution. This process receives only a relay key that is scoped to those
// four operations for that one execution; it never receives a host credential,
// never chooses an execution, and has no behaviour beyond typed relay.
import { createConnection } from "node:net";
import { createInterface } from "node:readline";
import {
  WORKER_OPERATIONS,
  WORKER_PROTOCOL_SCHEMAS,
  WORKER_PROTOCOL_VERSION,
  type WorkerOperation,
} from "./protocol.ts";

const MAX_LINE = 1_048_576;
const DEFAULT_MCP_VERSION = "2025-06-18";

export interface RelayTarget {
  port: number;
  key: string;
}

export function relayCall(
  relay: RelayTarget,
  operation: WorkerOperation,
  input: unknown,
): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port: relay.port });
    let buffer = "";
    const done = (
      value: { ok: true; value: unknown } | { ok: false; error: string },
    ): void => {
      socket.destroy();
      resolve(value);
    };
    socket.setEncoding("utf8");
    socket.on("connect", () => {
      socket.write(`${JSON.stringify({ key: relay.key, operation, input })}\n`);
    });
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      if (buffer.length > MAX_LINE) {
        done({ ok: false, error: "relay response too large" });
        return;
      }
      const end = buffer.indexOf("\n");
      if (end < 0) return;
      try {
        const parsed = JSON.parse(buffer.slice(0, end)) as {
          ok?: unknown;
          value?: unknown;
          error?: unknown;
        };
        done(
          parsed.ok === true
            ? { ok: true, value: parsed.value }
            : {
                ok: false,
                error:
                  typeof parsed.error === "string"
                    ? parsed.error
                    : "relay request failed",
              },
        );
      } catch {
        done({ ok: false, error: "malformed relay response" });
      }
    });
    socket.on("error", () => {
      done({ ok: false, error: "Harness relay unavailable" });
    });
    socket.on("end", () => {
      done({ ok: false, error: "Harness relay closed" });
    });
  });
}

export function toolDefinitions(): Array<{
  name: string;
  description: string;
  inputSchema: unknown;
}> {
  return WORKER_OPERATIONS.map((name) => ({
    name,
    description: `Harness worker protocol v${String(WORKER_PROTOCOL_VERSION)}: ${WORKER_PROTOCOL_SCHEMAS.operations[name].description}`,
    inputSchema: WORKER_PROTOCOL_SCHEMAS.operations[name].request,
  }));
}

type RpcMessage = {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
};

export async function handleMessage(
  relay: RelayTarget,
  message: RpcMessage,
): Promise<object | undefined> {
  const id = message.id;
  const reply = (result: object): object => ({ jsonrpc: "2.0", id, result });
  if (typeof message.method !== "string") return undefined;
  if (id === undefined || id === null) return undefined; // notification
  const params =
    message.params !== null && typeof message.params === "object"
      ? (message.params as Record<string, unknown>)
      : {};
  switch (message.method) {
    case "initialize":
      return reply({
        protocolVersion:
          typeof params.protocolVersion === "string"
            ? params.protocolVersion
            : DEFAULT_MCP_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: "harness",
          version: String(WORKER_PROTOCOL_VERSION),
        },
      });
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: toolDefinitions() });
    case "tools/call": {
      const name = params.name;
      if (
        typeof name !== "string" ||
        !(WORKER_OPERATIONS as readonly string[]).includes(name)
      )
        return reply({
          content: [{ type: "text", text: "unknown Harness operation" }],
          isError: true,
        });
      const outcome = await relayCall(
        relay,
        name as WorkerOperation,
        params.arguments ?? {},
      );
      return reply(
        outcome.ok
          ? {
              content: [{ type: "text", text: JSON.stringify(outcome.value) }],
              structuredContent: outcome.value,
              isError: false,
            }
          : {
              content: [{ type: "text", text: outcome.error }],
              isError: true,
            },
      );
    }
    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "method not found" },
      };
  }
}

function main(): void {
  const port = Number(process.env.HARNESS_WORKER_RELAY);
  const key = process.env.HARNESS_WORKER_RELAY_KEY;
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535 || !key) {
    process.stderr.write(
      "HARNESS_WORKER_RELAY and HARNESS_WORKER_RELAY_KEY are required\n",
    );
    process.exitCode = 2;
    return;
  }
  const relay = { port, key };
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  lines.on("line", (line) => {
    if (!line.trim() || line.length > MAX_LINE) return;
    let message: RpcMessage;
    try {
      message = JSON.parse(line) as RpcMessage;
    } catch {
      process.stdout.write(
        `${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } })}\n`,
      );
      return;
    }
    void handleMessage(relay, message).then((response) => {
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    });
  });
}

if (import.meta.main) main();
