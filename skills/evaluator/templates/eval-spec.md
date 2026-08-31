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
- hash of `design-map.md`;
- hash of `eval-requirements.md`;
- canonical evaluator skill path (e.g. `skills/evaluator/SKILL.md`);
- evaluator skill name and integer contract version;
- evaluator skill content identity; and
- evaluation revision identity.

## Pre-Freeze Integrity Gate

Record, before setting Status to Frozen:

- shared helpers identified and how each was independently validated;
- for each mandatory executable evaluation case, confirmation that its oracle
  measures the intended behaviour and is falsifiable (positive/negative controls
  used, where applicable);
- for each mandatory non-executable case, confirmation that its frozen
  public/manual evidence plan can establish the criterion fairly and why no
  stable implementation-independent hidden-test seam is justified;
- material runtime/OS/library/protocol assumptions validated, and how;
- confirmation the harness itself parses, compiles, and executes.

If any of the above could not be completed, do not freeze — resolve it or report
it as a blocking issue instead.

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
- coverage mode;
- corresponding hidden test files when executable;
- when not executable, why hidden coverage is not justified and what frozen
  public/manual evidence will be used instead;
- any relevant evaluator assumption.

Do not prescribe internal implementation unless required by the contract.

## Coverage Matrix

Map every mandatory R, I, and N identifier to one or more evaluation cases.

For each mandatory requirement, invariant, and negative requirement, identify:

- the evaluation case or cases that cover it;
- whether coverage is executable or manual;
- the corresponding hidden test file or files when executable coverage exists;
- the frozen reason and evidence plan when executable hidden coverage does not
  exist.

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

Record the initial frozen version and every corrected frozen revision. Preserve
the identity of the prior revision and the classified reason for correction.
