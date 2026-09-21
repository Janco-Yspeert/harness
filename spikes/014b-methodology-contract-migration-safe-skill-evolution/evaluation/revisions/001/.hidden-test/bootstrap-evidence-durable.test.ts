import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Criterion AC17: the 014b bootstrap exception, frozen evaluator/
// implementation identities, human-authored Design Map authority, and
// bootstrap baseline must remain durably recorded through to the final
// candidate commit, not deleted or silently rewritten during migration work.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();
const SPIKE_DIR = join(
  PROJECT_ROOT,
  "spikes/014b-methodology-contract-migration-safe-skill-evolution",
);

void test("bootstrap authority record exists and preserves its recorded identities (AC17)", () => {
  const authorityPath = join(SPIKE_DIR, "bootstrap/authority.md");
  assert.ok(existsSync(authorityPath), "bootstrap/authority.md must exist");
  const content = readFileSync(authorityPath, "utf8");

  assert.ok(
    content.includes("e2bd3fa35ddb76935bf811cc7cbaed3d383abd32"),
    "authority.md must preserve the recorded bootstrap baseline commit",
  );
  assert.ok(
    content.includes(
      "sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802".replace(
        "sha256:",
        "",
      ),
    ) ||
      content.includes(
        "5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802",
      ),
    "authority.md must preserve the recorded frozen evaluator SKILL.md content identity",
  );
  assert.ok(
    content.includes(
      "bd10992f2d46103e603063230fe2c7dc150f876cee14e23b320a669312682605",
    ),
    "authority.md must preserve the recorded frozen implementation SKILL.md content identity",
  );
});

void test("frozen public brief and Design Map remain present (AC17)", () => {
  assert.ok(existsSync(join(SPIKE_DIR, "spike.md")), "spike.md must exist");
  assert.ok(
    existsSync(join(SPIKE_DIR, "design-map.md")),
    "design-map.md must exist",
  );
});
