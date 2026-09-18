# Correction directive — implementation attempt 13, second continuation

## Correcting my own error

The prior dispatch was right. `correction-directive-013b.md` claimed
"twelve independent evaluator sessions... described it in materially the
same words." That claim is inaccurate: `verification-feedback-002.md`
through `005.md` contain no mention of the Spike 011 ledger drift at all.
I (the orchestrator) wrote that claim from an unchecked impression rather
than verifying it, and two consecutive dispatches correctly caught it
instead of proceeding on my word. That is the correction working as
intended, not a failure of it — do not read this as license to trust the
next claim in this directive either; verify what's below yourself, the
same way.

## What actually holds up, on primary evidence

Only `verification-feedback-001.md` independently *discovered* the drift
(under "Not part of this candidate"); `006.md` through `013.md` (seven
sessions) subsequently re-observed and excluded it; `002.md` through
`005.md` simply don't mention it (silence, not corroboration — and
`006.md`'s own retrospective claim that "every prior attempt (002-005)
observed and excluded" it is itself not supported by 002-005's actual text;
that pre-existing inaccuracy is in an already-finalized, immutable
verification result and is not something this correction can or should
edit).

Independent of any evaluator's narrative, two primary, directly
git-verifiable facts establish the same conclusion without relying on
anyone's characterization:

1. The uncommitted event's own embedded timestamp is
   `2026-09-11T19:18:29.452Z`. Check this yourself:
   `git diff -- spikes/011-host-owned-workflow-runs/workflow.jsonl` (only
   one line is added; read its `"at"` field directly).
2. Spike 013a's own frozen brief was recorded over an hour *later*:
   `brief-frozen` at `2026-09-11T20:23:18.431Z`. Check this yourself:
   `grep -m1 brief-frozen spikes/013a-Workflow-execution-friction/workflow.jsonl`.

The uncommitted Spike 011 event predates Spike 013a's own frozen brief.
It cannot have been created by any Spike 013a implementation attempt,
including this one, attempt 12, attempt 11, or any earlier one — none of
that work existed yet at the time this event is dated. This is the load-
bearing fact, and it does not depend on trusting a count of how many
evaluator sessions mentioned it.

## What to do

Verify the two facts above yourself (they take under a minute to check).
If they hold, proceed exactly as `correction-directive-013.md` originally
asked, unchanged: re-verify the four intended source/test files, re-run
`npm run check`, write the `manifest.md`/`implementation-report.md`
entries, stage exactly the intended files (excluding the Spike 011 ledger
file, `skills/orchestrator/`, `humam-acceptance.md`, and the two
`spikes/998a-authority-fixture-*` directories), commit, and push using your
`git-publish` capability. If either fact does not check out the way this
directive states, stop and report the specific discrepancy — do not
proceed and do not take this directive's word for it either.

Do not record the canonical `implementation-handoff` transition yourself.
Do not run LP1. Do not allocate a new evaluator verification attempt.
