# Spike 014a Bootstrap Incident — Ungoverned Brief Readiness

## Summary

The first Spike 014a Brief Readiness execution was not performed through a
running Harness governed-execution host.

Codex App, acting as orchestrator, dispatched a Codex child directly through its
native subagent facility. The child produced a plausible readiness review and
reported `READY`, but no Harness Workflow Execution Grant, Role Grant, or
governed execution bound that role.

The active parent session was visibly Terra Light. The orchestration prompt had
requested Terra Medium for normal roles, and the child launch requested
`gpt-5.6-terra` with medium reasoning, but the child runtime exposed no
verifiable model/effort metadata. The requested setting therefore must not be
treated as a confirmed execution fact.

## Recorded history

The following commits are preserved:

- `04f88700e7bd2e96cd35054fcaa8fe210b9a83ff` — successor linkage;
- `12c34ce985779347e8f23b6ac5c06166102f3ee1` — first readiness review;
- `c3bd7a1dad236f1a63c0780db4cfc2e1f6efbc8f` — first `brief-frozen`
  canonical event recorded through the legacy authority CLI.

The readiness reasoning may remain useful as public historical input. It is not
evidence that Brief Readiness ran under Harness role authority.

## Defects exposed

1. Native provider/subagent execution can perform repository-skill-shaped work
   without acquiring Harness Role Grant authority.
2. The current orchestrator contract distinguishes observation from workflow
   execution but does not yet make supervisor-versus-worker identity explicit.
3. The legacy authority recorder can record a role-derived transition from
   artifact/Git provenance without binding the authorized execution that
   produced the role result.
4. Requested model/reasoning configuration can be repeated as prose even when
   the runtime cannot expose enough metadata to confirm it.

These findings are incorporated as new Spike 014a successor scope. They are not
retroactive Spike 014 acceptance failures.

## Forward recovery

Do not delete or rewrite the earlier canonical event.

The materially revised `spike.md` must receive a new Brief Readiness pass.
That pass must use a real governed Spike-014 host execution where available, or
an explicit bounded human bootstrap exception that records equivalent execution
and role provenance.

Only the later reviewed/frozen brief may be used as the authority basis for
Design Map, evaluator preparation, implementation, or verification.
