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
  RoleGrant,
  RootAuthority,
  Session,
  WorkflowGrant,
  ArtifactValidators,
} from "./model.ts";

export type Resolution =
  | { kind: "grant"; grant: RoleGrant }
  | { kind: "denied" | "gate" | "stop"; reason: string };
// These are mechanics, not methodology facts. None may move the authority basis.
const MECHANICS = new Set([
  "kernel.definition",
  "kernel.workflow-grant",
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
        const commit = event?.evidence.commit;
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
  if (workflow.project !== project.id || workflow.methodology !== definition.id)
    return { kind: "denied", reason: "grant scope or definition mismatch" };
  if (
    Object.entries(definition.validators).some(
      ([name, id]) => validators[name]?.identity !== id,
    )
  )
    return {
      kind: "denied",
      reason: "pinned validator implementation unavailable",
    };
  const roots = events
    .filter((e) => e.transition === "kernel.root")
    .map((e) => e.evidence as unknown as RootAuthority);
  const basis = authorityBasis(events);
  const allocations = events.filter(
    (e) =>
      e.transition === "kernel.allocation" &&
      e.evidence.workflowGrant === workflow.id,
  );
  const candidates = Object.entries(definition.roles).filter(
    ([name, role]) =>
      (!requestedRole || name === requestedRole) &&
      workflow.roles.includes(name) &&
      predicate(role.policy.when, events, definition.policy),
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
      r.basis === authorityBasis(events.slice(0, index)) &&
      basis === authorityBasis(events.slice(0, index + 1)) &&
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
      predicate(g.when, events, definition.policy),
    );
    if (gate) return { kind: "gate", reason: gate.reason };
    if (events.some((e) => workflow.stopAfter.includes(e.transition)))
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
      events,
      definition,
      validators,
    );
  } catch (e) {
    return { kind: "denied", reason: (e as Error).message };
  }
  const workspaces = role.contract.workspaces.map((key) => {
    const value =
      project.workflows[workflow.workflow]?.workspaces?.[key] ??
      project.workspaces[key];
    if (!value) throw new Error(`workspace not configured: ${key}`);
    return value;
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
  const action = publication
    ? {
        workspace: publication.workspace,
        remote: publication.remote,
        ref: publication.ref,
        commit: inputs[publication.commitInput] ?? "",
        base: inputs[publication.baseInput] ?? "",
      }
    : undefined;
  if (
    action &&
    (!/^[a-f0-9]{40,64}$/.test(action.commit) ||
      !/^[a-f0-9]{40,64}$/.test(action.base))
  )
    return {
      kind: "denied",
      reason: "publication requires exact commit/base inputs",
    };
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
    hostActions: action ? { publication: action } : {},
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
