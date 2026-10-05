# Spike 014j - Human Acceptance

**Date:** 2026-10-05  
**Decision:** ACCEPTED

## Accepted candidate

I accept Spike 014j's implementation at the exact independently verified candidate:

`93ade31b1dcb6487798b27e812dc443fce30af43`

This acceptance is limited to the frozen 014j scope: the bootstrap-closed prepared candidate-observation substrate and the separation of executor profile/model launch selection from exact concrete-model attestation.

It does not accept Spike 014g, promote methodology N+1, start Spike 014f, or authorize any later methodology transition by implication.

## Independent verification

The exact candidate was independently verified under trusted methodology N using evaluator revision `001`, attempt `005`, execution:

`3a077861-616c-44eb-a2c2-bb85b1d89ccd`

The authoritative result was:

- **PASS**
- **AC01-AC13 satisfied**
- typecheck, lint and formatting checks passed
- mandatory executable evaluation passed
- repository regression result was 244/245, with the single remaining 014e containment failure reproduced at the pre-implementation baseline in that evaluation environment

The authoritative verification-result identity is:

`sha256:c1517668c877eb920e4cc8ef2b2cf0343342642542a1af55fd0abf4b46c7a668`

The candidate was evaluated under the predecessor trusted methodology. 014j did not require its newly introduced observation capability to become authoritative in order to prove itself.

That bootstrap-closure property is explicitly accepted as a material result of the spike.

## Promotion and archive qualification

The evaluator's immutable promotion plan recorded:

`INELIGIBLE`

with identity:

`sha256:ea3f37867ec169e12f9466bc19f77dd21b223af8cd9c9eb28e5996545adbca0d`

The reason was the legacy evaluator-v14 archival model, which requires terminal evaluator artifacts for every allocated verification attempt and a historical revision snapshot even where:

- an allocated execution never produced a terminal evaluator result; or
- the exact frozen evaluator revision remains intact at its canonical active location.

Attempts 001 and 003 were nonterminal infrastructure/provider executions. Their terminal evaluator artifacts never existed. They are not lost terminal evidence.

Evaluator revision `001` remained complete and identity-valid at its active canonical location. Its evaluator bytes were not lost.

A bounded loss-aware promotion was therefore authorized and completed under an explicit human archive-loss declaration. No missing evaluator artifact was reconstructed and attempt 005 PASS remained unchanged.

The canonical promotion identity is:

`sha256:b929bd89f8b46ad6f068d02dae59279e8847c1bbc2696eccff0c17ee4651ddc7`

This acceptance does not endorse the legacy `incomplete-known-loss` classification as the desired semantic model. The closeout is accepted as compatibility recovery for the existing trusted evaluator.

## As-Built

The governed As-Built completed successfully.

- Execution: `d51234aa-8376-4e4c-83fc-27d8193712fb`
- As-Built artifact identity: `sha256:3cbd46d2d64756a3b3954ce353475bdc3feed9c7065c389d32e9b9b823290dac`
- Promotion input: `sha256:b929bd89f8b46ad6f068d02dae59279e8847c1bbc2696eccff0c17ee4651ddc7`
- Result: no **Missing**, **Contradictory**, or **Extra** discrepancies

The accepted implementation adds a root-authorized prepared candidate-observation operation that reuses accepted 014h containment and 014i candidate-subject execution, seals identity-bound private evidence outside subject authority, and records only public-safe lifecycle/provenance facts.

It also separates ordinary provider model launch selection from an optional explicit `exactModel` requirement and records concrete provider attestation separately.

## Accepted limitations and required successor notes

The following do not block 014j acceptance, but must remain visible in successor planning.

### 1. Archival lifecycle semantics

The current evaluator archival model incorrectly conflates at least three states:

1. **nonterminal allocation**: an evaluator execution was allocated but never produced a semantic evaluator result;
2. **terminal evaluation**: PASS, FAIL or BLOCKED was produced and has terminal evidence;
3. **lost terminal evidence**: a terminal artifact previously existed but is no longer available.

A nonterminal allocation must not require a fictional terminal artifact and must not be described as lost terminal evidence.

Likewise, a complete identity-valid active evaluator revision must be archivable from its canonical active location. Absence of a redundant copy under a historical-revisions directory is not evidence loss.

The successor methodology work must correct these semantics rather than normalize the 014j compatibility exception.

### 2. Evaluator verdict versus archival state

A genuine evaluator PASS is an evaluation fact.

Archival or promotion incompleteness may prevent closeout or trust adoption, but must not mutate or invalidate the semantic PASS.

The successor methodology should make this separation ordinary rather than dependent on recovery machinery.

### 3. Duplicate candidate-observation generations

The repository now contains both the older frozen candidate-subject path and the newer prepared-observation path.

This duplication is acceptable during the migration because the older path is historical/compatibility substrate and the newer path is not yet part of an adopted successor methodology.

After the successor methodology is established, cleanup should determine which primitive is canonical and retire or isolate obsolete bridging machinery rather than preserving two overlapping execution paths indefinitely.

### 4. Prepared observation is bootstrap infrastructure, not final evaluator UX

014j deliberately exposes prepared observation through existing human/root host authority so the capability can be accepted without recursively depending on itself.

That is the correct bootstrap architecture for this spike, but it should not become the permanent ergonomic evaluator interface.

The successor methodology should allow trusted evaluation to declare and consume required prepared observations through explicit governed authority built on the accepted 014j substrate, while the host remains responsible for resolving private material, executing bounded observation and sealing evidence.

### 5. Host and kernel responsibility

014j keeps the new evidence representation reasonably isolated, but `ExecutionKernel` and `GovernedHost` remain large and increasingly responsibility-dense.

Do not refactor them merely for aesthetics during the methodology transition.

After the successor authority path is proven, a cleanup/consolidation spike should review separation of:

- workflow/authority state;
- provider execution lifecycle;
- host/root lifecycle operations;
- evidence preparation and archival;
- legacy compatibility/recovery paths.

The objective should be deletion and clearer boundaries, not another abstraction layer.

### 6. Model semantics may later need further orthogonality

014j correctly fixes the current alias bug: launch selector/family and provider-attested concrete model are no longer compared as though they are the same concept.

The accepted `exactModel` behavior is sufficient for the current registered adapters.

If a future provider can only launch through a family selector while separately attesting a concrete model, successor work may need to separate launch selector and required concrete attestation even further. No such expansion is required by 014j.

## Next work

The next methodology-successor spike should use the accepted 014j substrate rather than reopening 014g.

Its core responsibilities should include:

1. trusted N uses accepted prepared-observation evidence to evaluate candidate N+1 without granting N+1 authority over its own trust decision;
2. evaluator/archive semantics distinguish nonterminal allocations, terminal results and actual evidence loss;
3. evaluator semantic verdict is separated from archival/promotion state;
4. trusted N remains the sole evaluation authority until a genuine PASS exists;
5. exact human authority then performs one explicit forward-only N to N+1 adoption;
6. a fresh ordinary grant proves the cutover by resolving under the newly trusted methodology.

Only after that successor transition should cleanup consolidate the overlapping observation/recovery machinery and reduce accumulated Spike 014 compatibility structure.

## Decision

No material concern remains that blocks acceptance of the independently verified 014j scope.

Spike 014j is **ACCEPTED**.

This acceptance authorizes the governed workflow to record the human-acceptance transition for the exact candidate/PASS/promotion/As-Built chain above and, once that canonical transition exists, to run Outcome under the pinned methodology.

It does not itself promote methodology N+1 or authorize Spike 014f.
