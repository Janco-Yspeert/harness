# 014d Verification Feedback — attempt 004

- Result: **FAIL**
- Classification: `IMPLEMENTATION_FAILURE`
- Candidate: `0e2789c4e2040a3bafb6d173506f65be66d44956`. This is unchanged since
  attempt 001, which failed for the same reason. Host attempts 002 and 003
  ended at the provider rate limit before any evaluation.
- Evaluator revision: `002`
  (`sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`)
- Canonical machine-bound record: `verification-result.json`

## Violated public requirement

- EA1, for AC02, AC03, AC05 and AC13, and the C4 bound record for AC06.
- Claims about real providers, the AC05 candidate-evaluator fixture and the
  observed orchestrator must come from committed evidence of real governed
  runs.
- Missing or unproven runs never become PASS.
- Deterministic or scripted evidence never substitutes for them (C7).

## Expected

The candidate commit carries committed evidence of:

1. At least one real public role run through a production registered adapter
   from a gated Role Grant. The record gives the runtime and installed version,
   the model and effort (or "unavailable"), and the host result.
2. The candidate evaluator run as an isolated AC05 fixture subject with its own
   trust root:
   - the evaluator persisted its plan;
   - it built and validated the manifest;
   - it published a sanitized result with `promotionPlan`;
   - it submitted PASS;
   - it made exactly one promotion request;
   - the host action returned `succeeded`;
   - the host created `promotion.json` and recorded `promotion-recorded`;
   - the plan identity recomputes.
3. The AC05 fixture's archive mapping count, recorded against B.
4. An observed, bounded orchestrator test-subject run. It shows:
   - default governed-workflow selection;
   - multi-phase continuation under one grant with no extra prompts;
   - a real human gate that stops and keeps the pending decision;
   - read-only behaviour;
   - stop behaviour;
   - blocker reporting.

   The record gives the exact orchestrator instruction identity, the runtime
   version and the model.

## Observed

- `evidence/real-provider-runs.md` is still marked **OUTSTANDING**. It records
  all three required runs as "not run".
- `evidence/promotion-bound.md` still records the AC05 fixture manifest count as
  "not yet run".
- The candidate contains no other committed evidence of a real run, a fixture
  promotion or an observed orchestrator.

## Safe diagnostics

- All executable evaluation passed. `npm run check` on a clean offline clone
  exited 0, with 173 of 173 tests passing.
- The handoff is truthful. It fabricates nothing.
- Re-verifying this same commit cannot change the result. A new implementation
  handoff must:
  - run these proofs only through the governed host, per canonical human
    response `b90a79da-738b-4df5-ac8b-e1e65c589a1a`;
  - commit their evidence;
  - fill in the outstanding records.
- For each item above, the retry should point to the committed evidence. That
  includes candidate/check/diff evidence for its exact candidate commit
  against trusted N.
- Other criteria were not adjudicated to decision depth. They are not reported
  as passes.
