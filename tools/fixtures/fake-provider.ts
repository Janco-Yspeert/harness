// Deterministic stand-in for the Claude/Codex CLIs in offline tests. It is
// started only through the governed host's programmatic `spawnProvider` test
// seam, never by production configuration. It reads the adapter's real
// provider arguments, starts the real repository-owned worker tool server
// they name, speaks MCP to it, and emits scripted provider events.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

interface Step {
  tool: string;
  args?: Record<string, unknown>;
  promotion?: {
    candidate?: string;
    attempt?: number;
    identity?: string;
  };
}
interface Scenario {
  evidence: string;
  steps?: Step[];
  exit?: number;
  model?: string;
  mcpStatus?: string;
  denials?: Array<{ tool_name: string }>;
  events?: unknown[];
  hang?: boolean;
  resultError?: boolean;
}

const [scenarioPath, program, ...args] = process.argv.slice(2);
if (!scenarioPath || !program) throw new Error("fake provider usage");
const scenario = JSON.parse(readFileSync(scenarioPath, "utf8")) as Scenario;
const claude = program.endsWith("claude");
const emit = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value)}\n`);
};
const evidence: Record<string, unknown> = {
  pid: process.pid,
  argv: [program, ...args],
  envKeys: Object.keys(process.env).sort(),
  cwd: process.cwd(),
};
const save = (): void => {
  writeFileSync(scenario.evidence, JSON.stringify(evidence, null, 2));
};

function server(): {
  command: string;
  args: string[];
  env: Record<string, string>;
} {
  if (claude) {
    const config = JSON.parse(
      args[args.indexOf("--mcp-config") + 1] ?? "{}",
    ) as {
      mcpServers: Record<
        string,
        { command: string; args: string[]; env: Record<string, string> }
      >;
    };
    const harness = config.mcpServers.harness;
    if (!harness) throw new Error("no harness tool server");
    return { command: harness.command, args: harness.args, env: harness.env };
  }
  const value = (key: string): string => {
    const entry = args.find((arg) =>
      arg.startsWith(`mcp_servers.harness.${key}=`),
    );
    if (!entry) throw new Error(`no codex ${key}`);
    return entry.slice(`mcp_servers.harness.${key}=`.length);
  };
  const env: Record<string, string> = {};
  for (const [, key, quoted] of value("env").matchAll(/(\w+)=("[^"]*")/g))
    if (key && quoted) env[key] = JSON.parse(quoted) as string;
  return {
    command: JSON.parse(value("command")) as string,
    args: JSON.parse(value("args")) as string[],
    env,
  };
}

// Provider behaviour observed in the 014c live smoke: Claude safe mode loads
// no MCP server at all, and Codex under approval_policy="never" declines MCP
// tool calls that are not pre-approved.
const toolsLoaded = !(claude && args.includes("--safe-mode"));
const toolsApproved =
  claude ||
  args.includes('mcp_servers.harness.default_tools_approval_mode="approve"');

if (claude)
  emit({
    type: "system",
    subtype: "init",
    model: scenario.model ?? "fake-model",
    claude_code_version: "0.0.0-fake",
    mcp_servers: toolsLoaded
      ? [{ name: "harness", status: scenario.mcpStatus ?? "connected" }]
      : [],
  });
else emit({ type: "thread.started", thread_id: "fake" });
await new Promise((wait) => setTimeout(wait, 150));

if (scenario.hang) {
  save();
  setInterval(() => undefined, 1000);
} else if (!toolsLoaded || !toolsApproved) {
  for (const step of scenario.steps ?? [])
    if (!claude)
      emit({
        type: "item.completed",
        item: {
          type: "mcp_tool_call",
          server: "harness",
          tool: step.tool,
          status: "failed",
        },
      });
  if (claude)
    emit({
      type: "result",
      subtype: "success",
      is_error: false,
      permission_denials: [],
    });
  else emit({ type: "turn.completed" });
  save();
} else {
  const tools = server();
  const child = spawn(tools.command, tools.args, {
    env: { ...process.env, ...tools.env },
    stdio: ["pipe", "pipe", "inherit"],
  });
  const pending = new Map<number, (value: unknown) => void>();
  createInterface({ input: child.stdout }).on("line", (line) => {
    const message = JSON.parse(line) as { id: number; result?: unknown };
    pending.get(message.id)?.(message.result);
  });
  let next = 0;
  const rpc = (method: string, params: unknown): Promise<unknown> =>
    new Promise((resolve) => {
      next += 1;
      pending.set(next, resolve);
      child.stdin.write(
        `${JSON.stringify({ jsonrpc: "2.0", id: next, method, params })}\n`,
      );
    });
  await rpc("initialize", { protocolVersion: "2025-06-18" });
  child.stdin.write(
    `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`,
  );
  evidence.tools = await rpc("tools/list", {});
  const results: unknown[] = [];
  let assignment: Record<string, unknown> | undefined;
  for (const step of scenario.steps ?? []) {
    let input = step.args ?? {};
    if (step.promotion && !assignment) {
      const read = (await rpc("tools/call", {
        name: "assignment",
        arguments: {},
      })) as { structuredContent?: unknown };
      assignment = read.structuredContent as Record<string, unknown>;
    }
    if (step.promotion) {
      const grant = assignment?.roleGrant as {
        hostActions: { promotion?: { candidate: string } };
        workspaces: Array<{ id: string; path: string }>;
      };
      const repository = grant.workspaces.find(
        (workspace) => workspace.id === "smoke-repository",
      );
      const plan = JSON.parse(
        readFileSync(join(repository?.path ?? "", "smoke-plan.json"), "utf8"),
      ) as {
        revision: string;
        attempt: number;
        artifacts: Array<{ identity: string }>;
      };
      input = {
        kind: "promotion",
        candidate:
          step.promotion.candidate ??
          grant.hostActions.promotion?.candidate ??
          "none",
        evaluatorRevision: plan.revision,
        attempt: step.promotion.attempt ?? plan.attempt,
        artifacts: plan.artifacts.map((artifact) => ({
          ...artifact,
          identity: step.promotion?.identity ?? artifact.identity,
        })),
      };
    }
    const result = (await rpc("tools/call", {
      name: step.tool,
      arguments: input,
    })) as { structuredContent?: unknown; isError?: boolean };
    if (step.tool === "assignment" && !result.isError)
      assignment = result.structuredContent as Record<string, unknown>;
    results.push(result);
  }
  evidence.results = results;
  child.kill();
  for (const event of scenario.events ?? []) emit(event);
  if (claude)
    emit({
      type: "result",
      subtype: scenario.resultError ? "error_during_execution" : "success",
      is_error: scenario.resultError === true,
      permission_denials: scenario.denials ?? [],
    });
  else emit({ type: "turn.completed" });
  save();
  process.exitCode = scenario.exit ?? 0;
}
