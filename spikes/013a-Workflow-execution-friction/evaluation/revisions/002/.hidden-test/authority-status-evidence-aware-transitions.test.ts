// Hidden test for Spike 013a AC27 ("Evidence-aware transitions") and AC28
// ("Correction transition discoverability").
//
// Baseline (pre-implementation, evaluator revision 001): `authority()`'s
// `status` mode computes `legalTransitions` by calling
// `validateAuthority(target, item, {})` - literally empty evidence - for
// every transition name and keeping only the ones that do not throw. For an
// evidence-bearing transition such as `correction-cycle-opened`,
// `validateAuthority` immediately fails on the first missing required
// evidence field (e.g. `priorCycle`), so the transition is excluded from
// `legalTransitions` even when the surrounding state is otherwise eligible
// for it (`correctionPermitted: true`). This conflates "transition validates
// with empty evidence" with "transition is structurally available", exactly
// as spike.md Observed Failure #8 and the frozen brief's Authority status
// section describe.
//
// This test reconstructs a real Spike-011-shaped repairable human-rejection
// state (the same fixture shape the existing public suite already proves
// reachable in "a real Spike 011-shaped legacy fixture permits the required
// Cycle 002 recovery") from Spike 011's own committed public authority
// evidence, and asserts that `authority status` on that state lists
// `correction-cycle-opened` among `legalTransitions` even though no evidence
// has been supplied for it yet - distinguishing "available but requires
// evidence" from "unavailable" (AC27), specifically for the repairable
// Spike-011-shaped case (AC28).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const suffix = String(process.pid);
const fixture = `spikes/997e-eval013a-authority-status-${suffix}`;
const fixturePath = join(repositoryRoot, fixture);

function run(args: string[]) {
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  return spawnSync("node", ["tools/workflow.ts", ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
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
      GIT_AUTHOR_NAME: "Harness eval fixture",
      GIT_AUTHOR_EMAIL: "harness-eval-fixture@example.invalid",
      GIT_COMMITTER_NAME: "Harness eval fixture",
      GIT_COMMITTER_EMAIL: "harness-eval-fixture@example.invalid",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function identity(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

void test("authority status exposes correction-cycle-opened as available-pending-evidence for a repairable Spike-011-shaped rejection (AC27, AC28)", (t) => {
  const legacyPath = join(repositoryRoot, "spikes/011-host-owned-workflow-runs");
  const legacyHistory = readFileSync(join(legacyPath, "workflow.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as { transition: string; evidence: object });
  const legacyByTransition = (transition: string) => {
    const event = legacyHistory.find((item) => item.transition === transition);
    assert.ok(event, `Spike 011 public history is missing ${transition}`);
    return event;
  };

  const fileNames = [
    "spike.md",
    "design-map.md",
    "coverage-map.json",
    "eval-requirements.md",
  ];
  const files: Record<string, string> = {};
  for (const name of fileNames) {
    files[name] = readFileSync(join(legacyPath, name), "utf8");
  }

  rmSync(fixturePath, { recursive: true, force: true });
  mkdirSync(fixturePath, { recursive: true });
  t.after(() => {
    rmSync(fixturePath, { recursive: true, force: true });
  });
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(fixturePath, name), contents);
  }

  const identities: Record<string, string> = {};
  const entries = fileNames.map((name) => {
    const contents = files[name] ?? "";
    identities[name] = identity(contents);
    return `100644 blob ${git(["hash-object", "-w", "--stdin"], contents)}\t${name}`;
  });
  const spikeDirectory = fixture.split("/")[1];
  assert.ok(spikeDirectory);
  const leaf = git(["mktree"], `${entries.join("\n")}\n`);
  const spikesTree = git(["mktree"], `040000 tree ${leaf}\t${spikeDirectory}\n`);
  const root = git(["mktree"], `040000 tree ${spikesTree}\tspikes\n`);
  const commit = git(["commit-tree", root, "-m", "authority status fixture"]);

  const evidence = (name: string) => ({
    path: name,
    identity: identities[name],
    commit,
  });
  const record = (transition: string, data: object) => {
    const result = run([
      "authority",
      "record",
      fixture,
      transition,
      JSON.stringify(data),
    ]);
    assert.equal(result.status, 0, `${transition} failed: ${result.stderr}`);
  };

  record("brief-frozen", evidence("spike.md"));
  record("design-map-frozen", evidence("design-map.md"));
  record("evaluation-prepared", evidence("coverage-map.json"));
  record("implementation-handoff", { commit, attempt: 1 });
  record("verification-allocated", {
    commit,
    implementationAttempt: 1,
    attempt: 1,
    evaluatorRevision: "001",
  });
  record(
    "verification-finalized",
    legacyByTransition("verification-finalized").evidence,
  );
  record("promotion-recorded", {});
  record("as-built-recorded", {});
  const rejection = legacyByTransition("human-rejected");
  record(rejection.transition, rejection.evidence);

  const statusResult = run(["authority", "status", fixture]);
  assert.equal(statusResult.status, 0, statusResult.stderr);
  const status = JSON.parse(statusResult.stdout) as {
    legalTransitions: string[];
    correctionPermitted: boolean;
  };

  assert.equal(
    status.correctionPermitted,
    true,
    "fixture setup sanity check: this repairable rejection must permit correction",
  );
  assert.ok(
    status.legalTransitions.includes("correction-cycle-opened"),
    "correction-cycle-opened must be discoverable as structurally available even though its required evidence (cycle, priorCycle, briefIdentity, designMapIdentity, ...) has not been supplied yet",
  );
});
