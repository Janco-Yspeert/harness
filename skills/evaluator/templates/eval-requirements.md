Structural template for `<spike>/eval-requirements.md`. Keep the headings;
replace each section's guidance with the derived content. If a section has
nothing to report, state that explicitly rather than omitting the heading.

# Evaluation Requirements

## Testability Requirements

List requirements the implementation agent must know in order for the spike to
be evaluated fairly.

For each item include:

- ID
- requirement
- reason
- source or justification
- implementation impact

If none, state that there are no additional testability requirements.

## Evaluator Assumptions

List assumptions that affect evaluation but do not secretly constrain internal
implementation.

For each item include:

- ID
- assumption
- reason
- evaluation impact

If none, state that there are no evaluator assumptions requiring implementation
awareness.

## Blocking Questions

List unresolved ambiguities that prevent fair evaluation.

For each item include:

- ID
- question
- why it matters
- affected requirement or evaluation area

If none, state `None`.

## Environment Requirements

List requirements needed to execute evaluation, such as external services,
environment variables, operating-system facilities, or test tooling.

Do not include hidden test cases.
