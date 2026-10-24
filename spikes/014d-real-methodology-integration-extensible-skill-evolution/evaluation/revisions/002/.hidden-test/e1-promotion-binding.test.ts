// E1 — Methodology trust promotion binds the exact N-evaluated candidate.
// Frozen authority: spike.md §4 and AC10; design-map.md C5.
// Seam: promoteMethodology(candidate, trustHistoryPath, authority) keeps its
// signature (C5); candidateMethodology/checkMethodology are the existing
// public evolution interface in src/methodology-evolution.ts.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test, { type TestContext } from "node:test";
import { cloneProject, commitPaths, git } from "./support/repo.ts";

interface Candidate {
  readonly revision: string;
  readonly manifest: { readonly id: string };
}
interface Evolution {
  buildMethodologyManifest(
    root: string,
    revision: string,
  ): { revision: string; manifest: { id: string } };
  candidateMethodology(
    root: string,
    revision: string,
    history: string,
  ): Candidate;
  checkMethodology(manifest: unknown): {
    valid: boolean;
    diagnostics: readonly unknown[];
  };
  promoteMethodology(
    candidate: Candidate,
    history: string,
    authority: unknown,
  ): unknown;
}

const SKILL = "skills/evaluator/SKILL.md";
const HISTORY = "methodologies/harness/trusted.jsonl";

function appendMarker(root: string, marker: string): void {
  const path = join(root, SKILL);
  writeFileSync(path, `${readFileSync(path, "utf8")}\n${marker}\n`);
}

void test("E1: trust promotion binds the exact candidate commit and manifest evaluated by current trusted N", async (t: TestContext) => {
  const clone = cloneProject("e1");
  t.after(() => {
    clone.dispose();
  });
  const root = clone.root;
  const evolution = (await import(
    pathToFileURL(join(root, "src", "methodology-evolution.ts")).href
  )) as Evolution;

  const t0 = clone.head;
  appendMarker(root, "<!-- evaluator fixture: trusted successor -->");
  const t1 = commitPaths(root, [SKILL], "fixture: trusted successor");
  appendMarker(root, "<!-- evaluator fixture: candidate -->");
  const c = commitPaths(root, [SKILL], "fixture: candidate");
  assert.equal(git(root, ["status", "--porcelain", "--", SKILL]), "");

  const m0 = evolution.buildMethodologyManifest(root, t0).manifest.id;
  const m1 = evolution.buildMethodologyManifest(root, t1).manifest.id;
  const history = join(root, HISTORY);
  // A legacy trusted-methodology record (no candidate binding fields) must
  // stay readable and valid (C5).
  const historyBytes =
    [
      {
        schemaVersion: 1,
        sequence: 1,
        methodology: m0,
        revision: t0,
        previous: null,
        authority: {
          kind: "human",
          evidence: "fixture:bootstrap",
          evaluation: {
            kind: "human-bootstrap",
            evidence: "fixture:bootstrap",
          },
        },
      },
      {
        schemaVersion: 1,
        sequence: 2,
        methodology: m1,
        revision: t1,
        previous: m0,
        authority: {
          kind: "human",
          evidence: "fixture:legacy-acceptance",
          evaluation: {
            kind: "trusted-methodology",
            methodology: m0,
            result: "PASS",
            evidence: "fixture:legacy-evaluation",
          },
        },
      },
    ]
      .map((event) => JSON.stringify(event))
      .join("\n") + "\n";
  writeFileSync(history, historyBytes);

  const candidate = evolution.candidateMethodology(root, c, history);
  const mc = candidate.manifest.id;
  assert.equal(candidate.revision, c);
  assert.notEqual(mc, m1);
  const coherence = evolution.checkMethodology(candidate.manifest);
  assert.equal(
    coherence.valid,
    true,
    `fixture precondition (evaluator assumption): a candidate differing only by an appended skill comment must be coherent: ${JSON.stringify(coherence.diagnostics)}`,
  );

  const authority = (
    evaluation: Record<string, unknown>,
  ): Record<string, unknown> => ({
    kind: "human",
    decision: "promote",
    evidence: "fixture:human-acceptance",
    evaluation: {
      kind: "trusted-methodology",
      methodology: m1,
      result: "PASS",
      evidence: "fixture:n-authored-pass",
      candidate: c,
      candidateMethodology: mc,
      ...evaluation,
    },
  });
  const without = (name: string): Record<string, unknown> => {
    const value = authority({});
    const evaluation = { ...(value.evaluation as Record<string, unknown>) };
    delete evaluation[name];
    return { ...value, evaluation };
  };

  const rejected: ReadonlyArray<readonly [string, unknown]> = [
    [
      "PASS for candidate A applied to B (bound commit differs)",
      authority({ candidate: t1 }),
    ],
    [
      "bound candidate manifest differs from the reconstructed manifest",
      authority({ candidateMethodology: m1 }),
    ],
    [
      "stale trusted authority evaluated the candidate",
      authority({ methodology: m0 }),
    ],
    ["self-evaluated candidate", authority({ methodology: mc })],
    [
      "trusted-methodology evaluation omits the bound candidate commit",
      without("candidate"),
    ],
    [
      "trusted-methodology evaluation omits the bound candidate manifest",
      without("candidateMethodology"),
    ],
  ];
  for (const [name, value] of rejected) {
    assert.throws(
      () => evolution.promoteMethodology(candidate, history, value),
      (error: unknown) => error instanceof Error,
      `promotion must be rejected: ${name}`,
    );
    assert.equal(
      readFileSync(history, "utf8"),
      historyBytes,
      `a rejected promotion must not change trusted history: ${name}`,
    );
  }

  evolution.promoteMethodology(candidate, history, authority({}));
  const after = readFileSync(history, "utf8");
  assert.ok(
    after.startsWith(historyBytes),
    "promotion must append without rewriting prior trusted records",
  );
  const lines = after.split("\n").filter(Boolean);
  assert.equal(lines.length, 3, "exactly one trusted event is appended");
  const appended = JSON.parse(lines[2] ?? "{}") as Record<string, unknown>;
  assert.equal(appended.methodology, mc);
  assert.equal(appended.revision, c);
  assert.equal(appended.previous, m1);
  assert.equal(appended.sequence, 3);
});
