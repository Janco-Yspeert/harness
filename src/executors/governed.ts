// Governed spawned execution through a registered provider adapter.
//
// The host has already selected the adapter, located its installed provider,
// planned permissions/constraints and recorded the allocation. This module
// delivers the exact assignment, starts the provider with a clean environment,
// consumes its structured event stream, relays the four typed worker
// operations to the authenticated host API, and reports lifecycle facts. It
// never infers a result or action from exit status or prose, and never
// retries.
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs";
import { createServer, type Server } from "node:net";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

import type { ExecutionKernel } from "../kernel/execution.ts";
import { redact } from "../kernel/execution.ts";
import { contentId, identity } from "../kernel/ledger.ts";
import type {
  DiagnosticCategory,
  Execution,
  ExecutorProfile,
  RoleContract,
  RoleGrant,
} from "../kernel/model.ts";
import { stopChild, workflowScratchEnvironment } from "../workflow-backend.ts";
import {
  checkedCommand,
  type ProviderAdapter,
  type ProviderEvent,
} from "./adapters.ts";
import {
  parseWorkerRequest,
  WORKER_OPERATIONS,
  WORKER_PROTOCOL_VERSION,
  type WorkerRequest,
} from "./protocol.ts";

export const WORKER_TOOLS_PATH = fileURLToPath(
  new URL("./worker-tools.ts", import.meta.url),
);
const MAX_RELAY_LINE = 262_144;
const MAX_PRIVATE_DIAGNOSTIC_BYTES = 262_144;
const MAX_PRIVATE_LINE = 4_096;
// Only these host variables reach a provider. Host root and session
// credentials, API keys and every other ambient value are withheld.
const PROVIDER_ENVIRONMENT = [
  "PATH",
  "HOME",
  "USER",
  "LOGNAME",
  "LANG",
  "LC_ALL",
  "CODEX_HOME",
  "CLAUDE_CONFIG_DIR",
  "XDG_CONFIG_HOME",
];

export function providerEnvironment(
  scratch: string,
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of PROVIDER_ENVIRONMENT) {
    const value = source[key];
    if (value !== undefined) env[key] = value;
  }
  return { ...env, ...workflowScratchEnvironment(scratch) };
}

export interface Assignment {
  protocolVersion: typeof WORKER_PROTOCOL_VERSION;
  execution: string;
  workflow: string;
  roleGrant: RoleGrant;
  methodology: string;
  skill: { path: string; identity: string; content: string };
  contract: RoleContract;
  contractIdentity: string;
  inputs: Record<string, string>;
}

export function workerInstructions(assignment: Assignment): {
  system: string;
  prompt: string;
} {
  const grant = assignment.roleGrant;
  return {
    system:
      `You are the governed Harness worker for role ${grant.role}.\n` +
      `Execution: ${assignment.execution}\n` +
      `Role Grant: ${grant.id}\n` +
      `Methodology: ${assignment.methodology}\n` +
      `Pinned skill ${assignment.skill.path} (${assignment.skill.identity}); its exact bytes follow. Never reload the skill from the working tree.\n\n` +
      `${assignment.skill.content}\n\n` +
      `Pinned role contract (${assignment.contractIdentity}): ${JSON.stringify(assignment.contract)}\n` +
      `Host-bound input identities: ${JSON.stringify(assignment.inputs)}\n\n` +
      `Harness worker protocol v${String(WORKER_PROTOCOL_VERSION)} is available as the "harness" tools ${WORKER_OPERATIONS.join(", ")}.\n` +
      "- Your final prose is never a result. Submit exactly one typed result with submitResult {disposition, methodology}, using only the contract's result and methodology vocabulary.\n" +
      "- Use requestAction only when your skill or contract requires a host action; the host validates it and may deny it.\n" +
      "- Use requestHuman only for input, approval or root requests the contract permits.\n" +
      "- Use only the granted workspaces and capabilities. Never push, publish directly, or reveal credentials.",
    prompt: `Perform the allocated ${grant.role} work for workflow ${assignment.workflow}, then submit your typed result with the Harness submitResult tool.`,
  };
}

interface HostCall {
  (
    method: "GET" | "POST",
    path: string,
    body?: object,
  ): Promise<{ ok: boolean; value: Record<string, unknown> }>;
}

export interface GovernedLaunch {
  readonly kernel: ExecutionKernel;
  readonly workflow: string;
  readonly hostUrl: string;
  readonly session: { id: string; token: string };
  readonly execution: Execution;
  readonly profile: ExecutorProfile;
  readonly adapter: ProviderAdapter;
  readonly program: string;
  readonly plan: { model?: string; reasoning?: string };
  readonly privateDataRoot?: string;
  readonly humanWaitMs?: number;
  readonly onExit: () => void;
  // Test seam for the provider process; production always spawns.
  readonly spawnProvider?: typeof spawn;
}

// Delivery checks the host's response against the grant's own identities; a
// mismatch is never launched.
export function verifyAssignment(
  value: Record<string, unknown>,
  execution: string,
  workflow: string,
): Assignment {
  const assignments = value.assignments;
  if (!Array.isArray(assignments))
    throw new Error("assignment response is malformed");
  const matching = assignments.filter(
    (entry) =>
      entry !== null &&
      typeof entry === "object" &&
      (entry as { execution?: { id?: unknown } }).execution?.id === execution,
  ) as Array<{
    grant: RoleGrant;
    skill: { path: string; identity: string; content: string };
    contract: RoleContract;
  }>;
  const bound = matching[0];
  if (matching.length !== 1 || !bound)
    throw new Error("host delivered no unique assignment for this execution");
  const { grant, skill, contract } = bound;
  if (
    typeof skill.content !== "string" ||
    identity(skill.content) !== skill.identity ||
    skill.identity !== grant.skillIdentity
  )
    throw new Error("pinned skill identity mismatch");
  if (contentId(contract) !== grant.contractIdentity)
    throw new Error("pinned contract identity mismatch");
  return {
    protocolVersion: WORKER_PROTOCOL_VERSION,
    execution,
    workflow,
    roleGrant: grant,
    methodology: grant.methodology,
    skill: {
      path: skill.path,
      identity: skill.identity,
      content: skill.content,
    },
    contract,
    contractIdentity: grant.contractIdentity,
    inputs: grant.inputs,
  };
}

function launchWorkspaces(grant: RoleGrant): RoleGrant["workspaces"] {
  // Protected roles work inside their first private workspace.
  const index = grant.executorConstraints.protected
    ? grant.workspaces.findIndex((workspace) => workspace.exposure !== "public")
    : 0;
  const first = grant.workspaces[Math.max(index, 0)];
  if (!first) throw new Error("grant has no workspace");
  return [
    first,
    ...grant.workspaces.filter((workspace) => workspace !== first),
  ];
}

export class GovernedProviderRun {
  readonly #launch: GovernedLaunch;
  readonly #call: HostCall;
  #child: ChildProcess | undefined;
  #relay: Server | undefined;
  #directories: string[] = [];
  #assignment: Assignment | undefined;
  #confirmed = false;
  #failure: DiagnosticCategory | undefined;
  #privateBytes = 0;
  #privateLog: string | undefined;
  readonly #relayKey = randomBytes(32).toString("hex");
  readonly done: Promise<void>;

  constructor(launch: GovernedLaunch) {
    this.#launch = launch;
    const base = `${launch.hostUrl}/governed/${encodeURIComponent(launch.workflow)}`;
    this.#call = async (method, path, body) => {
      const response = await fetch(`${base}/${path}`, {
        method,
        headers: {
          authorization: `Bearer ${launch.session.token}`,
          "x-harness-session": launch.session.id,
          "content-type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const value = (await response.json()) as Record<string, unknown>;
      return { ok: response.ok, value };
    };
    this.done = this.#run();
  }

  get #execution(): string {
    return this.#launch.execution.id;
  }

  #terminal(): boolean {
    const { process } = this.#launch.kernel.execution(
      this.#launch.workflow,
      this.#execution,
    );
    return !["allocated", "running"].includes(process);
  }

  #fail(category: DiagnosticCategory, failure: string): void {
    if (this.#terminal()) return;
    this.#launch.kernel.process(
      this.#launch.workflow,
      this.#execution,
      "failed",
      null,
      failure,
      category,
    );
  }

  #diagnostic(category: DiagnosticCategory, detail: string): void {
    try {
      this.#launch.kernel.diagnostic(
        this.#launch.workflow,
        this.#execution,
        category,
        detail,
      );
    } catch {
      /* Observability never decides authority. */
    }
  }

  // Richer provider output stays only in the host-owned private data root,
  // redacted and bounded. It is never copied into public records.
  #retain(stream: "stdout" | "stderr", line: string): void {
    if (!this.#privateLog || this.#privateBytes >= MAX_PRIVATE_DIAGNOSTIC_BYTES)
      return;
    const entry = `${JSON.stringify({
      stream,
      line: redact(line).slice(0, MAX_PRIVATE_LINE),
    })}\n`;
    this.#privateBytes += Buffer.byteLength(entry);
    try {
      appendFileSync(this.#privateLog, entry, { mode: 0o600 });
    } catch {
      this.#privateLog = undefined;
    }
  }

  #preparePrivateLog(): void {
    const root = this.#launch.privateDataRoot;
    if (!root) return;
    const directory = resolve(root, "provider-diagnostics");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const actual = realpathSync(directory);
    // Never retain provider output inside a directory the worker can read.
    const exposed = (this.#assignment?.roleGrant.workspaces ?? []).some(
      (workspace) => {
        const delta = relative(realpathSync(workspace.path), actual);
        return delta === "" || (!delta.startsWith("..") && !isAbsolute(delta));
      },
    );
    if (!exposed) this.#privateLog = join(actual, `${this.#execution}.jsonl`);
  }

  async #run(): Promise<void> {
    const launch = this.#launch;
    try {
      const response = await this.#call(
        "GET",
        `sessions/${encodeURIComponent(launch.session.id)}`,
      );
      if (!response.ok) throw new Error("assignment request rejected");
      this.#assignment = verifyAssignment(
        response.value,
        this.#execution,
        launch.workflow,
      );
    } catch (error) {
      this.#fail(
        "assignment-not-delivered",
        `assignment not delivered: ${(error as Error).message}`,
      );
      launch.onExit();
      return;
    }
    const assignment = this.#assignment;
    this.#confirmed =
      assignment.roleGrant.executorConstraints.model === undefined;
    try {
      this.#preparePrivateLog();
      const scratch = mkdtempSync(join(tmpdir(), "harness-scratch-"));
      this.#directories.push(scratch);
      mkdirSync(join(scratch, "cache"));
      mkdirSync(join(scratch, "npm-cache"));
      this.#relay = await this.#listen();
      const address = this.#relay.address();
      if (address === null || typeof address === "string")
        throw new Error("relay has no loopback port");
      const workspaces = launchWorkspaces(assignment.roleGrant);
      const instructions = workerInstructions(assignment);
      const { program, args } = checkedCommand(launch.adapter, launch.program, {
        grant: assignment.roleGrant,
        workspaces,
        scratch,
        relay: { port: address.port, key: this.#relayKey },
        nodePath: process.execPath,
        workerToolsPath: WORKER_TOOLS_PATH,
        system: instructions.system,
        prompt: instructions.prompt,
        ...launch.plan,
        ...(launch.profile.maxTurns === undefined
          ? {}
          : { maxTurns: launch.profile.maxTurns }),
      });
      const cwd = workspaces[0]?.path ?? scratch;
      if (!statSync(cwd).isDirectory()) throw new Error("workspace missing");
      const child = (launch.spawnProvider ?? spawn)(program, args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        env: providerEnvironment(scratch),
      });
      this.#child = child;
      await this.#monitor(child);
    } catch (error) {
      this.#fail(
        "provider-config-invalid",
        `provider launch configuration failed: ${(error as Error).message}`,
      );
      this.#cleanup();
      launch.onExit();
    }
  }

  #monitor(child: ChildProcess): Promise<void> {
    const launch = this.#launch;
    return new Promise((resolveRun) => {
      let finished = false;
      const finish = (): void => {
        if (finished) return;
        finished = true;
        this.#cleanup();
        launch.onExit();
        resolveRun();
      };
      // Lifecycle recording is best effort after host shutdown; it never
      // throws into the provider event loop.
      const record = (operation: () => void): void => {
        try {
          operation();
        } catch {
          /* host closed or execution already terminal */
        }
      };
      child.once("spawn", () => {
        record(() => {
          if (!this.#terminal())
            launch.kernel.process(
              launch.workflow,
              this.#execution,
              "running",
              child.pid ?? null,
            );
        });
      });
      child.once("error", (error: NodeJS.ErrnoException) => {
        record(() => {
          this.#fail(
            error.code === "ENOENT" || error.code === "EACCES"
              ? "provider-not-installed"
              : "provider-crashed",
            "provider launch failed",
          );
        });
        finish();
      });
      if (child.stdout) {
        const lines = createInterface({ input: child.stdout });
        lines.on("line", (line) => {
          this.#retain("stdout", line);
          for (const event of launch.adapter.parse(line))
            record(() => {
              this.#observe(event);
            });
        });
      }
      if (child.stderr) {
        const lines = createInterface({ input: child.stderr });
        lines.on("line", (line) => {
          this.#retain("stderr", line);
        });
      }
      child.once("exit", (code, signal) => {
        record(() => {
          if (this.#terminal()) return;
          const execution = launch.kernel.execution(
            launch.workflow,
            this.#execution,
          );
          if (code === 0 && signal === null && execution.result)
            launch.kernel.process(launch.workflow, execution.id, "exited");
          else if (code === 0 && signal === null)
            launch.kernel.process(
              launch.workflow,
              execution.id,
              "failed",
              null,
              "missing semantic result handshake",
              this.#failure ?? "missing-result",
            );
          else
            launch.kernel.process(
              launch.workflow,
              execution.id,
              "failed",
              null,
              "provider process failed",
              this.#failure ?? "provider-crashed",
            );
        });
        finish();
      });
    });
  }

  #observe(event: ProviderEvent): void {
    const launch = this.#launch;
    if (event.kind === "confirmed") {
      try {
        launch.kernel.confirmExecutor(launch.workflow, this.#execution, {
          model: event.model,
          reasoning: event.reasoning,
          version: event.version,
        });
      } catch {
        return;
      }
      const exact = this.#assignment?.roleGrant.executorConstraints.model;
      if (exact !== undefined && event.model !== exact) {
        this.#fail(
          "provider-config-invalid",
          "provider did not confirm the exact requested model",
        );
        void this.cancel();
        return;
      }
      this.#confirmed = true;
      return;
    }
    if (event.kind === "tools-unavailable") {
      this.#failure = "assignment-not-delivered";
      this.#diagnostic("assignment-not-delivered", event.detail);
      return;
    }
    if (event.kind === "permission-denied") {
      this.#diagnostic("permission-denied", event.detail);
      return;
    }
    // A reliable quota signal is not replaced by the generic error that follows.
    if (this.#failure !== "rate-limited") this.#failure = event.kind;
    this.#diagnostic(event.kind, event.detail);
  }

  // Loopback relay for this execution only. Its key is not a host credential:
  // it reaches exactly the four operations already bound to this execution.
  #listen(): Promise<Server> {
    return new Promise((resolveServer, reject) => {
      const server = createServer((connection) => {
        connection.setEncoding("utf8");
        let buffer = "";
        connection.on("data", (chunk: string) => {
          buffer += chunk;
          if (buffer.length > MAX_RELAY_LINE) {
            connection.end(
              `${JSON.stringify({ ok: false, error: "request too large" })}\n`,
            );
            return;
          }
          const end = buffer.indexOf("\n");
          if (end < 0) return;
          const line = buffer.slice(0, end);
          buffer = "";
          void this.#relayLine(line).then((reply) => {
            connection.end(`${JSON.stringify(reply)}\n`);
          });
        });
        connection.on("error", () => {
          connection.destroy();
        });
      });
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", reject);
        resolveServer(server);
      });
    });
  }

  async #relayLine(
    line: string,
  ): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
    let request: WorkerRequest;
    try {
      const raw = JSON.parse(line) as {
        key?: unknown;
        operation?: unknown;
        input?: unknown;
      };
      const key = Buffer.from(typeof raw.key === "string" ? raw.key : "");
      const expected = Buffer.from(this.#relayKey);
      if (key.length !== expected.length || !timingSafeEqual(key, expected))
        return { ok: false, error: "relay authentication denied" };
      request = parseWorkerRequest(String(raw.operation), raw.input);
    } catch (error) {
      if (line.includes('"submitResult"'))
        this.#diagnostic("result-rejected", "malformed semantic result");
      return { ok: false, error: (error as Error).message };
    }
    try {
      return { ok: true, value: await this.relay(request) };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  // The four operations, each bound to this adapter's own execution.
  async relay(request: WorkerRequest): Promise<unknown> {
    const assignment = this.#assignment;
    if (!assignment) throw new Error("assignment not delivered");
    const path = `executions/${encodeURIComponent(this.#execution)}`;
    const failure = (value: Record<string, unknown>): Error =>
      new Error(
        typeof value.error === "string" ? value.error : "host request failed",
      );
    if (request.operation === "assignment") return assignment;
    if (request.operation === "submitResult") {
      if (!this.#confirmed) {
        this.#diagnostic("result-rejected", "executor model not yet confirmed");
        throw new Error("exact model constraint is not yet confirmed");
      }
      const response = await this.#call("POST", `${path}/result`, {
        disposition: request.disposition,
        methodology: request.methodology,
      });
      if (!response.ok) {
        this.#diagnostic("result-rejected", "host rejected semantic result");
        throw failure(response.value);
      }
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        execution: response.value,
      };
    }
    if (request.operation === "requestAction") {
      const response =
        request.kind === "promotion"
          ? await this.#call("POST", `${path}/promote`, {
              candidate: request.candidate,
              evaluatorRevision: request.evaluatorRevision,
              attempt: request.attempt,
              artifacts: request.artifacts,
            })
          : await this.#call("POST", `${path}/publish`, {
              workspace: request.workspace,
              commit: request.commit,
              ref: request.ref,
            });
      if (!response.ok) {
        this.#diagnostic("action-failed", "host rejected action request");
        throw failure(response.value);
      }
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        action: response.value,
      };
    }
    const asked = await this.#call("POST", `${path}/human`, {
      kind: request.kind,
      question: request.question,
      ...(request.permission === undefined
        ? {}
        : { permission: request.permission }),
    });
    if (!asked.ok) throw failure(asked.value);
    const id = asked.value.id;
    const deadline = Date.now() + (this.#launch.humanWaitMs ?? 900_000);
    while (Date.now() < deadline) {
      const state = await this.#call("GET", path);
      const execution = state.value.execution as Execution | undefined;
      const answered = execution?.requests.find((item) => item.id === id);
      if (answered?.response)
        return {
          protocolVersion: WORKER_PROTOCOL_VERSION,
          request: answered,
          response: answered.response,
        };
      if (!execution || !["allocated", "running"].includes(execution.process))
        break;
      await new Promise((wait) => setTimeout(wait, 500));
    }
    return {
      protocolVersion: WORKER_PROTOCOL_VERSION,
      request: asked.value,
      response: null,
    };
  }

  // Terminates the actual provider process; the host records status.
  async cancel(): Promise<void> {
    if (this.#child) await stopChild(this.#child);
  }

  #cleanup(): void {
    this.#relay?.close();
    this.#relay = undefined;
    for (const directory of this.#directories)
      rmSync(directory, { recursive: true, force: true });
    this.#directories = [];
  }
}
