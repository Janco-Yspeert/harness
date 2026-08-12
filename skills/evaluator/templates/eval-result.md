Structural template for `<project>-hidden/<spike>/eval-result.md`. Keep the
headings; replace each section's guidance with the derived content.

# Evaluation Result

## Overall Result

PASS, FAIL, or BLOCKED.

## Evaluation Source

Record:

- project commit evaluated;
- frozen eval-spec identity/hash;
- spike brief hash;
- evaluation timestamp when available.

## Summary

Include counts for:

- passed mandatory cases;
- failed mandatory cases;
- non-mandatory findings;
- evaluator defects;
- specification ambiguities;
- infrastructure failures.

## Findings

For each finding include:

- classification;
- affected requirement/evaluation case;
- observed behaviour;
- expected contractual behaviour;
- concise diagnostic evidence.

Do not expose unnecessary hidden-test implementation details.

## Regression Results

Record required regression checks and outcomes.

## Evaluator Integrity

Confirm whether:

- the frozen evaluation was modified during verification;
- specification drift was detected;
- any evaluator defects were discovered.

## Overall Assessment

State whether the implementation satisfies the frozen spike evaluation contract.
