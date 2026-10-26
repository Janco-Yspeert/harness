import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Criterion AC07: the evaluator-verify contract's classification vocabulary
// must be exactly the five classifications the frozen brief fixes, and
// SPECIFICATION_DEFECT must not survive anywhere under methodologies/.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();
const METHODOLOGIES_DIR = join(PROJECT_ROOT, "methodologies");

const REQUIRED_CLASSIFICATIONS = [
  "IMPLEMENTATION_FAILURE",
  "EVALUATOR_DEFECT",
  "SPECIFICATION_AMBIGUITY",
  "SPECIFICATION_DRIFT",
  "INFRASTRUCTURE_FAILURE",
];

void test("evaluator-verify.json methodology.classification is exactly the five frozen classifications (AC07)", () => {
  const raw = readFileSync(
    join(METHODOLOGIES_DIR, "harness/contracts/evaluator-verify.json"),
    "utf8",
  );
  const contract = JSON.parse(raw) as {
    methodology?: { classification?: string[]; result?: string[] };
  };
  const classification = contract.methodology?.classification ?? [];
  const asSet = new Set(classification);
  assert.equal(
    asSet.size,
    REQUIRED_CLASSIFICATIONS.length,
    "classification must have no duplicates",
  );
  for (const required of REQUIRED_CLASSIFICATIONS) {
    assert.ok(asSet.has(required), `classification must include ${required}`);
  }
  for (const present of classification) {
    assert.ok(
      REQUIRED_CLASSIFICATIONS.includes(present),
      `classification must not include an extra value: ${present}`,
    );
  }
  assert.ok(
    !asSet.has("SPECIFICATION_DEFECT"),
    "classification must not include SPECIFICATION_DEFECT",
  );
});

void test("evaluator-verify.json methodology.result stays exactly PASS/FAIL/BLOCKED (regression guard)", () => {
  const raw = readFileSync(
    join(METHODOLOGIES_DIR, "harness/contracts/evaluator-verify.json"),
    "utf8",
  );
  const contract = JSON.parse(raw) as { methodology?: { result?: string[] } };
  const result = contract.methodology?.result ?? [];
  assert.deepEqual(new Set(result), new Set(["PASS", "FAIL", "BLOCKED"]));
});

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

void test("no file under methodologies/ contains the retired SPECIFICATION_DEFECT token (AC07)", () => {
  const offenders: string[] = [];
  for (const file of walk(METHODOLOGIES_DIR)) {
    const content = readFileSync(file, "utf8");
    if (content.includes("SPECIFICATION_DEFECT")) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    `SPECIFICATION_DEFECT must not appear in: ${offenders.join(", ")}`,
  );
});
