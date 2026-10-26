---
name: as-built
description:
  Reconstruct the material behavior and structure actually built for a Harness
  spike after final verification and before Outcome.
---

# As-Built

Contract version: 4

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

## Harness worker protocol

Under Harness, read the pinned Role Grant with the `assignment` tool. It binds
the exact candidate commit, the verification result and the host's
`promotion-recorded` identity; As-Built is allocated only after those canonical
prerequisites exist.

The host's promotion action writes `<spike>/evaluation/promotion.json` and
records `promotion-recorded`, but it does not commit that file. Before
reconstructing anything, validate the host record. The bound promotion identity
must equal the `sha256` of the bytes in `<spike>/evaluation/promotion.json`.

- If the file is missing, or its identity differs from the bound promotion
  identity, stop and submit `blocked`. Do not describe an unverified archive.
- If the identities match and the file is already committed with exactly those
  bytes, use it as is.
- If the identities match and the file is untracked, commit it yourself. Stage
  only `<spike>/evaluation/promotion.json` with plain `git add -- <path>`, check
  with `git diff --cached --name-only` that nothing else is staged, and commit
  it with `git commit`. Run each Git command on its own. Do not stage other
  promoted files, rewrite the file, or use a command that stages paths
  implicitly.

That promotion commit is a separate checkpoint. After it, make the ordinary
`as-built.md` and `manifest.md` checkpoint described above. After that local
checkpoint exists, submit exactly one typed result with `submitResult`:
disposition `succeeded` with empty methodology `{}`. This role requests no host
action.
