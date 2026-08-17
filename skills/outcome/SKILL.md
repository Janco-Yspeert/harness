---
name: outcome
description:
  Synthesize a completed Harness spike into a compact historical outcome after
  accepted evaluation or an explicitly predeclared process exception.
---

# Spike Outcome

Contract version: 3

Answer one question: **what did this spike establish and teach us?**

Write only `<spike>/outcome.md` unless explicitly asked otherwise. Do not edit
implementation, tests, contracts, evaluation evidence, reviews, skills, or
project documentation.

## Preconditions

For the ordinary workflow, require:

- a committed implementation revision;
- accepted successful independent evaluation of that exact revision;
- committed promoted evaluation containing the exact evaluated artifacts and
  provenance; and
- completed As-Built evidence.

Do not infer identities from `HEAD`; confirm them from evaluation, manifest, and
Git evidence. Refuse a final Outcome when evaluation used uncommitted work or
promotion is incomplete.

An Outcome may instead use a process exception only when the frozen brief
declared it before implementation, defined substitute evidence, all substitute
checks completed, the final candidate is committed, and durable acceptance
explicitly approves that candidate. Label the result unambiguously, for example
`COMPLETE — PROCESS EXCEPTION`; never call it an independently evaluated PASS.
An exception is not a retroactive escape hatch after failed evaluation.

## Evidence and read authority

Use the frozen brief, Design Map, manifest, public feedback history, As-Built,
Git provenance, accepted evaluation, and other bounded spike-local evidence. For
the target completed spike only, promoted evaluation artifacts—including
promoted hidden tests and prior material evaluator revisions—may be read for
historical synthesis. Do not inspect active private evaluator workspaces.

Use prior Outcomes selectively when supporting a cross-spike claim. Do not
inspect unrelated spikes' detailed implementation or evaluation records.

## Synthesis

Distinguish what was proven, observed, decided, deferred, or merely recommended.
Preserve material failures and evaluator corrections. Do not reproduce source
artifacts or turn Outcome into evaluation, code review, or forensic archaeology.
Use the manifest as the primary execution-history source.

Include compact sections appropriate to the evidence:

- Result and exact provenance
- What Was Established
- Implementation Summary
- Evaluation or Process-Exception Evidence
- Material History
- Decisions
- Discoveries
- Deferred Concerns
- Skill Versions and Workflow Cost
- Next Step

Record which material skill versions ran and whether entries were retrospective.
State limitations plainly.

After checking Outcome, make its `manifest.md` entry the final
repository-content step. Record the result and statistics reliably available
through immediately before that update. Capture a start baseline only for a
directly measurable value; do not create a provisional entry, estimate metrics,
or measure the entry itself. Commit Outcome with that final manifest update and
push it to the spike branch.
