---
name: evaluator
description:
  Prepare and verify independent hidden evaluation for a frozen Harness spike
  using only the prepare and verify modes.
argument-hint: "<prepare|verify> <spike-path>"
arguments:
  - mode
  - spike
disable-model-invocation: true
compatibility:
  "Claude Code. The evaluator session must have access to the sibling
  <project-name>-hidden directory."
---

# Evaluator

Contract version: 2

Mode: `$mode`

Spike: `$spike`

The evaluator answers two questions:

- `prepare`: **how can the frozen contract be independently falsified?**
- `verify`: **does this implementation satisfy that already-frozen evaluation,
  and what class is any failure?**

No other mode exists. If `$mode` is invalid, stop and show:

```text
/evaluator prepare <spike-path>
/evaluator verify <spike-path>
```

Do not implement the spike or redesign its contract.

## Paths and compatibility

Treat `${CLAUDE_PROJECT_DIR}` as the project root. Resolve `$spike` relative to
it unless absolute. Public artifacts live under `<project>/<spike>/`.

Private artifacts live under the mirrored spike path in the sibling directory
formed by appending `-hidden` to the project directory name:

```text
<project>-hidden/<spike>/eval-spec.md
<project>-hidden/<spike>/.hidden-test/**
<project>-hidden/<spike>/eval-result.md
```

The session must already have access to that sibling. If it does not, stop and
report the path; never fall back to the public repository. Run hidden tests with
the public project's runtime, dependencies, configuration, and working directory
where practical. Do not create a duplicate development environment.

Templates are under `templates/` relative to this `SKILL.md`. Format every
artifact before computing its identity.

## Shared rules

Authority, in order, is the frozen brief, frozen Design Map, public evaluation
requirements, repository contracts, and relevant public interfaces. Existing
behavior and tests are evidence, not automatic requirements.

Prefer black-box observable behavior. Never impose undisclosed architecture,
internal state exposure, dependency choice, or evaluator-convenience seams.
Expose every necessary testability requirement publicly before implementation.

Keep public material free of hidden cases, inputs, filenames, fixtures, timing
strategies, and grader logic. Keep private artifacts private throughout the
implementation/retry loop.

Use the project's existing tools and small explicit helpers. Evaluator helper
self-tests establish evaluator integrity, not product coverage.

## `prepare`

### 1. Establish inputs

Read the complete frozen brief and Design Map. Confirm their deterministic
content identities and committed provenance. Inspect only enough code, tests,
and documentation to understand public behavior and available test seams.

If a material ambiguity prevents fair evaluation, write concise public blocking
questions, mark private preparation blocked, do not freeze tests, and stop.

### 2. Derive bounded evaluation

Identify explicit requirements, necessary invariants, negative requirements,
evaluator assumptions, testability requirements, and relevant regressions. Give
stable identifiers only to items used by evaluation. Test the spike contract,
not the entire repository.

Validate non-obvious runtime assumptions empirically where practical. For
asynchronous, lifecycle, PTY, WebSocket, process, provider, or timing-sensitive
behavior, validate important failure oracles through the same executable path
the mandatory test will use. A helper passing in isolation is insufficient.

### 3. Create artifacts

Write concise public `eval-requirements.md` from its template. Write private
`eval-spec.md`, `.hidden-test/**`, and a private case manifest. Hidden tests
must map to public requirements without exposing their construction publicly.

Exercise mandatory tests against controlled positive and negative conditions
before freeze. Confirm setup, teardown, helper integrity, determinism, and that
failure oracles fail for the intended reason. Diagnostic or helper tests do not
count as Harness coverage.

### 4. Freeze

Freeze the private evaluator revision using deterministic content identities.
Private freeze metadata must identify:

- evaluator revision and evaluator skill version;
- brief and Design Map identities;
- exact public evaluation-requirements content identity;
- private specification identity;
- every hidden test and support-file identity; and
- integrity checks performed.

Then write the safe public manifest entry, commit and push the exact public
requirements, and confirm committed public content matches the identity in the
private freeze. Implementation must not begin before both sides correspond.

Record safe capability-dependent telemetry without revealing private mechanics.

## `verify`

### 1. Establish immutable inputs

Resolve the exact committed implementation revision. Refuse a handoff partly
represented by working-tree changes. Verify that the brief, Design Map, public
requirements, private spec, hidden tests, support files, and evaluator revision
match their frozen identities. A mismatch is specification drift or evaluator
integrity failure, not an implementation failure.

### 2. Run frozen evaluation

Run mandatory hidden cases and required public regressions without modifying the
frozen evaluator. Capture enough evidence to classify failures. Diagnostics may
clarify a failure but cannot replace broken mandatory evidence or retroactively
rewrite what a test established.

Before classifying `IMPLEMENTATION_FAILURE`, rerun the relevant case in
isolation, confirm helper/oracle integrity and setup/teardown, and rule out
evaluator, specification, and infrastructure causes.

Use these material classifications:

- `IMPLEMENTATION_FAILURE`
- `EVALUATOR_DEFECT`
- `SPECIFICATION_AMBIGUITY`
- `INFRASTRUCTURE_FAILURE`
- specification drift

If both evaluator and possible implementation defects appear, establish a
trustworthy evaluator first.

### 3. Results and retry

Write the full private `eval-result.md`, including implementation identity,
evaluator revision, classifications, mandatory/regression results, diagnostics,
and evaluator-integrity status.

For confirmed implementation failure, emit a separate public feedback artifact
that states the violated public requirement, expected and observed public
behavior, classification, and safe diagnostics. Do not reveal hidden mechanics.
Commit the public feedback and safe manifest entry. Implementation retries
against the same frozen evaluation; do not rerun `prepare`.

For an evaluator defect, preserve the prior frozen revision, create a
distinguishable corrected revision, record which verification used each, and
rerun `verify` against the unchanged implementation. Never silently overwrite
evidence or blame implementation before the evaluator is trustworthy.

### 4. Promotion

Promote only after an accepted successful result and after the active
implementation loop is complete. Copy the exact final frozen specification,
tests, support files, manifest, result, and provenance used for success. Never
rebuild, regenerate, clean up, or substitute equivalent tests during promotion.

Preserve superseded evaluator revisions when material to an evaluator defect,
specification correction, or evaluation history. Private results caused only by
implementation failures need not all become public; sanitized feedback and
Outcome may preserve that history.

Update the public manifest and commit/push promoted evaluation separately from
implementation. Promotion preserves evidence; it does not recreate it.
