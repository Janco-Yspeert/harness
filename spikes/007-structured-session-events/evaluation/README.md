# Spike 007 — Promoted Evaluation (evaluator revision 1)

This directory is the promoted copy of the frozen Spike 007 evaluator
revision 1 — the exact evaluation contract, hidden tests, and freeze
metadata used to verify the implementation, made public per the evaluator
skill's promotion rules after an accepted `PASS` result
(`../attempts/001/eval-result.md`).

There was exactly one evaluator revision and one implementation attempt in
this cycle: no evaluator defect required a corrected revision, so there is
no superseded-revision archive here (compare `spikes/005-native-codex-backend/evaluation/verify-2026-08-14-diagnostics/`,
which exists because that cycle *did* need one).

## Contents

- `eval-spec.md` — the frozen evaluation specification (requirements,
  invariants, negative requirements, evaluation cases, coverage matrix).
- `freeze.json` — freeze metadata: input/content identities and the
  pre-freeze integrity checks performed.
- `attempt-ledger.json` — the complete attempt ledger for this cycle (one
  entry, `001`, `PASS`), otherwise unmodified from the private original
  except `resultPath`, which is updated from the private path
  (`.eval/attempts/001/eval-result.md`) to this promoted location's path
  (`attempts/001/eval-result.md`).
- `hidden-tests/` — the 8 frozen mandatory hidden-test files plus
  `support/` helpers and the evaluator's own helper self-check, exactly as
  they ran during verification.

## Known caveat: archival import paths

`hidden-tests/**`'s relative imports (e.g. `../../../../harness/src/index.ts`)
are written for their *original* private location
(`harness-hidden/spikes/007-structured-session-events/.hidden-test/`), one
directory level shallower than this promoted location. They do **not**
resolve correctly if run directly from here without path adjustment. This
is archival evidence of what ran, not a ready-to-run copy — consistent with
this project's existing precedent
(`spikes/004-session-backend-abstraction/evaluation/hidden-tests/helpers.ts`
and `spikes/005-native-codex-backend/evaluation/hidden-tests/helpers.ts`
carry the same characteristic). The content is byte-identical to what
actually ran privately at `.hidden-test/` during verification attempt 001.
