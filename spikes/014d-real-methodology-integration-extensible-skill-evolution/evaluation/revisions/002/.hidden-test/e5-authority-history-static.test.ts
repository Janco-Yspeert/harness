// E5 — Committed authority and history are not rewritten or pre-empted.
// Frozen authority: spike.md §4, "Do not do", AC09 and AC10; design-map.md C1
// and Invariants ("No runtime policy, trust record or code path encodes a
// spike or version ID or a 014d-specific exception"; "The final trust event
// occurs only after explicit human approval"); design-map.md C6 (the
// orchestrator is not a policy role or methodology-manifest component; each
// candidate revision bumps its Contract version and adds a
// docs/history/skills/orchestrator/ entry, following the repository's
// docs/history/skills/README.md convention of preserving the exact prior
// contract).
// Compared against the brief-freeze commit recorded in design-map.md.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { PROJECT_ROOT, git } from "./support/repo.ts";

const BRIEF_FREEZE = "047daacb683203bbd3ebb2bd808cff3404e60042";
const TRUSTED = "methodologies/harness/trusted.jsonl";

function show(revision: string, path: string): Buffer {
  return execFileSync("git", ["show", `${revision}:${path}`], {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
}

function walk(directory: string, accept: (path: string) => boolean): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return walk(path, accept);
    return accept(path) ? [path] : [];
  });
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

void test("E5a: trusted history is byte-unchanged at the candidate (no pre-approval trust event)", () => {
  assert.equal(
    git(PROJECT_ROOT, ["merge-base", "--is-ancestor", BRIEF_FREEZE, "HEAD"]),
    "",
    "the candidate descends from the brief-freeze commit",
  );
  const frozen = show(BRIEF_FREEZE, TRUSTED);
  const candidate = show("HEAD", TRUSTED);
  assert.ok(
    candidate.equals(frozen),
    "trusted.jsonl at the candidate is byte-identical to the brief-freeze history",
  );
  const latest = JSON.parse(
    frozen.toString("utf8").trim().split("\n").at(-1) ?? "{}",
  ) as { sequence: number; methodology: string; revision: string };
  assert.equal(latest.sequence, 4);
  assert.equal(
    latest.methodology,
    "sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48",
  );
  assert.equal(latest.revision, "0a3dafe8e103cc7376bdd7fae32493710613d0c0");
});

void test("E5b: existing 014c spike history is not rewritten", () => {
  const changed = git(PROJECT_ROOT, [
    "diff",
    "--name-status",
    "--diff-filter=MDRT",
    BRIEF_FREEZE,
    "HEAD",
    "--",
    "spikes/014c-governed-executor-integration",
  ]);
  assert.equal(changed, "", "no existing 014c file is modified or deleted");
});

const ORCHESTRATOR = "skills/orchestrator/SKILL.md";
const ORCHESTRATOR_HISTORY = "docs/history/skills/orchestrator/";

void test("E5d: the orchestrator stays outside trusted methodology (not a policy role or manifest component)", async () => {
  const head = git(PROJECT_ROOT, ["rev-parse", "HEAD"]);
  const policy = show(head, "methodologies/harness/policy.json").toString(
    "utf8",
  );
  assert.ok(
    !policy.includes("skills/orchestrator"),
    "methodologies/harness/policy.json does not configure the orchestrator as a role",
  );
  const evolution = (await import(
    pathToFileURL(join(PROJECT_ROOT, "src", "methodology-evolution.ts")).href
  )) as {
    buildMethodologyManifest(root: string, revision: string): unknown;
  };
  const manifest = JSON.stringify(
    evolution.buildMethodologyManifest(PROJECT_ROOT, head),
  );
  assert.ok(
    !manifest.includes("skills/orchestrator"),
    "the candidate methodology manifest has no orchestrator component",
  );
});

function contractVersion(bytes: Buffer, label: string): number {
  const match = /^Contract version:\s*(\d+)\s*$/m.exec(bytes.toString("utf8"));
  assert.ok(match, `${label} declares its Contract version`);
  return Number(match[1]);
}

void test("E5e: a revised orchestrator bumps its contract version and preserves the prior contract as history", () => {
  const frozen = show(BRIEF_FREEZE, ORCHESTRATOR);
  const candidate = show("HEAD", ORCHESTRATOR);
  if (candidate.equals(frozen)) return;
  assert.ok(
    contractVersion(candidate, "candidate orchestrator") >
      contractVersion(frozen, "brief-freeze orchestrator"),
    "a revised orchestrator increments its Contract version",
  );
  const added = git(PROJECT_ROOT, [
    "diff",
    "--name-only",
    "--diff-filter=A",
    BRIEF_FREEZE,
    "HEAD",
    "--",
    ORCHESTRATOR_HISTORY,
  ])
    .split("\n")
    .filter(Boolean);
  assert.ok(
    added.some((path) => show("HEAD", path).equals(frozen)),
    `a new ${ORCHESTRATOR_HISTORY} entry preserves the exact prior orchestrator contract (added: ${added.join(", ") || "none"})`,
  );
});

void test("E5c: runtime policy, trust records, project configuration and code encode no spike-specific exception", () => {
  const spikeId =
    /014d|real-methodology-integration-extensible-skill-evolution/i;
  const configuration = [
    ...walk(join(PROJECT_ROOT, "methodologies"), (p) =>
      /\.(json|jsonl)$/.test(p),
    ),
    join(PROJECT_ROOT, "harness.project.json"),
  ];
  for (const path of configuration)
    assert.doesNotMatch(
      readFileSync(path, "utf8"),
      spikeId,
      `${relative(PROJECT_ROOT, path)} must not encode the 014d spike identity`,
    );
  const code = [
    ...walk(join(PROJECT_ROOT, "src"), (p) => p.endsWith(".ts")),
    ...walk(join(PROJECT_ROOT, "tools"), (p) => p.endsWith(".ts")),
  ];
  for (const path of code)
    assert.doesNotMatch(
      stripComments(readFileSync(path, "utf8")),
      spikeId,
      `${relative(PROJECT_ROOT, path)} must not encode the 014d spike identity in code`,
    );
});
