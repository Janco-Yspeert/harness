# Evaluation Requirements

## Testability Requirements

- **TR1** - The implementation must build the "smallest durable mechanism"
  required by frozen brief §7 supporting `candidate`, `check`, `diff`,
  `exercise`, and `promote` semantics, and must provide durable, visible
  in-repository regression evidence (executed through `npm test`) that: a
  candidate methodology manifest can be constructed from one exact
  repository revision and correctly reports whether it differs from or
  equals the current trusted identity; `check` validates structural
  coherence, policy/contract/skill links, capability vocabulary, and
  forbidden worker-authority patterns, and rejects **at least one
  deliberately contradictory skill/contract fixture** written by the
  implementation itself (AC15); `diff` reports component-level material
  changes (skills, contracts, policy, validators, capabilities, result
  vocabularies, privileged-action requirements) between two manifests;
  `exercise` runs a bounded disposable compatibility scenario against a
  candidate without creating trusted workflow authority for it and without
  publishing; and `promote` requires explicit simulated human authority,
  changes only the trusted identity used by *future* workflow grants, and
  does not retroactively alter a workflow already bound to the prior trusted
  identity.
  - **Strengthened under evaluator revision 002 (post-verification repair;
    see `evaluation/revisions/002/eval-spec.md` R21/R23 once promoted), each
    bounded per explicit human bootstrap clarification to the smallest
    structural/truthfulness check rather than adversarial-hardening
    machinery:** additionally, `promote` must reject a candidate whose
    supplied manifest does not reconstruct from its own claimed revision
    (the minimal check needed to preserve one coherent methodology
    identity); and `exercise` must truthfully perform its already-required
    bounded compatibility/smoke-test function by demonstrably referencing
    something genuinely derived from the specific candidate's own content,
    not only a generic environment-capability proof indistinguishable
    across any candidate — full role/workflow simulation is explicitly not
    required.
  - Reason: frozen Design Map "Implementation freedom" fixes the command
    names and storage layout of these five operations as implementation
    freedom ("Command names and storage layout are implementation freedom")
    while fixing that "the observable inputs and outputs are not" — all five
    operations must accept/return exact complete methodology identities and
    machine-readable results. Evaluation therefore relies on the
    implementation's own visible regression suite rather than an
    evaluator-authored hidden test that would have to invent the entry-point
    shape.
  - Source: frozen brief §7 "Safe future skill evolution", §8 "Evaluator
    recursion rule", AC12-AC16; frozen Design Map "Coherent methodology
    identity and safe evolution", "Implementation freedom".
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`,
    plus the implementation's own As-Built/implementation report must
    identify, by path, the module(s)/entry point(s) that realize
    `candidate`/`check`/`diff`/`exercise`/`promote` so the evaluator can
    perform the AC12-AC16 manual-inspection component fairly at verify time.

- **TR2** - The implementation must reconcile every `SKILL_MUST_CHANGE` and
  `CONTRACT_MUST_CHANGE` disposition recorded in the frozen Design Map's
  Skill ↔ Contract Fidelity Matrix (all eight active roles) so that the
  migrated skill prose and contract JSON agree with the matrix's stated
  target for each dimension, without silently normalizing any
  `KERNEL_SUPPORT_REQUIRED` finding into skill-prose enforcement it cannot
  actually provide.
  - Reason: AC02 requires no unresolved silent mismatch; the frozen matrix
    is the authoritative target already reviewed under direct human bootstrap
    authority (frozen brief "Bootstrap process exception").
  - Source: frozen brief AC01-AC02, §1 "Complete Skill ↔ Contract Fidelity
    Audit"; frozen Design Map "Skill ↔ Contract Fidelity Matrix", "Generic
    kernel handback to Spike 014a".
  - Implementation impact: edits to `skills/*/SKILL.md` and
    `methodologies/harness/contracts/*.json`; `methodologies/harness/policy.json`
    where the matrix's `CONTRACT_MUST_CHANGE` findings implicate configured
    policy.

- **TR3** - The full `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` must pass at the
  implementation commit.
  - Reason: existing behavior must not regress while this spike migrates
    skill/contract/policy content.
  - Source: `AGENTS.md` "Testing and verification".
  - Implementation impact: additive/consolidating changes that do not break
    existing repository checks.

## Evaluator Assumptions

- **A1** - The internal representation, storage, and API/transport of the
  `candidate`/`check`/`diff`/`exercise`/`promote` mechanism (TR1), and the
  exact JSON field name used for Outcome's `STANDARD`/`PROCESS_EXCEPTION`
  completion-mode fact (frozen brief §4 "Outcome": "The exact field name is
  implementation freedom"), are explicit Design Map/brief implementation
  freedom. Evaluation asserts observable behavior and documented semantics
  through the implementation's own visible regression suite and manual
  inspection against the decision rules frozen in `eval-spec.md`/private case
  manifest, not a specific schema, field name, or file path — except where a
  hidden test targets a JSON field/array value already fixed by an existing,
  pre-014b public contract-file format (e.g. `capabilities`, `workspaces`,
  `forbiddenExposure`, `methodology.classification`), which is not a 014b
  invention.
- **A2** - The frozen Design Map's Skill ↔ Contract Fidelity Matrix
  dispositions (`MATCH`, `SKILL_MUST_CHANGE`, `CONTRACT_MUST_CHANGE`,
  `KERNEL_SUPPORT_REQUIRED`, `INTENTIONALLY_ARTIFACT_ONLY`) are frozen
  authority. A `KERNEL_SUPPORT_REQUIRED` finding's absence of runtime
  enforcement is not itself an AC02/AC08 failure, provided the affected
  contract or skill still documents the underlying invariant descriptively;
  it remains a recorded handback to Spike 014a (AC18), which this
  evaluation treats as already satisfied by the frozen Design Map's own
  "Generic kernel handback to Spike 014a" table and does not require the
  implementation to touch.
- **A3** - This preparation and any later verification of Spike 014b run
  under the one-time human bootstrap exception in the frozen brief and
  `bootstrap/authority.md`. The sole evaluator instruction authority is the
  frozen snapshot at evaluator tree identity
  `821e1a85e75c43794eba2e0d820be9b46e05ba15`
  (`skills/evaluator/SKILL.md` content identity
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  confirmed byte-identical to the plain working-tree copy at preparation
  time. Candidate edits to `skills/evaluator/**` made during 014b
  implementation are candidate methodology changes only and do not alter
  this preparation's or verification's evaluator authority. The candidate
  evaluator must never evaluate, promote, or otherwise establish authority
  for itself during this spike (AC13, AC14).
- **A4** - The orchestrator (`skills/orchestrator/SKILL.md`) is explicitly
  not a methodology role (frozen brief "Scope") and is outside the direct
  fidelity-matrix scope of this evaluation; it is reviewed only incidentally
  if the implementation touches it, and only for compatibility with the
  migrated role-result taxonomy.
- **A5** - "Acceptance semantics unchanged" is judged against the frozen
  `spike.md` (committed `e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`), the
  frozen `design-map.md`/`bootstrap/authority.md` (committed
  `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`), and this `eval-requirements.md`.
  Existing behavior and tests are evidence, not automatic requirements.
- **A6** *(added under evaluator revision 002)* - Evaluator revision 002 is
  a post-verification repair triggered by the human review
  `post-verification-review.md` (committed `08a138d`), which raised seven
  findings (D01-D07). Mid-repair, an explicit human bootstrap clarification
  fixed the scope: findings do not automatically become new mandatory
  criteria; only a finding demonstrating failure to satisfy an
  already-frozen, unambiguous requirement may strengthen coverage; and
  Harness's threat model is cooperative fallible agents, not adversarial
  hardening. Under that clarification, only D01 and D03 strengthened TR1
  (each bounded to the smallest structural/truthfulness check), and only
  D05 became a new requirement (TR2's existing fidelity-reconciliation
  scope already covers it; it is independently re-checked via a new hidden
  test). D02, D04, D06, and D07 were examined and **not** incorporated as
  blocking requirements: none is independently and unambiguously required
  by the frozen `spike.md`/`design-map.md`, so each is recorded only as a
  non-blocking design observation. This repair's own first draft had
  briefly added D02 and D06 as blocking requirements before the
  clarification arrived; both were withdrawn before this evaluator revision
  was frozen — the private `eval-spec.md` records this transparently as
  repair overreach that was caught and corrected, not as authority.
  Verification attempt 001's `PASS` result remains immutable historical
  fact and is not retroactively altered by this revision; it remains bound
  to evaluator revision 001.

## Blocking Questions

None.

## Environment Requirements

Node.js (locally available `v24.18.0`; repository `engines` states
`>=24.12.0`), Git, and the repository's existing public test, typecheck,
lint, and formatting tooling (`npm test`, `npm run typecheck`, `npm run
lint`, `npm run format:check`). No external network access, GitHub
credentials, or a running Harness host process are required for any part of
this evaluation: 014b's scope is skill prose, JSON contracts, configured
policy, and the new bounded methodology-evolution mechanism, not kernel
execution.
