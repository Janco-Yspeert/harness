# Evaluation Result

## Overall Result

FAIL — classification `IMPLEMENTATION_FAILURE`.

## Evaluation Source

- Verification attempt: `004` (host `verification-allocated` event
  `dc064b64-441b-41e2-9777-90b301aa64b0`, attempt 4, cycle `001`; execution
  `37ea25ba-f832-4215-8815-eed9372efcdd`; Role Grant
  `sha256:c48afa1bf3908c5cce4facc8563e0066368cb4443af32c13c09c41b685ad7747`,
  allocation key
  `sha256:3d6432a225d92b3c3978c28bb1bb0fb7439a76a0b0825d5d2c5af529c96ab181`;
  predecessor execution `a016400c-80a9-4e81-9c82-1d1561ed9348`; root authority
  `7c264a15-12cd-4915-9bb3-d20308bfaaea`).
- The private attempt id follows the host attempt number. Host attempts 2
  (execution `4f1fcb0d-…`) and 3 (execution `a016400c-…`) ended at the provider
  rate limit about two seconds after start. Neither wrote to this private
  workspace, so the private ledger has no entries for them. None were
  fabricated.
- Implementation: `git:0e2789c4e2040a3bafb6d173506f65be66d44956`. This is the
  same candidate as attempt 001. It was evaluated from a fresh clean clone at
  that commit, with dependencies symlinked from the project's installed
  runtime. The shared working tree was not evaluated. Its uncommitted
  `src/kernel/*` and `test/kernel.test.ts` changes are host maintenance 003,
  which is outside the candidate.
- Frozen identities were recomputed before execution. All of them match:
  - brief `sha256:8d4302b2…ac710d`;
  - Design Map `sha256:50780fa3…1200e`;
  - eval-requirements `sha256:c47e49c8…8691a`;
  - coverage-map `sha256:a7abb9d1…e8c349b` (equal to the Role Grant input);
  - eval-spec `sha256:3aadfd17…f8c9ed`;
  - case-manifest `sha256:d5029031…1079f8`;
  - hidden manifest, support file and all six hidden test files;
  - preparation records;
  - `freeze.json` `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`
    (evaluator revision `002`, equal to the public readiness binding).
- Evaluator skill: contract version 13, pinned
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`.
  Kernel definition (trusted N):
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
- Evaluation time: 2026-09-25, from 16:05Z.

## Summary

- Executable mandatory cases: 11 of 11 passed (E1, E2, E3, E4a, E4b, E5a–E5e,
  E6).
- Regression R1 (`npm run check`, clean clone, offline, provider credential
  variables unset): exit 0; 173 tests, 173 passed.
- Failed mandatory cases: M-LIVE L1, L2, L3, L5 and L6; M-ORCH O2, O3, O4, O5,
  and the observed-run provenance part of O6. All of them fail on the same
  missing evidence.
- Not adjudicated to decision depth: R2–R9, M-MATRIX MX1–MX4, M-CODE C1–C10,
  M-EVOL V1–V6, M-ORCH O1, M-LIVE L4. The attempt was already terminal FAIL on
  required evidence, so these are not reported as passes. Spot-checks:
  - C1: plan path and schema definition in `tools/archive-manifest.ts`,
    referenced by the skill and the evaluator-verify contract. No violation
    found.
  - V1: no committed candidate/check/diff evidence was located for the exact
    candidate commit against trusted N, except the ninth-role disposable
    fixture. This is flagged for the retry to address or point to. It is not
    adjudicated.
- Evaluator defects: 0. Specification ambiguities: 0. Infrastructure
  failures: 0.

## Findings

### F1 — Required real-provider, AC05 fixture and observed-orchestrator evidence is absent (unchanged since attempt 001)

- Classification: `IMPLEMENTATION_FAILURE`.
- Affected:
  - M-LIVE L1 (AC02, AC13);
  - L2 and L3 (AC05);
  - L5 (AC04, AC05);
  - L6 (AC06);
  - M-ORCH O2–O5 and the observed-run provenance part of O6 (AC02, AC03).
- Observed, from committed bytes at `0e2789c`:
  - `evidence/real-provider-runs.md` has status "OUTSTANDING" and records
    runs R1, R2 and R3 as "not run".
  - `evidence/promotion-bound.md` records the AC05 fixture manifest count as
    "not yet run".
  - `git grep executor-confirmed` over the spike and fixtures at the candidate
    finds only the instructions in `real-provider-runs.md`, with no run record.
  - The candidate is byte-identical to the one that attempt 001 failed.
- Expected (EA1; M-LIVE and M-ORCH frozen plans): committed evidence of:
  - a real public role run through a production registered adapter;
  - an isolated AC05 candidate-evaluator fixture run with a succeeded promotion
    action, `promotion.json`, `promotion-recorded` and a recomputable
    `promotionPlan` identity;
  - the fixture mapping count recorded against B;
  - an observed bounded orchestrator run showing default-workflow selection,
    multi-phase continuation, a preserved human gate, read-only, stop and
    blocker behaviour, and recording its instruction identity, runtime version
    and model.
- Rerun in isolation: re-read the exact committed evidence files from a fresh
  clone. The frozen decision rules apply literally, and no candidate-specific
  interpretation was needed.
- Evaluator, specification and infrastructure causes are ruled out, as in
  attempt 001:
  - the evaluator plan is exercisable as frozen;
  - the requirement is explicit in the brief and EA1;
  - the evaluator makes no provider call by design.

### N1 — Process note (non-mandatory)

This allocation re-verified an unchanged candidate. Re-verifying the same
commit cannot yield a different result on F1. The next verification is useful
only after a new implementation handoff commits the governed real-run evidence.

## Regression Results

- R1: exit 0, 173/173. The log is at `/tmp/harness-scratch-HMgCi3/r1.log`
  (execution scratch space; not retained as evidence).
- R2–R9: spot-checked only; see Summary.

## Diagnostic Probes

All probes were read-only and supplementary. None is frozen coverage.

- `git grep` for plan-path references (C1 spot-check) and for any run
  evidence.
- `git diff --stat 047daac 0e2789c -- spikes docs fixtures`, which confirms the
  set of committed evidence files.
- Read `src/methodologies/harness-public.ts` `verification-accounting` to learn
  the public result shape. This is not evaluation evidence.
- Preserved attempt 001's uncommitted public `verification-result.json` and
  `verification-feedback.md` byte-exact under
  `.eval/attempts/001/uncommitted-public/` before replacing them publicly. That
  attempt's execution ended at the provider rate limit before its public
  checkpoint.

## Evaluator Integrity

- Frozen evaluation modified: no.
- Specification drift: none.
- Evaluator defects discovered: none.
- Setup and teardown: one clean scratch clone was created at
  `/tmp/harness-scratch-HMgCi3/cand4` (execution scratch space). Removing it
  after the run was refused by the session permission layer, so it remains in
  scratch. It is outside both granted workspaces and does not affect any
  frozen or public artifact.

## Overall Assessment

The implementation does not satisfy the frozen evaluation contract. The
executable evaluation and the offline regression pass. The required
real-provider, AC05 fixture and observed-orchestrator evidence is absent from
the candidate.

## Public Feedback

- `verification-feedback.md` and the canonical `verification-result.json`, both
  for attempt 004, in the spike directory.
