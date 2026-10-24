// Material-free MCP server used only by the pre-semantic readiness process.
// It proves that the provider can start and invoke the configured Harness tool
// endpoint without exposing worker operations or any governed assignment.
import { createInterface } from "node:readline";

const MCP_VERSION = "2025-06-18";

interface Message {
  id?: unknown;
  method?: unknown;
  params?: unknown;
}

function reply(message: Message): object | undefined {
  if (message.id === undefined || message.id === null) return undefined;
  const base = { jsonrpc: "2.0", id: message.id };
  if (message.method === "initialize")
    return {
      ...base,
      result: {
        protocolVersion: MCP_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "harness", version: "readiness-v1" },
      },
    };
  if (message.method === "ping") return { ...base, result: {} };
  if (message.method === "tools/list")
    return {
      ...base,
      result: {
        tools: [
          {
            name: "readiness",
            description:
              "Return the fixed material-free Harness readiness result.",
            inputSchema: {
              type: "object",
              additionalProperties: false,
              properties: {},
            },
          },
        ],
      },
    };
  if (message.method === "tools/call") {
    const params =
      message.params !== null && typeof message.params === "object"
        ? (message.params as Record<string, unknown>)
        : {};
    if (params.name === "readiness")
      return {
        ...base,
        result: {
          content: [{ type: "text", text: "HARNESS_READINESS_PASS" }],
          structuredContent: { ready: true },
          isError: false,
        },
      };
    return {
      ...base,
      result: {
        content: [{ type: "text", text: "unknown readiness operation" }],
        isError: true,
      },
    };
  }
  return {
    ...base,
    error: { code: -32601, message: "method not found" },
  };
}

const lines = createInterface({ input: process.stdin });
lines.on("line", (line) => {
  try {
    const message = JSON.parse(line) as Message;
    const response = reply(message);
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } })}\n`,
    );
  }
});
