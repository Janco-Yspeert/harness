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

## Formatting

Where the project defines a formatter or format-check command (for example
`npm run format` / `npm run format:check`), run it over any file the evaluator
writes — public (`eval-requirements.md`) or private (`eval-spec.md`,
`eval-result.md`, hidden test source) — before treating that artifact as
finished, and before computing or recording any hash of it.

This matters more than ordinary tidiness here: `eval-spec.md` records a hash of
`eval-requirements.md` at freeze time, and `verify` compares that hash against
the current file to detect `SPEC_DRIFT`. Formatting a public artifact _after_
its hash has already been frozen changes that hash and produces a false-positive
drift report on the next `verify` — so format first, then hash, then freeze, not
the other way around.

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

### Minimize evaluator cleverness

Prefer direct use of standard libraries and the project's existing test tooling
over bespoke evaluator machinery.

Create shared evaluator abstractions (helpers, harnesses, wrappers) only when
they materially improve reliability or reduce meaningful duplication — not by
default.

Keep helper behaviour small, explicit, and independently testable. A helper that
is hard to reason about in isolation is a likely source of the kind of silent,
cross-cutting evaluator defect this skill exists to prevent (see the pre-freeze
integrity gate below).

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

### Material runtime assumptions

If a mandatory evaluation case depends on non-obvious behaviour of the operating
system, process or session semantics, the runtime, a library, a protocol, or
external tooling, validate that assumption empirically now, where practical,
rather than relying on evaluator intuition — a small diagnostic script that
exercises the real behaviour beats an assumption carried silently into a hidden
test.

If validation exposes ambiguity in the spike's own contract, record it under
Ambiguities (and Blocking Questions if it prevents fair mandatory evaluation)
rather than silently resolving it in either direction.

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

Record evaluator-skill provenance in the `Source` section: the canonical
evaluator skill path (this file's repository-relative path) and its revision —
prefer a git commit hash for the repository at freeze time; if this skill file
itself is uncommitted or locally modified, record its own content hash instead
(e.g. via `git hash-object`) and say so. This makes it possible to determine
which evaluator-skill version produced a historical evaluation attempt.

Do not set `Status` to `Frozen` yet — the pre-freeze integrity gate below must
pass first.

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
  evaluation cases. This includes shared helpers and the helper integrity
  self-checks required by the pre-freeze integrity gate below — they are
  evaluator infrastructure, not evaluation cases.
- The manifest is evaluator-private while the evaluation is active.
- The manifest must be promoted with the hidden tests after successful
  verification.

Before completing `prepare`, verify that the manifest and `eval-spec.md` agree.

## 7. Pre-freeze evaluator integrity gate

Do not set `eval-spec.md`'s `Status` to `Frozen` while any check below is
failing. A failing check is handled the same way as a blocking ambiguity: fix
it, or stop and report it — do not freeze around it.

### Validate shared helpers

- Identify non-trivial shared evaluator helpers (parsing, connection setup,
  process/PTY control, timing, polling, cleanup, and similar support code used
  by more than one evaluation case).
- Independently validate each one where practical — a small, isolated check that
  the helper does what it claims, separate from the mandatory cases that depend
  on it.
- Structure hidden tests so that a single helper defect cannot silently
  invalidate more mandatory cases than necessary: keep helpers small and
  single-purpose rather than routing every case through one large do-everything
  utility unless that's genuinely required.
- Helper integrity self-checks are evaluator infrastructure, not evaluation
  cases — mark them as support in `manifest.json`, never as contractual coverage
  (see the manifest rules above).
- If a helper is exercised through an asynchronous boundary by the mandatory
  cases that depend on it — WebSocket, network transport, event queue,
  subprocess stream, callback scheduling, or similar — validate it through that
  same boundary. A helper passing in isolation (called directly, in-process,
  with no boundary crossed) is not sufficient evidence that an end-to-end oracle
  built on top of it is valid; the isolated check and the real usage can pass
  and fail for different reasons.
- More generally: where shared evaluator machinery is exercised through a
  materially different production path than in its helper self-tests — a
  different transport, call site, serialization step, process boundary, or
  similar, not only an asynchronous one — preparation must include at least one
  end-to-end integrity check that exercises the real path the mandatory cases
  actually use. A self-test that only proves the helper's own logic in isolation
  does not prove it behaves the same way when driven through that real path.

### Validate oracle and falsifiability, per mandatory case

For every mandatory evaluation case, before freezing, check that:

- the assertion measures the intended behaviour, not a proxy for it;
- a correct implementation can realistically satisfy it;
- an incorrect implementation can realistically fail it;
- unrelated runtime behaviour cannot reasonably produce the same observed
  signal;
- the evaluator is not confusing transport noise, command echo, logs, shell
  behaviour, timing artefacts, or other environmental output with the behaviour
  under test.

Where an assertion depends on data crossing an asynchronous boundary —
WebSocket, network transport, event queue, subprocess stream, callback
scheduling, or similar — validate the assertion through that same boundary, not
only against an isolated helper. Do not assume that an operation such as
`send()`, `write()`, or event emission is a delivery barrier unless the
underlying contract explicitly guarantees synchronous delivery. Assertions
against downstream state must synchronize on an observable acknowledgment,
event, eventual condition, or other contract-valid signal instead of on the mere
act of initiating the operation.

Where a case relies on custom parsing, markers, asynchronous output, PTYs,
processes, WebSockets, timing, or similar mechanisms, use a positive control
(confirm the assertion can pass) and/or a negative control (confirm the exact
signal being matched doesn't already occur for unrelated reasons, or that the
assertion can fail) where practical.

Do not build elaborate controls for trivial, deterministic assertions — an HTTP
status code check needs none of this.

### Validate the harness mechanically

- Confirm hidden tests can be discovered and executed.
- Confirm test code parses, compiles, or type-checks as appropriate.
- Confirm `eval-requirements.md` and other evaluator-written files pass the
  project's formatter/format-check (see Formatting above) _before_ any hash of
  them is recorded in `eval-spec.md`'s `Source` section.
- Distinguish expected pre-implementation assertion failures from failures in
  the evaluation harness itself.

The feature may not exist yet, so hidden behavioural assertions are not required
to pass during `prepare` — but the harness itself, and every helper and oracle
it depends on, must be demonstrably sound before the evaluation is frozen.

Once every check above passes, `eval-spec.md`'s `Status` may be recorded as
`Frozen`.

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
- whether the pre-freeze integrity gate passed cleanly, and if not, what remains
  outstanding;
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

## 3. Record implementation identity

Before frozen verification begins, record an immutable identity for the
implementation under evaluation.

Prefer a clean implementation commit — a specific commit hash on a specific
branch is the simplest sufficient identity, and should be recorded as such.

If evaluation against uncommitted changes is deliberately allowed (for example
because the user asked for a pre-commit check), record enough provenance to
reconstruct the exact evaluated state, not just a description of it. At minimum:

- the base commit hash;
- working-tree status (which tracked files are modified, which files are
  untracked and included in evaluation);
- a stable patch/diff identity for the actual changes evaluated — for example a
  hash of `git diff`/`git diff --stat` output, or an equivalent
  content-addressed reference — sufficient that the exact evaluated state could
  be reconstructed later, not merely summarized.

Record this identity now, before running hidden tests or diagnostic probes, so
that if the working tree changes mid-verification (deliberately or not) that
drift is itself detectable rather than silently invalidating the result. Carry
this identity into `eval-result.md`'s `Evaluation Source` section verbatim.

## 4. Inspect the implementation and run diagnostic probes

You may now inspect the completed implementation and relevant visible tests.

Use implementation knowledge to:

- diagnose failures;
- understand observed behaviour;
- produce useful evaluation findings.

Do not use implementation knowledge to redefine expected behaviour.

### Diagnostic probes

When needed to classify a failure, run read-only diagnostic probes against the
implementation outside the frozen hidden tests — for example, a throwaway script
that exercises the same behaviour through a more direct or more reliable path
than a suspect helper.

Diagnostic probes:

- may investigate implementation behaviour;
- may validate evaluator assumptions;
- may help distinguish an evaluator defect from an implementation defect;
- must not modify the frozen evaluation (`eval-spec.md`, `.hidden-test/**`);
- must not substitute for a mandatory frozen evaluation case — they inform
  classification, they do not replace required coverage;
- must not turn an otherwise `BLOCKED` or `FAIL` result into `PASS`.

Record any diagnostic probe used, and what it showed, in `eval-result.md` as
supplementary evidence, clearly separated from the frozen evaluation's own
results.

## 5. Run hidden evaluation

Run the frozen hidden tests.

Also run any deterministic regression checks explicitly required by
`eval-spec.md`.

Capture enough diagnostic information to classify failures reliably.

## 6. Classify findings

### Confirm before blaming the implementation

A failing hidden test is evidence, not automatically an implementation defect.
Before classifying any result as `IMPLEMENTATION_FAILURE`, where practical:

1. rerun the failing case in isolation;
2. confirm the evaluator helpers it depends on passed their pre-freeze integrity
   checks — or re-validate them now if that wasn't practical earlier;
3. confirm setup and teardown behaved correctly;
4. rule out evaluator parsing, timing, environment, transport, or helper defects
   — a diagnostic probe (see step 4) is often the fastest way to do this. In
   particular, if the failing assertion depends on data crossing an asynchronous
   boundary (WebSocket, network transport, event queue, subprocess stream,
   callback scheduling, or similar), check whether the test assumed synchronous
   delivery — e.g. treated `send()`, `write()`, or event emission as a delivery
   barrier — instead of synchronizing on an observable, contract-valid signal;
5. produce a minimal behavioural reproduction where useful.

If evaluator correctness cannot be established, classify the result as
`EVALUATOR_DEFECT` or `INFRASTRUCTURE_FAILURE` instead — never
`IMPLEMENTATION_FAILURE`.

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

## 7. Do not repair the evaluator during verification

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

## 8. Write `eval-result.md`

Create or replace:

```text
<project>-hidden/<spike>/eval-result.md
```

Include the sections defined in `templates/eval-result.md`.

## 9. Promote evaluation artifacts on PASS

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

### Commit the promotion

A `PASS` result is not durably recorded until the promoted artifacts are
committed in the main project. Do not leave promotion as an uncommitted
working-tree change — an uncommitted promotion can drift or be lost, and the
private evaluator workspace must not be removed while it is the only durable
copy (see below).

Commit local history so that two commit identities can be recorded, kept
distinct:

- **Evaluated implementation commit** — the commit identity recorded in step 3
  ("Record implementation identity"). If that was already a clean commit, reuse
  its hash; do not create a redundant commit for it. If verification instead ran
  against deliberately-evaluated uncommitted changes, commit exactly those
  changes now, on their own, before the promotion commit — stage only the files
  that made up the evaluated implementation, not unrelated working-tree changes.
- **Evaluation-result commit** — a separate, focused commit containing only the
  newly promoted `<spike>/evaluation/**` (plus `<spike>/spike.md` and
  `<spike>/eval-requirements.md` if those are not already committed). Do not
  combine this with the evaluated implementation commit — keeping the two
  separate keeps both hashes independently meaningful, and mirrors this
  project's own preference for focused commits.

Since promotion is archival (see Promotion rules above), the promoted
`eval-result.md` cannot itself be edited afterward to reference the
evaluation-result commit's own hash. Record both commit identities in the
evaluation-result commit's message instead (e.g. "Evaluated implementation
commit: `<hash>`"), and report both in the final verification status (see
step 10) so they're visible without needing to inspect git history.

This step commits locally only. Do not push or open a pull request as part of
`verify` — those remain separate, explicit actions on the user's request, per
this project's own git workflow.

### Remove the private evaluation workspace

After all of the following are true:

1. verification result is `PASS`;
2. all required evaluator artifacts have been promoted;
3. the promoted copies have been verified identical to their private sources;
4. the evaluated implementation and the promoted evaluation artifacts have both
   been committed in the main project (see Commit the promotion above);

remove:

```text
<project>-hidden/<spike>/
```

Do not remove private artifacts before successful promotion has been verified.

After promotion, the project copy is the canonical historical record for the
completed spike.

## 10. Report verification status

Report to the user:

- `PASS`, `FAIL`, or `BLOCKED`;
- counts by finding classification;
- the requirements or behaviours that failed at a useful conceptual level;
- whether any evaluator defect or specification ambiguity was found;
- whether any diagnostic probes were used, and a one-line summary of what they
  showed;
- path to the private result when evaluation did not pass;
- path to the promoted evaluation record when evaluation passed;
- whether promotion and cleanup completed successfully;
- on `PASS`: the evaluated implementation commit and the evaluation-result
  commit (see "Commit the promotion").

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
14. **Shared evaluator helpers and each mandatory case's oracle must be
    validated before freezing, not discovered broken during verification.**
15. **Material runtime, OS, library, or protocol assumptions behind a mandatory
    case must be validated, or surfaced as ambiguity, before freezing.**
16. **Diagnostic probes run during verification inform classification; they
    never substitute for frozen coverage and never turn `BLOCKED`/`FAIL` into
    `PASS`.**
17. **An assertion whose data crosses an asynchronous boundary — WebSocket,
    network transport, event queue, subprocess stream, callback scheduling, or
    similar — must be validated through that same boundary; a helper passing in
    isolation is not sufficient evidence the end-to-end oracle is valid. Never
    assume `send()`, `write()`, or event emission is a delivery barrier unless
    the contract explicitly guarantees synchronous delivery — synchronize on an
    observable acknowledgment, event, eventual condition, or other
    contract-valid signal instead.**
18. **Where shared evaluator machinery is exercised through a materially
    different production path than in its helper self-tests, preparation must
    include at least one end-to-end integrity check through the real path — an
    isolated self-test alone is not sufficient.**
19. **Before frozen verification begins, the implementation under evaluation
    must have a recorded immutable identity — prefer a clean commit; if
    uncommitted changes are deliberately evaluated, record base commit,
    working-tree status, and a stable patch/diff identity sufficient to
    reconstruct the exact evaluated state.**
20. **A `PASS` result requires committing the promoted evaluation artifacts — do
    not leave promotion as an uncommitted working-tree change, and do not remove
    the private evaluator workspace until it is committed. Record both the
    evaluated implementation commit and the evaluation-result commit as distinct
    identities.**

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
