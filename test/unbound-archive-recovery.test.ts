import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { identity } from "../src/kernel/ledger.ts";
import {
  buildUnboundArchiveArtifacts,
  parseUnboundArchiveRecoveryDeclaration,
  type RecoveryAttemptContext,
  type UnboundArchiveRecoveryContext,
  type UnboundArchiveRecoveryDeclaration,
} from "../src/kernel/unbound-archive-recovery.ts";

const candidate = "a".repeat(40);
const runtimeCommit = "b".repeat(40);
const bindingCommit = "c".repeat(40);
const result = (attempt: number) =>
  `.eval/attempts/${String(attempt).padStart(3, "0")}/eval-result.md`;

function at<T>(values: T[], index: number): T {
  const value = values[index];
  if (value === undefined)
    throw new Error(`missing fixture value ${String(index)}`);
  return value;
}

function file(root: string, path: string, bytes: string): string {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  return identity(bytes);
}

function fixture(): {
  root: string;
  declaration: UnboundArchiveRecoveryDeclaration;
  bytes: Buffer;
  declarationIdentity: string;
  context: UnboundArchiveRecoveryContext;
} {
  const root = mkdtempSync(join(tmpdir(), "harness-unbound-recovery-"));
  const attempt8Identity = file(root, result(8), "attempt 8 blocked\n");
  const attempt9Identity = file(root, result(9), "attempt 9 pass\n");
  const ledgerIdentity = file(
    root,
    ".eval/attempt-ledger.json",
    '{"schemaVersion":2,"attempts":[]}\n',
  );
  const specIdentity = file(root, "eval-spec.md", "frozen evaluator\n");
  const freezeIdentity = file(
    root,
    ".eval/freeze.json",
    `${JSON.stringify({
      schemaVersion: 1,
      evaluatorRevision: "002",
      artifacts: { "eval-spec.md": specIdentity },
    })}\n`,
  );
  const bindingIdentity = identity("committed binding record\n");
  const attempts = Array.from({ length: 9 }, (_, index) => {
    const attempt = index + 1;
    const common = {
      attempt,
      allocation: `allocation-${String(attempt)}`,
      execution: `execution-${String(attempt)}`,
      roleGrant: `sha256:${String(attempt).padStart(64, "0")}`,
      candidate,
      evaluatorRevision: "002",
    };
    if ([3, 4, 6, 7].includes(attempt))
      return { ...common, lifecycle: "NONTERMINAL" as const };
    const finalization =
      attempt === 8 ? null : `finalization-${String(attempt)}`;
    const publicArtifact = {
      path: "verification-result.json",
      identity: `sha256:${String(attempt + 20).padStart(64, "0")}`,
      commit: String(attempt + 30).padStart(40, "0"),
    };
    const privateEvidence = [1, 2, 5].includes(attempt)
      ? {
          disposition: "UNBOUND" as const,
          expectedPath: result(attempt),
          priorPersistence: "UNKNOWN" as const,
          reconstructed: false as const,
        }
      : attempt === 8
        ? {
            disposition: "RECOVERY_BOUND" as const,
            path: result(8),
            observedIdentity: attempt8Identity,
            identityEstablished: "during-recovery" as const,
          }
        : {
            disposition: "BOUND" as const,
            path: result(9),
            identity: attempt9Identity,
            historicalBinding: {
              kind: "committed-maintenance-record" as const,
              path: "maintenance.md",
              commit: bindingCommit,
              identity: bindingIdentity,
            },
          };
    return {
      ...common,
      lifecycle: "TERMINAL" as const,
      result: attempt === 9 ? ("PASS" as const) : ("BLOCKED" as const),
      semanticResult: `semantic-${String(attempt)}`,
      semanticEvent: `semantic-event-${String(attempt)}`,
      finalization,
      publicArtifact,
      blockedTransition:
        attempt === 8
          ? { event: "blocked-8", reason: "verification identity mismatch" }
          : null,
      privateEvidence,
    };
  });
  const passAttempt = at(attempts, 8);
  if (passAttempt.lifecycle !== "TERMINAL")
    throw new Error("terminal PASS fixture expected");
  const declaration = parseUnboundArchiveRecoveryDeclaration({
    schemaVersion: 1,
    kind: "evaluator-unbound-evidence-recovery",
    classification: "HISTORICAL_UNBOUND_PRIVATE_EVIDENCE",
    archiveCompleteness: "incomplete",
    workflow: "work-item",
    cycle: "001",
    candidate,
    evaluatorRevision: "002",
    runtimeCommit,
    closeoutAuthorized: true,
    missingBytesReconstructed: false,
    unboundPriorExistenceAsserted: false,
    attempts,
    successfulAttempt: 9,
    canonicalPass: {
      execution: "execution-9",
      semanticResult: "semantic-9",
      finalization: "finalization-9",
      publicArtifact: passAttempt.publicArtifact,
      privateArtifact: { path: result(9), identity: attempt9Identity },
    },
    privateLedger: {
      path: ".eval/attempt-ledger.json",
      identity: ledgerIdentity,
      canonical: false,
    },
    revision: {
      id: "002",
      freezePath: ".eval/freeze.json",
      freezeIdentity,
    },
  });
  const contextAttempts: RecoveryAttemptContext[] = attempts.map((attempt) => {
    if (attempt.lifecycle === "NONTERMINAL") return { ...attempt };
    return {
      attempt: attempt.attempt,
      allocation: attempt.allocation,
      execution: attempt.execution,
      roleGrant: attempt.roleGrant,
      candidate: attempt.candidate,
      evaluatorRevision: attempt.evaluatorRevision,
      semanticResult: attempt.semanticResult,
      semanticEvent: attempt.semanticEvent,
      result: attempt.result,
      ...(attempt.finalization ? { finalization: attempt.finalization } : {}),
      publicArtifact: attempt.publicArtifact,
      ...(attempt.blockedTransition
        ? { blockedTransition: attempt.blockedTransition }
        : {}),
      ...(attempt.attempt === 9
        ? { durablePrivateIdentity: attempt9Identity }
        : {}),
    };
  });
  const bytes = Buffer.from(`${JSON.stringify(declaration, null, 2)}\n`);
  return {
    root,
    declaration,
    bytes,
    declarationIdentity: identity(bytes),
    context: {
      workflow: "work-item",
      cycle: "001",
      candidate,
      evaluatorRevision: "002",
      successfulAttempt: 9,
      attempts: contextAttempts,
      promotionRecorded: false,
      runtimeCommit,
    },
  };
}

function build(f: ReturnType<typeof fixture>) {
  return buildUnboundArchiveArtifacts(
    f.root,
    f.declaration,
    f.bytes,
    f.declarationIdentity,
    f.context,
  );
}

void test("unbound recovery preserves nine-attempt provenance without fake terminal files", () => {
  const f = fixture();
  const built = build(f);
  const destinations = built.artifacts.map((artifact) => artifact.destination);
  assert.ok(destinations.includes("attempts/008/eval-result.md"));
  assert.ok(destinations.includes("attempts/009/eval-result.md"));
  for (const attempt of [1, 2, 5])
    assert.ok(
      !destinations.includes(
        `attempts/${String(attempt).padStart(3, "0")}/eval-result.md`,
      ),
    );
  const provenance = JSON.parse(
    built.generated.find(
      (item) => item.destination === "attempt-provenance.json",
    )?.content ?? "null",
  ) as { archiveCompleteness: string; attempts: unknown[] };
  assert.equal(provenance.archiveCompleteness, "incomplete");
  assert.equal(provenance.attempts.length, 9);
  assert.match(built.provenanceIdentity, /^sha256:[a-f0-9]{64}$/);
});

void test("NONTERMINAL attempts require no private artifact", () => {
  const f = fixture();
  assert.doesNotThrow(() => build(f));
});

void test("UNBOUND refuses surviving bytes or a durable prior identity", () => {
  const withBytes = fixture();
  file(withBytes.root, result(1), "unexpected bytes\n");
  assert.throws(() => build(withBytes), /surviving private evidence/);

  const withIdentity = fixture();
  withIdentity.context.attempts[0] = {
    ...at(withIdentity.context.attempts, 0),
    durablePrivateIdentity: `sha256:${"9".repeat(64)}`,
  };
  assert.throws(() => build(withIdentity), /stronger historical evidence/);
});

void test("RECOVERY_BOUND hashes surviving bytes and refuses later changes", () => {
  const f = fixture();
  const built = build(f);
  assert.equal(
    built.artifacts.find(
      (artifact) => artifact.destination === "attempts/008/eval-result.md",
    )?.identity,
    identity(readFileSync(join(f.root, result(8)))),
  );
  writeFileSync(join(f.root, result(8)), "changed\n");
  assert.throws(() => build(f), /recovery-bound evidence drifted/);
});

void test("BOUND requires both durable identity and matching bytes", () => {
  const missingBinding = fixture();
  delete at(missingBinding.context.attempts, 8).durablePrivateIdentity;
  assert.throws(() => build(missingBinding), /BOUND evidence drifted/);

  const changed = fixture();
  writeFileSync(join(changed.root, result(9)), "changed\n");
  assert.throws(() => build(changed), /BOUND evidence drifted/);
});

void test("LOST requires an exact durable identity and absent bytes", () => {
  const f = fixture();
  const attempt = at(f.declaration.attempts, 0);
  assert.equal(attempt.lifecycle, "TERMINAL");
  f.declaration.attempts[0] = {
    ...attempt,
    privateEvidence: {
      disposition: "LOST",
      path: result(1),
      historicalIdentity: `sha256:${"8".repeat(64)}`,
      historicalBinding: {
        kind: "committed-maintenance-record",
        path: "maintenance.md",
        commit: bindingCommit,
        identity: `sha256:${"7".repeat(64)}`,
      },
    },
  };
  assert.throws(() => build(f), /not truthfully LOST/);
  f.context.attempts[0] = {
    ...at(f.context.attempts, 0),
    durablePrivateIdentity: `sha256:${"8".repeat(64)}`,
  };
  assert.doesNotThrow(() => build(f));
});

void test("declaration must cover every allocation exactly once and in order", () => {
  const f = fixture();
  const raw = JSON.parse(f.bytes.toString("utf8")) as {
    attempts: Array<Record<string, unknown>>;
  };
  at(raw.attempts, 1).attempt = 1;
  assert.throws(
    () => parseUnboundArchiveRecoveryDeclaration(raw),
    /invalid attempt declaration 2/,
  );
  f.context.attempts.pop();
  assert.throws(() => build(f), /incomplete or out of order/);
});

void test("allocation, candidate, revision, execution and Role Grant drift fail closed", () => {
  const mutations: Array<[keyof RecoveryAttemptContext, string]> = [
    ["allocation", "changed-allocation"],
    ["candidate", "d".repeat(40)],
    ["evaluatorRevision", "003"],
    ["execution", "changed-execution"],
    ["roleGrant", `sha256:${"e".repeat(64)}`],
  ];
  for (const [key, value] of mutations) {
    const f = fixture();
    f.context.attempts[0] = { ...at(f.context.attempts, 0), [key]: value };
    assert.throws(() => build(f), /allocation provenance drifted/);
  }
});

void test("semantic result and finalization drift fail closed", () => {
  for (const mutation of [
    { semanticResult: "changed-semantic" },
    { result: "FAIL" as const },
    { finalization: "changed-finalization" },
  ]) {
    const f = fixture();
    f.context.attempts[0] = { ...at(f.context.attempts, 0), ...mutation };
    assert.throws(() => build(f), /terminal provenance drifted/);
  }
});

void test("the final allocation must remain the canonical PASS and no later attempt is accepted", () => {
  const drifted = fixture();
  drifted.context.attempts[8] = {
    ...at(drifted.context.attempts, 8),
    result: "BLOCKED",
  };
  assert.throws(
    () => build(drifted),
    /terminal provenance drifted|canonical PASS/,
  );

  const later = fixture();
  later.context.attempts.push({
    attempt: 10,
    allocation: "allocation-10",
    execution: "execution-10",
    roleGrant: `sha256:${"f".repeat(64)}`,
    candidate,
    evaluatorRevision: "002",
  });
  assert.throws(() => build(later), /incomplete or out of order/);
});

void test("canonical PASS public and private drift fail closed", () => {
  const publicDrift = fixture();
  const publicArtifact = at(publicDrift.context.attempts, 8).publicArtifact;
  if (!publicArtifact) throw new Error("public PASS fixture expected");
  publicDrift.context.attempts[8] = {
    ...at(publicDrift.context.attempts, 8),
    publicArtifact: {
      ...publicArtifact,
      identity: `sha256:${"1".repeat(64)}`,
    },
  };
  assert.throws(() => build(publicDrift), /terminal provenance drifted/);

  const privateDrift = fixture();
  privateDrift.context.attempts[8] = {
    ...at(privateDrift.context.attempts, 8),
    durablePrivateIdentity: `sha256:${"2".repeat(64)}`,
  };
  assert.throws(() => build(privateDrift), /BOUND evidence drifted/);
});

void test("an existing promotion blocks recovery", () => {
  const f = fixture();
  f.context.promotionRecorded = true;
  assert.throws(() => build(f), /already has a recorded promotion/);
});
