import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Verifies spike 014b Design Map "Skill <-> Contract Fidelity Matrix" targets
// that are expressible purely as static properties of the eight committed
// role contract files, independent of any implementation-chosen
// representation. Criteria: AC02 (contract-level component), AC03, AC04
// (capability component), AC10.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();
const CONTRACTS_DIR = join(PROJECT_ROOT, "methodologies/harness/contracts");

const ROLE_FILES = [
  "brief-readiness.json",
  "design-map.json",
  "evaluator-prepare.json",
  "evaluator-repair.json",
  "evaluator-verify.json",
  "implementation.json",
  "as-built.json",
  "outcome.json",
] as const;

const EVALUATOR_ROLE_FILES = new Set([
  "evaluator-prepare.json",
  "evaluator-repair.json",
  "evaluator-verify.json",
]);

function loadContract(file: string): Record<string, unknown> {
  const raw = readFileSync(join(CONTRACTS_DIR, file), "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

void test("every active role contract grants git-inspect and git-commit (AC03)", () => {
  for (const file of ROLE_FILES) {
    const contract = loadContract(file);
    const capabilities = contract.capabilities;
    assert.ok(
      Array.isArray(capabilities),
      `${file}: capabilities must be an array`,
    );
    assert.ok(
      capabilities.includes("git-inspect"),
      `${file}: capabilities must include "git-inspect"`,
    );
    assert.ok(
      capabilities.includes("git-commit"),
      `${file}: capabilities must include "git-commit"`,
    );
  }
});

void test("no active role contract grants git-publish or network capability (AC04)", () => {
  for (const file of ROLE_FILES) {
    const contract = loadContract(file);
    const capabilities = (contract.capabilities ?? []) as string[];
    assert.ok(
      !capabilities.includes("git-publish"),
      `${file}: capabilities must not include "git-publish"; publication is host-owned`,
    );
    assert.ok(
      !capabilities.some((cap) => /network|publish|credential/i.test(cap)),
      `${file}: capabilities must not include a network/publish/credential-shaped capability`,
    );
  }
});

void test("every active role contract's workspaces stay within {repository, evaluation} (AC04)", () => {
  const allowed = new Set(["repository", "evaluation"]);
  for (const file of ROLE_FILES) {
    const contract = loadContract(file);
    const workspaces = (contract.workspaces ?? []) as string[];
    assert.ok(
      Array.isArray(workspaces) && workspaces.length > 0,
      `${file}: workspaces must be a non-empty array`,
    );
    for (const ws of workspaces) {
      assert.ok(
        allowed.has(ws),
        `${file}: workspace "${ws}" is outside {repository, evaluation}`,
      );
    }
  }
});

void test("protected evaluator role contracts declare the private evaluation workspace (AC02/AC03 evaluator component)", () => {
  for (const file of EVALUATOR_ROLE_FILES) {
    const contract = loadContract(file);
    assert.equal(
      contract.protected,
      true,
      `${file}: evaluator roles must be protected: true`,
    );
    const workspaces = (contract.workspaces ?? []) as string[];
    assert.ok(
      workspaces.includes("evaluation"),
      `${file}: protected evaluator contract must declare the "evaluation" workspace`,
    );
  }
});

void test("non-evaluator active role contracts forbid evaluator-private exposure (AC02 contract component)", () => {
  for (const file of ROLE_FILES) {
    if (EVALUATOR_ROLE_FILES.has(file)) continue;
    const contract = loadContract(file);
    const forbidden = (contract.forbiddenExposure ?? []) as string[];
    assert.ok(
      forbidden.includes("evaluator-private"),
      `${file}: forbiddenExposure must include "evaluator-private"`,
    );
  }
});

void test("As-Built discrepancy categories remain artifact findings, not a methodology enum (AC10)", () => {
  const contract = loadContract("as-built.json");
  assert.deepEqual(
    contract.methodology,
    {},
    "as-built.json methodology object must stay empty; Missing/Contradictory/Extra are artifact findings only",
  );
});

void test("Design Map contract carries no invented role-specific methodology enum (INTENTIONALLY_ARTIFACT_ONLY regression guard)", () => {
  const contract = loadContract("design-map.json");
  assert.deepEqual(
    contract.methodology,
    {},
    "design-map.json methodology object must stay empty per the frozen Design Map's INTENTIONALLY_ARTIFACT_ONLY disposition",
  );
});
