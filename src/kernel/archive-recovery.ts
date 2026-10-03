import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

import { MAX_ACTION_ARTIFACTS } from "../executors/protocol.ts";
import { parsePromotionPlan } from "../../tools/archive-manifest.ts";
import type { PromotionArtifact } from "./model.ts";

export const COMPLETE_ARCHIVE_RECOVERY_KIND =
  "evaluator-complete-archive-recovery" as const;
export const COMPLETE_ARCHIVE_RECOVERY_CLASSIFICATION =
  "PROMOTION_POLICY_DEFECT" as const;

export interface CompleteArchiveAttempt {
  attempt: number;
  execution: string;
  candidate: string;
  evaluatorRevision: string;
  result: "PASS" | "FAIL" | "BLOCKED";
}

export interface CompleteArchiveRecoveryDeclaration {
  schemaVersion: 1;
  kind: typeof COMPLETE_ARCHIVE_RECOVERY_KIND;
  classification: typeof COMPLETE_ARCHIVE_RECOVERY_CLASSIFICATION;
  archiveCompleteness: "complete";
  workflow: string;
  cycle: string;
  candidate: string;
  evaluatorRevision: string;
  successfulExecution: string;
  successfulAttempt: number;
  authoritativeVerification: {
    result: "PASS";
    event: string;
    semanticResult: string;
    publicArtifactPath: string;
    publicArtifactIdentity: string;
  };
  promotionPlan: {
    path: ".eval/promotion-plan.json";
    identity: string;
    ordinaryValidation: "INELIGIBLE";
    originalDecision: "INELIGIBLE";
  };
  attemptLedger: {
    path: ".eval/attempt-ledger.json";
    identity: string;
  };
  revisionIdentities: Record<string, string>;
  evidenceReconstructed: false;
  evidenceOmitted: false;
  runtimeCommit: string;
}

export interface CompleteArchiveRecoveryContext {
  workflow: string;
  cycle: string;
  candidate: string;
  evaluatorRevision: string;
  successfulExecution: string;
  successfulAttempt: number;
  verificationEvent: string;
  semanticResult: string;
  publicArtifactPath: string;
  publicArtifactIdentity: string;
  attempts: CompleteArchiveAttempt[];
  promotionRecorded: boolean;
  runtimeCommit: string;
}

interface AttemptLedgerEntry {
  id: string;
  implementation: string;
  evaluatorRevision: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  result: string;
}

function fail(message: string): never {
  throw new Error(`complete-archive recovery: ${message}`);
}

function identity(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
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

function revision(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^\d{3}$/.test(value))
    fail(`${name} must be a three-digit evaluator revision`);
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

function source(root: string, path: string): string {
  const output = resolve(root, path);
  const delta = relative(root, output);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("source escapes evaluator workspace");
  let stat;
  try {
    stat = lstatSync(output);
  } catch {
    fail(`canonical evaluator evidence is missing: ${path}`);
  }
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`canonical evaluator evidence is not a regular file: ${path}`);
  return output;
}

function readJson(
  root: string,
  path: string,
  name: string,
): {
  bytes: Buffer;
  value: Record<string, unknown>;
} {
  const bytes = readFileSync(source(root, path));
  try {
    return { bytes, value: record(JSON.parse(bytes.toString("utf8")), name) };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("complete-archive recovery:")
    )
      throw error;
    fail(`${name} is not readable JSON`);
  }
}

export function parseCompleteArchiveRecoveryDeclaration(
  value: unknown,
): CompleteArchiveRecoveryDeclaration {
  const raw = record(value, "recovery declaration");
  if (
    raw.schemaVersion !== 1 ||
    raw.kind !== COMPLETE_ARCHIVE_RECOVERY_KIND ||
    raw.classification !== COMPLETE_ARCHIVE_RECOVERY_CLASSIFICATION ||
    raw.archiveCompleteness !== "complete" ||
    typeof raw.workflow !== "string" ||
    !raw.workflow ||
    typeof raw.cycle !== "string" ||
    !raw.cycle ||
    typeof raw.candidate !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.candidate) ||
    typeof raw.successfulExecution !== "string" ||
    !raw.successfulExecution ||
    !Number.isSafeInteger(raw.successfulAttempt) ||
    (raw.successfulAttempt as number) < 1 ||
    raw.evidenceReconstructed !== false ||
    raw.evidenceOmitted !== false ||
    typeof raw.runtimeCommit !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.runtimeCommit)
  )
    fail("invalid recovery declaration");
  revision(raw.evaluatorRevision, "evaluatorRevision");

  const verification = record(
    raw.authoritativeVerification,
    "authoritativeVerification",
  );
  if (
    verification.result !== "PASS" ||
    typeof verification.event !== "string" ||
    !verification.event ||
    typeof verification.semanticResult !== "string" ||
    !verification.semanticResult ||
    typeof verification.publicArtifactPath !== "string" ||
    !verification.publicArtifactPath
  )
    fail("invalid authoritative verification binding");
  sha(verification.publicArtifactIdentity, "public verification identity");

  const plan = record(raw.promotionPlan, "promotionPlan");
  if (
    plan.path !== ".eval/promotion-plan.json" ||
    plan.ordinaryValidation !== "INELIGIBLE" ||
    plan.originalDecision !== "INELIGIBLE"
  )
    fail("invalid immutable promotion-plan binding");
  sha(plan.identity, "promotion plan identity");

  const ledger = record(raw.attemptLedger, "attemptLedger");
  if (ledger.path !== ".eval/attempt-ledger.json")
    fail("invalid attempt-ledger binding");
  sha(ledger.identity, "attempt ledger identity");

  const revisions = record(raw.revisionIdentities, "revisionIdentities");
  if (Object.keys(revisions).length === 0)
    fail("revision identities are required");
  for (const [key, item] of Object.entries(revisions)) {
    revision(key, "revision identity key");
    sha(item, "revision freeze identity");
  }
  return raw as unknown as CompleteArchiveRecoveryDeclaration;
}

export function validateCompleteArchiveRecoveryContext(
  declaration: CompleteArchiveRecoveryDeclaration,
  context: CompleteArchiveRecoveryContext,
): void {
  if (
    declaration.workflow !== context.workflow ||
    declaration.cycle !== context.cycle ||
    declaration.candidate !== context.candidate ||
    declaration.evaluatorRevision !== context.evaluatorRevision ||
    declaration.successfulExecution !== context.successfulExecution ||
    declaration.successfulAttempt !== context.successfulAttempt ||
    declaration.authoritativeVerification.event !== context.verificationEvent ||
    declaration.authoritativeVerification.semanticResult !==
      context.semanticResult ||
    declaration.authoritativeVerification.publicArtifactPath !==
      context.publicArtifactPath ||
    declaration.authoritativeVerification.publicArtifactIdentity !==
      context.publicArtifactIdentity ||
    declaration.runtimeCommit !== context.runtimeCommit
  )
    fail("declaration does not match canonical verification history");
  if (context.promotionRecorded)
    fail("authoritative PASS already has a recorded promotion");
  if (
    context.attempts.length !== context.successfulAttempt ||
    context.attempts.some(
      (attempt, index) =>
        attempt.attempt !== index + 1 ||
        !attempt.execution ||
        !/^[a-f0-9]{40}$/.test(attempt.candidate) ||
        !/^\d{3}$/.test(attempt.evaluatorRevision),
    )
  )
    fail("canonical verification attempts are incomplete or out of order");
  const terminal = context.attempts.at(-1);
  if (
    terminal?.result !== "PASS" ||
    terminal.execution !== context.successfulExecution ||
    terminal.candidate !== context.candidate ||
    terminal.evaluatorRevision !== context.evaluatorRevision
  )
    fail("successful attempt does not bind the authoritative PASS");
}

function attemptLedger(value: Record<string, unknown>): AttemptLedgerEntry[] {
  if (!Array.isArray(value.attempts) || value.attempts.length === 0)
    fail("attempt ledger is empty or invalid");
  return value.attempts.map((item, index) => {
    const entry = record(item, "attempt ledger entry");
    const id = String(index + 1).padStart(3, "0");
    if (
      entry.id !== id ||
      typeof entry.implementation !== "string" ||
      !/^[a-f0-9]{40}$/.test(entry.implementation) ||
      typeof entry.evaluatorRevision !== "string" ||
      !/^\d{3}$/.test(entry.evaluatorRevision) ||
      !["PASS", "FAIL", "BLOCKED"].includes(String(entry.status))
    )
      fail(`invalid attempt ledger entry ${id}`);
    sha(entry.result, `attempt ${id} result identity`);
    return entry as unknown as AttemptLedgerEntry;
  });
}

function directoryFiles(root: string, path: string): string[] {
  const absolute = resolve(root, path);
  const stat = lstatSync(absolute);
  if (stat.isSymbolicLink()) fail("revision bundle contains a symbolic link");
  if (stat.isFile()) return [relative(root, absolute).split(sep).join("/")];
  if (!stat.isDirectory()) fail("revision bundle contains an invalid entry");
  return readdirSync(absolute, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) =>
      directoryFiles(root, relative(root, resolve(absolute, entry.name))),
    );
}

export function buildCompleteArchiveArtifacts(
  root: string,
  declaration: CompleteArchiveRecoveryDeclaration,
  context: CompleteArchiveRecoveryContext,
): PromotionArtifact[] {
  validateCompleteArchiveRecoveryContext(declaration, context);

  const plan = readJson(root, declaration.promotionPlan.path, "promotion plan");
  if (identity(plan.bytes) !== declaration.promotionPlan.identity)
    fail("promotion plan identity mismatch");
  const parsedPlan = parsePromotionPlan(plan.value);
  if (parsedPlan.decision !== "INELIGIBLE")
    fail("immutable promotion plan is not INELIGIBLE");

  const ledger = readJson(
    root,
    declaration.attemptLedger.path,
    "attempt ledger",
  );
  if (identity(ledger.bytes) !== declaration.attemptLedger.identity)
    fail("attempt ledger identity mismatch");
  const entries = attemptLedger(ledger.value);
  if (entries.length !== context.attempts.length)
    fail("attempt ledger does not represent every canonical allocation");

  const artifacts: PromotionArtifact[] = [];
  const destinations = new Set<string>();
  const add = (sourcePath: string, destination: string, expected?: string) => {
    const normalized = relativePath(destination, "archive destination");
    if (normalized === "promotion.json" || destinations.has(normalized))
      fail("archive destination is reserved or duplicated");
    const bytes = readFileSync(source(root, sourcePath));
    const actual = identity(bytes);
    if (expected !== undefined && actual !== expected)
      fail(`canonical evaluator evidence identity mismatch: ${sourcePath}`);
    destinations.add(normalized);
    artifacts.push({
      source: sourcePath,
      destination: normalized,
      identity: actual,
    });
  };
  add(
    declaration.promotionPlan.path,
    "promotion-plan.json",
    declaration.promotionPlan.identity,
  );
  add(
    declaration.attemptLedger.path,
    "attempt-ledger.json",
    declaration.attemptLedger.identity,
  );

  const revisions = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    const canonical = context.attempts[index];
    if (
      !canonical ||
      entry.id !== String(canonical.attempt).padStart(3, "0") ||
      entry.implementation !== canonical.candidate ||
      entry.evaluatorRevision !== canonical.evaluatorRevision ||
      entry.status !== canonical.result
    )
      fail("attempt ledger disagrees with canonical workflow history");
    const resultPath = `.eval/attempts/${entry.id}/eval-result.md`;
    add(resultPath, `attempts/${entry.id}/eval-result.md`, entry.result);
    revisions.add(entry.evaluatorRevision);
  }

  const declaredRevisions = Object.keys(declaration.revisionIdentities).sort();
  const historicalRevisions = [...revisions].sort();
  if (JSON.stringify(declaredRevisions) !== JSON.stringify(historicalRevisions))
    fail("declared revisions do not exactly match canonical history");

  for (const id of historicalRevisions) {
    const revisionRoot = `.eval/revisions/${id}`;
    const freezePath = `${revisionRoot}/freeze.json`;
    const freeze = readJson(root, freezePath, `revision ${id} freeze metadata`);
    if (identity(freeze.bytes) !== declaration.revisionIdentities[id])
      fail(`revision ${id} freeze identity mismatch`);
    if (freeze.value.evaluatorRevision !== id)
      fail(`revision ${id} freeze metadata revision mismatch`);
    const inventory = record(
      freeze.value.artifacts,
      `revision ${id} frozen inventory`,
    );
    const inventoryPaths = Object.keys(inventory).sort();
    if (inventoryPaths.length === 0)
      fail(`revision ${id} frozen inventory is empty`);
    for (const path of inventoryPaths) {
      relativePath(path, `revision ${id} inventory path`);
      if (path !== "eval-spec.md" && !path.startsWith(".hidden-test/"))
        fail(`revision ${id} inventory contains unrelated material`);
      sha(inventory[path], `revision ${id} inventory identity`);
    }
    const actualPaths = directoryFiles(root, revisionRoot)
      .map((path) =>
        relative(resolve(root, revisionRoot), resolve(root, path))
          .split(sep)
          .join("/"),
      )
      .sort();
    const expectedPaths = ["freeze.json", ...inventoryPaths].sort();
    if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths))
      fail(`revision ${id} bundle is incomplete or contains extra material`);
    add(
      freezePath,
      `revisions/${id}/freeze.json`,
      declaration.revisionIdentities[id],
    );
    for (const path of inventoryPaths)
      add(
        `${revisionRoot}/${path}`,
        `revisions/${id}/${path}`,
        String(inventory[path]),
      );
  }

  const activeFreeze = readFileSync(source(root, ".eval/freeze.json"));
  if (
    identity(activeFreeze) !==
    declaration.revisionIdentities[declaration.evaluatorRevision]
  )
    fail("active freeze metadata does not match the authoritative revision");
  const activeParsed: unknown = JSON.parse(activeFreeze.toString("utf8"));
  for (const path of Object.keys(
    record(
      record(activeParsed, "active freeze metadata").artifacts,
      "active frozen inventory",
    ),
  )) {
    const active = readFileSync(source(root, path));
    const archived = readFileSync(
      source(root, `.eval/revisions/${declaration.evaluatorRevision}/${path}`),
    );
    if (!active.equals(archived))
      fail("active evaluator bundle differs from its archived revision");
  }

  if (artifacts.length > MAX_ACTION_ARTIFACTS)
    fail(
      `complete archive has ${String(artifacts.length)} artifacts, above the ${String(MAX_ACTION_ARTIFACTS)}-artifact host action bound`,
    );
  return artifacts;
}
