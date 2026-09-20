// Public Harness methodology validation, shared by the legacy artifact recorder
// and configured kernel. This module never opens private evaluator material.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { identity, object, required } from "../kernel/ledger.ts";
import type { ArtifactValidators } from "../kernel/model.ts";
function fail(message: string): never {
  throw new Error(message);
}
export const harnessValidators: ArtifactValidators = {
  "prepared-coverage": {
    identity: identity(readFileSync(import.meta.filename)),
    validate: (document) => {
      validatePreparedMap(document);
    },
  },
  "verification-accounting": {
    identity: identity(readFileSync(import.meta.filename)),
    validate: (document, context) => {
      const binding = required(
        context,
        "verification requires its role-grant context",
      );
      const bytes = readFileSync(
        resolve(
          binding.projectRoot,
          binding.workflowDirectory,
          "coverage-map.json",
        ),
      );
      if (identity(bytes) !== binding.inputs.coverage)
        fail("verification coverage differs from the pinned Role Grant");
      const prepared = validatePreparedMap(JSON.parse(bytes.toString("utf8")));
      const result = object(document);
      if (
        result.schemaVersion !== 1 ||
        result.commit !== binding.inputs.candidate ||
        result.evaluatorRevision !== binding.inputs.evaluatorRevision ||
        result.result !== binding.result.result
      )
        fail("verification result identity mismatch");
      const results = object(result.coverageResults);
      if (
        Object.keys(results).length !== prepared.criteria.length ||
        !prepared.criteria.every((c) => Object.hasOwn(results, c.id))
      )
        fail("verification coverage must account for every prepared criterion");
      if (
        result.result === "PASS" &&
        prepared.criteria.some(
          (c) => c.required && results[c.id] !== "SATISFIED",
        )
      )
        fail("PASS requires every required criterion to be satisfied");
    },
  },
};
interface CriterionRecord {
  readonly id: string;
  readonly frozenAuthority: string;
  readonly mode: string;
  readonly required: boolean;
  readonly procedures: readonly string[];
  readonly sufficiency: string;
}
interface ReadinessAttestation {
  readonly evaluatorRevision: string;
  readonly privateInventoryIdentity: string;
  readonly validatorResultBinding: string;
}
interface PreparedMap {
  readonly readiness: ReadinessAttestation;
  readonly criteria: readonly CriterionRecord[];
}
function requiredText(
  container: { readonly [key: string]: unknown },
  name: string,
  context: string,
): string {
  const raw = container[name];
  if (typeof raw !== "string" || raw.trim().length === 0)
    fail(`${context} is missing ${name}`);
  return raw;
}
// Deterministic public structural check that stands behind `evaluation-prepared`
// and `verification-allocated`: every material criterion carries its own record
// with frozen-authority provenance, an evidence-procedure link, and a
// criterion-specific sufficiency reason, and the map carries a passing
// pre-freeze readiness attestation. It never inspects private evaluator content.
export function validatePreparedMap(document: unknown): PreparedMap {
  if (
    typeof document !== "object" ||
    document === null ||
    Array.isArray(document)
  )
    fail("evaluation-prepared requires a readable coverage map");
  const map = document as { readonly [key: string]: unknown };
  const criteria = map.criteria;
  if (!Array.isArray(criteria) || criteria.length === 0)
    fail("evaluation-prepared requires at least one criterion record");
  const records = criteria.map((entry): CriterionRecord => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry))
      fail("Each criterion record must be an object");
    const record = entry as { readonly [key: string]: unknown };
    const id = requiredText(record, "id", "Criterion record");
    const context = `Criterion record ${id}`;
    const frozenAuthority = requiredText(record, "frozenAuthority", context);
    const mode = requiredText(record, "mode", context);
    const sufficiency = requiredText(record, "sufficiency", context);
    if (typeof record.required !== "boolean")
      fail(`${context} is missing a required disposition`);
    const procedures = record.procedures;
    if (
      !Array.isArray(procedures) ||
      procedures.length === 0 ||
      !procedures.every(
        (item) => typeof item === "string" && item.trim().length > 0,
      )
    )
      fail(`${context} is missing evidence procedure traceability`);
    if (mode === "BLOCKED") fail(`${context} has blocked coverage`);
    return {
      id,
      frozenAuthority,
      mode,
      required: record.required,
      procedures: procedures as string[],
      sufficiency,
    };
  });
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length)
    fail("evaluation-prepared requires unique criterion records");
  const readiness = map.readiness;
  if (
    typeof readiness !== "object" ||
    readiness === null ||
    Array.isArray(readiness)
  )
    fail("evaluation-prepared requires a readiness attestation");
  const attestation = readiness as { readonly [key: string]: unknown };
  const evaluatorRevision = requiredText(
    attestation,
    "evaluatorRevision",
    "Readiness attestation",
  );
  const privateInventoryIdentity = requiredText(
    attestation,
    "privateInventoryIdentity",
    "Readiness attestation",
  );
  const validatorResultBinding = requiredText(
    attestation,
    "validatorResultBinding",
    "Readiness attestation",
  );
  if (attestation.integrityValidation !== "PASS")
    fail("evaluation-prepared requires a passing readiness attestation");
  return {
    readiness: {
      evaluatorRevision,
      privateInventoryIdentity,
      validatorResultBinding,
    },
    criteria: records,
  };
}
