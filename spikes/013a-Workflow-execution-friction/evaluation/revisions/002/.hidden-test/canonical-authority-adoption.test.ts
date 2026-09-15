// Hidden test for Spike 013a AC16, AC17, AC19 ("Runner adoption and
// recovery").
//
// Baseline (pre-implementation, evaluator revision 001): tools/workflow.ts
// `canDispatch()` derives phase eligibility solely from local
// `.workflow/state.json` history (`hasOutcome(state, prior, 1, "complete")`).
// It never consults canonical `workflow.jsonl` authority. A freshly
// initialized runner whose `.workflow` state has no local dispatch/completion
// history for brief-readiness/design-map therefore cannot dispatch
// evaluator-prepare, even when canonical authority already records both
// phases frozen. This reproduces spike.md Observed Failure #4 (and is the
// exact failure Spike 013a itself hit on `feat/spike-013`).
//
// This test builds a fixture whose canonical `workflow.jsonl` already records
// `brief-frozen` and `design-map-frozen`, but whose local `.workflow` state is
// freshly initialized (only `init`, no dispatch/completion for those phases).
// It asserts:
//   AC16 - the fresh runner can proceed to the correct next phase
//          (evaluator-prepare) using canonical authority alone;
//   AC19 - that derived next phase is exactly evaluator-prepare, not a phase
//          before or after it;
//   AC17 - adopting those checkpoints does not fabricate local
//          dispatch/completion records for brief-readiness or design-map
//          (events this runner never actually dispatched or completed).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const suffix = String(process.pid);
const fixture = `spikes/997b-eval013a-adoption-${suffix}`;
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

void test("a fresh runner adopts already-frozen canonical checkpoints without fabricating local history (AC16, AC17, AC19)", (t) => {
  rmSync(fixturePath, { recursive: true, force: true });
  mkdirSync(fixturePath, { recursive: true });
  t.after(() => {
    rmSync(fixturePath, { recursive: true, force: true });
  });

  const briefContents = "fixture brief\n";
  const designMapContents = "fixture design map\n";
  writeFileSync(join(fixturePath, "spike.md"), briefContents);
  writeFileSync(join(fixturePath, "design-map.md"), designMapContents);

  const blob1 = git(["hash-object", "-w", "--stdin"], briefContents);
  const blob2 = git(["hash-object", "-w", "--stdin"], designMapContents);
  const spikeDirectory = fixture.split("/")[1];
  assert.ok(spikeDirectory);
  const leaf = git(
    ["mktree"],
    `100644 blob ${blob1}\tspike.md\n100644 blob ${blob2}\tdesign-map.md\n`,
  );
  const spikesTree = git(["mktree"], `040000 tree ${leaf}\t${spikeDirectory}\n`);
  const root = git(["mktree"], `040000 tree ${spikesTree}\tspikes\n`);
  const commit = git(["commit-tree", root, "-m", "adoption fixture"]);

  const briefIdentity = `sha256:${createHash("sha256")
    .update(briefContents)
    .digest("hex")}`;
  const designMapIdentity = `sha256:${createHash("sha256")
    .update(designMapContents)
    .digest("hex")}`;

  assert.equal(
    run([
      "authority",
      "record",
      fixture,
      "brief-frozen",
      JSON.stringify({ path: "spike.md", identity: briefIdentity, commit }),
    ]).status,
    0,
  );
  assert.equal(
    run([
      "authority",
      "record",
      fixture,
      "design-map-frozen",
      JSON.stringify({
        path: "design-map.md",
        identity: designMapIdentity,
        commit,
      }),
    ]).status,
    0,
  );

  // A fresh/restarted runner: only `init` exists locally, no dispatch or
  // completion for brief-readiness or design-map ever occurred through it.
  assert.equal(run(["init", fixture]).status, 0);
  const preAdoptionState: { records: { phase: string; event: string }[] } =
    JSON.parse(readFileSync(join(fixturePath, ".workflow/state.json"), "utf8"));
  assert.equal(
    preAdoptionState.records.filter(
      (record) =>
        (record.phase === "brief-readiness" || record.phase === "design-map") &&
        (record.event === "dispatch" || record.event === "outcome"),
    ).length,
    0,
    "fixture setup sanity check: no local brief-readiness/design-map dispatch or completion records yet",
  );

  // AC16 + AC19: the fresh runner must derive evaluator-prepare as its next
  // legitimate action from canonical authority alone.
  const inspect = run(["dispatch", "evaluator-prepare", fixture]);
  assert.equal(
    inspect.status,
    0,
    `fresh runner must adopt canonical brief-frozen/design-map-frozen and proceed to evaluator-prepare; got: ${inspect.stderr}`,
  );

  const wrongPhase = run(["dispatch", "implementation", fixture]);
  assert.notEqual(
    wrongPhase.status,
    0,
    "adoption must not skip past evaluator-prepare to a later phase",
  );

  // AC17: adoption must not fabricate dispatch/completion records for
  // brief-readiness or design-map, which this runner never actually ran.
  const postAdoptionState: {
    records: { phase: string; event: string; outcome?: string }[];
  } = JSON.parse(readFileSync(join(fixturePath, ".workflow/state.json"), "utf8"));
  const fabricated = postAdoptionState.records.filter(
    (record) =>
      (record.phase === "brief-readiness" || record.phase === "design-map") &&
      (record.event === "dispatch" || record.event === "outcome"),
  );
  assert.deepEqual(
    fabricated,
    [],
    "adoption must not manufacture brief-readiness/design-map dispatch or completion events that never occurred through this runner",
  );
});
