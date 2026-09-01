# Evaluation Requirements

## Testability Requirements

- **TR1** — The implementation must provide durable, visible in-repository
  regression evidence (executed through `npm test`) for the preparation-integrity
  mechanism's observable behaviour: a structurally complete prepared evaluator
  bundle passes the validator and may freeze; a structurally incomplete prepared
  bundle fails the validator and cannot freeze, cannot emit a valid readiness
  `PASS`, and cannot reach canonical `evaluation-prepared`; bidirectional
  criterion/procedure traceability is checked in both directions; required
  evaluator files and support material are checked against the actual prepared
  bundle and freeze inventory; a terminal evaluator result whose structured
  accounting contradicts the frozen bundle is rejected; an entirely
  non-executable evidence plan still passes; and one validator run reports all
  independently detectable structural defects together.
  - Reason: the frozen Design Map deliberately leaves the validator's command
    surface, input schema, file layout, diagnostics format, and identity
    algorithm as implementation freedom, so independent evaluation relies on the
    implementation's own visible regression suite rather than an
    evaluator-authored hidden test that would have to invent that surface.
  - Source: frozen brief scope 1, 2, 4, 5, and acceptance criteria AC01–AC13,
    AC14, AC19, AC20; frozen Design Map "Shared contracts" and "Implementation
    freedom".
  - Implementation impact: these scenarios live in the public test suite under
    `test/` and are run by `npm test`; they may build disposable public-safe
    fixture bundles and do not require any private evaluator data.

- **TR2** — Each negative regression scenario must construct the actual invalid
  condition in a prepared evaluator bundle — for example a required
  criterion/procedure reference whose required evaluator material is genuinely
  absent from the bundle and freeze inventory — and must not assert only on a
  pre-set `integrityValidation: FAIL` input value.
  - Reason: the Spike 010b evidence chain was rejected because its
    missing-procedure regression started from `integrityValidation = FAIL`
    rather than creating the incomplete bundle; AC03 forbids repeating that.
  - Source: frozen brief scope 2 and AC03; Spike 010b `acceptance.md`
    classification `EVALUATOR_COVERAGE_DEFECT`.
  - Implementation impact: negative fixtures are real (in)complete bundle
    structures fed through the validator's own entry point.

- **TR3** — Terminal evaluator result accounting — quantities such as mandatory
  cases `N of N`, criterion-record count, procedure count, and executable-case
  count — must be derived from, or mechanically checked against, the frozen
  evaluator inventory, case manifest, and criterion records bound to that
  attempt. A result whose structured accounting contradicts those frozen
  identities must not be valid. Human-readable prose may summarise the derived
  accounting but must not be its sole authoritative source.
  - Reason: the promoted Spike 010b result reported `13 of 13` mandatory cases
    while naming 14 procedure identifiers; AC12 and AC13 require that class of
    contradiction to be mechanically rejected.
  - Source: frozen brief scope 4 and AC12, AC13.
  - Implementation impact: the evaluator result carries machine-readable
    accounting derived from the frozen bundle, and a visible regression
    demonstrates rejection of the deliberately inconsistent
    `13 of 13` / 14-procedures case.

- **TR4** — The public methodology authority (`tools/workflow.ts`) must remain a
  structural attestation consumer. Its `evaluation-prepared` and
  `verification-allocated` validation must read only public-safe JSON (criterion
  records, required dispositions, traceability fields, and the readiness
  attestation, including an opaque private-inventory identity and a
  validator/result binding). It must not open an evaluator-private path, execute
  private evidence, or score whether an evaluator case or criterion is
  substantively good.
  - Reason: the public/private authority boundary must not move; the authority
    must not become a semantic evaluator (AC11).
  - Source: frozen brief scope 3 and AC10, AC11; frozen Design Map "Shared
    contracts" bullet 3 and "Implementation freedom".
  - Implementation impact: any authority change is limited to public-safe JSON
    structure and the readiness/validator binding; the private-inventory
    identity is never dereferenced.

- **TR5** — The preparation-integrity validator must be locally executable,
  deterministic tooling that requires no additional model invocation and no
  network access to perform structural integrity validation. It must remain
  bounded to mechanically decidable properties (identities, existence, mappings,
  inventories, required fields, hashes, accounting consistency).
  - Reason: the validator is evaluator lint, not another model-mediated
    evaluator phase (AC18; brief "Cost and repair-loop discipline").
  - Source: frozen brief scope 6, "Cost and repair-loop discipline", and AC18.
  - Implementation impact: a plain script invoked through the repository's
    existing runtime; deterministic output; no API or network dependency.

- **TR6** — A pre-freeze validator failure must not create or increment an
  evaluator revision, allocate a verification attempt, or require a new candidate
  implementation. It must leave the evaluator in the same unfrozen preparation
  draft, and the run should return all independently detectable structural
  failures together rather than one at a time.
  - Reason: cheap structural failures move left of freeze without churning
    revision or attempt state (AC19, AC20).
  - Source: frozen brief scope 5, "Cost and repair-loop discipline", and AC19,
    AC20.
  - Implementation impact: the validator is side-effect-free reporting; revision
    and attempt allocation happen only after a passing validation.

- **TR7** — If the Spike 010c-produced preparation-integrity mechanism is used
  during Spike 010c's own verification, that use must be explicitly recorded as
  bootstrap / self-hosting provenance, and it must not alter the already-frozen
  acceptance criteria, evidence strategy, cases, or result semantics of this
  evaluator revision.
  - Reason: Harness is self-hosting methodology tooling; the bootstrap exception
    is narrow and does not let the implementation redefine its own evaluator
    after candidate exposure (AC17).
  - Source: frozen brief "Bootstrap process exception" and AC17.
  - Implementation impact: verification records the self-hosting provenance note
    against the unchanged frozen evaluation contract.

- **TR8** — Spike 010b's prior technical `PASS`, promotion, As-Built, promoted
  evaluator result, workflow-execution note, and existing canonical authority
  history remain byte-for-byte historical evidence. Only the real forward-only
  human rejection and the ordinary successor linkage may be appended.
  - Reason: the corrective successor lineage must not rewrite predecessor
    evidence (AC15, AC16; brief non-goals).
  - Source: frozen brief "Context and preserved history",
    "Process-successor lineage", non-goals, and AC15, AC16.
  - Implementation impact: implementation changes touch no historical Spike 010b
    artifact; the 010b `human-rejected` event and the 010c `successor-linked`
    event are the only lineage additions.

## Evaluator Assumptions

- **A1** — The validator's exact command surface, input schema, file layout,
  diagnostics format, helper layout, and identity algorithm are implementation
  freedom under the frozen Design Map. Evaluation asserts observable structural
  behaviour through the visible regression suite, not a specific CLI, schema, or
  file path.
- **A2** — "The frozen evaluator bundle" for traceability and accounting
  purposes means the criterion-evidence records, case manifest, hidden-test
  manifest, and freeze inventory of the evaluator revision bound to the attempt.
- **A3** — The public authority already enforces one criterion-evidence record
  per material criterion and a passing readiness attestation (evaluator v10 /
  Spike 010b). Spike 010c adds the producer-side mechanical guarantee, so
  several criteria are established partly by existing authority behaviour and
  partly by the new tooling.
- **A4** — The private-inventory identity in the readiness attestation is a
  cooperative-integrity mechanism, not an operating-system security control; the
  authority treats it as an opaque hash and never dereferences it.
- **A5** — This Spike 010c evaluator preparation itself runs under evaluator v10
  plus the brief's declared bootstrap process exception; the mechanism produced
  by Spike 010c governs only later evaluator preparation.

## Blocking Questions

None.

## Environment Requirements

Node.js `>=24.12.0`, Git, and the repository's existing public test, typecheck,
lint, and formatting tooling (`npm test`, `npm run typecheck`, `npm run lint`,
`npm run format:check`). No external services or credentials.
