// Host-owned, pre-publication contracts for evaluator-authored public
// evidence. These bindings are execution-substrate policy, not methodology
// authority: the trusted validator remains the final semantic authority and
// retains its exact committed identity.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { identity, object } from "../kernel/ledger.ts";
import type { ArtifactBinders, Data } from "../kernel/model.ts";
import { validatePreparedMap } from "../methodologies/harness-public.ts";

const COVERAGE_RESULTS = [
  "SATISFIED",
  "NOT_SATISFIED",
  "NOT_ADJUDICATED",
] as const;

function fail(message: string): never {
  throw new Error(message);
}

export const hostEvidenceBinders: ArtifactBinders = {
  "verification-accounting": {
    identity: identity(readFileSync(import.meta.filename)),
    bind: (binding) => {
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
      const criteria = prepared.criteria;
      const resultValues = binding.terminalOutcomes
        .map((outcome) => outcome.methodology.result)
        .filter((value): value is string => typeof value === "string");
      const classifications = [
        ...new Set(
          binding.terminalOutcomes.flatMap(
            (outcome) => outcome.allowedMethodology.classification ?? [],
          ),
        ),
      ];
      const schema: Data = {
        schemaVersion: 1,
        type: "object",
        required: [
          "schemaVersion",
          "commit",
          "evaluatorRevision",
          "result",
          "coverageResults",
        ],
        properties: {
          schemaVersion: { const: 1 },
          commit: { const: binding.inputs.candidate },
          evaluatorRevision: { const: binding.inputs.evaluatorRevision },
          result: { enum: resultValues },
          classification: { enum: classifications },
          coverageResults: {
            type: "object",
            required: criteria.map((criterion) => criterion.id),
            additionalProperties: false,
            properties: Object.fromEntries(
              criteria.map((criterion) => [
                criterion.id,
                { enum: [...COVERAGE_RESULTS] },
              ]),
            ),
          },
        },
        resultRules: Object.fromEntries(
          resultValues.map((result) => [
            result,
            result === "PASS"
              ? { absent: ["classification"] }
              : { required: ["classification"] },
          ]),
        ),
        // Explanatory diagnostics remain permitted, but never replace the
        // canonical accounting projection above.
        additionalProperties: true,
      };
      return {
        schema,
        validate: (document) => {
          const result = object(document);
          if (
            result.schemaVersion !== 1 ||
            result.commit !== binding.inputs.candidate ||
            result.evaluatorRevision !== binding.inputs.evaluatorRevision ||
            typeof result.result !== "string" ||
            !resultValues.includes(result.result)
          )
            fail("verification result identity mismatch");
          if (result.result === "PASS" && result.classification !== undefined)
            fail("PASS verification must not carry a classification");
          if (
            result.result !== "PASS" &&
            (typeof result.classification !== "string" ||
              !classifications.includes(result.classification))
          )
            fail("non-PASS verification requires an allowed classification");
          const results = object(result.coverageResults);
          if (
            Object.keys(results).length !== criteria.length ||
            !criteria.every((criterion) => Object.hasOwn(results, criterion.id))
          )
            fail(
              "verification coverage must account for every prepared criterion",
            );
          if (
            criteria.some(
              (criterion) =>
                !COVERAGE_RESULTS.includes(
                  results[criterion.id] as (typeof COVERAGE_RESULTS)[number],
                ),
            )
          )
            fail("verification coverage contains an unknown disposition");
          if (
            result.result === "PASS" &&
            criteria.some(
              (criterion) =>
                criterion.required && results[criterion.id] !== "SATISFIED",
            )
          )
            fail("PASS requires every required criterion to be satisfied");
        },
      };
    },
  },
};
