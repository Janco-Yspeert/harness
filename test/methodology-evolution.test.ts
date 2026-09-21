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
    },
  });
  const future = bindFutureWorkflow(f.history, "future");
  assert.equal(event.previous, f.baselineIdentity);
  assert.equal(existing.methodology, f.baselineIdentity);
  assert.equal(future.methodology, candidate.manifest.id);
  assert.equal(readTrustedHistory(f.history).length, 2);
});
