// E3 — The archive utility refuses plans that cannot authorize archival.
// Frozen authority: spike.md §3, AC04 and AC06; design-map.md C2 and
// Invariants ("The archive utility reads only the real persisted plan ...").
// Seam: the existing exported buildArchiveManifest(root, decisionPath?) of
// tools/archive-manifest.ts, whose default decision path is the C2 plan path.
// Plan-schema additions are implementation freedom (C2), so this case asserts
// only refusals that hold for every admissible schema version; eligible
// expansion is judged from public regression and fixture evidence.
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test, { type TestContext } from "node:test";
import { PROJECT_ROOT } from "./support/repo.ts";

type Build = (root: string, decisionPath?: string) => unknown;

const PLAN = ".eval/promotion-plan.json";
const CANDIDATE = "0123456789abcdef0123456789abcdef01234567";

function workspace(t: TestContext): string {
  const directory = mkdtempSync(join(tmpdir(), "harness-014d-eval-e3-"));
  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const root = join(directory, "evaluation");
  mkdirSync(join(root, ".eval", "attempts", "001"), { recursive: true });
  mkdirSync(join(root, ".eval", "revisions", "001", ".hidden-test"), {
    recursive: true,
  });
  writeFileSync(
    join(root, ".eval", "attempt-ledger.json"),
    `${JSON.stringify({ schemaVersion: 2, attempts: [] }, null, 2)}\n`,
  );
  writeFileSync(
    join(root, ".eval", "attempts", "001", "eval-result.md"),
    "# result\n",
  );
  writeFileSync(join(root, ".eval", "revisions", "001", "eval-spec.md"), "x\n");
  writeFileSync(
    join(root, ".eval", "revisions", "001", ".hidden-test", "a.test.ts"),
    "export {};\n",
  );
  return root;
}

function plan(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    schemaVersion: 1,
    kind: "evaluator-promotion-plan",
    decision: "ELIGIBLE",
    candidate: CANDIDATE,
    evaluatorRevision: "001",
    attempt: 1,
    artifacts: [
      {
        kind: "attempt-ledger",
        eligible: true,
        source: ".eval/attempt-ledger.json",
        destination: "attempt-ledger.json",
      },
      {
        kind: "terminal-attempt",
        eligible: true,
        source: ".eval/attempts/001/eval-result.md",
        destination: "attempts/001/eval-result.md",
      },
      {
        kind: "evaluator-revision",
        eligible: true,
        source: ".eval/revisions/001",
        destination: "revisions/001",
      },
    ],
    ...overrides,
  };
}

function write(root: string, value: unknown): void {
  writeFileSync(
    join(root, PLAN),
    typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
  );
}

void test("E3: the archive utility refuses absent, unsupported, ineligible, unsafe and inconsistent plans", async (t: TestContext) => {
  const module = (await import(
    pathToFileURL(join(PROJECT_ROOT, "tools", "archive-manifest.ts")).href
  )) as { buildArchiveManifest?: Build };
  const build = module.buildArchiveManifest;
  assert.equal(
    typeof build,
    "function",
    "tools/archive-manifest.ts keeps exporting buildArchiveManifest",
  );
  if (!build) return;
  // Every case is evaluated; all unrefused cases are reported together.
  const accepted: string[] = [];
  const refuses = (root: string, name: string): void => {
    try {
      build(root);
      accepted.push(name);
    } catch (error: unknown) {
      if (!(error instanceof Error)) accepted.push(`${name} (non-Error throw)`);
    }
  };

  refuses(workspace(t), "no persisted plan at the default plan path");

  {
    const root = workspace(t);
    write(root, "{ not json");
    refuses(root, "unreadable persisted plan");
  }
  {
    const root = workspace(t);
    write(root, plan({ schemaVersion: 999 }));
    refuses(root, "unsupported plan schema version");
  }
  {
    const root = workspace(t);
    write(root, {
      schemaVersion: 1,
      kind: "evaluator-promotion-plan",
      decision: "INELIGIBLE",
      reason: "evaluator mechanisms must remain private",
    });
    refuses(root, "explicit ineligible decision");
  }
  {
    const root = workspace(t);
    const value = plan();
    const artifacts = value.artifacts as Record<string, unknown>[];
    artifacts[2] = { ...artifacts[2], source: "../outside" };
    write(root, value);
    refuses(root, "source escaping the evaluator workspace");
  }
  {
    const root = workspace(t);
    const value = plan();
    const artifacts = value.artifacts as Record<string, unknown>[];
    artifacts[1] = { ...artifacts[1], destination: "/abs/eval-result.md" };
    write(root, value);
    refuses(root, "absolute destination");
  }
  {
    const root = workspace(t);
    const value = plan();
    const artifacts = value.artifacts as Record<string, unknown>[];
    artifacts[1] = { ...artifacts[1], destination: "attempt-ledger.json" };
    write(root, value);
    refuses(root, "duplicate destination");
  }
  {
    const root = workspace(t);
    const value = plan();
    const artifacts = value.artifacts as Record<string, unknown>[];
    artifacts[2] = { ...artifacts[2], source: ".eval/revisions/009" };
    write(root, value);
    refuses(root, "missing revision bundle source");
  }
  {
    const root = workspace(t);
    const value = plan();
    value.artifacts = (value.artifacts as Record<string, unknown>[]).filter(
      (artifact) => artifact.kind !== "terminal-attempt",
    );
    write(root, value);
    refuses(root, "incomplete attempt history");
  }
  {
    const root = workspace(t);
    symlinkSync(
      join(root, ".eval", "attempt-ledger.json"),
      join(root, ".eval", "linked-ledger.json"),
    );
    const value = plan();
    const artifacts = value.artifacts as Record<string, unknown>[];
    artifacts[0] = { ...artifacts[0], source: ".eval/linked-ledger.json" };
    write(root, value);
    refuses(root, "symbolic-link source");
  }
  assert.deepEqual(
    accepted,
    [],
    `archive utility must refuse every case; produced a manifest for: ${accepted.join("; ")}`,
  );
});
