import { spawn, type ChildProcessByStdio } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";

import {
  buildClaudeWorkflowCommand,
  claudeWorkflowDirectory,
} from "./claude-workflow.ts";

import type {
  ResolvedWorkflowRunSpec,
  WorkflowBackendRoleResult,
  WorkflowRunBackend,
  WorkflowRunBackendContext,
  WorkflowRunExitOutcome,
} from "./workflow-run.ts";

type PipedChildProcess = ChildProcessByStdio<null, Readable, Readable>;

const TERMINATE_GRACE_MS = 2_000;

// Bootstrap local workflow backend. It launches a supported executor inside an
// explicitly named, workspace-bounded provider mode. It must never use an
// unrestricted-host bypass (`codex --dangerously-bypass-approvals-and-sandbox`,
// `claude --dangerously-skip-permissions` / bypassPermissions). A narrow
// bootstrap exception would have to be explicit in the Design Map and the run
// record; this default is bounded.
const FORBIDDEN_EXECUTOR_FLAGS = [
  "--dangerously-bypass-approvals-and-sandbox",
  "--dangerously-skip-permissions",
  "bypassPermissions",
];

const RESULT_PREFIX = "HARNESS_ROLE_RESULT ";

function executionPrompt(spec: ResolvedWorkflowRunSpec): string {
  const providerTask =
    spec.prompt ??
    `Perform the ${spec.role} workflow role for this repository.`;
  return `${providerTask}

[HARNESS EXECUTION BINDING]
This is a mechanically authorized Harness allocation for role ${spec.role}.
Load and follow exactly ${spec.contract.path} (contract ${spec.contract.name} v${spec.contract.version}, ${spec.contract.identity}).
Contract delivery mode: ${spec.contract.deliveryMode}.
The host, not this prompt or your prose, owns the binding and validates the result.
When the role reaches its semantic outcome, emit one final line in exactly this form:
${RESULT_PREFIX}{"disposition":"succeeded"}
Use "blocked", "refused", or "failed" instead of "succeeded" when appropriate, with an optional JSON string field named "reason". Do not report succeeded unless the contract's required output and checks are complete.`;
}

export function parseWorkflowBackendRoleResult(
  output: string,
): WorkflowBackendRoleResult | undefined {
  const line = output
    .split(/\r?\n/)
    .filter((candidate) => candidate.length > 0)
    .at(-1);
  if (line === undefined || !line.startsWith(RESULT_PREFIX)) return undefined;
  try {
    const value: unknown = JSON.parse(line.slice(RESULT_PREFIX.length));
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return undefined;
    const raw = value as Record<string, unknown>;
    if (
      !["succeeded", "blocked", "refused", "failed"].includes(
        String(raw.disposition),
      ) ||
      (raw.reason !== undefined && typeof raw.reason !== "string") ||
      !Object.keys(raw).every(
        (key) => key === "disposition" || key === "reason",
      )
    )
      return undefined;
    return {
      disposition: raw.disposition as WorkflowBackendRoleResult["disposition"],
      ...(raw.reason === undefined ? {} : { reason: raw.reason }),
    };
  } catch {
    return undefined;
  }
}

export function buildExecutorCommand(
  spec: ResolvedWorkflowRunSpec,
  scratchWorkspace?: string,
): readonly string[] {
  const workspaces = spec.permissionProfile.workspaces;
  const primary = workspaces[0] ?? process.cwd();
  const extraWorkspaces = workspaces.slice(1);
  const prompt =
    spec.contract.deliveryMode === "claude-system-contract"
      ? ""
      : executionPrompt(spec);

  let command: string[];
  if (spec.executor === "codex") {
    // `workspace-write` keeps writes inside the declared workspace(s). Current
    // Codex releases reject `--approve-for-me` when a sandbox is selected.
    command = [
      "codex",
      "exec",
      "--cd",
      primary,
      "--sandbox",
      "workspace-write",
      ...extraWorkspaces.flatMap((workspace) => ["--add-dir", workspace]),
      prompt,
    ];
  } else if (spec.executor === "claude") {
    command = buildClaudeWorkflowCommand(spec, prompt, scratchWorkspace);
  } else {
    throw new Error(`Unsupported workflow executor: ${spec.executor}`);
  }

  const forbidden = command.find((argument) =>
    FORBIDDEN_EXECUTOR_FLAGS.includes(argument),
  );
  if (forbidden !== undefined) {
    throw new Error(
      `Bounded workflow profile must not pass ${forbidden} to the executor`,
    );
  }
  return command;
}

export function workflowScratchEnvironment(
  scratchWorkspace: string,
): Record<string, string> {
  return {
    TMPDIR: scratchWorkspace,
    TMP: scratchWorkspace,
    TEMP: scratchWorkspace,
    XDG_CACHE_HOME: join(scratchWorkspace, "cache"),
    npm_config_cache: join(scratchWorkspace, "npm-cache"),
    npm_config_update_notifier: "false",
  };
}

// This setting belongs to the Harness daemon, not to a workflow allocation or
// evaluator environment. It lets an operator keep the provider installation
// outside a constrained worker PATH without handing that path to the worker.
export function workflowProviderProgram(
  spec: ResolvedWorkflowRunSpec,
  defaultProgram: string,
  configuredClaudeExecutable = process.env.HARNESS_CLAUDE_EXECUTABLE,
): string {
  return spec.executor === "claude" && configuredClaudeExecutable !== undefined
    ? configuredClaudeExecutable
    : defaultProgram;
}

function createWorkflowScratch(runId: string): string {
  const scratch = mkdtempSync(join(tmpdir(), `harness-workflow-${runId}-`));
  mkdirSync(join(scratch, "cache"));
  mkdirSync(join(scratch, "npm-cache"));
  return scratch;
}

class LocalWorkflowBackend implements WorkflowRunBackend {
  readonly pid: number | undefined;
  readonly scratchWorkspace: string | undefined;
  readonly #child: PipedChildProcess;
  readonly #cleanup: (() => void) | undefined;
  #activityListener: ((chunk: string) => void) | undefined;
  #exitListener: ((outcome: WorkflowRunExitOutcome) => void) | undefined;
  #settled = false;
  #stopping: Promise<void> | undefined;
  readonly #resultChunks: string[] = [];

  constructor(
    child: PipedChildProcess,
    scratchWorkspace?: string,
    cleanup?: () => void,
  ) {
    this.#child = child;
    this.pid = child.pid;
    this.scratchWorkspace = scratchWorkspace;
    this.#cleanup = cleanup;
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      this.#resultChunks.push(chunk);
      this.#activityListener?.(chunk);
    });
    child.stderr.on("data", (chunk: string) => this.#activityListener?.(chunk));
    child.on("error", (error) => {
      this.#settle({ ok: false, reason: error.message });
    });
    child.on("exit", (code, signal) => {
      this.#settle(
        code === 0
          ? {
              ok: true,
              roleResult: parseWorkflowBackendRoleResult(
                this.#resultChunks.join(""),
              ),
            }
          : {
              ok: false,
              reason: `executor exited (code ${String(code)}, signal ${String(signal)})`,
            },
      );
    });
    // A provider CLI may fail before the backend wrapper has attached its
    // listeners. Preserve that immediate terminal disposition instead of
    // leaving a host-owned run permanently marked running with a dead PID.
    if (child.exitCode !== null || child.signalCode !== null) {
      this.#settle(
        child.exitCode === 0
          ? {
              ok: true,
              roleResult: parseWorkflowBackendRoleResult(
                this.#resultChunks.join(""),
              ),
            }
          : {
              ok: false,
              reason: `executor exited (code ${String(child.exitCode)}, signal ${String(child.signalCode)})`,
            },
      );
    }
  }

  onActivity(listener: (chunk: string) => void): void {
    this.#activityListener = listener;
  }

  onExit(listener: (outcome: WorkflowRunExitOutcome) => void): void {
    this.#exitListener = listener;
  }

  stop(): Promise<void> {
    this.#stopping ??= this.#stop();
    return this.#stopping;
  }

  #settle(outcome: WorkflowRunExitOutcome): void {
    if (this.#settled) return;
    this.#settled = true;
    try {
      this.#exitListener?.(outcome);
    } finally {
      this.#cleanup?.();
    }
  }

  async #stop(): Promise<void> {
    if (this.#settled) return;
    this.#child.kill("SIGTERM");
    const exited = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        resolve(false);
      }, TERMINATE_GRACE_MS);
      this.#child.once("exit", () => {
        clearTimeout(timer);
        resolve(true);
      });
    });
    if (!exited) this.#child.kill("SIGKILL");
  }
}

export function createLocalWorkflowBackend(
  context: WorkflowRunBackendContext,
): WorkflowRunBackend {
  const needsScratch =
    context.spec.executor === "claude" &&
    context.spec.contract.deliveryMode === "claude-system-contract" &&
    context.spec.permissionProfile.capabilities.includes("child-process") &&
    context.spec.permissionProfile.capabilities.includes("local-computation");
  const scratchWorkspace = needsScratch
    ? createWorkflowScratch(context.runId)
    : undefined;
  try {
    const command = buildExecutorCommand(context.spec, scratchWorkspace);
    const [defaultProgram, ...args] = command;
    if (defaultProgram === undefined) {
      throw new Error("workflow executor command is empty");
    }
    const program = workflowProviderProgram(context.spec, defaultProgram);
    const primaryWorkspace =
      context.spec.executor === "claude"
        ? claudeWorkflowDirectory(context.spec)
        : context.spec.permissionProfile.workspaces[0];
    const child: PipedChildProcess = spawn(program, args, {
      cwd: primaryWorkspace ?? process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env:
        scratchWorkspace === undefined
          ? process.env
          : {
              ...process.env,
              ...workflowScratchEnvironment(scratchWorkspace),
            },
    });
    return new LocalWorkflowBackend(
      child,
      scratchWorkspace,
      scratchWorkspace === undefined
        ? undefined
        : () => {
            rmSync(scratchWorkspace, { recursive: true, force: true });
          },
    );
  } catch (error) {
    if (scratchWorkspace !== undefined)
      rmSync(scratchWorkspace, { recursive: true, force: true });
    throw error;
  }
}
