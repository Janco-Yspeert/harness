# Design Map — Spike 008

## Shared contracts

- The public command is `npm run workflow -- <command> ...`. It accepts only a
  normalized relative `spikes/NNN-*/` path beneath the repository root.
- `.workflow/` is local operational state, ignored by Git. Its versioned JSON
  state records append-only phase and job events; job output lives in the same
  local directory and is never public workflow evidence.
- The fixed phase order is Brief Readiness → Design Map → evaluator prepare →
  implementation → evaluator verify → As-Built → Outcome. A failed evaluator
  verify alone permits the next numbered implementation attempt.
- Each phase has fixed ownership and prompt identity: Codex owns public
  planning/implementation/history phases; Claude owns evaluator prepare and
  verify. The rendered prompt names the corresponding repository skill.
- `dispatch --execute` launches the selected CLI as a detached local process,
  records its PID, command, log path, and launch time, then returns. A process
  exit is not completion; `record` remains the only completion authority.
- `status` may report liveness for a recorded job without inspecting its output.
  `cancel` may terminate only the currently recorded job for that phase.

## Design decisions

- The source belongs under `src/` and the package script is the stable CLI
  seam. Argument vectors—not a shell—construct the Codex and Claude commands.
- Detached child-process execution is the lifecycle boundary for both providers.
  It avoids tying multi-minute agent work to the invoking terminal or Codex tool
  window without adding a daemon, queue, or provider framework.
- The implementation must add an ignore rule for `.workflow/`; state and logs
  must not enter commits, manifests, or evaluator inputs.

## Invariants

- The runner neither accesses nor creates evaluator-private paths.
- It performs no Git operation or permission bypass.
- Earlier attempt records remain immutable when a retry begins.
- Job metadata is operational only; it does not establish frozen provenance,
  evaluation validity, or human acceptance.

## Implementation freedom

- State schema details, liveness technique, detached-process plumbing, log
  format, error presentation, and test spawn seam remain implementation choices.
