---
name: evaluator
description:
  Prepare and verify independent evaluation for a frozen Harness spike using
  prepare, verify, and bounded repair modes.
argument-hint: "<prepare|verify|repair> <spike-path>"
arguments:
  - mode
  - spike
disable-model-invocation: true
compatibility:
  "Claude Code. The evaluator session must have access to the sibling
  <project-name>-hidden directory."
---

# Evaluator

Contract version: 13

Mode: `$mode`

Spike: `$spike`

The evaluator answers two questions:

- `prepare`: **how can the frozen contract be independently falsified?**
- `verify`: **does this implementation satisfy that already-frozen evaluation,
  and what class is any failure?**
- `repair`: **can a demonstrated evaluator defect be corrected without changing
  the frozen definition of success?**

No other mode exists. If `$mode` is invalid, stop and show:

```text
/evaluator prepare <spike-path>
/evaluator verify <spike-path>
/evaluator repair <spike-path>
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

Consume the exact mode, coherent methodology identity, public inputs, evaluator
revision, predecessor, and workspaces bound by Harness. Never select a different
skill or evaluator authority from mutable repository files. `repair`
additionally requires its exact source evaluator revision and immutable defect
trigger as bound inputs; repository discovery and conversation are not repair
authority.

The worker may create its public local checkpoint and report evidence, but never
publishes, writes canonical workflow authority, allocates a successor, or makes
an evaluator candidate authoritative over its own migration. Harness owns those
privileged actions and preserves their results separately from semantic role
completion.

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
manual observable evidence already provides adequate verification, when a hidden
test would merely duplicate that evidence without increasing falsifiability, or
when no stable implementation-independent observable seam exists before
implementation.

For every such case, record the coverage mode and reason in the private
evaluation specification and case manifest. Absence of a hidden test is not an
evaluator defect when it preserves deliberate implementation freedom.

If a material requirement cannot be fairly verified at all without a public seam
that the frozen contract has not established, do not invent that seam. Block
preparation and return to the Design Map or brief as appropriate before
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

For authority-enabled spikes, also commit a public-safe `coverage-map.json`. It
carries exactly one explicit criterion evidence record for every material frozen
acceptance criterion. Each record declares the criterion identity, its
frozen-authority source, the evidence mode, the required disposition, the
referenced evidence procedure/case identifiers, and a criterion-specific
sufficiency reason that explains why that evidence establishes that criterion.
Several records may name the same procedure, but a broad grouping never replaces
a per-criterion record and reason. The map also carries a public-safe readiness
attestation binding the prepared evaluator revision to its deterministic private
inventory identity and declaring that pre-freeze integrity validation passed; it
exposes no private paths, cases, fixtures, or grader logic. Harness records
`evaluation-prepared` after validating the public checkpoint; do not complete
preparation with missing, duplicate, or blocked required coverage, or without a
passing readiness attestation.

Exercise every mandatory executable case against controlled positive and
negative conditions before freeze. Confirm setup, teardown, helper integrity,
determinism, and that failure oracles fail for the intended reason. For
non-executable mandatory cases, confirm before freeze that the stated
public/manual evidence plan can fairly establish the frozen criterion without
requiring a candidate-specific interpretation. Diagnostic or helper tests do not
count as Harness coverage.

### 4. Validate preparation integrity

Before any private revision may be frozen, run a deterministic pre-freeze
integrity validation over the candidate evaluator bundle and record its result
in the private freeze metadata. This validation is structural and
implementation-independent; it never inspects or tunes against the candidate
implementation and never judges whether the evaluator's substantive reasoning is
correct. It must establish that:

- every material frozen criterion has exactly one explicit criterion evidence
  record, or another Design-Map-approved unambiguous representation;
- every required criterion has a non-missing evidence disposition and a
  criterion-specific sufficiency reason;
- every referenced evaluator requirement, case, or procedure exists in the
  candidate bundle;
- every declared executable case names actual frozen evaluator files, and every
  mandatory executable case has passed its controlled positive and negative
  pre-implementation exercise;
- every declared non-executable procedure is concretely defined and resolvable
  without inventing candidate-specific semantics after implementation;
- every frozen case or procedure maps back to the criterion or criteria it
  establishes, and no required evidence reference is orphaned;
- the private freeze inventory lists every file the frozen bundle depends on;
  and
- the public-safe coverage representation and the private bundle are mutually
  consistent.

If the validation fails, preparation stays pre-freeze: do not freeze the
revision, do not record `evaluation-prepared`, do not begin implementation, and
do not allocate verification. Correct the evaluator while still in preparation
and revalidate. Preserve any required preparation diagnostics without producing
public evidence that claims a valid frozen evaluator. A draft that never passed
this validation has no frozen evaluator revision.

### 5. Freeze

Freeze occurs only after the step 4 integrity validation passes. Freeze the
private evaluator revision using deterministic content identities. Private
`freeze.json` metadata must identify:

- evaluator revision and evaluator skill version;
- brief and Design Map identities;
- exact public evaluation-requirements content identity;
- private specification and case-manifest identities;
- every hidden test and support-file identity that exists;
- every other file the frozen bundle depends on (the freeze inventory); and
- the pre-freeze integrity checks performed and their passing result.

Confirm the frozen public content identity, then follow **Final execution
record** below. Create a local checkpoint containing the exact public
requirements and safe public manifest entry, report the exact produced local
commit, and confirm committed public content matches the identity in the private
freeze. Implementation must not begin before both sides correspond.

## `verify`

A completed evaluation reports semantic disposition `succeeded` with methodology
result `PASS`, `FAIL`, or `BLOCKED`. Use role disposition `blocked` only when
the evaluator cannot complete and finalize the semantic role at all. `PASS`
carries no classification. Every `FAIL` or `BLOCKED` carries exactly one of
`IMPLEMENTATION_FAILURE`, `EVALUATOR_DEFECT`, `SPECIFICATION_AMBIGUITY`,
`SPECIFICATION_DRIFT`, or `INFRASTRUCTURE_FAILURE`.

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

If, after the verification attempt was validly allocated, a frozen evaluator
case, procedure, or support file the frozen bundle depends on is discovered to
be missing or unresolvable, this is a frozen-evaluator bundle-integrity defect.
Finalize the allocated attempt forward-only: terminal `BLOCKED` classified
`EVALUATOR_DEFECT`, retaining the allocated implementation identity and
evaluator revision identity, recording whether candidate evaluation had begun,
and fabricating no candidate coverage results for cases that did not actually
run. Never classify a missing evaluator procedure as `IMPLEMENTATION_FAILURE`,
and never leave the attempt without a terminal disposition merely because the
evaluator could not run. Then follow the post-implementation repair and
threshold rules before any corrected revision.

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

### Post-implementation evaluator repair

After implementation exposure, repair only an evaluator defect traceable to the
frozen brief, Design Map, public requirements, or an already-authoritative
public interface. Preserve the prior revision and record the exact source, why
it failed, confirmation that acceptance semantics did not change, and
confirmation that no implementation-shaped seam was adopted.

Behavior absent from frozen authority is a specification defect requiring a new
brief cycle, not an evaluator repair. Do not change the evaluator because it
found an implementation defect. After two post-implementation evaluator
corrections in one cycle, explicitly classify any further issue as evaluator,
specification, or methodology/evidence-model defect before another correction.

Once that threshold is reached, ordinary evaluator-revision churn stops. Do not
apply another automatic in-cycle correction. Finalize the allocated attempt with
its terminal non-PASS result, record the classification in the immutable attempt
result and the private revision history, and require the appropriate process or
specification successor path — a new brief cycle for a specification or
methodology/evidence-model defect — rather than continuing to revise this
cycle's evaluator. A repeated preparation-integrity failure is a
methodology/evidence-model defect, not an implementation failure.

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
Always emit public `verification-result.json` for a terminal verification,
binding the allocation, candidate, evaluator revision, complete coverage
accounting, result, and classification invariant. For `IMPLEMENTATION_FAILURE`,
that committed public record is also the canonical machine-bound retry feedback
and must carry the same sanitized requirement, expected behavior, observed
behavior, and safe diagnostics as the separate human-readable feedback artifact.
Follow **Final execution record** below, then create the public-result/feedback
local checkpoint. Implementation retries against the same frozen evaluation; do
not rerun `prepare`.

For an evaluator defect, preserve the prior frozen revision, create a
distinguishable corrected revision, record which verification used each, and
rerun `verify` against the unchanged implementation. Never silently overwrite
evidence or blame implementation before the evaluator is trustworthy.

### 4. Complete `FAIL` or `BLOCKED`

Do not promote after `FAIL` or `BLOCKED`. Preserve and finalize the allocated
attempt and all failure evidence, follow the correction/revision or
implementation-retry rules above, and follow **Final execution record**. Do not
proceed as though the evaluator cycle passed.

### 5. Complete `PASS` and request promotion

`PASS` means that the implementation satisfies the frozen machine-verifiable
evaluation contract. Human product acceptance is a separate, later gate. The
evaluator determines promotion eligibility and reports the exact source
identities, attempt history, revision lineage, all-or-nothing eligibility of
each frozen revision, and destination mapping required for archival. It does not
copy public artifacts, publish commits, or declare host promotion complete.

Eligible evidence is the immutable attempt ledger, every immutable terminal
result in the successful cycle, and each complete frozen evaluator revision
whose full bundle is safe and suitable for durable public regression. A revision
is eligible as one unit with its freeze metadata; never expose a partial bundle.
Secrets, credentials, unrelated sensitive material, evaluator mechanisms that
must remain private, diagnostics, and discarded exploration are ineligible. A
passing attempt may therefore be eligible while its evaluator revision is not.

Request the narrow Harness promotion action with the exact passing attempt,
implementation identity, evaluator revision identities, source artifact
identities, eligibility decisions, and canonical destination mapping. Harness
performs byte-preserving archival, identity validation, deduplication, and
`promotion.json` creation. The host action must preserve every prior terminal
attempt and superseded eligible revision; an unchanged suite is stored once and
referenced by each attempt. The action result is separate from evaluator `PASS`.
A failed or denied action neither fabricates promoted evidence nor rewrites the
semantic verification result.

The candidate evaluator never approves or promotes its own methodology change.
Ordinary evolution is evaluated by the currently trusted methodology; an
incompatible authority change stops at explicit human bootstrap authority.

## `repair`

Repair is separate from `prepare` and `verify`. It may begin only from immutable
authority evidence: a finalized verification attempt classified
`EVALUATOR_DEFECT`, a closed human-rejected correction cycle containing
`EVALUATOR_COVERAGE_DEFECT`, or an explicitly recorded human correction-cycle
authority classified `IMPLEMENTATION_AND_EVALUATOR_DEFECT` that binds the exact
canonical PASS and demonstrated coverage defect. The latter opens a distinct
successor cycle; it never reclassifies or rewrites that PASS. An observation,
chat comment, or desire to tidy an evaluator is not authority. Refuse it.

Read the frozen brief, Design Map, public `eval-requirements.md`, source
revision, and authoritative defect trigger. Preserve the source revision and its
freeze metadata before changing anything. Repair only the demonstrated evidence
defect; do not rerun semantic `prepare`, alter acceptance semantics, introduce a
product requirement, or demand a new public or implementation-shaped test seam.
If that would be necessary, record a terminal blocked repair and route to the
successor/methodology path.

Allocate the next monotonically increasing evaluator revision. Produce an
immutable private repair record containing trigger identity, source/result
revisions and identities, affected criteria/procedures, changed artifacts,
frozen-authority identities, integrity result, and an explicit
acceptance-semantics-preserved attestation. Run full deterministic structural
integrity validation over the complete resulting revision before it becomes
current. Then produce a public-safe repair binding carrying the same lineage and
PASS/attestation without exposing private mechanics. Harness validates the
binding and records `evaluator-repair-recorded`. Verification attempts remain
bound to their original revision and are never rewritten.

For Spike 012 itself, never use this v12 repair mode as bootstrap recovery or
grading authority before human acceptance: its pinned v10 evaluator authority
governs that exceptional cycle.

## Final execution record

This is the final repository-content step for `prepare`, `repair`, and each
terminal `verify` result. If useful statistics require a start baseline, capture
it privately without appending a provisional public entry.

First write any richer execution statistics to the private evaluator workspace.
Then append only safe aggregates, skill/version, mode, public identities, and
high-level result to public `manifest.md`. The measurement cutoff is immediately
before the public update: do not measure the entry itself, estimate unavailable
metrics, or expose hidden tests, cases, fixtures, inputs, oracle/timing
strategy, diagnostics, or private evidence. If control remains after a blocked
or failed run, record it too. Create one local checkpoint containing all public
role artifacts and the final manifest entry. Report the Role Result, exact
evidence identities, requested host actions, and exact produced local commit.
Private detail may become public only through a successful Harness-owned
promotion action.
