import { randomUUID } from "node:crypto";

import { canonical, contentId } from "./ledger.ts";
import type {
  Data,
  ExecutorProfile,
  LedgerEvent,
  RoleGrant,
  Session,
} from "./model.ts";

export const AUTOMATIC_OPERATIONAL_RETRIES = 3;

export const OPERATIONAL_FAILURE_CLASSES = [
  "provider-unavailable",
  "authentication-failure",
  "containment-setup-failure",
  "workspace-storage-readiness-failure",
  "required-connectivity-tool-failure",
  "launch-shape-incompatibility",
  "attached-session-incompatibility",
  "pre-allocation-readiness-failure",
  "operational-retry-exhaustion",
] as const;
export type OperationalFailureClass =
  (typeof OPERATIONAL_FAILURE_CLASSES)[number];

export interface CanonicalExecutionShape {
  schemaVersion: 1;
  mode: "attached" | "spawned";
  role: string;
  provider: string;
  profile: string;
  model?: string;
  exactModel?: string;
  reasoning?: string;
  capabilities: string[];
  workspaces: Array<{
    id: string;
    path: string;
    mode: "read" | "write";
    exposure: string;
  }>;
  isolation: string[];
  containment: "bwrap" | "attached-provenance" | "fixture";
  hostActions: RoleGrant["hostActions"];
  contractIdentity: string;
  skillIdentity: string;
  inputBindingsIdentity: string;
  exposureClasses: string[];
  forbiddenExposure: string[];
  protected: boolean;
  resultInterface: "harness-worker-protocol-v1";
  attachment?: {
    session: string;
    exposures: string[];
    workspaces: Array<{ id: string; mode: "read" | "write" }>;
  };
}

export interface EffectiveExecutionShape {
  provider: string;
  profile: string;
  capabilities: string[];
  workspaces: Array<{ id: string; mode: "read" | "write" }>;
  isolation: string[];
  resultInterface: "harness-worker-protocol-v1";
}

export interface ReadinessProbeInput {
  readonly launchIntent: string;
  readonly shapeIdentity: string;
  readonly provider: string;
  readonly profile: string;
  readonly model?: string;
  readonly reasoning?: string;
  readonly containment: CanonicalExecutionShape["containment"];
  readonly capabilities: readonly string[];
  readonly expectedEffective: EffectiveExecutionShape;
  readonly syntheticWorkspaces: ReadonlyArray<{
    id: string;
    mode: "read" | "write";
    exposure: "synthetic";
  }>;
  readonly instruction: "HARNESS_READINESS_V1";
}

export interface ReadinessProbeResult {
  readonly state: "passed" | "failed";
  readonly effective?: EffectiveExecutionShape;
  readonly failure?: OperationalFailureClass;
}

export interface LaunchAttemptRecord {
  schemaVersion: 1;
  id: string;
  workflowGrant: string;
  role: string;
  mode: "attached" | "spawned";
  predecessor: string | null;
  launchIntent: string;
  shapeIdentity: string;
  shapeSummary: Data;
  adapter: string;
  runtimeGeneration: string;
  ordinal: number;
  readiness: "passed" | "failed" | "not-applicable";
  compatibility: "passed" | "failed" | "not-applicable";
  outcome: "ready" | "refused";
  failure: OperationalFailureClass | null;
  effective: Data | null;
  readinessIdentity: string | null;
  consumed: boolean;
}

export interface SemanticProgressObject {
  workflowScope: string;
  phase: string;
  eligibleRole: string | null;
  inputBindings: string | null;
  methodology: string;
  evaluatorRevision: string | null;
  lastDisposition: string | null;
  feedback: string | null;
  pendingTransition: string | null;
  reasonClass: string | null;
  eligibleActions: string[];
  authorityScope: string;
}

function sorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

export function deriveExecutionShape(
  grant: RoleGrant,
  profile: ExecutorProfile,
  mode: "attached" | "spawned",
  session?: Session,
): CanonicalExecutionShape {
  return {
    schemaVersion: 1,
    mode,
    role: grant.role,
    provider: profile.provider,
    profile: profile.id,
    ...(grant.executorConstraints.model
      ? { model: grant.executorConstraints.model }
      : profile.model
        ? { model: profile.model }
        : {}),
    ...(grant.executorConstraints.exactModel
      ? { exactModel: grant.executorConstraints.exactModel }
      : {}),
    ...(grant.executorConstraints.reasoning
      ? { reasoning: grant.executorConstraints.reasoning }
      : profile.reasoning
        ? { reasoning: profile.reasoning }
        : {}),
    capabilities: sorted(grant.capabilities),
    workspaces: grant.workspaces
      .map(({ id, path, mode: workspaceMode, exposure }) => ({
        id,
        path,
        mode: workspaceMode,
        exposure,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    isolation: sorted(profile.isolation),
    containment:
      mode === "attached"
        ? "attached-provenance"
        : profile.command?.length
          ? "fixture"
          : "bwrap",
    hostActions: structuredClone(grant.hostActions),
    contractIdentity: grant.contractIdentity,
    skillIdentity: grant.skillIdentity,
    inputBindingsIdentity: contentId(grant.inputs),
    exposureClasses: sorted(grant.workspaces.map((value) => value.exposure)),
    forbiddenExposure: sorted(grant.executorConstraints.forbiddenExposure),
    protected: grant.executorConstraints.protected,
    resultInterface: "harness-worker-protocol-v1",
    ...(mode === "attached" && session
      ? {
          attachment: {
            session: session.id,
            exposures: sorted(session.exposures),
            workspaces: session.workspaces
              .map(({ id, mode: workspaceMode }) => ({
                id,
                mode: workspaceMode,
              }))
              .sort((a, b) => a.id.localeCompare(b.id)),
          },
        }
      : {}),
  };
}

export function shapeIdentity(shape: CanonicalExecutionShape): string {
  return contentId(shape);
}

export function safeShapeSummary(shape: CanonicalExecutionShape): Data {
  return {
    mode: shape.mode,
    role: shape.role,
    provider: shape.provider,
    profile: shape.profile,
    capabilities: shape.capabilities,
    workspaces: shape.workspaces.map(({ id, mode, exposure }) => ({
      id,
      mode,
      exposure,
    })),
    isolation: shape.isolation,
    containment: shape.containment,
    hostActions: sorted(Object.keys(shape.hostActions)),
    exposureClasses: shape.exposureClasses,
    forbiddenExposure: shape.forbiddenExposure,
    protected: shape.protected,
    resultInterface: shape.resultInterface,
    ...(shape.attachment
      ? {
          attachment: {
            session: shape.attachment.session,
            exposures: shape.attachment.exposures,
            workspaces: shape.attachment.workspaces,
          },
        }
      : {}),
  };
}

export function effectiveShape(
  shape: CanonicalExecutionShape,
): EffectiveExecutionShape {
  return {
    provider: shape.provider,
    profile: shape.profile,
    capabilities: [...shape.capabilities],
    workspaces: shape.workspaces.map(({ id, mode }) => ({ id, mode })),
    isolation: [...shape.isolation],
    resultInterface: shape.resultInterface,
  };
}

export function assertEffectiveShape(
  requested: CanonicalExecutionShape,
  effective: EffectiveExecutionShape,
): void {
  const expected = effectiveShape(requested);
  if (
    canonical(expected) !==
    canonical({
      ...effective,
      capabilities: sorted(effective.capabilities),
      workspaces: [...effective.workspaces].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
      isolation: sorted(effective.isolation),
    })
  )
    throw new Error(
      "effective provider shape differs from canonical launch shape",
    );
}

export function authorityScopeIdentity(grant: RoleGrant): string {
  return contentId({
    methodology: grant.methodology,
    authorityBasis: grant.authorityBasis,
    role: grant.role,
    contractIdentity: grant.contractIdentity,
    skillIdentity: grant.skillIdentity,
    inputs: grant.inputs,
    ...(grant.inputEvidence ? { inputEvidence: grant.inputEvidence } : {}),
    workspaces: grant.workspaces,
    capabilities: sorted(grant.capabilities),
    hostActions: grant.hostActions,
    executorConstraints: grant.executorConstraints,
    rootAuthority: grant.rootAuthority,
  });
}

export function deriveLaunchIntent(input: {
  workflowScope: string;
  grant: RoleGrant;
  mode: "attached" | "spawned";
  predecessor?: string | null;
  shape: CanonicalExecutionShape;
  runtimeGeneration: string;
}): string {
  return contentId({
    workflowScope: input.workflowScope,
    role: input.grant.role,
    mode: input.mode,
    predecessor: input.predecessor ?? input.grant.predecessor,
    inputBindings: input.grant.inputs,
    methodology: input.grant.methodology,
    evaluatorRevision: input.grant.inputs.evaluatorRevision ?? null,
    shape: shapeIdentity(input.shape),
    runtimeGeneration: input.runtimeGeneration,
    authorityScope: authorityScopeIdentity(input.grant),
  });
}

export function probeInput(
  shape: CanonicalExecutionShape,
  launchIntent: string,
): ReadinessProbeInput {
  return {
    launchIntent,
    shapeIdentity: shapeIdentity(shape),
    provider: shape.provider,
    profile: shape.profile,
    ...(shape.model ? { model: shape.model } : {}),
    ...(shape.reasoning ? { reasoning: shape.reasoning } : {}),
    containment: shape.containment,
    capabilities: [...shape.capabilities],
    expectedEffective: effectiveShape(shape),
    syntheticWorkspaces: shape.workspaces.map(({ id, mode }) => ({
      id: `synthetic:${id}`,
      mode,
      exposure: "synthetic" as const,
    })),
    instruction: "HARNESS_READINESS_V1",
  };
}

export function readinessIdentity(input: ReadinessProbeInput): string {
  return contentId(input);
}

export function makeLaunchAttempt(
  input: Omit<LaunchAttemptRecord, "schemaVersion" | "id">,
): LaunchAttemptRecord {
  return { schemaVersion: 1, id: randomUUID(), ...input };
}

export function operationalAttempts(
  events: readonly LedgerEvent[],
  launchIntent: string,
): LaunchAttemptRecord[] {
  return events
    .filter(
      (event) =>
        event.transition === "kernel.launch-attempt" &&
        event.evidence.launchIntent === launchIntent,
    )
    .map((event) => event.evidence as unknown as LaunchAttemptRecord);
}

export function operationalRetryAllowance(
  events: readonly LedgerEvent[],
  launchIntent: string,
): { used: number; automaticRemaining: number; humanRemaining: number } {
  const attempts = operationalAttempts(events, launchIntent).length;
  const authorities = events
    .filter(
      (event) =>
        event.transition === "kernel.retry-authority" &&
        event.evidence.kind === "operational" &&
        event.evidence.scope === launchIntent,
    )
    .reduce((sum, event) => sum + Number(event.evidence.count ?? 0), 0);
  const automaticLimit = 1 + AUTOMATIC_OPERATIONAL_RETRIES;
  return {
    used: attempts,
    automaticRemaining: Math.max(0, automaticLimit - attempts),
    humanRemaining: Math.max(0, automaticLimit + authorities - attempts),
  };
}

export function operationalExhaustedIdentity(
  launchIntent: string,
  used = 1 + AUTOMATIC_OPERATIONAL_RETRIES,
): string {
  return contentId({
    kind: "operational",
    launchIntent,
    exhaustedAfter: used,
  });
}

export function semanticExhaustedIdentity(
  progress: string,
  used: number,
): string {
  return contentId({ kind: "semantic", progress, exhaustedAfter: used });
}

export function semanticProgressIdentity(
  value: SemanticProgressObject,
): string {
  return contentId({
    ...value,
    eligibleActions: sorted(value.eligibleActions),
  });
}

export function attachedCompatibility(
  shape: CanonicalExecutionShape,
  session: Session,
): OperationalFailureClass | null {
  const active = session.profile;
  if (
    !active.available ||
    !active.modes.includes("attached") ||
    shape.profile !== active.id ||
    !shape.capabilities.every((item) => active.capabilities.includes(item)) ||
    !shape.isolation.every((item) => active.isolation.includes(item)) ||
    (shape.model !== undefined && shape.model !== active.model) ||
    shape.exactModel !== undefined ||
    (shape.reasoning !== undefined && shape.reasoning !== active.reasoning) ||
    (shape.attachment !== undefined &&
      shape.attachment.session !== session.id) ||
    shape.forbiddenExposure.some((item) => session.exposures.includes(item))
  )
    return "attached-session-incompatibility";
  return null;
}
