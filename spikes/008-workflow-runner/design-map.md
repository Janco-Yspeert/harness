# Design Map — Spike 008

## Shared contracts

- The public command is `npm run workflow -- <command> ...`; its source is
  compiled by Node's TypeScript stripping in the same way as the existing
  repository commands.
- The runner operates only on a canonical relative path matching
  `spikes/NNN-*/`. It resolves that path beneath the repository root and must
  reject traversal or arbitrary directories before reading or writing state.
- State is the public JSON document `<spike>/.workflow/state.json`. It has a
  versioned top-level shape, the normalized spike path, and an append-only
  array of records. A record carries a phase kind, attempt number, event kind,
  and outcome when applicable. Tests may inspect this document directly.
- Phase ownership is fixed: Codex owns `brief-readiness`, `design-map`,
  `implementation`, `as-built`, and `outcome`; Claude owns
  `evaluator-prepare` and `evaluator-verify`. The rendered prompt must name
  that owner and its repository skill.
- The initial order is Brief Readiness → Design Map → evaluator prepare →
  implementation attempt 1 → evaluator verify attempt 1 → As-Built → Outcome.
  A failed evaluator verify is the sole permitted reopening: it enables the
  next implementation attempt, followed by the matching verify attempt.
- A dispatched phase is not complete. Only an explicit `record ... complete`
  command permits its successor. `--execute` starts an executor but cannot
  write completion or infer it from process exit status.

## Design decisions

- The CLI source belongs under `src/` so existing TypeScript checking covers
  it; the package script is its stable execution seam.
- The runner constructs argument vectors and starts processes without a shell.
  This preserves prompt text as one argument and permits tests to substitute a
  spawn seam. Codex receives `exec --cd <repository-root>`; Claude receives
  `-p --permission-mode manual`.
- Dry-run prints a lossless command representation and writes the dispatch
  record. It must not probe agent availability or launch either binary.

## Invariants

- The runner never accesses a hidden evaluator path and never creates one.
- No command performs Git operations or permission bypass.
- Earlier completed attempts remain recorded when a retry begins.
- Evaluator prepare cannot be reopened by the retry rule.
- The runner state does not assert frozen identities, evaluation validity, or
  human acceptance.

## Implementation freedom

- Exact TypeScript data types, error formatting, JSON indentation, state-file
  write strategy, prompt wording beyond the required ownership/skill facts, and
  test helper design remain implementation choices.
