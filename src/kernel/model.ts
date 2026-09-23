// Durable protocol versions are deliberately explicit, without a migration framework.
export const SCHEMA_VERSION = 1 as const;
export type Data = Record<string, unknown>;
export interface LedgerEvent {
  transition: string;
  evidence: Data;
  at?: string;
  schemaVersion?: number;
  id?: string;
}
export type Predicate =
  | { all: Predicate[] }
  | { any: Predicate[] }
  | { not: Predicate }
  | {
      event: string;
      fields?: Data;
      latest?: boolean;
      current?: boolean;
      after?: string;
      atLeast?: number;
    };
export interface InputRule {
  name: string;
  path?: string;
  event?: string | string[];
  eventFields?: Data;
  current?: boolean;
  after?: string;
  field?: string;
  committed?: boolean;
  optional?: boolean;
  jsonChecks?: Record<string, unknown>;
  identityBinding?: { input: string; field: string };
  validator?: string;
  jsonValue?: string;
}
export interface RoleContract {
  schemaVersion: 1;
  workspaces: string[];
  capabilities: string[];
  forbiddenExposure: string[];
  protected: boolean;
  inputs: InputRule[];
  results: string[];
  methodology: Record<string, string[]>;
  // Declarative cross-field result checks keep role vocabulary out of the
  // kernel. A matching `when` may require fields or require them to be absent.
  resultConstraints?: Array<{
    when: Data;
    required?: string[];
    absent?: string[];
  }>;
  human: Array<"input" | "approval" | "root">;
  postconditions: string[];
  publication?: {
    workspace: string;
    remote: string;
    ref: string;
    commitInput: string;
    baseInput: string;
  };
  promotion?: {
    sourceWorkspace: string;
    destinationWorkspace: string;
    destination: string;
    candidateInput: string;
    revisionInput: string;
    when: Data;
    allocationEvent: string;
    attemptField: string;
    transition: string;
  };
}
export interface RolePolicy {
  contract: string;
  skill: string;
  when: Predicate;
  retry: { dispositions: string[]; limit: number };
  onAllocate?: {
    transition: string;
    fromInputs: Record<string, string>;
    counterField?: string;
  };
  outcomes: Array<{
    disposition: string;
    methodology?: Data;
    transition: string;
    requiredActions?: string[];
    evidence?: {
      artifact?: string;
      commitHead?: boolean;
      fields?: Data;
      jsonChecks?: Data;
      validator?: string;
      counterField?: string;
      allocation?: string;
    };
  }>;
}
export interface WorkflowPolicy {
  schemaVersion: 1;
  roles: Record<string, RolePolicy>;
  gates: Array<{ when: Predicate; reason: string }>;
  scopeEvent?: { transition: string; field: string; initial: string };
  humanDecisions?: Record<
    string,
    {
      transition: string;
      when: Predicate;
      bindings: Record<
        string,
        { event: string; field: string; current?: boolean } | { scope: true }
      >;
      requiredStrings?: string[];
      requiredStringArrays?: string[];
    }
  >;
  maxAllocations: number;
}
export interface BoundRole {
  policy: RolePolicy;
  contract: RoleContract;
  contractIdentity: string;
  skill: { path: string; identity: string; content: string };
}
export interface MethodologyDefinition {
  schemaVersion: 1;
  id: string;
  policyIdentity: string;
  policy: WorkflowPolicy;
  roles: Record<string, BoundRole>;
  validators: Record<string, string>;
}
export interface Workspace {
  id: string;
  path: string;
  mode: "read" | "write";
  exposure: string;
}
export interface Project {
  schemaVersion: 1;
  id: string;
  root: string;
  policy: string;
  workflows: Record<
    string,
    {
      directory: string;
      ledger: string;
      workspaces?: Record<string, Workspace>;
    }
  >;
  workspaces: Record<string, Workspace>;
  remotes: Record<string, string>;
}
export interface WorkflowGrant {
  schemaVersion: 1;
  id: string;
  project: string;
  workflow: string;
  methodology: string;
  authorityBasis: string;
  origin: "human";
  continuation: boolean;
  delegation: Array<"attached" | "spawned">;
  roles: string[];
  stopAfter: string[];
  maxAllocations: number;
  maxAutomaticWork?: number;
  supersedes?: string;
  inline?: boolean;
  executor?: { model?: string; reasoning?: string };
}
export interface HumanEvaluatorCorrectionAuthority {
  schemaVersion: 1;
  id: string;
  project: string;
  workflow: string;
  origin: "human";
  classification: "EVALUATOR_COVERAGE_DEFECT";
  sourceEvaluatorRevision: string;
  attempt: number;
  execution: string;
  rejectionEvent: string;
  evidenceCommit: string;
  evidencePath: string;
  evidenceIdentity: string;
  reason: string;
  semanticResult: string;
}
// A canonical PASS is not a failed execution, so it cannot use the narrowly
// scoped evaluator-correction authority above. This record opens one explicit
// successor correction cycle while retaining the exact PASS it responds to.
export interface HumanCorrectionCycleAuthority {
  schemaVersion: 1;
  id: string;
  project: string;
  workflow: string;
  origin: "human";
  cycle: string;
  predecessorCycle: string;
  classification: "IMPLEMENTATION_AND_EVALUATOR_DEFECT";
  sourceExecution: string;
  sourceRoleGrant: string;
  sourceSemanticResult: string;
  sourceCommit: string;
  sourceEvaluatorRevision: string;
  sourceAttempt: number;
  sourceArtifactCommit: string;
  sourceArtifactPath: string;
  sourceArtifactIdentity: string;
  defects: string[];
  reason: string;
  semanticResult: string;
}
export interface ExecutorProfile {
  id: string;
  provider: string;
  modes: Array<"attached" | "spawned">;
  capabilities: string[];
  isolation: string[];
  available: boolean;
  model?: string;
  reasoning?: string;
  usage?: "unavailable" | number;
  cost?: number;
  command?: string[];
}
export interface Session {
  schemaVersion: 1;
  id: string;
  profile: ExecutorProfile;
  tokenHash: string;
  exposures: string[];
  workspaces: Workspace[];
  registeredAt: string;
}
export interface RoleGrant {
  schemaVersion: 1;
  id: string;
  workflowGrant: string;
  methodology: string;
  authorityBasis: string;
  allocationKey: string;
  role: string;
  contractIdentity: string;
  skillIdentity: string;
  inputs: Record<string, string>;
  workspaces: Workspace[];
  capabilities: string[];
  hostActions: {
    publication?: {
      workspace: string;
      remote: string;
      ref: string;
      commit: string;
      base: string;
    };
    promotion?: {
      sourceWorkspace: string;
      destinationWorkspace: string;
      destination: string;
      candidate: string;
      evaluatorRevision: string;
      when: Data;
      allocationEvent: string;
      attemptField: string;
      transition: string;
    };
  };
  executorConstraints: {
    forbiddenExposure: string[];
    protected: boolean;
    model?: string;
    reasoning?: string;
  };
  predecessor: string | null;
  rootAuthority: string | null;
}
export interface RoleResult {
  schemaVersion: 1;
  id: string;
  execution: string;
  roleGrant: string;
  disposition: string;
  methodology: Data;
}
export interface Execution {
  schemaVersion: 1;
  id: string;
  workflowGrant: string;
  roleGrant: string;
  session: string;
  mode: "attached" | "spawned";
  process:
    "allocated" | "running" | "exited" | "failed" | "cancelled" | "interrupted";
  attention: "working" | "WAITING_FOR_HUMAN" | "terminal";
  failure: string | null;
  pid: number | null;
  predecessor: string | null;
  result: RoleResult | null;
  transition?: { status: "recorded" | "blocked"; reason: string | null };
  superseded?: boolean;
  actions: HostActionResult[];
  requests: HumanRequest[];
  executor?: {
    requested: { model?: string; reasoning?: string };
    confirmed: { model: string | null; reasoning: string | null };
  };
}
export interface RootAuthority {
  schemaVersion: 1;
  id: string;
  workflowGrant: string;
  project: string;
  workflow: string;
  basis: string;
  role: string;
  reason: string;
  origin: "human";
  uses: number;
  change: "permit-role" | "human-response";
  execution?: string;
  request?: string;
  permission?: string;
  decision?: { response: string; value: string };
}
export interface HumanRequest {
  schemaVersion: 1;
  id: string;
  execution: string;
  kind: "input" | "approval" | "root";
  question: string;
  permission: string | null;
  response: {
    schemaVersion: 1;
    id: string;
    value: string;
    authority: string | null;
  } | null;
}
export interface PublicationActionRequest {
  schemaVersion: 1;
  id: string;
  execution: string;
  roleGrant: string;
  kind: "publication";
  workspace: string;
  commit: string;
  ref: string;
}
export interface PromotionArtifact {
  source: string;
  destination: string;
  identity: string;
}
export interface PromotionActionRequest {
  schemaVersion: 1;
  id: string;
  execution: string;
  roleGrant: string;
  kind: "promotion";
  candidate: string;
  evaluatorRevision: string;
  attempt: number;
  artifacts: PromotionArtifact[];
}
export type HostActionRequest =
  PublicationActionRequest | PromotionActionRequest;
export interface PublicationActionResult {
  schemaVersion: 1;
  id: string;
  request: PublicationActionRequest;
  status: "succeeded" | "failed" | "denied";
  before: string | null;
  after: string | null;
  reason: string | null;
  directPublication: false;
}
export interface PromotionActionResult {
  schemaVersion: 1;
  id: string;
  request: PromotionActionRequest;
  status: "succeeded" | "failed" | "denied";
  artifacts: Record<string, string>;
  integrityIdentity: string | null;
  promotionIdentity: string | null;
  reason: string | null;
  directPublication: false;
}
export type HostActionResult = PublicationActionResult | PromotionActionResult;
export interface Telemetry {
  schemaVersion: 1;
  source: "host";
  type: string;
  at: string;
  workflowGrant: string;
  roleGrant: string;
  execution: string;
  session: string;
  action?: string;
}
export type TelemetrySink = (event: Telemetry) => void | Promise<void>;
// Selection is operational, never a source of methodology authority.
export type ExecutorSelector = (
  grant: RoleGrant,
  profiles: ExecutorProfile[],
) => ExecutorProfile | undefined;
export type ArtifactValidators = Record<
  string,
  {
    identity: string;
    validate: (
      document: unknown,
      context?: {
        projectRoot: string;
        workflowDirectory: string;
        inputs: Record<string, string>;
        result: Data;
      },
    ) => void;
  }
>;
