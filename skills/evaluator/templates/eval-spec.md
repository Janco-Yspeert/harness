Structural template for `<project>-hidden/<spike>/eval-spec.md`. Keep the
headings; replace each section's guidance with the derived content.

# Evaluation Specification

## Status

Frozen.

## Source

Record:

- spike path;
- current project commit when available;
- hash of `spike.md`;
- hash of `eval-requirements.md`.

## Explicit Requirements

List R1...Rn.

For each requirement include its source.

## Derived Invariants

List I1...In.

For each invariant identify the requirement or project contract from which it is
derived.

## Negative Requirements

List N1...Nn.

## Evaluation Cases

Assign stable identifiers:

E1 E2 E3 ...

For each case include:

- purpose;
- requirements/invariants verified;
- preconditions;
- action or scenario;
- expected observable outcome;
- whether the case is mandatory;
- any relevant evaluator assumption.

Do not prescribe internal implementation unless required by the contract.

## Coverage Matrix

Map every mandatory R, I, and N identifier to one or more evaluation cases.

For each mandatory requirement, invariant, and negative requirement, identify:

- the evaluation case or cases that cover it;
- whether coverage is executable or manual;
- the corresponding hidden test file or files when executable coverage exists.

This mapping must agree with `.hidden-test/manifest.json`. Any mismatch between
the evaluation specification, manifest, and executable hidden tests is an
`EVALUATOR_DEFECT`.

Identify anything that cannot be evaluated automatically.

## Out of Scope

Explicitly record behaviours the evaluator will not judge.

## Limitations

Record known weaknesses or areas where the evaluation provides evidence rather
than strong assurance.

## Revision History

Record the initial frozen version.
