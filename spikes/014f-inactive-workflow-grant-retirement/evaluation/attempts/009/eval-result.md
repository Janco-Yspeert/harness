# Evaluation result — attempt 009

- Workflow: 014f-inactive-workflow-grant-retirement
- Execution: d59a2e87-2bf0-494c-86af-9012967229b6
- Candidate: af75b14d1847af02404a591a8829751dc8df2a2e
- Evaluator revision: 002 (freeze.json sha256:39fcf19c29b5562fdc482752b0d7a3fd6452cd566a0693170237a1c70be039ab)
- Result: PASS (no classification)
- Candidate evaluation begun: yes

## Identities (P1)
- spike.md, design-map.md, eval-requirements.md match freeze.json; private spec, manifest, support and all hidden tests match freeze.json.
- Candidate checkout (git clone, detached) had empty tracked status; base 17bdde7 is an ancestor; no Stockdif/provider access.

## Mandatory executable (E1-E6): 11/11 pass
Run: node --test <hidden>/e*.test.ts with HARNESS_EVAL_ROOT = clean candidate clone.

## R1 differential regression (AC07)
- Candidate suite: 262 tests, 261 pass, 1 fail. Baseline (17bdde7): 196 tests, 195 pass, 1 fail; the same test
  ("014e AC03/AC04/D4 contained public and protected workers ...") fails in both: environmental (nested sandbox). Not attributed.
- Four baseline-ok test titles do not appear at candidate: they were retitled/rewritten by intervening upstream
  commits (variants of the 014d AC06 tests, 014e D4, AC07 model tests exist and pass); no baseline-ok behaviour fails.
- tsc --noEmit exit 0; eslint and prettier --check exit 0 on changed ts files; git diff --check clean for src/test/tools.
- Initial run in a non-git archive extraction produced git-dependent test failures; this was an evaluator-method artifact
  (rerun in proper git clones above). Recorded as non-authoritative diagnostic.

## Diagnostics / probes
Non-authoritative: the archive-extraction run above. No evaluator changes made.

## Evaluator integrity
Frozen bundle intact; no evaluator defect indicated.
