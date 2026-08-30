---
name: evaluator
description:
  Prepare and verify independent evaluation for a frozen Harness spike using
  only the prepare and verify modes.
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

Contract version: 8

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
<project>-hidden/<spike>/.eval/freeze.json
<project>-hidden/<spike>/.eval/attempt-ledger.json
<project>-hidden/<spike>/.eval/attempts/001/eval-result.md
<project>-hidden/<spike>/.eval/revisions/001/**
```

After a passing cycle, eligible artifacts are promoted canonically under:

```text
<project>/<spike>/evaluation/promotion.json
<project>/<spike>/evaluation/attempt-ledger.json
<project>/<spike>/evaluation/attempts/001/eval-result.md
<project>/<spike>/evaluation/freeze/001.json
<project>/<spike>/evaluation/revisions/001/**
```

Attempt and revision directory names are monotonically increasing, zero-padded
three-digit identifiers. The top-level private spec, case manifest, and any
hidden tests/support files represent the current frozen evaluator revision.
Before correcting a frozen revision, copy its exact bundle and freeze metadata
to its numbered `.eval/revisions/NNN/` archive; never reconstruct that archive
afterward.

The session must already have access to that sibling. If it does not, stop and
report the path; never fall back to the public repository. Run executable hidden
tests, when present, with the public project's runtime, dependencies,
configuration, and working directory where practical. Do not create a duplicate
development environment.

Templates are under `templates/` relative to this `SKILL.md`. Format every
artifact before computing its identity. Initialize the private attempt ledger
from `templates/attempt-ledger.example.json`; preserve its field names and add
no private mechanics beyond what provenance requires. Create freeze metadata
from `templates/freeze.example.json`. The evaluator revision identity is the
SHA-256 content identity of the formatted `freeze.json`; `freeze.json` in turn
records the identity of the spec, case manifest, and every hidden test and
support file that exists in the revision. A revision with no executable hidden
tests is valid when the frozen case manifest justifies that absence. This
non-circular identity is canonical for revision comparison.

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

#### Hidden-test justification

Hidden tests are a means of independent falsification, not a required output of
every evaluator preparation.

For each material requirement, determine before implementation whether the
frozen public contract exposes a stable observable seam that permits a fair,
implementation-independent executable test.

Create mandatory hidden coverage only when that seam is justified by the frozen
brief, Design Map, public evaluation requirements, or an existing authoritative
public interface.

Do not invent or freeze an API, state representation, file format, helper
function, import surface, persistence schema, ordering representation,
identifier shape, or other implementation structure merely to make hidden
testing convenient.

If the Design Map deliberately leaves a seam as implementation freedom, preserve
that freedom.

A requirement may legitimately have no executable hidden test when public or
manual observable evidence already provides adequate verification, when a
hidden test would merely duplicate that evidence without increasing
falsifiability, or when no stable implementation-independent observable seam
exists before implementation.

For every such case, record the coverage mode and reason in the private
evaluation specification and case manifest. Absence of a hidden test is not an
evaluator defect when it preserves deliberate implementation freedom.

If a material requirement cannot be fairly verified at all without a public
seam that the frozen contract has not established, do not invent that seam.
Block preparation and return to the Design Map or brief as appropriate before
implementation begins.

Do not weaken, omit, or reinterpret an underlying requirement merely because
hidden automation is unjustified.

Never run the prepared evaluator against the actual candidate implementation
during `prepare`. Positive and negative controls used before freeze must be
controlled conditions, evaluator self-checks, or a pre-implementation baseline
that do not use candidate behavior to shape the frozen evaluator. Candidate
execution belongs to an allocated `verify` attempt.

Validate non-obvious runtime assumptions empirically where practical. For
asynchronous, lifecycle, PTY, WebSocket, process, provider, or timing-sensitive
behavior, validate important failure oracles through the same executable path
the mandatory test will use. A helper passing in isolation is insufficient.

### 3. Create artifacts

Write concise public `eval-requirements.md` from its template. Write private
`eval-spec.md` and a private case manifest. Create `.hidden-test/**` test and
support files only for cases whose executable coverage is justified.

Every material evaluation case must appear in the case manifest. Executable
cases list their hidden test files. Non-executable cases use an empty test list,
state their coverage mode, and record why executable hidden coverage is not
justified.

Exercise every mandatory executable case against controlled positive and
negative conditions before freeze. Confirm setup, teardown, helper integrity,
determinism, and that failure oracles fail for the intended reason. For
non-executable mandatory cases, confirm before freeze that the stated
public/manual evidence plan can fairly establish the frozen criterion without
requiring a candidate-specific interpretation. Diagnostic or helper tests do
not count as Harness coverage.

### 4. Freeze

Freeze the private evaluator revision using deterministic content identities.
Private `freeze.json` metadata must identify:

- evaluator revision and evaluator skill version;
- brief and Design Map identities;
- exact public evaluation-requirements content identity;
- private specification and case-manifest identities;
- every hidden test and support-file identity that exists; and
- integrity checks performed.

Confirm the frozen public content identity, then follow **Final execution
record** below. Commit and push the exact public requirements and safe public
manifest entry, and confirm committed public content matches the identity in the
private freeze. Implementation must not begin before both sides correspond.

## `verify`

### 1. Establish immutable inputs

Resolve the exact committed implementation revision. Refuse a handoff partly
represented by working-tree changes. Verify that the brief, Design Map, public
requirements, private spec, case manifest, every hidden test/support file that
exists, and evaluator revision match their frozen identities. A mismatch is
specification drift or evaluator integrity failure, not an implementation
failure. Classify it as `SPECIFICATION_DRIFT`, report it, and stop; do not run
evaluation against drifted inputs.

### 2. Run frozen evaluation

Run every frozen mandatory executable case and required public regression
without modifying the frozen evaluator. Evaluate mandatory non-executable cases
using only the public/manual evidence plan frozen during `prepare`. Capture
enough evidence to classify failures.

Do not use knowledge of the candidate to introduce a new mandatory architecture,
representation, API, interpretation, or hidden test. A requirement that lacked
justified executable coverage before implementation does not become permission
to design candidate-shaped coverage afterward.

If a frozen non-executable evidence plan proves unable to establish a material
criterion fairly, do not improvise a new contract. Treat an unsound evaluator
plan as an evaluator defect; if the missing information is actually an
insufficient or ambiguous public contract, classify it as
`SPECIFICATION_AMBIGUITY` and block rather than inventing the missing seam.

Diagnostics may clarify a failure but cannot replace broken mandatory evidence
or retroactively rewrite what a test established.

### Diagnostic probes

Use diagnostic probes only as read-only, supplementary investigation. They may
validate an assumption or help distinguish implementation, evaluator,
specification, and infrastructure failures, but they are not frozen coverage. Do
not let a probe substitute for a broken mandatory case or change a
`BLOCKED`/`FAIL` result to `PASS`. A probe may instead demonstrate an evaluator
defect that requires preserving the prior revision, correcting and refreezing
the evaluator, and rerunning `verify` against the unchanged implementation.
Record every probe and its non-authoritative role in the private result.

Before classifying `IMPLEMENTATION_FAILURE`, rerun the relevant case in
isolation, confirm helper/oracle integrity and setup/teardown, and rule out
evaluator, specification, and infrastructure causes.

Use these material classifications:

- `IMPLEMENTATION_FAILURE`
- `EVALUATOR_DEFECT`
- `SPECIFICATION_AMBIGUITY`
- `INFRASTRUCTURE_FAILURE`
- `SPECIFICATION_DRIFT`

If both evaluator and possible implementation defects appear, establish a
trustworthy evaluator first.

### 3. Results and retry

Before verification, allocate the next attempt identifier in
`.eval/attempt-ledger.json` with status `ALLOCATED` and a null result identity.
Write its immutable result to `.eval/attempts/NNN/eval-result.md`, including
attempt identity, implementation identity, evaluator revision, classifications,
mandatory/regression results, diagnostics, and evaluator-integrity status.
Finalize the ledger entry with the result identity and terminal `PASS`, `FAIL`,
or `BLOCKED` status. Apart from finalizing its allocated entry, never mutate,
reorder, remove, or reuse an attempt. Preserve failures caused by
implementation, evaluator, specification, infrastructure, or drift.

For confirmed implementation failure, emit a separate public feedback artifact
that states the violated public requirement, expected and observed public
behavior, classification, and safe diagnostics. Do not reveal hidden mechanics.
Follow **Final execution record** below, then commit the public feedback and
safe manifest entry. Implementation retries against the same frozen evaluation;
do not rerun `prepare`.

For an evaluator defect, preserve the prior frozen revision, create a
distinguishable corrected revision, record which verification used each, and
rerun `verify` against the unchanged implementation. Never silently overwrite
evidence or blame implementation before the evaluator is trustworthy.

### 4. Complete `FAIL` or `BLOCKED`

Do not promote after `FAIL` or `BLOCKED`. Preserve and finalize the allocated
attempt and all failure evidence, follow the correction/revision or
implementation-retry rules above, and follow **Final execution record**. Do not
proceed as though the evaluator cycle passed.

### 5. Complete `PASS` and promote

`PASS` means that the implementation satisfies the frozen machine-verifiable
evaluation contract. Human product acceptance is a separate, later gate. After
finalizing a `PASS`, complete the promotion procedure below before yielding
control for human acceptance. Do not ask for human permission to perform normal
evaluator-owned promotion, and do not describe the result as an "accepted PASS".

Promotion eligibility is unchanged. The ledger and immutable attempt results
belong to the completed evidence chain and are eligible after `PASS`. Treat each
frozen evaluator revision, including its freeze metadata, as one eligibility
unit: promote its entire exact bundle only when it provides durable, repeatable
regression coverage suitable for the public repository and every component is
safe to publish. If any component contains a secret, credential, unrelated
sensitive material, or evaluator mechanism that must remain private, do not
promote a partial revision or its freeze metadata. Diagnostic probes and
discarded exploratory material are not part of a frozen revision and are
ineligible. A `PASS` does not make every hidden test public; promotion may
therefore record a passing attempt without copying its evaluator revision.
Record only that revision's canonical identity and all-or-nothing eligibility
decision in `promotion.json`. Eligibility judgment may remain necessary;
promotion layout and preservation mechanics may not be invented case by case.

Treat promotion as an archival operation. A historical artifact is the frozen or
result artifact that actually participated in verification. Copy it byte for
byte or reference one already preserved with the same deterministic content
identity. Never use an editor or generation tool to rewrite, normalize, clean
up, improve, summarize, or recreate it. Do not change embedded private paths in
the attempt ledger or results. Historical artifacts may consequently retain
private-relative paths; `promotion.json` supplies the public mapping.

`promotion.json` is the only required newly generated promotion metadata. It is
not frozen evaluation evidence. Create it from
`templates/promotion.example.json`, preserving the schema and adding no
explanatory prose or semantic claims. Do not create promotion READMEs or
indexes.

Perform promotion in this order without consulting prior spikes:

1. Select the finalized passing ledger entry and its immutable result. Confirm
   their attempt, implementation, evaluator-revision, and result identities.
2. Determine eligibility for each frozen evaluator revision as an all-or-nothing
   bundle using the rules above. Record an ineligible revision only by its
   revision identity and `not-promoted` disposition; do not expose its content
   or hidden mechanics.
3. Allocate no new verification attempt. The public attempt identifier is the
   existing private `NNN`; attempt numbering was allocated before verification
   and is never renumbered during promotion.
4. Copy the complete private attempt ledger unchanged to
   `evaluation/attempt-ledger.json`. Copy every immutable attempt result
   unchanged to `evaluation/attempts/NNN/eval-result.md`, including all prior
   `FAIL` and `BLOCKED` results in the successful cycle. For each eligible
   revision, copy its exact freeze metadata unchanged to
   `evaluation/freeze/NNN.json`. For an ineligible revision, publish neither the
   freeze metadata nor artifact bundle; record only the revision identity and
   `not-promoted` disposition in promotion metadata.
5. For every eligible evaluator revision used by an attempt, establish its
   canonical directory as `evaluation/revisions/NNN/`. The revision number and
   identity are those in `freeze.json` and the ledger; never infer them from
   directory order. Copy the exact frozen artifact bundle: specification, case manifest, and all
   hidden tests and support files present in that revision. The separately preserved
   freeze metadata proves its identity. A corrected revision gets its own
   canonical directory, and every superseded revision used in the cycle is
   preserved. For the current top-level private revision, copy directly from the
   frozen top-level sources; for a superseded revision, copy from its
   pre-correction archive.
6. If the same revision identity is already present canonically, hash its files
   and reference that directory; do not duplicate it. First-attempt and
   later-attempt `PASS` use the same procedure. An unchanged suite is stored
   once, and each attempt-to-revision relationship lives in the unchanged ledger
   plus `promotion.json`.
7. Write `evaluation/promotion.json` last among promotion artifacts. For each
   attempt, record its identifier, result identity/path, implementation
   identity, evaluator revision number and identity, and canonical revision path
   plus `copied`/`referenced` disposition, or a `not-promoted` disposition and
   null path. For every copied or referenced historical file, record its source
   identity, public path, promoted identity, and `copied` or `referenced`
   disposition. Record the passing attempt and overall `PASS` only; do not claim
   human acceptance.
8. Recompute every promoted historical file's identity and require equality with
   its recorded source identity. Also verify each canonical revision identity
   and every ledger/result reference. A mismatch is a promotion integrity
   failure: do not declare promotion complete, do not rewrite either artifact to
   make it match, and do not yield to human acceptance until the
   source/destination or metadata error is resolved without altering history.
9. Follow **Final execution record**, then commit and push promoted evaluation
   separately from implementation. Only after all eligible artifacts, metadata,
   hashes, manifest entries, and Git provenance are complete may the evaluator
   yield to human acceptance.

If no revision qualifies for public promotion, still preserve the
ledger/results, write `promotion.json` with revision dispositions, perform the
integrity checks, and finish the evaluator-owned `PASS` work. If all historical
artifacts already exist canonically, write only the required new promotion
metadata and manifest entry, referencing the verified identities.

Promotion preserves the complete eligible evidence chain; it does not curate or
recreate it. Historical documents remain immutable. Never edit an earlier
spike's promoted artifacts to conform to this contract; report any discovered
provenance defect separately and use an existing explicit correction mechanism
only when independently authorized.

## Final execution record

This is the final repository-content step for `prepare`, each terminal `verify`
result, and PASS promotion. If useful statistics require a start baseline,
capture it privately without appending a provisional public entry.

First write any richer execution statistics to the private evaluator workspace.
Then append only safe aggregates, skill/version, mode, public identities, and
high-level result to public `manifest.md`. The measurement cutoff is immediately
before the public update: do not measure the entry itself, estimate unavailable
metrics, or expose hidden tests, cases, fixtures, inputs, oracle/timing
strategy, diagnostics, or private evidence. If control remains after a blocked
or failed run, record it too. Private detail may become public only through
successful evaluation promotion under the existing rules.
