import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

import { parsePromotionPlan } from "../../tools/archive-manifest.ts";
import type { PromotionArtifact } from "./model.ts";

export const ARCHIVE_LOSS_KIND = "evaluator-archive-loss" as const;
export const ARCHIVE_LOSS_STATE = "incomplete-known-loss" as const;

export interface KnownAttempt {
  attempt: number;
  execution: string;
  candidate: string;
  evaluatorRevision: string;
  publicOutcome: string;
  expectedPrivateArtifact: string;
  privateArtifact: "present" | "missing";
}

export interface ArchiveLossDeclaration {
  schemaVersion: 1;
  kind: typeof ARCHIVE_LOSS_KIND;
  archiveCompleteness: typeof ARCHIVE_LOSS_STATE;
  spike: string;
  candidate: string;
  evaluatorRevision: string;
  successfulExecution: string;
  authoritativeVerificationResult: "PASS";
  attempts: KnownAttempt[];
  successfulAttempt: {
    attempt: number;
    resultPath: string;
    resultIdentity: string;
  };
  promotionPlan: {
    path: ".eval/promotion-plan.json";
    identity: string;
    ordinaryValidation: "INELIGIBLE";
    reason: string;
  };
  missingArtifactsReconstructed: false;
  authorization: "root-supervisor-bootstrap";
  bootstrapRuntimeCommit: string;
  reason: string;
  followUpDefect: string;
}

export interface KnownLossContext {
  spike: string;
  candidate: string;
  evaluatorRevision: string;
  successfulExecution: string;
  successfulAttempt: number;
  attempts: KnownAttempt[];
}

function fail(message: string): never {
  throw new Error(`loss-aware promotion: ${message}`);
}

function identity(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    fail(`${name} must be an object`);
  return value as Record<string, unknown>;
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

function sha(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^sha256:[a-f0-9]{64}$/.test(value))
    fail(`${name} must be a sha256 identity`);
  return value;
}

function source(root: string, path: string): string {
  const output = resolve(root, path);
  const delta = relative(root, output);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("source escapes evaluator workspace");
  const stat = lstatSync(output);
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`retained source is not a regular file: ${path}`);
  return output;
}

export function parseArchiveLossDeclaration(
  value: unknown,
): ArchiveLossDeclaration {
  const raw = record(value, "archive-loss declaration");
  if (
    raw.schemaVersion !== 1 ||
    raw.kind !== ARCHIVE_LOSS_KIND ||
    raw.archiveCompleteness !== ARCHIVE_LOSS_STATE ||
    raw.authoritativeVerificationResult !== "PASS" ||
    raw.missingArtifactsReconstructed !== false ||
    raw.authorization !== "root-supervisor-bootstrap" ||
    typeof raw.spike !== "string" ||
    typeof raw.candidate !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.candidate) ||
    typeof raw.evaluatorRevision !== "string" ||
    !/^\d{3}$/.test(raw.evaluatorRevision) ||
    typeof raw.successfulExecution !== "string" ||
    typeof raw.bootstrapRuntimeCommit !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.bootstrapRuntimeCommit) ||
    typeof raw.reason !== "string" ||
    !raw.reason ||
    typeof raw.followUpDefect !== "string" ||
    !raw.followUpDefect
  )
    fail("invalid archive-loss declaration");
  if (!Array.isArray(raw.attempts) || raw.attempts.length < 2)
    fail("declaration must identify every known attempt");
  const attempts = raw.attempts.map((entry, index): KnownAttempt => {
    const attempt = record(entry, "attempt");
    const expected = index + 1;
    if (
      attempt.attempt !== expected ||
      typeof attempt.execution !== "string" ||
      typeof attempt.candidate !== "string" ||
      !/^[a-f0-9]{40}$/.test(attempt.candidate) ||
      typeof attempt.evaluatorRevision !== "string" ||
      !/^\d{3}$/.test(attempt.evaluatorRevision) ||
      typeof attempt.publicOutcome !== "string" ||
      !attempt.publicOutcome ||
      attempt.expectedPrivateArtifact !==
        `.eval/attempts/${String(expected).padStart(3, "0")}/eval-result.md` ||
      !["present", "missing"].includes(String(attempt.privateArtifact))
    )
      fail(`invalid attempt declaration ${String(expected)}`);
    return attempt as unknown as KnownAttempt;
  });
  const successfulAttempt = record(raw.successfulAttempt, "successfulAttempt");
  if (
    !Number.isSafeInteger(successfulAttempt.attempt) ||
    successfulAttempt.resultPath !==
      `.eval/attempts/${String(successfulAttempt.attempt).padStart(3, "0")}/eval-result.md`
  )
    fail("invalid successful-attempt binding");
  sha(successfulAttempt.resultIdentity, "successful result identity");
  const promotionPlan = record(raw.promotionPlan, "promotionPlan");
  if (
    promotionPlan.path !== ".eval/promotion-plan.json" ||
    promotionPlan.ordinaryValidation !== "INELIGIBLE" ||
    typeof promotionPlan.reason !== "string" ||
    !promotionPlan.reason
  )
    fail("invalid ordinary promotion validation");
  sha(promotionPlan.identity, "promotion plan identity");
  return { ...raw, attempts } as unknown as ArchiveLossDeclaration;
}

export function validateKnownLossContext(
  declaration: ArchiveLossDeclaration,
  context: KnownLossContext,
): void {
  if (
    declaration.spike !== context.spike ||
    declaration.candidate !== context.candidate ||
    declaration.evaluatorRevision !== context.evaluatorRevision ||
    declaration.successfulExecution !== context.successfulExecution ||
    declaration.successfulAttempt.attempt !== context.successfulAttempt ||
    JSON.stringify(declaration.attempts) !== JSON.stringify(context.attempts)
  )
    fail("declaration does not match canonical workflow history");
  if (
    declaration.attempts.at(-1)?.privateArtifact !== "present" ||
    declaration.attempts
      .slice(0, -1)
      .every((item) => item.privateArtifact === "present")
  )
    fail(
      "exception requires an intact successful attempt and identified historical loss",
    );
}

export function buildKnownLossArtifacts(
  root: string,
  declaration: ArchiveLossDeclaration,
): PromotionArtifact[] {
  const planPath = source(root, declaration.promotionPlan.path);
  const planBytes = readFileSync(planPath);
  if (identity(planBytes) !== declaration.promotionPlan.identity)
    fail("promotion plan identity mismatch");
  let rawPlan: unknown;
  try {
    rawPlan = JSON.parse(planBytes.toString("utf8"));
  } catch {
    fail("promotion plan is not readable JSON");
  }
  const plan = parsePromotionPlan(rawPlan);
  if (
    plan.decision !== "INELIGIBLE" ||
    plan.reason !== declaration.promotionPlan.reason ||
    !/attempt history|historical.*attempt/i.test(plan.reason)
  )
    fail(
      "ordinary ineligibility is not solely the declared historical-attempt loss",
    );

  const resultPath = source(root, declaration.successfulAttempt.resultPath);
  const resultBytes = readFileSync(resultPath);
  if (identity(resultBytes) !== declaration.successfulAttempt.resultIdentity)
    fail("successful-attempt result identity mismatch");

  const freezePath = source(root, ".eval/freeze.json");
  const freezeBytes = readFileSync(freezePath);
  let rawFreeze: Record<string, unknown>;
  try {
    rawFreeze = record(
      JSON.parse(freezeBytes.toString("utf8")),
      "freeze metadata",
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("loss-aware promotion:")
    )
      throw error;
    fail("freeze metadata is not readable JSON");
  }
  if (rawFreeze.evaluatorRevision !== declaration.evaluatorRevision)
    fail("freeze metadata revision mismatch");
  const inventory = record(rawFreeze.artifacts, "freeze artifact inventory");
  const artifacts: PromotionArtifact[] = [
    {
      source: declaration.promotionPlan.path,
      destination: "promotion-plan.json",
      identity: identity(planBytes),
    },
    {
      source: declaration.successfulAttempt.resultPath,
      destination: `attempts/${String(declaration.successfulAttempt.attempt).padStart(3, "0")}/eval-result.md`,
      identity: identity(resultBytes),
    },
    {
      source: ".eval/freeze.json",
      destination: `freeze/${declaration.evaluatorRevision}.json`,
      identity: identity(freezeBytes),
    },
  ];
  for (const [pathValue, expected] of Object.entries(inventory)) {
    const path = relativePath(pathValue, "freeze artifact path");
    const expectedIdentity = sha(expected, "freeze artifact identity");
    const bytes = readFileSync(source(root, path));
    if (identity(bytes) !== expectedIdentity)
      fail(`frozen evaluator artifact identity mismatch: ${path}`);
    artifacts.push({
      source: path,
      destination: `revisions/${declaration.evaluatorRevision}/${path}`,
      identity: expectedIdentity,
    });
  }
  return artifacts;
}
