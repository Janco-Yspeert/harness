# Brief Readiness Feedback — Spike 015a Recovery Sequence 7 Certification

Reviewed input: `spikes/015a-recovery-sequence7-certification/spike.md`
(`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`).

Skill: brief-readiness, contract version 5.

## Summary

The draft is ready to become a frozen implementation contract after the
non-blocking clarifications below are retained in the Design Map and evaluator
preparation. It has a bounded new responsibility: an optional declaration,
host-owned check, and current-record gate for fresh sequence-8 split workflows.
It clearly separates that later operational proof from the sequence-7
certification PASS, preserves `PROCESS_EXCEPTION`, and does not turn the
candidate into an authority source.

The already-present `design-map.md` and `eval-requirements.md` are public
recovery inputs, not authority for this review. In particular, their prose must
not be treated as a frozen Design Map or evaluator-preparation result for this
workflow until the ordinary post-readiness workflow has created and recorded
those artifacts under this workflow's own authority.

Repository evidence consulted: `AGENTS.md` (required workflow order and
provenance rules), `skills/outcome/SKILL.md` (the existing STANDARD and
PROCESS_EXCEPTION paths), `methodologies/harness/policy.json` (Outcome
prerequisites and modes), `src/methodology-evolution.ts` (Outcome vocabulary
coherence), and `spikes/015a-bootstrap-closed-completion-path/feedback.md`
(selective public historical context for the same bound brief).

## Findings

### Blockers

None.

### Material clarifications

1. **Pre-adoption positive evidence versus production-provider provenance
   (BC03–BC06).** The draft correctly prohibits fixture-injected execution from
   satisfying the real completion obligation, while requiring a
   supervised-provider fixture as sequence-7 evidence. State that an
   implementation-independent positive test may use a double at the registered
   provider-adapter boundary to generate the same host-observed facts, but that
   it proves only the host decision path. The fresh sequence-8 pilot through
   the production registered-provider adapter remains the only operational
   proof. Inline execution, profile labels, and injected canonical facts remain
   non-satisfying.

   *Consequence:* without this distinction, an implementer could either make
   pre-adoption success untestable or mistake fixture provenance for the later
   real smoke.

2. **Expected baseline failure semantics (BC05).** Define the bounded success
   condition for the immutable baseline test: a normally spawned Node built-in
   test-runner exit of `1` is sufficient, and timeout, signal, spawn/setup
   error, output overflow, or another exit is non-satisfying. The exact final
   candidate must exit `0`; output should be bounded and identified rather than
   semantically parsed.

   *Consequence:* the phrase “expected missing behavior” otherwise leaves a
   later role to choose between brittle output matching and accepting a broken
   fixture.

3. **Finalization trigger and idempotence (section 2, BC06).** State that
   accepted semantic `implementation-handoff` triggers the narrow host
   finalizer, and that same-handoff requests are serialized and converge on one
   attempt/result key. A later accepted handoff may create a new attempt and
   supersede the old one for currentness.

   *Consequence:* this removes ambiguity about whether a completion attempt is
   discretionary and prevents duplicate success records under retries.

4. **Non-satisfying attempt records and currentness (BC06–BC07).** State that
   every finalization leaves a host-owned canonical, bounded attempt fact;
   failure creates neither `completion-smoke.json` nor
   `completion-smoke-recorded`. A successful record is current only while it
   binds the declaration, adopted authority, latest accepted handoff, exact
   final source candidate, and descended brokered docs checkpoint, with no
   later accepted handoff or source/docs candidate checkpoint.

   *Consequence:* the Outcome allocation and terminal STANDARD checks need one
   shared, mechanically testable definition instead of a merely historical
   successful event.

5. **Configuration and origin drift (BC02, BC06).** State that the frozen
   declaration's workspace identity, configured Git-origin, and lineage
   bindings are revalidated at finalization and at Outcome checks; any drift
   fails closed rather than becoming an undeclared legacy workflow.

   *Consequence:* freeze-time validation alone cannot protect a later host
   action from a changed split-project configuration.

6. **Outcome contract/version boundary (BC08–BC09).** State that the
   sequence-8 Outcome skill/contract is materially versioned to accept the
   declaration and record identities when present, while the sequence-7
   certification Outcome stays bound to its predecessor version and cannot use
   a later smoke as its completion evidence.

   *Consequence:* this prevents an implementation from accidentally applying
   a new rule retroactively to the certification workflow.

### Editorial

- Name the existing inherited `/tmp` containment failure's test or tracking
  location when the Design Map establishes its baseline comparison.
- Make the full-suite regression expectation explicit alongside the focused
  AC01–AC13 checks.

## Review limitations

This was a static review of the bound draft and selected public repository
contracts. I did not inspect evaluator-private material, workflow ledgers, or
run executable checks. The physical recovery-input Design Map and evaluation
requirements were inspected only to identify their non-authoritative status;
their asserted freeze/preparation claims were not used as evidence that this
workflow has completed either phase.

## Files changed

`spikes/015a-recovery-sequence7-certification/feedback.md` and
`spikes/015a-recovery-sequence7-certification/manifest.md`. No preliminary
snapshot was created because the verdict passes.

## Verdict

**Ready after minor clarification**
