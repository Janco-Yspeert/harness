import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import {
  canonical,
  contentId,
  identity,
  object,
  text,
} from "./kernel/ledger.ts";
import type { RoleContract, WorkflowPolicy } from "./kernel/model.ts";

const ACTIVE_ROLES = [
  "as-built",
  "brief-readiness",
  "design-map",
  "evaluator-prepare",
  "evaluator-repair",
  "evaluator-verify",
  "implementation",
  "outcome",
] as const;

const COMMON_CAPABILITIES = [
  "repository-read",
  "repository-write",
  "local-computation",
  "git-inspect",
  "git-commit",
] as const;

const CAPABILITY_VOCABULARY = [...COMMON_CAPABILITIES] as const;
const EVALUATOR_ROLES = new Set([
  "evaluator-prepare",
  "evaluator-repair",
  "evaluator-verify",
]);
const VALIDATOR_SOURCES = {
  "prepared-coverage": "src/methodologies/harness-public.ts",
  "verification-accounting": "src/methodologies/harness-public.ts",
} as const;

interface ManifestFile<T> {
  readonly path: string;
  readonly identity: string;
  readonly content: T;
}

export interface MethodologyManifestCore {
  readonly schemaVersion: 1;
  readonly capabilityVocabulary: {
    readonly schemaVersion: 1;
    readonly values: readonly string[];
  };
  readonly policy: ManifestFile<WorkflowPolicy>;
  readonly roles: Record<
    string,
    {
      readonly contract: ManifestFile<RoleContract>;
      readonly skill: ManifestFile<string>;
    }
  >;
  readonly validators: Record<
    string,
    { readonly path: string; readonly identity: string }
  >;
}

export interface MethodologyManifest extends MethodologyManifestCore {
  readonly id: string;
}

export interface CandidateMethodology {
  readonly schemaVersion: 1;
  readonly revision: string;
  readonly manifest: MethodologyManifest;
  readonly trustedIdentity: string | null;
  readonly relationToTrusted: "equal" | "different" | "uninitialized";
}

export interface CheckDiagnostic {
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface CheckResult {
  readonly schemaVersion: 1;
  readonly operation: "check";
  readonly methodology: string;
  readonly valid: boolean;
  readonly diagnostics: readonly CheckDiagnostic[];
}

export interface MethodologyDiff {
  readonly schemaVersion: 1;
  readonly operation: "diff";
  readonly from: string;
  readonly to: string;
  readonly equal: boolean;
  readonly changes: {
    readonly policy: boolean;
    readonly skills: readonly string[];
    readonly contracts: readonly string[];
    readonly validators: readonly string[];
    readonly capabilities: readonly string[];
    readonly resultVocabularies: readonly string[];
    readonly privilegedActionRequirements: readonly string[];
  };
}

export interface TrustedMethodologyEvent {
  readonly schemaVersion: 1;
  readonly sequence: number;
  readonly methodology: string;
  readonly revision: string;
  readonly previous: string | null;
  readonly authority: {
    readonly kind: "human";
    readonly evidence: string;
    readonly evaluation:
      | {
          readonly kind: "trusted-methodology";
          readonly methodology: string;
          readonly result: "PASS";
          readonly evidence: string;
        }
      | {
          readonly kind: "human-bootstrap";
          readonly evidence: string;
        };
  };
}

export interface PromotionAuthority {
  readonly kind: "human";
  readonly decision: "promote";
  readonly evidence: string;
  readonly evaluation: TrustedMethodologyEvent["authority"]["evaluation"];
}

function repositoryPath(path: string): string {
  if (
    path.length === 0 ||
    isAbsolute(path) ||
    path.split("/").some((part) => part === ".." || part === "")
  )
    throw new Error(`invalid repository path: ${path}`);
  return path;
}

function git(repositoryRoot: string, args: readonly string[]): string {
  return execFileSync("git", [...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "pipe",
  }).trim();
}

function exactRevision(repositoryRoot: string, revision: string): string {
  const commit = git(repositoryRoot, [
    "rev-parse",
    "--verify",
    `${revision}^{commit}`,
  ]);
  if (!/^[a-f0-9]{40,64}$/.test(commit))
    throw new Error("candidate revision did not resolve to an exact commit");
  return commit;
}

function readRevisionFile(
  repositoryRoot: string,
  revision: string,
  path: string,
): string {
  return execFileSync("git", ["show", `${revision}:${repositoryPath(path)}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function jsonAt(
  repositoryRoot: string,
  revision: string,
  path: string,
): unknown {
  return JSON.parse(
    readRevisionFile(repositoryRoot, revision, path),
  ) as unknown;
}

function manifestFile<T>(path: string, content: T): ManifestFile<T> {
  return { path, identity: contentId(content), content };
}

function skillFile(path: string, content: string): ManifestFile<string> {
  return { path, identity: identity(content), content };
}

export function buildMethodologyManifest(
  repositoryRoot: string,
  revision: string,
  policyPath = "methodologies/harness/policy.json",
): { revision: string; manifest: MethodologyManifest } {
  const commit = exactRevision(repositoryRoot, revision);
  const policy = jsonAt(repositoryRoot, commit, policyPath) as WorkflowPolicy;
  const roles: MethodologyManifestCore["roles"] = {};
  for (const [role, rawEntry] of Object.entries(object(policy.roles))) {
    const entry = object(rawEntry);
    const contractPath = text(entry.contract);
    const skillPath = text(entry.skill);
    roles[role] = {
      contract: manifestFile(
        contractPath,
        jsonAt(repositoryRoot, commit, contractPath) as RoleContract,
      ),
      skill: skillFile(
        skillPath,
        readRevisionFile(repositoryRoot, commit, skillPath),
      ),
    };
  }
  const validators = Object.fromEntries(
    Object.entries(VALIDATOR_SOURCES).map(([name, path]) => [
      name,
      {
        path,
        identity: identity(readRevisionFile(repositoryRoot, commit, path)),
      },
    ]),
  );
  const core: MethodologyManifestCore = {
    schemaVersion: 1,
    capabilityVocabulary: {
      schemaVersion: 1,
      values: [...CAPABILITY_VOCABULARY],
    },
    policy: manifestFile(policyPath, policy),
    roles,
    validators,
  };
  return { revision: commit, manifest: { ...core, id: contentId(core) } };
}

export function readTrustedHistory(path: string): TrustedMethodologyEvent[] {
  if (!existsSync(path)) return [];
  const events = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const raw = object(JSON.parse(line));
      const authority = object(raw.authority);
      const evaluation = object(authority.evaluation);
      const validEvaluation =
        evaluation.kind === "human-bootstrap"
          ? typeof evaluation.evidence === "string" &&
            evaluation.evidence.length > 0
          : evaluation.kind === "trusted-methodology" &&
            evaluation.result === "PASS" &&
            typeof evaluation.methodology === "string" &&
            evaluation.methodology.startsWith("sha256:") &&
            typeof evaluation.evidence === "string" &&
            evaluation.evidence.length > 0;
      if (
        raw.schemaVersion !== 1 ||
        raw.sequence !== index + 1 ||
        typeof raw.methodology !== "string" ||
        !raw.methodology.startsWith("sha256:") ||
        typeof raw.revision !== "string" ||
        !/^[a-f0-9]{40,64}$/.test(raw.revision) ||
        authority.kind !== "human" ||
        typeof authority.evidence !== "string" ||
        authority.evidence.length === 0 ||
        !validEvaluation
      )
        throw new Error(
          `invalid trusted methodology history entry ${String(index + 1)}`,
        );
      return raw as unknown as TrustedMethodologyEvent;
    });
  for (const [index, event] of events.entries()) {
    const prior = events[index - 1];
    if (
      event.previous !== (prior?.methodology ?? null) ||
      (index === 0 && event.previous !== null)
    )
      throw new Error(
        `invalid trusted methodology history entry ${String(index + 1)}`,
      );
  }
  return events;
}

export function trustedIdentity(path: string): string | null {
  return readTrustedHistory(path).at(-1)?.methodology ?? null;
}

export function candidateMethodology(
  repositoryRoot: string,
  revision: string,
  trustHistoryPath: string,
): CandidateMethodology {
  const built = buildMethodologyManifest(repositoryRoot, revision);
  const trusted = trustedIdentity(trustHistoryPath);
  return {
    schemaVersion: 1,
    revision: built.revision,
    manifest: built.manifest,
    trustedIdentity: trusted,
    relationToTrusted:
      trusted === null
        ? "uninitialized"
        : trusted === built.manifest.id
          ? "equal"
          : "different",
  };
}

function addDiagnostic(
  diagnostics: CheckDiagnostic[],
  code: string,
  path: string,
  message: string,
): void {
  diagnostics.push({ code, path, message });
}

function sameValues(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return canonical([...actual].sort()) === canonical([...expected].sort());
}

function requiredPostconditions(role: string): readonly string[] {
  switch (role) {
    case "brief-readiness":
      return ["feedback.md", "manifest.md"];
    case "design-map":
      return ["design-map.md", "manifest.md"];
    case "evaluator-prepare":
      return ["coverage-map.json", "eval-requirements.md", "manifest.md"];
    case "evaluator-repair":
      return ["coverage-map.json", "manifest.md"];
    case "evaluator-verify":
      return ["verification-result.json", "manifest.md"];
    case "as-built":
      return ["as-built.md", "manifest.md"];
    case "outcome":
      return ["outcome.md", "manifest.md"];
    default:
      return [];
  }
}

function skillAuthorityViolations(skill: string): string[] {
  const violations: string[] = [];
  const lines = skill.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const lower = line.toLowerCase();
    const context = `${lines[index - 1] ?? ""} ${line}`.toLowerCase();
    if (/\bpush(?:ed|es|ing)?\b/.test(lower))
      violations.push(`line ${String(index + 1)} names direct Git publication`);
    if (
      /\brecord(?:s|ed|ing)?\b.*\b(brief-frozen|readiness-blocked|design-map-frozen|evaluation-prepared|evaluator-repair-recorded|implementation-handoff|verification-finalized|as-built-recorded|outcome-recorded)\b/.test(
        lower,
      ) &&
      !/\b(harness|host|do not|never|must not)\b/.test(context)
    )
      violations.push(
        `line ${String(index + 1)} claims canonical transition authority`,
      );
    if (
      /\b(allocate|dispatch)\w*\b.*\b(next (?:role|phase)|successor(?: role)?)\b/.test(
        lower,
      ) &&
      !/\b(do not|never|must not)\b/.test(context)
    )
      violations.push(
        `line ${String(index + 1)} claims successor allocation authority`,
      );
    if (/\bpromot\w*\b.*\b(self|itself)\b/.test(lower))
      violations.push(`line ${String(index + 1)} permits self-promotion`);
  }
  return violations;
}

function values(contract: RoleContract, name: string): readonly string[] {
  return contract.methodology[name] ?? [];
}

function inspectMethodology(manifest: MethodologyManifest): CheckResult {
  const diagnostics: CheckDiagnostic[] = [];
  const core: MethodologyManifestCore = {
    schemaVersion: manifest.schemaVersion,
    capabilityVocabulary: manifest.capabilityVocabulary,
    policy: manifest.policy,
    roles: manifest.roles,
    validators: manifest.validators,
  };
  if (manifest.id !== contentId(core))
    addDiagnostic(
      diagnostics,
      "IDENTITY_MISMATCH",
      "manifest.id",
      "manifest identity does not match its canonical content",
    );
  if (!sameValues(manifest.capabilityVocabulary.values, CAPABILITY_VOCABULARY))
    addDiagnostic(
      diagnostics,
      "CAPABILITY_VOCABULARY",
      "capabilityVocabulary.values",
      "capability vocabulary differs from the governed-role vocabulary",
    );
  const roleNames = Object.keys(manifest.roles).sort();
  if (!sameValues(roleNames, ACTIVE_ROLES))
    addDiagnostic(
      diagnostics,
      "ACTIVE_ROLES",
      "roles",
      "manifest must contain exactly the eight active methodology roles",
    );
  const policyRoles = object(manifest.policy.content.roles);
  if (!sameValues(Object.keys(policyRoles), ACTIVE_ROLES))
    addDiagnostic(
      diagnostics,
      "POLICY_ROLES",
      manifest.policy.path,
      "policy must configure exactly the eight active methodology roles",
    );
  const implementationFeedback = manifest.roles[
    "implementation"
  ]?.contract.content.inputs.find(
    (input) => input.name === "implementationFeedback",
  );
  const configuredTransitions = new Set(
    Object.values(policyRoles).flatMap((entry) => {
      const policyEntry = object(entry);
      return Array.isArray(policyEntry.outcomes)
        ? policyEntry.outcomes
            .map((outcome) => object(outcome).transition)
            .filter(
              (transition): transition is string =>
                typeof transition === "string",
            )
        : [];
    }),
  );
  const feedbackEvents = Array.isArray(implementationFeedback?.event)
    ? implementationFeedback.event
    : implementationFeedback?.event
      ? [implementationFeedback.event]
      : [];
  if (
    !implementationFeedback ||
    !implementationFeedback.current ||
    implementationFeedback.after !== "implementation-handoff" ||
    implementationFeedback.eventFields?.classification !==
      "IMPLEMENTATION_FAILURE" ||
    !feedbackEvents.some((event) => configuredTransitions.has(event))
  )
    addDiagnostic(
      diagnostics,
      "IMPLEMENTATION_FEEDBACK_BINDING",
      "implementation",
      "implementation retry feedback must bind a configured current IMPLEMENTATION_FAILURE transition after its handoff",
    );
  if (manifest.policy.identity !== contentId(manifest.policy.content))
    addDiagnostic(
      diagnostics,
      "COMPONENT_IDENTITY",
      manifest.policy.path,
      "policy content identity is invalid",
    );

  for (const role of roleNames) {
    const component = manifest.roles[role];
    if (!component) continue;
    const policyEntry = object(policyRoles[role]);
    if (
      policyEntry.contract !== component.contract.path ||
      policyEntry.skill !== component.skill.path
    )
      addDiagnostic(
        diagnostics,
        "POLICY_LINK",
        `roles.${role}`,
        "policy paths do not match the manifest contract and skill",
      );
    if (component.contract.identity !== contentId(component.contract.content))
      addDiagnostic(
        diagnostics,
        "COMPONENT_IDENTITY",
        component.contract.path,
        "contract content identity is invalid",
      );
    if (component.skill.identity !== identity(component.skill.content))
      addDiagnostic(
        diagnostics,
        "COMPONENT_IDENTITY",
        component.skill.path,
        "skill content identity is invalid",
      );
    const contract = component.contract.content;
    for (const capability of contract.capabilities)
      if (!CAPABILITY_VOCABULARY.includes(capability as never))
        addDiagnostic(
          diagnostics,
          "UNKNOWN_CAPABILITY",
          component.contract.path,
          `unknown capability ${capability}`,
        );
    for (const capability of COMMON_CAPABILITIES)
      if (!contract.capabilities.includes(capability))
        addDiagnostic(
          diagnostics,
          "MISSING_CAPABILITY",
          component.contract.path,
          `${role} lacks ${capability}`,
        );
    if (
      contract.capabilities.includes("git-publish") ||
      contract.capabilities.includes("network") ||
      contract.publication
    )
      addDiagnostic(
        diagnostics,
        "WORKER_PUBLICATION",
        component.contract.path,
        "worker contracts cannot carry publication or network authority",
      );
    if (EVALUATOR_ROLES.has(role)) {
      if (!contract.workspaces.includes("evaluation") || !contract.protected)
        addDiagnostic(
          diagnostics,
          "EVALUATOR_ISOLATION",
          component.contract.path,
          "evaluator roles require a protected evaluation workspace",
        );
    } else if (
      contract.workspaces.includes("evaluation") ||
      !contract.forbiddenExposure.includes("evaluator-private")
    )
      addDiagnostic(
        diagnostics,
        "PRIVATE_EXPOSURE",
        component.contract.path,
        "non-evaluator roles must forbid evaluator-private exposure",
      );
    for (const postcondition of requiredPostconditions(role))
      if (!contract.postconditions.includes(postcondition))
        addDiagnostic(
          diagnostics,
          "POSTCONDITION",
          component.contract.path,
          `${role} lacks required postcondition ${postcondition}`,
        );
    for (const violation of skillAuthorityViolations(component.skill.content))
      addDiagnostic(
        diagnostics,
        "WORKER_AUTHORITY",
        component.skill.path,
        violation,
      );
    if (
      !/exact\s+(?:produced\s+)?local\s+commit/i.test(component.skill.content)
    )
      addDiagnostic(
        diagnostics,
        "CHECKPOINT_EVIDENCE",
        component.skill.path,
        "skill must report its exact produced local commit",
      );

    const outcomes = Array.isArray(policyEntry.outcomes)
      ? policyEntry.outcomes.map(object)
      : [];
    const outcomeKeys = new Set<string>();
    for (const outcome of outcomes) {
      const disposition = String(outcome.disposition);
      const methodology = object(outcome.methodology ?? {});
      const key = canonical({ disposition, methodology });
      if (outcomeKeys.has(key))
        addDiagnostic(
          diagnostics,
          "AMBIGUOUS_OUTCOME",
          manifest.policy.path,
          `${role} has duplicate result routing`,
        );
      outcomeKeys.add(key);
      if (!contract.results.includes(disposition))
        addDiagnostic(
          diagnostics,
          "RESULT_VOCABULARY",
          manifest.policy.path,
          `${role} routes an undeclared disposition ${disposition}`,
        );
      for (const [field, value] of Object.entries(methodology))
        if (
          typeof value !== "string" ||
          !contract.methodology[field]?.includes(value)
        )
          addDiagnostic(
            diagnostics,
            "METHODOLOGY_VOCABULARY",
            manifest.policy.path,
            `${role} routes undeclared methodology value ${field}=${String(value)}`,
          );
    }
    for (const [field, vocabulary] of Object.entries(contract.methodology))
      if (
        field !== "classification" &&
        vocabulary.some(
          (value) =>
            !outcomes.some(
              (outcome) => object(outcome.methodology ?? {})[field] === value,
            ),
        )
      )
        addDiagnostic(
          diagnostics,
          "UNROUTED_RESULT",
          manifest.policy.path,
          `${role}.${field} contains a value with no policy outcome`,
        );
  }

  const brief = manifest.roles["brief-readiness"]?.contract.content;
  if (brief && !sameValues(values(brief, "verdict"), ["READY", "NOT_READY"]))
    addDiagnostic(
      diagnostics,
      "BRIEF_VERDICT",
      "brief-readiness",
      "Brief Readiness verdict must be exactly READY or NOT_READY",
    );
  const verify = manifest.roles["evaluator-verify"]?.contract.content;
  const classifications = [
    "IMPLEMENTATION_FAILURE",
    "EVALUATOR_DEFECT",
    "SPECIFICATION_AMBIGUITY",
    "SPECIFICATION_DRIFT",
    "INFRASTRUCTURE_FAILURE",
  ];
  if (
    verify &&
    (!sameValues(values(verify, "result"), ["PASS", "FAIL", "BLOCKED"]) ||
      !sameValues(values(verify, "classification"), classifications))
  )
    addDiagnostic(
      diagnostics,
      "EVALUATOR_VOCABULARY",
      "evaluator-verify",
      "evaluator result or classification vocabulary differs from frozen authority",
    );
  const repair = manifest.roles["evaluator-repair"]?.contract.content;
  if (
    repair &&
    !["repairTrigger", "sourceEvaluatorRevision"].every((name) =>
      repair.inputs.some((input) => input.name === name),
    )
  )
    addDiagnostic(
      diagnostics,
      "REPAIR_AUTHORITY",
      "evaluator-repair",
      "repair requires a bound trigger and source evaluator revision",
    );
  const asBuilt = manifest.roles["as-built"]?.contract.content;
  if (asBuilt && Object.keys(asBuilt.methodology).length !== 0)
    addDiagnostic(
      diagnostics,
      "ARTIFACT_FINDINGS",
      "as-built",
      "As-Built findings must remain artifact-only",
    );
  const outcome = manifest.roles.outcome?.contract.content;
  if (
    outcome &&
    !Object.values(outcome.methodology).some((vocabulary) =>
      sameValues(vocabulary, ["STANDARD", "PROCESS_EXCEPTION"]),
    )
  )
    addDiagnostic(
      diagnostics,
      "OUTCOME_MODE",
      "outcome",
      "Outcome must expose STANDARD and PROCESS_EXCEPTION completion modes",
    );
  if (canonical(manifest).includes("SPECIFICATION_DEFECT"))
    addDiagnostic(
      diagnostics,
      "STALE_CLASSIFICATION",
      "manifest",
      "SPECIFICATION_DEFECT is not part of the migrated methodology vocabulary",
    );

  const referencedValidators = new Set<string>();
  for (const component of Object.values(manifest.roles)) {
    for (const input of component.contract.content.inputs)
      if (input.validator) referencedValidators.add(input.validator);
    const policyEntry = object(
      object(manifest.policy.content.roles)[
        Object.entries(manifest.roles).find(
          ([, value]) => value === component,
        )?.[0] ?? ""
      ],
    );
    for (const outcome of Array.isArray(policyEntry.outcomes)
      ? policyEntry.outcomes.map(object)
      : []) {
      const evidence = outcome.evidence;
      if (
        evidence &&
        typeof evidence === "object" &&
        !Array.isArray(evidence)
      ) {
        const validator = object(evidence).validator;
        if (typeof validator === "string") referencedValidators.add(validator);
      }
    }
  }
  for (const name of referencedValidators)
    if (!manifest.validators[name])
      addDiagnostic(
        diagnostics,
        "VALIDATOR_UNAVAILABLE",
        "validators",
        `configured validator ${name} is absent from the manifest`,
      );
  for (const [name, validator] of Object.entries(manifest.validators))
    if (!validator.identity.startsWith("sha256:") || !validator.path)
      addDiagnostic(
        diagnostics,
        "VALIDATOR_IDENTITY",
        `validators.${name}`,
        "validator path or identity is invalid",
      );

  return {
    schemaVersion: 1,
    operation: "check",
    methodology: manifest.id,
    valid: diagnostics.length === 0,
    diagnostics,
  };
}

export function checkMethodology(manifest: MethodologyManifest): CheckResult {
  try {
    return inspectMethodology(manifest);
  } catch (error) {
    return {
      schemaVersion: 1,
      operation: "check",
      methodology:
        typeof manifest.id === "string" ? manifest.id : "invalid-methodology",
      valid: false,
      diagnostics: [
        {
          code: "STRUCTURAL_COHERENCE",
          path: "manifest",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

function changedRoles(
  from: MethodologyManifest,
  to: MethodologyManifest,
  select: (manifest: MethodologyManifest, role: string) => unknown,
): string[] {
  return [...new Set([...Object.keys(from.roles), ...Object.keys(to.roles)])]
    .filter(
      (role) => canonical(select(from, role)) !== canonical(select(to, role)),
    )
    .sort();
}

function privilegedRequirements(
  manifest: MethodologyManifest,
  role: string,
): unknown {
  const contract = manifest.roles[role]?.contract.content;
  const policy = object(manifest.policy.content.roles)[role];
  const outcomes = object(policy).outcomes;
  return {
    publication: contract?.publication ?? null,
    requiredActions: Array.isArray(outcomes)
      ? outcomes.map((value: unknown) => object(value).requiredActions ?? [])
      : [],
  };
}

export function diffMethodologies(
  from: MethodologyManifest,
  to: MethodologyManifest,
): MethodologyDiff {
  const validators = [
    ...new Set([
      ...Object.keys(from.validators),
      ...Object.keys(to.validators),
    ]),
  ]
    .filter(
      (name) =>
        canonical(from.validators[name]) !== canonical(to.validators[name]),
    )
    .sort();
  return {
    schemaVersion: 1,
    operation: "diff",
    from: from.id,
    to: to.id,
    equal: from.id === to.id,
    changes: {
      policy: from.policy.identity !== to.policy.identity,
      skills: changedRoles(
        from,
        to,
        (manifest, role) => manifest.roles[role]?.skill.identity,
      ),
      contracts: changedRoles(
        from,
        to,
        (manifest, role) => manifest.roles[role]?.contract.identity,
      ),
      validators,
      capabilities: changedRoles(
        from,
        to,
        (manifest, role) => manifest.roles[role]?.contract.content.capabilities,
      ),
      resultVocabularies: changedRoles(from, to, (manifest, role) => {
        const contract = manifest.roles[role]?.contract.content;
        return contract
          ? {
              dispositions: contract.results,
              methodology: contract.methodology,
            }
          : null;
      }),
      privilegedActionRequirements: changedRoles(
        from,
        to,
        privilegedRequirements,
      ),
    },
  };
}

export function bindFutureWorkflow(
  trustHistoryPath: string,
  workflow: string,
): { readonly workflow: string; readonly methodology: string } {
  const methodology = trustedIdentity(trustHistoryPath);
  if (!methodology) throw new Error("trusted methodology is not initialized");
  return Object.freeze({ workflow, methodology });
}

function appendTrustedEvent(
  path: string,
  event: TrustedMethodologyEvent,
): void {
  const absolute = resolve(path);
  if (!existsSync(dirname(absolute)))
    throw new Error("trusted methodology directory does not exist");
  const descriptor = openSync(absolute, "a", 0o600);
  try {
    appendFileSync(descriptor, `${JSON.stringify(event)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function requirePromotionAuthority(value: unknown): PromotionAuthority {
  const raw = object(value);
  const evaluation = object(raw.evaluation);
  const validEvaluation =
    evaluation.kind === "human-bootstrap"
      ? typeof evaluation.evidence === "string" &&
        evaluation.evidence.length > 0
      : evaluation.kind === "trusted-methodology" &&
        evaluation.result === "PASS" &&
        typeof evaluation.methodology === "string" &&
        typeof evaluation.evidence === "string" &&
        evaluation.evidence.length > 0;
  if (
    raw.kind !== "human" ||
    raw.decision !== "promote" ||
    typeof raw.evidence !== "string" ||
    raw.evidence.length === 0 ||
    !validEvaluation
  )
    throw new Error("promotion requires explicit human authority");
  return raw as unknown as PromotionAuthority;
}

function repositoryRootForHistory(trustHistoryPath: string): string {
  return git(dirname(resolve(trustHistoryPath)), [
    "rev-parse",
    "--show-toplevel",
  ]);
}

export function promoteMethodology(
  candidate: CandidateMethodology,
  trustHistoryPath: string,
  rawAuthority: unknown,
): TrustedMethodologyEvent {
  const reconstructed = candidateMethodology(
    repositoryRootForHistory(trustHistoryPath),
    candidate.revision,
    trustHistoryPath,
  );
  if (
    reconstructed.revision !== candidate.revision ||
    canonical(reconstructed.manifest) !== canonical(candidate.manifest)
  )
    throw new Error(
      "candidate methodology does not match its exact repository revision",
    );
  const checked = checkMethodology(reconstructed.manifest);
  if (!checked.valid)
    throw new Error("candidate methodology failed coherence validation");
  const authority = requirePromotionAuthority(rawAuthority);
  const history = readTrustedHistory(trustHistoryPath);
  const current = history.at(-1)?.methodology ?? null;
  if (current !== reconstructed.trustedIdentity)
    throw new Error("trusted methodology changed after candidate construction");
  if (current === reconstructed.manifest.id)
    throw new Error("candidate is already the trusted methodology");
  if (authority.evaluation.kind === "trusted-methodology") {
    if (
      authority.evaluation.methodology !== current ||
      authority.evaluation.methodology === reconstructed.manifest.id ||
      authority.evaluation.evidence.length === 0
    )
      throw new Error(
        "candidate must be evaluated by the current trusted methodology",
      );
  } else if (authority.evaluation.evidence.length === 0) {
    throw new Error("bootstrap promotion requires explicit human evidence");
  }
  const event: TrustedMethodologyEvent = {
    schemaVersion: 1,
    sequence: history.length + 1,
    methodology: reconstructed.manifest.id,
    revision: reconstructed.revision,
    previous: current,
    authority: {
      kind: "human",
      evidence: authority.evidence,
      evaluation: authority.evaluation,
    },
  };
  appendTrustedEvent(trustHistoryPath, event);
  return event;
}

export function exerciseMethodology(
  candidate: CandidateMethodology,
  trustHistoryPath: string,
): {
  readonly schemaVersion: 1;
  readonly operation: "exercise";
  readonly methodology: string;
  readonly role: "design-map";
  readonly artifact: "design-map.md";
  readonly artifactIdentity: string;
  readonly contractIdentity: string;
  readonly skillIdentity: string;
  readonly valid: true;
  readonly checkpoint: string;
  readonly published: false;
  readonly trustedBefore: string | null;
  readonly trustedAfter: string | null;
} {
  const checked = checkMethodology(candidate.manifest);
  if (!checked.valid)
    throw new Error("cannot exercise an incoherent candidate methodology");
  const roleName = "design-map" as const;
  const role = candidate.manifest.roles[roleName];
  if (
    !role ||
    !role.contract.content.results.includes("succeeded") ||
    !role.contract.content.capabilities.includes("repository-write") ||
    !role.contract.content.capabilities.includes("git-commit") ||
    !role.contract.content.postconditions.includes("design-map.md") ||
    role.skill.content.trim().length === 0
  )
    throw new Error("candidate design-map role cannot produce its checkpoint");
  const trustedBefore = trustedIdentity(trustHistoryPath);
  const directory = mkdtempSync(
    join(tmpdir(), "harness-methodology-exercise-"),
  );
  try {
    git(directory, ["init", "-b", "exercise"]);
    const artifact = [
      "# Disposable candidate Design Map",
      "",
      `- Methodology: \`${candidate.manifest.id}\``,
      `- Role: \`${roleName}\``,
      `- Contract: \`${role.contract.identity}\``,
      `- Skill: \`${role.skill.identity}\``,
      "- Result: `succeeded`",
      "",
    ].join("\n");
    writeFileSync(join(directory, "design-map.md"), artifact);
    git(directory, ["add", "design-map.md"]);
    execFileSync("git", ["commit", "-m", "exercise: local role checkpoint"], {
      cwd: directory,
      stdio: "pipe",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "Harness methodology exercise",
        GIT_AUTHOR_EMAIL: "harness-methodology@example.invalid",
        GIT_COMMITTER_NAME: "Harness methodology exercise",
        GIT_COMMITTER_EMAIL: "harness-methodology@example.invalid",
      },
    });
    const checkpoint = git(directory, ["rev-parse", "HEAD"]);
    const artifactIdentity = identity(artifact);
    if (
      identity(readRevisionFile(directory, checkpoint, "design-map.md")) !==
      artifactIdentity
    )
      throw new Error("disposable role artifact is absent from its checkpoint");
    const trustedAfter = trustedIdentity(trustHistoryPath);
    if (trustedAfter !== trustedBefore)
      throw new Error(
        "disposable exercise changed trusted methodology authority",
      );
    return {
      schemaVersion: 1,
      operation: "exercise",
      methodology: candidate.manifest.id,
      role: roleName,
      artifact: "design-map.md",
      artifactIdentity,
      contractIdentity: role.contract.identity,
      skillIdentity: role.skill.identity,
      valid: true,
      checkpoint,
      published: false,
      trustedBefore,
      trustedAfter,
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export function repositoryRelativePath(root: string, path: string): string {
  const value = relative(resolve(root), resolve(path));
  return repositoryPath(value);
}
