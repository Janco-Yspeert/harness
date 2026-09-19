# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/013a-Workflow-execution-friction`
- Project commit at preparation: `6e5ff54` (`feat/spike-013a`)
- `spike.md`: `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  (frozen at `c543cae`)
- `design-map.md`: `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
  (frozen at `68f710a`)
- `eval-requirements.md`: content identity recorded in `.eval/freeze.json`
- Canonical evaluator skill: `skills/evaluator/SKILL.md`
- Evaluator skill name / contract version: `evaluator` v11
- Evaluator skill content identity:
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`
- Evaluation revision identity: content identity of the formatted
  `.eval/freeze.json` for revision `001`

### Pinned pre-implementation evaluator authority (AC30, AC31)

`spike.md` "Evaluator bootstrap and self-modification exception" pins Spike
013a evaluator `prepare` and `verify` to an immutable pre-implementation
evaluator authority, recorded publicly at
`spikes/013a-Workflow-execution-friction/bootstrap/`:

- `bootstrap/evaluator-skill.md` - committed copy of the pre-implementation
  `skills/evaluator/SKILL.md`.
- `bootstrap/evaluator-authority.json` - binds `evaluator`, contract version
  `11`, source commit `fae05912f59f8ebdb8982ab16deb26e293754647`, source path
  `skills/evaluator/SKILL.md`, identity
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.

At preparation, `skills/evaluator/SKILL.md` (working tree), the committed blob
at `fae0591`, and `bootstrap/evaluator-skill.md` are byte-identical (all three
hash to the identity above; verified directly with `sha256sum` and
`git show fae0591:skills/evaluator/SKILL.md | sha256sum`). This preparation
already executes the pinned contract.

Unlike Spike 012, no host-side or CLI-side mechanism yet enforces this pin for
workflow `"013a-Workflow-execution-friction"` (`resolveSpike012VerificationAuthority`
in `src/workflow-run.ts` and `bootstrapAuthority` in `tools/workflow.ts` are
both hardcoded to Spike 012 only). Generalizing or duplicating that pin
enforcement for Spike 013a's own evaluator phases is therefore itself
in-scope implementation work under this brief (case PR7, criteria AC30/AC31);
until implementation lands, Spike 013a evaluator phases are pinned only by
this specification's own byte-identity confirmation and by explicit human
invocation (spike.md AC06), not by mechanical host enforcement.

## Pre-Freeze Integrity Gate

Recorded before Status was set to Frozen. Full evidence in
`pre-freeze-integrity-checklist.md`; summarised in `.eval/freeze.json`
`integrityChecks`.

- Shared helpers: none beyond the CLI-invocation and git-plumbing patterns
  already used by the existing public `test/workflow.test.ts` (`run()`,
  `git()`, `provenanceCommit`-style fixture construction), copied inline into
  each hidden test file rather than factored into a shared evaluator helper
  module. No evaluator-authored helper script exists to validate separately.
- Mandatory executable cases (E1-E5): each was run directly with
  `node --test <file>` against the unimplemented baseline at `6e5ff54` before
  freeze. E1 (dispatch-inspection-non-consuming), E2
  (canonical-authority-adoption), and E4 (blocked-phase-retry) FAIL for the
  exact documented reason (`"already been dispatched"` /
  `"Phase evaluator-prepare requires the prior phase to be complete"`). E5
  (authority-status-evidence-aware-transitions) reaches its sanity checkpoint
  (`correctionPermitted: true`) and then FAILS for the exact documented reason
  (`correction-cycle-opened` absent from `legalTransitions`). E3
  (recoverable-preexecution-failure) PASSES today and is frozen as a
  non-regression control over the same `dispatch --execute` code path E1-E2-E4
  extend. No candidate implementation exists at freeze; none was used to shape
  any frozen case. Full transcripts are in `.eval/prepare-run.md`.
- Mandatory non-executable cases (PR1-PR7, LP1-LP3, HB1, COMP1): each names a
  concrete artifact/command/fixture family and a concrete decision rule in
  `case-manifest.json`. None defers "what will be inspected" until after
  candidate exposure. LP1/LP2/HB1/COMP1 additionally fix, before
  implementation, the role, canonical-authority prerequisite, workspace/access
  boundary, permitted side effects, expected semantic role result, and
  cleanup/isolation for both required live-provider fixtures, per spike.md
  "Scenario prerequisites".
- Runtime assumptions validated at `6e5ff54`: Node `v24.18.0` (`>=24.12.0`);
  `npm test` 61/61 passing; `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` each exit 0; `node
  tools/workflow.ts dispatch <phase> <spike>` (no `--execute`) is confirmed to
  mutate `.workflow/state.json` today (the AC20 defect); `node
  tools/workflow.ts authority status` is confirmed to compute
  `legalTransitions` via `validateAuthority(target, item, {})` with literally
  empty evidence (the AC27/AC28 defect), both by direct empirical execution
  against disposable fixtures, not by inspection alone.
- Harness parse/compile/execute: `tools/evaluator-integrity.ts` executes
  against the assembled bundle derived from `case-manifest.json` and
  `coverage-map.json` with `integrity.status: "PASS"` and no diagnostics
  (recorded in `.eval/freeze.json`).

## Explicit Requirements

Sources are the frozen `spike.md` acceptance criteria AC01-AC35 and the
frozen Design Map. Existing behavior and tests are evidence, not automatic
requirements.

- **R1** Every governed workflow-role allocation deterministically resolves to
  the intended repository-owned skill/contract. (AC01)
- **R2** Where a frozen/versioned contract is required, the host-owned
  execution record identifies the exact contract authority used. (AC02)
- **R3** Harness records how the governing contract was supplied/invoked for
  the selected executor; provider prose alone is not sufficient. (AC03)
- **R4** An ordinary provider invocation cannot gain protected evaluator
  authority merely by containing text claiming to be an evaluator role or
  Harness allocation. (AC04)
- **R5** A valid Harness evaluator-role allocation can authorize the protected
  evaluator role without globally weakening evaluator invocation protection.
  (AC05)
- **R6** Direct authorized human evaluator invocation remains supported as a
  separate authorization route. (AC06)
- **R7** Implementation agents or ordinary workflow roles cannot independently
  elect to become the evaluator. (AC07)
- **R8** A valid Harness evaluator allocation can cause Claude to execute the
  protected evaluator role without manual `/evaluator ...` invocation. (AC08)
- **R9** A bounded real Claude execution exercises the original delegated
  protected-role refusal condition (spike.md "Observed failures" #1)
  sufficiently to demonstrate it is resolved. (AC09)
- **R10** A bounded real Codex workflow-role execution records which exact
  contract governed the run and how it was delivered/invoked. (AC10)
- **R11** Codex and Claude may use different execution mechanisms, but
  equivalent valid Harness allocations preserve equivalent methodology
  authority, contract-identity, and semantic-result requirements. (AC11)
- **R12** Harness durably distinguishes provider/process lifecycle from
  methodology-role disposition. (AC12)
- **R13** A provider process that exits normally while refusing/blocking its
  assigned role must not be represented as successful role completion. (AC13)
- **R14** Successful semantic role completion has machine-readable evidence
  distinguishable from process exit alone. (AC14)
- **R15** Methodology progression requiring completion of a governed role
  cannot advance solely because the underlying process terminated
  successfully. (AC15)
- **R16** A fresh/restarted/replacement runner can resume from already-valid
  canonical workflow authority without requiring matching local `.workflow`
  dispatch records. (AC16)
- **R17** Adoption of authoritative checkpoints does not manufacture
  dispatch/completion events that did not occur through that runner. (AC17)
- **R18** Operational state exposes that prior canonical authority was
  adopted/resumed rather than replayed. (AC18)
- **R19** After adoption, the runner derives the correct next eligible
  workflow phase from canonical authority. (AC19)
- **R20** Inspecting/planning a prospective dispatch does not consume an
  execution attempt. (AC20)
- **R21** A host-unreachable, allocation, or equivalent failure before genuine
  worker execution can be retried without manual `.workflow` mutation. (AC21)
- **R22** Retry and recovery behavior does not erase real prior executions or
  rewrite canonical authority. (AC22)
- **R23** A successful dispatch exposes the created host-owned run identity,
  allocated role, and executor. (AC23)
- **R24** An orchestrator/operator can directly inspect or follow the run to a
  semantic terminal outcome. (AC24)
- **R25** The run record exposes the governing contract identity and
  execution/delivery mode. (AC25)
- **R26** Run inspection exposes both process state and methodology-role
  disposition. (AC26)
- **R27** Authority status distinguishes unavailable transitions from
  transitions that are available but require evidence. (AC27)
- **R28** A Spike-011-shaped repairable rejection state exposes the
  correction-cycle transition as structurally available even before its
  required evidence is supplied. (AC28)
- **R29** The temporary direct host-owned execution path overcoming the
  pre-existing adoption defect is explicit, canonical-authority-backed,
  non-fabricating, and scoped to the bootstrap problem. (AC29)
- **R30** Spike 013a evaluator preparation and verification use an immutable
  pre-implementation evaluator authority with deterministic identity and
  provenance. (AC30)
- **R31** Candidate modifications to evaluator invocation semantics cannot
  replace the frozen evaluator authority used to verify Spike 013a. (AC31)
- **R32** At least one bounded integration proves real governed execution
  across the Harness host boundary, not merely static adapter correctness.
  (AC32)
- **R33** Once a routine governed role has been legitimately allocated, the
  execution path can reach its semantic outcome without the human translating
  the allocation into provider-specific invocation instructions. (AC33)
- **R34** After Spike 013a acceptance, the existing Spike 011 Cycle 002
  evaluator-repair can be retried through Harness without manual `/evaluator
  repair`, fabricated workflow history, or manual operational-state repair;
  Spike 013a itself does not complete Spike 011. (AC34)
- **R35** When canonical authority still requires a phase and its prior
  host-owned execution ended non-successful, Harness can allocate a fresh
  execution attempt for that phase without deleting or rewriting the earlier
  run. (AC35)

## Derived Invariants

- **I1** A role, executor, process exit, request payload, or provider prose
  alone never grants evaluator authority or completes a methodology role.
  (Design Map "Invariants"; underlies R4, R5, R7, R8, R9, R13)
- **I2** Provider-specific delivery may differ, but equivalent valid
  allocations have equivalent authority, contract-identity, and
  semantic-result requirements. (Design Map "Invariants"; underlies R11)
- **I3** Methodology attempt identity, execution-attempt identity,
  provider/process lifecycle, and semantic role disposition remain
  independently observable. (Design Map "Invariants"; underlies R12, R26,
  R35)
- **I4** Canonical authority and genuine run history are append-only;
  adoption and retry add facts, they do not rewrite either history. (Design
  Map "Invariants"; underlies R17, R21, R22, R35)
- **I5** Required live Claude, Codex, and host-boundary evidence remains
  mandatory; provider unavailability is a blocked result, not a mock-backed
  pass. (Design Map "Invariants"; brief "Provider unavailability"; underlies
  R8, R9, R10, R32)

## Negative Requirements

- **N1** Reaching the host workflow-run endpoint, or populating fields such
  as role/executor/permission-profile/skill on a request, does not itself
  authorize a protected role. (brief "Delegated authority source and
  validation boundary")
- **N2** A successful provider process exit alone must never satisfy a
  governed workflow prerequisite requiring role completion.
- **N3** A normal process exit without a valid successful role result must
  remain non-successful.
- **N4** The runner must never manufacture historical dispatch/completion
  records for phases it did not itself dispatch/complete.
- **N5** Inspection/planning of a prospective dispatch must never mutate
  operational execution history.
- **N6** A prior dispatch must not permanently prevent retry once its
  execution reaches a non-successful terminal role disposition while
  canonical authority still requires the phase.
- **N7** Static examination of prompts, command arrays, permission profiles,
  adapter configuration, or expected provider behavior is not sufficient
  evidence of unattended governed execution. (brief "Host boundary")
- **N8** Provider unavailability (authentication/service/configuration
  failure) must not be silently treated as a pass using mocks. (brief
  "Provider unavailability")
- **N9** Spike 011 Cycle 002 methodology authority must not be advanced
  during Spike 013a implementation or verification. (spike.md "Spike 011
  recovery")

## Evaluation Cases

All cases are mandatory (`required: true`); spike.md defines no optional
acceptance criteria for 013a.

- **E1** `dispatch-inspection-non-consuming.test.ts` - drives
  `tools/workflow.ts dispatch <phase> <spike>` (no `--execute`) twice against
  a disposable fixture and asserts repeated inspection stays legal, mutates no
  operational history, and does not block a subsequent real dispatch. Covers
  AC20; R20; N5. Executable; currently FAILS against baseline.
- **E2** `canonical-authority-adoption.test.ts` - freezes canonical
  `brief-frozen`/`design-map-frozen` authority in a fixture, initializes a
  fresh `.workflow` state with no local history for those phases, and asserts
  the runner derives `evaluator-prepare` (not an earlier or later phase) as
  next, and does not fabricate local dispatch/completion records for the
  adopted phases. Covers AC16, AC17, AC19; R16, R17, R19; N4; I4. Executable;
  currently FAILS against baseline.
- **E3** `recoverable-preexecution-failure.test.ts` - drives a real
  (`--execute`) dispatch against an unreachable host and asserts local state
  is untouched by the failure and the phase remains dispatchable on retry.
  Covers AC21; R21; I4. Executable; currently PASSES (frozen as a
  non-regression control).
- **E4** `blocked-phase-retry.test.ts` - constructs a genuine execution-attempt
  record (the same `dispatch`+`job` shape a real `--execute` dispatch
  produces) for a phase, records it `blocked`, then asserts a fresh
  `--execute` attempt for that still-pending phase is allocatable and the
  first (blocked) execution's records are preserved unchanged. Covers AC22,
  AC35; R22, R35; N6; I4. Executable; currently FAILS against both the
  baseline and the revision-001 candidate implementation. Revision 002
  (see `.eval/revisions/002/repair-record.md`) corrected this case's fixture
  construction: revision 001 used inspection-only (`dispatch`, no
  `--execute`) calls to simulate "attempt 1", which stopped representing a
  genuine execution once the implementation correctly separated planning
  (`plan` event) from execution (`dispatch` event) per AC20 - a distinction
  the frozen Design Map's "Shared contracts" already required at prepare
  time. The correction does not change what AC22/AC35 require or how they
  are judged; it only fixes the fixture to represent what those criteria
  already named ("host-owned execution").
- **E5** `authority-status-evidence-aware-transitions.test.ts` - replays
  Spike 011's own public authority evidence into a fresh fixture to reach an
  equivalent repairable human-rejection state, then asserts `authority
  status`'s `legalTransitions` includes `correction-cycle-opened` even though
  no evidence for it has been supplied. Covers AC27, AC28; R27, R28.
  Executable; currently FAILS against baseline for the intended reason.
- **PR1** Visible regression obligation: deterministic role-to-contract
  resolution, exact contract-identity binding on the run record, and an
  explicit recorded execution/delivery mode (not provider prose). Covers
  AC01, AC02, AC03; R1, R2, R3. Coverage mode: `PUBLIC_REGRESSION`. No stable
  pre-implementation seam exists because the execution-binding representation
  is Design Map implementation freedom ("execution-binding and delegation
  representation... free"); the implementation must ship `test/*.test.ts`
  coverage exercised by `npm test` and reviewed at verify time against R1-R3's
  decision rule.
- **PR2** Visible regression obligation: a request carrying evaluator-role or
  Harness-allocation-claiming prompt text, submitted other than through a
  mechanically valid Harness evaluator-role allocation, is refused protected
  authority; an ordinary implementation agent or workflow role cannot elect to
  become the evaluator. Covers AC04, AC07; R4, R7; N1; I1.
  `PUBLIC_REGRESSION`. The validation-boundary representation (capability,
  token, structured record) is explicitly Design Map freedom, so no
  pre-authored hidden test can target it without inventing that
  representation.
- **PR3** Visible regression obligation: a mechanically valid Harness
  evaluator-role allocation authorizes the protected role, and explicit
  authorized human evaluator invocation remains a separately valid route.
  Covers AC05, AC06; R5, R6; I1. `PUBLIC_REGRESSION`.
- **PR4** Visible regression obligation: provider/process lifecycle and
  methodology-role disposition are represented as durably distinct facts; a
  process that exits 0 while refusing/blocking its role is never represented
  as role success; role completion carries machine-readable evidence separate
  from exit code; a governed prerequisite is not satisfied by process
  termination alone. Covers AC12, AC13, AC14, AC15; R12, R13, R14, R15; N2,
  N3. `PUBLIC_REGRESSION`. The role-result schema and disposition vocabulary
  are explicit Design Map freedom.
- **PR5** Visible regression obligation: the run/workflow inspection surface
  exposes, without hand-parsing `.workflow`/`workflow.jsonl`, the created run
  identity/role/executor on dispatch; a followable path to a semantic
  terminal outcome; the governing contract identity and delivery/invocation
  mode; both process state and role disposition; and a distinguishable
  adoption/resumption fact. Covers AC18, AC23, AC24, AC25, AC26; R18, R23,
  R24, R25, R26. `PUBLIC_REGRESSION`. The CLI/API surface shape is explicit
  Design Map freedom ("status/inspect/follow command syntax... free").
- **PR6** Visible regression obligation, plus reuse of already-existing
  private history: the Spike 013a bootstrap direct-allocation path (already
  used for this spike's own design-map dispatch, per `manifest.md` Run 003,
  and permitted again by the pre-freeze retry bootstrap for a still-pending
  pre-freeze role) is recorded as an explicit bootstrap exception bound to
  the exact frozen upstream canonical authority it derives from, distinct
  from ordinary runner history, and does not fabricate prior dispatch or
  completion events. Covers AC29; R29. `PUBLIC_REGRESSION`, corroborated by
  the already-preserved `.workflow/state.json` and `manifest.md` history for
  this spike's own preparation.
- **PR7** Composite: (a) provenance re-check, at verify time, that
  `bootstrap/evaluator-skill.md` and `bootstrap/evaluator-authority.json`
  remain byte-identical to their frozen content (this specification's own
  Source section fixes that identity now); (b) a visible regression,
  analogous to Spike 012's pin-dispatch test, asserting the workflow
  dispatcher supplies the pinned bootstrap snapshot - not the working-tree
  `skills/evaluator/SKILL.md` - for Spike 013a `evaluator-prepare` and
  `evaluator-verify` allocations once the pin is generalized past Spike 012;
  (c) confirmation that the finalized Spike 013a verification result binds
  this same bootstrap-authority identity. Covers AC30, AC31; R30, R31.
  `COMPOSITE` (provenance inspection + `PUBLIC_REGRESSION`).
- **LP1** Live-provider fixture: a bounded, repository-owned, canonically
  permitted protected-evaluator-role allocation is dispatched through the
  Harness host to the real Claude adapter, using only the evaluator
  workspace/access the pinned evaluator contract requires and the fixture's
  declared allowed side effects; expected result is a host-validated
  successful evaluator-role disposition reached with no manual `/evaluator
  ...` invocation after allocation, and the run demonstrably exercises the
  authority boundary that previously caused Claude to refuse (spike.md
  "Observed failures" #1). It must not advance Spike 011 Cycle 002 authority.
  Covers AC08, AC09; R8, R9; I1. `LIVE_PROVIDER`. Fixture prerequisites (role,
  canonical-authority precondition, workspace/access boundary, permitted
  side effects, cleanup/isolation) must be fixed by the implementation before
  this case can be exercised at verify time, per spike.md "Scenario
  prerequisites"; a `SPECIFICATION_AMBIGUITY` block (not a fabricated
  pre-implementation fixture) is the correct evaluator response if the
  brief's fixture latitude proves insufficient to make this fair.
- **LP2** Live-provider fixture: a bounded, repository-owned, canonically
  permitted governed-role allocation, limited to its declared fixture
  workspace and side effects, is dispatched through the Harness host to the
  real Codex adapter; expected result is a host-validated successful role
  disposition with the exact contract identity and delivery/invocation mode
  inspectable through the run record. It must not advance Spike 011 Cycle 002
  authority. Covers AC10; R10. `LIVE_PROVIDER`. Same fixture-prerequisite
  caveat as LP1.
- **LP3** Composite of LP1 and LP2: the two fixtures are compared for
  equivalent authority validation, equivalent contract-identity recording, and
  equivalent semantic-result requirements, despite differing provider
  mechanisms. Covers AC11; R11; I2. `COMPOSITE` (`LIVE_PROVIDER` +
  cross-fixture comparison).
- **HB1** At least one of LP1/LP2 is confirmed to cross the real Harness
  host-owned workflow-run boundary (an actual `POST /workflow-runs` request
  reaching a live host process and a real provider child process, not a
  statically constructed command array or mocked backend). Covers AC32; R32;
  N7. `HOST_BOUNDARY`.
- **COMP1** Composite: (a) LP1 and/or LP2's full allocate -> observe ->
  validated-result cycle is confirmed to complete with no manual step
  translating the allocation into provider-specific invocation instructions,
  demonstrating AC33; (b) provenance inspection confirms
  `spikes/011-host-owned-workflow-runs/**` (workflow.jsonl and public
  evidence files) remains byte-for-byte unchanged across Spike 013a
  implementation and verification, and LP1's exercise of the original
  refusal condition (R9) is accepted as the AC34 readiness demonstration,
  since spike.md explicitly forbids 013a from advancing or completing Spike
  011 itself. Covers AC33, AC34; R33, R34; N9; I5. `COMPOSITE`.

## Coverage Matrix

| ID | Cases | Executable coverage | Non-executable evidence plan |
| --- | --- | --- | --- |
| R1-R3 (AC01-03) | PR1 | none | implementation's visible suite (`npm test`), reviewed at verify against the PR1 decision rule |
| R4, R7 (AC04, AC07), N1, I1 | PR2 | none | implementation's visible suite |
| R5, R6 (AC05, AC06), I1 | PR3 | none | implementation's visible suite |
| R8, R9 (AC08, AC09), I1 | LP1 | none | bounded real Claude fixture through the live Harness host, per fixed prerequisites |
| R10 (AC10) | LP2 | none | bounded real Codex fixture through the live Harness host |
| R11 (AC11), I2 | LP3 | none | cross-fixture comparison of LP1/LP2 |
| R12-R15 (AC12-15), N2, N3 | PR4 | none | implementation's visible suite |
| R16, R17 (AC16, AC17), N4, I4 | E2 | `.hidden-test/canonical-authority-adoption.test.ts` | - |
| R18 (AC18) | PR5 | none | implementation's visible suite / status-surface inspection |
| R19 (AC19) | E2 | `.hidden-test/canonical-authority-adoption.test.ts` | - |
| R20 (AC20), N5 | E1 | `.hidden-test/dispatch-inspection-non-consuming.test.ts` | - |
| R21 (AC21), I4 | E3 | `.hidden-test/recoverable-preexecution-failure.test.ts` | - |
| R22 (AC22), I4 | E4 | `.hidden-test/blocked-phase-retry.test.ts` | - |
| R23-R26 (AC23-26) | PR5 | none | implementation's visible suite / status-surface inspection |
| R27, R28 (AC27, AC28) | E5 | `.hidden-test/authority-status-evidence-aware-transitions.test.ts` | - |
| R29 (AC29) | PR6 | none | implementation's visible suite + this spike's own preserved `.workflow`/`manifest.md` history |
| R30, R31 (AC30, AC31) | PR7 | none | provenance re-check + implementation's visible suite |
| R32 (AC32), N7 | HB1 | none | live host-boundary crossing confirmed for LP1/LP2 |
| R33, R34 (AC33, AC34), N9, I5 | COMP1 | none | LP1/LP2 unattended-progression confirmation + Spike 011 provenance check |
| R35 (AC35), N6, I4 | E4 | `.hidden-test/blocked-phase-retry.test.ts` | - |
| I1 | PR2, PR3, LP1 | (see above) | (see above) |
| I3 | PR4, E4 | (see above) | (see above) |
| N8 | LP1, LP2 | none | a required live provider being unavailable must be classified BLOCKED at verify time, not silently passed |

This mapping agrees with `case-manifest.json` and `.hidden-test/manifest.json`.

## Out of Scope

- The internal representation of the execution binding, delegation material,
  role-result schema/disposition vocabulary, adoption-record format,
  retry/concurrency mechanism, and CLI/API surface syntax - all explicit
  Design Map implementation freedom - are not frozen and are not tested for a
  specific shape.
- Redesigning the complete Harness methodology, Light/Standard/Rigorous
  profiles, cost/token telemetry, general model/reasoning configuration, a
  general scheduling system, arbitrary agent-to-agent coordination, a browser
  UI, identical provider-native invocation mechanisms, or removing evaluator
  independence - all explicit spike.md non-goals.
- Actually advancing or completing Spike 011 Cycle 002 - explicitly deferred
  by spike.md to after Spike 013a acceptance (N9; case COMP1 evaluates
  readiness only).
- Human product acceptance - a separate, later gate per the evaluator skill
  contract.

## Limitations

- LP1, LP2, HB1, and COMP1 require live Claude and/or Codex executor access
  and a reachable Harness host at verify time. Per spike.md "Provider
  unavailability" and Design Map invariant I5, if the required executor is
  unavailable for external reasons (authentication, service availability,
  configuration), the affected criteria (AC08-AC11, AC32-AC34) are `BLOCKED`,
  not passed via mocks; this is a limitation of the evaluation environment,
  not license to substitute static evidence.
- PR1-PR7 rely on the implementation's own visible regression suite rather
  than evaluator-authored hidden tests, because the Design Map deliberately
  leaves the underlying representations free. This mirrors the approach
  Spike 012's evaluator preparation used for the same category of freedom
  (see its `eval-requirements.md` TR1) and provides real but
  implementation-suite-mediated falsifiability rather than fully independent
  hidden-test falsifiability.
- E1-E5 exercise the existing `tools/workflow.ts` CLI surface as it exists
  pre-implementation. If the implementation replaces this CLI with a
  materially different entry point while preserving equivalent semantics, the
  hidden tests would need evaluator-side correction under the post-exposure
  repair rules (not a fresh `prepare`), since the frozen brief does not
  freeze the CLI syntax; the underlying behavioral assertions (non-consuming
  inspection, adoption, retry, evidence-aware status) remain the frozen
  criteria regardless of entry-point shape.

## Revision History

- Revision 001: initial frozen preparation, evaluator skill contract v11,
  prepared at project commit `6e5ff54`. Archived at `.eval/revisions/001/`.
- Revision 002 (current): post-implementation-exposure correction of E4
  (`.hidden-test/blocked-phase-retry.test.ts`) discovered during `verify`
  attempt `001` against implementation commit `33fa7c4`. Revision 001's E4
  fixture used inspection-only dispatch to simulate a genuine execution
  attempt; once the candidate correctly separated planning from execution
  (AC20), that construction no longer represented "a host-owned execution"
  at all, so E4 could not fairly judge AC22/AC35. The correction rebuilds the
  fixture as a genuine execution-attempt record without changing what AC22 or
  AC35 require, their decision rules, or any other case. Full details,
  traceability, and the acceptance-semantics-preserved attestation are in
  `.eval/revisions/002/repair-record.md`. Both revisions reach the same
  conclusion against this candidate: `FAIL` on AC22/AC35.
