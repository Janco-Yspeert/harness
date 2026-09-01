# Evaluation Requirements

## Testability Requirements

- **TR1** - The implementation must provide durable, visible in-repository
  regression evidence (executed through `npm test`) for the observable
  correction-cycle and evaluator-repair behaviours the frozen brief enumerates:
  a correction-cycle identity distinct from implementation attempt, verification
  attempt, evaluator revision, and executor/process execution attempt; existing
  pre-cycle history interpreted as Cycle 001 without mutating historical records;
  a human-rejected cycle classified `IMPLEMENTATION_GAP` and/or
  `EVALUATOR_COVERAGE_DEFECT` opening exactly one same-spike correction cycle
  that binds the unchanged frozen brief and Design Map identities and records
  whether implementation correction and/or evaluator repair is required; a
  `SPECIFICATION_CHANGE` (or unqualified `OTHER_HUMAN_REJECTION`) rejection not
  opening a same-spike correction cycle; a human-accepted cycle not being
  reopened; two active cycles not being opened from one rejection; Cycle 001
  PASS, promotion, As-Built, and human decision not satisfying Cycle 002's
  prerequisites; a correction-cycle implementation attempt being legal after a
  human `IMPLEMENTATION_GAP` without a fabricated failed verification, while
  ordinary implementation retry after a genuine failed technical verification
  still works within the same cycle; a validly allocated `verify` attempt never
  mutating the frozen evaluator it executes and an evaluator defect being
  finalized and recorded before repair begins; evaluator `repair` requiring
  immutable authoritative evaluator-defect evidence and rejecting an ungrounded
  request; a successful repair preserving the source revision, creating a
  distinguishable new revision, and running full structural integrity validation
  over the whole resulting revision before it becomes current; repair not
  changing the frozen brief, Design Map, public `eval-requirements.md`, or
  acceptance semantics, and blocking when a materially new public seam or product
  requirement would be needed; every repair producing an immutable repair record
  and a public-safe binding; verification attempts remaining bound to the exact
  evaluator revision executed and revision/attempt identifiers remaining
  monotonic and never reused; new human-rejection evidence representing multiple
  typed findings while remaining compatible with the legacy
  `classification`/`secondaryFinding` shape; and a repairable-rejection cycle
  progressing through its own implementation, verification, promotion, As-Built,
  and a fresh human decision.
  - Reason: the frozen Design Map "Implementation freedom" deliberately leaves
    the internal authority representation, the status JSON shape, the private
    repair-record format, executor command wiring, and the test fixture location
    as implementation freedom, and states that no public API beyond the existing
    authority/status and workflow-run surfaces is required merely for evaluator
    convenience. The frozen brief scope 18 mandates visible deterministic
    regression coverage. Independent evaluation therefore relies on the
    implementation's own visible regression suite rather than an
    evaluator-authored hidden test that would have to invent that surface.
  - Source: frozen brief scope 1-18, the "Spike 011 recovery proof" section, and
    acceptance criteria AC01-AC26 and AC29; frozen Design Map "Shared contracts",
    "Design decisions", "Invariants", "Implementation freedom".
  - Implementation impact: these scenarios live in the public test suite under
    `test/` and are run by `npm test`.

- **TR2** - The visible regression suite must exercise these behaviours without a
  live paid Codex/Claude provider call. Correction-cycle, repair, legacy-history,
  and successor-boundary behaviour must be drivable from deterministic fixtures
  (synthesised `workflow.jsonl` histories, temporary fixture spikes, in-memory
  or recorded evaluator revisions) rather than a lived end-to-end multi-cycle
  spike.
  - Reason: frozen brief scope 18 requires the tests "must not require live paid
    provider calls" and lists AC29 as visible deterministic regression coverage.
  - Source: frozen brief scope 18 and AC29; frozen Design Map "Implementation
    freedom".
  - Implementation impact: the regression suite uses deterministic fixtures and
    the existing test-substitutable seams; no test path requires provider
    credentials.

- **TR3** - The public authority status surface (`tools/workflow.ts authority
  status` or its Design-Map-approved successor) must expose, in a stable form
  observable without reconstructing `workflow.jsonl` by hand, at least: the
  current cycle identity and whether that cycle is open or closed; the current
  evaluator revision; the current implementation attempt when one exists; the
  current or final verification allocation/result; the current cycle's promotion
  state, As-Built state, and human decision; whether same-spike correction is
  permitted and the reason it is or is not; and predecessor/successor lineage
  where applicable. Historical cycles must remain distinguishable through the
  same surface.
  - Reason: AC25 requires an orchestrator or human to be able to determine cycle
    state from the status surface directly; the exact field spellings are
    implementation freedom, the information content is not.
  - Source: frozen brief scope 16 and AC25; frozen Design Map "Shared
    contracts".
  - Implementation impact: the status command returns current-cycle state,
    historical cycle summaries, correction eligibility, and the eligibility
    reason.

- **TR4** - At the implementation commit the evaluator skill
  (`skills/evaluator/SKILL.md` or its Design-Map-approved successor) must expose
  and document three explicit modes - `prepare`, `verify`, and `repair` - with
  non-overlapping responsibilities, and its integer contract version must be
  advanced past the pinned pre-implementation version (10).
  - Reason: AC12 and frozen brief scope 5 require the implemented evaluator skill
    to expose and document the new mode; independent evaluation reads the skill
    file directly.
  - Source: frozen brief scope 5 and AC12.
  - Implementation impact: the skill file gains a documented `repair` mode and a
    bumped contract version without collapsing the `prepare`/`verify`
    responsibilities.

- **TR5** - Each completed or terminally blocked evaluator repair must leave a
  public-safe immutable binding (the frozen Design Map names it
  `evaluator-repair-recorded`) that identifies the authoritative trigger, the
  source and resulting evaluator revisions, the affected public criteria, the
  frozen brief, Design Map, and public evaluation-requirements identities, the
  integrity-validation PASS, and an attestation that acceptance semantics did not
  change. Historical bindings must remain immutable and re-verifiable.
  - Reason: AC20 and AC22 require repair lineage to be publicly distinguishable
    and re-verifiable without overwriting earlier frozen or promoted evidence;
    the exact artifact path and format are Design Map freedom, the information
    content is not.
  - Source: frozen brief scope 10, 11, 12 and AC20, AC22; frozen Design Map
    "Shared contracts".
  - Implementation impact: a public authority binding plus a private repair
    record; earlier bindings are never rewritten.

- **TR6** - The Spike 012 evaluator bootstrap mechanism must make the pinned
  pre-implementation evaluator skill content both executable and
  provenance-verifiable for both evaluator phases. The pinned material
  (`bootstrap/evaluator-skill.md`, bound by `bootstrap/evaluator-authority.json`
  to its name, contract version, source Git object, and SHA-256 identity) must
  be the operative instruction source that the workflow dispatcher supplies for
  Spike 012 evaluator `prepare` and `verify`; the dispatcher must not resolve
  `skills/evaluator/SKILL.md` from the potentially changed working tree for those
  phases. The prepared evaluator freeze and the Spike 012 verification result
  must each bind that same bootstrap-authority identity.
  - Reason: AC27 requires both evaluator phases to be governed by an exact,
    provenance-verifiable pre-implementation evaluator skill identity and the
    execution mechanism to prove the post-implementation skill was not
    substituted as the grading authority.
  - Source: frozen brief "Evaluator skill versioning and bootstrap" and
    "Verification of the bootstrap boundary"; frozen Design Map "Shared
    contracts".
  - Implementation impact: a committed snapshot plus an authority binding wired
    into the dispatcher for the two Spike 012 evaluator phases; both the freeze
    and the verification result cite the bootstrap-authority identity.

- **TR7** - The implementation must ship a deterministic regression fixture
  representing the material authority history of Spike 011 through its existing
  `human-rejected` event (primary `IMPLEMENTATION_GAP`, secondary
  `EVALUATOR_COVERAGE_DEFECT`), derived from public preserved authority evidence,
  that demonstrates the post-Spike-012 authority interprets those events as Cycle
  001, treats the rejection as eligible for a same-spike correction cycle
  requiring both implementation correction and evaluator repair, and keeps the
  frozen brief and Design Map identities from Cycle 001 - without opening or
  mutating Spike 011 itself.
  - Reason: the frozen brief "Spike 011 recovery proof" section and AC06 require
    this specific fixture.
  - Source: frozen brief "Spike 011 recovery proof", "Context and preserved
    history", and AC06; frozen Design Map "Invariants".
  - Implementation impact: a visible test fixture derived from Spike 011's public
    `workflow.jsonl`; no write to `spikes/011-host-owned-workflow-runs/**`.

- **TR8** - The full `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` must pass at the implementation
  commit, and the pre-existing workflow authority/provenance, evaluator-integrity,
  host-owned workflow-run, and session/backend suites must remain green.
  - Reason: AC30 requires existing behaviour to remain green and repository
    validation to pass.
  - Source: frozen brief AC30; `AGENTS.md` "Testing and verification".
  - Implementation impact: additive authority and evaluator-skill changes that
    do not break existing surfaces; all repository checks green.

## Evaluator Assumptions

- **A1** - The internal authority representation, the status JSON field
  spellings, the private repair-record on-disk format, executor command wiring,
  the `correction-cycle-opened` / `evaluator-repair-recorded` evidence field
  spellings, and the test fixture location are implementation freedom under the
  frozen Design Map. Evaluation asserts observable behaviour and information
  content through the visible regression suite and static inspection, not a
  specific schema, route, or file path.
- **A2** - "The authority" means `tools/workflow.ts` (or its Design-Map-approved
  successor) together with its append-only `workflow.jsonl` event model and its
  `authority status` surface. "The evaluator skill" means
  `skills/evaluator/SKILL.md` (or its Design-Map-approved successor).
- **A3** - This evaluator preparation and the Spike 012 verification both execute
  under the pinned pre-implementation evaluator skill `evaluator` v10, content
  identity
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`,
  per the frozen brief "Bootstrap process exception". At the preparation commit
  the working-tree `skills/evaluator/SKILL.md` is byte-identical to the pinned
  `bootstrap/evaluator-skill.md`, so this preparation already runs the pinned
  contract. The newly implemented `repair` mode and correction-cycle authority
  are implementation under test, not the grading or recovery authority for Spike
  012.
- **A4** - The Spike 011 recovery is a deterministic fixture only. Spike 012 does
  not record a real `correction-cycle-opened` transition for Spike 011 or any
  other spike and does not reopen Spike 011; actual reopening is deferred until
  after Spike 012 human acceptance.
- **A5** - "Acceptance semantics unchanged" is judged against the frozen
  `spike.md`, the frozen `design-map.md`, and the frozen public
  `eval-requirements.md`. Existing behaviour and tests are evidence, not
  automatic requirements.
- **A6** - Regression fixtures may drive the authority through synthesised
  `workflow.jsonl` histories, temporary fixture spikes, and in-memory or
  temp-directory evaluator revisions; a real end-to-end multi-cycle spike lived
  through the workflow runner is not required by the visible suite.
- **A7** - "The frozen evaluator bundle" for traceability means the
  criterion-evidence records, the case manifest, the hidden-test manifest, the
  pre-freeze integrity checklist, and the freeze inventory of evaluator revision
  `001` bound to the attempt.

## Blocking Questions

None.

## Environment Requirements

Node.js `>=24.12.0`, Git, and the repository's existing public test, typecheck,
lint, and formatting tooling (`npm test`, `npm run typecheck`, `npm run lint`,
`npm run format:check`). No external services, credentials, or paid provider
access are required to run the evaluation.
