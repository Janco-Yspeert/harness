---
name: as-built
description:
  Reconstruct the material behavior and structure actually built for a Harness
  spike after final verification and before Outcome.
---

# As-Built

Contract version: 3

Answer one question: **what did we actually build?**

Using fresh context where practical, inspect the exact bound final
implementation revision, its diff, relevant surrounding code and tests, the
frozen brief, Design Map, final accepted verification result, and completed host
promotion. Establish facts about observable behavior, lifecycle, ownership,
persistence, invariants, coupling, side effects, assumptions, and significant
architecture. Do not inspect active evaluator-private material; promoted
target-spike evidence is public historical input.

Write `<spike>/as-built.md`. Summarize the implemented shape, then compare it to
the frozen contract using only:

- **Missing** — required behavior or structure is absent.
- **Contradictory** — reality conflicts with the frozen contract.
- **Extra** — material behavior or structure exists beyond the contract.

Do not rerun evaluation, judge general code quality, invent requirements,
recommend refactors, or become a second Outcome. If there are no discrepancies,
say so plainly.

After checking the artifact, make the `manifest.md` entry the final
repository-content step. Record the inspected revision, input identities, skill
version, result, and statistics reliably available through immediately before
that update. Capture a start baseline only for a directly measurable value; do
not create a provisional entry, estimate metrics, or measure the entry itself.
Create one local checkpoint containing the artifact and manifest, separate from
implementation. Report the Role Result, inspected input identities, artifact
identity, and exact produced local commit. Harness validates and publishes that
checkpoint and records `as-built-recorded`; the worker does not mutate canonical
authority. Host-action failure does not turn a completed reconstruction into a
different semantic result.
