import { existsSync, lstatSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

import type { ArchiveItem } from "../evaluation-closeout.ts";
import type { PromotionArtifact } from "./model.ts";
import { canonical, identity } from "./ledger.ts";

export const UNBOUND_ARCHIVE_RECOVERY_KIND =
  "evaluator-unbound-evidence-recovery" as const;
export const UNBOUND_ARCHIVE_RECOVERY_CLASSIFICATION =
  "HISTORICAL_UNBOUND_PRIVATE_EVIDENCE" as const;

export type Verdict = "PASS" | "FAIL" | "BLOCKED";

export interface CommittedBinding {
  kind: "committed-maintenance-record";
  path: string;
  commit: string;
  identity: string;
}

export type PrivateEvidenceDeclaration =
  | {
      disposition: "BOUND";
      path: string;
      identity: string;
      historicalBinding: CommittedBinding;
    }
  | {
      disposition: "RECOVERY_BOUND";
      path: string;
      observedIdentity: string;
      identityEstablished: "during-recovery";
    }
  | {
      disposition: "LOST";
      path: string;
      historicalIdentity: string;
      historicalBinding: CommittedBinding;
    }
  | {
      disposition: "UNBOUND";
      expectedPath: string;
      priorPersistence: "UNKNOWN";
      reconstructed: false;
    };

export interface PublicArtifactBinding {
  path: string;
  identity: string;
  commit: string;
}

export type RecoveryAttemptDeclaration =
  | {
      attempt: number;
      allocation: string;
      execution: string;
      roleGrant: string;
      candidate: string;
      evaluatorRevision: string;
      lifecycle: "NONTERMINAL";
    }
  | {
      attempt: number;
      allocation: string;
      execution: string;
      roleGrant: string;
      candidate: string;
      evaluatorRevision: string;
      lifecycle: "TERMINAL";
      result: Verdict;
      semanticResult: string;
      semanticEvent: string;
      finalization: string | null;
      publicArtifact: PublicArtifactBinding | null;
      blockedTransition: { event: string; reason: string } | null;
      privateEvidence: PrivateEvidenceDeclaration;
    };

export interface UnboundArchiveRecoveryDeclaration {
  schemaVersion: 1;
  kind: typeof UNBOUND_ARCHIVE_RECOVERY_KIND;
  classification: typeof UNBOUND_ARCHIVE_RECOVERY_CLASSIFICATION;
  archiveCompleteness: "incomplete";
  workflow: string;
  cycle: string;
  candidate: string;
  evaluatorRevision: string;
  runtimeCommit: string;
  closeoutAuthorized: true;
  missingBytesReconstructed: false;
  unboundPriorExistenceAsserted: false;
  attempts: RecoveryAttemptDeclaration[];
  successfulAttempt: number;
  canonicalPass: {
    execution: string;
    semanticResult: string;
    finalization: string;
    publicArtifact: PublicArtifactBinding;
    privateArtifact: { path: string; identity: string };
  };
  privateLedger: {
    path: ".eval/attempt-ledger.json";
    identity: string;
    canonical: false;
  };
  revision: {
    id: string;
    freezePath: ".eval/freeze.json";
    freezeIdentity: string;
  };
}

export interface RecoveryAttemptContext {
  attempt: number;
  allocation: string;
  execution: string;
  roleGrant: string;
  candidate: string;
  evaluatorRevision: string;
  semanticResult?: string;
  semanticEvent?: string;
  result?: Verdict;
  finalization?: string;
  publicArtifact?: PublicArtifactBinding;
  blockedTransition?: { event: string; reason: string };
  durablePrivateIdentity?: string;
}

export interface UnboundArchiveRecoveryContext {
  workflow: string;
  cycle: string;
  candidate: string;
  evaluatorRevision: string;
  successfulAttempt: number;
  attempts: RecoveryAttemptContext[];
  promotionRecorded: boolean;
  runtimeCommit: string;
}

export interface UnboundArchiveArtifacts {
  artifacts: PromotionArtifact[];
  generated: ArchiveItem[];
  provenanceIdentity: string;
}

function fail(message: string): never {
  throw new Error(`unbound-evidence recovery: ${message}`);
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    fail(`${name} must be an object`);
  return value as Record<string, unknown>;
}

function sha(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^sha256:[a-f0-9]{64}$/.test(value))
    fail(`${name} must be a sha256 identity`);
  return value;
}

function relativePath(value: unknown, name: string): string {
  if (
    typeof value !== "string" ||
    !value ||
    value.startsWith("/") ||
    value.split(/[\\/]/).some((part) => !part || part === "..")
  )
    fail(`${name} must be a normalized relative path`);
  return value;
}

function privatePath(attempt: number): string {
  return `.eval/attempts/${String(attempt).padStart(3, "0")}/eval-result.md`;
}

function parsePublicArtifact(
  value: unknown,
  name: string,
): PublicArtifactBinding {
  const artifact = record(value, name);
  relativePath(artifact.path, `${name} path`);
  sha(artifact.identity, `${name} identity`);
  if (
    typeof artifact.commit !== "string" ||
    !/^[a-f0-9]{40}$/.test(artifact.commit)
  )
    fail(`${name} commit must be a Git commit`);
  return artifact as unknown as PublicArtifactBinding;
}

function parseBinding(value: unknown, name: string): CommittedBinding {
  const binding = record(value, name);
  if (binding.kind !== "committed-maintenance-record")
    fail(`${name} has an unsupported kind`);
  relativePath(binding.path, `${name} path`);
  sha(binding.identity, `${name} identity`);
  if (
    typeof binding.commit !== "string" ||
    !/^[a-f0-9]{40}$/.test(binding.commit)
  )
    fail(`${name} commit must be a Git commit`);
  return binding as unknown as CommittedBinding;
}

function parsePrivateEvidence(
  value: unknown,
  attempt: number,
): PrivateEvidenceDeclaration {
  const evidence = record(value, `attempt ${String(attempt)} private evidence`);
  const expected = privatePath(attempt);
  switch (evidence.disposition) {
    case "BOUND":
      if (evidence.path !== expected)
        fail(`attempt ${String(attempt)} has an invalid private path`);
      sha(evidence.identity, `attempt ${String(attempt)} private identity`);
      parseBinding(
        evidence.historicalBinding,
        `attempt ${String(attempt)} historical binding`,
      );
      break;
    case "RECOVERY_BOUND":
      if (
        evidence.path !== expected ||
        evidence.identityEstablished !== "during-recovery"
      )
        fail(`attempt ${String(attempt)} has invalid recovery-bound evidence`);
      sha(
        evidence.observedIdentity,
        `attempt ${String(attempt)} observed identity`,
      );
      break;
    case "LOST":
      if (evidence.path !== expected)
        fail(`attempt ${String(attempt)} has an invalid lost path`);
      sha(
        evidence.historicalIdentity,
        `attempt ${String(attempt)} historical identity`,
      );
      parseBinding(
        evidence.historicalBinding,
        `attempt ${String(attempt)} historical binding`,
      );
      break;
    case "UNBOUND":
      if (
        evidence.expectedPath !== expected ||
        evidence.priorPersistence !== "UNKNOWN" ||
        evidence.reconstructed !== false
      )
        fail(`attempt ${String(attempt)} has invalid unbound evidence`);
      break;
    default:
      fail(`attempt ${String(attempt)} has an invalid private disposition`);
  }
  return evidence as unknown as PrivateEvidenceDeclaration;
}

export function parseUnboundArchiveRecoveryDeclaration(
  value: unknown,
): UnboundArchiveRecoveryDeclaration {
  const raw = record(value, "recovery declaration");
  if (
    raw.schemaVersion !== 1 ||
    raw.kind !== UNBOUND_ARCHIVE_RECOVERY_KIND ||
    raw.classification !== UNBOUND_ARCHIVE_RECOVERY_CLASSIFICATION ||
    raw.archiveCompleteness !== "incomplete" ||
    typeof raw.workflow !== "string" ||
    !raw.workflow ||
    typeof raw.cycle !== "string" ||
    !raw.cycle ||
    typeof raw.candidate !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.candidate) ||
    typeof raw.evaluatorRevision !== "string" ||
    !/^\d{3}$/.test(raw.evaluatorRevision) ||
    typeof raw.runtimeCommit !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.runtimeCommit) ||
    raw.closeoutAuthorized !== true ||
    raw.missingBytesReconstructed !== false ||
    raw.unboundPriorExistenceAsserted !== false ||
    !Number.isSafeInteger(raw.successfulAttempt) ||
    (raw.successfulAttempt as number) < 1 ||
    !Array.isArray(raw.attempts) ||
    raw.attempts.length === 0
  )
    fail("invalid recovery declaration");

  const attempts = raw.attempts.map((value, index) => {
    const attempt = record(value, "attempt declaration");
    const expected = index + 1;
    if (
      attempt.attempt !== expected ||
      typeof attempt.allocation !== "string" ||
      !attempt.allocation ||
      typeof attempt.execution !== "string" ||
      !attempt.execution ||
      typeof attempt.roleGrant !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(attempt.roleGrant) ||
      typeof attempt.candidate !== "string" ||
      !/^[a-f0-9]{40}$/.test(attempt.candidate) ||
      typeof attempt.evaluatorRevision !== "string" ||
      !/^\d{3}$/.test(attempt.evaluatorRevision)
    )
      fail(`invalid attempt declaration ${String(expected)}`);
    if (attempt.lifecycle === "NONTERMINAL") return attempt;
    if (
      attempt.lifecycle !== "TERMINAL" ||
      !["PASS", "FAIL", "BLOCKED"].includes(String(attempt.result)) ||
      typeof attempt.semanticResult !== "string" ||
      !attempt.semanticResult ||
      typeof attempt.semanticEvent !== "string" ||
      !attempt.semanticEvent ||
      !(
        attempt.finalization === null ||
        (typeof attempt.finalization === "string" && attempt.finalization)
      ) ||
      !Object.hasOwn(attempt, "publicArtifact") ||
      !Object.hasOwn(attempt, "blockedTransition")
    )
      fail(`invalid terminal attempt declaration ${String(expected)}`);
    if (attempt.publicArtifact !== null)
      parsePublicArtifact(
        attempt.publicArtifact,
        `attempt ${String(expected)} public artifact`,
      );
    if (attempt.blockedTransition !== null) {
      const blocked = record(
        attempt.blockedTransition,
        `attempt ${String(expected)} blocked transition`,
      );
      if (
        typeof blocked.event !== "string" ||
        !blocked.event ||
        typeof blocked.reason !== "string" ||
        !blocked.reason
      )
        fail(`attempt ${String(expected)} has an invalid blocked transition`);
    }
    parsePrivateEvidence(attempt.privateEvidence, expected);
    return attempt;
  }) as RecoveryAttemptDeclaration[];

  const pass = record(raw.canonicalPass, "canonicalPass");
  if (
    typeof pass.execution !== "string" ||
    !pass.execution ||
    typeof pass.semanticResult !== "string" ||
    !pass.semanticResult ||
    typeof pass.finalization !== "string" ||
    !pass.finalization
  )
    fail("invalid canonical PASS binding");
  parsePublicArtifact(pass.publicArtifact, "canonical PASS public artifact");
  const passPrivate = record(
    pass.privateArtifact,
    "canonical PASS private artifact",
  );
  relativePath(passPrivate.path, "canonical PASS private path");
  sha(passPrivate.identity, "canonical PASS private identity");

  const ledger = record(raw.privateLedger, "privateLedger");
  if (ledger.path !== ".eval/attempt-ledger.json" || ledger.canonical !== false)
    fail("invalid historical private-ledger binding");
  sha(ledger.identity, "private-ledger identity");

  const revision = record(raw.revision, "revision");
  if (
    revision.id !== raw.evaluatorRevision ||
    revision.freezePath !== ".eval/freeze.json"
  )
    fail("invalid evaluator revision binding");
  sha(revision.freezeIdentity, "revision freeze identity");
  return { ...raw, attempts } as unknown as UnboundArchiveRecoveryDeclaration;
}

function source(root: string, path: string): string {
  const output = resolve(root, path);
  const delta = relative(root, output);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("source escapes evaluator workspace");
  let stat;
  try {
    stat = lstatSync(output);
  } catch {
    fail(`required evaluator evidence is missing: ${path}`);
  }
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`evaluator evidence is not a regular file: ${path}`);
  return output;
}

function maybeIdentity(root: string, path: string): string | undefined {
  const output = resolve(root, path);
  const delta = relative(root, output);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("source escapes evaluator workspace");
  if (!existsSync(output)) return undefined;
  const stat = lstatSync(output);
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`evaluator evidence is not a regular file: ${path}`);
  return identity(readFileSync(output));
}

function validateContext(
  declaration: UnboundArchiveRecoveryDeclaration,
  context: UnboundArchiveRecoveryContext,
): void {
  if (
    declaration.workflow !== context.workflow ||
    declaration.cycle !== context.cycle ||
    declaration.candidate !== context.candidate ||
    declaration.evaluatorRevision !== context.evaluatorRevision ||
    declaration.successfulAttempt !== context.successfulAttempt ||
    declaration.runtimeCommit !== context.runtimeCommit
  )
    fail("declaration does not match canonical recovery context");
  if (context.promotionRecorded)
    fail("authoritative PASS already has a recorded promotion");
  if (
    context.attempts.length !== declaration.attempts.length ||
    context.attempts.some((attempt, index) => attempt.attempt !== index + 1)
  )
    fail("canonical host allocation history is incomplete or out of order");

  for (const [index, declared] of declaration.attempts.entries()) {
    const actual = context.attempts[index];
    if (
      !actual ||
      declared.attempt !== actual.attempt ||
      declared.allocation !== actual.allocation ||
      declared.execution !== actual.execution ||
      declared.roleGrant !== actual.roleGrant ||
      declared.candidate !== actual.candidate ||
      declared.evaluatorRevision !== actual.evaluatorRevision
    )
      fail(`attempt ${String(index + 1)} allocation provenance drifted`);
    if (declared.lifecycle === "NONTERMINAL") {
      if (
        actual.semanticResult !== undefined ||
        actual.result !== undefined ||
        actual.finalization !== undefined
      )
        fail(`attempt ${String(index + 1)} is not NONTERMINAL`);
      continue;
    }
    if (
      actual.semanticResult !== declared.semanticResult ||
      actual.semanticEvent !== declared.semanticEvent ||
      actual.result !== declared.result ||
      (actual.finalization ?? null) !== declared.finalization ||
      canonical(actual.publicArtifact ?? null) !==
        canonical(declared.publicArtifact) ||
      canonical(actual.blockedTransition ?? null) !==
        canonical(declared.blockedTransition)
    )
      fail(`attempt ${String(index + 1)} terminal provenance drifted`);
  }
  const final = context.attempts.at(-1);
  if (
    !final ||
    final.attempt !== context.successfulAttempt ||
    final.result !== "PASS" ||
    final.execution !== declaration.canonicalPass.execution ||
    final.semanticResult !== declaration.canonicalPass.semanticResult ||
    final.finalization !== declaration.canonicalPass.finalization ||
    canonical(final.publicArtifact) !==
      canonical(declaration.canonicalPass.publicArtifact)
  )
    fail("attempt history does not end in the declared canonical PASS");
}

export function buildUnboundArchiveArtifacts(
  root: string,
  declaration: UnboundArchiveRecoveryDeclaration,
  declarationBytes: Buffer,
  declarationIdentity: string,
  context: UnboundArchiveRecoveryContext,
): UnboundArchiveArtifacts {
  validateContext(declaration, context);
  if (identity(declarationBytes) !== declarationIdentity)
    fail("declaration identity mismatch");

  const artifacts: PromotionArtifact[] = [];
  const generated: ArchiveItem[] = [];
  const destinations = new Set<string>();
  const add = (sourcePath: string, destination: string, expected: string) => {
    if (destinations.has(destination)) fail("duplicate archive destination");
    const actual = identity(readFileSync(source(root, sourcePath)));
    if (actual !== expected)
      fail(`evaluator evidence identity mismatch: ${sourcePath}`);
    destinations.add(destination);
    artifacts.push({ source: sourcePath, destination, identity: actual });
  };
  const addGenerated = (destination: string, content: string) => {
    if (destinations.has(destination)) fail("duplicate archive destination");
    const item = { destination, content, identity: identity(content) };
    destinations.add(destination);
    generated.push(item);
    artifacts.push({
      source: `host:${destination}`,
      destination,
      identity: item.identity,
    });
  };

  for (const [index, attempt] of declaration.attempts.entries()) {
    if (attempt.lifecycle !== "TERMINAL") continue;
    const actual = context.attempts[index];
    const evidence = attempt.privateEvidence;
    const path =
      evidence.disposition === "UNBOUND"
        ? evidence.expectedPath
        : evidence.path;
    const observed = maybeIdentity(root, path);
    switch (evidence.disposition) {
      case "BOUND":
        if (
          actual?.durablePrivateIdentity !== evidence.identity ||
          observed !== evidence.identity
        )
          fail(`attempt ${String(attempt.attempt)} BOUND evidence drifted`);
        add(
          evidence.path,
          `attempts/${String(attempt.attempt).padStart(3, "0")}/eval-result.md`,
          evidence.identity,
        );
        break;
      case "RECOVERY_BOUND":
        if (actual?.durablePrivateIdentity !== undefined)
          fail(
            `attempt ${String(attempt.attempt)} has stronger historical evidence than RECOVERY_BOUND`,
          );
        if (observed !== evidence.observedIdentity)
          fail(
            `attempt ${String(attempt.attempt)} recovery-bound evidence drifted`,
          );
        add(
          evidence.path,
          `attempts/${String(attempt.attempt).padStart(3, "0")}/eval-result.md`,
          evidence.observedIdentity,
        );
        break;
      case "LOST":
        if (
          actual?.durablePrivateIdentity !== evidence.historicalIdentity ||
          observed !== undefined
        )
          fail(`attempt ${String(attempt.attempt)} is not truthfully LOST`);
        break;
      case "UNBOUND":
        if (actual?.durablePrivateIdentity !== undefined)
          fail(
            `attempt ${String(attempt.attempt)} has stronger historical evidence than UNBOUND`,
          );
        if (observed !== undefined)
          fail(
            `attempt ${String(attempt.attempt)} has surviving private evidence`,
          );
        break;
    }
  }

  if (
    declaration.attempts.filter(
      (attempt) =>
        attempt.lifecycle === "TERMINAL" &&
        attempt.privateEvidence.disposition === "UNBOUND",
    ).length === 0
  )
    fail("recovery requires at least one historical UNBOUND gap");

  add(
    declaration.privateLedger.path,
    "historical/attempt-ledger.json",
    declaration.privateLedger.identity,
  );
  add(
    declaration.revision.freezePath,
    `freeze/${declaration.revision.id}.json`,
    declaration.revision.freezeIdentity,
  );
  const freeze = record(
    JSON.parse(
      readFileSync(source(root, declaration.revision.freezePath), "utf8"),
    ),
    "freeze metadata",
  );
  if (freeze.evaluatorRevision !== declaration.revision.id)
    fail("freeze metadata revision mismatch");
  const inventory = record(freeze.artifacts, "freeze artifact inventory");
  for (const [pathValue, expectedValue] of Object.entries(inventory)) {
    const path = relativePath(pathValue, "freeze artifact path");
    const expected = sha(expectedValue, "freeze artifact identity");
    add(path, `revisions/${declaration.revision.id}/${path}`, expected);
  }

  addGenerated("recovery/declaration.json", declarationBytes.toString("utf8"));
  const provenance = `${canonical({
    schemaVersion: 1,
    kind: "evaluator-attempt-provenance",
    archiveCompleteness: "incomplete",
    classification: UNBOUND_ARCHIVE_RECOVERY_CLASSIFICATION,
    declarationIdentity,
    workflow: declaration.workflow,
    cycle: declaration.cycle,
    candidate: declaration.candidate,
    evaluatorRevision: declaration.evaluatorRevision,
    successfulAttempt: declaration.successfulAttempt,
    canonicalPass: declaration.canonicalPass,
    attempts: declaration.attempts,
    missingBytesReconstructed: false,
    unboundPriorExistenceAsserted: false,
  })}\n`;
  addGenerated("attempt-provenance.json", provenance);
  return {
    artifacts,
    generated,
    provenanceIdentity: identity(provenance),
  };
}
