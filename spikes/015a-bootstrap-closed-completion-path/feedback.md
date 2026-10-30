# Brief Readiness Feedback — Spike 015a

Reviewed input: `spikes/015a-bootstrap-closed-completion-path/spike.md`
(`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`).

Skill: brief-readiness, contract version 5.

## Summary

The brief is bounded and internally coherent. It separates the sequence-7
certification from the sequence-8 smoke, it does not require a post-adoption
event for the PASS, and it keeps the existing PROCESS_EXCEPTION path. No
unresolved authority cycle was found. The findings below are clarifications for
the Design Map and Evaluator Prepare. None forces a scope or contract decision
onto a later role.

Repository evidence consulted: `skills/outcome/SKILL.md` (STANDARD and
PROCESS_EXCEPTION modes and the bound `promotion`/`processException` inputs),
`src/methodology-evolution.ts` (Outcome mode vocabulary check),
`tools/legacy-workflow.ts` (`brief-frozen` transition), and
`spikes/015-separate-source-and-workflow-repositories/manifest.md` (prior
lifecycle shape).

## Findings

### Blockers

None.

### Material clarifications

1. **Positive-path evidence versus the "no fixture" rule (BC03, BC05, BC06).**
   The brief requires success to come only from a host-observed production
   registered-provider spawned allocation. It also says fixture-injected
   executions fail closed. Its pre-adoption evidence is a "supervised-provider
   fixture". Under sequence 7 no real post-adoption smoke is allowed, so a
   positive completion-record case can only be exercised with a test double.
   *Consequence:* implementers and the evaluator may diverge on what a
   pre-adoption "success" proves and on how the double is distinguished from
   forgery.
   *Smallest clarification:* state that pre-adoption positive cases use a test
   double at the provider-adapter boundary that produces the same host-observed
   facts, and that the real production-adapter path is proven only by the later
   sequence-8 smoke. The negative cases, such as a fake launch or inline
   execution, remain mandatory.

2. **"Expected missing behavior" for the baseline failure (BC05).**
   The brief does not say how the host decides that the baseline failed for the
   expected reason rather than a broken fixture, a crash or a timeout.
   *Smallest clarification:* state whether a non-timeout Node test-runner
   failure exit from the declared target suffices, or whether a specific
   outcome identity must be declared. Also state that timeout, spawn failure and
   output overflow are non-satisfying.

3. **Trigger and ownership of finalization (section 2).**
   The host "may run" the check after a qualifying handoff. The brief does not
   say what triggers it, or whether it runs automatically or on an explicit
   host step. It also does not say how concurrent or repeated triggers for the
   same handoff are serialized.
   *Smallest clarification:* name the trigger point, such as handoff acceptance
   or an explicit host finalization, and state that same-handoff attempts
   converge on one result record.

4. **Failed-attempt record location and shape.**
   A failed check produces a "bounded, non-satisfying completion-attempt
   record". The brief does not say whether it is a committed docs artifact, a
   ledger event, or both, nor whether a later successful attempt supersedes it.
   *Smallest clarification:* one sentence on storage and on supersession by a
   later handoff or retry.

5. **"Current" and "latest accepted Implementation handoff" (section 3, BC07).**
   Correction cycles can produce several handoffs. State that a record is
   current only if no later accepted Implementation handoff, and no later
   source or docs candidate change, exists after the handoff it binds.

6. **Declaration versus configuration drift (BC02).**
   The declaration is matched against "actual split project configuration and
   Git origins" at freeze. State whether those bindings are re-verified at
   completion time. Say what happens if the configuration changes after freeze;
   the likely answer is fail closed.

### Editorial

- The brief names the Outcome contract update. Say which Outcome skill/contract
  version is expected to change, and that sequence-7 certification Outcomes are
  unaffected.
- The `/tmp`-layout containment test failure is described as tracked
  separately. Reference its tracking location, or name the test, so baseline
  comparisons are reproducible.
- BC10 asks for "focused regression execution". Say whether a full-suite run is
  also required; the BC11 table row implies yes.

## Review limitations

The review was a static check of the brief against selected repository
contracts. The following were not inspected or run: evaluator-private material,
the full host and kernel implementation, and the feasibility of the
declaration/check seams in detail. No tests were run. Freeze conditions 1–5 are
properly deferred to the Design Map and Evaluator Prepare.

## Files changed

`feedback.md` and `manifest.md` in this directory. No preliminary snapshot,
because the verdict passes.

## Verdict

**Ready after minor clarification**
