import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  type PreparedEvaluatorBundle,
  prepareEvaluatorBundle,
  validatePreparedEvaluatorBundle,
  validateResultAccounting,
} from "../tools/evaluator-integrity.ts";

function completeBundle(): PreparedEvaluatorBundle {
  return {
    criteria: [
      {
        id: "AC01",
        required: true,
        disposition: "required",
        procedureIds: ["E1"],
      },
      {
        id: "AC02",
        required: true,
        disposition: "required",
        procedureIds: ["S1"],
      },
    ],
    procedures: [
      {
        id: "E1",
        criterionIds: ["AC01"],
        executable: true,
        caseIds: ["case-1", "case-2"],
        requiredMaterial: ["cases/complete.test.ts", "support/fixture.ts"],
      },
      {
        id: "S1",
        criterionIds: ["AC02"],
        executable: false,
        caseIds: [],
        requiredMaterial: ["procedures/static-review.md"],
      },
    ],
    materialPaths: [
      "cases/complete.test.ts",
      "support/fixture.ts",
      "procedures/static-review.md",
    ],
    freezeInventory: [
      "cases/complete.test.ts",
      "support/fixture.ts",
      "procedures/static-review.md",
    ],
    publicCriteria: [
      { id: "AC01", required: true, procedureIds: ["E1"] },
      { id: "AC02", required: true, procedureIds: ["S1"] },
    ],
  };
}

void test("a complete prepared bundle passes through the local validator", (t) => {
  const bundle = completeBundle();
  const prepared = prepareEvaluatorBundle(bundle, "001");
  assert.deepEqual(prepared.integrity, {
    status: "PASS",
    diagnostics: [],
  });
  const readiness = prepared.readiness;
  assert.ok(readiness);
  assert.equal(readiness.integrityValidation, "PASS");
  assert.ok(readiness.privateInventoryIdentity.startsWith("sha256:"));
  assert.ok(readiness.validatorResultBinding.startsWith("sha256:"));

  const directory = mkdtempSync(join(tmpdir(), "harness-integrity-"));
  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const bundlePath = join(directory, "bundle.json");
  writeFileSync(bundlePath, JSON.stringify(bundle));
  const result = spawnSync(
    "node",
    ["tools/evaluator-integrity.ts", bundlePath],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout) as {
    integrity: { status: string; diagnostics: unknown[] };
    readiness: { integrityValidation: string };
  };
  assert.deepEqual(output.integrity, { status: "PASS", diagnostics: [] });
  assert.equal(output.readiness.integrityValidation, "PASS");
});

void test("missing procedure material is constructed in the bundle and prevents a passing preparation", () => {
  const complete = completeBundle();
  const bundle: PreparedEvaluatorBundle = {
    ...complete,
    materialPaths: complete.materialPaths.filter(
      (path) => path !== "cases/complete.test.ts",
    ),
    freezeInventory: complete.freezeInventory.filter(
      (path) => path !== "cases/complete.test.ts",
    ),
  };

  const result = validatePreparedEvaluatorBundle(bundle);
  assert.equal(result.status, "FAIL");
  assert.deepEqual(
    result.diagnostics.map((entry) => entry.code),
    ["MATERIAL_MISSING_FROM_BUNDLE", "MATERIAL_MISSING_FROM_INVENTORY"],
  );
  assert.equal(prepareEvaluatorBundle(bundle, "001").readiness, undefined);
});

void test("traceability and public projection are checked in both directions", () => {
  const complete = completeBundle();
  const [firstCriterion, secondCriterion] = complete.criteria;
  const [firstProcedure, secondProcedure] = complete.procedures;
  const [firstPublicCriterion] = complete.publicCriteria;
  assert.ok(
    firstCriterion && secondCriterion && firstProcedure && secondProcedure,
  );
  assert.ok(firstPublicCriterion);
  const bundle: PreparedEvaluatorBundle = {
    ...complete,
    criteria: [{ ...firstCriterion, procedureIds: ["E2"] }, secondCriterion],
    procedures: [
      firstProcedure,
      { ...secondProcedure, criterionIds: ["AC03"] },
    ],
    publicCriteria: [firstPublicCriterion],
  };

  const result = validatePreparedEvaluatorBundle(bundle);
  assert.equal(result.status, "FAIL");
  assert.ok(
    result.diagnostics.some(
      (entry) => entry.code === "PROCEDURE_MISSING_FROM_BUNDLE",
    ),
  );
  assert.ok(
    result.diagnostics.some(
      (entry) => entry.code === "CRITERION_MISSING_PROCEDURE",
    ),
  );
  assert.ok(result.diagnostics.length >= 4);
});

void test("non-executable evidence remains a valid prepared bundle", () => {
  const complete = completeBundle();
  const [firstProcedure, secondProcedure] = complete.procedures;
  assert.ok(firstProcedure && secondProcedure);
  const bundle: PreparedEvaluatorBundle = {
    ...complete,
    procedures: [
      { ...firstProcedure, executable: false, caseIds: [] },
      secondProcedure,
    ],
  };
  assert.equal(validatePreparedEvaluatorBundle(bundle).status, "PASS");
});

void test("result accounting is mechanically checked against the frozen bundle", () => {
  const bundle = completeBundle();
  assert.equal(
    validateResultAccounting(bundle, {
      mandatoryCases: 2,
      criterionRecords: 2,
      procedures: 2,
      executableCases: 2,
    }).status,
    "PASS",
  );
  const inconsistent = validateResultAccounting(bundle, {
    mandatoryCases: 13,
    criterionRecords: 2,
    procedures: 14,
    executableCases: 13,
  });
  assert.equal(inconsistent.status, "FAIL");
  assert.equal(inconsistent.diagnostics.length, 3);
  assert.ok(
    inconsistent.diagnostics.every(
      (entry) => entry.code === "ACCOUNTING_MISMATCH",
    ),
  );
});
