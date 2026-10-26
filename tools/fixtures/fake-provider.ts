// Deterministic stand-in for the Claude/Codex CLIs in offline tests. It is
// started only through the governed host's programmatic `spawnProvider` test
// seam, never by production configuration. It reads the adapter's real
// provider arguments, starts the real repository-owned worker tool server
// they name, speaks MCP to it, and emits scripted provider events.
//
// Role-keyed scripts (`roles`) are scripted compliance with a role's fidelity
// matrix row: they write the row's artifacts inside granted workspaces, make
// its local commit, submit its typed result and request its host action. They
// are never evidence of real provider behavior.
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

interface Step {
  tool?: string;
  args?: Record<string, unknown>;
  promotion?: {
    candidate?: string;
    attempt?: number;
    identity?: string;
    // Derive the request from the real persisted plan via the archive utility.
    fromPlan?: boolean;
    // Test-only mutations of the derived request.
    omitPlan?: boolean;
    // Pad the derived mappings up to exactly this many (e.g. B + 1).
    padTo?: number;
  };
  // Write a file inside a granted workspace; `{{input:NAME}}`,
  // `{{identity:WORKSPACE:PATH}}` and `{{json:WORKSPACE:PATH:/pointer}}` are
  // substituted from the assignment and existing fixture state.
  write?: {
    workspace: "repository" | "private";
    path: string;
    content: string;
  };
  // Commit paths in the repository workspace as a local checkpoint.
  commit?: { message: string; paths: string[] };
}
interface Scenario {
  evidence: string;
  roles?: Record<string, Step[]>;
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
  let steps = scenario.steps ?? [];
  if (scenario.roles) {
    const read = (await rpc("tools/call", {
      name: "assignment",
      arguments: {},
    })) as { structuredContent?: unknown };
    assignment = read.structuredContent as Record<string, unknown>;
    results.push(read);
    const role = (assignment.roleGrant as { role: string }).role;
    // The nth execution of a role may follow its own script (`role#n`).
    const counter = `${scenario.evidence}.${role}.count`;
    let occurrence = 1;
    try {
      occurrence = Number(readFileSync(counter, "utf8")) + 1;
    } catch {
      /* first execution of this role */
    }
    writeFileSync(counter, String(occurrence));
    steps =
      scenario.roles[`${role}#${String(occurrence)}`] ??
      scenario.roles[role] ??
      [];
    scenario.evidence = `${scenario.evidence}.${role}.${String(occurrence)}.json`;
  }
  const workspaceRoot = (name: "repository" | "private"): string => {
    const grant = assignment?.roleGrant as {
      workspaces: Array<{ path: string; exposure: string }>;
    };
    const found = grant.workspaces.find((workspace) =>
      name === "repository"
        ? workspace.exposure === "public"
        : workspace.exposure !== "public",
    );
    if (!found) throw new Error(`no granted ${name} workspace`);
    return found.path;
  };
  const substitute = (content: string): string =>
    content
      .replaceAll(
        /\{\{json:(repository|private):([^:}]+):([^}]+)\}\}/g,
        (
          _,
          workspace: "repository" | "private",
          path: string,
          pointer: string,
        ) => {
          let value: unknown = JSON.parse(
            readFileSync(join(workspaceRoot(workspace), path), "utf8"),
          );
          for (const segment of pointer.split("/").slice(1)) {
            if (value === null || typeof value !== "object")
              throw new Error(`fixture JSON pointer is unresolved: ${pointer}`);
            value = (value as Record<string, unknown>)[segment];
          }
          if (typeof value !== "string")
            throw new Error(`fixture JSON pointer is not a string: ${pointer}`);
          return value;
        },
      )
      .replaceAll(/\{\{input:([\w-]+)\}\}/g, (_, name: string) => {
        const inputs = assignment?.inputs as Record<string, string>;
        return inputs[name] ?? "";
      })
      .replaceAll(
        /\{\{identity:(repository|private):([^}]+)\}\}/g,
        (_, workspace: "repository" | "private", path: string) =>
          `sha256:${createHash("sha256")
            .update(readFileSync(join(workspaceRoot(workspace), path)))
            .digest("hex")}`,
      );
  for (const step of steps) {
    if (step.write) {
      const target = join(workspaceRoot(step.write.workspace), step.write.path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, substitute(step.write.content));
      continue;
    }
    if (step.commit) {
      const env = {
        ...process.env,
        GIT_AUTHOR_NAME: "Scripted worker",
        GIT_AUTHOR_EMAIL: "scripted-worker@example.invalid",
        GIT_COMMITTER_NAME: "Scripted worker",
        GIT_COMMITTER_EMAIL: "scripted-worker@example.invalid",
      };
      const cwd = workspaceRoot("repository");
      execFileSync("git", ["add", "--", ...step.commit.paths], { cwd, env });
      execFileSync("git", ["commit", "-q", "-m", step.commit.message], {
        cwd,
        env,
      });
      results.push({
        commit: execFileSync("git", ["rev-parse", "HEAD"], {
          cwd,
          encoding: "utf8",
        }).trim(),
      });
      continue;
    }
    if (step.promotion?.fromPlan) {
      // Host-derived archive: request the exact identities only; the host
      // derives every artifact. No evaluator plan or artifact list is sent.
      if (!assignment) {
        const read = (await rpc("tools/call", {
          name: "assignment",
          arguments: {},
        })) as { structuredContent?: unknown };
        assignment = read.structuredContent as Record<string, unknown>;
      }
      const allowed = (
        assignment.roleGrant as {
          hostActions: {
            promotion?: { candidate: string; evaluatorRevision: string };
          };
        }
      ).hostActions.promotion;
      const ledger = JSON.parse(
        readFileSync(
          join(workspaceRoot("private"), ".eval/attempt-ledger.json"),
          "utf8",
        ),
      ) as { attempts: unknown[] };
      const response = (await rpc("tools/call", {
        name: "requestAction",
        arguments: {
          kind: "promotion",
          candidate: step.promotion.candidate ?? allowed?.candidate,
          evaluatorRevision: allowed?.evaluatorRevision,
          attempt: step.promotion.attempt ?? ledger.attempts.length,
        },
      })) as { structuredContent?: unknown; isError?: boolean };
      results.push({ response });
      continue;
    }
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
    if (!step.tool) throw new Error("scripted step names no tool");
    if (step.args)
      input = JSON.parse(substitute(JSON.stringify(step.args))) as Record<
        string,
        unknown
      >;
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
