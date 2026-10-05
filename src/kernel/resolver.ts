import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  contentId,
  identity,
  matches,
  object,
  predicate,
  required,
  scopedEvents,
} from "./ledger.ts";
import { inside } from "./methodology.ts";
import type {
  BoundRole,
  LedgerEvent,
  MethodologyDefinition,
  Project,
  PreimplementationRecoveryAuthority,
  RoleGrant,
  RootAuthority,
  Session,
  WorkflowGrant,
  ArtifactValidators,
} from "./model.ts";

export type Resolution =
  | { kind: "grant"; grant: RoleGrant }
  | { kind: "denied" | "gate" | "stop"; reason: string };

const LEGACY_EVIDENCE_REASON =
  /^legacy-evaluator-publication-compatibility trusted-methodology=(9169ccf) runtime=([a-f0-9]{40})$/;
// A recovery does not erase history. It creates a later authority scope in
// which exactly the defective frozen transitions cannot satisfy predicates or
// supply role inputs. Everything else, including the frozen brief and a
// recorded human answer, remains available.
export function recoveryScopedEvents(events: LedgerEvent[]): LedgerEvent[] {
  const recoveries = events
    .filter((event) => event.transition === "kernel.preimplementation-recovery")
    .map(
      (event) =>
        event.evidence as unknown as PreimplementationRecoveryAuthority,
    );
  if (!recoveries.length) return events;
  const invalidated = new Set(
    recoveries.flatMap((recovery) =>
      recovery.invalidated.map((entry) => entry.event),
    ),
  );
  return events.filter((event) => !event.id || !invalidated.has(event.id));
}
// These are mechanics, not methodology facts. None may move the authority basis.
const MECHANICS = new Set([
  "kernel.definition",
  "kernel.workflow-grant",
  "kernel.workflow-grant-revoked",
  "kernel.workflow-grant-retired",
  "kernel.allocation",
  "kernel.session",
  "kernel.exposure",
  "kernel.process",
  "kernel.human-request",
  "kernel.human-response",
  "kernel.action-request",
  "kernel.action-result",
  "kernel.transition",
  "kernel.transition-blocked",
  "kernel.result",
  "kernel.automatic-work",
  "kernel.continuation-stopped",
  "kernel.diagnostic",
  "kernel.executor-confirmed",
  "kernel.prepared-observation",
]);
export function authorityBasis(events: LedgerEvent[]): string {
  return contentId(
    events.filter(
      (e) =>
        !MECHANICS.has(e.transition) &&
        e.evidence.authorityOrigin !== "allocation",
    ),
  );
}

// Recovery invalidates only named historical facts. Authority created after a
// recovery must bind the same filtered history that later resolution uses.
export function recoveryScopedAuthorityBasis(events: LedgerEvent[]): string {
  return authorityBasis(recoveryScopedEvents(events));
}
export function roleInputs(
  project: Project,
  workflow: string,
  role: BoundRole,
  events: LedgerEvent[],
  definition: MethodologyDefinition,
  validators: ArtifactValidators = {},
): Record<string, string> {
  const directory = project.workflows[workflow]?.directory;
  if (!directory) throw new Error("unknown workflow");
  const inputs: Record<string, string> = {};
  const documents: Record<string, unknown> = {};
  const fieldAt = (value: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>((v, key) => object(v)[key], value);
  for (const rule of role.contract.inputs) {
    const eventNames = Array.isArray(rule.event) ? rule.event : [rule.event];
    const findEvent = (candidates: LedgerEvent[]): LedgerEvent | undefined => {
      const afterIndex = rule.after
        ? events.findLastIndex((event) => event.transition === rule.after)
        : -1;
      const latest = candidates.findLast(
        (event) =>
          eventNames.includes(event.transition) &&
          events.indexOf(event) > afterIndex,
      );
      return latest && matches(latest.evidence, rule.eventFields ?? {})
        ? latest
        : undefined;
    };
    const event = rule.event
      ? rule.current
        ? findEvent(scopedEvents(events, definition.policy))
        : (findEvent(scopedEvents(events, definition.policy)) ??
          findEvent(events))
      : undefined;
    if (rule.event && !event) {
      if (rule.optional) continue;
      throw new Error(`required input event missing: ${String(rule.event)}`);
    }
    if (rule.field) {
      const field = event?.evidence[rule.field];
      if (typeof field !== "string") {
        if (rule.optional) continue;
        throw new Error(`required input identity missing: ${rule.name}`);
      }
      inputs[rule.name] = field;
    } else {
      const name = rule.path ?? event?.evidence.path;
      if (typeof name !== "string")
        throw new Error(`missing input path: ${rule.name}`);
      if (rule.optional && !existsSync(resolve(project.root, directory, name)))
        continue;
      const path = inside(resolve(project.root, directory), name);
      const bytes = readFileSync(path);
      inputs[rule.name] = identity(bytes);
      if (rule.validator)
        required(
          validators[rule.validator],
          "pinned artifact validator unavailable",
        ).validate(JSON.parse(bytes.toString("utf8")));
      if (
        rule.jsonChecks ||
        role.contract.inputs.some((r) => r.identityBinding?.input === rule.name)
      ) {
        documents[rule.name] = JSON.parse(bytes.toString("utf8")) as unknown;
        if (
          !Object.entries(rule.jsonChecks ?? {}).every(
            ([path, value]) =>
              contentId(fieldAt(documents[rule.name], path)) ===
              contentId(value),
          )
        )
          throw new Error(`input validation failed: ${rule.name}`);
      }
      if (event && event.evidence.identity !== inputs[rule.name])
        throw new Error(`frozen input changed: ${rule.name}`);
      if (rule.committed) {
        // A transition whose evidence already carries a `commit` (for
        // example verification's candidate) records its artifact's own
        // checkpoint as `artifactCommit`; provenance is that checkpoint.
        const commit = event?.evidence.artifactCommit ?? event?.evidence.commit;
        if (typeof commit !== "string" || !/^[a-f0-9]{40,64}$/.test(commit))
          throw new Error("input lacks committed provenance");
        const committed = execFileSync(
          "git",
          ["show", `${commit}:${relative(project.root, path)}`],
          { cwd: project.root },
        );
        if (identity(committed) !== inputs[rule.name])
          throw new Error("committed input mismatch");
      }
      if (rule.jsonValue) {
        const value = fieldAt(
          JSON.parse(bytes.toString("utf8")),
          rule.jsonValue,
        );
        if (typeof value !== "string")
          throw new Error("JSON input field must be a string");
        inputs[rule.name] = value;
      }
    }
  }
  for (const rule of role.contract.inputs)
    if (
      rule.identityBinding &&
      fieldAt(
        documents[rule.identityBinding.input],
        rule.identityBinding.field,
      ) !== inputs[rule.name]
    )
      throw new Error(`input identity binding mismatch: ${rule.name}`);
  return inputs;
}
export function resolveAuthority(
  project: Project,
  events: LedgerEvent[],
  definition: MethodologyDefinition,
  workflow: WorkflowGrant,
  requestedRole?: string,
  session?: Session,
  predecessor: string | null = null,
  validators: ArtifactValidators = {},
): Resolution {
  const effectiveEvents = recoveryScopedEvents(events);
  if (workflow.project !== project.id || workflow.methodology !== definition.id)
    return { kind: "denied", reason: "grant scope or definition mismatch" };
  // A worker's prose has no authority. A canonical request, however, is a
  // durable human gate even if its worker exits before it can receive the
  // answer. Do this before selecting either a normal successor or a root
  // override: neither may silently route around an unanswered question.
  const outstandingRequest = effectiveEvents.findLast(
    (event) =>
      event.transition === "kernel.human-request" &&
      !effectiveEvents.some(
        (response) =>
          response.transition === "kernel.human-response" &&
          response.evidence.request === event.evidence.id,
      ),
  );
  if (outstandingRequest)
    return {
      kind: "gate",
      reason: `canonical human request outstanding: ${String(outstandingRequest.evidence.id)}`,
    };
  if (
    Object.entries(definition.validators).some(
      ([name, id]) => validators[name]?.identity !== id,
    )
  )
    return {
      kind: "denied",
      reason: "pinned validator implementation unavailable",
    };
  const roots = effectiveEvents
    .filter((e) => e.transition === "kernel.root")
    .map((e) => e.evidence as unknown as RootAuthority);
  const basis = recoveryScopedAuthorityBasis(events);
  const allocations = effectiveEvents.filter(
    (e) =>
      e.transition === "kernel.allocation" &&
      e.evidence.workflowGrant === workflow.id,
  );
  const candidates = Object.entries(definition.roles).filter(
    ([name, role]) =>
      (!requestedRole || name === requestedRole) &&
      workflow.roles.includes(name) &&
      predicate(role.policy.when, effectiveEvents, definition.policy),
  );
  const override = roots.findLast((r) => {
    const index = events.findIndex((e) => e.evidence.id === r.id);
    const uses = allocations.filter(
      (a) => (a.evidence.grant as RoleGrant).rootAuthority === r.id,
    );
    return (
      r.workflowGrant === workflow.id &&
      r.change === "permit-role" &&
      (!requestedRole || r.role === requestedRole) &&
      r.project === project.id &&
      r.workflow === workflow.workflow &&
      r.basis === recoveryScopedAuthorityBasis(events.slice(0, index)) &&
      basis === recoveryScopedAuthorityBasis(events.slice(0, index + 1)) &&
      (r.uses > uses.length ||
        uses.some(
          (a) =>
            (a.evidence.grant as RoleGrant).predecessor === predecessor ||
            (predecessor === null &&
              (a.evidence.grant as RoleGrant).authorityBasis === basis),
        ))
    );
  });
  if (
    override &&
    candidates.length === 0 &&
    definition.roles[override.role] &&
    workflow.roles.includes(override.role)
  )
    candidates.push([override.role, required(definition.roles[override.role])]);
  if (!override) {
    const gate = definition.policy.gates.find((g) =>
      predicate(g.when, effectiveEvents, definition.policy),
    );
    if (gate) return { kind: "gate", reason: gate.reason };
    if (effectiveEvents.some((e) => workflow.stopAfter.includes(e.transition)))
      return { kind: "stop", reason: "workflow stopping condition reached" };
  }
  if (candidates.length !== 1)
    return {
      kind: candidates.length === 0 ? "denied" : "gate",
      reason:
        candidates.length === 0
          ? "no eligible configured role"
          : "ambiguous configured transition",
    };
  const [name, role] = required(candidates[0]);
  if (
    session &&
    role.contract.forbiddenExposure.some((exposure) =>
      session.exposures.includes(exposure),
    )
  )
    return { kind: "denied", reason: "session provenance prohibits role" };
  let inputs: Record<string, string>;
  try {
    inputs = roleInputs(
      project,
      workflow.workflow,
      role,
      effectiveEvents,
      definition,
      validators,
    );
  } catch (e) {
    return { kind: "denied", reason: (e as Error).message };
  }
  const evidence = role.contract.evidence;
  const workspaces = role.contract.workspaces.map((key) => {
    const value =
      project.workflows[workflow.workflow]?.workspaces?.[key] ??
      project.workspaces[key];
    if (!value) throw new Error(`workspace not configured: ${key}`);
    // Evidence is written only by the host, so the role never holds write
    // access to the workspace it mediates, whatever the project configures.
    return evidence?.workspace === key
      ? { ...value, mode: "read" as const }
      : value;
  });
  if (
    role.contract.protected &&
    !workspaces.some((w) => w.exposure !== "public")
  )
    return {
      kind: "denied",
      reason: "protected role requires a configured private workspace",
    };
  const publication = role.contract.publication;
  const publicationAction = publication
    ? {
        workspace: publication.workspace,
        remote: publication.remote,
        ref: publication.ref,
        commit: inputs[publication.commitInput] ?? "",
        base: inputs[publication.baseInput] ?? "",
      }
    : undefined;
  if (
    publicationAction &&
    (!/^[a-f0-9]{40,64}$/.test(publicationAction.commit) ||
      !/^[a-f0-9]{40,64}$/.test(publicationAction.base))
  )
    return {
      kind: "denied",
      reason: "publication requires exact commit/base inputs",
    };
  const promotion = role.contract.promotion;
  const promotionAction = promotion
    ? {
        sourceWorkspace: promotion.sourceWorkspace,
        destinationWorkspace: promotion.destinationWorkspace,
        destination: promotion.destination,
        candidate: inputs[promotion.candidateInput] ?? "",
        evaluatorRevision: inputs[promotion.revisionInput] ?? "",
        when: promotion.when,
        allocationEvent: promotion.allocationEvent,
        attemptField: promotion.attemptField,
        transition: promotion.transition,
        ...(promotion.plan ? { plan: promotion.plan } : {}),
        ...(promotion.derive ? { derive: promotion.derive } : {}),
      }
    : undefined;
  if (
    promotionAction &&
    (!promotionAction.candidate || !promotionAction.evaluatorRevision)
  )
    return {
      kind: "denied",
      reason: "promotion requires exact candidate/revision inputs",
    };
  const legacyEvidenceMatch = override?.reason.match(LEGACY_EVIDENCE_REASON);
  const legacyEvidenceDestination = "verification-result.json";
  const repositoryIndex = role.contract.workspaces.indexOf("repository");
  const repositoryWorkspace = workspaces[repositoryIndex];
  const legacyEvidenceCompatibility =
    legacyEvidenceMatch &&
    name === "evaluator-verify" &&
    role.contract.protected &&
    !evidence &&
    role.contract.capabilities.includes("repository-write") &&
    role.contract.capabilities.includes("git-commit") &&
    role.contract.postconditions.includes(legacyEvidenceDestination) &&
    repositoryWorkspace?.exposure === "public" &&
    repositoryWorkspace.mode === "write"
      ? {
          trustedMethodologyCommit: required(legacyEvidenceMatch[1]),
          runtimeCommit: required(legacyEvidenceMatch[2]),
          rootAuthority: required(override).id,
          destination: legacyEvidenceDestination,
          existingCapabilities: ["repository-write", "git-commit"] as const,
        }
      : undefined;
  const semantics = {
    workflowGrant: workflow.id,
    authorityBasis: basis,
    methodology: definition.id,
    role: name,
    contractIdentity: role.contractIdentity,
    skillIdentity: role.skill.identity,
    inputs,
    workspaces,
    capabilities: role.contract.capabilities,
    hostActions: {
      ...(evidence
        ? {
            evidence: {
              workspace: evidence.workspace,
              workspaceId: required(
                workspaces[
                  role.contract.workspaces.indexOf(evidence.workspace)
                ],
              ).id,
              destinations: [...evidence.destinations],
            },
          }
        : {}),
      ...(legacyEvidenceCompatibility
        ? {
            evidence: {
              workspace: "repository",
              workspaceId: required(repositoryWorkspace).id,
              destinations: [legacyEvidenceDestination],
            },
          }
        : {}),
      ...(publicationAction ? { publication: publicationAction } : {}),
      ...(promotionAction ? { promotion: promotionAction } : {}),
    },
    ...(legacyEvidenceCompatibility ? { legacyEvidenceCompatibility } : {}),
    executorConstraints: {
      forbiddenExposure: role.contract.forbiddenExposure,
      protected: role.contract.protected,
      ...workflow.executor,
    },
    predecessor,
    rootAuthority: override?.id ?? null,
  };
  const latestAllocation = allocations.findLast(
    (e) => (e.evidence.grant as RoleGrant).role === name,
  );
  if (!predecessor && latestAllocation) {
    const previousGrant = latestAllocation.evidence.grant as RoleGrant;
    const same =
      contentId({
        ...previousGrant,
        id: null,
        allocationKey: null,
        predecessor: null,
      }) ===
      contentId({
        schemaVersion: 1,
        ...semantics,
        id: null,
        allocationKey: null,
        predecessor: null,
      });
    if (same) return { kind: "grant", grant: previousGrant };
    semantics.predecessor = (
      latestAllocation.evidence.execution as { id: string }
    ).id;
  }
  const key = contentId(semantics);
  const prior = allocations.find(
    (e) => (e.evidence.grant as RoleGrant).allocationKey === key,
  );
  if (prior) return { kind: "grant", grant: prior.evidence.grant as RoleGrant };
  if (
    !override &&
    semantics.predecessor &&
    allocations.filter((a) => (a.evidence.grant as RoleGrant).role === name)
      .length > role.policy.retry.limit
  )
    return {
      kind: "stop",
      reason: "configured role retry/correction bound exhausted",
    };
  if (
    override &&
    allocations.filter(
      (a) => (a.evidence.grant as RoleGrant).rootAuthority === override.id,
    ).length >= override.uses
  )
    return { kind: "stop", reason: "root authority use bound exhausted" };
  if (
    allocations.length >=
    Math.min(workflow.maxAllocations, definition.policy.maxAllocations)
  )
    return { kind: "stop", reason: "allocation bound exhausted" };
  if (!workflow.continuation && allocations.length > 0 && !override)
    return { kind: "stop", reason: "continuation not authorized" };
  return {
    kind: "grant",
    grant: {
      schemaVersion: 1,
      id: contentId({ ...semantics, kind: "role-grant" }),
      allocationKey: key,
      ...semantics,
    },
  };
}
