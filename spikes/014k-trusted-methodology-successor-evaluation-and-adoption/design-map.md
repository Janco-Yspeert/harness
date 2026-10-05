# Design Map — 014k Trusted Methodology Successor Evaluation and Adoption

Frozen brief: `spike.md` (`sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c`), verified against the bound identity and committed at `894c71a` (Brief Readiness: READY; findings F1–F3 are settled below as ownership/ordering seams and change no observable behavior).

## Shared contracts

1. **Adoption authority is trusted-N code, never candidate code.** The cutover runs through the pre-K `promoteMethodology` / trusted-history boundary in `src/methodology-evolution.ts`, executed from the trusted runtime checkout, not the candidate. Any extension needed for AC12 is a change evaluated by trusted N; N+1 supplies no adoption, promotion or self-approval route. The operation is a root/human-authenticated host operation, never a worker `requestAction`.

2. **Adoption authority is a distinct recorded artifact.** `human-adoption-decision.md` in the K spike directory is separate from `human-acceptance.md` and is committed before the trusted-history append. It binds, by exact identity: candidate commit, candidate methodology identity, predecessor identity and sequence (`5`), the trusted-N PASS (the verification result identity, not free-form text), and the K-cycle closeout/archive provenance identity. The trusted record's `authority.evidence` cites it. The operation refuses candidate, methodology, predecessor or trusted-head drift, and any authority naming a superseded PASS, candidate or head ("stale"). Replay after the append is refused because the head has moved.

3. **Cutover evidence ordering.** The fresh post-adoption allocation is recorded as `cutover-evidence.md` in the K public artifacts after the trusted-history commit. It cites the adoption record and the grant identity. It is never part of, and never alters, the verified candidate or the trusted-N PASS. Outcome may cite it.

4. **Future observation declaration (N+1 evaluator-facing).** A prepared-observation requirement is a closed, canonical, identity-bearing declaration with exactly these facts:
   - the purpose/procedure identity;
   - the candidate commit;
   - the evaluator revision and its identity;
   - the required host-input classes, as names from a closed vocabulary, never paths or bytes;
   - the consuming criterion/procedure identity;
   - once fulfilled, the resulting sealed `observation` identity.

   Unknown fields, filesystem paths and inline content are rejected. A declaration is a request/description only. The host's existing preparation operation fulfils it, and the declaration confers no authority and cannot select private material. During K this interface is exercised only as candidate software, by deterministic tests and J-prepared observations.

5. **Trusted-N consumption of J evidence is unchanged.** K evaluation obtains actual prepared evidence only through the accepted 014j `prepareCandidateObservation` root operation and the sealed `kernel.prepared-observation` record. Trusted N resolves, recomputes and admits or rejects it. The accepted 014h/014i/014j reconstruction, containment, private resolution, sealing and resolution semantics are not modified; N+1 integration is additive around them.

6. **Verdict is separate from archive state.** There are two independent facts. The **evaluation fact** (`PASS|FAIL|BLOCKED`, evidence identities, candidate/revision provenance) is written by the evaluator path. The **archive/closeout record** is written only by the host. The evaluator never emits `ELIGIBLE`/`INELIGIBLE`. The archive record has its own state (`complete|incomplete|failed`) and references the evaluation fact by identity; it never rewrites it. Archive failure blocks As-Built, adoption and promotion by policy reading that record. It is recoverable by re-running the archive without re-running evaluation.

7. **Attempt lifecycle.** Every allocated verification attempt is recorded in an ordered sequence with exactly one state:
   - `NONTERMINAL`: allocated, with no finalized semantic result. It binds execution/provenance only and requires no terminal artifact path.
   - `TERMINAL`: binds the terminal evaluator artifact identity and the `PASS|FAIL|BLOCKED` result identity, and requires those bytes.
   - `LOST`: used only when durable authoritative history (a prior record binding the artifact identity) proves the evidence existed and it is now unavailable.

   A never-produced artifact is never LOST. Archival preserves the complete sequence, including NONTERMINAL entries.

8. **Active-revision archival and host-owned archive operation.** An identity-valid, complete active evaluator revision (revision identity, freeze metadata, complete inventory, exact bytes, lineage) is archived directly from its canonical active location. No pre-existing `.eval/revisions/<id>/` copy is required. Superseded prior revisions remain reconstructible. The host derives the post-PASS archive plan deterministically from trusted policy and exact evidence identities (PASS, attempt sequence, revisions), with no evaluator/model eligibility judgment. Changed or missing required bytes fail closed, no partial archive is reported complete, and success records exact provenance.

## Design decisions

- Evidence for every mandatory procedure comes from deterministic repository tests on candidate source or committed fixtures, or from J-prepared sealed observations. None depends on a K-introduced authority becoming authoritative (AC01). Evaluator Prepare stops before freeze if that fails.
- If the known evaluator-v14 defect obstructs old-N closeout of the K cycle, the existing bounded legacy recovery is used. It remains labelled old-N compatibility and is not evidence for items 6–8 above.
- The trusted history, candidate methodology reconstruction and PASS binding already settled by `candidateMethodology`, `checkMethodology` and `promoteMethodology` remain the base. K tightens the PASS binding and adds closeout binding there, rather than adding a second promotion path.

## Invariants

- N+1 never authors, finalizes, alters or promotes the trusted-N verdict. Prepared observations are evidence only.
- Trusted history is append-only and advances exactly once, from sequence 5 N to the exact evaluated N+1. Pre-cutover grants stay bound to their original methodology.
- Evaluation facts are immutable with respect to archive outcomes. Archive state never changes PASS/FAIL/BLOCKED.
- Evaluator-facing declarations and evidence carry identities only. No arbitrary private path or byte injection.
- Human acceptance, evaluator PASS and archive success are each insufficient alone for adoption. No authority is backdated.

## Implementation freedom

- Module, type and function names, and the on-disk serialization of the declaration, attempt-sequence and archive records, provided the stated facts are canonical, identity-bound and independently recomputable.
- Archive layout and byte-movement mechanics, provided the stated preservation, fail-closed and provenance behavior holds.
- The exact N+1 methodology content, skill wording and host-action declarations needed to carry these contracts.
- Fixture and test organization, provided every mandatory procedure remains bootstrap-closed under trusted N.
