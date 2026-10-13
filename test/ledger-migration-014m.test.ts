import assert from "node:assert/strict";
import {
  existsSync,
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
  privateAttempts,
  validatePrivateAttemptFinalization,
} from "../src/evaluation-closeout.ts";
import {
  apply014mLedgerMigration,
  derive014mLedgerMigration,
  type LedgerMigrationBinding,
} from "../src/kernel/014m-ledger-migration.ts";
import { identity } from "../src/kernel/ledger.ts";
import type { LedgerEvent } from "../src/kernel/model.ts";

const CANDIDATE = "c".repeat(40);
const WORKFLOW = "014m-pre-semantic-implementation-correction";

// Synthetic evaluator data only: no live evaluator-private bytes are used.
function fixture(
  t: TestContext,
  options: { legacyPath?: (id: string) => string } = {},
) {
  const root = mkdtempSync(join(tmpdir(), "ledger-014m-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const put = (path: string, content: string): void => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  const freeze = (revision: string): string =>
    `${JSON.stringify({ evaluatorRevision: revision, artifacts: { "eval-spec.md": identity(`spec ${revision}\n`) } })}\n`;
  put(".eval/freeze.json", freeze("003"));
  put(".eval/revisions/001/freeze.json", freeze("001"));
  put(".eval/revisions/002/freeze.json", freeze("002"));
  const attempts = [
    ["012", "001"],
    ["013", "002"],
    ["014", "003"],
  ] as const;
  const events: LedgerEvent[] = [];
  const rows: Record<string, unknown>[] = [];
  const bound = attempts.map(([id, revision], index) => {
    const n = Number(id);
    const path =
      options.legacyPath?.(id) ?? `.eval/attempts/${id}/eval-result.md`;
    put(path, `result ${id}\n`);
    rows.push({
      attempt: n,
      cycle: "001",
      status: "BLOCKED",
      candidate: CANDIDATE,
      evaluatorRevision: revision,
      classification: "EVALUATOR_DEFECT",
      result: path,
    });
    const entry = {
      attempt: n,
      evaluatorRevision: revision,
      allocationEvent: `alloc-${id}`,
      execution: `exec-${id}`,
      roleGrant: `sha256:${String(index).repeat(64)}`,
      semanticResult: `sem-${id}`,
      finalizationEvent: `fin-${id}`,
      result: "BLOCKED",
    };
    events.push(
      {
        id: entry.allocationEvent,
        at: "t",
        transition: "verification-allocated",
        evidence: {
          execution: entry.execution,
          roleGrant: entry.roleGrant,
          commit: CANDIDATE,
          evaluatorRevision: revision,
          attempt: n,
        },
      },
      {
        id: `k-${id}`,
        at: "t",
        transition: "kernel.result",
        evidence: {
          id: entry.semanticResult,
          execution: entry.execution,
          methodology: { result: "BLOCKED" },
        },
      },
      {
        id: entry.finalizationEvent,
        at: "t",
        transition: "verification-finalized",
        evidence: {
          execution: entry.execution,
          commit: CANDIDATE,
          evaluatorRevision: revision,
          attempt: n,
          result: "BLOCKED",
        },
      },
    );
    return entry;
  });
  // Rows for attempts outside the bound set must never be carried forward.
  rows.unshift({ attempt: 1, status: "PASS" }, { attempt: 7, status: "?" });
  const legacy = `${JSON.stringify({ attempts: rows })}\n`;
  put(".eval/attempt-ledger.json", legacy);
  const binding: LedgerMigrationBinding = {
    workflow: WORKFLOW,
    legacyLedgerIdentity: identity(legacy),
    candidate: CANDIDATE,
    grantExecution: "exec-014",
    historyDirectory: ".eval/migrations/014m-attempt-ledger",
    attempts: bound,
  };
  const run = (override: Partial<LedgerMigrationBinding> = {}) =>
    derive014mLedgerMigration(
      root,
      WORKFLOW,
      events,
      readFileSync(join(root, ".eval/attempt-ledger.json")),
      { ...binding, ...override },
    );
  return { root, put, legacy, events, binding, run };
}

void test("014m migration yields canonical schema-v2 rows for attempts 012-014 only and preserves history", (t) => {
  const f = fixture(t);
  const derived = f.run();
  apply014mLedgerMigration(f.root, derived, f.binding);
  const active = readFileSync(join(f.root, ".eval/attempt-ledger.json"));
  const rows = privateAttempts(JSON.parse(active.toString("utf8")));
  assert.deepEqual(
    rows.map((row) => [row.attempt, row.status, row.evaluatorRevision]),
    [
      [12, "BLOCKED", "001"],
      [13, "BLOCKED", "002"],
      [14, "BLOCKED", "003"],
    ],
  );
  assert.equal(identity(active), derived.evidence.activeLedgerIdentity);
  assert.equal(
    readFileSync(
      join(f.root, f.binding.historyDirectory, "attempt-ledger.legacy.json"),
      "utf8",
    ),
    f.legacy,
  );
  assert.equal(
    rows[0]?.resultIdentity,
    identity(readFileSync(join(f.root, ".eval/attempts/012/eval-result.md"))),
  );
  assert.equal(
    rows[0].evaluatorRevisionIdentity,
    identity(readFileSync(join(f.root, ".eval/revisions/001/freeze.json"))),
  );
  assert.doesNotThrow(() => {
    validatePrivateAttemptFinalization(f.root, {
      attempt: 14,
      candidate: CANDIDATE,
      evaluatorRevision: "003",
      result: "BLOCKED",
    });
  });
});

void test("014m migration fails closed on identity, host-history and evidence drift", (t) => {
  const f = fixture(t);
  assert.throws(
    () => f.run({ legacyLedgerIdentity: `sha256:${"0".repeat(64)}` }),
    /ledger identity differs/,
  );
  const [first, ...rest] = f.binding.attempts;
  assert.ok(first);
  assert.throws(
    () => f.run({ attempts: [{ ...first, roleGrant: "x" }, ...rest] }),
    /allocation 12 differs: roleGrant/,
  );
  assert.throws(
    () => f.run({ attempts: [{ ...first, result: "FAIL" }, ...rest] }),
    /semantic result 12 differs/,
  );
  assert.throws(
    () => f.run({ candidate: "d".repeat(40) }),
    /allocation 12 differs: commit/,
  );
  f.put(".eval/attempts/013/eval-result.md", "x");
  assert.doesNotThrow(() => f.run());
  rmSync(join(f.root, ".eval/attempts/013/eval-result.md"));
  assert.throws(() => f.run(), /missing evidence/);
});

void test("014m migration refuses legacy rows that conflict with host history", (t) => {
  const f = fixture(t);
  const text = readFileSync(join(f.root, ".eval/attempt-ledger.json"), "utf8");
  const changed = text.replace(
    '"evaluatorRevision":"002"',
    '"evaluatorRevision":"001"',
  );
  f.put(".eval/attempt-ledger.json", changed);
  assert.throws(
    () => f.run({ legacyLedgerIdentity: identity(changed) }),
    /legacy row 13 conflicts/,
  );
});

void test("014m migration materializes a non-canonical result path without altering the original", (t) => {
  const f = fixture(t, {
    legacyPath: (id) => `.eval/attempts/${id}-r/eval-result.md`,
  });
  const derived = f.run();
  apply014mLedgerMigration(f.root, derived, f.binding);
  assert.equal(
    readFileSync(join(f.root, ".eval/attempts/012/eval-result.md"), "utf8"),
    "result 012\n",
  );
  assert.ok(existsSync(join(f.root, ".eval/attempts/012-r/eval-result.md")));
});
