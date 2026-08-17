# Spike 007 — Attempt 001

Result: `PASS` (see `eval-result.md`).

This attempt ran against evaluator revision `1`, which is also the sole and
final frozen revision for this cycle. Per the evaluator skill's
anti-duplication rule, the evaluator suite itself is not copied into this
directory — it is promoted once at `../../evaluation/` (`eval-spec.md`,
`hidden-tests/**`, `freeze.json`). This directory holds only this attempt's
own immutable result and implementation/evaluator provenance.

- Implementation evaluated: `git:20f88674409e9e2a2f3fca83869206c8b2b67943`
  (branch `feat/spike-007`).
- Evaluator revision used: `1` (`../../evaluation/eval-spec.md`).

`eval-result.md` in this directory is byte-identical to the private
immutable result written during verification
(`harness-hidden/spikes/007-structured-session-events/.eval/attempts/001/eval-result.md`),
whose own "Private attempt-ledger path" line refers to the pre-promotion
private path (`.eval/attempt-ledger.json`); the complete ledger's promoted
copy lives at `../../evaluation/attempt-ledger.json`.
