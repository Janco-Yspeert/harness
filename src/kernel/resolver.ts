import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
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
  Data,
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
import { splitWorkflow, workflowRepositoryRoot } from "./model.ts";
import type { CommitBinding, WorkspaceAccess } from "./model.ts";

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
  "kernel.launch-attempt",
  "kernel.readiness-consumed",
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
  inputEvidence: Record<string, Data> = {},
  options: { preserveResolvedSourceEvaluatorRevision?: boolean } = {},
): Record<string, string> {
  const directory = project.workflows[workflow]?.directory;
  if (!directory) throw new Error("unknown workflow");
  const inputs: Record<string, string> = {};
  const documents: Record<string, unknown> = {};
  const preservedInputs: Array<{ name: string; inputs: Data }> = [];
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
      if (splitWorkflow(project) && rule.name === "candidate") {
        const binding = event?.evidence.candidateBinding as
          CommitBinding | undefined;
        if (!binding)
          throw new Error("split candidate input lacks repository binding");
        validateCommitBinding(project, "repository", binding);
        if (binding.commit !== field)
          throw new Error("split candidate repository binding drift");
      }
      // Human evaluator-correction authority is a typed host-owned input, not
      // merely an opaque trigger. Project it only to the role whose contract
      // consumes that trigger so the repair worker can reason from the bound
      // diagnosis and source identities without widening the methodology.
      if (
        rule.name === "repairTrigger" &&
        event?.transition === "human-evaluator-correction-authorized"
      ) {
        inputEvidence[rule.name] = event.evidence;
        const sourceRevision = event.evidence.sourceEvaluatorRevision;
        // Finalized-source authorities bind the source revision directly.
        // Legacy authority events may predate that field, in which case the
        // existing contract input remains authoritative.
        if (
          typeof sourceRevision === "string" &&
          !options.preserveResolvedSourceEvaluatorRevision
        )
          inputs.sourceEvaluatorRevision = sourceRevision;
      }
      if (rule.evidenceField) {
        const exposed = fieldAt(event?.evidence, rule.evidenceField);
        if (
          exposed === null ||
          typeof exposed !== "object" ||
          Array.isArray(exposed) ||
          contentId(exposed) !== field
        )
          throw new Error(`input evidence identity mismatch: ${rule.name}`);
        inputEvidence[rule.name] = exposed as Data;
        if (rule.preserveInputsField) {
          const lineage = fieldAt(exposed, rule.preserveInputsField);
          if (
            lineage === null ||
            typeof lineage !== "object" ||
            Array.isArray(lineage)
          )
            throw new Error(`input lineage missing: ${rule.name}`);
          preservedInputs.push({ name: rule.name, inputs: lineage as Data });
        }
      }
    } else {
      const name = rule.path ?? event?.evidence.path;
      if (typeof name !== "string")
        throw new Error(`missing input path: ${rule.name}`);
      if (
        rule.optional &&
        !existsSync(resolve(workflowRepositoryRoot(project), directory, name))
      )
        continue;
      const path = inside(
        resolve(workflowRepositoryRoot(project), directory),
        name,
      );
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
        const qualified = event?.evidence.artifactBinding as
          CommitBinding | undefined;
        if (splitWorkflow(project)) {
          if (!qualified)
            throw new Error("split committed input lacks repository binding");
          validateCommitBinding(project, "workflow", qualified, {
            path: relative(workflowRepositoryRoot(project), path),
            sha256: required(inputs[rule.name]),
          });
        }
        const commit =
          qualified?.commit ??
          event?.evidence.artifactCommit ??
          event?.evidence.commit;
        if (typeof commit !== "string" || !/^[a-f0-9]{40,64}$/.test(commit))
          throw new Error("input lacks committed provenance");
        if (qualified) {
          const recorded =
            event?.evidence.artifactCommit ?? event?.evidence.commit;
          if (recorded !== qualified.commit)
            throw new Error("committed input repository binding drift");
        }
        const committed = execFileSync(
          "git",
          [
            "show",
            `${commit}:${relative(workflowRepositoryRoot(project), path)}`,
          ],
          { cwd: workflowRepositoryRoot(project) },
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
  for (const lineage of preservedInputs)
    for (const [name, expected] of Object.entries(lineage.inputs))
      if (typeof expected !== "string")
        throw new Error(
          `preserved input lineage mismatch: ${lineage.name}.${name}`,
        );
      else if (inputs[name] === undefined) {
        const rule = role.contract.inputs.find((input) => input.name === name);
        if (!rule?.optional)
          throw new Error(
            `preserved input lineage missing: ${lineage.name}.${name}`,
          );
        inputs[name] = expected;
      } else if (inputs[name] !== expected)
        throw new Error(
          `preserved input lineage mismatch: ${lineage.name}.${name}`,
        );
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
    // An unconsumed human evaluator-correction authority bound to the latest
    // finalized verification supersedes only that verification's own
    // classification gate. The recorded classification stays untouched and
    // every other gate still applies.
    const latestFinalized = effectiveEvents.findLast(
      (e) => e.transition === "verification-finalized",
    );
    const authorityIndex = effectiveEvents.findLastIndex(
      (e) => e.transition === "human-evaluator-correction-authorized",
    );
    const authority = effectiveEvents[authorityIndex];
    const laterRepairs = effectiveEvents
      .slice(authorityIndex + 1)
      .filter((e) => e.transition === "evaluator-repair-recorded");
    const boundRepairs = laterRepairs.filter((event) => {
      const value = event.evidence.inputs;
      if (value === null || typeof value !== "object" || Array.isArray(value))
        return false;
      const repairInputs = value as Data;
      return (
        repairInputs.repairTrigger === authority?.evidence.semanticResult &&
        repairInputs.sourceEvaluatorRevision ===
          authority?.evidence.sourceEvaluatorRevision
      );
    });
    const rootCorrectedRepair = (() => {
      if (
        laterRepairs.length !== 2 ||
        boundRepairs.length !== 1 ||
        laterRepairs[0] !== boundRepairs[0]
      )
        return false;
      const correction = required(laterRepairs[1]);
      const value = correction.evidence.inputs;
      if (value === null || typeof value !== "object" || Array.isArray(value))
        return false;
      if ((value as Data).repairTrigger !== authority?.evidence.semanticResult)
        return false;
      const allocation = effectiveEvents.find(
        (event) =>
          event.transition === "kernel.allocation" &&
          (event.evidence.grant as RoleGrant | undefined)?.id ===
            correction.evidence.roleGrant,
      );
      const grant = allocation?.evidence.grant as RoleGrant | undefined;
      const root = effectiveEvents.find(
        (event) =>
          event.transition === "kernel.root" &&
          event.evidence.id === grant?.rootAuthority,
      );
      return (
        grant !== undefined &&
        root !== undefined &&
        root.evidence.role === grant.role &&
        root.evidence.workflowGrant === grant.workflowGrant &&
        effectiveEvents.indexOf(required(laterRepairs[0])) <
          effectiveEvents.indexOf(root) &&
        effectiveEvents.indexOf(root) < effectiveEvents.indexOf(correction)
      );
    })();
    const onlyCandidate = candidates.length === 1 ? candidates[0]?.[0] : null;
    const authorityLiftsVerificationGate =
      latestFinalized !== undefined &&
      authority !== undefined &&
      authority.evidence.source === "finalized-verification" &&
      authority.evidence.finalizedEvent === latestFinalized.id &&
      effectiveEvents.indexOf(latestFinalized) < authorityIndex &&
      ((laterRepairs.length === 0 && onlyCandidate !== null) ||
        (laterRepairs.length === 1 &&
          boundRepairs.length === 1 &&
          onlyCandidate !== null) ||
        (rootCorrectedRepair && onlyCandidate !== null));
    const gate = definition.policy.gates.find((g) => {
      const when = object(g.when);
      const value = when.fields;
      const fields =
        value !== null && typeof value === "object" && !Array.isArray(value)
          ? (value as Data)
          : {};
      const exactSourceClassificationGate =
        when.event === "verification-finalized" &&
        fields.classification === authority?.evidence.sourceClassification;
      return (
        !(authorityLiftsVerificationGate && exactSourceClassificationGate) &&
        predicate(g.when, effectiveEvents, definition.policy)
      );
    });
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
  const inputEvidence: Record<string, Data> = {};
  try {
    inputs = roleInputs(
      project,
      workflow.workflow,
      role,
      effectiveEvents,
      definition,
      validators,
      inputEvidence,
      {
        preserveResolvedSourceEvaluatorRevision: override !== undefined,
      },
    );
    // A bounded root recovery is already the authority that admits the role.
    // Project only its own closed human reason into the worker assignment so
    // the worker can perform the authorized correction rather than guessing
    // from an opaque root-authority id. No other ledger state is exposed and
    // this evidence does not participate in eligibility or input resolution.
    if (override)
      inputEvidence.rootAuthority = {
        schemaVersion: 1,
        transition: "kernel.root",
        id: override.id,
        workflowGrant: override.workflowGrant,
        role: override.role,
        reason: override.reason,
        change: override.change,
        uses: override.uses,
      };
  } catch (e) {
    return { kind: "denied", reason: (e as Error).message };
  }
  const split = splitWorkflow(project);
  const evidence =
    split && role.contract.workflowEvidence
      ? {
          workspace: "workflow",
          destinations: role.contract.workflowEvidence.destinations,
        }
      : role.contract.evidence;
  const docsKey = project.workflowWorkspace ?? "";
  let splitGrant:
    | { access: Record<string, WorkspaceAccess>; gitCommit: string[] }
    | undefined;
  const workspaces = role.contract.workspaces.map((key) => {
    const value =
      project.workflows[workflow.workflow]?.workspaces?.[key] ??
      project.workspaces[key];
    if (!value) throw new Error(`workspace not configured: ${key}`);
    // Evidence is written only by the host, so the role never holds write
    // access to the workspace it mediates, whatever the project configures.
    return evidence?.workspace === key && !split
      ? { ...value, mode: "read" as const }
      : value;
  });
  if (split) {
    const maxima = SPLIT_ROLE_ACCESS[name];
    const sourceIndex = role.contract.workspaces.indexOf("repository");
    const docs = project.workspaces[docsKey];
    if (!maxima || sourceIndex < 0 || !docs)
      return { kind: "denied", reason: "split workflow role access undefined" };
    const writes = role.contract.capabilities.includes("repository-write");
    const commits = role.contract.capabilities.includes("git-commit");
    const narrow = (
      configured: string,
      maximum: WorkspaceAccess,
    ): WorkspaceAccess =>
      maximum === "write" && configured === "write" && writes
        ? "write"
        : maximum === "none"
          ? "none"
          : "read";
    const source = required(workspaces[sourceIndex]);
    const sourceAccess = narrow(source.mode, maxima.source);
    // Evidence is host-written, so the role itself holds docs read at most.
    const docsAccess = evidence ? "read" : narrow(docs.mode, maxima.workflow);
    workspaces[sourceIndex] = {
      ...source,
      mode: sourceAccess === "write" ? "write" : "read",
    };
    workspaces.push({
      ...docs,
      mode: docsAccess === "write" ? "write" : "read",
    });
    const access: Record<string, WorkspaceAccess> = {
      repository: sourceAccess,
      [docsKey]: docsAccess,
    };
    for (const [index, key] of role.contract.workspaces.entries())
      if (key !== "repository") access[key] = workspaces[index]?.mode ?? "read";
    splitGrant = {
      access,
      gitCommit: [
        ...(commits && sourceAccess === "write" ? ["repository"] : []),
        ...(commits && docsAccess === "write" ? [docsKey] : []),
      ],
    };
  }
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
        destinationWorkspace:
          split && promotion.destinationWorkspace === "repository"
            ? docsKey
            : promotion.destinationWorkspace,
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
    !split &&
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
    ...(Object.keys(inputEvidence).length > 0 ? { inputEvidence } : {}),
    workspaces,
    capabilities: role.contract.capabilities,
    ...(splitGrant ? splitGrant : {}),
    hostActions: {
      ...(evidence
        ? {
            evidence: {
              workspace: split ? docsKey : evidence.workspace,
              workspaceId: required(
                split
                  ? project.workspaces[docsKey]
                  : workspaces[
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
        ...withoutCommits(previousGrant),
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
      .length >
      role.policy.retry.limit +
        effectiveEvents
          .filter(
            (event) =>
              event.transition === "kernel.retry-authority" &&
              event.evidence.workflowGrant === workflow.id &&
              event.evidence.kind === "semantic" &&
              event.evidence.role === name,
          )
          .reduce((sum, event) => sum + Number(event.evidence.count ?? 0), 0)
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
      ...(split ? { commits: commitPair(project, inputs) } : {}),
    },
  };
}

// Brief §3 maxima. The role contract and configured workspace mode can only
// narrow these; an undefined role is refused rather than guessed.
const SPLIT_ROLE_ACCESS: Record<
  string,
  { source: WorkspaceAccess; workflow: WorkspaceAccess }
> = {
  "brief-readiness": { source: "read", workflow: "write" },
  "design-map": { source: "read", workflow: "write" },
  "evaluator-prepare": { source: "read", workflow: "write" },
  "evaluator-repair": { source: "read", workflow: "write" },
  implementation: { source: "write", workflow: "read" },
  "evaluator-verify": { source: "read", workflow: "read" },
  "as-built": { source: "read", workflow: "write" },
  outcome: { source: "read", workflow: "write" },
};

function withoutCommits(grant: RoleGrant): Omit<RoleGrant, "commits"> {
  const rest: Partial<RoleGrant> = { ...grant };
  delete rest.commits;
  return rest as Omit<RoleGrant, "commits">;
}

function headOf(root: string): string {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
}

// The allocation's source/workflow commit pair: the frozen candidate for a
// candidate-bound role, otherwise source HEAD; and the docs HEAD that holds
// the role's frozen inputs.
export function commitPair(
  project: Project,
  inputs: Record<string, string>,
): { source: CommitBinding; workflow: CommitBinding } {
  const docs = required(project.workspaces[project.workflowWorkspace ?? ""]);
  const source = required(project.workspaces.repository);
  const candidate = inputs.candidate;
  return {
    source: {
      workspace: "repository",
      repository: source.id,
      ...(project.origin ? { origin: project.origin } : {}),
      commit:
        candidate && /^[a-f0-9]{40}$/.test(candidate)
          ? candidate
          : headOf(source.path),
    },
    workflow: {
      workspace: "workflow",
      repository: docs.id,
      ...(project.workflowOrigin ? { origin: project.workflowOrigin } : {}),
      commit: headOf(docs.path),
    },
  };
}

// A split-mode grant must carry its explicit access map, and every mounted
// workspace's mode must be exactly the mapped access (never wider). Refusal
// precedes any session or provider exposure.
export function assertSplitGrant(project: Project, grant: RoleGrant): void {
  if (!grant.access || !grant.gitCommit || !grant.commits)
    throw new Error("split workflow grant lacks per-workspace access");
  const docsKey = project.workflowWorkspace ?? "";
  for (const key of ["repository", docsKey]) {
    const workspace = project.workspaces[key];
    const access = grant.access[key];
    const mounted = grant.workspaces.find((w) => w.id === workspace?.id);
    if (!workspace || !access || !mounted)
      throw new Error("split workflow grant omits a repository workspace");
    if ((access === "write") !== (mounted.mode === "write"))
      throw new Error("split workflow grant mode exceeds its access map");
  }
  for (const key of grant.gitCommit)
    if (grant.access[key] !== "write")
      throw new Error("git commit authority requires workspace write");
  if (
    grant.commits.source.workspace !== "repository" ||
    grant.commits.workflow.workspace !== "workflow"
  )
    throw new Error("split workflow grant commit pair is mis-owned");
  validateCommitBinding(project, "repository", grant.commits.source);
  validateCommitBinding(project, "workflow", grant.commits.workflow);
  if (
    grant.inputs.candidate !== undefined &&
    grant.commits.source.commit !== grant.inputs.candidate
  )
    throw new Error("split workflow grant candidate binding drift");
}

function bindingWorkspace(project: Project, owner: CommitBinding["workspace"]) {
  const key = owner === "repository" ? "repository" : project.workflowWorkspace;
  const workspace = key ? project.workspaces[key] : undefined;
  if (!workspace) throw new Error(`split ${owner} workspace is unavailable`);
  return { key, workspace };
}

// Validate committed provenance against the declared repository rather than
// process cwd. Historical commits remain valid; checkpoint ancestry is a
// separate, explicit check below.
export function validateCommitBinding(
  project: Project,
  owner: CommitBinding["workspace"],
  binding: CommitBinding,
  expected: { path?: string; sha256?: string } = {},
): void {
  if (binding.workspace !== owner)
    throw new Error("repository binding has the wrong owner");
  const { workspace } = bindingWorkspace(project, owner);
  if (binding.repository !== workspace.id)
    throw new Error("repository binding names the wrong repository");
  const configuredOrigin =
    owner === "repository" ? project.origin : project.workflowOrigin;
  if (binding.origin !== configuredOrigin)
    throw new Error("repository binding origin mismatch");
  if (!/^[a-f0-9]{40}$/.test(binding.commit))
    throw new Error("repository binding commit is not exact");
  try {
    execFileSync("git", ["cat-file", "-e", `${binding.commit}^{commit}`], {
      cwd: workspace.path,
      stdio: "pipe",
    });
  } catch {
    throw new Error("repository binding commit is unavailable");
  }
  if (expected.path !== undefined && binding.path !== expected.path)
    throw new Error("repository binding path mismatch");
  if (expected.sha256 !== undefined && binding.sha256 !== expected.sha256)
    throw new Error("repository binding content mismatch");
  if (binding.path === undefined) {
    if (binding.sha256 !== undefined)
      throw new Error("repository binding content lacks a path");
    return;
  }
  if (
    !binding.path ||
    isAbsolute(binding.path) ||
    binding.path
      .split("/")
      .some((part) => ["", ".", "..", ".git"].includes(part.toLowerCase()))
  )
    throw new Error("repository binding path is invalid");
  if (!binding.sha256)
    throw new Error("repository binding path lacks content identity");
  let bytes: Buffer;
  try {
    bytes = execFileSync("git", ["show", `${binding.commit}:${binding.path}`], {
      cwd: workspace.path,
      stdio: "pipe",
    });
  } catch {
    throw new Error("repository binding path is unavailable");
  }
  if (identity(bytes) !== binding.sha256)
    throw new Error("repository binding content mismatch");
}

export function assertBindingAdvance(
  project: Project,
  predecessor: CommitBinding,
  successor: CommitBinding,
): void {
  if (
    predecessor.workspace !== successor.workspace ||
    predecessor.repository !== successor.repository ||
    predecessor.origin !== successor.origin
  )
    throw new Error("repository checkpoint predecessor mismatch");
  validateCommitBinding(project, predecessor.workspace, predecessor);
  validateCommitBinding(project, successor.workspace, successor);
  const { workspace } = bindingWorkspace(project, successor.workspace);
  try {
    execFileSync(
      "git",
      ["merge-base", "--is-ancestor", predecessor.commit, successor.commit],
      { cwd: workspace.path, stdio: "pipe" },
    );
  } catch {
    throw new Error("repository checkpoint is not descended from predecessor");
  }
}

export function committedBinding(
  project: Project,
  owner: CommitBinding["workspace"],
  commit: string,
  path?: string,
  sha256?: string,
): CommitBinding {
  const { workspace } = bindingWorkspace(project, owner);
  const origin =
    owner === "repository" ? project.origin : project.workflowOrigin;
  const binding: CommitBinding = {
    workspace: owner,
    repository: workspace.id,
    ...(origin ? { origin } : {}),
    commit,
    ...(path ? { path } : {}),
    ...(sha256 ? { sha256 } : {}),
  };
  validateCommitBinding(project, owner, binding);
  return binding;
}
