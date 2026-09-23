import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ArchiveManifestError,
  buildArchiveManifest,
} from "../tools/archive-manifest.ts";

function identity(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

void test("builds a deterministic manifest only from an eligible recorded plan", (t) => {
  const root = mkdtempSync(join(tmpdir(), "harness-archive-manifest-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  mkdirSync(join(root, ".eval/revisions/004"), { recursive: true });
  mkdirSync(join(root, ".eval/attempts/001"), { recursive: true });
  writeFileSync(join(root, ".eval/attempt-ledger.json"), "ledger\n");
  writeFileSync(join(root, ".eval/attempts/001/eval-result.md"), "pass\n");
  writeFileSync(join(root, ".eval/revisions/004/freeze.json"), "freeze\n");
  writeFileSync(join(root, ".eval/revisions/004/eval-spec.md"), "spec\n");
  writeFileSync(
    join(root, ".eval/promotion-plan.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      kind: "evaluator-promotion-plan",
      decision: "ELIGIBLE",
      candidate: "a".repeat(40),
      evaluatorRevision: "004",
      attempt: 1,
      artifacts: [
        {
          kind: "attempt-ledger",
          eligible: true,
          source: ".eval/attempt-ledger.json",
          destination: "attempt-ledger.json",
        },
        {
          kind: "terminal-attempt",
          eligible: true,
          source: ".eval/attempts/001/eval-result.md",
          destination: "attempts/001/eval-result.md",
        },
        {
          kind: "evaluator-revision",
          eligible: true,
          source: ".eval/revisions/004",
          destination: "revisions/004",
        },
      ],
    })}\n`,
  );

  const manifest = buildArchiveManifest(root);
  assert.equal(manifest.artifacts.length, 4);
  assert.deepEqual(
    manifest.artifacts.map((artifact) => artifact.destination),
    [
      "attempt-ledger.json",
      "attempts/001/eval-result.md",
      "revisions/004/eval-spec.md",
      "revisions/004/freeze.json",
    ],
  );
  assert.equal(manifest.artifacts[0]?.identity, identity("ledger\n"));
  assert.equal(
    manifest.decisionIdentity,
    identity(readFileSync(join(root, ".eval/promotion-plan.json"), "utf8")),
  );
});

void test("refuses to guess when the evaluator recorded no promotion decision", (t) => {
  const root = mkdtempSync(join(tmpdir(), "harness-archive-manifest-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  assert.throws(
    () => buildArchiveManifest(root),
    (error: unknown) =>
      error instanceof ArchiveManifestError &&
      error.message ===
        "missing recorded evaluator promotion eligibility decision: .eval/promotion-plan.json",
  );
});
