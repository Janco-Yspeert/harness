# Outcome — Spike 012 Correction Cycles and Evaluator Repair

## Result and exact provenance

**COMPLETE — independently evaluated PASS, accepted by the user.**

Implementation attempt `003`, commit
`8c379025b5c4f99b464e0d03c8c15773c5a84acc`, passed verification attempt
`003` against frozen evaluator revision `001`
`sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`.
The promoted evaluator executed under the pinned bootstrap evaluator v10
snapshot from `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`, content identity
`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`.
Promotion and As-Built are complete; human acceptance is recorded in the
canonical public authority.

## What Was Established

Harness can now model a correction cycle separately from implementation,
verification, evaluator-revision, and executor identities. Legacy history is
treated as immutable Cycle `001`; a repairable human rejection can create a
single, explicitly bound Cycle `002` without changing frozen product authority.
PASS, promotion, As-Built, and the human decision are cycle-local.

The evaluator contract is v11 and separates `prepare`, `verify`, and `repair`.
Repair requires authoritative evaluator-defect evidence, preserves source and
prior evidence, creates a new revision with integrity validation, and cannot
change frozen acceptance semantics. Specification changes remain successor-only.

Spike 012 also established a deterministic bootstrap path for itself: the
host-owned evaluator run validates and supplies the committed evaluator-v10
snapshot rather than treating the post-implementation evaluator skill as its
own grading authority.

## Evaluation Evidence

The promoted final result satisfies all 30 frozen acceptance criteria through
32 procedures. Provider-free visible regression covers the correction-cycle,
repair, successor-boundary, legacy Spike 011 fixture, and pinned evaluator
provenance behavior. As-Built found no missing, contradictory, or material extra
behavior against the frozen contract.

## Material History

Verification attempt `001` is preserved as a non-PASS result after execution
stopped before evaluator entry. Attempt `002` failed on six missing public
regressions; attempt `003` added those bounded tests and passed. Evaluator
revision `001` was not corrected during this bootstrap cycle.

## Discoveries

- **PRE_VERIFICATION_ALLOCATION_EVIDENCE_GAP** — attempt `001` was finalized
  without a corresponding evaluator-ledger attempt because it stopped before
  evaluator entry; current authority cannot represent that intermediate terminal
  state.
- **UNNECESSARY_PROMOTION_HUMAN_GATE** — promotion waited for explicit user
  confirmation even though it was autonomous evaluator-owned work.
- **RUNNER_STATE_ADOPTION_GAP** — valid frozen Brief Readiness and Design Map
  checkpoints could not be adopted by the local runner without fabrication;
  remaining roles used direct host-owned allocation, with no `.workflow`
  history created.
- **CLAUDE_INVOCATION_MODEL_GAP** — generic Claude execution refused the
  protected evaluator role; the configured evaluator entrypoint was required.

## Decisions

- Do not retroactively modify or reopen Spike 011. Its recovery is covered by a
  deterministic public fixture and remains a post-acceptance decision.
- Keep Spike 012's v10 bootstrap evaluator exception scoped to this spike's
  completed human decision; v11 repair and correction-cycle facilities never
  graded or recovered Spike 012 itself.

## Skill Versions and Workflow Cost

Brief Readiness v3; Design Map v2; evaluator v10 for Spike 012 preparation and
verification; implementation v3; As-Built v2; Outcome v3. Manifest entries are
contemporaneous; no reliable runtime cost statistics were available, so none
are invented.

## Next Step

Review and squash-merge `feat/spike-012` through the normal pull-request
workflow. Track the four discoveries as methodology/host follow-up work; none
requires rewriting this accepted spike's evidence.
