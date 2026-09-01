import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// A workflow run is a host-owned execution of a methodology workflow role. It
// shares host-generated identity, backend lifecycle observation, termination,
// event publication, and diagnostic-output retention with interactive sessions,
// but it is a distinct domain record: it carries a role/phase slot, methodology
// attempt, operational execution attempt, executor, invocation mode, workspace
// boundary, permission-profile identity, and replacement provenance. It has no
// client attachment or user input.

export type WorkflowRunStatus =
  "allocated" | "running" | "completed" | "failed" | "cancelled" | "replaced";

export type WorkflowRunDisposition =
  "completed" | "failed" | "cancelled" | "replaced";

export type WorkflowInvocationMode =
  "delegated" | "direct" | "retry" | "fallback";

const ACTIVE_STATUSES: ReadonlySet<WorkflowRunStatus> = new Set([
  "allocated",
  "running",
]);

export function isActiveWorkflowRunStatus(status: WorkflowRunStatus): boolean {
  return ACTIVE_STATUSES.has(status);
}

export const WORKFLOW_PERMISSION_PROFILES = [
  "repo-local-worker",
  "evaluator",
] as const;

export type WorkflowPermissionProfileName =
  (typeof WORKFLOW_PERMISSION_PROFILES)[number];

// Capability/workspace-oriented profile. The capability set is deliberately not
// a per-binary allowlist and never contains an unrestricted-host capability;
// the bounded executor mode enforces it against the declared workspaces.
const WORKFLOW_WORKER_CAPABILITIES = [
  "repository-read",
  "workspace-write",
  "local-computation",
  "child-process",
  "test-build-lint-format",
  "git-inspect",
  "git-commit",
  "workflow-bookkeeping",
] as const;

export interface WorkflowPermissionProfile {
  readonly id: WorkflowPermissionProfileName;
  readonly workspaces: readonly string[];
  readonly capabilities: readonly string[];
}

export interface WorkflowRunSlot {
  readonly workflow: string;
  readonly phase: string;
  readonly methodologyAttempt?: string | undefined;
}

export interface WorkflowRunRequest {
  readonly slot: WorkflowRunSlot;
  readonly role: string;
  readonly executor: string;
  readonly workspace: string;
  readonly invocationMode?: WorkflowInvocationMode | undefined;
  readonly permissionProfile?: WorkflowPermissionProfileName | undefined;
  readonly evaluatorWorkspace?: string | undefined;
  readonly skill?: string | undefined;
  readonly skillVersion?: string | undefined;
  readonly verificationAuthority?: Record<string, unknown> | undefined;
  readonly orchestrator?: string | undefined;
  readonly prompt?: string | undefined;
}

export interface WorkflowReplaceRequest {
  readonly reason: string;
  readonly executor?: string | undefined;
  readonly invocationMode?: WorkflowInvocationMode | undefined;
  readonly prompt?: string | undefined;
}

export interface ResolvedWorkflowRunSpec {
  readonly slot: WorkflowRunSlot;
  readonly role: string;
  readonly executor: string;
  readonly invocationMode: WorkflowInvocationMode;
  readonly workspaces: readonly string[];
  readonly permissionProfile: WorkflowPermissionProfile;
  readonly skill: string | null;
  readonly skillVersion: string | null;
  readonly verificationAuthority: Record<string, unknown> | null;
  readonly orchestrator: string | null;
  readonly prompt: string | null;
}

export interface WorkflowRunAccounting {
  readonly allocatedAt: string;
  readonly startedAt: string | null;
  readonly endedAt: string | null;
  readonly elapsedMs: number | null;
  readonly executor: string;
  readonly executionAttempt: number;
  readonly replacementCount: number;
  readonly terminalDisposition: WorkflowRunDisposition | null;
}

export interface WorkflowRunRecord {
  readonly runId: string;
  readonly workflow: string;
  readonly phase: string;
  readonly methodologyAttempt: string | null;
  readonly executionAttempt: number;
  readonly role: string;
  readonly skill: string | null;
  readonly skillVersion: string | null;
  readonly verificationAuthority: Record<string, unknown> | null;
  readonly executor: string;
  readonly invocationMode: WorkflowInvocationMode;
  readonly replacementReason: string | null;
  readonly previousExecutionId: string | null;
  readonly workspaces: readonly string[];
  readonly permissionProfile: WorkflowPermissionProfile;
  readonly orchestrator: string | null;
  readonly pid: number | null;
  readonly providerSessionId: string | null;
  readonly status: WorkflowRunStatus;
  readonly terminalDisposition: WorkflowRunDisposition | null;
  readonly terminalReason: string | null;
  readonly createdAt: string;
  readonly startedAt: string | null;
  readonly lastActivityAt: string | null;
  readonly terminalAt: string | null;
  readonly logLocation: string;
  readonly accounting: WorkflowRunAccounting;
}

export interface WorkflowRunExitOutcome {
  readonly ok: boolean;
  readonly reason?: string | undefined;
}

export interface WorkflowRunBackendContext {
  readonly runId: string;
  readonly spec: ResolvedWorkflowRunSpec;
}

export interface WorkflowRunBackend {
  readonly pid?: number | undefined;
  readonly providerSessionId?: string | undefined;
  onActivity(listener: (chunk: string) => void): void;
  onExit(listener: (outcome: WorkflowRunExitOutcome) => void): void;
  stop(): void | Promise<void>;
}

export type WorkflowRunBackendFactory = (
  context: WorkflowRunBackendContext,
) => WorkflowRunBackend | Promise<WorkflowRunBackend>;

export type WorkflowRunEventType =
  | "workflow-run.allocated"
  | "workflow-run.started"
  | "workflow-run.activity"
  | "workflow-run.completed"
  | "workflow-run.failed"
  | "workflow-run.cancelled"
  | "workflow-run.replaced";

export type WorkflowRunEventPublisher = (
  type: WorkflowRunEventType,
  streamId: string,
  data: Record<string, unknown>,
) => void;

export interface WorkflowRunRegistryOptions {
  readonly createBackend: WorkflowRunBackendFactory;
  readonly publishEvent: WorkflowRunEventPublisher;
  readonly now?: () => number;
}

export class WorkflowRunRequestError extends Error {}
export class WorkflowRunNotFoundError extends Error {}
export class WorkflowRunConflictError extends Error {}

export function workflowRunLogLocation(runId: string): string {
  return `/workflow-runs/${runId}/log`;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new WorkflowRunRequestError(`${field} must be a non-empty string`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireString(value, field);
}

interface PinnedVerificationAuthority {
  readonly name: string;
  readonly contractVersion: number;
  readonly sourceCommit: string;
  readonly identity: string;
  readonly snapshotPath: string;
}

function sha256(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function readAuthorityField(
  value: unknown,
  field: string,
): Record<string, unknown> {
  const raw = value as Record<string, unknown>;
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !(field in raw) ||
    typeof raw[field] !== "object" ||
    raw[field] === null ||
    Array.isArray(raw[field])
  ) {
    throw new WorkflowRunRequestError(
      `Spike 012 bootstrap evaluator authority has no ${field} object`,
    );
  }
  return raw[field] as Record<string, unknown>;
}

// The host, rather than a caller-side workflow helper, owns this bootstrap
// exception. A direct allocation must therefore reach the same pinned v10
// authority as a CLI-dispatched allocation. The current evaluator skill is
// intentionally never consulted here: it is implementation under test.
function resolveSpike012VerificationAuthority(
  request: WorkflowRunRequest,
): PinnedVerificationAuthority | undefined {
  if (
    request.slot.workflow !== "012" ||
    request.slot.phase !== "evaluator-verify"
  ) {
    return undefined;
  }

  const spikePath = resolve(
    request.workspace,
    "spikes/012-correction-cycles-evaluator-repair",
  );
  let authorityRaw: unknown;
  try {
    authorityRaw = JSON.parse(
      readFileSync(
        resolve(spikePath, "bootstrap/evaluator-authority.json"),
        "utf8",
      ),
    );
  } catch (error) {
    throw new WorkflowRunRequestError(
      `Unable to read Spike 012 bootstrap evaluator authority: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  const evaluator = readAuthorityField(authorityRaw, "evaluatorSkill");
  const name = evaluator.name;
  const contractVersion = evaluator.contractVersion;
  const sourceCommit = evaluator.sourceCommit;
  const sourcePath = evaluator.sourcePath;
  const identity = evaluator.identity;
  const snapshotPath = evaluator.snapshotPath;
  if (
    typeof name !== "string" ||
    typeof contractVersion !== "number" ||
    typeof sourceCommit !== "string" ||
    typeof sourcePath !== "string" ||
    typeof identity !== "string" ||
    typeof snapshotPath !== "string"
  ) {
    throw new WorkflowRunRequestError(
      "Spike 012 bootstrap evaluator authority is invalid",
    );
  }

  let snapshot: string;
  let committedSource: string;
  try {
    snapshot = readFileSync(resolve(spikePath, snapshotPath), "utf8");
    committedSource = execFileSync(
      "git",
      ["-C", request.workspace, "show", `${sourceCommit}:${sourcePath}`],
      { encoding: "utf8" },
    );
  } catch (error) {
    throw new WorkflowRunRequestError(
      `Unable to validate Spike 012 bootstrap evaluator authority: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  if (sha256(snapshot) !== identity) {
    throw new WorkflowRunRequestError(
      "Spike 012 bootstrap evaluator snapshot identity does not match authority",
    );
  }
  if (sha256(committedSource) !== identity) {
    throw new WorkflowRunRequestError(
      "Spike 012 bootstrap evaluator source provenance does not match authority",
    );
  }
  return { name, contractVersion, sourceCommit, identity, snapshotPath };
}

function sameAuthority(
  left: Record<string, unknown>,
  right: PinnedVerificationAuthority,
): boolean {
  return (
    left.name === right.name &&
    left.contractVersion === right.contractVersion &&
    left.sourceCommit === right.sourceCommit &&
    left.identity === right.identity &&
    left.snapshotPath === right.snapshotPath &&
    Object.keys(left).length === 5
  );
}

export function parseWorkflowRunRequest(body: unknown): WorkflowRunRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new WorkflowRunRequestError("request body must be a JSON object");
  }
  const raw = body as Record<string, unknown>;
  const slotRaw = raw.slot;
  if (
    typeof slotRaw !== "object" ||
    slotRaw === null ||
    Array.isArray(slotRaw)
  ) {
    throw new WorkflowRunRequestError("slot must be a JSON object");
  }
  const slotObject = slotRaw as Record<string, unknown>;
  const profile = optionalString(raw.permissionProfile, "permissionProfile");
  if (
    profile !== undefined &&
    !WORKFLOW_PERMISSION_PROFILES.includes(
      profile as WorkflowPermissionProfileName,
    )
  ) {
    throw new WorkflowRunRequestError(`unknown permission profile: ${profile}`);
  }
  const mode = optionalString(raw.invocationMode, "invocationMode");
  const slot: WorkflowRunSlot = {
    workflow: requireString(slotObject.workflow, "slot.workflow"),
    phase: requireString(slotObject.phase, "slot.phase"),
    methodologyAttempt: optionalString(
      slotObject.methodologyAttempt,
      "slot.methodologyAttempt",
    ),
  };
  return {
    slot,
    role: requireString(raw.role, "role"),
    executor: requireString(raw.executor, "executor"),
    workspace: requireString(raw.workspace, "workspace"),
    invocationMode: mode as WorkflowInvocationMode | undefined,
    permissionProfile: profile as WorkflowPermissionProfileName | undefined,
    evaluatorWorkspace: optionalString(
      raw.evaluatorWorkspace,
      "evaluatorWorkspace",
    ),
    skill: optionalString(raw.skill, "skill"),
    skillVersion: optionalString(raw.skillVersion, "skillVersion"),
    verificationAuthority:
      typeof raw.verificationAuthority === "object" &&
      raw.verificationAuthority !== null &&
      !Array.isArray(raw.verificationAuthority)
        ? (raw.verificationAuthority as Record<string, unknown>)
        : raw.verificationAuthority === undefined
          ? undefined
          : (() => {
              throw new WorkflowRunRequestError(
                "verificationAuthority must be a JSON object",
              );
            })(),
    orchestrator: optionalString(raw.orchestrator, "orchestrator"),
    prompt: optionalString(raw.prompt, "prompt"),
  };
}

export function parseWorkflowReplaceRequest(
  body: unknown,
): WorkflowReplaceRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new WorkflowRunRequestError("request body must be a JSON object");
  }
  const raw = body as Record<string, unknown>;
  const mode = optionalString(raw.invocationMode, "invocationMode");
  return {
    reason: requireString(raw.reason, "reason"),
    executor: optionalString(raw.executor, "executor"),
    invocationMode: mode as WorkflowInvocationMode | undefined,
    prompt: optionalString(raw.prompt, "prompt"),
  };
}

function resolvePermissionProfile(
  name: WorkflowPermissionProfileName,
  workspace: string,
  evaluatorWorkspace: string | undefined,
): WorkflowPermissionProfile {
  if (name === "evaluator") {
    if (evaluatorWorkspace === undefined) {
      throw new WorkflowRunRequestError(
        "the evaluator permission profile requires a declared evaluatorWorkspace",
      );
    }
    return {
      id: "evaluator",
      workspaces: [workspace, evaluatorWorkspace],
      capabilities: [...WORKFLOW_WORKER_CAPABILITIES],
    };
  }
  return {
    id: "repo-local-worker",
    workspaces: [workspace],
    capabilities: [...WORKFLOW_WORKER_CAPABILITIES],
  };
}

function resolveSpec(request: WorkflowRunRequest): ResolvedWorkflowRunSpec {
  const pinnedAuthority = resolveSpike012VerificationAuthority(request);
  if (
    pinnedAuthority !== undefined &&
    request.verificationAuthority !== undefined &&
    !sameAuthority(request.verificationAuthority, pinnedAuthority)
  ) {
    throw new WorkflowRunRequestError(
      "Spike 012 evaluator verification authority does not match the pinned bootstrap authority",
    );
  }
  if (
    pinnedAuthority !== undefined &&
    request.skill !== undefined &&
    request.skill !== pinnedAuthority.snapshotPath
  ) {
    throw new WorkflowRunRequestError(
      "Spike 012 evaluator verification skill does not match the pinned bootstrap snapshot",
    );
  }
  if (
    pinnedAuthority !== undefined &&
    request.skillVersion !== undefined &&
    request.skillVersion !== String(pinnedAuthority.contractVersion)
  ) {
    throw new WorkflowRunRequestError(
      "Spike 012 evaluator verification skill version does not match the pinned bootstrap authority",
    );
  }
  const permissionProfile = resolvePermissionProfile(
    request.permissionProfile ?? "repo-local-worker",
    request.workspace,
    request.evaluatorWorkspace,
  );
  return {
    slot: request.slot,
    role: request.role,
    executor: request.executor,
    invocationMode: request.invocationMode ?? "delegated",
    workspaces: permissionProfile.workspaces,
    permissionProfile,
    skill: pinnedAuthority?.snapshotPath ?? request.skill ?? null,
    skillVersion:
      pinnedAuthority === undefined
        ? (request.skillVersion ?? null)
        : String(pinnedAuthority.contractVersion),
    verificationAuthority:
      pinnedAuthority === undefined
        ? (request.verificationAuthority ?? null)
        : { ...pinnedAuthority },
    orchestrator: request.orchestrator ?? null,
    prompt: request.prompt ?? null,
  };
}

function slotKey(slot: WorkflowRunSlot): string {
  return JSON.stringify([
    slot.workflow,
    slot.phase,
    slot.methodologyAttempt ?? null,
  ]);
}

interface ExecutionMeta {
  readonly executionAttempt: number;
  readonly previousExecutionId: string | null;
  readonly replacementReason: string | null;
  readonly replacementCount: number;
}

class InternalRun {
  readonly runId: string;
  readonly spec: ResolvedWorkflowRunSpec;
  readonly meta: ExecutionMeta;
  readonly createdAtMs: number;
  status: WorkflowRunStatus = "allocated";
  terminalDisposition: WorkflowRunDisposition | null = null;
  terminalReason: string | null = null;
  pid: number | null = null;
  providerSessionId: string | null = null;
  startedAtMs: number | null = null;
  lastActivityAtMs: number | null = null;
  terminalAtMs: number | null = null;
  backend: WorkflowRunBackend | null = null;
  readonly logChunks: string[] = [];

  constructor(
    runId: string,
    spec: ResolvedWorkflowRunSpec,
    meta: ExecutionMeta,
    createdAtMs: number,
  ) {
    this.runId = runId;
    this.spec = spec;
    this.meta = meta;
    this.createdAtMs = createdAtMs;
  }

  toRecord(): WorkflowRunRecord {
    const elapsedMs =
      this.startedAtMs !== null && this.terminalAtMs !== null
        ? this.terminalAtMs - this.startedAtMs
        : null;
    const iso = (ms: number | null): string | null =>
      ms === null ? null : new Date(ms).toISOString();
    return {
      runId: this.runId,
      workflow: this.spec.slot.workflow,
      phase: this.spec.slot.phase,
      methodologyAttempt: this.spec.slot.methodologyAttempt ?? null,
      executionAttempt: this.meta.executionAttempt,
      role: this.spec.role,
      skill: this.spec.skill,
      skillVersion: this.spec.skillVersion,
      verificationAuthority: this.spec.verificationAuthority,
      executor: this.spec.executor,
      invocationMode: this.spec.invocationMode,
      replacementReason: this.meta.replacementReason,
      previousExecutionId: this.meta.previousExecutionId,
      workspaces: this.spec.workspaces,
      permissionProfile: this.spec.permissionProfile,
      orchestrator: this.spec.orchestrator,
      pid: this.pid,
      providerSessionId: this.providerSessionId,
      status: this.status,
      terminalDisposition: this.terminalDisposition,
      terminalReason: this.terminalReason,
      createdAt: new Date(this.createdAtMs).toISOString(),
      startedAt: iso(this.startedAtMs),
      lastActivityAt: iso(this.lastActivityAtMs),
      terminalAt: iso(this.terminalAtMs),
      logLocation: workflowRunLogLocation(this.runId),
      accounting: {
        allocatedAt: new Date(this.createdAtMs).toISOString(),
        startedAt: iso(this.startedAtMs),
        endedAt: iso(this.terminalAtMs),
        elapsedMs,
        executor: this.spec.executor,
        executionAttempt: this.meta.executionAttempt,
        replacementCount: this.meta.replacementCount,
        terminalDisposition: this.terminalDisposition,
      },
    };
  }
}

export interface WorkflowReplacement {
  readonly previous: WorkflowRunRecord;
  readonly next: WorkflowRunRecord;
}

export class WorkflowRunRegistry {
  readonly #createBackend: WorkflowRunBackendFactory;
  readonly #publish: WorkflowRunEventPublisher;
  readonly #now: () => number;
  readonly #runs = new Map<string, InternalRun>();
  readonly #canonicalBySlot = new Map<string, string>();
  readonly #pendingBySlot = new Map<string, Promise<WorkflowRunRecord>>();
  #closed = false;

  constructor(options: WorkflowRunRegistryOptions) {
    this.#createBackend = options.createBackend;
    this.#publish = options.publishEvent;
    this.#now = options.now ?? ((): number => Date.now());
  }

  async allocate(
    request: WorkflowRunRequest,
  ): Promise<{ run: WorkflowRunRecord; duplicate: boolean }> {
    if (this.#closed) {
      throw new WorkflowRunConflictError("the Harness host is shutting down");
    }
    const spec = resolveSpec(request);
    const key = slotKey(spec.slot);

    const active = this.#activeRunForSlot(key);
    if (active !== undefined) {
      return { run: active.toRecord(), duplicate: true };
    }
    const pending = this.#pendingBySlot.get(key);
    if (pending !== undefined) {
      return { run: await pending, duplicate: true };
    }

    const creation = this.#createExecution(spec, {
      executionAttempt: 1,
      previousExecutionId: null,
      replacementReason: null,
      replacementCount: 0,
    });
    this.#pendingBySlot.set(key, creation);
    try {
      return { run: await creation, duplicate: false };
    } finally {
      this.#pendingBySlot.delete(key);
    }
  }

  get(runId: string): WorkflowRunRecord | undefined {
    return this.#runs.get(runId)?.toRecord();
  }

  list(): WorkflowRunRecord[] {
    return [...this.#runs.values()].map((run) => run.toRecord());
  }

  log(runId: string): string | undefined {
    const run = this.#runs.get(runId);
    return run === undefined ? undefined : run.logChunks.join("");
  }

  async cancel(runId: string, reason?: string): Promise<WorkflowRunRecord> {
    const run = this.#runs.get(runId);
    if (run === undefined) {
      throw new WorkflowRunNotFoundError(`unknown workflow run: ${runId}`);
    }
    if (!isActiveWorkflowRunStatus(run.status)) {
      throw new WorkflowRunConflictError(
        `workflow run ${runId} is already ${run.status}`,
      );
    }
    await this.#terminate(run, "cancelled", reason ?? null);
    return run.toRecord();
  }

  async replace(
    runId: string,
    request: WorkflowReplaceRequest,
  ): Promise<WorkflowReplacement> {
    const prior = this.#runs.get(runId);
    if (prior === undefined) {
      throw new WorkflowRunNotFoundError(`unknown workflow run: ${runId}`);
    }
    const key = slotKey(prior.spec.slot);
    if (this.#canonicalBySlot.get(key) !== runId) {
      throw new WorkflowRunConflictError(
        `workflow run ${runId} is not the canonical execution for its slot`,
      );
    }

    // Replacement is a separate host operation: the prior execution is given an
    // explicit terminal disposition before the next execution attempt is
    // allocated. An active execution is never silently replaced, and the
    // successor is never allocated while its predecessor is still active.
    if (isActiveWorkflowRunStatus(prior.status)) {
      await this.#terminate(prior, "replaced", request.reason);
    }

    const executor = request.executor ?? prior.spec.executor;
    const invocationMode: WorkflowInvocationMode =
      request.invocationMode ??
      (executor === prior.spec.executor ? "retry" : "fallback");
    const nextSpec: ResolvedWorkflowRunSpec = {
      ...prior.spec,
      executor,
      invocationMode,
      prompt: request.prompt ?? prior.spec.prompt,
    };
    const next = await this.#createExecution(nextSpec, {
      executionAttempt: prior.meta.executionAttempt + 1,
      previousExecutionId: prior.runId,
      replacementReason: request.reason,
      replacementCount: prior.meta.replacementCount + 1,
    });
    return { previous: prior.toRecord(), next };
  }

  async close(): Promise<void> {
    this.#closed = true;
    for (const run of this.#runs.values()) {
      if (isActiveWorkflowRunStatus(run.status)) {
        await this.#terminate(run, "cancelled", "host shutdown");
      }
    }
  }

  #activeRunForSlot(key: string): InternalRun | undefined {
    const canonicalId = this.#canonicalBySlot.get(key);
    if (canonicalId === undefined) return undefined;
    const run = this.#runs.get(canonicalId);
    return run !== undefined && isActiveWorkflowRunStatus(run.status)
      ? run
      : undefined;
  }

  async #createExecution(
    spec: ResolvedWorkflowRunSpec,
    meta: ExecutionMeta,
  ): Promise<WorkflowRunRecord> {
    let runId = randomUUID();
    while (this.#runs.has(runId)) {
      runId = randomUUID();
    }
    const run = new InternalRun(runId, spec, meta, this.#now());
    this.#runs.set(runId, run);
    this.#canonicalBySlot.set(slotKey(spec.slot), runId);
    this.#emit("workflow-run.allocated", run);

    let backend: WorkflowRunBackend;
    try {
      backend = await this.#createBackend({ runId, spec });
    } catch (error) {
      run.status = "failed";
      run.terminalDisposition = "failed";
      run.terminalReason =
        error instanceof Error ? error.message : "backend creation failed";
      run.terminalAtMs = this.#now();
      this.#emit("workflow-run.failed", run);
      return run.toRecord();
    }

    run.backend = backend;
    run.pid = backend.pid ?? null;
    run.providerSessionId = backend.providerSessionId ?? null;
    run.status = "running";
    run.startedAtMs = this.#now();
    backend.onActivity((chunk) => {
      this.#onActivity(run, chunk);
    });
    backend.onExit((outcome) => {
      this.#onExit(run, outcome);
    });
    this.#emit("workflow-run.started", run);
    return run.toRecord();
  }

  #onActivity(run: InternalRun, chunk: string): void {
    if (!isActiveWorkflowRunStatus(run.status)) return;
    run.logChunks.push(chunk);
    run.lastActivityAtMs = this.#now();
    this.#emit("workflow-run.activity", run, {
      bytes: Buffer.byteLength(chunk, "utf8"),
    });
  }

  #onExit(run: InternalRun, outcome: WorkflowRunExitOutcome): void {
    if (!isActiveWorkflowRunStatus(run.status)) return;
    const disposition: WorkflowRunDisposition = outcome.ok
      ? "completed"
      : "failed";
    run.status = disposition;
    run.terminalDisposition = disposition;
    run.terminalReason = outcome.reason ?? null;
    run.terminalAtMs = this.#now();
    this.#emit(
      outcome.ok ? "workflow-run.completed" : "workflow-run.failed",
      run,
    );
  }

  async #terminate(
    run: InternalRun,
    disposition: Exclude<WorkflowRunDisposition, "completed">,
    reason: string | null,
  ): Promise<void> {
    run.status = disposition;
    run.terminalDisposition = disposition;
    run.terminalReason = reason;
    run.terminalAtMs = this.#now();
    const backend = run.backend;
    if (backend !== null) {
      try {
        await backend.stop();
      } catch (error) {
        console.error("Failed to stop workflow run backend", {
          runId: run.runId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    const eventType = (
      {
        failed: "workflow-run.failed",
        cancelled: "workflow-run.cancelled",
        replaced: "workflow-run.replaced",
      } as const
    )[disposition];
    this.#emit(eventType, run);
  }

  #emit(
    type: WorkflowRunEventType,
    run: InternalRun,
    extra: Record<string, unknown> = {},
  ): void {
    const record = run.toRecord();
    this.#publish(type, run.runId, {
      runId: record.runId,
      workflow: record.workflow,
      phase: record.phase,
      methodologyAttempt: record.methodologyAttempt,
      executionAttempt: record.executionAttempt,
      role: record.role,
      executor: record.executor,
      invocationMode: record.invocationMode,
      status: record.status,
      terminalDisposition: record.terminalDisposition,
      previousExecutionId: record.previousExecutionId,
      ...extra,
    });
  }
}
