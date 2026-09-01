import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";

import type {
  ResolvedWorkflowRunSpec,
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

export function buildExecutorCommand(
  spec: ResolvedWorkflowRunSpec,
): readonly string[] {
  const workspaces = spec.permissionProfile.workspaces;
  const primary = workspaces[0] ?? process.cwd();
  const extraWorkspaces = workspaces.slice(1);
  const prompt =
    spec.prompt ??
    `Perform the ${spec.role} workflow role for this repository.`;

  let command: string[];
  if (spec.executor === "codex") {
    // `workspace-write` keeps writes inside the declared workspace(s);
    // `--approve-for-me` is the current bounded non-interactive Codex mode.
    command = [
      "codex",
      "exec",
      "--cd",
      primary,
      "--sandbox",
      "workspace-write",
      "--approve-for-me",
      ...extraWorkspaces.flatMap((workspace) => ["--add-dir", workspace]),
      prompt,
    ];
  } else if (spec.executor === "claude") {
    // `acceptEdits` is the bounded non-interactive edit mode, not the
    // permission-bypass mode. Additional declared workspaces are added
    // explicitly rather than granting broad host access.
    command = [
      "claude",
      "-p",
      "--permission-mode",
      "acceptEdits",
      ...extraWorkspaces.flatMap((workspace) => ["--add-dir", workspace]),
      "--",
      prompt,
    ];
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

class LocalWorkflowBackend implements WorkflowRunBackend {
  readonly pid: number | undefined;
  readonly #child: PipedChildProcess;
  #activityListener: ((chunk: string) => void) | undefined;
  #exitListener: ((outcome: WorkflowRunExitOutcome) => void) | undefined;
  #settled = false;
  #stopping: Promise<void> | undefined;

  constructor(child: PipedChildProcess) {
    this.#child = child;
    this.pid = child.pid;
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => this.#activityListener?.(chunk));
    child.stderr.on("data", (chunk: string) => this.#activityListener?.(chunk));
    child.on("error", (error) => {
      this.#settle({ ok: false, reason: error.message });
    });
    child.on("exit", (code, signal) => {
      this.#settle(
        code === 0
          ? { ok: true }
          : {
              ok: false,
              reason: `executor exited (code ${String(code)}, signal ${String(signal)})`,
            },
      );
    });
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
    this.#exitListener?.(outcome);
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
  const command = buildExecutorCommand(context.spec);
  const [program, ...args] = command;
  if (program === undefined) {
    throw new Error("workflow executor command is empty");
  }
  const primaryWorkspace = context.spec.permissionProfile.workspaces[0];
  const child: PipedChildProcess = spawn(program, args, {
    cwd: primaryWorkspace ?? process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  return new LocalWorkflowBackend(child);
}
