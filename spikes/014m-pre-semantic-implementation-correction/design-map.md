# Design Map — 014m Pre-Semantic Implementation Correction

Frozen brief: `spike.md`
(`sha256:d0623b61c859a4eb4ec9b11d2894cd26ea66a2f2228a89de6e1b2a83b1bdf224`),
verified against the host-bound identity and the bytes committed at `3b742314`.

## Shared contracts

1. **One canonical authorization.** The configured human decision is
   `authorize-pre-semantic-implementation-correction` and its durable transition
   is `pre-semantic-implementation-correction-authorized`. The transition is the
   sole authority that reopens `implementation`; operational failure, retry
   exhaustion, generic root permission, or human-authored diagnosis alone is not
   sufficient.

2. **Closed authorization evidence.** The authorization record binds the current
   implementation candidate, downstream role, launch-intent identity, latest
   relevant failed launch-attempt identity, operational retry-exhaustion identity,
   recorded operational failure class, and current correction-cycle scope. It
   also contains the non-empty human `reason` and non-empty `defects` string list.
   Its `authorization` field is the SHA-256 identity of the canonical bound
   evidence and diagnosis; caller-supplied values are accepted only when they
   equal the host-derived bindings.

3. **Implementation input and assignment exposure.** The implementation contract
   names the authorization input `preSemanticImplementationCorrection` and binds
   it to the transition's `authorization` identity. When that input is present,
   the governed assignment exposes the corresponding immutable public evidence
   as `executionContext.inputEvidence.preSemanticImplementationCorrection`.
   Hashing that canonical object yields the Role Grant input identity. This is
   the worker's evidence surface for the reason, defects, and host bindings; the
   worker does not infer authority from orchestration status or inspect workflow
   history.

4. **Consumption boundary.** The authorization remains the input to bounded
   failed/interrupted retries of the same correction execution lineage. The next
   successful `implementation-handoff` consumes it, establishes the sole current
   candidate, and makes the ordinary downstream role eligible. It cannot
   authorize another correction after that handoff or after any bound candidate,
   intent, attempt, exhaustion, role, failure class, or scope has drifted.

## Design decisions

- The configured human-decision host operation remains the only public write
  surface for this authority. It resolves the related launch-attempt,
  retry-exhaustion, candidate, allocation-absence, and scope facts as one
  evidence set before appending the transition; independent "latest event"
  lookups that could bind unrelated records are not sufficient.
- The canonical authorization and its assignment projection contain public-safe
  identities and diagnosis only. They do not contain provider diagnostics,
  credentials, evaluator-private material, or a synthesized evaluator semantic
  record.
- Existing `kernel.launch-attempt`, `kernel.retry-exhausted`,
  `implementation-handoff`, correction-cycle scope, Role Grant, and worker
  assignment boundaries remain authoritative. No parallel correction ledger or
  candidate state is introduced.

## Invariants

- Authorization requires the current candidate's exact exhausted failed launch
  intent and no `kernel.allocation` for that intent; it creates no allocation,
  semantic attempt, evaluator result, verdict, classification, or
  `verification-finalized` event.
- The operational failure class remains operational evidence. Human `reason` and
  `defects` justify bounded correction but do not rewrite that class.
- A fresh Workflow Grant may use this transition only when pinned to the adopted
  successor methodology. Earlier grants retain their original methodology and
  interpretation of preserved history.
- Existing implementation retry limits and all ordinary evaluator,
  implementation-failure correction, evaluator-repair, acceptance, promotion,
  As-Built, Outcome, and methodology-adoption paths are unchanged.

## Implementation freedom

- The policy predicate decomposition and the minimal generic relational-binding
  enforcement needed to prove the authorization evidence is one coherent set.
- Type, helper, and test-fixture names and the internal derivation of the
  canonical evidence object, provided the transition, input name, assignment
  projection, identity rule, and consumption boundary above remain stable.
- Deterministic test organization and injected operational failure classes,
  provided tests exercise the real decision, resolution, retry, handoff, and
  assignment surfaces rather than a duplicate state model.
