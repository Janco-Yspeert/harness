import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import {
  bindFutureWorkflow,
  buildMethodologyManifest,
  candidateMethodology,
  checkMethodology,
  diffMethodologies,
  exerciseMethodology,
  promoteMethodology,
  readTrustedHistory,
  type TrustedMethodologyEvent,
} from "../src/methodology-evolution.ts";

function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Methodology evolution test",
      GIT_AUTHOR_EMAIL: "methodology@example.invalid",
      GIT_COMMITTER_NAME: "Methodology evolution test",
      GIT_COMMITTER_EMAIL: "methodology@example.invalid",
    },
  }).trim();
}

function commit(root: string, message: string): string {
  git(root, ["add", "."]);
  git(root, ["commit", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}

function fixture(t: TestContext): {
  root: string;
  history: string;
  baseline: string;
  baselineIdentity: string;
} {
  const directory = mkdtempSync(join(tmpdir(), "harness-methodology-test-"));
  const root = join(directory, "repository");
  mkdirSync(root);
  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  cpSync("methodologies", join(root, "methodologies"), { recursive: true });
  cpSync("skills", join(root, "skills"), { recursive: true });
  mkdirSync(join(root, "src", "methodologies"), { recursive: true });
  cpSync(
    "src/methodologies/harness-public.ts",
    join(root, "src", "methodologies", "harness-public.ts"),
  );
  git(root, ["init", "-b", "main"]);
  const baseline = commit(root, "trusted methodology");
  const baselineIdentity = buildMethodologyManifest(root, baseline).manifest.id;
  const history = join(root, "trusted.jsonl");
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

function validCandidate(
  f: ReturnType<typeof fixture>,
): ReturnType<typeof candidateMethodology> {
  appendFileSync(
    join(f.root, "skills", "design-map", "SKILL.md"),
    "\nCandidate revision marker with no authority semantics.\n",
  );
  const revision = commit(f.root, "candidate methodology");
  return candidateMethodology(f.root, revision, f.history);
}

void test("candidate constructs a stable complete identity from one exact revision", (t) => {
  const f = fixture(t);
  const first = candidateMethodology(f.root, f.baseline, f.history);
  const second = candidateMethodology(f.root, f.baseline, f.history);
  assert.equal(first.revision, f.baseline);
  assert.equal(first.manifest.id, second.manifest.id);
  assert.equal(first.relationToTrusted, "equal");
  assert.equal(Object.keys(first.manifest.roles).length, 8);
  assert.deepEqual(Object.keys(first.manifest.validators).sort(), [
    "prepared-coverage",
    "verification-accounting",
  ]);

  const changed = validCandidate(f);
  assert.equal(changed.relationToTrusted, "different");
  assert.notEqual(changed.manifest.id, first.manifest.id);
  assert.equal(
    candidateMethodology(f.root, f.baseline, f.history).manifest.id,
    first.manifest.id,
    "later edits cannot mutate the manifest already built from the trusted revision",
  );
});

void test("check validates coherence and rejects a contradictory skill/contract fixture", (t) => {
  const f = fixture(t);
  const candidate = candidateMethodology(f.root, f.baseline, f.history);
  assert.deepEqual(checkMethodology(candidate.manifest).diagnostics, []);

  const contractPath = join(
    f.root,
    "methodologies",
    "harness",
    "contracts",
    "implementation.json",
  );
  const contract = JSON.parse(readFileSync(contractPath, "utf8")) as {
    capabilities: string[];
  };
  contract.capabilities = contract.capabilities.filter(
    (capability) => capability !== "git-commit",
  );
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  const contradictoryRevision = commit(
    f.root,
    "contradict local-checkpoint skill and contract",
  );
  const contradictory = candidateMethodology(
    f.root,
    contradictoryRevision,
    f.history,
  );
  const result = checkMethodology(contradictory.manifest);
  assert.equal(result.valid, false);
  assert.ok(
    result.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "MISSING_CAPABILITY" &&
        diagnostic.path.endsWith("implementation.json") &&
        diagnostic.message.includes("git-commit"),
    ),
  );
});

void test("check requires implementation retry feedback to have an exact configured producer", (t) => {
  const f = fixture(t);
  const candidate = candidateMethodology(f.root, f.baseline, f.history);
  assert.equal(checkMethodology(candidate.manifest).valid, true);

  const contractPath = join(
    f.root,
    "methodologies",
    "harness",
    "contracts",
    "implementation.json",
  );
  const contract = JSON.parse(readFileSync(contractPath, "utf8")) as {
    inputs: Array<{ name: string; event?: string }>;
  };
  const feedback = contract.inputs.find(
    (input) => input.name === "implementationFeedback",
  );
  assert.ok(feedback);
  feedback.event = "implementation-feedback-recorded";
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  const revision = commit(f.root, "disconnect retry feedback producer");
  const disconnected = candidateMethodology(f.root, revision, f.history);
  assert.ok(
    checkMethodology(disconnected.manifest).diagnostics.some(
      (diagnostic) => diagnostic.code === "IMPLEMENTATION_FEEDBACK_BINDING",
    ),
  );
});

void test("diff reports material component categories", (t) => {
  const f = fixture(t);
  const before = buildMethodologyManifest(f.root, f.baseline).manifest;
  appendFileSync(
    join(f.root, "skills", "implementation", "SKILL.md"),
    "\nChanged skill semantics.\n",
  );
  const contractPath = join(
    f.root,
    "methodologies",
    "harness",
    "contracts",
    "implementation.json",
  );
  const contract = JSON.parse(readFileSync(contractPath, "utf8")) as {
    capabilities: string[];
    results: string[];
    publication?: object;
  };
  contract.capabilities.push("fixture-capability");
  contract.results.push("fixture-result");
  contract.publication = {};
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  const policyPath = join(f.root, "methodologies", "harness", "policy.json");
  const policy = JSON.parse(readFileSync(policyPath, "utf8")) as {
    maxAllocations: number;
  };
  policy.maxAllocations += 1;
  writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  appendFileSync(
    join(f.root, "src", "methodologies", "harness-public.ts"),
    "\n// changed validator\n",
  );
  const revision = commit(f.root, "material methodology changes");
  const after = buildMethodologyManifest(f.root, revision).manifest;
  const result = diffMethodologies(before, after);
  assert.equal(result.equal, false);
  assert.equal(result.changes.policy, true);
  assert.deepEqual(result.changes.skills, ["implementation"]);
  assert.deepEqual(result.changes.contracts, ["implementation"]);
  assert.deepEqual(result.changes.capabilities, ["implementation"]);
  assert.deepEqual(result.changes.resultVocabularies, ["implementation"]);
  assert.deepEqual(result.changes.privilegedActionRequirements, [
    "implementation",
  ]);
  assert.deepEqual(result.changes.validators, [
    "prepared-coverage",
    "verification-accounting",
  ]);
});

void test("exercise uses a candidate role to create only a disposable local checkpoint", (t) => {
  const f = fixture(t);
  const candidate = validCandidate(f);
  const result = exerciseMethodology(candidate, f.history);
  assert.equal(result.valid, true);
  assert.equal(result.role, "design-map");
  assert.equal(result.artifact, "design-map.md");
  assert.match(result.artifactIdentity, /^sha256:/);
  assert.equal(
    result.contractIdentity,
    candidate.manifest.roles["design-map"]?.contract.identity,
  );
  assert.equal(
    result.skillIdentity,
    candidate.manifest.roles["design-map"]?.skill.identity,
  );
  assert.match(result.checkpoint, /^[a-f0-9]{40,64}$/);
  assert.equal(result.published, false);
  assert.equal(result.trustedBefore, f.baselineIdentity);
  assert.equal(result.trustedAfter, f.baselineIdentity);
  assert.equal(readTrustedHistory(f.history).length, 1);
});

void test("promotion requires human and prior-trusted authority and affects only future bindings", (t) => {
  const f = fixture(t);
  const candidate = validCandidate(f);
  const existing = bindFutureWorkflow(f.history, "already-running");

  assert.throws(
    () =>
      promoteMethodology(candidate, f.history, {
        kind: "human",
        decision: "promote",
        evidence: "human:test",
        evaluation: {
          kind: "trusted-methodology",
          methodology: candidate.manifest.id,
          result: "PASS",
          evidence: "self-evaluation:test",
        },
      }),
    /current trusted methodology/,
  );

  assert.throws(
    () =>
      promoteMethodology({ ...candidate, revision: f.baseline }, f.history, {
        kind: "human",
        decision: "promote",
        evidence: "human:test",
        evaluation: {
          kind: "trusted-methodology",
          methodology: f.baselineIdentity,
          result: "PASS",
          evidence: "evaluation:test",
        },
      }),
    /does not match its exact repository revision/,
  );
  assert.equal(readTrustedHistory(f.history).length, 1);

  const event = promoteMethodology(candidate, f.history, {
    kind: "human",
    decision: "promote",
    evidence: "human:test",
    evaluation: {
      kind: "trusted-methodology",
      methodology: f.baselineIdentity,
      result: "PASS",
      evidence: "evaluation:test",
      candidate: candidate.revision,
      candidateMethodology: candidate.manifest.id,
    },
  });
  const future = bindFutureWorkflow(f.history, "future");
  assert.equal(event.previous, f.baselineIdentity);
  assert.equal(existing.methodology, f.baselineIdentity);
  assert.equal(future.methodology, candidate.manifest.id);
  assert.equal(readTrustedHistory(f.history).length, 2);
});

function trustedAuthority(
  f: ReturnType<typeof fixture>,
  evaluation: Record<string, unknown>,
): unknown {
  return {
    kind: "human",
    decision: "promote",
    evidence: "human:test",
    evaluation: {
      kind: "trusted-methodology",
      methodology: f.baselineIdentity,
      result: "PASS",
      evidence: "evaluation:test",
      ...evaluation,
    },
  };
}

void test("014d C5: promotion binds the exact N-verified candidate commit and manifest", (t) => {
  const f = fixture(t);
  const candidateA = validCandidate(f);
  appendFileSync(
    join(f.root, "skills", "outcome", "SKILL.md"),
    "\nA different candidate with no authority semantics.\n",
  );
  const candidateB = candidateMethodology(
    f.root,
    commit(f.root, "candidate B"),
    f.history,
  );
  const history = readFileSync(f.history);
  const rejected: Array<[unknown, RegExp]> = [
    // Missing binding fields.
    [trustedAuthority(f, {}), /must bind the exact candidate/],
    [
      trustedAuthority(f, { candidate: candidateB.revision }),
      /must bind the exact candidate/,
    ],
    // A PASS for A applied to B.
    [
      trustedAuthority(f, {
        candidate: candidateA.revision,
        candidateMethodology: candidateA.manifest.id,
      }),
      /verified a different candidate/,
    ],
    [
      trustedAuthority(f, {
        candidate: candidateB.revision,
        candidateMethodology: candidateA.manifest.id,
      }),
      /verified a different candidate methodology/,
    ],
    // Self-evaluation and stale authority.
    [
      trustedAuthority(f, {
        methodology: candidateB.manifest.id,
        candidate: candidateB.revision,
        candidateMethodology: candidateB.manifest.id,
      }),
      /current trusted methodology/,
    ],
    [
      trustedAuthority(f, {
        methodology: `sha256:${"0".repeat(64)}`,
        candidate: candidateB.revision,
        candidateMethodology: candidateB.manifest.id,
      }),
      /current trusted methodology/,
    ],
  ];
  for (const [authority, pattern] of rejected) {
    assert.throws(
      () => promoteMethodology(candidateB, f.history, authority),
      pattern,
    );
    assert.deepEqual(readFileSync(f.history), history);
  }
  // Silently drifted bytes: the claimed manifest is not what the commit holds.
  const drifted = {
    ...candidateB,
    manifest: { ...candidateB.manifest, id: candidateA.manifest.id },
  };
  assert.throws(
    () =>
      promoteMethodology(
        drifted,
        f.history,
        trustedAuthority(f, {
          candidate: candidateB.revision,
          candidateMethodology: candidateA.manifest.id,
        }),
      ),
    /does not match its exact repository revision/,
  );
  assert.deepEqual(readFileSync(f.history), history);

  const event = promoteMethodology(
    candidateB,
    f.history,
    trustedAuthority(f, {
      candidate: candidateB.revision,
      candidateMethodology: candidateB.manifest.id,
    }),
  );
  assert.equal(event.sequence, 2);
  assert.equal(event.methodology, candidateB.manifest.id);
  assert.equal(event.revision, candidateB.revision);
  const recorded = readTrustedHistory(f.history);
  assert.equal(recorded.length, 2);
  assert.deepEqual(recorded[1]?.authority.evaluation, {
    kind: "trusted-methodology",
    methodology: f.baselineIdentity,
    result: "PASS",
    evidence: "evaluation:test",
    candidate: candidateB.revision,
    candidateMethodology: candidateB.manifest.id,
  });
});

void test("014d AC11: a ninth optional public role is derived from policy, checked and diffed without becoming trusted", (t) => {
  const f = fixture(t);
  const before = candidateMethodology(f.root, f.baseline, f.history);
  const policyPath = join(f.root, "methodologies", "harness", "policy.json");
  const policy = JSON.parse(readFileSync(policyPath, "utf8")) as {
    roles: Record<string, unknown>;
  };
  policy.roles["regression-curator"] = {
    contract: "methodologies/harness/contracts/regression-curator.json",
    skill: "skills/regression-curator/SKILL.md",
    when: { event: "outcome-recorded" },
    retry: { dispositions: ["blocked", "failed"], limit: 1 },
    outcomes: [
      {
        disposition: "succeeded",
        transition: "regression-curated",
        evidence: { artifact: "regression-tests.md" },
      },
    ],
  };
  writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  const contractPath = join(
    f.root,
    "methodologies",
    "harness",
    "contracts",
    "regression-curator.json",
  );
  writeFileSync(
    contractPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        workspaces: ["repository"],
        capabilities: [
          "repository-read",
          "repository-write",
          "local-computation",
          "git-inspect",
          "git-commit",
        ],
        forbiddenExposure: ["evaluator-private"],
        protected: false,
        inputs: [],
        results: ["succeeded", "blocked", "failed"],
        methodology: {},
        human: ["input"],
        postconditions: ["regression-tests.md", "manifest.md"],
      },
      null,
      2,
    )}\n`,
  );
  mkdirSync(join(f.root, "skills", "regression-curator"));
  writeFileSync(
    join(f.root, "skills", "regression-curator", "SKILL.md"),
    "# Regression Curator (fixture)\n\nTurn public-safe regression recommendations into ordinary public tests.\nReport the exact produced local commit.\n",
  );
  const ninth = candidateMethodology(
    f.root,
    commit(f.root, "ninth optional role fixture"),
    f.history,
  );
  assert.equal(Object.keys(ninth.manifest.roles).length, 9);
  assert.ok(ninth.manifest.roles["regression-curator"]);
  assert.equal(ninth.relationToTrusted, "different");
  assert.deepEqual(checkMethodology(ninth.manifest).diagnostics, []);
  const diff = diffMethodologies(before.manifest, ninth.manifest);
  assert.deepEqual(diff.changes.roles, {
    added: ["regression-curator"],
    removed: [],
  });
  assert.deepEqual(diff.changes.skills, ["regression-curator"]);
  assert.deepEqual(diff.changes.contracts, ["regression-curator"]);
  // N stays authoritative for new bindings until an explicit human promotion.
  assert.equal(
    bindFutureWorkflow(f.history, "future").methodology,
    f.baselineIdentity,
  );
  assert.equal(readTrustedHistory(f.history).length, 1);
  // The eight-role trusted methodology remains coherent.
  assert.equal(checkMethodology(before.manifest).valid, true);
  assert.equal(Object.keys(before.manifest.roles).length, 8);

  // An optional role cannot quietly hold evaluator-private material.
  const leaky = JSON.parse(readFileSync(contractPath, "utf8")) as {
    workspaces: string[];
    forbiddenExposure: string[];
  };
  leaky.workspaces.push("evaluation");
  leaky.forbiddenExposure = [];
  writeFileSync(contractPath, `${JSON.stringify(leaky, null, 2)}\n`);
  const leakyCandidate = candidateMethodology(
    f.root,
    commit(f.root, "leaky optional role"),
    f.history,
  );
  assert.ok(
    checkMethodology(leakyCandidate.manifest).diagnostics.some(
      (diagnostic) => diagnostic.code === "PRIVATE_EXPOSURE",
    ),
  );
});

void test("014d EA4: a comment-only skill change is a coherent candidate without bookkeeping", (t) => {
  const f = fixture(t);
  appendFileSync(
    join(f.root, "skills", "as-built", "SKILL.md"),
    "<!-- comment -->\n",
  );
  const candidate = candidateMethodology(
    f.root,
    commit(f.root, "comment only"),
    f.history,
  );
  assert.equal(checkMethodology(candidate.manifest).valid, true);
});
