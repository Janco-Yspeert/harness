# Outcome — Spike 014j Bootstrap-Closed Evaluation Substrate

## Result and exact provenance

**COMPLETE — STANDARD.** Human acceptance covers the exact independently evaluated candidate `93ade31b1dcb6487798b27e812dc443fce30af43`. Evaluator revision `001` (freeze identity `sha256:0fc74dfc962243b48b5e048960857bb22299d9fa37d8ca74c91ed7737042d16e`) recorded `PASS` in attempt `005`, execution `3a077861-616c-44eb-a2c2-bb85b1d89ccd`; the verification result identity is `sha256:c1517668c877eb920e4cc8ef2b2cf0343342642542a1af55fd0abf4b46c7a668`.

The frozen brief is `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d` at commit `96c218f`; the Design Map is `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910` at commit `32bdc94`. The canonical promotion identity is `sha256:b929bd89f8b46ad6f068d02dae59279e8847c1bbc2696eccff0c17ee4651ddc7`, committed at `69cd431dfcab48b48d576ee93acef3384db000cf`. As-Built identity `sha256:3cbd46d2d64756a3b3954ce353475bdc3feed9c7065c389d32e9b9b823290dac` was committed at `d81cc98262d51fa82d16226d1f0da53c9b3a37d8`. Human acceptance of the same candidate and chain was committed at `ced1a67817fe4d97892e2cb44391cc5173158d08`.

## What Was Established

The spike proved under predecessor trusted methodology N that Harness can prepare an exact, bounded candidate-evaluator observation without granting candidate methodology authority. The host resolves identity-bound evaluator-private material and host inputs, runs the candidate composition through the accepted candidate-subject and containment paths, seals evidence outside subject authority, and exposes only a public-safe lifecycle record for later trusted inspection.

It also established that provider launch selection and concrete model attestation are distinct facts. A profile or workflow `model` remains a launch selector; optional `exactModel` is the explicit concrete constraint. Without `exactModel`, selector and attested strings are not compared. With it, launch enforcement and matching provider attestation are mandatory and fail closed.

This is bootstrap infrastructure, not a methodology transition: 014j did not adopt N+1, accept 014g, or make the new observation operation a worker action.

## Implementation Summary

The implementation adds the root-authenticated `prepareCandidateObservation` host operation, evaluator-private bundle sealing and resolution, deterministic `kernel.prepared-observation` records, and generic executor provenance for profile, requested selector, required exact model, and confirmed provider model. It reuses the 014h containment boundary and 014i candidate-subject runner rather than adding a second execution engine. Visible tests cover the closed authority boundary, identity and material validation, privacy and topology, tamper rejection, non-authoritative lifecycle behavior, selector precedence, exact-model enforcement, unavailable attestation, and both registered adapter shapes.

## Evaluation Evidence

Evaluator revision `001` remained unchanged throughout implementation and verification. Attempt `005` satisfied AC01–AC13. Its clean candidate checkout passed the mandatory E1–E3 cases, typecheck, lint, and formatting. The repository suite passed 244 of 245 tests; the remaining 014e containment failure reproduced at the pre-implementation baseline in the evaluator environment and was classified as environmental rather than a 014j defect.

Promotion was not an ordinary complete-history archive. Evaluator-v14 marked its plan `INELIGIBLE` because allocated attempts 001 and 003 produced no terminal semantic result and because the archival model expected redundant historical revision placement. A human-authorized, bounded loss-aware promotion preserved the intact revision 001 and attempt 005 PASS, reconstructed no missing artifact, and recorded the limitation. This compatibility recovery does not turn nonterminal executions into evaluation results or weaken the accepted PASS.

## Material History

The first Brief Readiness run blocked freeze on two contract issues; the revised brief then passed readiness. Evaluator preparation froze revision `001` after its pre-freeze integrity validation passed without executing candidate code.

Implementation required three candidate attempts. Verification attempt `002` failed because required host-operation behavioral coverage was missing. Attempt `004` failed on a deterministic host-operation test. The third implementation corrected the duplicate preparation in that test, and attempt `005` passed. No evaluator correction occurred after implementation exposure. Attempts 001 and 003 were infrastructure/provider executions with no semantic evaluator result; their absent terminal artifacts drove the later archival compatibility recovery.

## Decisions

- Prepared observation is a human/root host lifecycle operation, not a worker permission or candidate-controlled authority seam.
- Private procedure material, host inputs, and derived raw output remain evaluator-private until an independently authorized successful-result promotion.
- The safe canonical record is the lookup and lifecycle fact; the sealed bundle manifest is the evidence integrity root.
- Model aliases are not inferred. Launch selector, exact constraint, and concrete attestation remain orthogonal facts.
- A semantic evaluator verdict and archival completeness are separate; the accepted PASS was not rewritten to accommodate the legacy archive model.

## Discoveries

Bootstrap closure was practical: deterministic repository tests, identity inspection, and manual authority review were sufficient to evaluate the new substrate without invoking it as newly trusted authority. The repeated implementation failures also showed that presence of an authority seam is insufficient evidence; the exact successful host-operation path needed deterministic behavioral coverage.

The closeout exposed a methodology defect in evaluator-v14 archival semantics. A nonterminal allocation is not lost terminal evidence, and an identity-valid active frozen revision should not require a redundant historical copy merely to be promotable.

## Deferred Concerns

The prepared-observation entry point is intentionally root-oriented bootstrap UX. A successor methodology should give trusted evaluation an explicit governed way to declare and consume observations while retaining host-owned resolution, execution, and sealing.

The older candidate-subject path and newer prepared-observation path overlap during migration. Consolidation should wait until the successor authority path is proven, then prefer deletion and clearer responsibility boundaries over another abstraction layer. `ExecutionKernel` and `GovernedHost` also remain responsibility-dense. Future providers may require launch-family selection and exact concrete attestation to be separated further than the current adapters require.

## Skill Versions and Workflow Cost

Material work used Brief Readiness v5, Design Map v4, Evaluator v14, Implementation v5, As-Built v4, and Outcome v5. The manifest records three readiness runs, one Design Map run, one evaluator preparation, three implementation runs, three terminal verification results plus two nonterminal allocations, and one As-Built run before this Outcome. No entry is identified as retrospective. Recorded runs report zero provider calls where that measurement was available; runtime token and wall-clock measurements were unavailable and are not estimated. The accepted candidate delta from the Design Map baseline was 16 files, 1,412 insertions, and 117 deletions; the As-Built artifact was 23 lines.

## Next Step

Run the methodology-successor spike using accepted 014j infrastructure: trusted N should evaluate N+1 through prepared evidence, archive semantics should distinguish nonterminal allocations from terminal results and actual loss, and one explicit human act should perform the forward-only N-to-N+1 adoption. Only after that cutover is proven should cleanup consolidate observation and recovery machinery.
