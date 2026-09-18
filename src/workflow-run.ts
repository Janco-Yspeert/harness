import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";

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
  "delegated" | "direct" | "retry" | "fallback" | "fixture";

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
  "git-publish",
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
  // Direct protected-role execution is deliberately a different route from a
  // delegated allocation.  This is an explicit host-side assertion made by
  // the local human-facing entrypoint, never something inferred from a prompt.
  readonly humanAuthorization?: boolean | undefined;
}

export type WorkflowRoleDisposition =
  "pending" | "succeeded" | "blocked" | "refused" | "failed";

export interface WorkflowRoleResultRequest {
  readonly role: string;
  readonly methodologyAttempt?: string | undefined;
  readonly skill: string | null;
  readonly skillVersion: string | null;
  readonly verificationAuthority: Record<string, unknown> | null;
  readonly disposition: Exclude<WorkflowRoleDisposition, "pending">;
  readonly reason?: string | undefined;
}

export interface WorkflowBackendRoleResult {
  readonly disposition: Exclude<WorkflowRoleDisposition, "pending">;
  readonly reason?: string | undefined;
}

export type WorkflowContractDeliveryMode =
  | "host-directed-repository-load"
  | "host-directed-pinned-snapshot"
  | "claude-system-contract";

export interface ResolvedWorkflowContract {
  // Host-captured bytes, never populated from the request or reloaded by an adapter.
  readonly content: string;
  readonly name: string;
  readonly path: string;
  readonly version: string;
  readonly identity: string;
  readonly deliveryMode: WorkflowContractDeliveryMode;
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
  readonly contract: ResolvedWorkflowContract;
  readonly allocationAuthority: Record<string, unknown>;
  readonly verificationAuthority: Record<string, unknown> | null;
  readonly orchestrator: string | null;
  readonly prompt: string | null;
  readonly fixture?: WorkflowFixtureBinding | null;
}

export interface WorkflowFixtureBinding {
  readonly name: string;
  readonly identity: string;
  readonly definitionPath: string;
  readonly definitionIdentity: string;
  readonly candidateCommit: string;
  readonly handoffIdentity: string;
  readonly parentRunId: string | null;
  readonly permittedSideEffects: "none";
  readonly expectedRoleDisposition: "succeeded";
}

export interface WorkflowFixtureRequest {
  readonly workflow: string;
  readonly fixture: string;
  readonly candidateCommit: string;
  readonly parentRunId?: string | undefined;
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
  readonly contractIdentity: string;
  readonly contractDeliveryMode: WorkflowContractDeliveryMode;
  readonly allocationAuthority: Record<string, unknown>;
  readonly verificationAuthority: Record<string, unknown> | null;
  readonly executor: string;
  readonly invocationMode: WorkflowInvocationMode;
  readonly replacementReason: string | null;
  readonly previousExecutionId: string | null;
  readonly workspaces: readonly string[];
  readonly scratchWorkspace: string | null;
  readonly permissionProfile: WorkflowPermissionProfile;
  readonly orchestrator: string | null;
  readonly pid: number | null;
  readonly providerSessionId: string | null;
  readonly status: WorkflowRunStatus;
  readonly terminalDisposition: WorkflowRunDisposition | null;
  readonly terminalReason: string | null;
  readonly roleDisposition: WorkflowRoleDisposition;
  readonly roleResult:
    | (Omit<WorkflowRoleResultRequest, "reason"> & {
        readonly reason: string | null;
        readonly recordedAt: string;
        readonly contractIdentity: string;
        readonly contractDeliveryMode: WorkflowContractDeliveryMode;
      })
    | null;
  readonly fixture: WorkflowFixtureBinding | null;
  readonly createdAt: string;
  readonly startedAt: string | null;
  readonly lastActivityAt: string | null;
  readonly terminalAt: string | null;
  readonly logLocation: string;
  readonly accounting: WorkflowRunAccounting;
  readonly publishResult: WorkflowPublishResult | null;
}

// Host-mediated publication result: the role reports a commit it already
// created; the host verifies it, pushes it using host-owned credentials, and
// records what happened here. The provider process never needs network or
// Git-remote credentials of its own for this to succeed.
export interface WorkflowPublishResult {
  readonly commit: string;
  readonly branch: string;
  readonly pushed: boolean;
  readonly at: string;
}

export function isSuccessfulWorkflowFixtureEvidence(
  record: WorkflowRunRecord,
  expected: Pick<
    WorkflowFixtureRequest,
    "workflow" | "fixture" | "candidateCommit"
  >,
): boolean {
  const fixture = record.fixture;
  const authority = record.allocationAuthority;
  return (
    record.status === "completed" &&
    record.roleDisposition === "succeeded" &&
    record.workflow === expected.workflow &&
    record.phase === `fixture:${expected.fixture}` &&
    fixture?.name === expected.fixture &&
    fixture.candidateCommit === expected.candidateCommit &&
    fixture.definitionIdentity === authority.definitionIdentity &&
    fixture.handoffIdentity === authority.basisIdentity &&
    authority.type === "canonical-workflow-fixture" &&
    authority.candidateCommit === expected.candidateCommit &&
    authority.contractIdentity === record.contractIdentity
  );
}

export interface WorkflowRunExitOutcome {
  readonly ok: boolean;
  readonly reason?: string | undefined;
  readonly roleResult?: WorkflowBackendRoleResult | undefined;
}

export interface WorkflowRunBackendContext {
  readonly runId: string;
  readonly spec: ResolvedWorkflowRunSpec;
}

export interface WorkflowRunBackend {
  readonly pid?: number | undefined;
  readonly providerSessionId?: string | undefined;
  readonly scratchWorkspace?: string | undefined;
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
  | "workflow-run.replaced"
  | "workflow-run.role-succeeded"
  | "workflow-run.role-non-success"
  | "workflow-run.published";

export type WorkflowRunEventPublisher = (
  type: WorkflowRunEventType,
  streamId: string,
  data: Record<string, unknown>,
) => void;

export interface WorkflowRunRegistryOptions {
  readonly createBackend: WorkflowRunBackendFactory;
  readonly publishEvent: WorkflowRunEventPublisher;
  readonly evaluatorWorkspace?: string;
  // Host-owned durable-evidence destination, analogous to evaluatorWorkspace:
  // optional, read once at host process entry, independent of the per-run
  // authority workspace. Defaults to the run's own workspace / its
  // harness-hidden sibling (attempt 11's original, still-correct production
  // behavior) when absent.
  readonly evidenceRoot?: string;
  readonly hiddenEvidenceRoot?: string;
  readonly now?: () => number;
}

export class WorkflowRunRequestError extends Error {}
export class WorkflowRunNotFoundError extends Error {}
export class WorkflowRunConflictError extends Error {}

export function workflowRunLogLocation(runId: string): string {
  return `/workflow-runs/${runId}/log`;
}

export function parseWorkflowFixtureRequest(
  body: unknown,
): WorkflowFixtureRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    throw new WorkflowRunRequestError("fixture request must be a JSON object");
  const raw = body as Record<string, unknown>;
  if (
    !Object.keys(raw).every((key) =>
      ["workflow", "fixture", "candidateCommit", "parentRunId"].includes(key),
    )
  )
    throw new WorkflowRunRequestError(
      "fixture request only accepts workflow, fixture, candidateCommit, and optional parentRunId",
    );
  const fixture = requireString(raw.fixture, "fixture");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(fixture))
    throw new WorkflowRunRequestError("fixture is not a valid fixture name");
  const candidateCommit = requireString(raw.candidateCommit, "candidateCommit");
  if (!/^[a-f0-9]{40}$/.test(candidateCommit))
    throw new WorkflowRunRequestError(
      "candidateCommit must be a full lowercase Git commit identity",
    );
  return {
    workflow: requireString(raw.workflow, "workflow"),
    fixture,
    candidateCommit,
    parentRunId: optionalString(raw.parentRunId, "parentRunId"),
  };
}

export interface WorkflowPublishRequest {
  readonly commit: string;
  readonly branch: string;
}

export function parseWorkflowPublishRequest(
  body: unknown,
): WorkflowPublishRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    throw new WorkflowRunRequestError("publish request must be a JSON object");
  const raw = body as Record<string, unknown>;
  if (!Object.keys(raw).every((key) => ["commit", "branch"].includes(key)))
    throw new WorkflowRunRequestError(
      "publish request only accepts commit and branch",
    );
  const commit = requireString(raw.commit, "commit");
  if (!/^[a-f0-9]{40}$/.test(commit))
    throw new WorkflowRunRequestError(
      "commit must be a full lowercase Git commit identity",
    );
  const branch = requireString(raw.branch, "branch");
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch) || branch.includes(".."))
    throw new WorkflowRunRequestError("branch is not a valid branch name");
  return { commit, branch };
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
  readonly sourcePath: string;
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
      `Pinned evaluator bootstrap authority has no ${field} object`,
    );
  }
  return raw[field] as Record<string, unknown>;
}

// The host, rather than a caller-side workflow helper, owns pinned evaluator
// authority. Any workflow that declares a pinned snapshot resolves and checks
// it here, so direct API allocation and CLI dispatch cannot diverge.
interface WorkflowLocation {
  readonly workflow: string;
  readonly path: string;
  readonly repositoryPath: string;
}

function resolveWorkflowLocation(
  request: WorkflowRunRequest,
): WorkflowLocation {
  if (!/^[0-9]{3}[a-z]*(?:-[A-Za-z0-9._-]+)?$/.test(request.slot.workflow)) {
    throw new WorkflowRunRequestError(
      "slot.workflow is not a valid workflow identifier",
    );
  }
  const spikesPath = resolve(request.workspace, "spikes");
  const exact = resolve(spikesPath, request.slot.workflow);
  let selected: string | undefined;
  if (existsSync(exact) && statSync(exact).isDirectory()) {
    selected = request.slot.workflow;
  } else {
    let entries;
    try {
      entries = readdirSync(spikesPath, { withFileTypes: true });
    } catch {
      throw new WorkflowRunRequestError(
        `unable to resolve canonical workflow: ${request.slot.workflow}`,
      );
    }
    const matches = entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          entry.name.startsWith(`${request.slot.workflow}-`),
      )
      .map((entry) => entry.name);
    if (matches.length === 1) selected = matches[0];
  }
  if (selected === undefined) {
    throw new WorkflowRunRequestError(
      `unable to resolve canonical workflow: ${request.slot.workflow}`,
    );
  }
  return {
    workflow: selected,
    path: resolve(spikesPath, selected),
    repositoryPath: `spikes/${selected}`,
  };
}

function resolvePinnedVerificationAuthority(
  request: WorkflowRunRequest,
  workflow: WorkflowLocation,
): PinnedVerificationAuthority | undefined {
  if (!request.slot.phase.startsWith("evaluator-")) return undefined;
  const authorityPath = resolve(
    workflow.path,
    "bootstrap/evaluator-authority.json",
  );
  if (!existsSync(authorityPath)) return undefined;

  let authorityRaw: unknown;
  try {
    authorityRaw = JSON.parse(readFileSync(authorityPath, "utf8"));
  } catch (error) {
    throw new WorkflowRunRequestError(
      `Unable to read pinned evaluator bootstrap authority: ${
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
      "Pinned evaluator bootstrap authority is invalid",
    );
  }

  let snapshot: string;
  let committedSource: string;
  try {
    snapshot = readFileSync(resolve(workflow.path, snapshotPath), "utf8");
    committedSource = execFileSync(
      "git",
      ["-C", request.workspace, "show", `${sourceCommit}:${sourcePath}`],
      { encoding: "utf8" },
    );
  } catch (error) {
    throw new WorkflowRunRequestError(
      `Unable to validate pinned evaluator bootstrap authority: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  if (sha256(snapshot) !== identity) {
    throw new WorkflowRunRequestError(
      "Pinned evaluator bootstrap snapshot identity does not match authority",
    );
  }
  if (sha256(committedSource) !== identity) {
    throw new WorkflowRunRequestError(
      "Pinned evaluator bootstrap source provenance does not match authority",
    );
  }
  return {
    name,
    contractVersion,
    sourceCommit,
    sourcePath,
    identity,
    snapshotPath,
  };
}

function sameAuthority(
  left: Record<string, unknown>,
  right: PinnedVerificationAuthority,
): boolean {
  return (
    left.name === right.name &&
    left.contractVersion === right.contractVersion &&
    left.sourceCommit === right.sourceCommit &&
    left.sourcePath === right.sourcePath &&
    left.identity === right.identity &&
    left.snapshotPath === right.snapshotPath &&
    Object.keys(left).length === 6
  );
}

const ROLE_CONTRACTS: Readonly<Record<string, string>> = {
  "brief-readiness": "brief-readiness",
  "design-map": "design-map",
  "evaluator-prepare": "evaluator",
  "evaluator-repair": "evaluator",
  "evaluator-verify": "evaluator",
  implementation: "implementation",
  "as-built": "as-built",
  outcome: "outcome",
};

function resolveRepositoryContract(
  request: WorkflowRunRequest,
  workflow: WorkflowLocation,
  pinned: PinnedVerificationAuthority | undefined,
): ResolvedWorkflowContract {
  const name = ROLE_CONTRACTS[request.role];
  if (name === undefined) {
    throw new WorkflowRunRequestError(
      `unknown governed workflow role: ${request.role}`,
    );
  }
  if (
    request.role.startsWith("evaluator-") &&
    request.slot.phase !== request.role
  ) {
    throw new WorkflowRunRequestError("role must match slot.phase");
  }
  const path =
    pinned === undefined
      ? `skills/${name}/SKILL.md`
      : `${workflow.repositoryPath}/${pinned.snapshotPath}`;
  let content: string;
  try {
    content = readFileSync(resolve(request.workspace, path), "utf8");
  } catch (error) {
    throw new WorkflowRunRequestError(
      `unable to read resolved workflow contract ${path}: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  const version =
    pinned === undefined
      ? /^Contract version:\s*(\d+)$/m.exec(content)?.[1]
      : String(pinned.contractVersion);
  if (version === undefined) {
    throw new WorkflowRunRequestError(
      `resolved workflow contract ${path} has no contract version`,
    );
  }
  const contract: ResolvedWorkflowContract = {
    content,
    name,
    path,
    version,
    identity: sha256(content),
    deliveryMode:
      pinned === undefined
        ? "host-directed-repository-load"
        : "host-directed-pinned-snapshot",
  };
  if (pinned !== undefined && contract.identity !== pinned.identity) {
    throw new WorkflowRunRequestError(
      "resolved pinned evaluator contract identity does not match authority",
    );
  }
  if (
    request.skill !== undefined &&
    request.skill !== contract.name &&
    request.skill !== contract.path &&
    request.skill !== pinned?.snapshotPath
  ) {
    throw new WorkflowRunRequestError(
      "caller skill does not match the resolved contract",
    );
  }
  if (request.skillVersion !== undefined && request.skillVersion !== version) {
    throw new WorkflowRunRequestError(
      "caller skill version does not match the resolved contract",
    );
  }
  return contract;
}

interface CanonicalWorkflowEvent {
  readonly transition: string;
  readonly evidence: Record<string, unknown>;
}

interface RepositoryFixtureDefinition {
  readonly version: 1;
  readonly identity: string;
  readonly canonicalPrerequisite: "current-implementation-handoff";
  readonly role: string;
  readonly executor: "claude" | "codex";
  readonly contract: {
    readonly name: string;
    readonly version: number;
    readonly identity: string;
    readonly deliveryMode: WorkflowContractDeliveryMode;
  };
  // The permission profile a fixture declares must describe the effective,
  // host-resolved binding it will actually run under (never a narrower,
  // aspirational one) -- allocateFixture cross-checks this against the
  // profile resolvePermissionProfile actually returns.
  readonly permissionProfile: WorkflowPermissionProfileName;
  readonly permittedSideEffects: "none";
  readonly expectedRoleDisposition: "succeeded";
  readonly prompt: string;
}

function parseRepositoryFixtureDefinition(
  content: string,
): RepositoryFixtureDefinition {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new WorkflowRunRequestError("fixture definition is not valid JSON");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new WorkflowRunRequestError("fixture definition must be an object");
  const raw = value as Record<string, unknown>;
  const contract = raw.contract;
  if (
    raw.version !== 1 ||
    typeof raw.identity !== "string" ||
    raw.identity.length === 0 ||
    raw.canonicalPrerequisite !== "current-implementation-handoff" ||
    typeof raw.role !== "string" ||
    (raw.executor !== "claude" && raw.executor !== "codex") ||
    typeof contract !== "object" ||
    contract === null ||
    Array.isArray(contract) ||
    !WORKFLOW_PERMISSION_PROFILES.includes(
      raw.permissionProfile as WorkflowPermissionProfileName,
    ) ||
    raw.permittedSideEffects !== "none" ||
    raw.expectedRoleDisposition !== "succeeded" ||
    typeof raw.prompt !== "string"
  )
    throw new WorkflowRunRequestError("fixture definition is invalid");
  const contractRaw = contract as Record<string, unknown>;
  if (
    typeof contractRaw.name !== "string" ||
    typeof contractRaw.version !== "number" ||
    typeof contractRaw.identity !== "string" ||
    ![
      "host-directed-repository-load",
      "host-directed-pinned-snapshot",
      "claude-system-contract",
    ].includes(String(contractRaw.deliveryMode))
  )
    throw new WorkflowRunRequestError("fixture contract definition is invalid");
  return value as RepositoryFixtureDefinition;
}

function canonicalEvents(ledger: string): CanonicalWorkflowEvent[] {
  return ledger
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => {
      const value: unknown = JSON.parse(line);
      if (typeof value !== "object" || value === null || Array.isArray(value))
        throw new WorkflowRunRequestError(
          "canonical workflow authority contains an invalid event",
        );
      const event = value as Record<string, unknown>;
      if (
        typeof event.transition !== "string" ||
        typeof event.evidence !== "object" ||
        event.evidence === null ||
        Array.isArray(event.evidence)
      )
        throw new WorkflowRunRequestError(
          "canonical workflow authority contains an invalid event",
        );
      return {
        transition: event.transition,
        evidence: event.evidence as Record<string, unknown>,
      };
    });
}

function verifyCanonicalArtifact(
  request: WorkflowRunRequest,
  workflow: WorkflowLocation,
  event: CanonicalWorkflowEvent | undefined,
): CanonicalWorkflowEvent {
  if (event === undefined)
    throw new WorkflowRunRequestError(
      "canonical workflow prerequisite is missing",
    );
  const path = event.evidence.path;
  const commit = event.evidence.commit;
  const identity = event.evidence.identity;
  if (
    typeof path !== "string" ||
    path.startsWith("/") ||
    path.includes("..") ||
    typeof commit !== "string" ||
    typeof identity !== "string"
  )
    throw new WorkflowRunRequestError(
      `${event.transition} has invalid canonical artifact evidence`,
    );
  const absolute = resolve(workflow.path, path);
  let current: string;
  let committed: string;
  try {
    current = readFileSync(absolute, "utf8");
    committed = execFileSync(
      "git",
      [
        "-C",
        request.workspace,
        "show",
        `${commit}:${relative(request.workspace, absolute)}`,
      ],
      { encoding: "utf8" },
    );
  } catch (error) {
    throw new WorkflowRunRequestError(
      `unable to verify ${event.transition} canonical provenance: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  if (sha256(current) !== identity || sha256(committed) !== identity)
    throw new WorkflowRunRequestError(
      `${event.transition} canonical artifact identity does not match provenance`,
    );
  return event;
}

function canonicalEvaluatorAuthority(
  request: WorkflowRunRequest,
  workflow: WorkflowLocation,
  contract: ResolvedWorkflowContract,
  pinned: PinnedVerificationAuthority | undefined,
): Record<string, unknown> {
  let ledger: string;
  try {
    ledger = readFileSync(resolve(workflow.path, "workflow.jsonl"), "utf8");
  } catch (error) {
    throw new WorkflowRunRequestError(
      `unable to read canonical workflow authority: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  const events = canonicalEvents(ledger);
  const has = (transition: string): boolean =>
    events.some((event) => event.transition === transition);
  const latest = (transition: string): CanonicalWorkflowEvent | undefined =>
    [...events].reverse().find((event) => event.transition === transition);
  verifyCanonicalArtifact(request, workflow, latest("brief-frozen"));
  verifyCanonicalArtifact(request, workflow, latest("design-map-frozen"));
  const currentCycle = [...events]
    .reverse()
    .find((event) => event.transition === "correction-cycle-opened")
    ?.evidence.cycle;
  const cycleEvents =
    typeof currentCycle === "string"
      ? events.filter((event) => event.evidence.cycle === currentCycle)
      : events;
  const currentHas = (transition: string): boolean =>
    cycleEvents.some((event) => event.transition === transition);
  const currentLatest = (
    transition: string,
  ): CanonicalWorkflowEvent | undefined =>
    [...cycleEvents].reverse().find((event) => event.transition === transition);
  let basis: CanonicalWorkflowEvent | undefined;
  if (request.slot.phase === "evaluator-prepare") {
    basis = latest("design-map-frozen");
  } else if (request.slot.phase === "evaluator-verify") {
    if (has("evaluation-prepared") && currentHas("implementation-handoff")) {
      verifyCanonicalArtifact(request, workflow, latest("evaluation-prepared"));
      const handoff = currentLatest("implementation-handoff");
      basis = currentLatest("verification-allocated");
      if (
        handoff === undefined ||
        basis === undefined ||
        typeof handoff.evidence.commit !== "string" ||
        basis.evidence.commit !== handoff.evidence.commit
      )
        throw new WorkflowRunRequestError(
          "verification allocation does not bind the canonical implementation handoff",
        );
    }
  } else if (request.slot.phase === "evaluator-repair") {
    basis = [...cycleEvents]
      .reverse()
      .find(
        (event) =>
          (event.transition === "correction-cycle-opened" &&
            event.evidence.evaluatorRepair === true) ||
          (event.transition === "verification-finalized" &&
            event.evidence.classification === "EVALUATOR_DEFECT"),
      );
  }
  if (basis === undefined) {
    throw new WorkflowRunRequestError(
      `canonical workflow authority does not permit ${request.slot.phase}`,
    );
  }
  return {
    type: "canonical-workflow",
    workflow: workflow.repositoryPath,
    phase: request.slot.phase,
    methodologyAttempt: request.slot.methodologyAttempt ?? null,
    ledgerIdentity: sha256(ledger),
    basisTransition: basis.transition,
    basisIdentity: sha256(JSON.stringify(basis)),
    contractIdentity: contract.identity,
    ...(pinned === undefined ? {} : { pinnedContractAuthority: { ...pinned } }),
  };
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
    humanAuthorization:
      raw.humanAuthorization === undefined
        ? undefined
        : raw.humanAuthorization === true
          ? true
          : (() => {
              throw new WorkflowRunRequestError(
                "humanAuthorization must be true when supplied",
              );
            })(),
  };
}

export function parseWorkflowRoleResultRequest(
  body: unknown,
): WorkflowRoleResultRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    throw new WorkflowRunRequestError("role result must be a JSON object");
  const raw = body as Record<string, unknown>;
  const disposition = requireString(raw.disposition, "disposition");
  if (!["succeeded", "blocked", "refused", "failed"].includes(disposition))
    throw new WorkflowRunRequestError("invalid role disposition");
  const nullableString = (value: unknown, field: string): string | null => {
    if (value === null) return null;
    return requireString(value, field);
  };
  const authority = raw.verificationAuthority;
  if (
    authority !== null &&
    (typeof authority !== "object" || Array.isArray(authority))
  )
    throw new WorkflowRunRequestError(
      "verificationAuthority must be an object or null",
    );
  return {
    role: requireString(raw.role, "role"),
    methodologyAttempt: optionalString(
      raw.methodologyAttempt,
      "methodologyAttempt",
    ),
    skill: nullableString(raw.skill, "skill"),
    skillVersion: nullableString(raw.skillVersion, "skillVersion"),
    verificationAuthority: authority as Record<string, unknown> | null,
    disposition: disposition as Exclude<WorkflowRoleDisposition, "pending">,
    reason: optionalString(raw.reason, "reason"),
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
  grantHiddenEvaluatorWorkspace: boolean,
): WorkflowPermissionProfile {
  if (name === "evaluator") {
    if (evaluatorWorkspace === undefined) {
      throw new WorkflowRunRequestError(
        "the evaluator permission profile requires a declared evaluatorWorkspace",
      );
    }
    const hiddenWorkspace = grantHiddenEvaluatorWorkspace
      ? process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE
      : undefined;
    const expectedHiddenWorkspace = resolve(workspace, "..", "harness-hidden");
    if (
      hiddenWorkspace !== undefined &&
      resolve(hiddenWorkspace) !== expectedHiddenWorkspace
    ) {
      throw new WorkflowRunRequestError(
        "HARNESS_EVALUATOR_HIDDEN_WORKSPACE must name the repository sibling harness-hidden",
      );
    }
    return {
      id: "evaluator",
      workspaces:
        hiddenWorkspace === undefined
          ? [workspace, evaluatorWorkspace]
          : [workspace, evaluatorWorkspace, expectedHiddenWorkspace],
      capabilities: [...WORKFLOW_WORKER_CAPABILITIES],
    };
  }
  return {
    id: "repo-local-worker",
    workspaces: [workspace],
    capabilities: [...WORKFLOW_WORKER_CAPABILITIES],
  };
}

function resolveSpec(
  request: WorkflowRunRequest,
  hostEvaluatorWorkspace: string | undefined,
): ResolvedWorkflowRunSpec {
  const protectedRole = request.role.startsWith("evaluator-");
  const directHuman =
    request.invocationMode === "direct" && request.humanAuthorization === true;
  const workflow = resolveWorkflowLocation(request);
  const pinnedAuthority = resolvePinnedVerificationAuthority(request, workflow);
  const contract = resolveRepositoryContract(
    request,
    workflow,
    pinnedAuthority,
  );
  const delegatedAuthority =
    protectedRole && !directHuman
      ? canonicalEvaluatorAuthority(
          request,
          workflow,
          contract,
          pinnedAuthority,
        )
      : undefined;
  if (protectedRole && delegatedAuthority === undefined && !directHuman) {
    throw new WorkflowRunRequestError(
      "protected evaluator roles require a canonical pinned allocation or explicit human authorization",
    );
  }
  if (request.verificationAuthority !== undefined && protectedRole) {
    const exactCanonical =
      JSON.stringify(request.verificationAuthority) ===
      JSON.stringify(delegatedAuthority);
    const exactPin =
      pinnedAuthority !== undefined &&
      sameAuthority(request.verificationAuthority, pinnedAuthority);
    if (!exactCanonical && !exactPin)
      throw new WorkflowRunRequestError(
        "evaluator authority does not match canonical workflow authority",
      );
  }
  const permissionProfile = resolvePermissionProfile(
    protectedRole
      ? "evaluator"
      : (request.permissionProfile ?? "repo-local-worker"),
    request.workspace,
    protectedRole ? hostEvaluatorWorkspace : request.evaluatorWorkspace,
    protectedRole,
  );
  return {
    slot: { ...request.slot, workflow: workflow.workflow },
    role: request.role,
    executor: request.executor,
    invocationMode: request.invocationMode ?? "delegated",
    workspaces: permissionProfile.workspaces,
    permissionProfile,
    skill: contract.path,
    skillVersion: contract.version,
    contract:
      request.executor === "claude" && delegatedAuthority !== undefined
        ? { ...contract, deliveryMode: "claude-system-contract" }
        : contract,
    allocationAuthority:
      protectedRole && directHuman
        ? { type: "explicit-human" }
        : (delegatedAuthority ?? { type: "host-workflow-allocation" }),
    verificationAuthority: protectedRole
      ? (delegatedAuthority ?? { type: "explicit-human" })
      : null,
    orchestrator: request.orchestrator ?? null,
    prompt: request.prompt ?? null,
    fixture: null,
  };
}

// Two distinct canonical allocations (e.g. two separate `verification-allocated`
// ledger events) can legitimately target the same (workflow, phase,
// methodologyAttempt) — that tuple alone identifies the methodology attempt,
// not the specific canonical allocation. Folding in the resolved allocation's
// basis identity (already the hash of the exact canonical ledger event, so no
// new counter is invented) keeps a repeated allocation with unchanged
// authority idempotent while giving a genuinely new canonical allocation its
// own slot instead of silently rebinding to a stale prior run.
function slotKey(
  slot: WorkflowRunSlot,
  allocationAuthority?: Record<string, unknown>,
): string {
  const basisIdentity = allocationAuthority?.basisIdentity;
  return JSON.stringify([
    slot.workflow,
    slot.phase,
    slot.methodologyAttempt ?? null,
    typeof basisIdentity === "string" ? basisIdentity : null,
  ]);
}

// Durable host-owned run evidence, public/private split.
//
// On terminal disposition a run becomes durable evidence on disk, reusing the
// existing `<spike>/.workflow/` convention. Which side of the split a run
// lands on is keyed generically off its resolved permission profile (whether
// it was granted the private hidden-workspace mirror), never off spike or
// provider identity: a run that never reached `harness-hidden` is durable in
// full at the public per-workflow location; a run that did is durable in full
// only under the mirrored private location (matching how
// `resolvePermissionProfile` grants that access in the first place), and the
// public location instead gets a sanitized manifest — binding/identity
// fields only, no free-text `roleResult.reason` — plus a `logIdentity` hash
// of the private raw log linking the two without exposing its content.
function grantsHiddenWorkspace(
  profile: WorkflowPermissionProfile,
  workspace: string,
): boolean {
  return profile.workspaces.includes(
    resolve(workspace, "..", "harness-hidden"),
  );
}

// `root` is a durable-evidence destination, never the authority/contract
// workspace: production defaults it from the run's workspace (below), but a
// host operator or test can redirect it independently via
// WorkflowRunRegistryOptions#evidenceRoot / #hiddenEvidenceRoot without
// changing which workspace canonical authority and contracts are read from.
function durableRunsDir(root: string, workflow: string): string {
  return resolve(root, "spikes", workflow, ".workflow", "runs");
}

function defaultHiddenEvidenceRoot(workspace: string): string {
  return resolve(workspace, "..", "harness-hidden");
}

function writeDurableFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, content, { mode: 0o600 });
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
  roleDisposition: WorkflowRoleDisposition = "pending";
  roleResult: WorkflowRunRecord["roleResult"] = null;
  pid: number | null = null;
  providerSessionId: string | null = null;
  scratchWorkspace: string | null = null;
  startedAtMs: number | null = null;
  lastActivityAtMs: number | null = null;
  terminalAtMs: number | null = null;
  backend: WorkflowRunBackend | null = null;
  publishResult: WorkflowPublishResult | null = null;
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
      contractIdentity: this.spec.contract.identity,
      contractDeliveryMode: this.spec.contract.deliveryMode,
      allocationAuthority: this.spec.allocationAuthority,
      verificationAuthority: this.spec.verificationAuthority,
      executor: this.spec.executor,
      invocationMode: this.spec.invocationMode,
      replacementReason: this.meta.replacementReason,
      previousExecutionId: this.meta.previousExecutionId,
      workspaces:
        this.scratchWorkspace === null
          ? this.spec.workspaces
          : [...this.spec.workspaces, this.scratchWorkspace],
      scratchWorkspace: this.scratchWorkspace,
      permissionProfile: this.spec.permissionProfile,
      orchestrator: this.spec.orchestrator,
      pid: this.pid,
      providerSessionId: this.providerSessionId,
      status: this.status,
      terminalDisposition: this.terminalDisposition,
      terminalReason: this.terminalReason,
      roleDisposition: this.roleDisposition,
      roleResult: this.roleResult,
      fixture: this.spec.fixture ?? null,
      createdAt: new Date(this.createdAtMs).toISOString(),
      startedAt: iso(this.startedAtMs),
      lastActivityAt: iso(this.lastActivityAtMs),
      terminalAt: iso(this.terminalAtMs),
      logLocation: workflowRunLogLocation(this.runId),
      publishResult: this.publishResult,
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
  readonly #evaluatorWorkspace: string | undefined;
  readonly #evidenceRoot: string | undefined;
  readonly #hiddenEvidenceRoot: string | undefined;
  readonly #runs = new Map<string, InternalRun>();
  readonly #canonicalBySlot = new Map<string, string>();
  readonly #pendingBySlot = new Map<string, Promise<WorkflowRunRecord>>();
  #closed = false;

  constructor(options: WorkflowRunRegistryOptions) {
    this.#createBackend = options.createBackend;
    this.#publish = options.publishEvent;
    this.#evaluatorWorkspace = options.evaluatorWorkspace;
    this.#evidenceRoot = options.evidenceRoot;
    this.#hiddenEvidenceRoot = options.hiddenEvidenceRoot;
    this.#now = options.now ?? ((): number => Date.now());
  }

  async allocate(
    request: WorkflowRunRequest,
  ): Promise<{ run: WorkflowRunRecord; duplicate: boolean }> {
    if (this.#closed) {
      throw new WorkflowRunConflictError("the Harness host is shutting down");
    }
    const spec = resolveSpec(request, this.#evaluatorWorkspace);
    const key = slotKey(spec.slot, spec.allocationAuthority);

    const active = this.#activeRunForSlot(key);
    if (active !== undefined) {
      return { run: active.toRecord(), duplicate: true };
    }
    const pending = this.#pendingBySlot.get(key);
    if (pending !== undefined) {
      return { run: await pending, duplicate: true };
    }

    const prior = this.#canonicalRunForSlot(key);
    if (prior?.roleDisposition === "succeeded") {
      return { run: prior.toRecord(), duplicate: true };
    }

    const creation = this.#createExecution(spec, {
      executionAttempt:
        prior === undefined ? 1 : prior.meta.executionAttempt + 1,
      previousExecutionId: prior?.runId ?? null,
      replacementReason:
        prior === undefined
          ? null
          : "retry after terminal non-successful role disposition",
      replacementCount:
        prior === undefined ? 0 : prior.meta.replacementCount + 1,
    });
    this.#pendingBySlot.set(key, creation);
    try {
      return { run: await creation, duplicate: false };
    } finally {
      this.#pendingBySlot.delete(key);
    }
  }

  async allocateFixture(
    request: WorkflowFixtureRequest,
  ): Promise<WorkflowRunRecord> {
    if (this.#closed) {
      throw new WorkflowRunConflictError("the Harness host is shutting down");
    }
    const workspace = process.cwd();
    const locationRequest: WorkflowRunRequest = {
      slot: { workflow: request.workflow, phase: "fixture" },
      role: "implementation",
      executor: "codex",
      workspace,
    };
    const workflow = resolveWorkflowLocation(locationRequest);
    const ledger = readFileSync(
      resolve(workflow.path, "workflow.jsonl"),
      "utf8",
    );
    const events = canonicalEvents(ledger);
    const latest = (transition: string): CanonicalWorkflowEvent | undefined =>
      [...events].reverse().find((event) => event.transition === transition);
    verifyCanonicalArtifact(locationRequest, workflow, latest("brief-frozen"));
    verifyCanonicalArtifact(
      locationRequest,
      workflow,
      latest("design-map-frozen"),
    );
    verifyCanonicalArtifact(
      locationRequest,
      workflow,
      latest("evaluation-prepared"),
    );
    const handoff = latest("implementation-handoff");
    if (
      handoff === undefined ||
      handoff.evidence.commit !== request.candidateCommit
    )
      throw new WorkflowRunRequestError(
        "fixture candidateCommit is not the current canonical implementation handoff",
      );
    const latestFinalization = latest("verification-finalized");
    if (
      latestFinalization?.evidence.result === "PASS" &&
      events.indexOf(latestFinalization) > events.indexOf(handoff)
    )
      throw new WorkflowRunRequestError(
        "fixture candidate is no longer eligible for verification",
      );

    const definitionPath = `${workflow.repositoryPath}/fixtures/${request.fixture}.json`;
    let definitionContent: string;
    try {
      definitionContent = execFileSync(
        "git",
        [
          "-C",
          workspace,
          "show",
          `${request.candidateCommit}:${definitionPath}`,
        ],
        { encoding: "utf8" },
      );
    } catch {
      throw new WorkflowRunRequestError(
        `unable to resolve fixture ${request.fixture} from candidate commit`,
      );
    }
    const definition = parseRepositoryFixtureDefinition(definitionContent);
    const protectedRole = definition.role.startsWith("evaluator-");
    if (!protectedRole || definition.role !== "evaluator-verify")
      throw new WorkflowRunRequestError(
        "current-implementation-handoff permits only a bounded evaluator-verify fixture",
      );
    const contractRequest: WorkflowRunRequest = {
      slot: { workflow: workflow.workflow, phase: definition.role },
      role: definition.role,
      executor: definition.executor,
      workspace,
    };
    const pinned = resolvePinnedVerificationAuthority(
      contractRequest,
      workflow,
    );
    if (pinned === undefined)
      throw new WorkflowRunRequestError(
        "protected fixture requires pinned evaluator authority",
      );
    const resolvedContract = resolveRepositoryContract(
      contractRequest,
      workflow,
      pinned,
    );
    const deliveryMode: WorkflowContractDeliveryMode =
      definition.executor === "claude"
        ? "claude-system-contract"
        : resolvedContract.deliveryMode;
    if (
      definition.contract.name !== resolvedContract.name ||
      String(definition.contract.version) !== resolvedContract.version ||
      definition.contract.identity !== resolvedContract.identity ||
      definition.contract.deliveryMode !== deliveryMode
    )
      throw new WorkflowRunRequestError(
        "fixture contract does not match pinned canonical authority",
      );

    const parentRunId = request.parentRunId ?? null;
    if (parentRunId !== null && !this.#runs.has(parentRunId))
      throw new WorkflowRunNotFoundError(`unknown workflow run ${parentRunId}`);
    const definitionIdentity = sha256(definitionContent);
    const handoffIdentity = sha256(JSON.stringify(handoff));
    const fixture: WorkflowFixtureBinding = {
      name: request.fixture,
      identity: definition.identity,
      definitionPath,
      definitionIdentity,
      candidateCommit: request.candidateCommit,
      handoffIdentity,
      parentRunId,
      permittedSideEffects: definition.permittedSideEffects,
      expectedRoleDisposition: definition.expectedRoleDisposition,
    };
    const allocationAuthority = {
      type: "canonical-workflow-fixture",
      workflow: workflow.repositoryPath,
      fixture: request.fixture,
      fixtureIdentity: definition.identity,
      definitionIdentity,
      candidateCommit: request.candidateCommit,
      ledgerIdentity: sha256(ledger),
      basisTransition: handoff.transition,
      basisIdentity: handoffIdentity,
      contractIdentity: resolvedContract.identity,
      pinnedContractAuthority: { ...pinned },
      ...(parentRunId === null ? {} : { parentRunId }),
    };
    const permissionProfile = resolvePermissionProfile(
      "evaluator",
      workspace,
      this.#evaluatorWorkspace,
      true,
    );
    // The fixture's declared permissionProfile is repository-owned
    // description, not authority -- the host always resolves the effective
    // profile itself (above). Reject a fixture whose declaration disagrees
    // with what Harness actually binds, so the fixture can never claim a
    // narrower (or otherwise different) effective capability than reality.
    if (definition.permissionProfile !== permissionProfile.id)
      throw new WorkflowRunRequestError(
        "fixture declared permissionProfile does not match the resolved effective permission profile",
      );
    const fixtureSpec: ResolvedWorkflowRunSpec = {
      slot: {
        workflow: workflow.workflow,
        phase: `fixture:${request.fixture}`,
        methodologyAttempt: String(handoff.evidence.attempt),
      },
      role: definition.role,
      executor: definition.executor,
      invocationMode: "fixture",
      workspaces: permissionProfile.workspaces,
      permissionProfile,
      skill: resolvedContract.path,
      skillVersion: resolvedContract.version,
      contract: { ...resolvedContract, deliveryMode },
      allocationAuthority,
      verificationAuthority: allocationAuthority,
      orchestrator: null,
      prompt: definition.prompt,
      fixture,
    };
    return this.#createExecution(fixtureSpec, {
      executionAttempt: 1,
      previousExecutionId: null,
      replacementReason: null,
      replacementCount: 0,
    });
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

  // Host-mediated publication. A role that created a local commit reports its
  // identity here instead of needing its own Git-remote network/credentials.
  // The host verifies the commit exists, is a fast-forward descendant of the
  // branch's current remote tip (never rewriting or discarding already-
  // published history), and that the run's own resolved permission profile
  // actually grants git-publish, then pushes it using the host process's own
  // credentials. This is the primitive a network-isolated protected role can
  // use instead of gaining outbound network access.
  publishCommit(
    runId: string,
    commit: string,
    branch: string,
  ): WorkflowRunRecord {
    const run = this.#runs.get(runId);
    if (run === undefined) {
      throw new WorkflowRunNotFoundError(`unknown workflow run ${runId}`);
    }
    if (!run.spec.permissionProfile.capabilities.includes("git-publish")) {
      throw new WorkflowRunRequestError(
        `run ${runId}'s resolved permission profile does not grant git-publish`,
      );
    }
    const workspace = run.spec.workspaces[0];
    if (workspace === undefined) {
      throw new WorkflowRunRequestError(`run ${runId} has no workspace`);
    }
    try {
      execFileSync("git", ["cat-file", "-e", `${commit}^{commit}`], {
        cwd: workspace,
        stdio: "pipe",
      });
    } catch {
      throw new WorkflowRunRequestError(
        `commit ${commit} does not exist in this repository`,
      );
    }
    let remoteTip: string;
    try {
      remoteTip = execFileSync(
        "git",
        ["rev-parse", `refs/remotes/origin/${branch}`],
        { cwd: workspace, encoding: "utf8", stdio: "pipe" },
      ).trim();
    } catch {
      // The branch has no remote tip yet; any valid commit is trivially a
      // "fast-forward" of an empty history.
      remoteTip = commit;
    }
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", remoteTip, commit], {
        cwd: workspace,
        stdio: "pipe",
      });
    } catch {
      throw new WorkflowRunRequestError(
        `commit ${commit} is not a fast-forward descendant of origin/${branch}; refusing to rewrite published history`,
      );
    }
    execFileSync("git", ["push", "origin", `${commit}:refs/heads/${branch}`], {
      cwd: workspace,
      stdio: "pipe",
    });
    run.publishResult = {
      commit,
      branch,
      pushed: true,
      at: new Date(this.#now()).toISOString(),
    };
    this.#emit("workflow-run.published", run);
    return run.toRecord();
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

  reportRoleResult(
    runId: string,
    result: WorkflowRoleResultRequest,
  ): WorkflowRunRecord {
    const run = this.#runs.get(runId);
    if (run === undefined)
      throw new WorkflowRunNotFoundError(`unknown workflow run: ${runId}`);
    if (run.roleResult !== null)
      throw new WorkflowRunConflictError(
        `workflow run ${runId} already has a role result`,
      );
    // This is intentionally a comparison against the host-owned binding, not
    // a declaration by the provider.  A successful process cannot invent it.
    if (
      result.role !== run.spec.role ||
      (result.methodologyAttempt ?? null) !==
        (run.spec.slot.methodologyAttempt ?? null) ||
      result.skill !== run.spec.skill ||
      result.skillVersion !== run.spec.skillVersion ||
      JSON.stringify(result.verificationAuthority) !==
        JSON.stringify(run.spec.verificationAuthority)
    ) {
      throw new WorkflowRunRequestError(
        "role result does not match the host-owned execution binding",
      );
    }
    run.roleDisposition = result.disposition;
    run.roleResult = {
      role: result.role,
      ...(result.methodologyAttempt === undefined
        ? {}
        : { methodologyAttempt: result.methodologyAttempt }),
      skill: result.skill,
      skillVersion: result.skillVersion,
      verificationAuthority: result.verificationAuthority,
      disposition: result.disposition,
      reason: result.reason ?? null,
      recordedAt: new Date(this.#now()).toISOString(),
      contractIdentity: run.spec.contract.identity,
      contractDeliveryMode: run.spec.contract.deliveryMode,
    };
    this.#emit(
      result.disposition === "succeeded"
        ? "workflow-run.role-succeeded"
        : "workflow-run.role-non-success",
      run,
    );
    // A role result reported after the run already reached a terminal
    // disposition (rather than observed from the exit outcome) still belongs
    // in the run's durable evidence.
    this.#persistDurableEvidence(run);
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
    const key = slotKey(prior.spec.slot, prior.spec.allocationAuthority);
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
    const run = this.#canonicalRunForSlot(key);
    return run !== undefined && isActiveWorkflowRunStatus(run.status)
      ? run
      : undefined;
  }

  #canonicalRunForSlot(key: string): InternalRun | undefined {
    const canonicalId = this.#canonicalBySlot.get(key);
    return canonicalId === undefined ? undefined : this.#runs.get(canonicalId);
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
    this.#canonicalBySlot.set(
      slotKey(spec.slot, spec.allocationAuthority),
      runId,
    );
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
      this.#persistDurableEvidence(run);
      return run.toRecord();
    }

    run.backend = backend;
    run.pid = backend.pid ?? null;
    run.providerSessionId = backend.providerSessionId ?? null;
    run.scratchWorkspace = backend.scratchWorkspace ?? null;
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
    if (outcome.roleResult !== undefined && run.roleResult === null) {
      const result = outcome.roleResult;
      run.roleDisposition = result.disposition;
      run.roleResult = {
        role: run.spec.role,
        ...(run.spec.slot.methodologyAttempt === undefined
          ? {}
          : { methodologyAttempt: run.spec.slot.methodologyAttempt }),
        skill: run.spec.skill,
        skillVersion: run.spec.skillVersion,
        verificationAuthority: run.spec.verificationAuthority,
        disposition: result.disposition,
        reason: result.reason ?? null,
        recordedAt: new Date(this.#now()).toISOString(),
        contractIdentity: run.spec.contract.identity,
        contractDeliveryMode: run.spec.contract.deliveryMode,
      };
      this.#emit(
        result.disposition === "succeeded"
          ? "workflow-run.role-succeeded"
          : "workflow-run.role-non-success",
        run,
      );
    }
    this.#emit(
      outcome.ok ? "workflow-run.completed" : "workflow-run.failed",
      run,
    );
    this.#persistDurableEvidence(run);
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
    this.#persistDurableEvidence(run);
  }

  #persistDurableEvidence(run: InternalRun): void {
    if (isActiveWorkflowRunStatus(run.status)) return;
    // `workspace` is only ever consulted here to derive the *default*
    // evidence destination and to decide the public/private split (via
    // grantsHiddenWorkspace, unchanged) -- it never becomes the write
    // location itself when the host has configured an explicit evidence
    // root. This is what keeps canonical-authority resolution (which always
    // uses the real workspace) and durable-evidence writes independently
    // configurable.
    const workspace = run.spec.workspaces[0];
    if (workspace === undefined) return;
    const record = run.toRecord();
    const evidenceRoot = this.#evidenceRoot ?? workspace;
    const publicPath = resolve(
      durableRunsDir(evidenceRoot, record.workflow),
      `${record.runId}.json`,
    );
    if (!grantsHiddenWorkspace(run.spec.permissionProfile, workspace)) {
      writeDurableFile(publicPath, `${JSON.stringify(record, null, 2)}\n`);
      return;
    }
    const rawLog = run.logChunks.join("");
    const hiddenEvidenceRoot =
      this.#hiddenEvidenceRoot ?? defaultHiddenEvidenceRoot(workspace);
    const hiddenDir = durableRunsDir(hiddenEvidenceRoot, record.workflow);
    writeDurableFile(
      resolve(hiddenDir, `${record.runId}.json`),
      `${JSON.stringify(record, null, 2)}\n`,
    );
    writeDurableFile(resolve(hiddenDir, `${record.runId}.log`), rawLog);
    const sanitized = {
      ...record,
      roleResult:
        record.roleResult === null
          ? null
          : { ...record.roleResult, reason: null },
      logIdentity: sha256(rawLog),
    };
    writeDurableFile(publicPath, `${JSON.stringify(sanitized, null, 2)}\n`);
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
      skill: record.skill,
      skillVersion: record.skillVersion,
      contractIdentity: record.contractIdentity,
      contractDeliveryMode: record.contractDeliveryMode,
      executor: record.executor,
      invocationMode: record.invocationMode,
      status: record.status,
      terminalDisposition: record.terminalDisposition,
      roleDisposition: record.roleDisposition,
      previousExecutionId: record.previousExecutionId,
      ...extra,
    });
  }
}
