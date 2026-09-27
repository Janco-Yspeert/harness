# Evaluation Result

## Overall Result

FAIL — classification `IMPLEMENTATION_FAILURE`.

## Evaluation Source

- Verification attempt: `005` (host `verification-allocated` event
  `c7d722a7-a6d4-4760-a4ac-9417aabe60e7`, attempt 5, cycle `001`; execution
  `89207741-2ec2-435f-8223-26fb904072a0`; Role Grant
  `sha256:56db2e9d3351d6de8493b3debb1517a761eee936f12d4df941f5f5ffc9649de0`,
  allocation key
  `sha256:5b581c51b686998c6e40a9617cecf06a2e823d2513bbeb77b93133fb9d0bc3e7`;
  predecessor execution `37ea25ba-f832-4215-8815-eed9372efcdd`; root authority
  `0f2e960b-890d-4abd-bd89-e6a3f74a2e17`).
- Implementation: `git:9169ccf7d4543c214e7b7890ee29e428a5f8c01a`. This is a new
  candidate. Since attempt 004's candidate `0e2789c` it adds the imported R3
  fixture evidence, the As-Built repair and related tests. It was evaluated from
  a fresh clean clone at that commit, with dependencies symlinked from the
  project's installed runtime. The shared working tree was not evaluated. Its
  uncommitted `src/kernel/*` and `test/kernel.test.ts` changes are host
  maintenance 003, which is outside the candidate.
- Frozen identities were recomputed before execution. All of them match:
  - brief `sha256:8d4302b2…ac710d`;
  - Design Map `sha256:50780fa3…1200e`;
  - eval-requirements `sha256:c47e49c8…8691a`;
  - coverage-map `sha256:a7abb9d1…e8c349b` (equal to the Role Grant input);
  - eval-spec `sha256:3aadfd17…f8c9ed`;
  - case-manifest `sha256:d5029031…1079f8`;
  - hidden manifest, support file and all six hidden test files;
  - preparation records;
  - `freeze.json`
    `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`
    (evaluator revision `002`, equal to the public readiness binding).
- Evaluator skill: contract version 13, pinned
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`.
  Kernel definition (trusted N):
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
- Evaluation time: 2026-09-26, from 12:49Z.

## Summary

- Executable mandatory cases: 11 of 11 passed (E1, E2, E3, E4a, E4b, E5a–E5e,
  E6).
- Regression R1 (`npm run check`, clean clone, offline, provider credential
  variables unset): exit 0; 175 tests, 175 passed.
- Failed mandatory cases: M-ORCH O5 and O2; M-LIVE L3 and L5.
- Evidenced without a finding: M-LIVE L2 (event order and succeeded action as
  recorded in the extract), L4 (nothing fabricated; the handoff lists its own
  gaps), O3, O4, and O6 run provenance. O6 records the orchestrator
  identity, which recomputes from `b68ad3c` and from the candidate. It
  records Contract version 3, runtime `codex-cli 0.155.1` and model
  "unavailable".
- Evidenced with a note, not decisive on its own: L1. The record gives the
  registered Claude adapter, provider version 2.1.280, the confirmed model and
  host results. It does not give the requested model or the role skill
  identities. L6: B = 64, deterministic representative 38 ≤ B, and the AC05
  fixture count 3 ≤ B. The fixture archive bytes are not committed, so the
  count cannot be recomputed. The rule allows this, since it asks only for
  committed counts to recompute.
- Not adjudicated to decision depth: R2–R9, M-MATRIX MX1–MX4, M-CODE C1–C10,
  M-EVOL V1–V6, M-ORCH O1. The attempt was already a terminal FAIL on
  required evidence, so these are not reported as passes.
- Evaluator defects: 0. Specification ambiguities: 0. Infrastructure
  failures: 0.

## Findings

### F1 — Observed orchestrator run lacks blocker reporting (M-ORCH O5; AC03)

- Classification: `IMPLEMENTATION_FAILURE`.
- Frozen rule: any O2–O5 behaviour not evidenced by the committed observed run
  is a FAIL. Brief §2 explicitly requires that a missing adapter, permission or
  authority be reported as an inspectable blocker.
- Observed: `evidence/real-provider-runs.md` › "Gaps the committed extract does
  not close" states that the extract contains no observation of a missing
  adapter, permission or authority being reported as a blocker.
  `canonical-observations.md` contains none.

### F2 — Default governed-workflow selection is not evidenced (M-ORCH O2; AC02)

- Classification: `IMPLEMENTATION_FAILURE`.
- Frozen rule: O2 requires committed evidence that an ordinary actionable
  request selected the governed workflow without additional incantations.
- Observed: the handoff states that the extract does not quote or describe the
  initiating request. It shows only that the supervisor used the governed host
  and no direct provider or bridge. That establishes the negative, not that the
  request was ordinary. The one-grant multi-phase continuation part of O2 is
  evidenced.

### F3 — The fixture's explicitly initialized trust root is not evidenced (M-LIVE L3; AC05)

- Classification: `IMPLEMENTATION_FAILURE`.
- Frozen rule: L3 requires evidence that the fixture had its own explicitly
  initialized trust root and cannot certify the production candidate. Brief
  §3 requires the same.
- Observed: the handoff states that the fixture's trust root "rests on its
  isolation and is not separately evidenced in the extract".

### F4 — The fixture's `promotionPlan` binding is not evidenced (M-LIVE L5; AC04, AC05)

- Classification: `IMPLEMENTATION_FAILURE`.
- Frozen rule: L5 requires that the fixture's public verification result
  carries `promotionPlan {identity, decision}` and that the identity equals
  sha256 of the real persisted plan bytes.
- Observed: the extract records only the source verification result's file
  identity (`sha256:42a86bb6…`) and the promoted `promotion-plan.json` identity
  (`sha256:bbe3cbc5…`). It does not record the result's `promotionPlan`
  identity or decision. It also does not show that the identity equals the
  persisted plan bytes. None of those bytes are committed, so nothing is
  recomputable. The handoff lists this under "R2 recomputation".

### Isolation rerun and ruling out other causes

- Rerun in isolation: every committed evidence file was re-read from the clean
  clone. Every committed identity was recomputed: the orchestrator at `b68ad3c`
  and at the candidate, the evaluator, the As-Built skill and the
  canonical-observations extract. All match.
- Evaluator cause ruled out: each frozen plan was applied literally, and none
  needed a candidate-specific interpretation.
- Specification cause ruled out: each missing item is explicit in brief §2/§3
  and EA1.
- Infrastructure cause ruled out: the evaluator makes no provider call by
  design.
- The candidate's handoff itself lists F1–F4 as gaps. It claims none of them.

## Regression Results

- R1: exit 0, 175/175. The log is at `/tmp/harness-scratch-RtB7fw/r1.log`
  (execution scratch space; not retained as evidence).
- R2–R9: not adjudicated.

## Diagnostic Probes

All probes were read-only and supplementary. None is frozen coverage.

- `git diff --stat 0e2789c 9169ccf`, to identify the new evidence.
- `sha256sum` recomputations of the skill identities and the extract (listed
  above).
- `grep` in the brief and eval-requirements for the §2 and §3 requirements
  behind F1–F4.
- Read `src/methodologies/harness-public.ts` `verification-accounting` to learn
  the public result shape. This is not evaluation evidence.

## Evaluator Integrity

- Frozen evaluation modified: no.
- Specification drift: none.
- Evaluator defects discovered: none.
- Setup and teardown: one clean scratch clone was created at
  `/tmp/harness-scratch-RtB7fw/cand5` (execution scratch space). Hidden tests
  created and removed their own disposable clones.

## Overall Assessment

The implementation does not satisfy the frozen evaluation contract. The
executable evaluation and the offline regression pass. The new real-run
evidence closes most of attempt 004's gaps. Four frozen proof items remain
unproven, and the candidate truthfully declares each of them as a gap:

- blocker reporting;
- ordinary-request default selection;
- the fixture trust root;
- the fixture `promotionPlan` binding.

## Public Feedback

- `verification-feedback.md` and the canonical `verification-result.json`, both
  for attempt 005, in the spike directory.
