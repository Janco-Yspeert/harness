// 014k: successor evaluation, evidence closeout and adoption (deterministic,
// bootstrap-closed: no live provider, no authority introduced by the candidate).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
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
  createPreparedObservationRecord,
  resolvePreparedObservation,
  validatePreparedObservationRecord,
  type PreparedObservationBindings,
} from "../src/candidate-observation.ts";
import {
  archiveRecordIdentity,
  buildArchivePlan,
  classifyAttempts,
  closeoutPermitted,
  deriveHostArchive,
  evaluationFactIdentity,
  executeArchive,
  type EvaluationFact,
} from "../src/evaluation-closeout.ts";
import { identity } from "../src/kernel/ledger.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import { trustedBinding, trustedDefinition } from "../src/kernel/trust.ts";
import {
  bindFutureWorkflow,
  buildMethodologyManifest,
  candidateMethodology,
  promoteMethodology,
  readTrustedHistory,
  type TrustedMethodologyEvent,
} from "../src/methodology-evolution.ts";
import { harnessValidators } from "../src/methodologies/harness-public.ts";
import {
  fulfilObservationDeclaration,
  parseObservationDeclaration,
  declarationIdentity,
} from "../src/observation-declaration.ts";

const SHA = (digit: string): string => `sha256:${digit.repeat(64)}`;
const COMMIT = "a".repeat(40);

function scratch(t: TestContext): string {
  const directory = mkdtempSync(join(tmpdir(), "harness-014k-"));
  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function put(root: string, path: string, content: string): string {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return identity(content);
}

// ---- (a) future prepared-observation declaration --------------------------

const declaration = {
  schemaVersion: 1,
  kind: "prepared-observation-declaration",
  purpose: "candidate-verdict-archive-separation",
  candidate: COMMIT,
  evaluator: { revision: "001", revisionIdentity: SHA("b") },
  hostInputs: ["topology", "before"],
  consumer: "ac06.archive-separation",
};

function bindings(): PreparedObservationBindings {
  return {
    workflow: "w",
    candidate: {
      commit: COMMIT,
      methodology: SHA("c"),
      skill: SHA("d"),
      contract: SHA("e"),
      contractSource: "contract.json",
    },
    runtime: "f".repeat(40),
    evaluator: {
      revision: "001",
      revisionIdentity: SHA("b"),
      privateInventoryIdentity: SHA("1"),
      procedure: "candidate-verdict-archive-separation",
      procedureIdentity: SHA("2"),
    },
  };
}

void test("014k AC03/TR2a: the observation declaration is closed, canonical and authority-free", () => {
  const parsed = parseObservationDeclaration(declaration);
  assert.deepEqual(parsed.hostInputs, ["before", "topology"]);
  assert.equal(
    declarationIdentity(parsed),
    declarationIdentity(
      parseObservationDeclaration({
        ...declaration,
        hostInputs: ["before", "topology"],
      }),
    ),
    "canonical regardless of input order",
  );
  const rejected: Array<Record<string, unknown>> = [
    { ...declaration, authority: "root" },
    { ...declaration, path: "/etc/passwd" },
    { ...declaration, content: "inline bytes" },
    { ...declaration, purpose: "../../private/spec" },
    { ...declaration, purpose: "/abs/path" },
    { ...declaration, consumer: "inline\ncontent" },
    { ...declaration, hostInputs: ["/private/path"] },
    { ...declaration, hostInputs: [] },
    { ...declaration, hostInputs: ["before", "before"] },
    { ...declaration, candidate: "main" },
    { ...declaration, evaluator: { revision: "001" } },
    {
      ...declaration,
      evaluator: { ...declaration.evaluator, path: "/x" },
    },
    { ...declaration, observation: "not-an-identity" },
  ];
  for (const value of rejected)
    assert.throws(
      () => parseObservationDeclaration(value),
      /./,
      JSON.stringify(value),
    );
});

void test("014k AC03/AC05/TR2a,c: only a matching sealed observation fulfils a declaration; tampering is rejected", () => {
  const sealed = createPreparedObservationRecord({
    bindings: bindings(),
    bundleManifestIdentity: SHA("9"),
  });
  const fulfilled = fulfilObservationDeclaration(
    parseObservationDeclaration(declaration),
    sealed,
  );
  assert.equal(fulfilled.observation, sealed.observation);
  assert.throws(
    () => fulfilObservationDeclaration(fulfilled, sealed),
    /already fulfilled/,
  );
  const failed = createPreparedObservationRecord({
    bindings: bindings(),
    failure: "provider failed",
  });
  assert.throws(
    () =>
      fulfilObservationDeclaration(
        parseObservationDeclaration(declaration),
        failed,
      ),
    /only a sealed observation/,
  );
  for (const mismatch of [
    { ...declaration, candidate: "b".repeat(40) },
    { ...declaration, purpose: "another-procedure" },
    {
      ...declaration,
      evaluator: { revision: "002", revisionIdentity: SHA("b") },
    },
    {
      ...declaration,
      evaluator: { revision: "001", revisionIdentity: SHA("0") },
    },
  ])
    assert.throws(
      () =>
        fulfilObservationDeclaration(
          parseObservationDeclaration(mismatch),
          sealed,
        ),
      /does not match the declaration/,
    );
  // Trusted N recomputes the sealed record identity and rejects tampering.
  assert.throws(() => {
    validatePreparedObservationRecord({
      ...sealed,
      runtime: "0".repeat(40),
    });
  }, /identity mismatch/);
  assert.throws(
    () =>
      fulfilObservationDeclaration(parseObservationDeclaration(declaration), {
        ...sealed,
        candidate: { ...sealed.candidate, commit: "c".repeat(40) },
      }),
    /identity mismatch/,
  );
});

void test("014k AC05/TR2c: trusted N refuses an unresolvable or substituted sealed bundle", (t) => {
  const root = scratch(t);
  const sealed = createPreparedObservationRecord({
    bindings: bindings(),
    bundleManifestIdentity: SHA("9"),
  });
  assert.throws(() => resolvePreparedObservation(root, sealed));
  const bundle = join(
    root,
    `.eval/prepared-observations/${sealed.observation}/bundle`,
  );
  put(bundle, "manifest.json", "{}");
  assert.throws(
    () => resolvePreparedObservation(root, sealed),
    /bundle identity mismatch/,
  );
  const failed = createPreparedObservationRecord({
    bindings: bindings(),
    failure: "x",
  });
  assert.throws(
    () => resolvePreparedObservation(root, failed),
    /not sealed evidence/,
  );
});

// ---- (b)/(i) authority boundary and accepted-substrate regressions --------

void test("014k AC01/AC04/TR1,TR2b: candidates hold no adoption route; trusted history is unchanged at sequence 5", () => {
  const history = readTrustedHistory("methodologies/harness/trusted.jsonl");
  assert.equal(history.length, 5);
  assert.equal(
    history.at(-1)?.methodology,
    "sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb",
  );
  for (const path of [
    "src/executors/protocol.ts",
    "src/executors/worker-tools.ts",
    "src/candidate-subject.ts",
    "src/candidate-observation.ts",
    "src/observation-declaration.ts",
    "src/evaluation-closeout.ts",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(
      source,
      /promoteMethodology|appendTrustedEvent|trusted\.jsonl/,
      `${path} must not reach methodology adoption or trusted history`,
    );
  }
});

void test("014k AC02/AC15/TR2i: accepted 014h/014i/014j guarantees remain asserted", () => {
  const subject = readFileSync("test/candidate-subject.test.ts", "utf8");
  for (const name of [
    "014i AC01/TR3a: exact committed reconstruction is pinned despite working-tree drift",
    "014i AC02/AC04/TR3c-d: the subject relay records results and confines every authority-bearing operation",
    "014i AC06/TR3f: sealing and read-only publication fail closed",
    "014j AC02-AC07/TR2: root prepares an exact private observation and no weaker authority can",
  ])
    assert.ok(subject.includes(name), `missing accepted test: ${name}`);
  assert.ok(existsSync("test/host-fs-isolation.test.ts"));
});

// ---- (d)(e)(f) attempt lifecycle and host-owned archive --------------------

function evaluator(t: TestContext): {
  root: string;
  fact: EvaluationFact;
  freezeIdentity: string;
} {
  const root = scratch(t);
  const spec = put(root, ".eval/eval-spec.md", "spec\n");
  const hidden = put(root, ".eval/.hidden-test/a.test.ts", "test\n");
  const freezeIdentity = put(
    root,
    ".eval/freeze.json",
    JSON.stringify({
      evaluatorRevision: "001",
      artifacts: { "eval-spec.md": spec, ".hidden-test/a.test.ts": hidden },
    }),
  );
  const pass = put(root, ".eval/attempts/002/eval-result.md", "PASS\n");
  const attempts = classifyAttempts(root, [
    {
      execution: "e1",
      evaluatorRevision: "001",
      nonterminalReason: "provider launch failure",
    },
    {
      execution: "e2",
      evaluatorRevision: "001",
      result: "PASS",
      recorded: { path: ".eval/attempts/002/eval-result.md", identity: pass },
    },
  ]);
  return {
    root,
    freezeIdentity,
    fact: {
      schemaVersion: 1,
      kind: "evaluation-fact",
      result: "PASS",
      candidate: COMMIT,
      evaluatorRevision: "001",
      evaluatorRevisionIdentity: freezeIdentity,
      resultIdentity: pass,
      attempts,
    },
  };
}

void test("014k AC07/AC08/TR2e: NONTERMINAL needs no artifact; never-produced is not LOST; recorded-then-missing is", (t) => {
  const root = scratch(t);
  const id = put(root, ".eval/attempts/001/eval-result.md", "FAIL\n");
  const entries = classifyAttempts(root, [
    { execution: "e1", evaluatorRevision: "001" },
    {
      execution: "e2",
      evaluatorRevision: "001",
      result: "FAIL",
      recorded: { path: ".eval/attempts/001/eval-result.md", identity: id },
    },
    {
      execution: "e3",
      evaluatorRevision: "001",
      result: "BLOCKED",
      recorded: {
        path: ".eval/attempts/003/eval-result.md",
        identity: SHA("7"),
      },
    },
  ]);
  assert.deepEqual(
    entries.map((entry) => [entry.attempt, entry.state]),
    [
      [1, "NONTERMINAL"],
      [2, "TERMINAL"],
      [3, "LOST"],
    ],
  );
  assert.equal(
    existsSync(join(root, ".eval/attempts/001/eval-result.md")),
    true,
  );
  // The NONTERMINAL attempt's expected path was never created, and that is
  // not loss.
  assert.equal(
    existsSync(join(root, ".eval/attempts/001/../000/eval-result.md")),
    false,
  );
  // A terminal result must bind its artifact; changed bytes are not LOST.
  assert.throws(
    () =>
      classifyAttempts(root, [
        { execution: "e", evaluatorRevision: "001", result: "PASS" },
      ]),
    /must bind its result/,
  );
  assert.throws(
    () =>
      classifyAttempts(root, [
        {
          execution: "e",
          evaluatorRevision: "001",
          result: "FAIL",
          recorded: {
            path: ".eval/attempts/001/eval-result.md",
            identity: SHA("8"),
          },
        },
      ]),
    /changed since it was recorded/,
  );
  assert.throws(
    () =>
      classifyAttempts(root, [
        {
          execution: "e",
          evaluatorRevision: "001",
          recorded: { path: "x", identity: SHA("8") },
        },
      ]),
    /requires a finalized result/,
  );
});

void test("014k AC06/AC09/AC10/TR2d,f: the host archives the active revision directly, from exact identities, despite earlier NONTERMINAL history", (t) => {
  const { root, fact } = evaluator(t);
  const destination = join(scratch(t), "archive");
  assert.equal(existsSync(join(root, ".eval/revisions")), false);
  const record = executeArchive(root, fact, destination);
  assert.equal(record.state, "complete");
  assert.equal(closeoutPermitted(fact, record), true);
  assert.match(archiveRecordIdentity(record), /^sha256:[a-f0-9]{64}$/);
  assert.equal(record.evaluationFact, evaluationFactIdentity(fact));
  const destinations = record.artifacts.map((item) => item.destination).sort();
  assert.deepEqual(destinations, [
    "attempts/002/eval-result.md",
    "evaluation-fact.json",
    "freeze/001.json",
    "revisions/001/.hidden-test/a.test.ts",
    "revisions/001/eval-spec.md",
  ]);
  for (const item of record.artifacts)
    assert.equal(
      identity(readFileSync(join(destination, item.destination))),
      item.identity,
    );
  assert.equal(
    existsSync(join(destination, "attempts/001")),
    false,
    "no terminal artifact is invented for the NONTERMINAL attempt",
  );
  const archivedFact = JSON.parse(
    readFileSync(join(destination, "evaluation-fact.json"), "utf8"),
  ) as EvaluationFact;
  assert.equal(archivedFact.attempts[0]?.state, "NONTERMINAL");
  assert.equal(archivedFact.result, "PASS");
  // The plan is a pure function of trusted policy and the exact identities.
  assert.deepEqual(buildArchivePlan(root, fact), buildArchivePlan(root, fact));
});

void test("014k AC06/AC10/TR2d,f: archive failure is recoverable, leaves the PASS unchanged and blocks closeout", (t) => {
  const { root, fact } = evaluator(t);
  const factBefore = JSON.stringify(fact);
  const destination = join(scratch(t), "archive");
  const spec = join(root, ".eval/eval-spec.md");
  writeFileSync(spec, "changed\n");
  const failed = executeArchive(root, fact, destination);
  assert.equal(failed.state, "failed");
  assert.match(failed.failure ?? "", /missing or changed: eval-spec\.md/);
  assert.equal(closeoutPermitted(fact, failed), false);
  assert.equal(existsSync(destination), false, "no partial archive");
  assert.equal(existsSync(`${destination}.staging`), false);
  assert.equal(JSON.stringify(fact), factBefore);
  assert.equal(fact.result, "PASS");
  // Missing bytes also fail closed.
  rmSync(spec);
  assert.equal(executeArchive(root, fact, destination).state, "failed");
  // Recovery re-runs only the archive; the evaluation is not repeated.
  writeFileSync(spec, "spec\n");
  const recovered = executeArchive(root, fact, destination);
  assert.equal(closeoutPermitted(fact, recovered), true);
  assert.equal(fact.result, "PASS");
  // A record for a different fact never permits closeout.
  assert.equal(
    closeoutPermitted({ ...fact, candidate: "b".repeat(40) }, recovered),
    false,
  );
});

void test("014k AC10/TR2f: changed active identity, terminal bytes or a missing superseded revision fail closed; LOST archives as incomplete", (t) => {
  const { root, fact } = evaluator(t);
  assert.throws(
    () =>
      buildArchivePlan(root, { ...fact, evaluatorRevisionIdentity: SHA("0") }),
    /identity mismatch/,
  );
  assert.throws(
    () =>
      buildArchivePlan(root, {
        ...fact,
        attempts: [
          { ...fact.attempts[0], evaluatorRevision: "000" } as never,
          fact.attempts[1] as never,
        ],
      }),
    /revision 000 freeze metadata is missing/,
  );
  appendFileSync(join(root, ".eval/attempts/002/eval-result.md"), "tampered");
  assert.throws(() => buildArchivePlan(root, fact), /missing or changed/);
  // An end state that is not its own terminal result is not an evaluation fact.
  assert.throws(
    () => buildArchivePlan(root, { ...fact, result: "FAIL" }),
    /evaluation fact must end/,
  );

  const lost = evaluator(t);
  const attempts = [
    {
      attempt: 1,
      execution: "e0",
      evaluatorRevision: "001",
      state: "LOST" as const,
      result: "FAIL" as const,
      artifact: {
        path: ".eval/attempts/001/eval-result.md",
        identity: SHA("5"),
      },
    },
    { ...lost.fact.attempts[1], attempt: 2 } as never,
  ];
  const record = executeArchive(
    lost.root,
    { ...lost.fact, attempts },
    join(scratch(t), "archive"),
  );
  assert.equal(record.state, "incomplete");
  assert.equal(closeoutPermitted({ ...lost.fact, attempts }, record), false);
});

// ---- (g)(h) adoption and cutover -------------------------------------------

function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "014k test",
      GIT_AUTHOR_EMAIL: "test@example.invalid",
      GIT_COMMITTER_NAME: "014k test",
      GIT_COMMITTER_EMAIL: "test@example.invalid",
    },
  }).trim();
}

function commit(root: string, message: string): string {
  git(root, ["add", "."]);
  git(root, ["commit", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}

function adoptionFixture(t: TestContext): {
  root: string;
  history: string;
  baseline: string;
  baselineIdentity: string;
} {
  const root = join(scratch(t), "repository");
  mkdirSync(root);
  cpSync("methodologies", join(root, "methodologies"), { recursive: true });
  cpSync("skills", join(root, "skills"), { recursive: true });
  mkdirSync(join(root, "src", "methodologies"), { recursive: true });
  cpSync(
    "src/methodologies/harness-public.ts",
    join(root, "src", "methodologies", "harness-public.ts"),
  );
  cpSync("harness.project.json", join(root, "harness.project.json"));
  mkdirSync(join(root, "spikes"));
  writeFileSync(join(root, "spikes", ".gitkeep"), "");
  git(root, ["init", "-b", "main"]);
  const baseline = commit(root, "trusted methodology N");
  const baselineIdentity = buildMethodologyManifest(root, baseline).manifest.id;
  const history = join(root, "methodologies/harness/trusted.jsonl");
  const initial: TrustedMethodologyEvent = {
    schemaVersion: 1,
    sequence: 1,
    methodology: baselineIdentity,
    revision: baseline,
    previous: null,
    authority: {
      kind: "human",
      evidence: "bootstrap:test-baseline",
      evaluation: {
        kind: "human-bootstrap",
        evidence: "bootstrap:test-baseline",
      },
    },
  };
  writeFileSync(history, `${JSON.stringify(initial)}\n`);
  return { root, history, baseline, baselineIdentity };
}

function successor(
  f: ReturnType<typeof adoptionFixture>,
  marker: string,
): ReturnType<typeof candidateMethodology> {
  appendFileSync(
    join(f.root, "skills", "evaluator", "SKILL.md"),
    `\nCandidate marker ${marker}.\n`,
  );
  return candidateMethodology(f.root, commit(f.root, marker), f.history);
}

function adoption(
  f: ReturnType<typeof adoptionFixture>,
  candidate: ReturnType<typeof candidateMethodology>,
  overrides: Record<string, unknown> = {},
): unknown {
  return {
    kind: "human",
    decision: "promote",
    evidence: "human-adoption-decision.md",
    evaluation: {
      kind: "trusted-methodology",
      methodology: f.baselineIdentity,
      result: "PASS",
      evidence: "verification-finalized",
      candidate: candidate.revision,
      candidateMethodology: candidate.manifest.id,
      predecessorSequence: 1,
      resultIdentity: SHA("1"),
      closeout: SHA("2"),
      ...overrides,
    },
  };
}

void test("014k AC12/AC13/TR2g: adoption refuses drift, mismatch, stale and replayed authority and appends forward-only", (t) => {
  const f = adoptionFixture(t);
  const a = successor(f, "A");
  const b = successor(f, "B");
  const before = readFileSync(f.history);
  const refused: Array<[unknown, RegExp, typeof a?]> = [
    // PASS/closeout/head binding is mandatory.
    [
      adoption(f, a, { resultIdentity: undefined }),
      /must bind the trusted predecessor sequence, PASS identity and closeout/,
    ],
    [
      adoption(f, a, { closeout: "git:abc" }),
      /must bind the trusted predecessor sequence, PASS identity and closeout/,
    ],
    [
      adoption(f, a, { predecessorSequence: undefined }),
      /must bind the trusted predecessor sequence/,
    ],
    // Stale: issued against a different head.
    [adoption(f, a, { predecessorSequence: 0 }), /stale/],
    [adoption(f, a, { predecessorSequence: 2 }), /stale/],
    // Candidate, methodology and predecessor drift.
    [adoption(f, b, { candidate: a.revision }), /different candidate/, b],
    [
      adoption(f, b, { candidateMethodology: a.manifest.id }),
      /different candidate methodology/,
      b,
    ],
    [adoption(f, a, { methodology: SHA("0") }), /current trusted methodology/],
  ];
  for (const [authority, pattern, candidate] of refused) {
    assert.throws(
      () => promoteMethodology(candidate ?? a, f.history, authority),
      pattern,
    );
    assert.deepEqual(readFileSync(f.history), before, "history is unchanged");
  }
  // An evaluated candidate that differs from the reconstructed one.
  assert.throws(
    () =>
      promoteMethodology(
        { ...a, manifest: { ...a.manifest, id: b.manifest.id } },
        f.history,
        adoption(f, a),
      ),
    /does not match its exact repository revision/,
  );

  const event = promoteMethodology(a, f.history, adoption(f, a));
  assert.equal(event.sequence, 2);
  assert.equal(event.previous, f.baselineIdentity);
  assert.equal(event.methodology, a.manifest.id);
  const recorded = readTrustedHistory(f.history);
  assert.equal(recorded.length, 2);
  assert.deepEqual(
    readFileSync(f.history).subarray(0, before.length),
    before,
    "earlier records are byte-unchanged",
  );
  const evaluation = recorded[1]?.authority.evaluation;
  assert.ok(evaluation?.kind === "trusted-methodology");
  assert.equal(evaluation.resultIdentity, SHA("1"));
  assert.equal(evaluation.closeout, SHA("2"));
  assert.equal(evaluation.predecessorSequence, 1);

  // Replay and authority for the moved head are refused; history stays at 2.
  assert.throws(() => promoteMethodology(a, f.history, adoption(f, a)));
  assert.throws(
    () => promoteMethodology(b, f.history, adoption(f, b)),
    /stale|current trusted methodology|trusted methodology changed/,
  );
  assert.equal(readTrustedHistory(f.history).length, 2);
});

void test("014k AC14/TR2h: a fresh allocation after adoption binds the adopted methodology through the trust-equivalence gate; earlier grants keep theirs", (t) => {
  const f = adoptionFixture(t);
  const project = (): ReturnType<typeof loadProject> => {
    const value = loadProject(join(f.root, "harness.project.json"));
    value.workflows = {};
    return value;
  };
  const before = bindFutureWorkflow(f.history, "pre-cutover");
  assert.equal(
    trustedDefinition(project(), harnessValidators).id,
    trustedDefinition(project(), harnessValidators).id,
  );
  assert.equal(trustedBinding(project()).trusted.manifest, f.baselineIdentity);
  const n1 = successor(f, "N+1");
  const event = promoteMethodology(n1, f.history, adoption(f, n1));
  const fresh = bindFutureWorkflow(f.history, "post-cutover");
  assert.equal(fresh.methodology, n1.manifest.id);
  assert.equal(before.methodology, f.baselineIdentity);
  const binding = trustedBinding(project());
  assert.equal(binding.trusted.manifest, n1.manifest.id);
  assert.equal(binding.trusted.revision, n1.revision);
  assert.equal(binding.trusted.sequence, event.sequence);
  // The standard gate passes against the adopted revision's exact bytes.
  const definition = trustedDefinition(project(), harnessValidators);
  assert.equal(
    definition.roles["evaluator-verify"]?.skill.identity,
    n1.manifest.roles["evaluator-verify"]?.skill.identity,
  );
  assert.notEqual(
    n1.manifest.roles["evaluator-verify"]?.skill.identity,
    buildMethodologyManifest(f.root, f.baseline).manifest.roles[
      "evaluator-verify"
    ]?.skill.identity,
  );
});

void test("014k AC06/AC10: the host derives the archive from the attempt ledger and allocations with no evaluator plan", (t) => {
  const root = scratch(t);
  const spec = put(root, ".eval/eval-spec.md", "spec\n");
  const freeze = put(
    root,
    ".eval/freeze.json",
    `${JSON.stringify({ evaluatorRevision: "001", artifacts: { "eval-spec.md": spec } })}\n`,
  );
  const result = put(root, ".eval/attempts/001/eval-result.md", "pass\n");
  put(
    root,
    ".eval/attempt-ledger.json",
    `${JSON.stringify({ attempts: [{ id: "001", status: "PASS", resultIdentity: result }] })}\n`,
  );
  const allocations = [
    { attempt: 1, execution: "e1", evaluatorRevision: "001" },
  ];
  const plan = deriveHostArchive(root, COMMIT, allocations);
  assert.deepEqual(plan.items.map((item) => item.destination).sort(), [
    "attempts/001/eval-result.md",
    "evaluation-fact.json",
    "freeze/001.json",
    "revisions/001/eval-spec.md",
  ]);
  assert.equal(
    plan.items.find((item) => item.destination === "freeze/001.json")?.identity,
    freeze,
  );
  put(root, ".eval/attempts/001/eval-result.md", "changed\n");
  assert.throws(
    () => deriveHostArchive(root, COMMIT, allocations),
    /changed since it was recorded/,
  );
  assert.throws(
    () => deriveHostArchive(root, COMMIT, []),
    /disagrees with host allocations/,
  );
});
