# As-Built — Spike 012

## Implemented shape

Spike 012 adds forward-only correction-cycle semantics to the public workflow
authority. Existing unannotated histories are interpreted as Cycle `001`; new
events carry an explicit cycle binding. A `correction-cycle-opened` event can
open exactly one successor cycle from a closed, repairable human rejection,
while preserving the original frozen brief and Design Map identities. The
authority keeps implementation attempts, verification attempts, evaluator
revisions, execution runs, promotion, As-Built, and human decisions distinct
and reports both current-cycle state and immutable historical summaries.

Only `IMPLEMENTATION_GAP` and `EVALUATOR_COVERAGE_DEFECT` authorize same-spike
recovery. `SPECIFICATION_CHANGE`, unqualified human rejection, accepted cycles,
identity drift, and duplicate consumption of a rejection route to the existing
successor boundary. A new correction cycle may start an implementation attempt
from a human implementation gap without inventing a technical verification
failure; ordinary implementation retry after a genuine failed verification
remains within the same cycle.

The evaluator contract is now v11 with separate `prepare`, `verify`, and
`repair` modes. Repair requires immutable evaluator-defect evidence, creates a
new evaluator revision and immutable public-safe repair binding, preserves the
source revision, validates the whole resulting revision, and cannot change the
frozen brief, Design Map, public evaluation requirements, or acceptance
semantics. A repair that needs a new public seam or product requirement is
blocked onto the successor path.

For this bootstrap spike, the dispatcher and host-owned workflow-run path load
and validate the committed evaluator-v10 snapshot rather than resolving the
post-implementation evaluator skill. The path verifies the snapshot hash and
source commit, binds the evaluator mode and Spike 012 path, and persists the
validated `verificationAuthority` on the host record. The evaluated candidate
is `8c379025b5c4f99b464e0d03c8c15773c5a84acc`; its verification used evaluator
v10 from `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`, identity
`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`.

Provider-free regression coverage exercises legacy Spike 011-shaped history,
repairable and successor-only human decisions, cycle-local prerequisites,
evaluator-repair lineage and blocking, and the direct host allocation/provenance
path. The Spike 011 fixture reads public evidence only; it does not reopen or
modify that spike.

## Contract comparison

- **Missing** — none observed in the promoted PASS for evaluator revision `001`.
- **Contradictory** — none observed. The final verification attempt `003`
  satisfied all 30 frozen acceptance criteria and 32 procedures.
- **Extra** — none material. The bootstrap evaluator adapter is scoped to Spike
  012 and ends with its human decision, as required by the Design Map.

## Evidence boundary

The frozen brief identity is
`sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
the frozen Design Map identity is
`sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`.
Promotion preserves verification attempt `002` (FAIL) and attempt `003` (PASS)
byte-for-byte, with evaluator revision `001`
`sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`.
The runner-state adoption exception remains recorded: no `.workflow` history
was fabricated, and delegated Spike 012 roles used the host-owned workflow-run
surface where the local runner could not adopt the already-valid frozen phases.
