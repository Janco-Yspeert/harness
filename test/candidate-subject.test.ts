import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";

import {
  CandidateSubjectRelay,
  inspectCandidateMethodology,
  publishSubjectEvidence,
  reconstructCandidateEvaluator,
  runCandidateEvaluatorSubject,
  SubjectLifecycle,
  validateSubjectBundle,
  type CandidateComposition,
} from "../src/candidate-subject.ts";
import { locateContainment } from "../src/executors/containment.ts";

const PACKAGE = join(
  process.cwd(),
  "spikes/014i-governed-candidate-evaluator-subject-execution/fixture-package",
);
const FIXTURE_TREE = "315593c0e9278f3df5b62e1806f5ea068144eac6";
const RUNNER_BLOB = "4319b31ac7f22376d5180010228e42036573bb46";

interface CandidateFixture {
  root: string;
  commit: string;
  prefix: string;
  methodology: string;
  skill: string;
  contract: string;
}

function git(root: string, args: readonly string[]): string {
  try {
    return execFileSync("git", [...args], {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
  } catch (error) {
    const completed = error as { status?: unknown; stdout?: unknown };
    if (completed.status === 0 && typeof completed.stdout === "string")
      return completed.stdout.trim();
    throw error;
  }
}

function candidate(
  _t: TestContext,
  name: "contained" | "over-authorized" | "missing-role" | "unrepresentable",
): CandidateFixture {
  const root = process.cwd();
  const prefix =
    name === "contained" || name === "over-authorized"
      ? `spikes/014i-governed-candidate-evaluator-subject-execution/fixture-package/candidates/${name}`
      : `test/support/candidate-subject/${name}`;
  const commit = git(root, ["rev-parse", "HEAD"]);
  const inspected = inspectCandidateMethodology({
    repository: root,
    commit,
    projectPrefix: prefix,
  });
  const role = inspected.roles["evaluator-verify"];
  return {
    root,
    commit,
    prefix,
    methodology: inspected.methodology,
    skill: role?.skill.identity ?? "sha256:missing",
    contract: role?.contractIdentity ?? "sha256:missing",
  };
}

function reconstruct(f: CandidateFixture): CandidateComposition {
  return reconstructCandidateEvaluator({
    repository: f.root,
    commit: f.commit,
    methodology: f.methodology,
    skillIdentity: f.skill,
    contractIdentity: f.contract,
    projectPrefix: f.prefix,
  });
}

function run(
  t: TestContext,
  name: "contained" | "over-authorized",
  extra: { captureMaximum?: number; placeholderExitCode?: number } = {},
) {
  const f = candidate(t, name);
  const located = locateContainment([f.root]);
  assert.ok(located.ok, "bubblewrap is required for candidate-subject tests");
  const output = mkdtempSync(
    join(tmpdir(), `candidate-subject-output-${name}-`),
  );
  t.after(() => {
    rmSync(output, { recursive: true, force: true });
  });
  return runCandidateEvaluatorSubject({
    candidateRepository: f.root,
    candidateCommit: f.commit,
    candidateProjectPrefix: f.prefix,
    candidateMethodology: f.methodology,
    expectedSkillIdentity: f.skill,
    expectedContractIdentity: f.contract,
    fixtureRoot: PACKAGE,
    fixtureTreeIdentity: FIXTURE_TREE,
    runnerBlobIdentity: RUNNER_BLOB,
    runtimeCommit: git(process.cwd(), ["rev-parse", "HEAD"]),
    bwrap: located.path,
    outputRoot: output,
    execution: `fixture-${name}`,
    ...extra,
  });
}

void test("014i AC01/TR3a: exact committed reconstruction is pinned despite working-tree drift", (t) => {
  const f = candidate(t, "contained");
  const exact = reconstruct(f);
  assert.equal(exact.role, "evaluator-verify");
  assert.equal(exact.workspaces[0]?.mode, "read");
  assert.equal(exact.workspaces[1]?.mode, "write");
  assert.deepEqual(exact.capabilities, [
    "repository-read",
    "local-computation",
    "git-inspect",
  ]);
  const drift = join(f.root, f.prefix, ".working-tree-drift");
  writeFileSync(drift, "uncommitted\n");
  t.after(() => {
    rmSync(drift, { force: true });
  });
  assert.equal(reconstruct(f).skill.identity, exact.skill.identity);
  assert.throws(
    () =>
      reconstructCandidateEvaluator({
        repository: f.root,
        commit: "HEAD",
        methodology: f.methodology,
        skillIdentity: f.skill,
        contractIdentity: f.contract,
        projectPrefix: f.prefix,
      }),
    /exact 40-hex/,
  );
  assert.throws(
    () =>
      reconstructCandidateEvaluator({
        repository: f.root,
        commit: f.commit,
        methodology: "sha256:wrong",
        skillIdentity: f.skill,
        contractIdentity: f.contract,
        projectPrefix: f.prefix,
      }),
    /methodology identity mismatch/,
  );
  assert.throws(
    () =>
      reconstructCandidateEvaluator({
        repository: f.root,
        commit: f.commit,
        methodology: f.methodology,
        skillIdentity: "sha256:wrong",
        contractIdentity: f.contract,
        projectPrefix: f.prefix,
      }),
    /skill identity mismatch/,
  );
  assert.throws(
    () =>
      reconstructCandidateEvaluator({
        repository: f.root,
        commit: f.commit,
        methodology: f.methodology,
        skillIdentity: f.skill,
        contractIdentity: "sha256:wrong",
        projectPrefix: f.prefix,
      }),
    /contract identity mismatch/,
  );
  assert.throws(
    () =>
      reconstructCandidateEvaluator({
        repository: f.root,
        commit: f.commit,
        methodology: f.methodology,
        skillIdentity: f.skill,
        contractIdentity: f.contract,
        projectPrefix: f.prefix,
        role: "implementation",
      }),
    /restricted to evaluator-verify/,
  );
});

void test("014i AC01/TR3a: missing roles and unrepresentable authority are rejected", (t) => {
  const missing = candidate(t, "missing-role");
  assert.throws(() => reconstruct(missing), /role is missing/);
  const excessive = candidate(t, "unrepresentable");
  assert.throws(() => reconstruct(excessive), /cannot be represented/);
});

void test("014i AC02/AC04/TR3c-d: the subject relay records results and confines every authority-bearing operation", (t) => {
  const composition = reconstruct(candidate(t, "contained"));
  const root = mkdtempSync(join(tmpdir(), "candidate-subject-relay-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const repository = join(root, "repository");
  const evaluation = join(root, "evaluation");
  mkdirSync(repository);
  mkdirSync(evaluation);
  const relay = new CandidateSubjectRelay(
    "relay",
    composition,
    { repository, evaluation },
    {},
  );
  const assignment = relay.handle("assignment", {}) as { authority: string };
  assert.equal(assignment.authority, "non-authoritative");
  assert.deepEqual(
    relay.handle("submitResult", {
      disposition: "succeeded",
      methodology: { result: "PASS" },
    }),
    {
      protocolVersion: 1,
      observation: { status: "recorded", authoritative: false },
    },
  );
  assert.throws(
    () =>
      relay.handle("submitResult", {
        disposition: "succeeded",
        methodology: { result: "FAIL" },
      }),
    /candidate constraints/,
  );
  const action = relay.handle("requestAction", {
    kind: "evidence",
    files: [{ destination: "verification-result.json", content: "fixture\n" }],
  }) as { action: { status: string } };
  assert.equal(action.action.status, "succeeded");
  assert.equal(
    readFileSync(join(repository, "verification-result.json"), "utf8"),
    "fixture\n",
  );
  const promotion = relay.handle("requestAction", {
    kind: "promotion",
    candidate: "candidate",
    evaluatorRevision: "001",
    attempt: 1,
    artifacts: [{ source: "a", destination: "b", identity: "sha256:x" }],
  }) as { action: { status: string } };
  assert.equal(promotion.action.status, "denied");
  const human = relay.handle("requestHuman", {
    kind: "root",
    question: "grant?",
  }) as { request: { status: string }; response: unknown };
  assert.equal(human.request.status, "unavailable");
  assert.equal(human.response, null);
  assert.deepEqual(
    relay.exchanges.map((entry) => entry.sequence),
    [1, 2, 3, 4, 5, 6],
  );
});

void test("014i AC03/AC05/AC07/TR2: contained and over-authorized candidates produce attributable sealed raw evidence", (t) => {
  const contained = run(t, "contained");
  const excessive = run(t, "over-authorized");
  assert.equal(contained.record.status, "evidence-sealed");
  assert.equal(excessive.record.status, "evidence-sealed");
  for (const result of [contained, excessive]) {
    const manifest = validateSubjectBundle(result.paths.evidence);
    const variant = result === contained ? "contained" : "over-authorized";
    const contractBytes = readFileSync(
      join(
        PACKAGE,
        "candidates",
        variant,
        "methodologies/synthetic/contracts/evaluator-verify.json",
      ),
    );
    assert.equal(manifest.authority, "non-authoritative");
    assert.equal(
      manifest.composition.contract,
      `sha256:${createHash("sha256").update(contractBytes).digest("hex")}`,
    );
    assert.equal(manifest.streams.stdout.closed, true);
    assert.equal(manifest.streams.stdout.truncated, false);
    assert.match(
      readFileSync(join(result.paths.evidence, "worker-tools.jsonl"), "utf8"),
      /assignment/,
    );
    assert.match(
      readFileSync(join(result.paths.evidence, "worker-tools.jsonl"), "utf8"),
      /submitResult/,
    );
    assert.equal(existsSync(join(result.paths.parent, "evidence")), false);
  }
  assert.equal(
    readFileSync(join(contained.paths.evidence, "stdout.bin"), "utf8"),
    "PROBE repository-write denied\nPROBE evaluation-write wrote\nPROBE forbidden-write denied\nPROBE forbidden-read denied\nPROBE-END\n",
  );
  assert.equal(
    readFileSync(join(excessive.paths.evidence, "stdout.bin"), "utf8"),
    "PROBE repository-write wrote\nPROBE evaluation-write wrote\nPROBE forbidden-write denied\nPROBE forbidden-read denied\nPROBE-END\n",
  );
  const containedObservation = readFileSync(
    join(contained.paths.evidence, "observations.json"),
    "utf8",
  );
  const excessiveObservation = readFileSync(
    join(excessive.paths.evidence, "observations.json"),
    "utf8",
  );
  assert.match(containedObservation, /probe-repository-write\.txt.*absent/);
  assert.match(excessiveObservation, /probe-repository-write\.txt.*present/);
  for (const observation of [containedObservation, excessiveObservation]) {
    const sentinel = [
      ...observation.matchAll(/harness-sentinel\.txt[^}]+identity[^}]+/g),
    ];
    assert.equal(sentinel.length, 2);
  }
});

void test("014i AC06/TR3f: sealing and read-only publication fail closed for changed, missing, extra and unsafe evidence", (t) => {
  const result = run(t, "contained");
  const copies: string[] = [];
  const copy = (name: string): string => {
    const target = mkdtempSync(join(tmpdir(), `candidate-subject-${name}-`));
    copies.push(target);
    cpSync(result.paths.evidence, target, { recursive: true });
    return target;
  };
  t.after(() => {
    for (const path of copies) rmSync(path, { recursive: true, force: true });
  });
  const changed = copy("changed");
  chmodSync(join(changed, "stdout.bin"), 0o644);
  writeFileSync(join(changed, "stdout.bin"), "changed\n");
  assert.throws(() => validateSubjectBundle(changed), /artifact changed/);
  const missing = copy("missing");
  rmSync(join(missing, "stderr.bin"));
  assert.throws(() => validateSubjectBundle(missing), /artifact missing/);
  const extra = copy("extra");
  writeFileSync(join(extra, "extra.bin"), "extra\n");
  assert.throws(() => validateSubjectBundle(extra), /unbound subject artifact/);
  const linked = copy("linked");
  symlinkSync("stdout.bin", join(linked, "link"));
  assert.throws(() => validateSubjectBundle(linked), /symlink/);
  const truncated = copy("truncated");
  const manifestPath = join(truncated, "manifest.json");
  chmodSync(manifestPath, 0o644);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    streams: { stdout: { truncated: boolean } };
  };
  manifest.streams.stdout.truncated = true;
  writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
  assert.throws(() => validateSubjectBundle(truncated), /stream is incomplete/);
  const unclosed = copy("unclosed");
  const unclosedManifestPath = join(unclosed, "manifest.json");
  chmodSync(unclosedManifestPath, 0o644);
  const unclosedManifest = JSON.parse(
    readFileSync(unclosedManifestPath, "utf8"),
  ) as { streams: { stderr: { closed: boolean } } };
  unclosedManifest.streams.stderr.closed = false;
  writeFileSync(unclosedManifestPath, `${JSON.stringify(unclosedManifest)}\n`);
  assert.throws(() => validateSubjectBundle(unclosed), /stream is incomplete/);
  const escaping = copy("escaping");
  const escapingManifestPath = join(escaping, "manifest.json");
  chmodSync(escapingManifestPath, 0o644);
  const escapingManifest = JSON.parse(
    readFileSync(escapingManifestPath, "utf8"),
  ) as { artifacts: Array<{ path: string }> };
  assert.ok(escapingManifest.artifacts[0]);
  escapingManifest.artifacts[0].path = "../outside.bin";
  writeFileSync(escapingManifestPath, `${JSON.stringify(escapingManifest)}\n`);
  assert.throws(() => validateSubjectBundle(escaping), /unsafe relative path/);
  const substituted = copy("substituted");
  chmodSync(join(substituted, "stdout.bin"), 0o644);
  writeFileSync(
    join(substituted, "stdout.bin"),
    readFileSync(join(substituted, "stderr.bin")),
  );
  assert.throws(() => validateSubjectBundle(substituted), /artifact changed/);
  const publishRoot = mkdtempSync(join(tmpdir(), "candidate-subject-publish-"));
  const destination = join(publishRoot, "published");
  t.after(() => {
    rmSync(publishRoot, { recursive: true, force: true });
  });
  publishSubjectEvidence(result.paths.evidence, destination);
  assert.deepEqual(
    readFileSync(join(destination, "manifest.json")),
    readFileSync(join(result.paths.evidence, "manifest.json")),
  );
});

void test("014i TR3e: lifecycle distinguishes infrastructure, candidate and evidence outcomes", (t) => {
  const composition = reconstruct(candidate(t, "contained"));
  const infrastructure = new SubjectLifecycle("infra", composition);
  infrastructure.infrastructureFailed("launch failed");
  assert.equal(infrastructure.record.status, "infrastructure-failed");
  const failed = new SubjectLifecycle("candidate", composition);
  failed.running();
  failed.completed(7, null);
  assert.equal(failed.record.status, "completed");
  assert.equal(failed.record.subjectOutcome, "failed");
  const incomplete = new SubjectLifecycle("evidence", composition);
  incomplete.running();
  incomplete.completed(0, null, {
    disposition: "succeeded",
    methodology: { result: "PASS" },
  });
  incomplete.evidenceIncomplete("truncated");
  assert.equal(incomplete.record.status, "evidence-incomplete");
  const nonzero = run(t, "contained", { placeholderExitCode: 9 });
  assert.equal(nonzero.record.status, "evidence-sealed");
  assert.equal(nonzero.record.subjectOutcome, "failed");
});

void test("014i TR3f: a truncated capture is retained but never sealed", (t) => {
  const result = run(t, "contained", { captureMaximum: 8 });
  assert.equal(result.record.status, "evidence-incomplete");
  assert.equal(result.manifest, undefined);
});
