Structural template for `<project>-hidden/<spike>/eval-result.md`. Keep the
headings; replace each section's guidance with the derived content.

# Evaluation Result

## Overall Result

PASS, FAIL, or BLOCKED.

## Evaluation Source

Record the immutable implementation identity and frozen evaluator revision:

- project commit evaluated (branch + commit hash), if the implementation is a
  clean commit;
- refuse evaluation represented partly by uncommitted changes;
- frozen eval-spec identity/hash;
- spike brief hash;
- Design Map and public evaluation-requirements identities;
- evaluator revision and skill version;
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

## Diagnostic Probes

If any read-only diagnostic probes were run during verification (see the skill's
"Diagnostic probes" section), record what each one checked and what it showed.
Label this evidence as supplementary — it informs classification of findings
above but is not itself frozen coverage, and it does not by itself change the
Overall Result.

If none were used, state that explicitly.

## Evaluator Integrity

Confirm whether:

- the frozen evaluation was modified during verification;
- specification drift was detected;
- any evaluator defects were discovered;
- for any `IMPLEMENTATION_FAILURE` finding, that the pre-classification
  confirmation checklist (rerun in isolation, helper integrity, setup/ teardown,
  ruling out evaluator causes) was applied.

## Overall Assessment

State whether the implementation satisfies the frozen spike evaluation contract.

## Public Feedback

State whether sanitized public implementation feedback was emitted and identify
its public path. Do not reproduce hidden evaluator mechanics here for public
use; the full result remains private until promotion.
