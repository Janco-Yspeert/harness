import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import {
  ArchiveManifestError,
  buildArchiveManifest,
  MAX_PROMOTION_ARTIFACTS,
  PROMOTION_PLAN_DESTINATION,
  PROMOTION_PLAN_PATH,
  PROMOTION_PLAN_SCHEMA_VERSION,
} from "../tools/archive-manifest.ts";
import {
  MAX_ACTION_ARTIFACTS,
  parseWorkerRequest,
  WORKER_PROTOCOL_SCHEMAS,
} from "../src/executors/protocol.ts";

function identity(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

type Plan = Record<string, unknown> & {
  attempts: Array<Record<string, unknown>>;
  revisions: Array<Record<string, unknown>>;
  artifacts: Array<Record<string, unknown>>;
};

// A disposable private evaluator workspace with two attempts (FAIL under
// revision 001, PASS under revision 002) and a schema-valid eligible plan.
function workspace(t: TestContext): {
  root: string;
  plan: Plan;
  write: (plan?: unknown) => void;
} {
  const root = mkdtempSync(join(tmpdir(), "harness-archive-manifest-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const file = (path: string, content: string): string => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content);
    return identity(content);
  };
  const ledger = file(
    ".eval/attempt-ledger.json",
    `${JSON.stringify({
      schemaVersion: 2,
      attempts: [
        { id: "001", status: "FAIL" },
        { id: "002", status: "PASS" },
      ],
    })}\n`,
  );
  const first = file(".eval/attempts/001/eval-result.md", "fail\n");
  const second = file(".eval/attempts/002/eval-result.md", "pass\n");
  const inventory = {
    "freeze.json": file(".eval/revisions/001/freeze.json", "freeze\n"),
    "eval-spec.md": file(".eval/revisions/001/eval-spec.md", "spec\n"),
    ".hidden-test/case.test.ts": file(
      ".eval/revisions/001/.hidden-test/case.test.ts",
      "case\n",
    ),
  };
  const plan: Plan = {
    schemaVersion: PROMOTION_PLAN_SCHEMA_VERSION,
    kind: "evaluator-promotion-plan",
    decision: "ELIGIBLE",
    candidate: "a".repeat(40),
    evaluatorRevision: "002",
    attempt: 2,
    attempts: [
      { attempt: 1, evaluatorRevision: "001", result: "FAIL" },
      { attempt: 2, evaluatorRevision: "002", result: "PASS" },
    ],
    revisions: [
      { evaluatorRevision: "001", eligible: true },
      {
        evaluatorRevision: "002",
        eligible: false,
        reason: "revision keeps private mechanics",
      },
    ],
    artifacts: [
      {
        kind: "attempt-ledger",
        eligible: true,
        source: ".eval/attempt-ledger.json",
        destination: "attempt-ledger.json",
        identity: ledger,
      },
      {
        kind: "terminal-attempt",
        eligible: true,
        attempt: 1,
        source: ".eval/attempts/001/eval-result.md",
        destination: "attempts/001/eval-result.md",
        identity: first,
      },
      {
        kind: "terminal-attempt",
        eligible: true,
        attempt: 2,
        source: ".eval/attempts/002/eval-result.md",
        destination: "attempts/002/eval-result.md",
        identity: second,
      },
      {
        kind: "evaluator-revision",
        eligible: true,
        evaluatorRevision: "001",
        source: ".eval/revisions/001",
        destination: "revisions/001",
        inventory,
      },
    ],
  };
  const write = (value: unknown = plan): void => {
    writeFileSync(
      join(root, PROMOTION_PLAN_PATH),
      `${JSON.stringify(value, null, 2)}\n`,
    );
  };
  write();
  return { root, plan, write };
}

function refuses(root: string, pattern: RegExp): void {
  assert.throws(
    () => buildArchiveManifest(root),
    (error: unknown) =>
      error instanceof ArchiveManifestError && pattern.test(error.message),
  );
}

void test("014d C2: the real persisted plan expands to deterministic identity-checked mappings including the plan itself", (t) => {
  const w = workspace(t);
  const manifest = buildArchiveManifest(w.root);
  const planBytes = readFileSync(join(w.root, PROMOTION_PLAN_PATH));
  assert.equal(manifest.decisionIdentity, identity(planBytes));
  assert.equal(manifest.candidate, "a".repeat(40));
  assert.equal(manifest.evaluatorRevision, "002");
  assert.equal(manifest.attempt, 2);
  assert.deepEqual(
    manifest.artifacts.map((artifact) => artifact.destination),
    [
      PROMOTION_PLAN_DESTINATION,
      "attempt-ledger.json",
      "attempts/001/eval-result.md",
      "attempts/002/eval-result.md",
      "revisions/001/.hidden-test/case.test.ts",
      "revisions/001/eval-spec.md",
      "revisions/001/freeze.json",
    ],
  );
  for (const artifact of manifest.artifacts)
    assert.equal(
      artifact.identity,
      identity(readFileSync(join(w.root, artifact.source))),
    );
  assert.deepEqual(buildArchiveManifest(w.root), manifest);
});

void test("014d AC04/AC06: missing, unreadable, unsupported and ineligible plans never yield a manifest", (t) => {
  const w = workspace(t);
  unlinkSync(join(w.root, PROMOTION_PLAN_PATH));
  assert.throws(
    () => buildArchiveManifest(w.root),
    (error: unknown) =>
      error instanceof ArchiveManifestError &&
      error.message ===
        "missing recorded evaluator promotion eligibility decision: .eval/promotion-plan.json",
  );
  writeFileSync(join(w.root, PROMOTION_PLAN_PATH), "{not json");
  refuses(w.root, /not readable JSON/);
  w.write({ ...w.plan, schemaVersion: 1 });
  refuses(w.root, /unsupported evaluator promotion plan schemaVersion 1/);
  w.write({ ...w.plan, schemaVersion: 99 });
  refuses(w.root, /unsupported/);
  w.write({
    schemaVersion: PROMOTION_PLAN_SCHEMA_VERSION,
    kind: "evaluator-promotion-plan",
    decision: "INELIGIBLE",
    reason: "hidden mechanics must stay private",
  });
  refuses(w.root, /ineligible: hidden mechanics must stay private/);
  w.write({
    schemaVersion: PROMOTION_PLAN_SCHEMA_VERSION,
    kind: "evaluator-promotion-plan",
    decision: "INELIGIBLE",
  });
  refuses(w.root, /requires a reason/);
  rmSync(join(w.root, PROMOTION_PLAN_PATH));
  symlinkSync(
    join(w.root, ".eval/attempt-ledger.json"),
    join(w.root, PROMOTION_PLAN_PATH),
  );
  refuses(w.root, /symbolic link/);
});

void test("014d AC06: incomplete or inconsistent attempt history is refused", (t) => {
  const w = workspace(t);
  const cases: Array<[Plan, RegExp]> = [
    [{ ...w.plan, attempts: w.plan.attempts.slice(1) }, /complete attempt/],
    [
      {
        ...w.plan,
        attempts: [
          { attempt: 2, evaluatorRevision: "001", result: "FAIL" },
          { attempt: 1, evaluatorRevision: "002", result: "PASS" },
        ],
      },
      /incomplete or out of order/,
    ],
    [
      {
        ...w.plan,
        attempts: [
          w.plan.attempts[0] ?? {},
          { attempt: 2, evaluatorRevision: "002", result: "FAIL" },
        ],
      },
      /terminal attempt must be the passing attempt/,
    ],
    [
      {
        ...w.plan,
        artifacts: w.plan.artifacts.filter(
          (artifact) => artifact.attempt !== 1,
        ),
      },
      /terminal attempt history/,
    ],
    [
      {
        ...w.plan,
        artifacts: w.plan.artifacts.filter(
          (artifact) => artifact.kind !== "attempt-ledger",
        ),
      },
      /attempt ledger/,
    ],
    [{ ...w.plan, revisions: w.plan.revisions.slice(0, 1) }, /decision/],
  ];
  for (const [plan, pattern] of cases) {
    w.write(plan);
    refuses(w.root, pattern);
  }
  // The real attempt ledger must agree with the declared history.
  w.write();
  const ledgerBytes = `${JSON.stringify({
    schemaVersion: 2,
    attempts: [{ id: "002", status: "PASS" }],
  })}\n`;
  writeFileSync(join(w.root, ".eval/attempt-ledger.json"), ledgerBytes);
  w.write({
    ...w.plan,
    artifacts: w.plan.artifacts.map((artifact) =>
      artifact.kind === "attempt-ledger"
        ? { ...artifact, identity: identity(ledgerBytes) }
        : artifact,
    ),
  });
  refuses(w.root, /attempt ledger does not match/);
});

void test("014d AC06: partial, mutated, missing, symlinked and unsafe bundles are refused", (t) => {
  const w = workspace(t);
  const revision = w.plan.artifacts[3] as {
    inventory: Record<string, string>;
  };
  // Partial bundle: the inventory names a file that is not archived.
  w.write({
    ...w.plan,
    artifacts: [
      ...w.plan.artifacts.slice(0, 3),
      {
        ...revision,
        inventory: { ...revision.inventory, "extra.md": identity("x") },
      },
    ],
  });
  refuses(w.root, /partial or differs from its inventory/);
  // An eligible revision without its bundle.
  w.write({ ...w.plan, artifacts: w.plan.artifacts.slice(0, 3) });
  refuses(w.root, /complete bundle/);
  w.write();
  // Mutated after planning.
  writeFileSync(join(w.root, ".eval/revisions/001/eval-spec.md"), "edited\n");
  refuses(w.root, /differs from its frozen inventory/);
  writeFileSync(join(w.root, ".eval/revisions/001/eval-spec.md"), "spec\n");
  writeFileSync(join(w.root, ".eval/attempts/001/eval-result.md"), "edit\n");
  refuses(w.root, /changed after planning/);
  writeFileSync(join(w.root, ".eval/attempts/001/eval-result.md"), "fail\n");
  assert.ok(buildArchiveManifest(w.root));
  // Missing source.
  rmSync(join(w.root, ".eval/attempts/002/eval-result.md"));
  refuses(w.root, /source is missing/);
  writeFileSync(join(w.root, ".eval/attempts/002/eval-result.md"), "pass\n");
  // Symlinked file inside a revision bundle.
  symlinkSync("/etc/hostname", join(w.root, ".eval/revisions/001/link"));
  refuses(w.root, /symbolic link/);
  rmSync(join(w.root, ".eval/revisions/001/link"));
  // Unsafe or duplicate paths.
  const unsafe = (patch: Record<string, unknown>): Plan => ({
    ...w.plan,
    artifacts: [
      { ...w.plan.artifacts[0], ...patch },
      ...w.plan.artifacts.slice(1),
    ],
  });
  for (const [plan, pattern] of [
    [unsafe({ source: "../outside" }), /normalized relative path/],
    [unsafe({ destination: "/abs" }), /normalized relative path/],
    [unsafe({ destination: "attempts/001/eval-result.md" }), /unique/],
    [unsafe({ destination: "promotion.json" }), /reserved or duplicated/],
    [
      unsafe({ destination: PROMOTION_PLAN_DESTINATION }),
      /reserved or duplicated/,
    ],
  ] as const) {
    w.write(plan);
    refuses(w.root, pattern);
  }
});

void test("014d C4: an eligible manifest above the action bound B is refused, not split", (t) => {
  const w = workspace(t);
  const inventory: Record<string, string> = {};
  for (let index = 0; index < MAX_PROMOTION_ARTIFACTS; index += 1) {
    const name = `case-${String(index).padStart(3, "0")}.md`;
    writeFileSync(join(w.root, ".eval/revisions/001", name), `${name}\n`);
    inventory[name] = identity(`${name}\n`);
  }
  const revision = w.plan.artifacts[3] as {
    inventory: Record<string, string>;
  };
  w.write({
    ...w.plan,
    artifacts: [
      ...w.plan.artifacts.slice(0, 3),
      { ...revision, inventory: { ...revision.inventory, ...inventory } },
    ],
  });
  refuses(
    w.root,
    new RegExp(
      `above the ${String(MAX_PROMOTION_ARTIFACTS)}-artifact host action bound`,
    ),
  );
});

// C4 retention check: B stays as defined only while each representative
// complete archive fits within it. The deterministic representative is at
// least as large as the largest committed historical archive and has the
// attempt/revision shape of 013a (14 attempts, 2 revisions).
void test("014d C4: B is the one published bound and a representative complete archive fits within it", (t) => {
  // B is published by the worker schema and enforced by request parsing.
  const schema = WORKER_PROTOCOL_SCHEMAS.operations.requestAction.request
    .properties.artifacts as { maxItems: number };
  assert.equal(schema.maxItems, MAX_ACTION_ARTIFACTS);
  assert.equal(MAX_PROMOTION_ARTIFACTS, MAX_ACTION_ARTIFACTS);
  const request = (count: number) => ({
    kind: "promotion",
    candidate: "a".repeat(40),
    evaluatorRevision: "001",
    attempt: 1,
    artifacts: Array.from({ length: count }, (_, index) => ({
      source: `.eval/file-${String(index)}`,
      destination: `file-${String(index)}`,
      identity: identity(String(index)),
    })),
  });
  const accepted = parseWorkerRequest(
    "requestAction",
    request(MAX_ACTION_ARTIFACTS),
  ) as { artifacts: unknown[] };
  assert.equal(accepted.artifacts.length, MAX_ACTION_ARTIFACTS);
  assert.throws(() =>
    parseWorkerRequest("requestAction", request(MAX_ACTION_ARTIFACTS + 1)),
  );

  // Largest committed historical archive (files, including promotion.json).
  const committed: Record<string, number> = {};
  for (const path of execFileSync(
    "git",
    ["ls-files", "--", "spikes/*/evaluation/*"],
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean)) {
    const spike = path.split("/")[1] ?? "";
    committed[spike] = (committed[spike] ?? 0) + 1;
  }
  const largest = Math.max(...Object.values(committed));
  assert.ok(largest >= 38, "the historical 005 archive is committed");

  // 14 attempts under revisions 001 and 002; both revisions eligible.
  const root = mkdtempSync(join(tmpdir(), "harness-archive-representative-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const file = (path: string, content: string): string => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content);
    return identity(content);
  };
  const attempts = Array.from({ length: 14 }, (_, index) => ({
    attempt: index + 1,
    evaluatorRevision: index < 7 ? "001" : "002",
    result: index === 13 ? "PASS" : "FAIL",
  }));
  const ledger = file(
    ".eval/attempt-ledger.json",
    `${JSON.stringify({
      schemaVersion: 2,
      attempts: attempts.map((entry) => ({
        id: String(entry.attempt).padStart(3, "0"),
        status: entry.result,
      })),
    })}\n`,
  );
  const bundle = (revision: string) => {
    const inventory: Record<string, string> = {
      "freeze.json": file(`.eval/revisions/${revision}/freeze.json`, "{}\n"),
      "eval-spec.md": file(
        `.eval/revisions/${revision}/eval-spec.md`,
        "spec\n",
      ),
    };
    for (let index = 0; index < 9; index += 1) {
      const name = `.hidden-test/case-${String(index)}.test.ts`;
      inventory[name] = file(
        `.eval/revisions/${revision}/${name}`,
        `case ${revision} ${String(index)}\n`,
      );
    }
    return {
      kind: "evaluator-revision",
      eligible: true,
      evaluatorRevision: revision,
      source: `.eval/revisions/${revision}`,
      destination: `revisions/${revision}`,
      inventory,
    };
  };
  writeFileSync(
    join(root, PROMOTION_PLAN_PATH),
    `${JSON.stringify({
      schemaVersion: PROMOTION_PLAN_SCHEMA_VERSION,
      kind: "evaluator-promotion-plan",
      decision: "ELIGIBLE",
      candidate: "b".repeat(40),
      evaluatorRevision: "002",
      attempt: 14,
      attempts,
      revisions: [
        { evaluatorRevision: "001", eligible: true },
        { evaluatorRevision: "002", eligible: true },
      ],
      artifacts: [
        {
          kind: "attempt-ledger",
          eligible: true,
          source: ".eval/attempt-ledger.json",
          destination: "attempt-ledger.json",
          identity: ledger,
        },
        ...attempts.map((entry) => {
          const id = String(entry.attempt).padStart(3, "0");
          return {
            kind: "terminal-attempt",
            eligible: true,
            attempt: entry.attempt,
            source: `.eval/attempts/${id}/eval-result.md`,
            destination: `attempts/${id}/eval-result.md`,
            identity: file(
              `.eval/attempts/${id}/eval-result.md`,
              `attempt ${id} ${entry.result}\n`,
            ),
          };
        }),
        bundle("001"),
        bundle("002"),
      ],
    })}\n`,
  );
  const manifest = buildArchiveManifest(root);
  assert.ok(manifest.artifacts.length >= largest);
  assert.ok(manifest.artifacts.length <= MAX_ACTION_ARTIFACTS);
  // Recorded in the spike's evidence/promotion-bound.md.
  assert.equal(manifest.artifacts.length, 38);
});
