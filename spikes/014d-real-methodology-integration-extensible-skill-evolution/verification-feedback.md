# 014d Verification Feedback — attempt 005

- Result: **FAIL**
- Classification: `IMPLEMENTATION_FAILURE`
- Candidate: `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`
- Evaluator revision: `002`
  (`sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`)
- Canonical machine-bound record: `verification-result.json`

## Violated public requirement

- EA1, together with brief §2 (observed orchestrator evidence) and brief §3
  (the AC05 candidate-evaluator fixture). This covers AC02, AC03, AC04, AC05
  and AC13.
- Claims about real providers, the fixture and the orchestrator must come from
  committed evidence of real governed runs.
- Missing or unproven items never become PASS.

## Expected

1. **Default selection (AC02).** The observed orchestrator run shows an
   ordinary actionable request, identified as such, selecting the governed
   workflow without additional incantations.
2. **Blocker reporting (AC03).** The observed run shows a missing adapter,
   permission or authority reported as an inspectable blocker. It is not
   worked around.
3. **Fixture trust root (AC05).** The AC05 fixture evidence shows that the
   fixture had its own explicitly initialized test trust root.
4. **Fixture `promotionPlan` binding (AC04, AC05).** The fixture's public
   verification result carries `promotionPlan {identity, decision}`. Its
   identity equals sha256 of the real persisted plan bytes.

## Observed

The new committed evidence records the real governed fixture run:

- `evidence/real-provider-runs.md`;
- `evidence/r3-repaired-fixture/`.

Its own section "Gaps the committed extract does not close" lists all four
items above as not shown:

- no blocker-reporting observation;
- the initiating request is not quoted or described;
- the fixture trust root rests on isolation only;
- the plan and result bytes are not recomputable, and the result's
  `promotionPlan` is not recorded.

The evaluator confirmed each gap from the committed bytes.

## Safe diagnostics

- All executable evaluation passed. `npm run check` on a clean offline clone
  exited 0, with 175 of 175 tests passing.
- Every committed identity recomputes:
  - the orchestrator, at `b68ad3c` and at the candidate;
  - the evaluator;
  - As-Built;
  - the extract.
- The handoff is truthful and fabricates nothing.
- These items are evidenced:
  - one-grant multi-phase continuation;
  - the human-gate stop;
  - read-only and stop behaviour;
  - orchestrator provenance (identity, runtime version, and model
    "unavailable");
  - the fixture's succeeded promotion action and `promotion-recorded`;
  - the bound record (B = 64, with representative counts 38 and 3).
- To close the gaps, the retry must commit governed evidence for items 1–4.
  It must run only through the governed host, per canonical human response
  `b90a79da-738b-4df5-ac8b-e1e65c589a1a`.
- For the real public-role record, the retry should also record the requested
  model and the executed role skill identities.
- Other criteria were not adjudicated to decision depth. They are not reported
  as passes.
