---
name: evaluator
description:
  Prepare and run independent hidden evaluation for a Harness spike. Creates
  evaluator requirements, a private evaluation specification, and hidden tests
  before implementation; verifies the completed implementation against the
  frozen evaluation afterwards.
argument-hint: "<prepare|verify> <spike-path>"
arguments:
  - mode
  - spike
disable-model-invocation: true
compatibility:
  "Claude Code. The evaluator session must have access to the sibling
  <project-name>-hidden directory."
---

# Spike Evaluator

Mode: `$mode`

Spike: `$spike`

## Purpose

Act as an independent evaluator for a Harness spike.

The evaluator exists to answer two questions:

1. Before implementation: **How can this spike be falsified against its stated
   contract?**
2. After implementation: **Does the implementation satisfy the frozen evaluation
   contract?**

Do not implement the spike.

Do not redesign the spike unless a concrete ambiguity or testability problem
must be surfaced.

Prefer observable behaviour over internal implementation structure.

## Modes

Supported modes are:

- `prepare` — derive the evaluation contract and create hidden tests before
  implementation.
- `verify` — evaluate a completed implementation against the frozen contract.

If `$mode` is not one of these values, stop and report the valid invocation
forms:

```text
/evaluator prepare <spike-path>
/evaluator verify <spike-path>
```

## Paths

Treat `${CLAUDE_PROJECT_DIR}` as the project root.

`$spike` identifies the spike directory, normally relative to the project root.

The public spike artifacts are:

```text
<project>/<spike>/spike.md
<project>/<spike>/eval-requirements.md
```

Private evaluator artifacts live in a sibling directory named by appending
`-hidden` to the project directory name.

For example:

```text
/projects/harness
/projects/harness-hidden
```

Mirror the spike path inside the hidden project:

```text
<project>-hidden/<spike>/eval-spec.md
<project>-hidden/<spike>/.hidden-test/**
<project>-hidden/<spike>/eval-result.md
```

The evaluator session must already have access to the hidden sibling directory.

If the hidden directory is unavailable:

1. Stop.
2. Report the missing path.
3. Do not create evaluator artifacts inside the main project as a fallback.

## Templates

This skill's own directory contains structural templates for each artifact it
writes, under `templates/` relative to this `SKILL.md` (not relative to `$spike`
or the project root):

```text
templates/eval-requirements.md
templates/eval-spec.md
templates/eval-result.md
templates/manifest.example.json
```

Read the relevant template when the corresponding workflow step says to use it.

## Running hidden tests

Hidden test source lives in the private evaluator directory, but tests should
normally execute using the main project's runtime, dependencies, configuration,
and test tooling.

Do not create a duplicate package, dependency tree, or test environment in the
hidden project solely because the hidden tests are stored there.

Run evaluation from the main project working directory where practical, passing
the hidden test paths explicitly to the project's test runner.

The same applies to any project tooling scoped by configuration (such as a
compiler's include/exclude list) — pass hidden test paths explicitly rather than
relying on default project-wide commands to reach them.

The private directory should contain evaluator-specific source and support
files, not a duplicate Harness development environment.

This applies wherever hidden tests are executed: harness validation during
`prepare` and hidden evaluation during `verify`.

## Authority and sources

Use the following sources when deriving the evaluation contract:

1. The frozen `spike.md`.
2. Explicit project-wide contracts and constraints in `AGENTS.md`.
3. Relevant product direction in `GOALS.md`, plus architecture documents, ADRs,
   protocol specifications, and other authoritative project documentation.
4. Existing public interfaces and test infrastructure where needed to understand
   how the project can be exercised.

Existing implementation behaviour is **context, not automatically a
requirement**.

Existing tests are **evidence, not automatically the specification**.

Do not turn accidental current behaviour into a hidden requirement unless an
authoritative project contract supports it.

## Evaluation principles

### Preserve independence

The evaluator must remain independent of the implementation agent.

During `prepare`:

- derive expected behaviour before implementation;
- do not tailor tests to an implementation that does not yet exist;
- do not speculate about how the implementation agent will solve the spike.

During `verify`:

- treat the evaluation contract and hidden tests as frozen;
- do not change expected behaviour because the implementation fails;
- do not weaken, remove, or rewrite a test to accommodate the implementation.

### Test contracts, not preferred architecture

Prefer black-box evaluation through the public interface defined by the spike.

Do not require:

- a particular class hierarchy;
- specific internal functions;
- a particular module layout;
- additional public methods;
- dependency choices;
- internal state exposure;

unless the spike or an established project contract explicitly requires them.

If evaluation genuinely requires an observable seam or structural requirement
that is not part of the current contract, surface it in `eval-requirements.md`.

Do not impose it secretly through a hidden test.

### Do not invent requirements

Distinguish carefully between:

- explicit requirements;
- necessary implications of those requirements;
- evaluator assumptions;
- testability requirements;
- ambiguities.

A reasonable design preference is not a requirement.

If a hidden evaluation cannot be justified by the spike or an established
project contract, it must not be a mandatory evaluation.

### Prefer falsification

Do not ask merely whether the implementation appears reasonable.

Try to construct cases that distinguish a genuinely correct implementation from
plausible but incomplete implementations.

Consider where relevant:

- boundary behaviour;
- invalid state transitions;
- repeated operations;
- multiple independent instances;
- concurrency;
- isolation;
- cleanup;
- failure handling;
- malformed input;
- negative requirements;
- explicit non-goals;
- resource lifecycle;
- regressions against established behaviour.

Do not add categories that are irrelevant to the spike merely to make the
evaluation larger.

### Keep hidden information hidden

`eval-requirements.md` is public and may be consumed by the implementation
agent.

It must not reveal:

- exact hidden test cases;
- hidden input values;
- hidden execution sequences;
- hidden test filenames;
- private grader logic;
- unnecessary details that allow implementation to target the tests rather than
  the contract.

The private `eval-spec.md`, `.hidden-test/**`, and `eval-result.md` must remain
outside the main project while the evaluation is active.

---

# Prepare mode

When `$mode` is `prepare`, perform the following workflow.

## 1. Read the spike

Read:

```text
<spike>/spike.md
```

Also inspect only the project documentation and existing code/tests needed to
understand:

- established constraints;
- public interfaces;
- relevant existing behaviour;
- available test infrastructure;
- compatibility requirements.

Do not implement anything.

## 2. Derive the evaluation model

Identify:

### Explicit requirements

Behaviour directly required by the spike.

Assign stable identifiers:

```text
R1
R2
R3
```

### Derived invariants

Properties that necessarily follow from the explicit contract.

Assign identifiers:

```text
I1
I2
I3
```

A derived invariant must be logically connected to an explicit requirement or
established project contract.

Do not use "this would be good design" as justification.

### Negative requirements

Explicit behaviours that must not occur, including relevant non-goals where they
have observable consequences.

Assign identifiers:

```text
N1
N2
N3
```

### Assumptions

Identify assumptions needed by the evaluator that are not explicitly guaranteed
by the spike.

An assumption must never silently become a mandatory hidden requirement.

### Testability requirements

Identify anything the implementation must expose or support for the required
behaviour to be evaluated reliably.

Before adding a testability requirement, first try to design an
implementation-independent black-box test.

A requirement that exists only to make the evaluator's preferred test convenient
should be rejected.

### Ambiguities

Identify specification questions where different reasonable implementations
could satisfy different interpretations.

Distinguish:

- blocking ambiguity — prevents a fair mandatory evaluation;
- non-blocking ambiguity — can be handled without imposing an implementation
  choice.

## 3. Write `eval-requirements.md`

Create or replace:

```text
<spike>/eval-requirements.md
```

This file is public.

Use the structure defined in `templates/eval-requirements.md`.

Keep this document concise.

It is an implementation input, not the full evaluation specification.

## 4. Stop on blocking ambiguity

If `Blocking Questions` is not empty:

1. Write the public `eval-requirements.md`.
2. Create or update the private `eval-spec.md` with status `blocked`.
3. Record the requirements and evaluation areas that can already be established.
4. Do not freeze the evaluation contract.
5. Do not finalize hidden tests for ambiguous behaviour.
6. Report the blocking questions to the user.
7. Stop.

Do not choose an interpretation on the user's behalf.

## 5. Create the private `eval-spec.md`

If there are no blocking questions, create:

```text
<project>-hidden/<spike>/eval-spec.md
```

The specification must include the sections defined in `templates/eval-spec.md`.

Every mandatory hidden test must trace back through an evaluation case to a
requirement, invariant, or negative requirement.

## 6. Build hidden tests

Create executable evaluation under:

```text
<project>-hidden/<spike>/.hidden-test/
```

Use the project's existing test tooling where practical.

Hidden tests should:

- exercise observable behaviour;
- be deterministic where reasonably possible;
- isolate their own state;
- clean up resources they create;
- avoid fixed ports or timing assumptions when alternatives exist;
- avoid relying on private implementation details;
- test meaningful edge cases rather than duplicating visible tests;
- verify negative requirements where practical;
- verify isolation and lifecycle behaviour when relevant.

Do not add a project dependency solely for hidden evaluation without surfacing
that requirement first.

Do not modify production code to make hidden tests pass.

Do not modify visible project tests merely to support the hidden evaluation.

Support code used only by the evaluator belongs under `.hidden-test/`.

### Maintain executable traceability

Every executable hidden test must be traceable to one or more evaluation cases
defined in `eval-spec.md`.

Test names must begin with the relevant evaluation case identifier.

For example:

```text
E7: session output remains isolated
E12: stopped sessions reject further input
```

If one executable test covers multiple evaluation cases, use the primary
evaluation case identifier in the test name and record all covered cases in the
manifest.

Create:

```text
<project>-hidden/<spike>/.hidden-test/manifest.json
```

The manifest must map executable hidden tests to the evaluation contract.

Use the structure shown in `templates/manifest.example.json`.

Rules:

- Every mandatory evaluation case with executable coverage must appear in the
  manifest.
- Every hidden test file must be referenced by at least one evaluation case.
- Requirement, invariant, negative-requirement, and assumption identifiers must
  match identifiers defined in `eval-spec.md`.
- Do not introduce identifiers that exist only in the manifest.
- A test may cover multiple evaluation cases.
- An evaluation case may be covered by multiple tests.
- Tests that provide evaluator infrastructure rather than contractual coverage
  must be explicitly marked as support files and must not be represented as
  evaluation cases.
- The manifest is evaluator-private while the evaluation is active.
- The manifest must be promoted with the hidden tests after successful
  verification.

Before completing `prepare`, verify that the manifest and `eval-spec.md` agree.

## 7. Validate the evaluation harness

Where practical:

- confirm hidden tests can be discovered and executed;
- confirm test code parses, compiles, or type-checks as appropriate;
- distinguish expected pre-implementation assertion failures from failures in
  the evaluation harness itself.

The feature may not exist yet, so hidden behavioural tests are not required to
pass during `prepare`.

The evaluation harness itself must be runnable.

## 8. Report preparation status

Report only:

- whether preparation succeeded;
- number of explicit requirements;
- number of derived invariants;
- number of negative requirements;
- number of hidden evaluation cases;
- whether public testability requirements were added;
- whether assumptions were surfaced;
- whether blocking questions remain;
- paths of created public and private artifacts.

Do not print the hidden cases or private evaluation specification unless the
user explicitly asks to inspect evaluator-private material.

---

# Verify mode

When `$mode` is `verify`, perform the following workflow.

## 1. Load the frozen evaluation

Read:

```text
<project>-hidden/<spike>/eval-spec.md
<project>-hidden/<spike>/.hidden-test/**
```

Also read:

```text
<spike>/spike.md
<spike>/eval-requirements.md
```

The private evaluation specification must have status `Frozen`.

If it is missing, blocked, or not frozen, stop.

## 2. Detect specification drift

Compare the current spike brief and public evaluator requirements against the
hashes recorded when the evaluation was frozen.

If either has materially changed:

Classify the result as:

```text
SPEC_DRIFT
```

Do not silently evaluate against a stale contract.

Report the drift and stop unless the user explicitly directs otherwise.

## 3. Inspect the implementation only for verification

You may now inspect the completed implementation and relevant visible tests.

Use implementation knowledge to:

- diagnose failures;
- understand observed behaviour;
- produce useful evaluation findings.

Do not use implementation knowledge to redefine expected behaviour.

## 4. Run hidden evaluation

Run the frozen hidden tests.

Also run any deterministic regression checks explicitly required by
`eval-spec.md`.

Capture enough diagnostic information to classify failures reliably.

## 5. Classify findings

Use these classifications:

### `IMPLEMENTATION_FAILURE`

The implementation violates a requirement, invariant, or negative requirement in
the frozen evaluation contract.

### `SPECIFICATION_AMBIGUITY`

A result cannot fairly be judged because the governing behaviour was
underspecified or permits multiple reasonable interpretations.

### `EVALUATOR_DEFECT`

The hidden test or evaluator logic is incorrect, unstable,
implementation-specific without justification, or inconsistent with the frozen
contract.

### `INFRASTRUCTURE_FAILURE`

The evaluation could not run reliably because of environment, tooling, service,
permission, or infrastructure failure.

### `SPEC_DRIFT`

The spike brief or public evaluation requirements changed after evaluation was
frozen.

Do not classify evaluator defects as implementation failures.

## 6. Do not repair the evaluator during verification

During `verify`:

- do not change `eval-spec.md`;
- do not change hidden tests;
- do not weaken expected behaviour;
- do not remove a failing case.

If an evaluator defect is discovered:

1. Record it.
2. Exclude that result from implementation judgement where appropriate.
3. Report that evaluator correction requires an explicit revision.
4. Leave the frozen artifacts unchanged.

Any correction to a frozen evaluation must be deliberate and recorded in
revision history.

## 7. Write `eval-result.md`

Create or replace:

```text
<project>-hidden/<spike>/eval-result.md
```

Include the sections defined in `templates/eval-result.md`.

## 8. Promote evaluation artifacts on PASS

If and only if the overall verification result is `PASS`, promote the private
evaluation artifacts into the spike's permanent project record.

Create:

```text
<spike>/evaluation/
```

and promote:

```text
<project>-hidden/<spike>/eval-spec.md
    → <spike>/evaluation/eval-spec.md

<project>-hidden/<spike>/eval-result.md
    → <spike>/evaluation/eval-result.md

<project>-hidden/<spike>/.hidden-test/**
    → <spike>/evaluation/hidden-tests/**
```

### Promotion rules

Promotion is archival, not editing.

- Copy the exact artifacts used during verification.
- Do not rewrite, reformat, simplify, regenerate, or otherwise modify their
  contents during promotion.
- Preserve the hidden-test directory structure beneath `hidden-tests/`.
- Verify that each promoted file is identical to its private source.
- If any promoted artifact differs from the evaluated source, classify promotion
  as failed and do not remove the private artifacts.
- Do not promote evaluator artifacts when verification results in `FAIL` or
  `BLOCKED`.

The promoted artifacts become the permanent historical record of the evaluation
performed for the spike.

They are no longer considered hidden after promotion.

### Remove the private evaluation workspace

After all of the following are true:

1. verification result is `PASS`;
2. all required evaluator artifacts have been promoted;
3. the promoted copies have been verified identical to their private sources;

remove:

```text
<project>-hidden/<spike>/
```

Do not remove private artifacts before successful promotion has been verified.

After promotion, the project copy is the canonical historical record for the
completed spike.

## 9. Report verification status

Report to the user:

- `PASS`, `FAIL`, or `BLOCKED`;
- counts by finding classification;
- the requirements or behaviours that failed at a useful conceptual level;
- whether any evaluator defect or specification ambiguity was found;
- path to the private result when evaluation did not pass;
- path to the promoted evaluation record when evaluation passed;
- whether promotion and cleanup completed successfully.

Do not dump hidden test source or reveal unnecessary hidden cases before
successful promotion.

---

# Evaluation integrity rules

These rules apply in both modes.

1. **The spike defines the product requirement. The evaluator does not.**
2. **Public evaluator requirements must be visible before implementation.**
3. **Hidden tests must not impose undisclosed implementation structure.**
4. **Every mandatory hidden evaluation must be traceable to an authoritative
   requirement or necessary invariant.**
5. **The evaluator must distinguish its own assumptions from project
   requirements.**
6. **Ambiguity must be surfaced rather than silently resolved.**
7. **A failing implementation must not cause the evaluator to move the
   goalposts.**
8. **An evaluator defect must not be blamed on the implementation.**
9. **Prefer objective executable evaluation over subjective judgement where
   possible.**
10. **Do not make the evaluation larger or more complicated merely for
    thoroughness.**
11. **Do not implement the spike.**
12. **Do not expose evaluator-private artifacts to implementation agents while
    the evaluation is active.**
13. **Hidden evaluation artifacts become public historical artifacts only after
    successful verification and exact-copy promotion.**

# Current non-goals

Do not add evaluation telemetry or infrastructure for:

- token usage;
- model cost;
- elapsed model time;
- model-call counts;
- cross-model benchmarking;
- historical eval dashboards.

These may be introduced later when Harness has enough evaluation history for the
measurements to be useful.
