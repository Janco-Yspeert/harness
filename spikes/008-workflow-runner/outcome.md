# Outcome — Spike 008 Local Workflow Runner

## Result and exact provenance

**COMPLETE — independently evaluated PASS and human accepted.**

The accepted implementation is `e147e0f757699552d8d6e02a15618996174770a3`
(`Implement local workflow runner`). Evaluator attempt `002`, using frozen
evaluator revision `002`, passed and was promoted in `d18d2fa`; the completed
As-Built record is `d6ac17c`. Human acceptance of attempt `002` for that exact
implementation was recorded on 2026-08-30.

## What Was Established

Harness can now execute the canonical spike workflow as a small local CLI,
without pretending to be a workflow platform. The runner enforces phase order,
ownership, and the evaluator-verify retry loop while keeping operational state
separate from authoritative workflow evidence.

## Implementation Summary

`npm run workflow --` provides `init`, `status`, `dispatch`, `record`, and
`cancel` for one normalized `spikes/NNN-*/` directory. It records append-only
local `.workflow/` events and detached-job metadata, defaults to dry-run, and
uses argument-vector invocation for Codex and Claude. Explicit `record`
outcomes—not child-process exit—remain completion authority.

The runner neither reads evaluator-private material nor performs Git actions,
network work, hidden-workspace creation, permission bypass, or automated
success claims. `.workflow/` stays ignored operational state.

## Evaluation Evidence

Promoted evaluator attempt `002` passed all 13 mandatory cases (20 hidden test
blocks) against `e147e0f`. `npm run typecheck`, `npm run lint`,
`npm run format:check`, `npm test` (27/27), and `git diff --check` also passed.
As-Built found no missing, contradictory, or extra material behaviour against
the frozen brief and Design Map.

## Material History

Evaluator revision `001` exposed an evaluator defect: one retry-loop case
required contradictory terminal outcomes for the same attempt. It was retained
in the immutable attempt history, corrected as frozen revision `002`, and the
unchanged implementation then passed. The defect was in the test, not the
runner—an unusually civilised failure mode for this dungeon.

## Decisions and Discoveries

- Detached children give long-running Codex and Claude work a lifecycle that
  survives the caller without adding a daemon or queue.
- Operational dispatch records are deliberately not provenance, evaluation,
  or acceptance. Those remain governed by frozen artifacts, manifests, Git,
  evaluator results, and a human decision.
- Process completion cannot establish agent-work completion; explicit outcome
  recording is the right boundary.

## Deferred Concerns

The spike intentionally does not add scheduling, concurrency, session
resumption, remote execution, output parsing, a web UI, or runtime Harness
integration. Those remain separate product decisions.

## Skill Versions and Workflow Cost

Material runs used Brief Readiness v2, Design Map v2, evaluator v7,
implementation v3, As-Built v2, and Outcome v3. The manifest records evaluator
verify entries retrospectively from immutable attempt results; other listed
material entries were recorded contemporaneously. No reliable aggregate runtime
or token measurement was available, so none is claimed.

## Next Step

Review and squash-merge `feat/spike-008` through the normal pull-request
workflow when ready. The runner itself should be used on the next spike before
expanding it; that will reveal whether its intentionally small state model earns
any further machinery.
