# Blocked — Spike 013

## Blocker

The canonical authority records completed, committed `brief-frozen` and
`design-map-frozen` checkpoints, but the newly initialized local workflow
runner has no matching dispatched/completed role records in `.workflow`.

It refuses to advance to `evaluator-prepare`, and also refuses to record the
already-completed phases because they were not dispatched by that runner.

## Consequence

Evaluator preparation cannot begin through the required Harness workflow
without either fabricating runner history or declaring an explicit process
exception. The frozen brief declares no such exception.

## Required recovery

Resolve the runner-state adoption gap, or create and freeze a revised brief
that authorizes a bounded substitute procedure before continuing.
