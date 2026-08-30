# Outcome — Spike 009 Workflow Tightening

## Result and exact provenance

**COMPLETE — independently evaluated PASS, accepted by the user.**

Implementation `f5a657dc11e77ed7fc8d46c06280daa9df41c56e` passed verification
attempt `001` against evaluator revision `002`. The exact result and both
evaluator revisions are promoted under `evaluation/`; As-Built found no
material discrepancy from the frozen contract.

## What Was Established

The local workflow runner now models verification as its own attempt sequence,
with every verification tied to the implementation it evaluated. This admits
both the ordinary implementation-failure retry and the evaluator-correction
retry without pretending an unchanged implementation is a new attempt.

Workflow phase ownership is role-based rather than vendor-based. Codex and
Claude remain practical defaults, but the public and evaluator roles can select
either supported executor independently without changing canonical phases or
skills.

An unavailable executor no longer burns a phase attempt. Local operational
state and logs are owner-restricted, and the runner now lives outside the
Harness runtime namespace while retaining its public command.

## Implementation Summary

`tools/workflow.ts` replaces the runtime-namespaced entrypoint. It preserves
dry runs, detached execution, local combined logs, status/liveness,
cancellation, explicit outcomes, ignored `.workflow/` state, and the existing
no-Git/no-private-evaluator boundary.

## Evaluation Evidence

Five mandatory evaluator cases passed, as did typecheck, lint, formatting,
the 28-test public suite, and whitespace validation. Promotion preserved the
immutable ledger, passing result, and both frozen evaluator revisions.

## Material History

Evaluator revision `001` contained a fixture defect: its unavailable-executor
case still left a fixture executable available. It was detected, archived
byte-for-byte, corrected as revision `002`, and only then used for the passing
verification. The implementation was unchanged through that correction.

## Decisions

- Keep executor selection deliberately narrow: two role environment settings
  and the existing Codex/Claude command profiles, not a provider framework.
- Commit an execute dispatch only after a successful process spawn.
- Expose the verification-to-implementation relation through runner status for
  independent black-box evaluation.

## Deferred Concerns

The runner remains intentionally local bookkeeping. Scheduler behavior,
automatic classification, provider plugins, evaluator revision management, and
agent-session control remain out of scope.

## Skill Versions and Workflow Cost

Brief Readiness v3; Design Map v2; evaluator v7; implementation v3; As-Built
v2; Outcome v3. Manifest entries were contemporaneous; no runtime-provided
cost metrics were available, so none are fabricated. The accepted workflow
includes one evaluator revision correction and one passing verification attempt.

## Next Step

Open a pull request for `feat/spike-009` and squash-merge it after review.
