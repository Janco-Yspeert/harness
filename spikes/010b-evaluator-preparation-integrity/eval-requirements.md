# Evaluation Requirements

## Testability Requirements

- **TR1** — The public `coverage-map.json` is the single authority evidence
  artifact. Its `criteria` array carries exactly one record per material frozen
  acceptance criterion, and each record exposes parseable public JSON fields for
  criterion identity, frozen-authority source, evidence mode, required
  disposition, referenced evidence procedure identifiers, and a
  criterion-specific sufficiency reason.
  - Reason: the authority must be able to detect absent, duplicate, or
    under-specified criterion records without reading private evaluator content.
  - Source: frozen Design Map shared contracts 1 and 3; brief acceptance
    criteria AC02–AC04, AC07.
  - Implementation impact: the `evaluation-prepared` authority validation parses
    these fields and rejects a map with a missing/duplicate criterion record or
    a missing required disposition or traceability field, without changing
    canonical `workflow.jsonl` history on rejection.

- **TR2** — `coverage-map.json` carries a public-safe readiness attestation that
  binds the prepared evaluator revision to a deterministic private-inventory
  identity and declares that the pre-freeze integrity validation passed. The
  attestation contains no private paths, cases, fixtures, or grader logic.
  - Reason: `evaluation-prepared` must mean "the evaluator passed its required
    pre-freeze integrity validation", not merely "a criterion-complete map
    exists".
  - Source: frozen Design Map shared contract 2 and "public-safe readiness
    attestation"; brief scope 3, 6, 7 and AC01, AC09, AC12, AC13.
  - Implementation impact: the authority rejects any map without a passing
    readiness attestation; the private-inventory identity is treated as an
    opaque hash and is never dereferenced.

- **TR3** — A verification allocation binds the current implementation handoff
  and a prepared evaluator revision that carries a passing readiness
  attestation. Allocation is refused when no such attestation exists.
  - Reason: verification must not be allocated against an unvalidated evaluator
    revision (brief scope 8, AC15).
  - Source: frozen Design Map shared contract 4.
  - Implementation impact: `verification-allocated` evidence references the
    attested evaluator revision; the authority refuses allocation otherwise.

- **TR4** — When a verification attempt has already been validly allocated and a
  frozen-evaluator bundle-integrity defect is then discovered, the attempt is
  finalized with a terminal non-PASS classified as an evaluator/integrity defect
  (`BLOCKED` / `EVALUATOR_DEFECT`), retaining the allocated implementation
  identity and evaluator-revision identity and fabricating no candidate coverage
  results.
  - Reason: forward-only handling that never misclassifies a missing evaluator
    procedure as an implementation failure (brief scope 9, AC18, AC19, AC26).
  - Source: frozen Design Map shared contract 4.
  - Implementation impact: the authority accepts this terminal disposition for
    an allocated attempt without an implementation retry being required to
    "clear" it.

- **TR5** — Visible repository tests (`test/workflow.test.ts`, run through
  `npm test`) demonstrate, against the public `workflow authority` CLI: a draft
  referencing a missing mandatory executable procedure cannot reach a valid
  frozen/prepared state (AC22); a criterion-complete map with structurally
  incomplete evidence references is rejected before verification allocation
  (AC23); shared evidence may support multiple criterion records when each
  retains explicit traceability (AC24); a non-executable evidence procedure can
  participate in a valid prepared evaluator when explicitly defined and
  resolvable (AC25); and the forward-only handling of a post-allocation
  evaluator-integrity failure (AC26).
  - Reason: the brief mandates visible regression coverage for these five
    behaviours; they are the justified executable seam.
  - Source: brief AC22–AC26.
  - Implementation impact: these scenarios live in the public test suite and may
    create disposable public spikes and synthetic public-safe coverage maps; no
    private evaluator data is required.

- **TR6** — The repository-owned evaluator skill (`skills/evaluator/SKILL.md`)
  and the autonomous-orchestration guidance (`AGENTS.md`) state the pre-freeze
  preparation-integrity obligations and the repeated-correction / process-defect
  threshold behaviour as binding contract language.
  - Reason: brief scope 1–3, 6, 10, 12 and AC01, AC05–AC14, AC16–AC21 are
    established by inspecting the frozen skill/contract text at the evaluated
    commit.
  - Source: brief scope 12 "Workflow integration"; Design Map "Evaluator v10
    preparation owns the private bundle".
  - Implementation impact: the evaluator contract gains an explicit deterministic
    pre-freeze integrity step upstream of freeze, and a rule that stops automatic
    evaluator-revision churn once the threshold is reached.

- **TR7** — Spike 010a remains byte-for-byte identical to its state at the
  Spike 010b lineage base commit `16ee4ed`, and no synthetic `human-rejected`,
  retroactive `verification-finalized`, or `successor-linked` authority event is
  introduced to represent 010a → 010b lineage.
  - Reason: brief "Process-successor exception", non-goals, AC27, AC28.
  - Source: frozen brief.
  - Implementation impact: implementation changes touch no path under
    `spikes/010a-evaluation-coverage-human-rejection-recovery/`.

## Evaluator Assumptions

- **A1** — Criterion evidence sufficiency is an evaluator judgement supplied as
  public-safe transition evidence; Harness checks structure, materialization,
  traceability, and readiness completeness only, never substantive
  evaluator/test quality (brief scope 11).
- **A2** — Visible authority tests are the justified executable seam. Hidden
  evaluator-authored tests are optional and are not used in this revision;
  non-executable static, artifact, and provenance evidence is first-class where
  explicitly prepared and criterion-specific (brief AC16, AC17).
- **A3** — The private-inventory identity in the readiness attestation is a
  cooperative-integrity mechanism, consistent with the brief "Trust boundary";
  it is not an OS security control and the authority never dereferences it.
- **A4** — The Spike 010b evaluator preparation itself runs under evaluator v9
  plus the brief's bootstrap evaluator exception; the mechanism produced by
  Spike 010b governs only later work.

## Blocking Questions

None.

## Environment Requirements

Node.js `>=24.12.0`, Git, and the repository's existing public test, typecheck,
lint, and formatting tooling. No external services or credentials.
