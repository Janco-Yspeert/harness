# Evaluation Result

## Overall Result

PASS.

## Evaluation Source

- Verification-attempt identifier: `001`.
- Project commit evaluated: branch `feat/spike-007`, commit
  `20f88674409e9e2a2f3fca83869206c8b2b67943` ("feat(spike-007): add
  structured session events"). Working tree confirmed clean
  (`git status --porcelain` empty) before evaluation; no uncommitted changes
  were evaluated.
- Frozen `eval-spec.md` identity:
  `sha256:8b11d85a0798e32af3eea15963e93ab1fe2a22db4268573fe5f56c504e3e7847`.
- Frozen brief (`spike.md`) identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`.
- Frozen Design Map identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`.
- Public `eval-requirements.md` identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`.
- Evaluator revision: `1` (evaluator skill `evaluator`, contract version `6`,
  content identity
  `sha256:9ec48c1cae0cbc6abaa67ae166ac99b03aed459febff630c46cb6f574c5fe237`).
- Evaluation timestamp: 2026-08-17.
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `001`).

All frozen inputs (brief, Design Map, public evaluation requirements, private
eval-spec, case manifest, every hidden test file, every support file, and the
evaluator skill file itself) were re-hashed against `.eval/freeze.json` and
`.hidden-test/manifest.json` before running any case. Every content identity
matched exactly. No specification drift detected.

## Summary

- Passed mandatory cases: 12 of 12 (E1–E12; 17 of 17 individual mandatory
  test bodies across the 8 frozen hidden-test files).
- Failed mandatory cases: 0.
- Non-mandatory findings: 0.
- Evaluator defects: 0.
- Specification ambiguities: 0.
- Infrastructure failures: 0.

## Findings

None. Every mandatory case passed against the implementation under test.

## Regression Results

- R16 (existing behaviour, public `npm test`): 25/25 passed on commit
  `20f8867`, including the implementer's own added
  `test/session-events.integration.test.ts`, which is evidence but not
  frozen coverage.

## Diagnostic Probes

- Helper integrity re-check: `support/envelope.selfcheck.test.ts` re-run
  standalone before the mandatory suite; 13/13 self-checks passed,
  confirming the shared `assertEnvelope`/`looksLikeEnvelope` oracle behaves
  as validated at freeze. Supplementary; not itself mandatory coverage.
- Determinism re-check: the full frozen mandatory suite (all 8 hidden-test
  files, 17 test bodies, including the real-process PTY/Codex cases E1, E3,
  E5, E7, E11 and the concurrency case E6) was run three times in total
  (once for the primary result, twice more for confidence). All three runs
  produced 17/17 pass, 0 fail, exit code 0, with no flaked or skipped case.
  This is supplementary confirmation of stability under the process-timing
  variance the eval-spec's "Limitations" section anticipates; it did not
  change the classification of any case and none needed it to reach PASS.
- No diagnostic probe was used to substitute for, or upgrade, any case
  result; every mandatory case passed on its own first execution.

## Evaluator Integrity

- The frozen evaluation was not modified during verification: no hidden
  test, support file, case manifest, eval-spec, or public
  eval-requirements content was edited, and all re-hashed identities match
  `.eval/freeze.json` exactly.
- No specification drift was detected.
- No evaluator defects were discovered during this verification.
- No case was classified `IMPLEMENTATION_FAILURE` (none failed), so the
  pre-classification confirmation checklist was not required; it was
  applied preemptively anyway via the determinism re-check above, and via a
  standalone helper self-check re-run.

## Overall Assessment

The implementation on commit `20f8867` satisfies the frozen Spike 007
evaluation contract (evaluator revision 1) in full: all 12 mandatory
evaluation cases (E1–E12) pass against the real HTTP/WebSocket surface, and
the existing public regression suite continues to pass unmodified.

## Public Feedback

No public feedback artifact was emitted. Public feedback is required only
for a confirmed implementation failure; this attempt resulted in PASS.
