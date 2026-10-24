import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test, { type TestContext } from "node:test";

// Criterion AC12/AC13 (post-verification repair D01): promoteMethodology must
// reject a candidate whose `.manifest` does not actually correspond to its
// own `.revision` (e.g. a caller-supplied candidate object splicing the
// manifest from one commit onto the revision identity of another). Without
// this, a trusted-history entry could record a methodology identity that
// does not match the revision it claims to have come from, defeating the
// coherent-identity guarantee frozen brief section 6 requires. This uses
// only the already-exported public API (buildMethodologyManifest,
// candidateMethodology, promoteMethodology) — no new field or seam.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();

function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Repair test",
      GIT_AUTHOR_EMAIL: "repair-test@example.invalid",
      GIT_COMMITTER_NAME: "Repair test",
      GIT_COMMITTER_EMAIL: "repair-test@example.invalid",
    },
  }).trim();
}

function commit(root: string, message: string): string {
  git(root, ["add", "."]);
  git(root, ["commit", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}

interface CandidateMethodology {
  readonly revision: string;
  readonly manifest: { readonly id: string };
  readonly trustedIdentity: string | null;
}

interface MethodologyEvolutionModule {
  buildMethodologyManifest(
    repositoryRoot: string,
    revision: string,
  ): { revision: string; manifest: { id: string } };
  candidateMethodology(
    repositoryRoot: string,
    revision: string,
    trustHistoryPath: string,
  ): CandidateMethodology;
  promoteMethodology(
    candidate: CandidateMethodology,
    trustHistoryPath: string,
    authority: unknown,
  ): unknown;
}

async function loadModule(): Promise<MethodologyEvolutionModule> {
  const url = pathToFileURL(
    join(PROJECT_ROOT, "src", "methodology-evolution.ts"),
  ).href;
  return (await import(url)) as MethodologyEvolutionModule;
}

void test("promotion rejects a candidate whose manifest does not correspond to its own revision (D01)", async (t: TestContext) => {
  const mod = await loadModule();
  const directory = mkdtempSync(join(tmpdir(), "harness-d01-test-"));
  const root = join(directory, "repository");
  mkdirSync(root);
  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  cpSync(join(PROJECT_ROOT, "methodologies"), join(root, "methodologies"), {
    recursive: true,
  });
  cpSync(join(PROJECT_ROOT, "skills"), join(root, "skills"), {
    recursive: true,
  });
  mkdirSync(join(root, "src", "methodologies"), { recursive: true });
  cpSync(
    join(PROJECT_ROOT, "src", "methodologies", "harness-public.ts"),
    join(root, "src", "methodologies", "harness-public.ts"),
  );
  git(root, ["init", "-b", "main"]);
  const baseline = commit(root, "trusted methodology");
  const baselineIdentity = mod.buildMethodologyManifest(root, baseline).manifest
    .id;
  const history = join(directory, "trusted.jsonl");
  writeFileSync(
    history,
    `${JSON.stringify({
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
    })}\n`,
  );

  writeFileSync(
    join(root, "skills", "evaluator", "SKILL.md"),
    `${git(root, ["show", `${baseline}:skills/evaluator/SKILL.md`])}\nGenuine candidate marker.\n`,
  );
  const genuineRevision = commit(root, "genuine candidate methodology");
  const genuineCandidate = mod.candidateMethodology(
    root,
    genuineRevision,
    history,
  );

  writeFileSync(
    join(root, "skills", "evaluator", "SKILL.md"),
    `${git(root, ["show", `${genuineRevision}:skills/evaluator/SKILL.md`])}\nA second, different edit.\n`,
  );
  const otherRevision = commit(root, "a different later revision");

  // Splice: claim the "revision" of the later commit, but keep the
  // "manifest" that was actually built from the earlier genuine candidate
  // commit. A caller (or a hand-edited candidate.json) could produce this.
  const splicedCandidate = {
    ...genuineCandidate,
    revision: otherRevision,
  };

  assert.throws(
    () =>
      mod.promoteMethodology(splicedCandidate, history, {
        kind: "human",
        decision: "promote",
        evidence: "human:test",
        evaluation: {
          kind: "trusted-methodology",
          methodology: baselineIdentity,
          result: "PASS",
          evidence: "evaluation:test",
        },
      }),
    "promotion must reject a candidate whose manifest was not actually built from its claimed revision",
  );
});
