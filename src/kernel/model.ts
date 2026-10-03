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
  // Host-mediated evidence writes. The role authors exact file bytes and the
  // host writes and commits only allowlisted destinations. Destinations are
  // relative to the workflow directory; an entry ending in "/" is a directory
  // prefix. The named workspace is granted read-only, and such a contract
  // carries neither repository-write nor git-commit.
  evidence?: {
    workspace: string;
    destinations: string[];
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
    // Optional recorded eligibility plan, relative to the source workspace.
    // When declared, the request must archive that exact plan file.
    plan?: string;
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
  // Root-relative path to this project's append-only trusted methodology
  // history. New Workflow Execution Grants are denied without it.
  trustedHistory?: string;
  // Validator name -> root-relative source path. It defines the validator set
  // of this project's trusted methodology manifest.
  validatorSources?: Record<string, string>;
  // Absolute methodology source root. Present only for an external project,
  // whose policy, trusted history and validator sources resolve inside this
  // root's own Git repository instead of the project root.
  methodologyRoot?: string;
  // Expected `origin` repository identity (`github.com/<owner>/<repo>`),
  // checked against the project repository's actual remote at host start.
  origin?: string;
}
// Public-safe execution diagnostics. Categories are observations, never
// semantic results, host actions or canonical transitions.
export const DIAGNOSTIC_CATEGORIES = [
  "no-adapter",
  "provider-not-installed",
  "provider-config-invalid",
  "assignment-not-delivered",
  "permission-denied",
  "provider-crashed",
  "missing-result",
  "result-rejected",
  "action-omitted",
  "action-denied",
  "action-failed",
  "rate-limited",
  "provider-error",
  "cancelled",
] as const;
export type DiagnosticCategory = (typeof DIAGNOSTIC_CATEGORIES)[number];
export interface Diagnostic {
  schemaVersion: 1;
  execution: string;
  category: DiagnosticCategory;
  detail: string;
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
  // A forward-only human recovery replaces a defective pre-implementation
  // scope. The source grant remains durable but is permanently revoked.
  recovery?: string;
  supersedes?: string;
  inline?: boolean;
  executor?: { model?: string; reasoning?: string };
  // Host-written methodology source binding (never caller configuration).
  source?: MethodologySourceBinding;
}
export interface MethodologySourceBinding {
  // Real Git top-level of the repository the trusted methodology is read from.
  methodologyRepository: string;
  trusted: { sequence: number; manifest: string; revision: string };
  // External projects only: the exact committed Harness checkout the host
  // runs from.
  runtime?: { repository: string; commit: string };
}
export interface PreimplementationRecoveryAuthority {
  schemaVersion: 1;
  id: string;
  project: string;
  workflow: string;
  origin: "human";
  reason: string;
  invalidated: Array<{
    event: string;
    transition: "design-map-frozen" | "evaluation-prepared";
    execution: string;
    roleGrant: string;
    semanticResult: string;
    commit: string;
    path: string;
    identity: string;
  }>;
  dependencies: Array<{
    from: string;
    to: string;
    kind: "prepared-from-design";
    identity: string;
  }>;
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
  // Operational bound on provider turns for registered adapters.
  maxTurns?: number;
  // Fixture-only: honoured solely when a profile is passed programmatically
  // to the host. Production configuration rejects it.
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
    evidence?: {
      workspace: string;
      // Identity of the read-only workspace the host writes on the role's behalf.
      workspaceId: string;
      destinations: string[];
    };
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
      plan?: string;
    };
  };
  // Explicit, root-authorized transport compatibility for a legacy protected
  // evaluator that already held direct repository write + commit authority.
  // This grants no result vocabulary or evaluation authority.
  legacyEvidenceCompatibility?: {
    trustedMethodologyCommit: string;
    runtimeCommit: string;
    rootAuthority: string;
    destination: string;
    existingCapabilities: readonly ["repository-write", "git-commit"];
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
export interface TerminalOutcome {
  disposition: string;
  methodology: Data;
  requiredMethodology: string[];
  allowedMethodology: Record<string, string[]>;
}
export interface WorkerExecutionContext {
  workflow: string;
  execution: string;
  candidate?: string;
  evaluatorRevision?: string;
  attempt?: number;
  publicArtifactRoot: string;
  permittedEvidenceDestinations: string[];
  privateWorkspaceIds: string[];
  terminalOutcomes: TerminalOutcome[];
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
  category?: DiagnosticCategory;
  diagnostics?: Diagnostic[];
  pid: number | null;
  predecessor: string | null;
  result: RoleResult | null;
  transition?: { status: "recorded" | "blocked"; reason: string | null };
  superseded?: boolean;
  actions: HostActionResult[];
  requests: HumanRequest[];
  executor?: {
    requested: { model?: string; reasoning?: string };
    enforced: { model: boolean; reasoning: boolean };
    confirmed: { model: string | null; reasoning: string | null };
    attestation: {
      model: "provider-attested" | "unavailable";
      reasoning: "provider-attested" | "unavailable";
    };
  };
  // Public-safe host containment evidence (Spike 014h). Present only when the
  // spawned provider was launched inside host filesystem isolation; it holds
  // no paths, credentials or provider configuration.
  filesystemIsolation?: "bwrap";
  workspaces?: Array<{ id: string; mode: "read" | "write" }>;
  syntheticHome?: true;
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
  archiveLoss?: {
    archiveCompleteness: "incomplete-known-loss";
    authority: string;
    declarationPath: string;
    declarationIdentity: string;
    normalValidation: "INELIGIBLE";
    normalValidationReason: string;
  };
  archiveRecovery?: {
    archiveCompleteness: "complete";
    classification: "PROMOTION_POLICY_DEFECT";
    authority: string;
    declarationPath: string;
    declarationIdentity: string;
    runtimeCommit: string;
    normalValidation: "INELIGIBLE";
    planIdentity: string;
    evidenceReconstructed: false;
    evidenceOmitted: false;
  };
}
export interface EvidenceFileRecord {
  destination: string;
  identity: string;
  bytes: number;
}
export interface EvidenceActionRequest {
  schemaVersion: 1;
  id: string;
  execution: string;
  roleGrant: string;
  kind: "evidence";
  files: EvidenceFileRecord[];
}
export type HostActionRequest =
  PublicationActionRequest | PromotionActionRequest | EvidenceActionRequest;
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
export interface EvidenceActionResult {
  schemaVersion: 1;
  id: string;
  request: EvidenceActionRequest;
  status: "succeeded" | "failed" | "denied";
  before: string | null;
  after: string | null;
  reason: string | null;
  directPublication: false;
}
export type HostActionResult =
  PublicationActionResult | PromotionActionResult | EvidenceActionResult;
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
