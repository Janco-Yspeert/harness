import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Criterion AC04: no migrated skill performs direct Git publication. The
// frozen brief and Design Map require worker-owned local commits only;
// "git push" (or any prose instructing the worker itself to push) must not
// survive in the eight active role skills. The orchestrator is explicitly
// not a methodology role (brief.md "Scope") and is excluded.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();

const GOVERNED_ROLE_SKILLS = [
  "skills/brief-readiness/SKILL.md",
  "skills/design-map/SKILL.md",
  "skills/evaluator/SKILL.md",
  "skills/implementation/SKILL.md",
  "skills/as-built/SKILL.md",
  "skills/outcome/SKILL.md",
];

void test("no active role skill instructs the worker to push (AC04)", () => {
  const offenders: { file: string; line: number; text: string }[] = [];
  for (const relPath of GOVERNED_ROLE_SKILLS) {
    const content = readFileSync(join(PROJECT_ROOT, relPath), "utf8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (/push/i.test(line)) {
        offenders.push({ file: relPath, line: index + 1, text: line.trim() });
      }
    });
  }
  assert.deepEqual(
    offenders,
    [],
    `"push" must not appear in any active role skill (worker-owned publication is forbidden): ${JSON.stringify(offenders)}`,
  );
});

void test("no active role skill claims git-publish as its own capability in prose (AC04 defense-in-depth)", () => {
  const offenders: string[] = [];
  for (const relPath of GOVERNED_ROLE_SKILLS) {
    const content = readFileSync(join(PROJECT_ROOT, relPath), "utf8");
    if (/git-publish/i.test(content)) offenders.push(relPath);
  }
  assert.deepEqual(
    offenders,
    [],
    `git-publish must not be claimed by: ${offenders.join(", ")}`,
  );
});
