import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  buildKnownLossArtifacts,
  parseArchiveLossDeclaration,
  validateKnownLossContext,
  type ArchiveLossDeclaration,
  type KnownAttempt,
} from "../src/kernel/archive-loss.ts";
import { buildArchiveManifest } from "../tools/archive-manifest.ts";

const sha = (value: Buffer | string): string =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

function file(root: string, path: string, value: string): string {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value);
  return sha(value);
}

function fixture(): {
  root: string;
  declaration: ArchiveLossDeclaration;
  attempts: KnownAttempt[];
} {
  const root = mkdtempSync(join(tmpdir(), "harness-known-loss-"));
  const candidate = "d".repeat(40);
  const resultPath = ".eval/attempts/003/eval-result.md";
  const resultIdentity = file(
    root,
    resultPath,
    "# Evaluation Result\n\nPASS\n",
  );
  const specIdentity = file(root, "eval-spec.md", "spec\n");
  file(
    root,
    ".eval/freeze.json",
    `${JSON.stringify({
      schemaVersion: 1,
      evaluatorRevision: "001",
      artifacts: { "eval-spec.md": specIdentity },
    })}\n`,
  );
  const reason =
    "The attempt history of this cycle is not fully present in the private workspace.";
  const plan = `${JSON.stringify({
    schemaVersion: 2,
    kind: "evaluator-promotion-plan",
    decision: "INELIGIBLE",
    reason,
  })}\n`;
  const planIdentity = file(root, ".eval/promotion-plan.json", plan);
  const attempts: KnownAttempt[] = [1, 2, 3].map((attempt) => ({
    attempt,
    execution: `execution-${String(attempt)}`,
    candidate,
    evaluatorRevision: "001",
    publicOutcome: attempt === 3 ? "PASS" : "exited:no-finalized-verdict",
    expectedPrivateArtifact: `.eval/attempts/${String(attempt).padStart(3, "0")}/eval-result.md`,
    privateArtifact: attempt === 3 ? "present" : "missing",
  }));
  const declaration = parseArchiveLossDeclaration({
    schemaVersion: 1,
    kind: "evaluator-archive-loss",
    archiveCompleteness: "incomplete-known-loss",
    spike: "014h-host-owned-fs-isolation",
    candidate,
    evaluatorRevision: "001",
    successfulExecution: "execution-3",
    authoritativeVerificationResult: "PASS",
    attempts,
    successfulAttempt: { attempt: 3, resultPath, resultIdentity },
    promotionPlan: {
      path: ".eval/promotion-plan.json",
      identity: planIdentity,
      ordinaryValidation: "INELIGIBLE",
      reason,
    },
    missingArtifactsReconstructed: false,
    authorization: "root-supervisor-bootstrap",
    bootstrapRuntimeCommit: "8".repeat(40),
    reason: "Historical private evidence retention failed before promotion.",
    followUpDefect:
      "Evaluator-private evidence must be retained when every attempt terminates.",
  });
  return { root, declaration, attempts };
}

void test("ordinary archive validation remains ineligible for known historical loss", () => {
  const f = fixture();
  assert.throws(
    () => buildArchiveManifest(f.root),
    /recorded evaluator promotion decision is ineligible: The attempt history/,
  );
});

void test("known-loss recovery requires canonical history and an intact successful attempt", () => {
  const f = fixture();
  validateKnownLossContext(f.declaration, {
    spike: f.declaration.spike,
    candidate: f.declaration.candidate,
    evaluatorRevision: "001",
    successfulExecution: "execution-3",
    successfulAttempt: 3,
    attempts: f.attempts,
  });
  assert.throws(() => {
    validateKnownLossContext(f.declaration, {
      spike: f.declaration.spike,
      candidate: f.declaration.candidate,
      evaluatorRevision: "001",
      successfulExecution: "execution-3",
      successfulAttempt: 3,
      attempts: f.attempts.map((attempt) => ({
        ...attempt,
        privateArtifact: "missing",
      })),
    });
  }, /canonical workflow history|intact successful attempt/);
});

void test("known-loss recovery archives only retained bytes and labels the gap", () => {
  const f = fixture();
  const artifacts = buildKnownLossArtifacts(f.root, f.declaration);
  assert.deepEqual(artifacts.map((artifact) => artifact.destination).sort(), [
    "attempts/003/eval-result.md",
    "freeze/001.json",
    "promotion-plan.json",
    "revisions/001/eval-spec.md",
  ]);
  assert.equal(
    artifacts.some((artifact) => artifact.source.includes("attempts/001")),
    false,
  );
  for (const artifact of artifacts)
    assert.equal(
      sha(readFileSync(join(f.root, artifact.source))),
      artifact.identity,
    );
});

void test("known-loss recovery refuses a missing or corrupted successful result", () => {
  const f = fixture();
  writeFileSync(
    join(f.root, f.declaration.successfulAttempt.resultPath),
    "changed\n",
  );
  assert.throws(
    () => buildKnownLossArtifacts(f.root, f.declaration),
    /successful-attempt result identity mismatch/,
  );
});

void test("known-loss recovery refuses unrelated ordinary ineligibility", () => {
  const f = fixture();
  const plan = `${JSON.stringify({
    schemaVersion: 2,
    kind: "evaluator-promotion-plan",
    decision: "INELIGIBLE",
    reason: "revision contains material that must remain private",
  })}\n`;
  writeFileSync(join(f.root, ".eval/promotion-plan.json"), plan);
  const declaration = {
    ...f.declaration,
    promotionPlan: {
      ...f.declaration.promotionPlan,
      identity: sha(plan),
      reason: "revision contains material that must remain private",
    },
  };
  assert.throws(
    () => buildKnownLossArtifacts(f.root, declaration),
    /not solely the declared historical-attempt loss/,
  );
});
