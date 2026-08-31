import { createHash } from "node:crypto";

export type DiagnosticCode =
  | "ACCOUNTING_MISMATCH"
  | "CRITERION_MISSING_DISPOSITION"
  | "CRITERION_MISSING_PROCEDURE"
  | "MATERIAL_MISSING_FROM_BUNDLE"
  | "MATERIAL_MISSING_FROM_INVENTORY"
  | "PROCEDURE_MISSING_CRITERION"
  | "PROCEDURE_MISSING_FROM_BUNDLE"
  | "PROCEDURE_MISSING_FROM_CRITERION"
  | "PROCEDURE_MISSING_MATERIAL";

export interface IntegrityDiagnostic {
  readonly code: DiagnosticCode;
  readonly message: string;
}

export interface PreparedCriterion {
  readonly id: string;
  readonly required: boolean;
  readonly disposition?: string;
  readonly procedureIds: readonly string[];
}

export interface PreparedProcedure {
  readonly id: string;
  readonly criterionIds: readonly string[];
  readonly executable: boolean;
  readonly caseIds: readonly string[];
  readonly requiredMaterial: readonly string[];
}

export interface PreparedEvaluatorBundle {
  readonly criteria: readonly PreparedCriterion[];
  readonly procedures: readonly PreparedProcedure[];
  readonly materialPaths: readonly string[];
  readonly freezeInventory: readonly string[];
  readonly publicCriteria: readonly {
    readonly id: string;
    readonly required: boolean;
    readonly procedureIds: readonly string[];
  }[];
}

export interface ResultAccounting {
  readonly mandatoryCases: number;
  readonly criterionRecords: number;
  readonly procedures: number;
  readonly executableCases: number;
}

export interface IntegrityResult {
  readonly status: "PASS" | "FAIL";
  readonly diagnostics: readonly IntegrityDiagnostic[];
}

export interface ReadinessAttestation {
  readonly evaluatorRevision: string;
  readonly privateInventoryIdentity: string;
  readonly validatorResultBinding: string;
  readonly integrityValidation: "PASS";
}

export interface PreparationOutcome {
  readonly integrity: IntegrityResult;
  readonly readiness?: ReadinessAttestation;
}

function diagnostic(
  code: DiagnosticCode,
  message: string,
): IntegrityDiagnostic {
  return { code, message };
}

function sameMembers(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((item) => right.includes(item)) &&
    right.every((item) => left.includes(item))
  );
}

function opaqueIdentity(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

/**
 * Validates the actual structures that will be frozen for one evaluator
 * revision. It is deliberately side-effect-free: a failed draft remains an
 * unfrozen draft, and callers can repair every reported defect before retrying.
 */
export function validatePreparedEvaluatorBundle(
  bundle: PreparedEvaluatorBundle,
): IntegrityResult {
  const diagnostics: IntegrityDiagnostic[] = [];
  const procedures = new Map(
    bundle.procedures.map((procedure) => [procedure.id, procedure]),
  );
  const criteria = new Map(
    bundle.criteria.map((criterion) => [criterion.id, criterion]),
  );
  const material = new Set(bundle.materialPaths);
  const inventory = new Set(bundle.freezeInventory);

  for (const criterion of bundle.criteria) {
    if (criterion.required && !criterion.disposition?.trim()) {
      diagnostics.push(
        diagnostic(
          "CRITERION_MISSING_DISPOSITION",
          `Required criterion ${criterion.id} is missing a disposition`,
        ),
      );
    }
    if (criterion.required && criterion.procedureIds.length === 0) {
      diagnostics.push(
        diagnostic(
          "CRITERION_MISSING_PROCEDURE",
          `Required criterion ${criterion.id} has no prepared procedure`,
        ),
      );
    }
    for (const procedureId of criterion.procedureIds) {
      const procedure = procedures.get(procedureId);
      if (!procedure) {
        diagnostics.push(
          diagnostic(
            "PROCEDURE_MISSING_FROM_BUNDLE",
            `Criterion ${criterion.id} references missing procedure ${procedureId}`,
          ),
        );
      } else if (!procedure.criterionIds.includes(criterion.id)) {
        diagnostics.push(
          diagnostic(
            "PROCEDURE_MISSING_FROM_CRITERION",
            `Procedure ${procedureId} does not map back to criterion ${criterion.id}`,
          ),
        );
      }
    }
  }

  for (const procedure of bundle.procedures) {
    if (procedure.criterionIds.length === 0) {
      diagnostics.push(
        diagnostic(
          "PROCEDURE_MISSING_CRITERION",
          `Procedure ${procedure.id} has no criterion mapping`,
        ),
      );
    }
    for (const criterionId of procedure.criterionIds) {
      const criterion = criteria.get(criterionId);
      if (!criterion) {
        diagnostics.push(
          diagnostic(
            "CRITERION_MISSING_PROCEDURE",
            `Procedure ${procedure.id} references missing criterion ${criterionId}`,
          ),
        );
      } else if (!criterion.procedureIds.includes(procedure.id)) {
        diagnostics.push(
          diagnostic(
            "PROCEDURE_MISSING_CRITERION",
            `Criterion ${criterionId} does not map to procedure ${procedure.id}`,
          ),
        );
      }
    }
    for (const materialPath of procedure.requiredMaterial) {
      if (!material.has(materialPath)) {
        diagnostics.push(
          diagnostic(
            "MATERIAL_MISSING_FROM_BUNDLE",
            `Procedure ${procedure.id} requires absent material ${materialPath}`,
          ),
        );
      }
      if (!inventory.has(materialPath)) {
        diagnostics.push(
          diagnostic(
            "MATERIAL_MISSING_FROM_INVENTORY",
            `Procedure ${procedure.id} requires material ${materialPath} outside the freeze inventory`,
          ),
        );
      }
    }
  }

  const publicCriteria = new Map(
    bundle.publicCriteria.map((criterion) => [criterion.id, criterion]),
  );
  for (const criterion of bundle.criteria) {
    const projection = publicCriteria.get(criterion.id);
    if (
      !projection ||
      projection.required !== criterion.required ||
      !sameMembers(projection.procedureIds, criterion.procedureIds)
    ) {
      diagnostics.push(
        diagnostic(
          "PROCEDURE_MISSING_FROM_CRITERION",
          `Public criterion projection does not match prepared criterion ${criterion.id}`,
        ),
      );
    }
  }
  for (const projection of bundle.publicCriteria) {
    if (!criteria.has(projection.id)) {
      diagnostics.push(
        diagnostic(
          "CRITERION_MISSING_PROCEDURE",
          `Public criterion projection ${projection.id} has no prepared criterion`,
        ),
      );
    }
  }

  return {
    status: diagnostics.length === 0 ? "PASS" : "FAIL",
    diagnostics,
  };
}

/**
 * Produces public-safe readiness data from a passing structural validation.
 * A failing draft has no readiness attestation to freeze or record.
 */
export function prepareEvaluatorBundle(
  bundle: PreparedEvaluatorBundle,
  evaluatorRevision: string,
): PreparationOutcome {
  const integrity = validatePreparedEvaluatorBundle(bundle);
  if (integrity.status === "FAIL") return { integrity };
  const privateInventoryIdentity = opaqueIdentity(
    [...bundle.freezeInventory].sort(),
  );
  return {
    integrity,
    readiness: {
      evaluatorRevision,
      privateInventoryIdentity,
      validatorResultBinding: opaqueIdentity({
        evaluatorRevision,
        privateInventoryIdentity,
        integrity,
      }),
      integrityValidation: "PASS",
    },
  };
}

export function validateResultAccounting(
  bundle: PreparedEvaluatorBundle,
  accounting: ResultAccounting,
): IntegrityResult {
  const expected: ResultAccounting = {
    mandatoryCases: bundle.procedures.reduce(
      (count, procedure) => count + procedure.caseIds.length,
      0,
    ),
    criterionRecords: bundle.criteria.length,
    procedures: bundle.procedures.length,
    executableCases: bundle.procedures
      .filter((procedure) => procedure.executable)
      .reduce((count, procedure) => count + procedure.caseIds.length, 0),
  };
  const diagnostics = (Object.keys(expected) as (keyof ResultAccounting)[])
    .filter((name) => accounting[name] !== expected[name])
    .map((name) =>
      diagnostic(
        "ACCOUNTING_MISMATCH",
        `Result accounting ${name} is ${String(accounting[name])}; frozen bundle requires ${String(expected[name])}`,
      ),
    );
  return { status: diagnostics.length === 0 ? "PASS" : "FAIL", diagnostics };
}

function isMainModule(): boolean {
  return (
    process.argv[1] !== undefined && import.meta.filename === process.argv[1]
  );
}

if (isMainModule()) {
  const [bundlePath] = process.argv.slice(2);
  if (bundlePath === undefined || process.argv.length !== 3) {
    process.stderr.write(
      "Usage: node tools/evaluator-integrity.ts <bundle.json>\n",
    );
    process.exitCode = 1;
  } else {
    try {
      const bundle = JSON.parse(
        (await import("node:fs")).readFileSync(bundlePath, "utf8"),
      ) as PreparedEvaluatorBundle;
      process.stdout.write(
        `${JSON.stringify(prepareEvaluatorBundle(bundle, "draft"))}\n`,
      );
    } catch (error: unknown) {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    }
  }
}
