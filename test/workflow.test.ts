import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const spike = `spikes/999-workflow-test-${String(process.pid)}`;
const spikePath = join(repositoryRoot, spike);

function run(args: string[], environment: NodeJS.ProcessEnv = process.env) {
  const cleanEnvironment = { ...environment };
  delete cleanEnvironment.NODE_TEST_CONTEXT;
  return spawnSync("node", ["tools/workflow.ts", ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: cleanEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function git(args: string[], input?: string): string {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    input,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Harness test",
      GIT_AUTHOR_EMAIL: "harness-test@example.invalid",
      GIT_COMMITTER_NAME: "Harness test",
      GIT_COMMITTER_EMAIL: "harness-test@example.invalid",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function provenanceCommit(
  files: Record<string, string>,
  fixture: string,
): {
  commit: string;
  identities: Record<string, string>;
} {
  const identities: Record<string, string> = {};
  const entries = Object.entries(files).map(([name, contents]) => {
    identities[name] =
      `sha256:${createHash("sha256").update(contents).digest("hex")}`;
    return `100644 blob ${git(["hash-object", "-w", "--stdin"], contents)}\t${name}`;
  });
  const leaf = git(["mktree"], `${entries.join("\n")}\n`);
  const spikeDirectory = fixture.split("/")[1];
  assert.ok(spikeDirectory);
  const spikes = git(["mktree"], `040000 tree ${leaf}\t${spikeDirectory}\n`);
  const root = git(["mktree"], `040000 tree ${spikes}\tspikes\n`);
  return {
    commit: git(["commit-tree", root, "-m", "workflow fixture"]),
    identities,
  };
}

type CriterionOverrides = Record<string, unknown>;

function criterion(
  id: string,
  overrides: CriterionOverrides = {},
): Record<string, unknown> {
  return {
    id,
    frozenAuthority: `spike.md ${id}`,
    mode: "PUBLIC_REGRESSION",
    required: true,
    procedures: ["E1"],
    sufficiency: `${id} is established by procedure E1.`,
    ...overrides,
  };
}

function coverageMap(
  criteria: Array<Record<string, unknown>>,
  readiness: Record<string, unknown> | null = {
    evaluatorRevision: "001",
    privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
    validatorResultBinding: `sha256:${"1".repeat(64)}`,
    integrityValidation: "PASS",
  },
): string {
  const map: Record<string, unknown> = { criteria };
  if (readiness !== null) map.readiness = readiness;
  return `${JSON.stringify(map, null, 2)}\n`;
}

function authorityFixture(
  suffix: string,
  files: Record<string, string>,
): {
  fixture: string;
  path: string;
  provenance: ReturnType<typeof provenanceCommit>;
  evidence: (name: string) => object;
  record: (transition: string, data: object) => ReturnType<typeof run>;
} {
  const fixture = `spikes/998a-authority-fixture-${String(process.pid)}${suffix}`;
  const path = join(repositoryRoot, fixture);
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(path, name), contents);
  }
  const provenance = provenanceCommit(files, fixture);
  const evidence = (name: string) => ({
    path: name,
    identity: provenance.identities[name],
    commit: provenance.commit,
  });
  const record = (transition: string, data: object) =>
    run(["authority", "record", fixture, transition, JSON.stringify(data)]);
  return { fixture, path, provenance, evidence, record };
}

function complete(phase: string): void {
  assert.equal(run(["dispatch", phase, spike]).status, 0);
  assert.equal(run(["record", phase, spike, "complete"]).status, 0);
}

void test("workflow runner independently numbers verification attempts", (t) => {
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });

  assert.equal(run(["init", spike]).status, 0);
  const before = readFileSync(
    join(spikePath, ".workflow", "state.json"),
    "utf8",
  );
  const skipped = run(["dispatch", "implementation", spike]);
  assert.notEqual(skipped.status, 0);
  assert.equal(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
    before,
  );

  complete("brief-readiness");
  complete("design-map");
  complete("evaluator-prepare");
  complete("implementation");
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  assert.equal(run(["record", "evaluator-verify", spike, "failed"]).status, 0);
  assert.equal(run(["dispatch", "implementation", spike]).status, 0);
  assert.equal(run(["record", "implementation", spike, "complete"]).status, 0);
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);

  const duplicate = run(["record", "implementation", spike, "complete"]);
  assert.notEqual(duplicate.status, 0);
  assert.notEqual(run(["dispatch", "not-a-phase", spike]).status, 0);
  assert.notEqual(run(["dispatch", "evaluator-prepare", spike]).status, 0);
  const state = JSON.parse(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
  ) as {
    records: Array<{ phase: string; attempt: number }>;
  };
  assert.ok(
    state.records.some(
      (record) => record.phase === "implementation" && record.attempt === 2,
    ),
  );
  const verifies = state.records.filter(
    (record) => record.phase === "evaluator-verify",
  );
  assert.ok(verifies.some((record) => record.attempt === 1));
  assert.ok(verifies.some((record) => record.attempt === 2));
});

void test("blocked verification retries the unchanged implementation", (t) => {
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });
  assert.equal(run(["init", spike]).status, 0);
  complete("brief-readiness");
  complete("design-map");
  complete("evaluator-prepare");
  complete("implementation");
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  assert.equal(run(["record", "evaluator-verify", spike, "blocked"]).status, 0);
  assert.equal(run(["dispatch", "evaluator-verify", spike]).status, 0);
  const state = JSON.parse(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
  ) as {
    records: Array<{
      event: string;
      phase: string;
      attempt: number;
      implementationAttempt?: number;
    }>;
  };
  assert.deepEqual(
    state.records
      .filter(
        (record) =>
          record.phase === "evaluator-verify" && record.event === "dispatch",
      )
      .map((record) => [record.attempt, record.implementationAttempt]),
    [
      [1, 1],
      [2, 1],
    ],
  );
});

void test("execute against an absent host fails and records no worker", (t) => {
  mkdirSync(spikePath, { recursive: true });
  t.after(() => {
    rmSync(spikePath, { recursive: true, force: true });
  });

  assert.equal(run(["init", spike]).status, 0);
  const before = readFileSync(
    join(spikePath, ".workflow", "state.json"),
    "utf8",
  );
  const dispatched = run(["dispatch", "brief-readiness", spike, "--execute"], {
    ...process.env,
    HARNESS_HOST_URL: "http://127.0.0.1:1",
  });
  assert.notEqual(dispatched.status, 0);
  assert.match(dispatched.stderr, /no Harness host reachable/);
  assert.equal(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
    before,
  );
});

void test("authority accepts valid repository-relative provenance", () => {
  const path = "spikes/010-workflow-authority/spike.md";
  const commit = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(commit.status, 0, commit.stderr);
  const evidence = JSON.stringify({
    path: "spike.md",
    identity: `sha256:${createHash("sha256")
      .update(readFileSync(join(repositoryRoot, path)))
      .digest("hex")}`,
    commit: commit.stdout.trim(),
  });
  const result = run([
    "authority",
    "validate",
    "spikes/010-workflow-authority",
    "brief-frozen",
    evidence,
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    allowed: true,
    recorded: false,
  });
});

void test("authority recognizes successor spike identifiers and exposes coverage state", () => {
  const result = run([
    "authority",
    "status",
    "spikes/010a-evaluation-coverage-human-rejection-recovery",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(result.stdout) as {
    history: Array<{ transition: string }>;
    humanDecision: string;
    technicalVerification: string;
  };
  assert.deepEqual(
    status.history.slice(0, 3).map((event) => event.transition),
    ["brief-frozen", "design-map-frozen", "evaluation-prepared"],
  );
  assert.equal(status.technicalVerification, "NOT_PASSED");
  assert.equal(status.humanDecision, "NOT_READY");
});

void test("authority preserves a complete PASS through human rejection", (t) => {
  const fixture = `spikes/998a-authority-fixture-${String(process.pid)}`;
  const path = join(repositoryRoot, fixture);
  const coverage = coverageMap([
    criterion("AC01"),
    criterion("AC02", { mode: "MANUAL_PUBLIC_EVIDENCE" }),
  ]);
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverage,
    "acceptance.md": "rejected\n",
  };
  mkdirSync(path, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(path, name), contents);
  }
  t.after(() => {
    rmSync(path, { recursive: true, force: true });
  });
  const provenance = provenanceCommit(files, fixture);
  const evidence = (name: string) => ({
    path: name,
    identity: provenance.identities[name],
    commit: provenance.commit,
  });
  const record = (transition: string, data: object) => {
    const result = run([
      "authority",
      "record",
      fixture,
      transition,
      JSON.stringify(data),
    ]);
    assert.equal(result.status, 0, result.stderr);
  };
  record("brief-frozen", evidence("spike.md"));
  record("design-map-frozen", evidence("design-map.md"));
  record("evaluation-prepared", evidence("coverage-map.json"));
  record("implementation-handoff", { commit: provenance.commit, attempt: 1 });
  record("verification-allocated", {
    commit: provenance.commit,
    implementationAttempt: 1,
    attempt: 1,
    evaluatorRevision: "001",
  });
  const beforeMissingResult = readFileSync(
    join(path, "workflow.jsonl"),
    "utf8",
  );
  const incompletePass = run([
    "authority",
    "record",
    fixture,
    "verification-finalized",
    JSON.stringify({
      attempt: 1,
      result: "PASS",
      coverageResults: { AC01: "SATISFIED" },
    }),
  ]);
  assert.notEqual(incompletePass.status, 0);
  assert.equal(
    readFileSync(join(path, "workflow.jsonl"), "utf8"),
    beforeMissingResult,
  );
  const results = { AC01: "SATISFIED", AC02: "SATISFIED" };
  record("verification-finalized", {
    attempt: 1,
    result: "PASS",
    coverageResults: results,
  });
  record("promotion-recorded", {});
  record("as-built-recorded", {});
  const before = readFileSync(join(path, "workflow.jsonl"), "utf8");
  record("human-rejected", {
    ...evidence("acceptance.md"),
    classification: "EVALUATOR_COVERAGE_DEFECT",
  });
  const status = JSON.parse(run(["authority", "status", fixture]).stdout) as {
    technicalVerification: string;
    humanDecision: string;
    successorPermitted: boolean;
  };
  assert.equal(status.technicalVerification, "PASS");
  assert.equal(status.humanDecision, "REJECTED");
  assert.equal(status.successorPermitted, true);
  assert.ok(
    readFileSync(join(path, "workflow.jsonl"), "utf8").startsWith(before),
  );
  assert.notEqual(
    run(["authority", "record", fixture, "outcome-recorded", "{} "]).status,
    0,
  );
  assert.notEqual(
    run([
      "authority",
      "record",
      fixture,
      "human-accepted",
      JSON.stringify(evidence("acceptance.md")),
    ]).status,
    0,
  );
  assert.notEqual(
    run([
      "authority",
      "record",
      fixture,
      "successor-linked",
      JSON.stringify({
        predecessor: fixture,
        predecessorEvidence: evidence("acceptance.md"),
      }),
    ]).status,
    0,
  );
});

function authorityHistory(
  fixture: ReturnType<typeof authorityFixture>,
): string {
  const path = join(fixture.path, "workflow.jsonl");
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function attemptPrepared(fixture: ReturnType<typeof authorityFixture>): {
  result: ReturnType<typeof run>;
  historyBefore: string;
  historyAfter: string;
} {
  assert.equal(
    fixture.record("brief-frozen", fixture.evidence("spike.md")).status,
    0,
  );
  assert.equal(
    fixture.record("design-map-frozen", fixture.evidence("design-map.md"))
      .status,
    0,
  );
  const historyBefore = authorityHistory(fixture);
  const result = fixture.record(
    "evaluation-prepared",
    fixture.evidence("coverage-map.json"),
  );
  return { result, historyBefore, historyAfter: authorityHistory(fixture) };
}

void test("a draft without a passing readiness attestation cannot reach a prepared state", (t) => {
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverageMap([criterion("AC01"), criterion("AC02")], {
      evaluatorRevision: "001",
      privateInventoryIdentity: `sha256:${"a".repeat(64)}`,
      validatorResultBinding: `sha256:${"b".repeat(64)}`,
      integrityValidation: "FAIL",
    }),
  };
  const f = authorityFixture("-e2", files);
  t.after(() => {
    rmSync(f.path, { recursive: true, force: true });
  });

  const { result, historyBefore, historyAfter } = attemptPrepared(f);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /readiness attestation/);
  assert.equal(historyAfter, historyBefore);

  const noAllocation = f.record("verification-allocated", {
    commit: f.provenance.commit,
    implementationAttempt: 1,
    attempt: 1,
    evaluatorRevision: "001",
  });
  assert.notEqual(noAllocation.status, 0);
  assert.equal(authorityHistory(f), historyBefore);
});

void test("a readiness attestation requires an opaque validator-result binding", (t) => {
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverageMap([criterion("AC01")], {
      evaluatorRevision: "001",
      privateInventoryIdentity: `sha256:${"a".repeat(64)}`,
      integrityValidation: "PASS",
    }),
  };
  const f = authorityFixture("-e2-binding", files);
  t.after(() => {
    rmSync(f.path, { recursive: true, force: true });
  });

  const { result, historyBefore, historyAfter } = attemptPrepared(f);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /validatorResultBinding/);
  assert.equal(historyAfter, historyBefore);
});

void test("a criterion-complete map with an incomplete evidence reference is rejected before allocation", (t) => {
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverageMap([
      criterion("AC01"),
      criterion("AC02", { procedures: [] }),
    ]),
  };
  const f = authorityFixture("-e3", files);
  t.after(() => {
    rmSync(f.path, { recursive: true, force: true });
  });

  const { result, historyBefore, historyAfter } = attemptPrepared(f);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AC02 is missing evidence procedure/);
  assert.equal(historyAfter, historyBefore);

  assert.notEqual(
    f.record("verification-allocated", {
      commit: f.provenance.commit,
      implementationAttempt: 1,
      attempt: 1,
      evaluatorRevision: "001",
    }).status,
    0,
  );
  assert.equal(authorityHistory(f), historyBefore);
});

void test("shared evidence supports multiple criterion records when each keeps its own traceability", (t) => {
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverageMap([
      criterion("AC01", {
        mode: "STATIC_INSPECTION",
        procedures: ["S1"],
        sufficiency: "AC01 is a textual property checked by inspection S1.",
      }),
      criterion("AC02", {
        mode: "STATIC_INSPECTION",
        procedures: ["S1"],
        sufficiency:
          "AC02 relies on the same S1 inspection for a distinct clause.",
      }),
    ]),
  };
  const f = authorityFixture("-e4", files);
  t.after(() => {
    rmSync(f.path, { recursive: true, force: true });
  });

  const { result } = attemptPrepared(f);
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    readFileSync(join(f.path, "workflow.jsonl"), "utf8"),
    /"transition":"evaluation-prepared"/,
  );
});

void test("a non-executable evidence procedure participates in a valid prepared evaluator", (t) => {
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverageMap([
      criterion("AC01", {
        mode: "STATIC_INSPECTION",
        procedures: ["S1"],
        sufficiency:
          "AC01 is established by inspecting the frozen contract text (S1).",
      }),
      criterion("AC02", {
        mode: "PROVENANCE_INSPECTION",
        procedures: ["P1"],
        sufficiency:
          "AC02 is a git-provenance property verified by inspection P1.",
      }),
    ]),
  };
  const f = authorityFixture("-e5", files);
  t.after(() => {
    rmSync(f.path, { recursive: true, force: true });
  });

  const { result } = attemptPrepared(f);
  assert.equal(result.status, 0, result.stderr);

  const status = JSON.parse(run(["authority", "status", f.fixture]).stdout) as {
    history: Array<{ transition: string }>;
  };
  assert.deepEqual(
    status.history.map((event) => event.transition),
    ["brief-frozen", "design-map-frozen", "evaluation-prepared"],
  );
});

void test("a post-allocation evaluator-integrity failure is forward-only and preserves identities", (t) => {
  const files = {
    "spike.md": "brief\n",
    "design-map.md": "map\n",
    "coverage-map.json": coverageMap([criterion("AC01"), criterion("AC02")]),
  };
  const f = authorityFixture("-e6", files);
  t.after(() => {
    rmSync(f.path, { recursive: true, force: true });
  });

  assert.equal(attemptPrepared(f).result.status, 0);
  assert.equal(
    f.record("implementation-handoff", {
      commit: f.provenance.commit,
      attempt: 1,
    }).status,
    0,
  );
  assert.equal(
    f.record("verification-allocated", {
      commit: f.provenance.commit,
      implementationAttempt: 1,
      attempt: 1,
      evaluatorRevision: "001",
    }).status,
    0,
  );

  const coverageResults = { AC01: "UNEVALUATED", AC02: "UNEVALUATED" };
  const finalized = f.record("verification-finalized", {
    attempt: 1,
    result: "BLOCKED",
    classification: "EVALUATOR_DEFECT",
    coverageResults,
  });
  assert.equal(finalized.status, 0, finalized.stderr);

  const status = JSON.parse(run(["authority", "status", f.fixture]).stdout) as {
    technicalVerification: string;
    promotionComplete: boolean;
    history: Array<{ transition: string; evidence: Record<string, unknown> }>;
  };
  assert.equal(status.technicalVerification, "NOT_PASSED");
  assert.equal(status.promotionComplete, false);

  const allocation = status.history.find(
    (event) => event.transition === "verification-allocated",
  );
  assert.ok(allocation);
  assert.equal(allocation.evidence.commit, f.provenance.commit);
  assert.equal(allocation.evidence.evaluatorRevision, "001");

  const handoff = status.history.find(
    (event) => event.transition === "implementation-handoff",
  );
  assert.ok(handoff);
  assert.equal(handoff.evidence.commit, f.provenance.commit);

  const result = status.history.find(
    (event) => event.transition === "verification-finalized",
  );
  assert.ok(result);
  assert.equal(result.evidence.classification, "EVALUATOR_DEFECT");
  assert.deepEqual(result.evidence.coverageResults, coverageResults);
  assert.ok(
    Object.values(
      result.evidence.coverageResults as Record<string, string>,
    ).every((value) => value === "UNEVALUATED"),
  );

  assert.notEqual(f.record("promotion-recorded", {}).status, 0);
});
