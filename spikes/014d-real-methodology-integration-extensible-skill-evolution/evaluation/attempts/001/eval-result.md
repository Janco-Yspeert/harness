# Evaluation Result

## Overall Result

FAIL — classification `IMPLEMENTATION_FAILURE`.

## Evaluation Source

- Verification attempt: `001` (host `verification-allocated`, attempt 1,
  cycle `001`; execution `bd02a847-1d80-4af3-8174-9a1381ca1d7f`; Role Grant
  `sha256:76aa6ee27eb5f40d6c6ffbe38621da3a51b9d5d84c9820e664a31f766354428d`,
  allocation key
  `sha256:bf2df92474156462b07fb08b3b3fe3d7fc7c2fdabd2358183e514ed602ed0954`).
- Implementation: `git:0e2789c4e2040a3bafb6d173506f65be66d44956`
  (`feat(014d): implement real skill execution and host contract integration`,
  `feat/spike-014`). Evaluated from a clean clone of that commit; the shared
  working tree was not evaluated (its only differences are untracked host
  ledger and unrelated fixture directories).
- Brief `spike.md`:
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
  (matches frozen).
- Design Map:
  `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`
  (matches frozen).
- Public `eval-requirements.md`:
  `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`
  (matches frozen); `coverage-map.json`
  `sha256:a7abb9d197d50154c113fc9a6f85b639fdbce1c1cd912d15ff6990e05e8c349b`
  (matches the Role Grant input).
- Private `eval-spec.md`
  `sha256:3aadfd178c5f4c2eb52233e2a47d955a2af2181144f79a4f1f55e48576c8f9ed`,
  `case-manifest.json`
  `sha256:d5029031366ccddcdde47367210042931cf38392eda8a5abdf5d9770831079f8`,
  and every hidden test/support file: all match `freeze.json`.
- Evaluator revision `002`, identity
  `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`
  (equals the public readiness binding); evaluator skill contract version 13,
  pinned `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`;
  kernel definition (trusted N)
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
- Evaluation time: 2026-09-25, 12:12Z onward.
- Private attempt ledger: `.eval/attempt-ledger.json`.

## Summary

- Executable mandatory cases: 11 of 11 passed (E1, E2, E3, E4a, E4b, E5a–E5e,
  E6).
- Regression R1 (`npm run check`, clean checkout, offline): exit 0; 173 tests,
  173 passed.
- Failed mandatory cases: M-LIVE L1, L2, L3, L5 and L6; M-ORCH O2, O3, O4, O5,
  and the observed-run provenance part of O6. The same missing evidence also
  fails them all.
- Not adjudicated to decision depth: R2–R9, M-MATRIX MX1–MX4, M-CODE C1–C10,
  M-EVOL V1–V6, M-ORCH O1, M-LIVE L4. I spot-checked these and found no
  violation. The attempt was already terminal FAIL on required evidence, so
  they are not reported as passes. The retry attempt must adjudicate them in
  full.
- Non-mandatory findings: 1 (process note below).
- Evaluator defects: 0. Specification ambiguities: 0. Infrastructure
  failures: 0.

## Findings

### F1 — Required real-provider, AC05 fixture and observed-orchestrator evidence is absent

- Classification: `IMPLEMENTATION_FAILURE`.
- Affected: M-LIVE L1 (AC02, AC13), L2 and L3 (AC05), L5 (AC04, AC05), L6
  (AC06); M-ORCH O2–O5 and O6's observed-run provenance (AC02, AC03).
- Observed: the candidate's `evidence/real-provider-runs.md` has status
  "OUTSTANDING" and records runs R1, R2 and R3 as "not run". It states
  explicitly that AC02, AC03, AC05 and the real-provider part of AC13 are
  unproven. `evidence/promotion-bound.md` records the AC05 candidate-evaluator
  fixture manifest count as "not yet run". The candidate commit has no other
  committed real-run, fixture-promotion or observed-orchestrator evidence.
- Expected: frozen public requirements (EA1, and the M-LIVE and M-ORCH
  evidence plans derived from brief §1–§3, AC02/AC03/AC05/AC06/AC13 and Design
  Map C4, C6–C8) require committed evidence of:
  - at least one real public role run through a production registered adapter;
  - the candidate evaluator running as an isolated AC05 fixture subject, with a
    succeeded promotion action, `promotion.json` and `promotion-recorded`;
  - the fixture's `promotionPlan` identity recomputing;
  - the fixture's archive mapping count within B;
  - an observed bounded orchestrator run showing the default-workflow, gate,
    read-only, stop and blocker behaviours, with its instruction identity,
    runtime version and model.
- EA1: unproven or missing real runs leave these criteria unsatisfied and never
  become PASS.
- Diagnostic: the handoff is truthful. It fabricates nothing, labels layer (b)
  as scripted compliance and does not claim C7 substitution. Canonical human
  response `b90a79da-738b-4df5-ac8b-e1e65c589a1a` authorized recording the
  proofs as outstanding for the orchestrator to run through the governed host.
  But the frozen contract binds the evidence to the evaluated candidate, and
  verification was allocated before any such evidence was committed. The
  missing evidence belongs to the implementation handoff, not to the
  evaluator's environment: the evaluator makes no provider call by design
  (EA1). So this is not an infrastructure failure of evaluation.

### N1 — Process note (non-mandatory)

The implementation role's sandbox had no provider CLI or credentials. The
retry handoff should include the governed real-provider, AC05 fixture and
observed-orchestrator evidence, run only through the governed host as the human
response directs. Otherwise the next verification will fail the same way.

## Regression Results

- R1 `npm run check` (typecheck, lint, format check, `node --test`) on a clean
  clone of `0e2789c` with dependencies symlinked from the project's installed
  runtime and no provider credentials: exit 0; 173/173 tests passed.
- R2–R9 were spot-checked only; see Summary.

## Diagnostic Probes

- Read-only: `sha256sum` of the candidate orchestrator and evaluator skills
  equals the identities in `real-provider-runs.md` (orchestrator v3
  `4ca4d899…`, evaluator v14 `7a0e6531…`). Supplementary only.
- Read-only: `git show 0e2789c:<evidence files>` re-read the failing evidence
  from committed bytes rather than the working tree. Supplementary
  confirmation of F1; not frozen coverage.
- Read-only: inspected the trusted N policy and the public
  `verification-accounting` validator for the public result shape. This is
  not evaluation evidence.

## Evaluator Integrity

- Frozen evaluation modified during verification: no. All frozen identities
  were recomputed before execution and match.
- Specification drift: none. The brief, Design Map, eval-requirements and
  coverage map are unchanged from their freeze commits to the candidate.
- Evaluator defects: none discovered.
- IMPLEMENTATION_FAILURE confirmation checklist:
  - F1 is non-executable, so its "rerun in isolation" was a re-read of the
    exact committed bytes, not the working tree.
  - The frozen decision rules for L1–L3, L5, L6 and O2–O5 apply literally; no
    candidate-specific interpretation was needed.
  - Hidden-test setup and teardown left no disposable clones.
  - Evaluator cause ruled out: the plan is exercisable and was applied as
    frozen.
  - Specification cause ruled out: the requirement is explicit in the brief
    and EA1.
  - Infrastructure cause ruled out for the evaluation itself.

## Overall Assessment

The implementation does not satisfy the frozen spike evaluation contract. Every
executable hidden case passed, as did the offline regression. The deterministic
work appears substantially complete. The required real-provider, AC05
candidate-evaluator fixture and observed-orchestrator evidence is absent from
the candidate.

## Public Feedback

Emitted: `spikes/014d-real-methodology-integration-extensible-skill-evolution/verification-feedback.md`
and the canonical machine-bound `verification-result.json` in the same
directory. Neither reveals hidden cases, fixtures or grader mechanics.
