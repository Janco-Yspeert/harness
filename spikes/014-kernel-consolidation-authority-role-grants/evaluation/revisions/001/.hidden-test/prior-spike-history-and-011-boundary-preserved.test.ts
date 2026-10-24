// Hidden test for Spike 014 AC23 ("Historical truth preserved") and the
// frozen brief's "Spike 011 Cycle 002" boundary ("Spike 014 must not add
// compatibility machinery merely to force the old cycle to continue" / "Do
// not resume Spike 011 Cycle 002 before Spike 014").
//
// This is a pre-authored, implementation-independent regression control. It
// does not exercise any new Spike 014 mechanism (Authority Resolver,
// Methodology Definition, Role Grant, root-authority record, etc.) because
// those representations are explicit Design Map implementation freedom. It
// instead pins the exact Git tree identity of every already-committed,
// already-adjudicated spike directory that Spike 014 implementation and
// verification must not rewrite, and asserts those identities are still
// exactly reachable from the current commit's history.
//
// A Git tree object identity changes if, and only if, the recursive content
// of every file and directory beneath that path changes. Comparing pinned
// tree identities is therefore a strict, path-scoped "nothing here was
// added, removed, or edited" check that does not depend on any
// implementation choice Spike 014 is free to make.
//
// Rationale for the specific pins:
// - spikes/010-workflow-authority, .../010a-evaluation-coverage-human-rejection-recovery,
//   .../010b-evaluator-preparation-integrity, .../010c-evaluator-integrity-enforcement,
//   .../011-host-owned-workflow-runs, .../012-correction-cycles-evaluator-repair,
//   .../013-Workflow-execution-friction, and .../013a-Workflow-execution-friction
//   are all prior, already-adjudicated (accepted or historically closed) spikes
//   whose canonical authority ledgers, evaluator evidence, and promoted
//   evaluation artifacts are exactly the kind of "prior Role Grants",
//   "blocked runs", and "earlier semantic results" AC23 and Design Map
//   "Invariants" forbid a root-authority decision (or any other Spike 014
//   mechanism) from mutating.
// - spikes/011-host-owned-workflow-runs receives an additional, explicit
//   name check because spike.md's own "Spike 011 Cycle 002" section singles
//   it out: Spike 014 "must not add compatibility machinery merely to force
//   the old cycle to continue" and must not resume it. An unchanged tree
//   identity is direct evidence that Spike 014 did not touch it.
//
// Positive/negative control performed at freeze time (recorded in
// eval-spec.md "Pre-Freeze Integrity Gate"): this file was executed against
// the unimplemented pre-Spike-014 baseline, where it PASSES (the pinned
// identities are exactly the current committed identities); a temporary copy
// with one deliberately wrong pinned identity was also executed and
// confirmed to FAIL with the exact "tree identity changed" assertion
// message, then discarded. No candidate implementation existed at freeze
// time; nothing about this test was shaped by candidate behavior.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

// path -> pinned `git rev-parse HEAD:<path>` tree identity, recorded at
// Spike 014 evaluator-preparation time (project commit 3543159, branch
// feat/spike-014). Every one of these paths is a previously committed,
// already-historical spike directory that Spike 014 must not modify.
const pinnedTreeIdentities: Record<string, string> = {
  "spikes/010-workflow-authority": "f87db14a9f8f6714bffc4dfffc9aa8185f28d156",
  "spikes/010a-evaluation-coverage-human-rejection-recovery":
    "a63001ea4dc44904d222e36177d318dee0ee8ffc",
  "spikes/010b-evaluator-preparation-integrity":
    "b74e02af47739a2293aebfd1733c7378b1204002",
  "spikes/010c-evaluator-integrity-enforcement":
    "06d094f646c51508664deccb0d92a30586d1124b",
  "spikes/011-host-owned-workflow-runs":
    "a978c6b1d03a8590a02960b1e655debf3ec2bc09",
  "spikes/012-correction-cycles-evaluator-repair":
    "add0ae1cefb2323d59c9becf92ab75e66a7a1fef",
  "spikes/013-Workflow-execution-friction":
    "366a0db273edd471bf4e3869672752e34711488a",
  "spikes/013a-Workflow-execution-friction":
    "d56af371125dc13c69fac08f4d41e6501d395e3a",
};

function repositoryRoot(): string {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    0,
    `git rev-parse --show-toplevel failed: ${result.stderr}`,
  );
  return result.stdout.trim();
}

function currentTreeIdentity(root: string, path: string): string | null {
  const result = spawnSync("git", ["rev-parse", "--verify", `HEAD:${path}`], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

void test("prior committed spikes' Git tree identities are unchanged at HEAD (AC23)", () => {
  const root = repositoryRoot();
  for (const [path, expected] of Object.entries(pinnedTreeIdentities)) {
    const actual = currentTreeIdentity(root, path);
    assert.notEqual(
      actual,
      null,
      `${path} is no longer reachable from HEAD; a historical spike directory must never be removed`,
    );
    assert.equal(
      actual,
      expected,
      `${path} tree identity changed (expected ${expected}, got ${String(actual)}); ` +
        "Spike 014 must not add, remove, or edit any file under a prior, already-adjudicated spike directory",
    );
  }
});

void test("spikes/011-host-owned-workflow-runs is not resumed or advanced by Spike 014 (brief 'Spike 011 Cycle 002')", () => {
  const root = repositoryRoot();
  const path = "spikes/011-host-owned-workflow-runs";
  const actual = currentTreeIdentity(root, path);
  assert.equal(
    actual,
    pinnedTreeIdentities[path],
    "spikes/011-host-owned-workflow-runs tree identity changed; spike.md 'Spike 011 Cycle 002' " +
      "forbids Spike 014 from adding compatibility machinery to force the old cycle to continue " +
      "or otherwise resuming/advancing it before Spike 014 is accepted",
  );
});
