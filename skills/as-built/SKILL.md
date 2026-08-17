---
name: as-built
description:
  Reconstruct the material behavior and structure actually built for a Harness
  spike after final verification and before Outcome.
---

# As-Built

Contract version: 1

Answer one question: **what did we actually build?**

Using fresh context where practical, inspect the exact final implementation
revision, its diff, relevant surrounding code and tests, the frozen brief, and
the Design Map. Establish facts about observable behavior, lifecycle, ownership,
persistence, invariants, coupling, side effects, assumptions, and significant
architecture.

Write `<spike>/as-built.md`. Summarize the implemented shape, then compare it to
the frozen contract using only:

- **Missing** — required behavior or structure is absent.
- **Contradictory** — reality conflicts with the frozen contract.
- **Extra** — material behavior or structure exists beyond the contract.

Do not rerun evaluation, judge general code quality, invent requirements,
recommend refactors, or become a second Outcome. If there are no discrepancies,
say so plainly.

Record the inspected revision, input identities, skill version, result, and
available execution statistics in `manifest.md`. Commit the artifact separately
and push it before Outcome when another context will consume it.
