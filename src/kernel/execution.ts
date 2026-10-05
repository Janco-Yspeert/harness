import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import {
  appendLedger,
  canonical,
  contentId,
  identity,
  matches,
  object,
  predicate,
  readLedger,
  required,
  scopedEvents,
} from "./ledger.ts";
import {
  validatePreparedObservationRecord,
  type PreparedObservationRecord,
} from "../candidate-observation.ts";
import {
  MAX_ACTION_ARTIFACTS,
  MAX_EVIDENCE_BYTES,
  MAX_EVIDENCE_FILE_BYTES,
  MAX_EVIDENCE_FILES,
} from "../executors/protocol.ts";
import { evidencePath, inside, loadDefinition } from "./methodology.ts";
import {
  buildKnownLossArtifacts,
  parseArchiveLossDeclaration,
  validateKnownLossContext,
  type ArchiveLossDeclaration,
  type KnownAttempt,
} from "./archive-loss.ts";
import {
  buildCompleteArchiveArtifacts,
  parseCompleteArchiveRecoveryDeclaration,
  type CompleteArchiveAttempt,
  type CompleteArchiveRecoveryDeclaration,
} from "./archive-recovery.ts";
import {
  authorityBasis,
  recoveryScopedAuthorityBasis,
  resolveAuthority,
  type Resolution,
} from "./resolver.ts";
import {
  DIAGNOSTIC_CATEGORIES,
  type Diagnostic,
  type DiagnosticCategory,
} from "./model.ts";
import type {
  Data,
  EvidenceActionRequest,
  EvidenceActionResult,
  Execution,
  ExecutorProfile,
  ExecutorSelector,
  HostActionResult,
  PromotionActionRequest,
  PromotionActionResult,
  PromotionArtifact,
  PublicationActionRequest,
  PublicationActionResult,
  HumanCorrectionCycleAuthority,
  HumanEvaluatorCorrectionAuthority,
  HumanRequest,
  LedgerEvent,
  MethodologyDefinition,
  MethodologySourceBinding,
  Project,
  PreimplementationRecoveryAuthority,
  RoleGrant,
  RoleResult,
  RootAuthority,
  Session,
  TerminalOutcome,
  TelemetrySink,
  WorkerExecutionContext,
  WorkflowGrant,
  ArtifactValidators,
} from "./model.ts";

export interface KernelOptions {
  project: Project;
  executors: ExecutorProfile[];
  telemetry?: TelemetrySink;
  selectExecutor?: ExecutorSelector;
  privateDataRoot?: string;
  validators?: ArtifactValidators;
  // Called with the freshly loaded definition before any new Workflow
  // Execution Grant is recorded. The governed host always installs the
  // trust-equivalence gate here; it is not caller configuration.
  methodologyGate?: (definition: MethodologyDefinition) => void;
  // Where a new Workflow Execution Grant's definition comes from. The
  // governed host resolves the latest trusted record's committed bytes; a
  // kernel without it (historical/test use) reads the working tree.
  methodologySource?: () => MethodologyDefinition;
  // The host-written methodology source/runtime binding recorded in every new
  // Workflow Execution Grant. Installed by the governed host only.
  methodologyBinding?: () => MethodologySourceBinding;
}
const DETAIL_LIMIT = 240;
// Public diagnostic details are short host-authored phrases. Redaction is a
// second line of defence against a credential-shaped value slipping in.
export function redact(value: string): string {
  return value
    .replaceAll(/(?:Bearer\s+|token[=:]\s*)[^\s"']+/gi, "[redacted]")
    .replaceAll(/\b[a-f0-9]{48,}\b/gi, "[redacted]")
    .replaceAll(/\bsk-[A-Za-z0-9_-]{8,}/g, "[redacted]");
}
export function safeDetail(value: string): string {
  return (redact(value).split("\n")[0] ?? "").slice(0, DETAIL_LIMIT);
}
function boundedPath(root: string, path: string): string {
  if (!path || isAbsolute(path))
    throw new Error("action path must be relative");
  const absolute = resolve(root, path);
  const delta = relative(root, absolute);
  if (delta === ".." || delta.startsWith("../") || isAbsolute(delta))
    throw new Error("action path escapes its configured boundary");
  return absolute;
}
// One host owns a project's executions. Synchronous ledger transactions serialize
// request races; the on-disk lock also rejects competing host/CLI writers.
export class ExecutionKernel {
  readonly project: Project;
  readonly options: KernelOptions;
  constructor(options: KernelOptions) {
    this.project = structuredClone(options.project);
    this.options = options;
  }
  path(workflow: string): string {
    const config = this.project.workflows[workflow];
    if (!config) throw new Error("unknown configured workflow");
    return resolve(this.project.root, config.directory, config.ledger);
  }
  events(workflow: string): LedgerEvent[] {
    return readLedger(this.path(workflow));
  }
  preparedObservation(
    workflow: string,
    observation: string,
  ): PreparedObservationRecord {
    const record = this.events(workflow).find(
      (event) =>
        event.transition === "kernel.prepared-observation" &&
        event.evidence.observation === observation,
    )?.evidence as unknown as PreparedObservationRecord | undefined;
    if (!record) throw new Error("unknown prepared observation");
    validatePreparedObservationRecord(record);
    return record;
  }
  recordPreparedObservation(
    workflow: string,
    record: PreparedObservationRecord,
  ): PreparedObservationRecord {
    return this.#transaction(workflow, () => {
      validatePreparedObservationRecord(record);
      if (record.workflow !== workflow)
        throw new Error("prepared observation workflow mismatch");
      const existing = this.events(workflow).find(
        (event) =>
          event.transition === "kernel.prepared-observation" &&
          event.evidence.observation === record.observation,
      );
      if (existing) {
        if (canonical(existing.evidence) !== canonical(record))
          throw new Error("prepared observation identity collision");
        return existing.evidence as unknown as PreparedObservationRecord;
      }
      this.#append(workflow, "kernel.prepared-observation", record);
      return record;
    });
  }
  #append(workflow: string, type: string, evidence: object): void {
    appendLedger(this.path(workflow), type, evidence);
  }
  #transaction<T>(workflow: string, operation: () => T): T {
    const lock = `${this.path(workflow)}.lock`;
    mkdirSync(dirname(lock), { recursive: true });
    try {
      mkdirSync(lock);
    } catch {
      throw new Error("authority writer busy; retry the same request");
    }
    try {
      writeFileSync(resolve(lock, "owner"), String(process.pid), {
        mode: 0o600,
      });
      return operation();
    } finally {
      rmSync(lock, { recursive: true });
    }
  }
  definition(workflow: string, id: string): MethodologyDefinition {
    const definition = this.events(workflow).find(
      (e) => e.transition === "kernel.definition" && e.evidence.id === id,
    )?.evidence as unknown as MethodologyDefinition | undefined;
    if (!definition) throw new Error("unknown pinned methodology");
    const { id: actual, ...body } = definition;
    if (contentId(body) !== actual)
      throw new Error("methodology content identity mismatch");
    return definition;
  }
  grant(workflow: string, id: string): WorkflowGrant {
    const value = this.events(workflow).find(
      (e) => e.transition === "kernel.workflow-grant" && e.evidence.id === id,
    )?.evidence;
    if (!value) throw new Error("unknown workflow grant");
    return value as unknown as WorkflowGrant;
  }
  // One liveness predicate: a grant is permanently non-executable once it is
  // revoked (pre-implementation recovery) or retired (inactive retirement).
  #revocation(
    events: LedgerEvent[],
    workflowGrant: string,
  ): { event: LedgerEvent; reason: string } | undefined {
    const event = events.findLast(
      (entry) =>
        (entry.transition === "kernel.workflow-grant-revoked" ||
          entry.transition === "kernel.workflow-grant-retired") &&
        entry.evidence.workflowGrant === workflowGrant,
    );
    if (!event) return undefined;
    return {
      event,
      reason:
        event.transition === "kernel.workflow-grant-retired"
          ? "workflow grant permanently retired"
          : "workflow grant permanently revoked by pre-implementation recovery",
    };
  }
  retireWorkflowGrant(
    workflow: string,
    request: { workflowGrant: string; reason: string },
  ): { workflowGrant: string; origin: "human"; reason: string } {
    return this.#transaction(workflow, () => {
      if (
        typeof request.workflowGrant !== "string" ||
        !request.workflowGrant ||
        typeof request.reason !== "string" ||
        !request.reason.trim()
      )
        throw new Error("invalid workflow grant retirement request");
      const grant = this.grant(workflow, request.workflowGrant);
      const events = this.events(workflow);
      const existing = this.#revocation(events, grant.id);
      if (existing)
        throw new Error(
          existing.event.transition === "kernel.workflow-grant-retired"
            ? "workflow grant is already retired"
            : "workflow grant is already permanently revoked",
        );
      const owned = this.executions(workflow).filter(
        (execution) => execution.workflowGrant === grant.id,
      );
      if (
        owned.some((execution) =>
          ["allocated", "running"].includes(execution.process),
        )
      )
        throw new Error(
          "workflow grant retirement requires no active execution",
        );
      if (
        owned.some((execution) =>
          execution.requests.some((request) => !request.response),
        )
      )
        throw new Error(
          "workflow grant retirement requires no unresolved human request",
        );
      const evidence = {
        workflowGrant: grant.id,
        origin: "human" as const,
        reason: request.reason,
      };
      this.#append(workflow, "kernel.workflow-grant-retired", evidence);
      return evidence;
    });
  }
  authorize(
    workflow: string,
    request: {
      continuation: boolean;
      delegation: Array<"attached" | "spawned">;
      roles?: string[];
      stopAfter?: string[];
      maxAllocations: number;
      maxAutomaticWork?: number;
      supersedes?: string;
      inline?: boolean;
      executor?: { model?: string; reasoning?: string; exactModel?: string };
    },
  ): WorkflowGrant {
    return this.#transaction(workflow, () => {
      const definition =
        this.options.methodologySource?.() ??
        loadDefinition(this.project, this.options.validators);
      this.options.methodologyGate?.(definition);
      const source = this.options.methodologyBinding?.();
      const roles = request.roles ?? Object.keys(definition.roles);
      if (
        !roles.length ||
        roles.some((r) => !definition.roles[r]) ||
        !request.delegation.length ||
        request.delegation.some((m) => !["attached", "spawned"].includes(m)) ||
        !Number.isSafeInteger(request.maxAllocations) ||
        request.maxAllocations < 1 ||
        (request.maxAutomaticWork !== undefined &&
          (!Number.isSafeInteger(request.maxAutomaticWork) ||
            request.maxAutomaticWork < 1)) ||
        (request.executor !== undefined &&
          (!Object.values(request.executor).every(
            (value) => typeof value === "string" && value.length > 0,
          ) ||
            Object.keys(request.executor).some(
              (key) =>
                key !== "model" && key !== "reasoning" && key !== "exactModel",
            )))
      )
        throw new Error("invalid execution authorization");
      const events = this.events(workflow);
      if (
        !events.some(
          (e) =>
            e.transition === "kernel.definition" &&
            e.evidence.id === definition.id,
        )
      )
        this.#append(workflow, "kernel.definition", definition);
      const value: WorkflowGrant = {
        schemaVersion: 1,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        methodology: definition.id,
        authorityBasis: authorityBasis(events),
        origin: "human",
        continuation: request.continuation,
        delegation: request.delegation,
        roles,
        stopAfter: request.stopAfter ?? [],
        maxAllocations: Math.min(
          request.maxAllocations,
          definition.policy.maxAllocations,
        ),
        maxAutomaticWork: Math.min(
          request.maxAutomaticWork ?? request.maxAllocations,
          definition.policy.maxAllocations,
        ),
        ...(request.inline ? { inline: true } : {}),
        ...(request.executor ? { executor: request.executor } : {}),
        ...(source ? { source } : {}),
      };
      if (request.supersedes) {
        const old = this.execution(workflow, request.supersedes);
        if (!["allocated", "running"].includes(old.process))
          throw new Error("supersession requires an active governed execution");
        value.supersedes = old.id;
        // The new authority is durable before old authority becomes invalid.
        this.#append(workflow, "kernel.workflow-grant", value);
        this.#append(workflow, "kernel.supersession", {
          execution: old.id,
          workflowGrant: value.id,
        });
        this.#append(workflow, "kernel.process", {
          execution: old.id,
          update: {
            process: "cancelled",
            failure: "superseded by new workflow authority",
            attention: "terminal",
          },
        });
        return value;
      }
      this.#append(workflow, "kernel.workflow-grant", value);
      return value;
    });
  }
  recoverPreimplementation(
    workflow: string,
    request: {
      workflowGrant: string;
      designMapEvent: string;
      evaluationPreparedEvent: string;
      reason: string;
    },
  ): { authority: PreimplementationRecoveryAuthority; grant: WorkflowGrant } {
    return this.#transaction(workflow, () => {
      if (
        !request.workflowGrant ||
        !request.designMapEvent ||
        !request.evaluationPreparedEvent ||
        !request.reason
      )
        throw new Error("invalid pre-implementation recovery authority");
      const events = this.events(workflow);
      const old = this.grant(workflow, request.workflowGrant);
      if (this.#revocation(events, old.id))
        throw new Error("workflow grant is already permanently revoked");
      if (
        this.executions(workflow).some(
          (execution) =>
            execution.workflowGrant === old.id &&
            ["allocated", "running"].includes(execution.process),
        )
      )
        throw new Error(
          "pre-implementation recovery requires no active execution",
        );
      if (
        events.some((event) =>
          ["implementation-handoff", "verification-finalized"].includes(
            event.transition,
          ),
        )
      )
        throw new Error(
          "pre-implementation recovery is unavailable after implementation handoff",
        );
      const source = (
        event: string,
        transition: "design-map-frozen" | "evaluation-prepared",
      ) => {
        const found = events.find(
          (entry) => entry.id === event && entry.transition === transition,
        );
        const evidence = found?.evidence;
        if (
          !found ||
          !evidence ||
          typeof evidence.execution !== "string" ||
          typeof evidence.roleGrant !== "string" ||
          typeof evidence.semanticResult !== "string" ||
          typeof evidence.commit !== "string" ||
          typeof evidence.path !== "string" ||
          typeof evidence.identity !== "string"
        )
          throw new Error(`invalidated ${transition} event is unavailable`);
        return {
          event,
          transition,
          execution: evidence.execution,
          roleGrant: evidence.roleGrant,
          semanticResult: evidence.semanticResult,
          commit: evidence.commit,
          path: evidence.path,
          identity: evidence.identity,
        };
      };
      const design = source(request.designMapEvent, "design-map-frozen");
      const prepared = source(
        request.evaluationPreparedEvent,
        "evaluation-prepared",
      );
      const preparedInputs = events.find(
        (event) => event.id === request.evaluationPreparedEvent,
      )?.evidence.inputs;
      if (
        !preparedInputs ||
        typeof preparedInputs !== "object" ||
        Array.isArray(preparedInputs) ||
        (preparedInputs as Data).design !== design.identity
      )
        throw new Error(
          "evaluation-prepared event does not depend on the invalidated design map",
        );
      const definition =
        this.options.methodologySource?.() ??
        loadDefinition(this.project, this.options.validators);
      this.options.methodologyGate?.(definition);
      if (definition.id !== old.methodology)
        throw new Error(
          "recovery must retain the old grant's trusted methodology",
        );
      const binding = this.options.methodologyBinding?.();
      const authority: PreimplementationRecoveryAuthority = {
        schemaVersion: 1,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        origin: "human",
        reason: request.reason,
        invalidated: [design, prepared],
        dependencies: [
          {
            from: prepared.event,
            to: design.event,
            kind: "prepared-from-design",
            identity: design.identity,
          },
        ],
      };
      this.#append(workflow, "kernel.preimplementation-recovery", authority);
      this.#append(workflow, "kernel.workflow-grant-revoked", {
        workflowGrant: old.id,
        recovery: authority.id,
        reason: request.reason,
      });
      const grant: WorkflowGrant = {
        schemaVersion: 1,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        methodology: definition.id,
        authorityBasis: authorityBasis(this.events(workflow)),
        origin: "human",
        continuation: old.continuation,
        delegation: old.delegation,
        roles: old.roles,
        stopAfter: old.stopAfter,
        maxAllocations: old.maxAllocations,
        ...(old.maxAutomaticWork === undefined
          ? {}
          : { maxAutomaticWork: old.maxAutomaticWork }),
        recovery: authority.id,
        ...(old.inline ? { inline: true } : {}),
        ...(old.executor ? { executor: old.executor } : {}),
        ...(binding ? { source: binding } : {}),
      };
      this.#append(workflow, "kernel.workflow-grant", grant);
      return { authority, grant };
    });
  }
  authorizeEvaluatorCorrection(
    workflow: string,
    request: {
      classification: string;
      sourceEvaluatorRevision: string;
      attempt: number;
      execution: string;
      rejectionEvent: string;
      evidenceCommit: string;
      evidencePath: string;
      evidenceIdentity: string;
      reason: string;
    },
  ): HumanEvaluatorCorrectionAuthority {
    return this.#transaction(workflow, () => {
      if (
        request.classification !== "EVALUATOR_COVERAGE_DEFECT" ||
        !/^\d{3}$/.test(request.sourceEvaluatorRevision) ||
        !Number.isSafeInteger(request.attempt) ||
        request.attempt < 1 ||
        !request.execution ||
        !request.rejectionEvent ||
        !request.evidenceCommit ||
        !request.evidencePath ||
        !/^sha256:[a-f0-9]{64}$/.test(request.evidenceIdentity) ||
        !request.reason
      )
        throw new Error("invalid evaluator correction authority");
      const events = this.events(workflow);
      if (
        events.some(
          (event) =>
            event.transition === "human-evaluator-correction-authorized" &&
            event.evidence.execution === request.execution &&
            event.evidence.attempt === request.attempt,
        )
      )
        throw new Error("evaluator correction authority already recorded");
      const allocation = events.find(
        (event) =>
          event.transition === "verification-allocated" &&
          event.evidence.execution === request.execution &&
          event.evidence.attempt === request.attempt &&
          event.evidence.evaluatorRevision === request.sourceEvaluatorRevision,
      );
      const rejection = events.find(
        (event) =>
          event.id === request.rejectionEvent &&
          event.transition === "kernel.process" &&
          event.evidence.execution === request.execution,
      );
      const update = rejection ? object(rejection.evidence.update) : {};
      if (!allocation || update.process !== "failed")
        throw new Error(
          "evaluator correction authority lacks exact rejected verification evidence",
        );
      const roleGrant = allocation.evidence.roleGrant;
      const allocatedGrant = events
        .filter((event) => event.transition === "kernel.allocation")
        .map((event) => object(event.evidence.grant))
        .find((grant) => grant.id === roleGrant);
      const allocationKey =
        typeof allocation.evidence.allocationKey === "string"
          ? allocation.evidence.allocationKey
          : allocatedGrant?.allocationKey;
      if (typeof allocationKey !== "string")
        throw new Error("verification allocation identity is unavailable");
      const directory = required(this.project.workflows[workflow]).directory;
      const artifact = inside(
        resolve(this.project.root, directory),
        request.evidencePath,
      );
      let bytes: Buffer;
      try {
        bytes = execFileSync(
          "git",
          [
            "show",
            `${request.evidenceCommit}:${relative(this.project.root, artifact)}`,
          ],
          { cwd: this.project.root },
        );
      } catch {
        throw new Error("evaluator correction evidence commit is unavailable");
      }
      if (identity(bytes) !== request.evidenceIdentity)
        throw new Error("evaluator correction evidence identity mismatch");
      const result = object(JSON.parse(bytes.toString("utf8")));
      if (
        result.attempt !== String(request.attempt).padStart(3, "0") ||
        result.allocationKey !== allocationKey ||
        result.commit !== allocation.evidence.commit ||
        result.evaluatorRevision !== request.sourceEvaluatorRevision
      )
        throw new Error(
          "evaluator correction artifact does not bind the rejected allocation",
        );
      const decision = {
        schemaVersion: 1 as const,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        origin: "human" as const,
        classification: "EVALUATOR_COVERAGE_DEFECT" as const,
        sourceEvaluatorRevision: request.sourceEvaluatorRevision,
        attempt: request.attempt,
        execution: request.execution,
        rejectionEvent: request.rejectionEvent,
        evidenceCommit: request.evidenceCommit,
        evidencePath: request.evidencePath,
        evidenceIdentity: request.evidenceIdentity,
        reason: request.reason,
      };
      const authority: HumanEvaluatorCorrectionAuthority = {
        ...decision,
        semanticResult: contentId(decision),
      };
      this.#append(
        workflow,
        "human-evaluator-correction-authorized",
        authority,
      );
      return authority;
    });
  }
  authorizeCorrectionCycle(
    workflow: string,
    request: {
      cycle: string;
      classification: string;
      execution: string;
      roleGrant: string;
      semanticResult: string;
      commit: string;
      evaluatorRevision: string;
      attempt: number;
      artifactCommit: string;
      artifactPath: string;
      artifactIdentity: string;
      defects: string[];
      reason: string;
    },
  ): HumanCorrectionCycleAuthority {
    return this.#transaction(workflow, () => {
      if (
        !/^\d{3}$/.test(request.cycle) ||
        request.classification !== "IMPLEMENTATION_AND_EVALUATOR_DEFECT" ||
        !request.execution ||
        !request.roleGrant ||
        !request.semanticResult ||
        !/^[a-f0-9]{40,64}$/.test(request.commit) ||
        !/^\d{3}$/.test(request.evaluatorRevision) ||
        !Number.isSafeInteger(request.attempt) ||
        request.attempt < 1 ||
        !/^[a-f0-9]{40,64}$/.test(request.artifactCommit) ||
        !request.artifactPath ||
        !/^sha256:[a-f0-9]{64}$/.test(request.artifactIdentity) ||
        !Array.isArray(request.defects) ||
        request.defects.length === 0 ||
        !request.defects.every(
          (defect) => typeof defect === "string" && defect,
        ) ||
        !request.reason
      )
        throw new Error("invalid correction-cycle authority");
      const events = this.events(workflow);
      const existingCycles = events
        .filter((event) => event.transition === "correction-cycle-opened")
        .map((event) => String(event.evidence.cycle));
      const prior = existingCycles.at(-1) ?? "001";
      if (Number(request.cycle) !== Number(prior) + 1)
        throw new Error(
          "correction cycle must immediately succeed current cycle",
        );
      if (
        events.some(
          (event) =>
            event.transition === "human-correction-cycle-authorized" &&
            event.evidence.cycle === request.cycle,
        )
      )
        throw new Error("correction-cycle authority already recorded");
      const source = events.find(
        (event) =>
          event.transition === "verification-finalized" &&
          event.evidence.result === "PASS" &&
          event.evidence.execution === request.execution &&
          event.evidence.roleGrant === request.roleGrant &&
          event.evidence.semanticResult === request.semanticResult &&
          event.evidence.commit === request.commit &&
          event.evidence.evaluatorRevision === request.evaluatorRevision &&
          event.evidence.attempt === request.attempt &&
          event.evidence.artifactCommit === request.artifactCommit &&
          event.evidence.path === request.artifactPath &&
          event.evidence.identity === request.artifactIdentity,
      );
      if (!source)
        throw new Error(
          "correction-cycle authority lacks exact canonical PASS evidence",
        );
      const authority: HumanCorrectionCycleAuthority = {
        schemaVersion: 1,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        origin: "human",
        cycle: request.cycle,
        predecessorCycle: prior,
        classification: "IMPLEMENTATION_AND_EVALUATOR_DEFECT",
        sourceExecution: request.execution,
        sourceRoleGrant: request.roleGrant,
        sourceSemanticResult: request.semanticResult,
        sourceCommit: request.commit,
        sourceEvaluatorRevision: request.evaluatorRevision,
        sourceAttempt: request.attempt,
        sourceArtifactCommit: request.artifactCommit,
        sourceArtifactPath: request.artifactPath,
        sourceArtifactIdentity: request.artifactIdentity,
        defects: request.defects,
        reason: request.reason,
        semanticResult: "",
      };
      authority.semanticResult = contentId({
        ...authority,
        semanticResult: undefined,
      });
      this.#append(workflow, "human-correction-cycle-authorized", authority);
      this.#append(workflow, "correction-cycle-opened", {
        authorityOrigin: "human",
        authority: authority.id,
        cycle: authority.cycle,
        predecessorCycle: authority.predecessorCycle,
        implementationCorrection: true,
        classification: authority.classification,
        sourceVerification: source.id,
        sourceSemanticResult: authority.sourceSemanticResult,
      });
      return authority;
    });
  }
  inspect(
    workflow: string,
    grantId: string,
    role?: string,
    sessionId?: string,
  ): Resolution {
    const grant = this.grant(workflow, grantId);
    const dead = this.#revocation(this.events(workflow), grant.id);
    if (dead) return { kind: "denied", reason: dead.reason };
    return resolveAuthority(
      this.project,
      this.events(workflow),
      this.definition(workflow, grant.methodology),
      grant,
      role,
      sessionId ? this.session(sessionId) : undefined,
      null,
      this.options.validators,
    );
  }
  session(id: string): Session {
    let session: Session | undefined;
    const exposures = new Set<string>();
    for (const workflow of Object.keys(this.project.workflows)) {
      for (const event of this.events(workflow)) {
        if (event.transition === "kernel.session" && event.evidence.id === id)
          session = event.evidence as unknown as Session;
        if (
          event.transition === "kernel.exposure" &&
          event.evidence.session === id
        )
          exposures.add(String(event.evidence.exposure));
      }
    }
    if (!session) throw new Error("unknown registered session");
    return { ...session, exposures: [...exposures] };
  }
  register(
    workflow: string,
    profileId: string,
  ): { session: Session; token: string } {
    const profile = this.options.executors.find(
      (p) => p.id === profileId && p.available,
    );
    if (!profile) throw new Error("executor unavailable");
    const token = randomBytes(32).toString("hex");
    const session: Session = {
      schemaVersion: 1,
      id: randomUUID(),
      profile,
      tokenHash: identity(token),
      exposures: [],
      workspaces: [],
      registeredAt: new Date().toISOString(),
    };
    this.#transaction(workflow, () => {
      this.#append(workflow, "kernel.session", session);
    });
    return { session, token };
  }
  authenticate(id: string, token: string): Session {
    const session = this.session(id);
    if (session.tokenHash !== identity(token))
      throw new Error("session authentication denied");
    return session;
  }
  #privatePath(id: string): string {
    if (!/^[a-f0-9-]{36}$/.test(id))
      throw new Error("invalid private payload identity");
    const root = required(
      this.options.privateDataRoot,
      "protected human input requires host-owned private data storage",
    );
    mkdirSync(root, { recursive: true, mode: 0o700 });
    const actual = realpathSync(root);
    const workspaces = [
      ...Object.values(this.project.workspaces),
      ...Object.values(this.project.workflows).flatMap((w) =>
        Object.values(w.workspaces ?? {}),
      ),
    ];
    if (
      workspaces.some((w) => {
        const delta = relative(realpathSync(w.path), actual);
        return (
          delta === "" ||
          (!delta.startsWith("../") && delta !== ".." && !delta.startsWith("/"))
        );
      })
    )
      throw new Error(
        "private human payload store must be outside executor workspaces",
      );
    return resolve(actual, `${id}.json`);
  }
  humanView(workflow: string, id: string): Execution {
    const execution = this.execution(workflow, id);
    const grant = this.roleGrant(workflow, execution.roleGrant);
    if (!grant.executorConstraints.protected) return execution;
    for (const request of execution.requests) {
      const payload = object(
        JSON.parse(readFileSync(this.#privatePath(request.id), "utf8")),
      );
      request.question = String(payload.question);
      request.permission =
        typeof payload.permission === "string" ? payload.permission : null;
      if (request.response)
        request.response.value = String(
          object(
            JSON.parse(
              readFileSync(this.#privatePath(request.response.id), "utf8"),
            ),
          ).value,
        );
    }
    return execution;
  }
  executions(workflow: string): Execution[] {
    const runs = new Map<string, Execution>();
    for (const event of this.events(workflow)) {
      if (event.transition === "kernel.allocation") {
        const execution = structuredClone(
          event.evidence.execution,
        ) as Execution;
        runs.set(execution.id, execution);
      }
      const run = runs.get(String(event.evidence.execution));
      if (!run) continue;
      if (event.transition === "kernel.process")
        Object.assign(run, event.evidence.update);
      if (event.transition === "kernel.transition")
        run.transition = { status: "recorded", reason: null };
      if (event.transition === "kernel.transition-blocked")
        run.transition = {
          status: "blocked",
          reason: String(event.evidence.reason),
        };
      if (event.transition === "kernel.result")
        run.result = event.evidence as unknown as RoleResult;
      if (event.transition === "kernel.action-result")
        run.actions.push(event.evidence as unknown as HostActionResult);
      if (event.transition === "kernel.human-request") {
        run.requests.push(event.evidence as unknown as HumanRequest);
        run.attention = "WAITING_FOR_HUMAN";
      }
      if (event.transition === "kernel.supersession") run.superseded = true;
      if (event.transition === "kernel.diagnostic")
        (run.diagnostics ??= []).push(event.evidence as unknown as Diagnostic);
      if (event.transition === "kernel.executor-confirmed" && run.executor) {
        run.executor.confirmed = {
          model:
            typeof event.evidence.model === "string"
              ? event.evidence.model
              : null,
          reasoning:
            typeof event.evidence.reasoning === "string"
              ? event.evidence.reasoning
              : null,
        };
        run.executor.attestation = {
          model:
            typeof event.evidence.model === "string"
              ? "provider-attested"
              : "unavailable",
          reasoning:
            typeof event.evidence.reasoning === "string"
              ? "provider-attested"
              : "unavailable",
        };
      }
      if (event.transition === "kernel.human-response") {
        const request = run.requests.find(
          (r) => r.id === event.evidence.request,
        );
        if (request)
          request.response = event.evidence
            .response as HumanRequest["response"];
        // A response recorded after a worker exited closes its durable human
        // gate, but does not resurrect that terminal worker.
        if (run.process === "running") run.attention = "working";
      }
    }
    return [...runs.values()];
  }
  execution(workflow: string, id: string): Execution {
    const execution = this.executions(workflow).find((r) => r.id === id);
    if (!execution) throw new Error("unknown execution");
    return execution;
  }
  roleGrant(workflow: string, id: string): RoleGrant {
    const allocation = this.events(workflow).find(
      (e) =>
        e.transition === "kernel.allocation" &&
        (e.evidence.grant as RoleGrant).id === id,
    );
    if (!allocation) throw new Error("unknown role grant");
    return allocation.evidence.grant as RoleGrant;
  }
  terminalOutcomes(workflow: string, grant: RoleGrant): TerminalOutcome[] {
    const role = required(
      this.definition(workflow, grant.methodology).roles[grant.role],
    );
    return role.policy.outcomes.map((outcome) => {
      const methodology = outcome.methodology ?? {};
      const requiredMethodology = [
        ...new Set(
          (role.contract.resultConstraints ?? [])
            .filter((constraint) => matches(methodology, constraint.when))
            .flatMap((constraint) => constraint.required ?? []),
        ),
      ];
      return {
        disposition: outcome.disposition,
        methodology,
        requiredMethodology,
        allowedMethodology: Object.fromEntries(
          requiredMethodology.map((field) => [
            field,
            role.contract.methodology[field] ?? [],
          ]),
        ),
      };
    });
  }
  #terminalOutcomeError(workflow: string, grant: RoleGrant): Error {
    const legal = this.terminalOutcomes(workflow, grant)
      .map((outcome, index) => {
        const fixed = Object.entries(outcome.methodology).map(
          ([key, value]) => `methodology.${key}=${String(value)}`,
        );
        const requiredFields = outcome.requiredMethodology.map(
          (field) =>
            `methodology.${field}=<${(outcome.allowedMethodology[field] ?? []).join("|")}>`,
        );
        return `${String(index + 1)}. disposition=${outcome.disposition}, ${[...fixed, ...requiredFields].join(", ")}`;
      })
      .join("; ");
    return new Error(
      `submitted result violates the cross-field contract or does not match an allowed terminal outcome; submit exactly one of: ${legal}. disposition reports protocol completion, not the evaluator verdict; a successfully reported evaluator BLOCKED verdict still uses disposition=succeeded`,
    );
  }
  workerExecutionContext(
    workflow: string,
    executionId: string,
  ): WorkerExecutionContext {
    const execution = this.execution(workflow, executionId);
    const grant = this.roleGrant(workflow, execution.roleGrant);
    const role = required(
      this.definition(workflow, grant.methodology).roles[grant.role],
    );
    const allocation = role.policy.onAllocate
      ? this.events(workflow).findLast(
          (event) =>
            event.transition === role.policy.onAllocate?.transition &&
            event.evidence.execution === executionId,
        )
      : undefined;
    const attemptField = role.policy.onAllocate?.counterField;
    const attempt = attemptField
      ? allocation?.evidence[attemptField]
      : undefined;
    return {
      workflow,
      execution: executionId,
      ...(grant.inputs.candidate ? { candidate: grant.inputs.candidate } : {}),
      ...(grant.inputs.evaluatorRevision
        ? { evaluatorRevision: grant.inputs.evaluatorRevision }
        : {}),
      ...(typeof attempt === "number" ? { attempt } : {}),
      publicArtifactRoot: required(this.project.workflows[workflow]).directory,
      permittedEvidenceDestinations:
        grant.hostActions.evidence?.destinations ?? [],
      privateWorkspaceIds: grant.workspaces
        .filter((workspace) => workspace.exposure !== "public")
        .map((workspace) => workspace.id),
      terminalOutcomes: this.terminalOutcomes(workflow, grant),
    };
  }
  select(
    grant: RoleGrant,
    mode: "attached" | "spawned",
  ): ExecutorProfile | undefined {
    const eligible = this.options.executors.filter(
      (p) =>
        p.available &&
        p.modes.includes(mode) &&
        grant.capabilities.every((c) => p.capabilities.includes(c)) &&
        (!grant.executorConstraints.protected ||
          p.isolation.includes("private-workspace")) &&
        (mode !== "attached" ||
          !grant.executorConstraints.model ||
          p.model === grant.executorConstraints.model) &&
        (!grant.executorConstraints.reasoning ||
          p.reasoning === grant.executorConstraints.reasoning),
    );
    const chosen = this.options.selectExecutor
      ? this.options.selectExecutor(grant, structuredClone(eligible))
      : eligible[0];
    return chosen && eligible.find((p) => p.id === chosen.id);
  }
  allocate(
    workflow: string,
    workflowGrant: string,
    request: {
      role?: string;
      session: string;
      mode: "attached" | "spawned";
      predecessor?: string;
      inline?: boolean;
      // Set by the host only for a launch it contained.
      contained?: boolean;
      // Concrete settings passed by the registered adapter for this launch.
      // Provider attestation is recorded separately.
      executorPlan?: { model?: string; reasoning?: string };
    },
  ): { execution: Execution; grant: RoleGrant; duplicate: boolean } {
    return this.#transaction(workflow, () => {
      const parent = this.grant(workflow, workflowGrant);
      const dead = this.#revocation(this.events(workflow), parent.id);
      if (dead) throw new Error(dead.reason);
      if (!parent.delegation.includes(request.mode))
        throw new Error("delegation mode denied");
      if (
        (request.mode === "attached" && !parent.inline) ||
        (request.inline && request.mode !== "attached")
      )
        throw new Error(
          "inline role adoption lacks explicit workflow authority",
        );
      const session = this.session(request.session);
      if (
        !session.profile.available ||
        !session.profile.modes.includes(request.mode)
      )
        throw new Error("executor mode unavailable");
      const definition = this.definition(workflow, parent.methodology);
      const previous = request.predecessor
        ? this.execution(workflow, request.predecessor)
        : undefined;
      if (previous) {
        const old = this.roleGrant(workflow, previous.roleGrant);
        const policy = definition.roles[old.role]?.policy;
        const child = this.executions(workflow).find(
          (e) => e.predecessor === previous.id && e.workflowGrant === parent.id,
        );
        if (child && (!request.role || request.role === old.role)) {
          const childGrant = this.roleGrant(workflow, child.roleGrant);
          if (
            childGrant.executorConstraints.forbiddenExposure.some((exposure) =>
              session.exposures.includes(exposure),
            )
          )
            throw new Error("session provenance prohibits role");
          return { execution: child, grant: childGrant, duplicate: true };
        }
        const replacements = this.executions(workflow).filter(
          (e) =>
            e.workflowGrant === parent.id &&
            this.roleGrant(workflow, e.roleGrant).role === old.role &&
            e.predecessor !== null,
        );
        if (
          previous.workflowGrant !== parent.id ||
          (request.role && request.role !== old.role) ||
          !policy ||
          replacements.length >= policy.retry.limit ||
          !(
            policy.retry.dispositions.includes(
              previous.result?.disposition ?? previous.process,
            ) ||
            // A delivered result whose mandatory canonical transition was
            // rejected by artifact/postcondition validation never completed
            // the role. An explicit successor may correct and revalidate it
            // within the same retry bound; the rejected execution stays in
            // history. Once a transition is recorded, nothing is retryable.
            (previous.result !== null &&
              previous.transition?.status === "blocked")
          ) ||
          !["exited", "failed", "cancelled", "interrupted"].includes(
            previous.process,
          )
        )
          throw new Error("retry policy denied");
      }
      const resolution = resolveAuthority(
        this.project,
        this.events(workflow),
        definition,
        parent,
        request.role,
        session,
        previous?.id ?? null,
        this.options.validators,
      );
      if (resolution.kind !== "grant")
        throw new Error(`${resolution.kind}: ${resolution.reason}`);
      const grant = resolution.grant;
      const inFlight = this.executions(workflow).find((e) =>
        ["allocated", "running"].includes(e.process),
      );
      if (inFlight) {
        const activeGrant = this.roleGrant(workflow, inFlight.roleGrant);
        if (activeGrant.id === grant.id)
          return { execution: inFlight, grant: activeGrant, duplicate: true };
        throw new Error(
          "active governed execution conflicts with non-equivalent authority; explicit supersession required",
        );
      }
      const prior = this.executions(workflow).find(
        (e) => e.roleGrant === grant.id,
      );
      if (prior) return { execution: prior, grant, duplicate: true };
      const operationalRetry =
        previous &&
        this.roleGrant(workflow, previous.roleGrant).role === grant.role;
      const automaticUsed = this.events(workflow).filter(
        (e) =>
          e.transition === "kernel.automatic-work" &&
          e.evidence.workflowGrant === parent.id,
      ).length;
      if (
        !operationalRetry &&
        automaticUsed >= (parent.maxAutomaticWork ?? parent.maxAllocations)
      )
        throw new Error("gate: workflow automatic-work budget exhausted");
      const active = Object.keys(this.project.workflows)
        .flatMap((w) => this.executions(w))
        .some(
          (e) =>
            e.session === session.id &&
            ["allocated", "running"].includes(e.process),
        );
      if (active) throw new Error("session already executing a role");
      if (
        !grant.capabilities.every((c) =>
          session.profile.capabilities.includes(c),
        ) ||
        (grant.executorConstraints.protected &&
          !session.profile.isolation.includes("private-workspace")) ||
        (request.mode === "attached" &&
          grant.executorConstraints.model !== undefined &&
          session.profile.model !== grant.executorConstraints.model) ||
        (request.mode === "attached" &&
          grant.executorConstraints.exactModel !== undefined) ||
        (grant.executorConstraints.reasoning !== undefined &&
          session.profile.reasoning !== grant.executorConstraints.reasoning)
      )
        throw new Error("executor capabilities/isolation denied");
      const execution: Execution = {
        schemaVersion: 1,
        id: randomUUID(),
        workflowGrant: parent.id,
        roleGrant: grant.id,
        session: session.id,
        mode: request.mode,
        process: "allocated",
        attention: "working",
        failure: null,
        pid: null,
        predecessor: grant.predecessor,
        result: null,
        actions: [],
        requests: [],
        executor: {
          profile: session.profile.id,
          requested: {
            ...(request.executorPlan?.model
              ? { model: request.executorPlan.model }
              : {}),
            ...(request.executorPlan?.reasoning
              ? { reasoning: request.executorPlan.reasoning }
              : {}),
          },
          required: {
            ...(grant.executorConstraints.exactModel
              ? { exactModel: grant.executorConstraints.exactModel }
              : {}),
          },
          enforced: {
            model: request.executorPlan?.model !== undefined,
            reasoning: request.executorPlan?.reasoning !== undefined,
          },
          // Only provider-reported evidence confirms a model or effort; profile
          // configuration and supervisor identity never do.
          confirmed: { model: null, reasoning: null },
          attestation: { model: "unavailable", reasoning: "unavailable" },
        },
        ...(request.contained
          ? {
              filesystemIsolation: "bwrap" as const,
              workspaces: grant.workspaces.map((workspace) => ({
                id: workspace.id,
                mode: workspace.mode,
              })),
              syntheticHome: true as const,
            }
          : {}),
      };
      // Record exposure before delivering any workspace or contract to an executor.
      for (const workspace of grant.workspaces)
        if (workspace.exposure !== "public")
          this.#append(workflow, "kernel.exposure", {
            schemaVersion: 1,
            session: session.id,
            execution: execution.id,
            exposure: workspace.exposure,
            workspace: workspace.id,
            roleGrant: grant.id,
          });
      this.#append(workflow, "kernel.session", {
        ...session,
        workspaces: grant.workspaces,
      });
      this.#append(workflow, "kernel.allocation", {
        workflowGrant: parent.id,
        grant,
        execution,
      });
      if (!operationalRetry)
        this.#append(workflow, "kernel.automatic-work", {
          workflowGrant: parent.id,
          execution: execution.id,
          roleGrant: grant.id,
          used: automaticUsed + 1,
        });
      const allocation = required(definition.roles[grant.role]).policy
        .onAllocate;
      if (allocation) {
        const evidence: Data = {
          authorityOrigin: "allocation",
          execution: execution.id,
          roleGrant: grant.id,
        };
        for (const [field, input] of Object.entries(allocation.fromInputs))
          evidence[field] = required(grant.inputs[input]);
        if (allocation.counterField)
          evidence[allocation.counterField] =
            scopedEvents(this.events(workflow), definition.policy).filter(
              (e) => e.transition === allocation.transition,
            ).length + 1;
        const scope = definition.policy.scopeEvent;
        if (scope)
          evidence[scope.field] =
            this.events(workflow).findLast(
              (e) => e.transition === scope.transition,
            )?.evidence[scope.field] ?? scope.initial;
        this.#append(workflow, allocation.transition, evidence);
      }
      this.#telemetry("allocated", execution);
      return { execution, grant, duplicate: false };
    });
  }
  revokeWorkspaces(workflow: string, sessionId: string): void {
    this.#transaction(workflow, () => {
      this.#append(workflow, "kernel.session", {
        ...this.session(sessionId),
        workspaces: [],
      });
    });
  }
  process(
    workflow: string,
    id: string,
    state: Execution["process"],
    pid: number | null = null,
    failure: string | null = null,
    category: DiagnosticCategory | null = null,
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      if (!["allocated", "running"].includes(execution.process))
        throw new Error("process already terminal");
      this.#append(workflow, "kernel.process", {
        execution: id,
        update: {
          process: state,
          pid: pid ?? execution.pid,
          failure,
          ...(category ? { category } : {}),
          attention: ["allocated", "running"].includes(state)
            ? execution.attention
            : "terminal",
        },
      });
      if (category)
        this.#diagnostic(workflow, id, category, failure ?? category);
      if (!["allocated", "running"].includes(state))
        this.#omittedActions(workflow, id);
      const next = this.execution(workflow, id);
      this.#telemetry(state, next);
      return next;
    });
  }
  recover(): void {
    for (const workflow of Object.keys(this.project.workflows)) {
      const lock = `${this.path(workflow)}.lock`;
      try {
        const owner = Number(readFileSync(resolve(lock, "owner"), "utf8"));
        if (!Number.isSafeInteger(owner) || owner < 1)
          throw new Error("invalid authority lock owner");
        try {
          process.kill(owner, 0);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ESRCH")
            rmSync(lock, { recursive: true });
          else throw error;
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      for (const run of this.executions(workflow))
        if (["allocated", "running"].includes(run.process)) {
          // A semantic result already exists when only its exit handshake
          // was lost (for example the worker's own canonical transition was
          // blocked by a pre-transition artifact validator, and the host
          // restarted before the worker reported "exited"). That process
          // genuinely finished and delivered its result; generic recovery
          // must not brand it an uncontactable executor. Doing so would both
          // misreport the cause and permanently deny this execution any
          // later host action gated on a non-"interrupted" process (for
          // example promotion or publication).
          if (run.result) this.process(workflow, run.id, "exited");
          else
            this.process(
              workflow,
              run.id,
              "interrupted",
              null,
              "host recovery could not reattach executor",
            );
        }
    }
  }
  continuationStopped(
    workflow: string,
    workflowGrant: string,
    reason: string,
    category?: DiagnosticCategory,
  ): void {
    this.#transaction(workflow, () => {
      this.#append(workflow, "kernel.continuation-stopped", {
        workflowGrant,
        reason,
        ...(category ? { category } : {}),
      });
    });
  }
  // Execution-bound observation from the host or its registered adapter.
  diagnostic(
    workflow: string,
    id: string,
    category: DiagnosticCategory,
    detail: string,
  ): Diagnostic {
    return this.#transaction(workflow, () => {
      this.execution(workflow, id);
      return this.#diagnostic(workflow, id, category, detail);
    });
  }
  #diagnostic(
    workflow: string,
    id: string,
    category: DiagnosticCategory,
    detail: string,
  ): Diagnostic {
    if (!DIAGNOSTIC_CATEGORIES.includes(category))
      throw new Error("unknown diagnostic category");
    const value: Diagnostic = {
      schemaVersion: 1,
      execution: id,
      category,
      detail: safeDetail(detail),
    };
    this.#append(workflow, "kernel.diagnostic", value);
    return value;
  }
  // A valid result whose configured outcome requires a host action that was
  // never requested stays inspectably incomplete. Nothing is inferred from
  // process exit and the semantic result is preserved.
  #omittedActions(workflow: string, id: string): void {
    const execution = this.execution(workflow, id);
    const result = execution.result;
    if (!result || execution.transition?.status === "recorded") return;
    const grant = this.roleGrant(workflow, execution.roleGrant);
    const policy = required(
      this.definition(workflow, grant.methodology).roles[grant.role],
    ).policy;
    const missing = new Set(
      policy.outcomes
        .filter(
          (rule) =>
            rule.disposition === result.disposition &&
            matches(result.methodology, rule.methodology ?? {}),
        )
        .flatMap((rule) => rule.requiredActions ?? [])
        .filter(
          (kind) =>
            !execution.actions.some((action) => action.request.kind === kind),
        ),
    );
    for (const kind of missing)
      this.#diagnostic(
        workflow,
        id,
        "action-omitted",
        `required host action was not requested: ${kind}`,
      );
  }
  // Records provider-reported model/effort only. Absent values stay null.
  confirmExecutor(
    workflow: string,
    id: string,
    confirmed: {
      model: string | null;
      reasoning: string | null;
      version?: string | null;
    },
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      if (!["allocated", "running"].includes(execution.process))
        throw new Error("executor confirmation requires an active process");
      this.#append(workflow, "kernel.executor-confirmed", {
        execution: id,
        model: confirmed.model,
        reasoning: confirmed.reasoning,
        providerVersion: confirmed.version ?? null,
        source: "provider",
      });
      return this.execution(workflow, id);
    });
  }
  result(
    workflow: string,
    id: string,
    disposition: string,
    methodology: Data,
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      if (
        execution.result ||
        execution.superseded ||
        execution.attention === "WAITING_FOR_HUMAN" ||
        !["allocated", "running", "exited"].includes(execution.process)
      )
        throw new Error("result not permitted in this execution state");
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const role = required(
        this.definition(workflow, grant.methodology).roles[grant.role],
      );
      const resultConstraints = role.contract.resultConstraints ?? [];
      if (
        !role.contract.results.includes(disposition) ||
        !Object.entries(methodology).every(
          ([key, value]) =>
            typeof value === "string" &&
            role.contract.methodology[key]?.includes(value),
        )
      )
        throw new Error("result violates pinned contract");
      if (
        resultConstraints.some(
          (constraint) =>
            matches(methodology, constraint.when) &&
            (!(constraint.required ?? []).every(
              (field) => field in methodology,
            ) ||
              (constraint.absent ?? []).some((field) => field in methodology)),
        )
      )
        throw this.#terminalOutcomeError(workflow, grant);
      const matchingOutcomes = role.policy.outcomes.filter(
        (rule) =>
          rule.disposition === disposition &&
          matches(methodology, rule.methodology ?? {}),
      );
      if (resultConstraints.length && matchingOutcomes.length !== 1)
        throw this.#terminalOutcomeError(workflow, grant);
      for (const path of disposition === "succeeded"
        ? role.contract.postconditions
        : [])
        inside(
          resolve(
            this.project.root,
            required(this.project.workflows[workflow]).directory,
          ),
          path,
        );
      const result: RoleResult = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        roleGrant: grant.id,
        disposition,
        methodology,
      };
      this.#append(workflow, "kernel.result", result);
      this.#transition(workflow, id);
      const next = this.execution(workflow, id);
      this.#telemetry("semantic-result", next);
      return next;
    });
  }
  #transition(workflow: string, id: string): void {
    const execution = this.execution(workflow, id);
    if (!execution.result) return;
    const events = this.events(workflow);
    if (
      events.some(
        (e) =>
          e.transition === "kernel.transition" && e.evidence.execution === id,
      )
    )
      return;
    const grant = this.roleGrant(workflow, execution.roleGrant);
    const policy = required(
      this.definition(workflow, grant.methodology).roles[grant.role],
    ).policy;
    const result = execution.result;
    const rules = policy.outcomes.filter(
      (r) =>
        r.disposition === result.disposition &&
        matches(result.methodology, r.methodology ?? {}) &&
        (r.requiredActions ?? []).every((kind) =>
          execution.actions.some(
            (a) => a.request.kind === kind && a.status === "succeeded",
          ),
        ),
    );
    if (rules.length !== 1) return;
    const rule = required(rules[0]);
    if (
      events.some(
        (e) =>
          e.transition === rule.transition &&
          e.evidence.semanticResult === result.id,
      )
    )
      return;
    const evidence: Data = { ...rule.evidence?.fields };
    try {
      const pinned = this.definition(workflow, grant.methodology);
      if (
        Object.entries(pinned.validators).some(
          ([name, identity]) =>
            this.options.validators?.[name]?.identity !== identity,
        )
      )
        throw new Error("pinned validator implementation unavailable");
      if (rule.evidence?.allocation)
        Object.assign(
          evidence,
          required(
            events.findLast(
              (e) =>
                e.transition === rule.evidence?.allocation &&
                e.evidence.execution === id,
            ),
            "transition requires its exact allocation",
          ).evidence,
        );
      delete evidence.authorityOrigin;
      if (rule.evidence?.counterField)
        evidence[rule.evidence.counterField] =
          scopedEvents(
            events,
            this.definition(workflow, grant.methodology).policy,
          ).filter((e) => e.transition === rule.transition).length + 1;
      let artifactCommit: string | undefined;
      if (rule.evidence?.artifact || rule.evidence?.commitHead) {
        artifactCommit = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: this.project.root,
          encoding: "utf8",
        }).trim();
        if (evidence.commit === undefined) evidence.commit = artifactCommit;
        else evidence.artifactCommit = artifactCommit;
      }
      if (rule.evidence?.artifact) {
        const path = inside(
          resolve(
            this.project.root,
            required(this.project.workflows[workflow]).directory,
          ),
          rule.evidence.artifact,
        );
        const bytes = readFileSync(path);
        if (rule.evidence.validator)
          required(
            this.options.validators?.[rule.evidence.validator],
            "pinned validator unavailable",
          ).validate(JSON.parse(bytes.toString("utf8")), {
            projectRoot: this.project.root,
            workflowDirectory: required(this.project.workflows[workflow])
              .directory,
            inputs: grant.inputs,
            result: result.methodology,
          });
        if (
          identity(
            execFileSync(
              "git",
              [
                "show",
                `${required(artifactCommit)}:${relative(this.project.root, path)}`,
              ],
              { cwd: this.project.root },
            ),
          ) !== identity(bytes)
        )
          throw new Error(
            "transition artifact lacks exact committed provenance",
          );
        for (const [field, value] of Object.entries(
          rule.evidence.jsonChecks ?? {},
        )) {
          const parsed: unknown = JSON.parse(bytes.toString("utf8"));
          const actual = field
            .split(".")
            .reduce<unknown>((current, key) => object(current)[key], parsed);
          if (contentId(actual) !== contentId(value))
            throw new Error(`transition artifact check failed: ${field}`);
        }
        evidence.path = rule.evidence.artifact;
        evidence.identity = identity(bytes);
      }
    } catch (error) {
      this.#append(workflow, "kernel.transition-blocked", {
        execution: id,
        reason: (error as Error).message,
      });
      return;
    }
    const definition = this.definition(workflow, grant.methodology);
    const scope = definition.policy.scopeEvent;
    if (scope)
      evidence[scope.field] =
        events.findLast((e) => e.transition === scope.transition)?.evidence[
          scope.field
        ] ?? scope.initial;
    this.#append(workflow, rule.transition, {
      ...execution.result.methodology,
      ...evidence,
      execution: id,
      roleGrant: grant.id,
      semanticResult: execution.result.id,
      inputs: grant.inputs,
    });
    this.#append(workflow, "kernel.transition", {
      execution: id,
      result: execution.result.id,
    });
  }
  decide(
    workflow: string,
    workflowGrant: string,
    decision: string,
    evidence: Data,
  ): LedgerEvent {
    return this.#transaction(workflow, () => {
      const grant = this.grant(workflow, workflowGrant);
      const definition = this.definition(workflow, grant.methodology);
      const rule = definition.policy.humanDecisions?.[decision];
      if (!rule) throw new Error("human decision is not configured");
      const events = this.events(workflow);
      if (!predicate(rule.when, events, definition.policy))
        throw new Error("human decision precondition not satisfied");
      const current = scopedEvents(events, definition.policy);
      if (current.some((event) => event.transition === rule.transition))
        throw new Error("human decision already recorded in current scope");
      for (const [field, binding] of Object.entries(rule.bindings)) {
        let expected: unknown;
        if ("scope" in binding) {
          const scope = required(
            definition.policy.scopeEvent,
            "human decision scope binding is not configured",
          );
          expected =
            events.findLast((event) => event.transition === scope.transition)
              ?.evidence[scope.field] ?? scope.initial;
        } else {
          expected = (binding.current ? current : events).findLast(
            (event) => event.transition === binding.event,
          )?.evidence[binding.field];
        }
        if (
          expected === undefined ||
          evidence[field] === undefined ||
          contentId(evidence[field]) !== contentId(expected)
        )
          throw new Error(`human decision evidence mismatch: ${field}`);
      }
      for (const field of rule.requiredStrings ?? []) {
        const value = evidence[field];
        if (typeof value !== "string" || value.trim().length === 0)
          throw new Error(`human decision requires ${field}`);
      }
      for (const field of rule.requiredStringArrays ?? []) {
        const value = evidence[field];
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          !value.every(
            (item) => typeof item === "string" && item.trim().length > 0,
          )
        )
          throw new Error(`human decision requires ${field}`);
      }
      const canonical: Data = {
        ...evidence,
        authorityOrigin: "human",
        decision,
        workflowGrant: grant.id,
        methodology: definition.id,
        authorityBasis: authorityBasis(events),
      };
      this.#append(workflow, rule.transition, canonical);
      return { transition: rule.transition, evidence: canonical };
    });
  }
  root(
    workflow: string,
    workflowGrant: string,
    role: string,
    reason: string,
    uses = 1,
  ): RootAuthority {
    return this.#transaction(workflow, () => {
      const parent = this.grant(workflow, workflowGrant);
      if (
        !parent.roles.includes(role) ||
        !reason ||
        !Number.isSafeInteger(uses) ||
        uses < 1 ||
        uses > parent.maxAllocations
      )
        throw new Error("invalid bounded root authority");
      const root: RootAuthority = {
        schemaVersion: 1,
        id: randomUUID(),
        workflowGrant,
        project: this.project.id,
        workflow,
        basis: recoveryScopedAuthorityBasis(this.events(workflow)),
        role,
        reason,
        origin: "human",
        uses,
        change: "permit-role",
      };
      this.#append(workflow, "kernel.root", root);
      return root;
    });
  }
  ask(
    workflow: string,
    id: string,
    kind: HumanRequest["kind"],
    question: string,
    permission: string | null,
  ): HumanRequest {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const contract = required(
        this.definition(workflow, grant.methodology).roles[grant.role],
      ).contract;
      if (
        execution.process !== "running" ||
        execution.result ||
        execution.attention === "WAITING_FOR_HUMAN" ||
        !contract.human.includes(kind) ||
        !question ||
        (kind !== "input" && !permission)
      )
        throw new Error("human interaction denied");
      const request: HumanRequest = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        kind,
        question,
        permission,
        response: null,
      };
      if (kind === "input" && permission !== null)
        throw new Error(
          "permission changes require an approval or root request",
        );
      if (grant.executorConstraints.protected) {
        writeFileSync(
          this.#privatePath(request.id),
          JSON.stringify({ schemaVersion: 1, question, permission }),
          { mode: 0o600, flag: "wx" },
        );
        request.question = "[private human request]";
        request.permission = permission === null ? null : identity(permission);
      }
      this.#append(workflow, "kernel.human-request", request);
      this.#telemetry("waiting-for-human", execution);
      return request;
    });
  }
  respond(
    workflow: string,
    id: string,
    requestId: string,
    value: string,
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const request = execution.requests.find((r) => r.id === requestId);
      const activeRequest =
        execution.process === "running" &&
        execution.attention === "WAITING_FOR_HUMAN";
      const terminalRequest =
        !execution.result &&
        ["failed", "interrupted", "exited"].includes(execution.process);
      if (!request || request.response || (!activeRequest && !terminalRequest))
        throw new Error("human response does not bind an outstanding request");
      const responseId = randomUUID();
      const protectedRequest = this.roleGrant(workflow, execution.roleGrant)
        .executorConstraints.protected;
      let authority: string | null = null;
      if (request.kind !== "input") {
        const grant = this.roleGrant(workflow, execution.roleGrant);
        const root: RootAuthority = {
          schemaVersion: 1,
          id: randomUUID(),
          workflowGrant: execution.workflowGrant,
          project: this.project.id,
          workflow,
          basis: authorityBasis(this.events(workflow)),
          role: grant.role,
          reason: `human response to ${requestId}`,
          origin: "human",
          uses: 1,
          change: "human-response",
          execution: id,
          request: requestId,
          permission: required(request.permission),
          decision: {
            response: responseId,
            value: protectedRequest ? identity(value) : value,
          },
        };
        authority = root.id;
        this.#append(workflow, "kernel.root", root);
      }
      if (protectedRequest)
        writeFileSync(
          this.#privatePath(responseId),
          JSON.stringify({ schemaVersion: 1, value }),
          { mode: 0o600, flag: "wx" },
        );
      this.#append(workflow, "kernel.human-response", {
        execution: id,
        request: requestId,
        response: {
          schemaVersion: 1,
          id: responseId,
          value: protectedRequest ? "[private human response]" : value,
          authority,
        },
      });
      const next = this.execution(workflow, id);
      this.#telemetry("resumed", next);
      return next;
    });
  }
  publish(
    workflow: string,
    id: string,
    workspace: string,
    commit: string,
    ref: string,
  ): PublicationActionResult {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const request: PublicationActionRequest = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        roleGrant: grant.id,
        kind: "publication",
        workspace,
        commit,
        ref,
      };
      this.#append(workflow, "kernel.action-request", { ...request });
      const action: PublicationActionResult = {
        schemaVersion: 1,
        id: randomUUID(),
        request,
        status: "denied",
        before: null,
        after: null,
        reason: null,
        directPublication: false,
      };
      try {
        const allowed = grant.hostActions.publication;
        if (
          !allowed ||
          execution.superseded ||
          allowed.workspace !== workspace ||
          allowed.commit !== commit ||
          allowed.ref !== ref ||
          execution.attention === "WAITING_FOR_HUMAN" ||
          ["interrupted", "cancelled", "failed"].includes(execution.process)
        )
          throw new Error("publication outside role grant");
        if (!/^refs\/heads\/[A-Za-z0-9._/-]+$/.test(ref) || ref.includes(".."))
          throw new Error("invalid publication ref");
        const repo =
          this.project.workflows[workflow]?.workspaces?.[workspace] ??
          this.project.workspaces[workspace];
        const remote = this.project.remotes[allowed.remote];
        if (
          !repo ||
          !remote ||
          !grant.workspaces.some(
            (w) => w.id === repo.id && w.path === repo.path,
          )
        )
          throw new Error("publication repository/remote mismatch");
        // Resolve symlinks and check every declared executor workspace, not only
        // the requesting role's view. A remote must remain host-owned.
        action.status = "failed";
        const remotePath = realpathSync(remote);
        const workspaces = [
          ...Object.values(this.project.workspaces),
          ...Object.values(this.project.workflows).flatMap((w) =>
            Object.values(w.workspaces ?? {}),
          ),
        ];
        if (
          workspaces.some((w) => {
            const delta = relative(realpathSync(w.path), remotePath);
            return (
              delta === "" ||
              (!delta.startsWith("../") &&
                delta !== ".." &&
                !delta.startsWith("/"))
            );
          })
        ) {
          action.status = "denied";
          throw new Error(
            "host publication remote overlaps an executor workspace",
          );
        }
        const git = (args: string[]): string =>
          execFileSync("git", args, {
            cwd: repo.path,
            encoding: "utf8",
            stdio: "pipe",
          }).trim();
        if (git(["rev-parse", `${commit}^{commit}`]) !== commit)
          throw new Error("not an exact commit identity");
        git(["merge-base", "--is-ancestor", allowed.base, commit]);
        action.status = "failed";
        const remoteTip = (): string | null =>
          git(["ls-remote", "--refs", remotePath, ref]).split(/\s/)[0] || null;
        action.before = remoteTip();
        if (action.before !== null) {
          // Obtain the actual remote object; a stale tracking ref is not authority.
          git(["fetch", "--no-tags", remotePath, ref]);
          git(["merge-base", "--is-ancestor", action.before, commit]);
        }
        git([
          "push",
          `--force-with-lease=${ref}:${action.before ?? ""}`,
          remotePath,
          `${commit}:${ref}`,
        ]);
        action.after = remoteTip();
        if (action.after !== commit)
          throw new Error("remote did not retain the requested ref");
        action.status = "succeeded";
      } catch (error) {
        action.reason =
          (error as Error).message.split("\n")[0] ?? "publication failed";
      }
      this.#append(workflow, "kernel.action-result", {
        ...action,
        execution: id,
      });
      this.#actionDiagnostic(workflow, id, action);
      this.#transition(workflow, id);
      this.#telemetry("host-action", execution, action.id);
      return action;
    });
  }
  // Host-mediated evidence write. The role supplies exact destinations and
  // bytes; the host checks them against the contract allowlist recorded in the
  // grant, writes only those files, and commits only those paths under an
  // identity that names the allocated execution. It never infers or generates
  // content. Anything outside the allowlist is denied before any write.
  recordEvidence(
    workflow: string,
    id: string,
    files: Array<{ destination: string; content: string }>,
  ): EvidenceActionResult {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const request: EvidenceActionRequest = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        roleGrant: grant.id,
        kind: "evidence",
        files: files.map((file) => ({
          destination: file.destination,
          identity: identity(Buffer.from(file.content)),
          bytes: Buffer.byteLength(file.content),
        })),
      };
      this.#append(workflow, "kernel.action-request", { ...request });
      const action: EvidenceActionResult = {
        schemaVersion: 1,
        id: randomUUID(),
        request,
        status: "denied",
        before: null,
        after: null,
        reason: null,
        directPublication: false,
      };
      const restore: Array<() => void> = [];
      let repository: string | undefined;
      let paths: string[] = [];
      try {
        const allowed = grant.hostActions.evidence;
        const total = files.reduce(
          (sum, file) => sum + Buffer.byteLength(file.content),
          0,
        );
        if (
          !allowed ||
          execution.superseded ||
          execution.attention === "WAITING_FOR_HUMAN" ||
          ["interrupted", "cancelled", "failed"].includes(execution.process)
        )
          throw new Error("evidence outside role grant");
        if (
          files.length === 0 ||
          files.length > MAX_EVIDENCE_FILES ||
          total > MAX_EVIDENCE_BYTES ||
          files.some(
            (file) => Buffer.byteLength(file.content) > MAX_EVIDENCE_FILE_BYTES,
          )
        )
          throw new Error("evidence exceeds its request bound");
        if (
          new Set(files.map((file) => file.destination)).size !== files.length
        )
          throw new Error("evidence destinations are duplicated");
        for (const file of files)
          if (
            !evidencePath(file.destination) ||
            !allowed.destinations.some((rule) =>
              rule.endsWith("/")
                ? file.destination.startsWith(rule)
                : file.destination === rule,
            )
          )
            throw new Error("evidence destination outside role contract");
        const workspace =
          this.project.workflows[workflow]?.workspaces?.[allowed.workspace] ??
          this.project.workspaces[allowed.workspace];
        if (
          !workspace ||
          !grant.workspaces.some(
            (item) => item.id === workspace.id && item.path === workspace.path,
          )
        )
          throw new Error("evidence workspace outside role grant");
        action.status = "failed";
        repository = realpathSync(workspace.path);
        const workflowRoot = realpathSync(
          resolve(
            this.project.root,
            required(this.project.workflows[workflow]).directory,
          ),
        );
        const delta = relative(repository, workflowRoot);
        if (delta === ".." || delta.startsWith("../") || isAbsolute(delta))
          throw new Error("evidence workspace does not contain the workflow");
        const targets = files.map((file) => {
          // No symbolic link may stand between the workflow and a target.
          let current = workflowRoot;
          for (const part of file.destination.split("/")) {
            current = resolve(current, part);
            if (existsSync(current) && lstatSync(current).isSymbolicLink())
              throw new Error("evidence destination crosses a symbolic link");
          }
          if (existsSync(current) && !lstatSync(current).isFile())
            throw new Error("evidence destination is not a regular file");
          return current;
        });
        paths = targets.map((target) => relative(repository ?? "", target));
        const env = {
          ...process.env,
          GIT_AUTHOR_NAME: `harness-execution-${id}`,
          GIT_AUTHOR_EMAIL: `${id}@harness.invalid`,
          GIT_COMMITTER_NAME: `harness-execution-${id}`,
          GIT_COMMITTER_EMAIL: `${id}@harness.invalid`,
          GIT_TERMINAL_PROMPT: "0",
        };
        const git = (args: string[]): string =>
          execFileSync(
            "git",
            [
              "-C",
              required(repository),
              "-c",
              "core.hooksPath=/dev/null",
              "-c",
              "commit.gpgsign=false",
              ...args,
            ],
            { encoding: "utf8", stdio: "pipe", env },
          ).trim();
        action.before = git(["rev-parse", "--verify", "HEAD^{commit}"]);
        for (const [index, target] of targets.entries()) {
          const prior = existsSync(target) ? readFileSync(target) : null;
          const created: string[] = [];
          let directory = dirname(target);
          while (!existsSync(directory) && directory !== workflowRoot) {
            created.push(directory);
            directory = dirname(directory);
          }
          mkdirSync(dirname(target), { recursive: true });
          restore.push(() => {
            if (prior) writeFileSync(target, prior);
            else rmSync(target, { force: true });
            for (const path of created) rmSync(path, { recursive: true });
          });
          writeFileSync(target, required(files[index]).content);
        }
        git(["add", "--", ...paths]);
        if (git(["diff", "--cached", "--name-only", "--", ...paths]) === "")
          throw new Error("evidence would not change the repository");
        const message = [
          `evidence(${grant.role}): record ${String(files.length)} artifact${files.length === 1 ? "" : "s"}`,
          "",
          `Harness-Execution: ${id}`,
          `Harness-Role-Grant: ${grant.id}`,
          `Harness-Action: ${action.id}`,
          ...request.files.map(
            (file) => `Harness-Evidence: ${file.destination} ${file.identity}`,
          ),
        ].join("\n");
        git([
          "commit",
          "-q",
          "--no-verify",
          "--only",
          "-m",
          message,
          "--",
          ...paths,
        ]);
        restore.length = 0;
        action.after = git(["rev-parse", "--verify", "HEAD^{commit}"]);
        for (const [index, path] of paths.entries())
          if (
            identity(
              execFileSync(
                "git",
                ["-C", repository, "show", `${action.after}:${path}`],
                { stdio: "pipe" },
              ),
            ) !== required(request.files[index]).identity
          )
            throw new Error("committed evidence differs from the request");
        action.status = "succeeded";
      } catch (error) {
        for (const undo of restore.reverse()) {
          try {
            undo();
          } catch {
            /* best effort: the failure is already recorded */
          }
        }
        if (repository && paths.length > 0 && restore.length > 0)
          try {
            execFileSync(
              "git",
              ["-C", repository, "reset", "-q", "--", ...paths],
              { stdio: "pipe" },
            );
          } catch {
            /* the index is restored on the next explicit add */
          }
        action.reason =
          (error as Error).message.split("\n")[0] ?? "evidence failed";
      }
      this.#append(workflow, "kernel.action-result", {
        ...action,
        execution: id,
      });
      this.#actionDiagnostic(workflow, id, action);
      this.#transition(workflow, id);
      this.#telemetry("host-action", execution, action.id);
      return action;
    });
  }
  #actionDiagnostic(
    workflow: string,
    id: string,
    action: HostActionResult,
  ): void {
    if (action.status === "succeeded") return;
    this.#diagnostic(
      workflow,
      id,
      action.status === "denied" ? "action-denied" : "action-failed",
      `host ${action.request.kind} action ${action.status}: ${action.id}`,
    );
  }
  authorizeKnownLossPromotion(
    workflow: string,
    request: {
      execution: string;
      declarationPath: string;
      declarationIdentity: string;
    },
  ): {
    authority: string;
    declaration: ArchiveLossDeclaration;
    artifacts: PromotionArtifact[];
  } {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, request.execution);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const allowed = grant.hostActions.promotion;
      const events = this.events(workflow);
      const finalized = events.findLast(
        (event) =>
          event.transition === "verification-finalized" &&
          event.evidence.execution === execution.id,
      );
      if (
        grant.role !== "evaluator-verify" ||
        !allowed ||
        execution.result?.methodology.result !== "PASS" ||
        finalized?.evidence.result !== "PASS" ||
        finalized.evidence.commit !== allowed.candidate ||
        finalized.evidence.evaluatorRevision !== allowed.evaluatorRevision
      )
        throw new Error(
          "loss-aware promotion requires canonical finalized verification PASS",
        );
      const repository = realpathSync(this.project.root);
      const workflowRoot = realpathSync(
        resolve(
          repository,
          required(this.project.workflows[workflow]).directory,
        ),
      );
      const declarationPath = boundedPath(
        workflowRoot,
        request.declarationPath,
      );
      const declarationBytes = readFileSync(declarationPath);
      if (identity(declarationBytes) !== request.declarationIdentity)
        throw new Error("archive-loss declaration identity mismatch");
      const relativeDeclaration = relative(repository, declarationPath);
      const committed = execFileSync(
        "git",
        ["-C", repository, "show", `HEAD:${relativeDeclaration}`],
        { stdio: "pipe" },
      );
      if (identity(committed) !== request.declarationIdentity)
        throw new Error("archive-loss declaration lacks committed provenance");
      const declaration = parseArchiveLossDeclaration(
        JSON.parse(declarationBytes.toString("utf8")),
      );
      const sourceWorkspace = grant.workspaces.find((workspace) => {
        const configured =
          this.project.workflows[workflow]?.workspaces?.[
            allowed.sourceWorkspace
          ] ?? this.project.workspaces[allowed.sourceWorkspace];
        return configured?.id === workspace.id;
      });
      if (!sourceWorkspace)
        throw new Error("loss-aware promotion source workspace is unavailable");
      const sourceRoot = realpathSync(sourceWorkspace.path);
      const terminalAttempt = Number(finalized.evidence[allowed.attemptField]);
      const attempts: KnownAttempt[] = events
        .filter(
          (event) =>
            event.transition === allowed.allocationEvent &&
            typeof event.evidence[allowed.attemptField] === "number" &&
            Number(event.evidence[allowed.attemptField]) <= terminalAttempt,
        )
        .sort(
          (a, b) =>
            Number(a.evidence[allowed.attemptField]) -
            Number(b.evidence[allowed.attemptField]),
        )
        .map((allocation) => {
          const number = Number(allocation.evidence[allowed.attemptField]);
          const executionId = String(allocation.evidence.execution);
          const terminal = events.findLast(
            (event) =>
              event.transition === "verification-finalized" &&
              event.evidence.execution === executionId,
          );
          const prior = this.execution(workflow, executionId);
          const expectedPrivateArtifact = `.eval/attempts/${String(number).padStart(3, "0")}/eval-result.md`;
          return {
            attempt: number,
            execution: executionId,
            candidate: String(allocation.evidence.commit),
            evaluatorRevision: String(allocation.evidence.evaluatorRevision),
            publicOutcome: terminal
              ? String(terminal.evidence.result)
              : `${prior.process}:${prior.failure ?? "no-finalized-verdict"}`,
            expectedPrivateArtifact,
            privateArtifact: existsSync(
              resolve(sourceRoot, expectedPrivateArtifact),
            )
              ? "present"
              : "missing",
          };
        });
      validateKnownLossContext(declaration, {
        spike: workflow,
        candidate: allowed.candidate,
        evaluatorRevision: allowed.evaluatorRevision,
        successfulExecution: execution.id,
        successfulAttempt: terminalAttempt,
        attempts,
      });
      const publicArtifact = boundedPath(
        workflowRoot,
        String(finalized.evidence.path),
      );
      if (
        identity(readFileSync(publicArtifact)) !==
          finalized.evidence.identity ||
        finalized.evidence.identity !==
          identity(
            execFileSync(
              "git",
              [
                "-C",
                repository,
                "show",
                `${String(finalized.evidence.artifactCommit)}:${relative(repository, publicArtifact)}`,
              ],
              { stdio: "pipe" },
            ),
          )
      )
        throw new Error(
          "successful public verification evidence is not intact",
        );
      const artifacts = buildKnownLossArtifacts(sourceRoot, declaration);
      const authority = randomUUID();
      this.#append(workflow, "kernel.loss-aware-promotion-authorized", {
        schemaVersion: 1,
        id: authority,
        origin: "human",
        execution: execution.id,
        candidate: allowed.candidate,
        evaluatorRevision: allowed.evaluatorRevision,
        verification: finalized.id,
        declarationPath: request.declarationPath,
        declarationIdentity: request.declarationIdentity,
        archiveCompleteness: "incomplete-known-loss",
        normalValidation: "INELIGIBLE",
        normalValidationReason: declaration.promotionPlan.reason,
        bootstrapRuntimeCommit: declaration.bootstrapRuntimeCommit,
      });
      return { authority, declaration, artifacts };
    });
  }
  authorizeCompleteArchiveRecovery(
    workflow: string,
    request: {
      execution: string;
      declarationPath: string;
      declarationIdentity: string;
      hostRuntimeRepository: string;
      hostRuntimeCommit: string;
    },
  ): {
    authority: string;
    declaration: CompleteArchiveRecoveryDeclaration;
    artifacts: PromotionArtifact[];
  } {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, request.execution);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const allowed = grant.hostActions.promotion;
      const definition = this.definition(workflow, grant.methodology);
      const events = this.events(workflow);
      const current = scopedEvents(events, definition.policy);
      const finalized = current.findLast(
        (event) => event.transition === "verification-finalized",
      );
      if (
        grant.role !== "evaluator-verify" ||
        !allowed ||
        execution.result?.methodology.result !== "PASS" ||
        finalized?.evidence.result !== "PASS" ||
        finalized.evidence.execution !== execution.id ||
        finalized.evidence.commit !== allowed.candidate ||
        finalized.evidence.evaluatorRevision !== allowed.evaluatorRevision ||
        finalized.evidence.semanticResult !== execution.result.id
      )
        throw new Error(
          "complete-archive recovery requires the canonical current verification PASS",
        );
      if (
        current.some(
          (event) =>
            event.transition === allowed.transition &&
            event.evidence.semanticResult === finalized.evidence.semanticResult,
        )
      )
        throw new Error("authoritative PASS already has a recorded promotion");

      const repository = realpathSync(this.project.root);
      const workflowRoot = realpathSync(
        resolve(
          repository,
          required(this.project.workflows[workflow]).directory,
        ),
      );
      const declarationPath = boundedPath(
        workflowRoot,
        request.declarationPath,
      );
      const declarationBytes = readFileSync(declarationPath);
      if (identity(declarationBytes) !== request.declarationIdentity)
        throw new Error("complete-archive declaration identity mismatch");
      const relativeDeclaration = relative(repository, declarationPath);
      const committed = execFileSync(
        "git",
        ["-C", repository, "show", `HEAD:${relativeDeclaration}`],
        { stdio: "pipe" },
      );
      if (identity(committed) !== request.declarationIdentity)
        throw new Error(
          "complete-archive declaration lacks committed provenance",
        );
      const declaration = parseCompleteArchiveRecoveryDeclaration(
        JSON.parse(declarationBytes.toString("utf8")),
      );
      try {
        execFileSync(
          "git",
          [
            "-C",
            request.hostRuntimeRepository,
            "merge-base",
            "--is-ancestor",
            declaration.runtimeCommit,
            request.hostRuntimeCommit,
          ],
          { stdio: "pipe" },
        );
      } catch {
        throw new Error(
          "complete-archive recovery implementation is not in the host runtime lineage",
        );
      }

      const sourceWorkspace = grant.workspaces.find((workspace) => {
        const configured =
          this.project.workflows[workflow]?.workspaces?.[
            allowed.sourceWorkspace
          ] ?? this.project.workspaces[allowed.sourceWorkspace];
        return configured?.id === workspace.id;
      });
      if (!sourceWorkspace)
        throw new Error(
          "complete-archive recovery source workspace is unavailable",
        );
      const sourceRoot = realpathSync(sourceWorkspace.path);
      const terminalAttempt = Number(finalized.evidence[allowed.attemptField]);
      const allocations = current
        .filter(
          (event) =>
            event.transition === allowed.allocationEvent &&
            typeof event.evidence[allowed.attemptField] === "number" &&
            Number(event.evidence[allowed.attemptField]) <= terminalAttempt,
        )
        .sort(
          (a, b) =>
            Number(a.evidence[allowed.attemptField]) -
            Number(b.evidence[allowed.attemptField]),
        );
      const attempts: CompleteArchiveAttempt[] = allocations.map(
        (allocation, index) => {
          const number = Number(allocation.evidence[allowed.attemptField]);
          if (number !== index + 1)
            throw new Error(
              "canonical verification attempts are incomplete or out of order",
            );
          const executionId = String(allocation.evidence.execution);
          const terminals = current.filter(
            (event) =>
              event.transition === "verification-finalized" &&
              event.evidence.execution === executionId,
          );
          if (terminals.length !== 1)
            throw new Error(
              "every canonical verification allocation requires exactly one terminal result",
            );
          const terminal = required(terminals[0]);
          const result = terminal.evidence.result;
          if (!["PASS", "FAIL", "BLOCKED"].includes(String(result)))
            throw new Error("invalid canonical verification result");
          if (
            terminal.evidence.commit !== allocation.evidence.commit ||
            terminal.evidence.evaluatorRevision !==
              allocation.evidence.evaluatorRevision ||
            terminal.evidence[allowed.attemptField] !== number
          )
            throw new Error(
              "canonical verification allocation/result binding mismatch",
            );
          return {
            attempt: number,
            execution: executionId,
            candidate: String(allocation.evidence.commit),
            evaluatorRevision: String(allocation.evidence.evaluatorRevision),
            result: result as CompleteArchiveAttempt["result"],
          };
        },
      );

      const publicArtifact = boundedPath(
        workflowRoot,
        String(finalized.evidence.path),
      );
      const publicBytes = readFileSync(publicArtifact);
      if (
        identity(publicBytes) !== finalized.evidence.identity ||
        finalized.evidence.identity !==
          identity(
            execFileSync(
              "git",
              [
                "-C",
                repository,
                "show",
                `${String(finalized.evidence.artifactCommit)}:${relative(repository, publicArtifact)}`,
              ],
              { stdio: "pipe" },
            ),
          )
      )
        throw new Error(
          "authoritative public verification evidence is not intact",
        );
      let publicResult: Record<string, unknown>;
      try {
        publicResult = object(JSON.parse(publicBytes.toString("utf8")));
      } catch {
        throw new Error("authoritative public verification result is invalid");
      }
      const publicPlan = object(publicResult.promotionPlan);
      if (
        publicResult.result !== "PASS" ||
        publicResult.commit !== allowed.candidate ||
        publicResult.evaluatorRevision !== allowed.evaluatorRevision ||
        Number(publicResult.attempt) !== terminalAttempt ||
        publicPlan.identity !== declaration.promotionPlan.identity ||
        publicPlan.decision !== "INELIGIBLE"
      )
        throw new Error(
          "authoritative public verification result does not bind the immutable refusal",
        );

      const scope = definition.policy.scopeEvent;
      const cycleValue =
        finalized.evidence[scope?.field ?? "cycle"] ?? scope?.initial ?? "001";
      if (typeof cycleValue !== "string")
        throw new Error("canonical verification cycle is invalid");
      const cycle = cycleValue;
      const artifacts = buildCompleteArchiveArtifacts(sourceRoot, declaration, {
        workflow,
        cycle,
        candidate: allowed.candidate,
        evaluatorRevision: allowed.evaluatorRevision,
        successfulExecution: execution.id,
        successfulAttempt: terminalAttempt,
        verificationEvent: required(finalized.id),
        semanticResult: finalized.evidence.semanticResult,
        publicArtifactPath: String(finalized.evidence.path),
        publicArtifactIdentity: finalized.evidence.identity,
        attempts,
        promotionRecorded: false,
        runtimeCommit: declaration.runtimeCommit,
      });
      const authority = randomUUID();
      this.#append(workflow, "kernel.complete-archive-recovery-authorized", {
        schemaVersion: 1,
        id: authority,
        origin: "human",
        execution: execution.id,
        candidate: allowed.candidate,
        evaluatorRevision: allowed.evaluatorRevision,
        attempt: terminalAttempt,
        verification: finalized.id,
        semanticResult: finalized.evidence.semanticResult,
        declarationPath: request.declarationPath,
        declarationIdentity: request.declarationIdentity,
        classification: "PROMOTION_POLICY_DEFECT",
        archiveCompleteness: "complete",
        planIdentity: declaration.promotionPlan.identity,
        normalValidation: "INELIGIBLE",
        runtimeCommit: declaration.runtimeCommit,
        hostRuntimeCommit: request.hostRuntimeCommit,
        evidenceReconstructed: false,
        evidenceOmitted: false,
      });
      return { authority, declaration, artifacts };
    });
  }
  promote(
    workflow: string,
    id: string,
    candidate: string,
    evaluatorRevision: string,
    attempt: number,
    artifacts: PromotionArtifact[],
    archiveLoss?: NonNullable<PromotionActionRequest["archiveLoss"]>,
    archiveRecovery?: NonNullable<PromotionActionRequest["archiveRecovery"]>,
  ): PromotionActionResult {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const request: PromotionActionRequest = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        roleGrant: grant.id,
        kind: "promotion",
        candidate,
        evaluatorRevision,
        attempt,
        artifacts,
        ...(archiveLoss ? { archiveLoss } : {}),
        ...(archiveRecovery ? { archiveRecovery } : {}),
      };
      this.#append(workflow, "kernel.action-request", { ...request });
      const action: PromotionActionResult = {
        schemaVersion: 1,
        id: randomUUID(),
        request,
        status: "denied",
        artifacts: {},
        integrityIdentity: null,
        promotionIdentity: null,
        reason: null,
        directPublication: false,
      };
      let staging: string | undefined;
      try {
        const allowed = grant.hostActions.promotion;
        const allocation = allowed
          ? this.events(workflow).findLast(
              (event) =>
                event.transition === allowed.allocationEvent &&
                event.evidence.execution === id,
            )
          : undefined;
        if (
          !allowed ||
          !execution.result ||
          !matches(execution.result.methodology, allowed.when) ||
          execution.superseded ||
          execution.attention === "WAITING_FOR_HUMAN" ||
          ["interrupted", "cancelled", "failed"].includes(execution.process) ||
          allowed.candidate !== candidate ||
          allowed.evaluatorRevision !== evaluatorRevision ||
          !Number.isSafeInteger(attempt) ||
          attempt < 1 ||
          allocation?.evidence[allowed.attemptField] !== attempt ||
          artifacts.length === 0
        )
          throw new Error("promotion outside role grant");
        if (artifacts.length > MAX_ACTION_ARTIFACTS)
          throw new Error(
            `promotion exceeds the ${String(MAX_ACTION_ARTIFACTS)}-artifact action bound`,
          );
        const workspace = (name: string) =>
          this.project.workflows[workflow]?.workspaces?.[name] ??
          this.project.workspaces[name];
        const source = workspace(allowed.sourceWorkspace);
        const destination = workspace(allowed.destinationWorkspace);
        if (
          !source ||
          !destination ||
          destination.mode !== "write" ||
          !grant.workspaces.some(
            (item) => item.id === source.id && item.path === source.path,
          ) ||
          !grant.workspaces.some(
            (item) =>
              item.id === destination.id && item.path === destination.path,
          )
        )
          throw new Error("promotion workspace outside role grant");
        // A declared eligibility plan must itself be archived, exactly once,
        // so the promoted evidence carries the decision it was built from.
        if (
          allowed.plan !== undefined &&
          artifacts.filter((artifact) => artifact.source === allowed.plan)
            .length !== 1
        )
          throw new Error("promotion omits its recorded eligibility plan");
        action.status = "failed";
        const workflowRoot = realpathSync(
          resolve(
            this.project.root,
            required(this.project.workflows[workflow]).directory,
          ),
        );
        const destinationRoot = boundedPath(workflowRoot, allowed.destination);
        const destinationWorkspace = realpathSync(destination.path);
        const destinationParent = realpathSync(dirname(destinationRoot));
        const destinationDelta = relative(
          destinationWorkspace,
          destinationRoot,
        );
        const parentDelta = relative(workflowRoot, destinationParent);
        if (
          destinationDelta === ".." ||
          destinationDelta.startsWith("../") ||
          isAbsolute(destinationDelta) ||
          parentDelta === ".." ||
          parentDelta.startsWith("../") ||
          isAbsolute(parentDelta)
        )
          throw new Error("promotion destination escapes configured workspace");
        if (existsSync(destinationRoot))
          throw new Error("promotion destination already exists");
        staging = mkdtempSync(resolve(workflowRoot, ".promotion-"));
        const sourceRoot = realpathSync(source.path);
        for (const artifact of artifacts) {
          if (!artifact.source || !artifact.destination)
            throw new Error("invalid promotion artifact mapping");
          const sourcePath = inside(
            sourceRoot,
            boundedPath(sourceRoot, artifact.source),
          );
          const bytes = readFileSync(sourcePath);
          if (identity(bytes) !== artifact.identity)
            throw new Error("promotion source identity mismatch");
          const output = boundedPath(staging, artifact.destination);
          const promotedPath = relative(staging, output);
          if (
            promotedPath === "promotion.json" ||
            Object.hasOwn(action.artifacts, promotedPath)
          )
            throw new Error("invalid promotion artifact mapping");
          mkdirSync(dirname(output), { recursive: true });
          writeFileSync(output, bytes);
          action.artifacts[promotedPath] = artifact.identity;
        }
        action.integrityIdentity = contentId(action.artifacts);
        const manifest = Buffer.from(
          `${JSON.stringify(
            {
              schemaVersion: 1,
              request: {
                id: request.id,
                execution: id,
                roleGrant: grant.id,
                candidate,
                evaluatorRevision,
                attempt,
                destination: allowed.destination,
                artifacts: request.artifacts,
                ...(archiveLoss ? { archiveLoss } : {}),
                ...(archiveRecovery ? { archiveRecovery } : {}),
              },
              result: {
                artifacts: action.artifacts,
                integrityIdentity: action.integrityIdentity,
              },
            },
            null,
            2,
          )}\n`,
        );
        action.promotionIdentity = identity(manifest);
        writeFileSync(resolve(staging, "promotion.json"), manifest);
        renameSync(staging, destinationRoot);
        staging = undefined;
        action.status = "succeeded";
      } catch (error) {
        if (staging) rmSync(staging, { recursive: true, force: true });
        action.reason =
          (error as Error).message.split("\n")[0] ?? "promotion failed";
      }
      this.#append(workflow, "kernel.action-result", {
        ...action,
        execution: id,
      });
      this.#actionDiagnostic(workflow, id, action);
      const allowed = grant.hostActions.promotion;
      if (action.status === "succeeded" && allowed)
        this.#append(workflow, allowed.transition, {
          candidate,
          evaluatorRevision,
          attempt,
          destination: allowed.destination,
          artifacts: action.artifacts,
          integrityIdentity: required(action.integrityIdentity),
          promotionIdentity: required(action.promotionIdentity),
          ...(allowed.plan !== undefined
            ? {
                planIdentity: required(
                  artifacts.find((artifact) => artifact.source === allowed.plan)
                    ?.identity,
                ),
              }
            : {}),
          execution: id,
          roleGrant: grant.id,
          semanticResult: required(execution.result).id,
          action: action.id,
          ...(archiveLoss ? { archiveLoss } : {}),
          ...(archiveRecovery ? { archiveRecovery } : {}),
        });
      this.#transition(workflow, id);
      this.#telemetry("host-action", execution, action.id);
      return action;
    });
  }
  #telemetry(type: string, execution: Execution, action?: string): void {
    try {
      const emitted = this.options.telemetry?.({
        schemaVersion: 1,
        source: "host",
        type,
        at: new Date().toISOString(),
        workflowGrant: execution.workflowGrant,
        roleGrant: execution.roleGrant,
        execution: execution.id,
        session: execution.session,
        ...(action ? { action } : {}),
      });
      if (emitted) void emitted.catch(() => {});
    } catch {
      /* Observability cannot decide authority. */
    }
  }
}
