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
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import test, { type TestContext } from "node:test";

import {
  CandidateSubjectRelay,
  inspectCandidateMethodology,
  publishSubjectEvidence,
  reconstructCandidateEvaluator,
  resolveFrozenEvaluatorProcedure,
  runCandidateEvaluatorSubject,
  SubjectLifecycle,
  validateSubjectBundle,
  type CandidateComposition,
} from "../src/candidate-subject.ts";
import {
  createPreparedObservationRecord,
  preparedSubjectManifest,
  resolvePreparedObservation,
  sealPreparedObservationBundle,
  validatePreparedObservationRecord,
} from "../src/candidate-observation.ts";
import { locateContainment } from "../src/executors/containment.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import { GovernedHost } from "../src/kernel/host.ts";
import { appendLedger, canonical, identity } from "../src/kernel/ledger.ts";
import { authorityBasis } from "../src/kernel/resolver.ts";
import type { LedgerEvent } from "../src/kernel/model.ts";
import { buildMethodologyManifest } from "../src/methodology-evolution.ts";

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
    validatorSources: {},
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
    validatorSources: {},
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
    candidateValidatorSources: {},
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
        validatorSources: {},
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
        validatorSources: {},
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
        validatorSources: {},
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
        validatorSources: {},
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
        validatorSources: {},
        role: "implementation",
      }),
    /restricted to evaluator-verify/,
  );
});

void test("014i AC01/TR3a: reconstruction uses the committed-revision methodology builder", () => {
  const repository = process.cwd();
  const commit = git(repository, ["rev-parse", "HEAD"]);
  const inspected = inspectCandidateMethodology({ repository, commit });
  const built = buildMethodologyManifest(repository, commit);
  assert.equal(inspected.candidate, built.revision);
  assert.equal(inspected.methodology, built.manifest.id);
  assert.deepEqual(inspected.policy, built.manifest.policy.content);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(inspected.roles).map(([name, role]) => [
        name,
        {
          contract: role.contractIdentity,
          skill: role.skill.identity,
        },
      ]),
    ),
    Object.fromEntries(
      Object.entries(built.manifest.roles).map(([name, role]) => [
        name,
        {
          contract: role.contract.identity,
          skill: role.skill.identity,
        },
      ]),
    ),
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

void test("014g: full candidate export preserves Git-quoted Unicode paths", (t) => {
  const root = mkdtempSync(join(tmpdir(), "candidate-unicode-export-"));
  const output = mkdtempSync(join(tmpdir(), "candidate-unicode-output-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(output, { recursive: true, force: true });
  });
  cpSync(join(PACKAGE, "candidates", "contained"), root, { recursive: true });
  const unicodePath = "spikes/001-pty/Spike 1 — Bidirectional PTY Control.md";
  mkdirSync(join(root, "spikes", "001-pty"), { recursive: true });
  writeFileSync(join(root, unicodePath), "unicode path\n");
  git(root, ["init", "-q"]);
  git(root, ["config", "user.name", "Candidate Subject Test"]);
  git(root, ["config", "user.email", "candidate-subject@example.invalid"]);
  git(root, ["config", "core.quotePath", "true"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "fixture"]);
  const commit = git(root, ["rev-parse", "HEAD"]);
  const inspected = inspectCandidateMethodology({
    repository: root,
    commit,
    validatorSources: {},
  });
  const role = inspected.roles["evaluator-verify"];
  assert.ok(role);
  const located = locateContainment([root, output]);
  assert.ok(located.ok);
  const result = runCandidateEvaluatorSubject({
    candidateRepository: root,
    candidateCommit: commit,
    candidateValidatorSources: {},
    candidateMethodology: inspected.methodology,
    expectedSkillIdentity: role.skill.identity,
    expectedContractIdentity: role.contractIdentity,
    fixtureRoot: PACKAGE,
    fixtureTreeIdentity: FIXTURE_TREE,
    runnerBlobIdentity: RUNNER_BLOB,
    runtimeCommit: git(process.cwd(), ["rev-parse", "HEAD"]),
    bwrap: located.path,
    outputRoot: output,
    execution: "unicode-export",
  });
  assert.equal(result.record.status, "evidence-sealed");
  assert.equal(
    readFileSync(join(result.paths.repository, unicodePath), "utf8"),
    "unicode path\n",
  );
});

void test("014g C3 / 014j AC03-AC07: frozen procedures produce private, identity-bound prepared observations", (t) => {
  const root = mkdtempSync(join(tmpdir(), "frozen-procedure-"));
  const output = mkdtempSync(join(tmpdir(), "frozen-procedure-output-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(output, { recursive: true, force: true });
  });
  const procedurePath = ".hidden-test/e5.test.mjs";
  const manifestPath = ".hidden-test/manifest.json";
  const unrelatedPath = ".hidden-test/not-authorized.txt";
  mkdirSync(join(root, ".hidden-test"));
  mkdirSync(join(root, ".eval"));
  const procedureBytes = Buffer.from(
    `import assert from "node:assert/strict";\n` +
      `import { existsSync, readFileSync, writeFileSync } from "node:fs";\n` +
      `import test from "node:test";\n` +
      `test("frozen E5", () => {\n` +
      `  const topology = JSON.parse(readFileSync(process.env.HARNESS_HOST_TOPOLOGY_INPUT, "utf8"));\n` +
      `  const before = JSON.parse(readFileSync(process.env.HARNESS_HOST_BEFORE_INPUT, "utf8"));\n` +
      `  assert.notDeepEqual(topology.hostCreated, topology.subjectWritable);\n` +
      `  assert.ok(before["forbidden/harness-sentinel.txt"]);\n` +
      `  assert.equal(existsSync(process.env.HARNESS_FROZEN_PROCEDURE_ROOT + "/${unrelatedPath}"), false);\n` +
      `  writeFileSync(process.env.SUBJECT_PARENT + "/evaluation/frozen-e5.txt", "observed\\n");\n` +
      `});\n`,
  );
  const manifestBytes = Buffer.from(
    `${canonical({
      schemaVersion: 1,
      cases: [{ id: "E5", tests: [procedurePath], support: [] }],
    })}\n`,
  );
  writeFileSync(join(root, procedurePath), procedureBytes);
  writeFileSync(join(root, manifestPath), manifestBytes);
  const unrelatedBytes = Buffer.from("not for E5\n");
  writeFileSync(join(root, unrelatedPath), unrelatedBytes);
  const artifacts = {
    [manifestPath]: identity(manifestBytes),
    [procedurePath]: identity(procedureBytes),
    [unrelatedPath]: identity(unrelatedBytes),
  };
  const inventoryIdentity = identity(
    JSON.stringify(Object.keys(artifacts).sort()),
  );
  const freezeBytes = Buffer.from(
    `${canonical({
      schemaVersion: 1,
      evaluatorRevision: "003",
      artifacts,
    })}\n`,
  );
  writeFileSync(join(root, ".eval", "freeze.json"), freezeBytes);
  const reference = {
    evaluatorRevision: "003",
    evaluatorRevisionIdentity: identity(freezeBytes),
    privateInventoryIdentity: inventoryIdentity,
    procedure: "E5",
  };
  const resolved = resolveFrozenEvaluatorProcedure(root, reference);
  assert.equal(resolved.tests[0], procedurePath);
  assert.equal(resolved.materials[0]?.identity, identity(procedureBytes));
  assert.throws(
    () =>
      resolveFrozenEvaluatorProcedure(root, {
        ...reference,
        evaluatorRevisionIdentity: `sha256:${"0".repeat(64)}`,
      }),
    /revision identity mismatch/,
  );
  assert.throws(
    () =>
      resolveFrozenEvaluatorProcedure(root, {
        ...reference,
        privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
      }),
    /inventory identity mismatch/,
  );
  assert.throws(
    () =>
      resolveFrozenEvaluatorProcedure(root, {
        ...reference,
        procedure: "UNKNOWN",
      }),
    /unknown frozen procedure/,
  );
  assert.throws(
    () =>
      resolveFrozenEvaluatorProcedure(root, {
        ...reference,
        privatePath: root,
      } as typeof reference),
    /unsupported field privatePath/,
  );
  assert.throws(
    () =>
      resolveFrozenEvaluatorProcedure(root, {
        ...reference,
        contents: "secret",
      } as typeof reference),
    /unsupported field contents/,
  );

  const f = candidate(t, "contained");
  const located = locateContainment([f.root, root, output]);
  assert.ok(located.ok);
  const result = runCandidateEvaluatorSubject({
    candidateRepository: f.root,
    candidateCommit: f.commit,
    candidateProjectPrefix: f.prefix,
    candidateValidatorSources: {},
    candidateMethodology: f.methodology,
    expectedSkillIdentity: f.skill,
    expectedContractIdentity: f.contract,
    frozenProcedure: resolved,
    runtimeCommit: git(process.cwd(), ["rev-parse", "HEAD"]),
    bwrap: located.path,
    outputRoot: output,
    execution: "frozen-e5",
  });
  assert.equal(result.record.status, "evidence-sealed");
  const sealed = validateSubjectBundle(result.paths.evidence);
  assert.equal(sealed.frozenProcedure?.procedure, "E5");
  assert.equal(JSON.stringify(sealed).includes("not for E5"), false);
  assert.equal(
    sealed.hostInputs?.topology,
    identity(
      `${canonical({
        hostCreated: [
          "repository",
          "evaluation",
          "scratch",
          "forbidden",
          "procedure",
          "inputs",
        ],
        subjectVisible: ["repository", "evaluation", "procedure", "inputs"],
        subjectWritable: ["evaluation", "scratch"],
        hostObserved: ["before", "after"],
        evidenceVisible: false,
      })}\n`,
    ),
  );
  assert.equal(existsSync(join(result.paths.parent, "procedure")), false);
  assert.equal(
    readFileSync(join(result.paths.evaluation, "frozen-e5.txt"), "utf8"),
    "observed\n",
  );
  const omitted = join(output, "omitted-host-input-binding");
  cpSync(result.paths.evidence, omitted, { recursive: true });
  chmodSync(join(omitted, "manifest.json"), 0o644);
  const omittedManifest = JSON.parse(
    readFileSync(join(omitted, "manifest.json"), "utf8"),
  ) as Record<string, unknown>;
  delete omittedManifest.hostInputs;
  writeFileSync(
    join(omitted, "manifest.json"),
    `${canonical(omittedManifest)}\n`,
  );
  assert.throws(
    () => validateSubjectBundle(omitted),
    /host input binding is missing/,
  );

  const subject = result.manifest;
  assert.ok(subject);
  const bindings = {
    workflow: "synthetic-preparation",
    candidate: {
      commit: f.commit,
      methodology: f.methodology,
      skill: f.skill,
      contract: subject.composition.contractIdentity,
      contractSource: subject.composition.contract,
    },
    runtime: subject.runtimeCommit,
    evaluator: {
      revision: reference.evaluatorRevision,
      revisionIdentity: reference.evaluatorRevisionIdentity,
      privateInventoryIdentity: reference.privateInventoryIdentity,
      procedure: reference.procedure,
      procedureIdentity: resolved.procedureIdentity,
    },
  } as const;
  const staging = join(root, ".eval", "prepared-staging");
  const preparedSealed = sealPreparedObservationBundle(
    result.paths.evidence,
    staging,
    bindings,
  );
  const record = createPreparedObservationRecord({
    bindings,
    bundleManifestIdentity: preparedSealed.identity,
  });
  validatePreparedObservationRecord(record);
  const authoritative: LedgerEvent = {
    transition: "implementation-handoff",
    evidence: { commit: f.commit },
  };
  assert.equal(
    authorityBasis([
      authoritative,
      {
        transition: "kernel.prepared-observation",
        evidence: record as unknown as Record<string, unknown>,
      },
    ]),
    authorityBasis([authoritative]),
  );
  const destination = join(
    root,
    ".eval",
    "prepared-observations",
    record.observation,
    "bundle",
  );
  mkdirSync(join(destination, ".."), { recursive: true });
  renameSync(staging, destination);
  const prepared = resolvePreparedObservation(root, record);
  assert.equal(prepared.manifest.bindings.workflow, "synthetic-preparation");
  assert.equal(
    preparedSubjectManifest(prepared).hostInputs?.before,
    subject.hostInputs?.before,
  );
  const publicRecord = JSON.stringify(record);
  assert.equal(publicRecord.includes(procedureBytes.toString("utf8")), false);
  assert.equal(publicRecord.includes("frozen-e5.txt"), false);
  assert.equal(publicRecord.includes(root), false);

  const changedRecord = {
    ...record,
    candidate: { ...record.candidate, commit: "0".repeat(40) },
  };
  assert.throws(() => {
    validatePreparedObservationRecord(changedRecord);
  }, /identity mismatch/);
  chmodSync(join(destination, "manifest.json"), 0o644);
  writeFileSync(join(destination, "manifest.json"), "{}\n");
  assert.throws(
    () => resolvePreparedObservation(root, record),
    /bundle identity mismatch/,
  );
});

void test("014j AC02-AC07/TR2: root prepares an exact private observation and no weaker authority can", async (t) => {
  const parent = mkdtempSync(join(tmpdir(), "prepared-observation-host-"));
  const repository = join(parent, "candidate");
  const runtimeRoot = join(parent, "runtime");
  const privateRoot = join(parent, "private-evaluation");
  t.after(() => {
    rmSync(parent, { recursive: true, force: true });
  });
  cpSync(join(PACKAGE, "candidates", "contained"), repository, {
    recursive: true,
  });
  mkdirSync(join(repository, "src", "methodologies"), { recursive: true });
  cpSync(
    join(process.cwd(), "src", "methodologies", "harness-public.ts"),
    join(repository, "src", "methodologies", "harness-public.ts"),
  );
  mkdirSync(privateRoot);
  const workflow = "synthetic-preparation";
  const workflowRoot = join(repository, "spikes", workflow);
  mkdirSync(workflowRoot, { recursive: true });

  const configurationPath = join(repository, "harness.project.json");
  const configuration = JSON.parse(
    readFileSync(configurationPath, "utf8"),
  ) as Record<string, unknown> & {
    workspaces: Record<string, unknown>;
  };
  configuration.workspaces.evaluation = {
    id: "synthetic-evaluator-private",
    path: "../private-evaluation",
    mode: "read",
    exposure: "evaluator-private",
  };
  writeFileSync(
    configurationPath,
    `${JSON.stringify(configuration, null, 2)}\n`,
  );

  const procedurePath = ".hidden-test/prepared-observation.test.mjs";
  const procedureManifestPath = ".hidden-test/manifest.json";
  const unrelatedPath = ".hidden-test/unrelated-private.txt";
  mkdirSync(join(privateRoot, ".hidden-test"));
  mkdirSync(join(privateRoot, ".eval"));
  const procedureBytes = Buffer.from(
    `import assert from "node:assert/strict";\n` +
      `import { readFileSync, writeFileSync } from "node:fs";\n` +
      `import test from "node:test";\n` +
      `test("host inputs are visible but read-only", () => {\n` +
      `  const input = process.env.HARNESS_HOST_TOPOLOGY_INPUT;\n` +
      `  assert.ok(JSON.parse(readFileSync(input, "utf8")).hostCreated);\n` +
      `  assert.throws(() => writeFileSync(input, "replaced\\n"));\n` +
      `});\n`,
  );
  const procedureManifestBytes = Buffer.from(
    `${canonical({
      schemaVersion: 1,
      cases: [{ id: "E5", tests: [procedurePath], support: [] }],
    })}\n`,
  );
  const unrelatedBytes = Buffer.from("private sentinel must not escape\n");
  writeFileSync(join(privateRoot, procedurePath), procedureBytes);
  writeFileSync(
    join(privateRoot, procedureManifestPath),
    procedureManifestBytes,
  );
  writeFileSync(join(privateRoot, unrelatedPath), unrelatedBytes);
  const artifacts = {
    [procedureManifestPath]: identity(procedureManifestBytes),
    [procedurePath]: identity(procedureBytes),
    [unrelatedPath]: identity(unrelatedBytes),
  };
  const privateInventoryIdentity = identity(
    JSON.stringify(Object.keys(artifacts).sort()),
  );
  const freezeBytes = Buffer.from(
    `${canonical({
      schemaVersion: 1,
      evaluatorRevision: "001",
      artifacts,
    })}\n`,
  );
  writeFileSync(join(privateRoot, ".eval", "freeze.json"), freezeBytes);
  const evaluatorRevisionIdentity = identity(freezeBytes);
  const coverageBytes = Buffer.from(
    `${canonical({
      schemaVersion: 1,
      readiness: {
        evaluatorRevision: "001",
        evaluatorRevisionIdentity,
        privateInventoryIdentity,
      },
    })}\n`,
  );
  const coveragePath = join(workflowRoot, "coverage-map.json");
  writeFileSync(coveragePath, coverageBytes);

  git(repository, ["init", "-q"]);
  git(repository, ["config", "user.name", "Prepared observation test"]);
  git(repository, [
    "config",
    "user.email",
    "prepared-observation@example.invalid",
  ]);
  git(repository, ["add", "."]);
  git(repository, ["commit", "-qm", "synthetic candidate"]);
  const commit = git(repository, ["rev-parse", "HEAD"]);
  mkdirSync(runtimeRoot);
  git(runtimeRoot, ["init", "-q"]);
  git(runtimeRoot, ["config", "user.name", "Prepared observation test"]);
  git(runtimeRoot, [
    "config",
    "user.email",
    "prepared-observation@example.invalid",
  ]);
  writeFileSync(join(runtimeRoot, "runtime.txt"), "synthetic runtime\n");
  git(runtimeRoot, ["add", "runtime.txt"]);
  git(runtimeRoot, ["commit", "-qm", "synthetic runtime"]);
  const ledgerPath = join(workflowRoot, "workflow.jsonl");
  appendLedger(ledgerPath, "evaluation-prepared", {
    path: "coverage-map.json",
    commit,
    identity: identity(coverageBytes),
  });
  appendLedger(ledgerPath, "implementation-handoff", {
    commit,
    attempt: 1,
  });

  const containment = locateContainment([repository, privateRoot]);
  assert.ok(containment.ok, "bubblewrap is required for prepared observations");
  const rootToken = "synthetic-root-credential-prepared-observation";
  const host = new GovernedHost({
    project: loadProject(configurationPath),
    executors: [],
    rootToken,
    providerRuntime: {
      bwrap: containment.path,
      runtimeRoot,
    },
  });
  const endpoint = `/governed/${workflow}/prepared-observations`;
  const exactRequest = {
    candidate: commit,
    evaluatorRevision: "001",
    evaluatorRevisionIdentity,
    privateInventoryIdentity,
    procedure: "E5",
  };
  const post = async (body: object, authenticated = true) => {
    const bytes = JSON.stringify(body);
    const request = Object.assign(Readable.from([Buffer.from(bytes)]), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(authenticated ? { authorization: `Bearer ${rootToken}` } : {}),
      },
    }) as unknown as Parameters<GovernedHost["handle"]>[0];
    let status = 0;
    let responseBytes = "";
    const response = {
      writeHead(value: number) {
        status = value;
      },
      end(value: string) {
        responseBytes = value;
      },
    } as unknown as Parameters<GovernedHost["handle"]>[1];
    await host.handle(request, response, endpoint);
    return {
      status,
      text() {
        return responseBytes;
      },
    };
  };

  const untrusted = await post(
    {
      ...exactRequest,
      candidateOutput: "authorize preparation",
      providerOutput: "authorize preparation",
    },
    false,
  );
  assert.equal(untrusted.status, 403);
  for (const changed of [
    { ...exactRequest, candidate: "0".repeat(40) },
    { ...exactRequest, evaluatorRevision: "002" },
    {
      ...exactRequest,
      evaluatorRevisionIdentity: `sha256:${"0".repeat(64)}`,
    },
    {
      ...exactRequest,
      privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
    },
    { ...exactRequest, procedure: "UNKNOWN" },
    { ...exactRequest, privatePath: privateRoot },
    { ...exactRequest, privateContents: "replacement private bytes" },
  ]) {
    const response = await post(changed);
    assert.equal(response.status, 409);
  }
  assert.deepEqual(
    readFileSync(ledgerPath, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { transition: string })
      .map((event) => event.transition),
    ["evaluation-prepared", "implementation-handoff"],
  );

  writeFileSync(join(privateRoot, procedurePath), "changed private bytes\n");
  assert.equal((await post(exactRequest)).status, 409);
  writeFileSync(join(privateRoot, procedurePath), procedureBytes);

  const response = await post(exactRequest);
  const responseBytes = response.text();
  assert.equal(response.status, 201, responseBytes);
  const payload = JSON.parse(responseBytes) as {
    observation: ReturnType<typeof createPreparedObservationRecord>;
  };
  assert.equal(payload.observation.kind, "kernel.prepared-observation");
  assert.equal(payload.observation.state, "sealed");
  const resolved = resolvePreparedObservation(privateRoot, payload.observation);
  const subject = preparedSubjectManifest(resolved);
  assert.equal(subject.frozenProcedure?.procedure, "E5");
  assert.match(
    readFileSync(join(resolved.root, "subject", "stdout.bin"), "utf8"),
    /# pass 1/,
  );

  const publicLedger = readFileSync(ledgerPath, "utf8");
  for (const publicBytes of [responseBytes, publicLedger]) {
    assert.equal(publicBytes.includes(unrelatedBytes.toString("utf8")), false);
    assert.equal(publicBytes.includes(unrelatedPath), false);
    assert.equal(publicBytes.includes(procedureBytes.toString("utf8")), false);
    assert.equal(publicBytes.includes(privateRoot), false);
  }
  const transitions = publicLedger
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as { transition: string })
    .map((event) => event.transition);
  assert.deepEqual(transitions, [
    "evaluation-prepared",
    "implementation-handoff",
    "kernel.prepared-observation",
  ]);
  assert.equal(
    transitions.some((transition) =>
      [
        "verification-finalized",
        "promotion-recorded",
        "human-accepted",
      ].includes(transition),
    ),
    false,
  );
  assert.equal(existsSync(join(workflowRoot, "evaluation")), false);
});
