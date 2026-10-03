import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test, { type TestContext } from "node:test";

import {
  buildCompleteArchiveArtifacts,
  parseCompleteArchiveRecoveryDeclaration,
  validateCompleteArchiveRecoveryContext,
  type CompleteArchiveAttempt,
  type CompleteArchiveRecoveryContext,
  type CompleteArchiveRecoveryDeclaration,
} from "../src/kernel/archive-recovery.ts";

const sha = (value: Buffer | string): string =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

function file(root: string, path: string, value: string): string {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value);
  return sha(value);
}

function fixture(t: TestContext): {
  root: string;
  declaration: CompleteArchiveRecoveryDeclaration;
  context: CompleteArchiveRecoveryContext;
} {
  const root = mkdtempSync(join(tmpdir(), "harness-complete-recovery-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const candidates = ["a", "b", "c", "d"].map((item) => item.repeat(40));
  const attempts: CompleteArchiveAttempt[] = candidates.map(
    (candidate, index) => ({
      attempt: index + 1,
      execution: `execution-${String(index + 1)}`,
      candidate,
      evaluatorRevision: index === 0 ? "001" : "002",
      result: index === 0 ? "BLOCKED" : index === 3 ? "PASS" : "FAIL",
    }),
  );
  const ledgerEntries = attempts.map((attempt) => {
    const id = String(attempt.attempt).padStart(3, "0");
    const result = file(
      root,
      `.eval/attempts/${id}/eval-result.md`,
      `# Attempt ${id}\n\n${attempt.result}\n`,
    );
    return {
      id,
      implementation: attempt.candidate,
      evaluatorRevision: attempt.evaluatorRevision,
      status: attempt.result,
      result,
    };
  });
  const ledger = `${JSON.stringify({ schemaVersion: 2, attempts: ledgerEntries }, null, 2)}\n`;
  const ledgerIdentity = file(root, ".eval/attempt-ledger.json", ledger);
  const revisions: Record<string, string> = {};
  for (const id of ["001", "002"]) {
    const spec = file(
      root,
      `.eval/revisions/${id}/eval-spec.md`,
      `spec ${id}\n`,
    );
    const grader = file(
      root,
      `.eval/revisions/${id}/.hidden-test/grader.test.ts`,
      `grader ${id}\n`,
    );
    const freeze = `${JSON.stringify(
      {
        schemaVersion: 1,
        evaluatorRevision: id,
        artifacts: {
          ".hidden-test/grader.test.ts": grader,
          "eval-spec.md": spec,
        },
      },
      null,
      2,
    )}\n`;
    revisions[id] = file(root, `.eval/revisions/${id}/freeze.json`, freeze);
    if (id === "002") {
      file(root, ".eval/freeze.json", freeze);
      file(root, "eval-spec.md", `spec ${id}\n`);
      file(root, ".hidden-test/grader.test.ts", `grader ${id}\n`);
    }
  }
  const plan = `${JSON.stringify(
    {
      schemaVersion: 2,
      kind: "evaluator-promotion-plan",
      decision: "INELIGIBLE",
      reason: "Legacy evaluator policy refused ordinary canonical evidence.",
    },
    null,
    2,
  )}\n`;
  const planIdentity = file(root, ".eval/promotion-plan.json", plan);
  const context: CompleteArchiveRecoveryContext = {
    workflow: "generic-workflow",
    cycle: "001",
    candidate: candidates[3] ?? "",
    evaluatorRevision: "002",
    successfulExecution: "execution-4",
    successfulAttempt: 4,
    verificationEvent: "verification-event-4",
    semanticResult: "semantic-result-4",
    publicArtifactPath: "verification-result.json",
    publicArtifactIdentity: sha("public PASS\n"),
    attempts,
    promotionRecorded: false,
    runtimeCommit: "e".repeat(40),
  };
  const declaration = parseCompleteArchiveRecoveryDeclaration({
    schemaVersion: 1,
    kind: "evaluator-complete-archive-recovery",
    classification: "PROMOTION_POLICY_DEFECT",
    archiveCompleteness: "complete",
    workflow: context.workflow,
    cycle: context.cycle,
    candidate: context.candidate,
    evaluatorRevision: context.evaluatorRevision,
    successfulExecution: context.successfulExecution,
    successfulAttempt: context.successfulAttempt,
    authoritativeVerification: {
      result: "PASS",
      event: context.verificationEvent,
      semanticResult: context.semanticResult,
      publicArtifactPath: context.publicArtifactPath,
      publicArtifactIdentity: context.publicArtifactIdentity,
    },
    promotionPlan: {
      path: ".eval/promotion-plan.json",
      identity: planIdentity,
      ordinaryValidation: "INELIGIBLE",
      originalDecision: "INELIGIBLE",
    },
    attemptLedger: {
      path: ".eval/attempt-ledger.json",
      identity: ledgerIdentity,
    },
    revisionIdentities: revisions,
    evidenceReconstructed: false,
    evidenceOmitted: false,
    runtimeCommit: context.runtimeCommit,
  });
  return { root, declaration, context };
}

void test("complete recovery derives and validates the entire canonical archive", (t) => {
  const f = fixture(t);
  const before = readFileSync(join(f.root, ".eval/promotion-plan.json"));
  const artifacts = buildCompleteArchiveArtifacts(
    f.root,
    f.declaration,
    f.context,
  );
  assert.deepEqual(
    artifacts.map((artifact) => artifact.destination),
    [
      "promotion-plan.json",
      "attempt-ledger.json",
      "attempts/001/eval-result.md",
      "attempts/002/eval-result.md",
      "attempts/003/eval-result.md",
      "attempts/004/eval-result.md",
      "revisions/001/freeze.json",
      "revisions/001/.hidden-test/grader.test.ts",
      "revisions/001/eval-spec.md",
      "revisions/002/freeze.json",
      "revisions/002/.hidden-test/grader.test.ts",
      "revisions/002/eval-spec.md",
    ],
  );
  assert.deepEqual(
    readFileSync(join(f.root, ".eval/promotion-plan.json")),
    before,
  );
  const parsed: unknown = JSON.parse(before.toString("utf8"));
  assert.equal((parsed as { decision?: unknown }).decision, "INELIGIBLE");
  for (const artifact of artifacts)
    assert.equal(
      sha(readFileSync(join(f.root, artifact.source))),
      artifact.identity,
    );
});

void test("complete recovery refuses mismatched PASS bindings and duplicates", (t) => {
  for (const mutate of [
    (f: ReturnType<typeof fixture>) => ({
      ...f.context,
      candidate: "f".repeat(40),
    }),
    (f: ReturnType<typeof fixture>) => ({
      ...f.context,
      evaluatorRevision: "003",
    }),
    (f: ReturnType<typeof fixture>) => ({ ...f.context, successfulAttempt: 3 }),
    (f: ReturnType<typeof fixture>) => ({
      ...f.context,
      attempts: f.context.attempts.map((attempt, index) =>
        index === 3 ? { ...attempt, result: "FAIL" as const } : attempt,
      ),
    }),
    (f: ReturnType<typeof fixture>) => ({
      ...f.context,
      promotionRecorded: true,
    }),
  ]) {
    const f = fixture(t);
    assert.throws(() => {
      validateCompleteArchiveRecoveryContext(f.declaration, mutate(f));
    }, /complete-archive recovery:/);
  }
});

void test("complete recovery refuses changed plans and missing terminal evidence", (t) => {
  {
    const f = fixture(t);
    writeFileSync(join(f.root, ".eval/promotion-plan.json"), "{}\n");
    assert.throws(
      () => buildCompleteArchiveArtifacts(f.root, f.declaration, f.context),
      /promotion plan identity mismatch/,
    );
  }
  {
    const f = fixture(t);
    rmSync(join(f.root, ".eval/attempts/003/eval-result.md"));
    assert.throws(
      () => buildCompleteArchiveArtifacts(f.root, f.declaration, f.context),
      /canonical evaluator evidence is missing/,
    );
  }
});

void test("complete recovery refuses mutated, incomplete, or broadened revision bundles", (t) => {
  {
    const f = fixture(t);
    writeFileSync(
      join(f.root, ".eval/revisions/001/eval-spec.md"),
      "mutated\n",
    );
    assert.throws(
      () => buildCompleteArchiveArtifacts(f.root, f.declaration, f.context),
      /identity mismatch/,
    );
  }
  {
    const f = fixture(t);
    rmSync(join(f.root, ".eval/revisions/001/eval-spec.md"));
    assert.throws(
      () => buildCompleteArchiveArtifacts(f.root, f.declaration, f.context),
      /incomplete|missing/,
    );
  }
  {
    const f = fixture(t);
    file(f.root, ".eval/revisions/001/unrelated-secret.txt", "not canonical\n");
    assert.throws(
      () => buildCompleteArchiveArtifacts(f.root, f.declaration, f.context),
      /extra material/,
    );
  }
});

void test("caller-supplied mappings cannot broaden the derived archive", (t) => {
  const f = fixture(t);
  const parsed = parseCompleteArchiveRecoveryDeclaration({
    ...f.declaration,
    artifacts: [
      {
        source: "/etc/passwd",
        destination: "surprise.txt",
        identity: sha("nope"),
      },
    ],
  });
  const artifacts = buildCompleteArchiveArtifacts(f.root, parsed, f.context);
  assert.equal(
    artifacts.some((artifact) => artifact.destination === "surprise.txt"),
    false,
  );
});
