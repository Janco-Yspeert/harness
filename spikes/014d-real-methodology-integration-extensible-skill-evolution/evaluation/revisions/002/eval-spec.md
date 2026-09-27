# Evaluation Specification

## Status

Frozen (revision `002`). Supersedes revision `001`, which was derived from the
Design Map invalidated by pre-implementation recovery
`d86c645e-d06c-4717-906e-439c0dfb7d83`. Revision `001` is preserved unchanged
under `.eval/revisions/001/` (bundle plus `freeze.json`, identity
`sha256:d03975365d8e1a624854a305d494c7018125849ea560070be4c03fff56cc80f5`). No
verification attempt was ever allocated against it.

## Source

- Spike: `spikes/014d-real-methodology-integration-extensible-skill-evolution`.
- Project commit at preparation (pre-implementation baseline):
  `a429ecd17fd0d8e33e0e54b02a83505d21905458`
  (`docs(014d): record design map after pre-implementation recovery`) on
  `feat/spike-014`. Its code is identical to revision 001's baseline
  `eeae1f5`; only `design-map.md` and `manifest.md` differ.
- `spike.md`:
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
  (`brief-frozen` at `047daacb683203bbd3ebb2bd808cff3404e60042`).
- `design-map.md`:
  `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`
  (`design-map-frozen` at `a429ecd`).
- `eval-requirements.md`:
  `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`.
- Evaluator skill: `skills/evaluator/SKILL.md`, `evaluator` contract version
  13, pinned identity
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`,
  delivered by Role Grant
  `sha256:2c588152332ec5091d6b07e211d7ca3c56a8fd5db8567b331756ba63245527bd`
  (execution `1f5d8020-262c-499e-a651-cace0b9af4c9`) under trusted N (kernel
  definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`;
  trusted record `sequence: 4`, manifest
  `sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`,
  revision `0a3dafe8e103cc7376bdd7fae32493710613d0c0`).
- Evaluation revision identity: the SHA-256 of the formatted
  `.eval/freeze.json` (recorded outside it, in the public readiness binding
  and the attempt ledger).

## Changes From Revision 001

Driven only by the replacement Design Map (C4, C6, C7 apply the canonical
human ruling on M1–M3; C1, C8 clarifications). No acceptance semantics were
added beyond those frozen changes.

- **C4 (one bound B, B + 1 oversized, representative archives).** New
  executable case E6. R-REG R3/R4, M-CODE C4 and new M-LIVE L6 now judge B
  through its one exported definition instead of a literal 64.
- **C6 (orchestrator outside trusted methodology; identity and history).** New
  executable cases E5d and E5e. M-ORCH O6 and M-EVOL V6 now require the exact
  C6 identity form, the test-subject-only rule and the recorded runtime,
  version and model (or "unavailable").
- **C7 (deterministic evidence never replaces real proofs).** M-MATRIX MX3 and
  M-LIVE wording and decision rules.
- E1–E4 and E5a–c test bytes are unchanged from revision 001. E5 gains E5d/E5e
  in the same file.

## Pre-Freeze Integrity Gate

- **Shared helper.** `.hidden-test/support/repo.ts` (unchanged) clones the
  committed HEAD of the evaluated project into a disposable directory and
  removes it on teardown. No `harness-014d-eval-*` directory remained after
  runs.
- **Controlled conditions (no candidate implementation existed or was
  executed).** All controls ran in disposable scratch clones of the committed
  baseline `a429ecd`; the shared working tree, which carries uncommitted
  changes this role neither made nor used, was never evaluated.
  - Baseline `a429ecd` (negative for E1, E2, E4a; positive for E3, E4b,
    E5a–e, E6): E1 failed with "Missing expected exception: promotion must be
    rejected: PASS for candidate A applied to B"; E2 failed with "the
    byte-identical leading prefix contains the complete pinned skill bytes";
    E4a failed with the working-tree edit denied ("trust equivalence denied:
    role skill evaluator-prepare differs from the trusted methodology", 409);
    the other 8 cases passed (E5e vacuously: orchestrator unmodified).
  - Evaluator-authored positive control (baseline plus a minimal C5 binding in
    `promoteMethodology`, a C9-ordered `workerInstructions`, a definition
    loader reading the latest trusted revision's committed bytes, and an
    orchestrator revision bumped to v3 with `docs/history/skills/orchestrator/v2.md`
    preserving the prior bytes): all 11 cases passed on two consecutive runs
    with the final test bytes (deterministic).
  - Negative control A (positive plus: accept-all archive builder, legacy
    mutation re-enabled under a governed host, an appended fifth trust record,
    a rewritten 014c file, a spike-ID constant in code): E3 reported all 10
    refusal cases as accepted; E4b failed (400 for `/workflow-runs`); E5a, E5b
    and E5c each failed for their own reason; E5d/E5e still passed.
  - Negative control B (orchestrator and bound variants, one at a time): E5e
    failed on "increments its Contract version" (revised, version not
    bumped), on "added: none" (bumped, no history entry) and on the history
    entry not equal to the prior bytes; E5d failed on policy.json configuring
    the orchestrator as a role's skill; E6 failed on "B + 1 mappings is
    refused" (enforced 100, published 64), on "exactly B mappings is
    admissible" (published 100, enforced 64) and on "B (16) admits … (38
    mappings)" (both 16); E6 passed with one exported definition raised to 128
    in both places, confirming B is not judged against the literal 64.
  - E3 fixture well-formedness (`.eval/prepare/e3-wellformed.ts`): the
    baseline utility accepts the unmodified eligible plan used by E3 (4
    mappings), so each refusal is attributable to its single mutation.
- **Non-executable procedures.** R-REG, M-MATRIX, M-LIVE, M-ORCH, M-CODE and
  M-EVOL are defined concretely in `case-manifest.json` with explicit per-item
  decision rules and criterion mappings. Each is resolvable from committed
  public artifacts, the candidate diff and the workflow ledger. None needs
  candidate-specific semantics invented after implementation. Hidden
  executable coverage is not justified for them because their seams are
  explicit Design Map implementation freedom (C7, C8, Implementation freedom:
  location of B, plan additions, matrix form, orchestrator harness) or
  real-provider/orchestrator runs the evaluator cannot reproduce (EA1).
- **Runtime assumptions validated.** Node v22.23.2 runs the `.ts` hidden tests
  with native type stripping. The production host starts on loopback port 0.
  `git clone --shared` works offline. The E4 host path is exercised through the
  same `startHarnessHost` path the mandatory case uses. E6 reads B from
  `WORKER_PROTOCOL_SCHEMAS.operations.requestAction` (a helper path error found
  by the baseline self-check was corrected before any control counted).
- All private artifacts are Prettier-formatted before identity.

## Explicit Requirements

- R1 — Fidelity matrix and deterministic real-skill exercise for all eight
  roles (brief §1, AC01; C7, C8).
- R2 — Real public/protected roles run through production registered
  adapters; observed orchestrator-initiated run uses Harness by default; C6
  orchestrator provenance (brief §1–§2, AC02; C6, C7).
- R3 — Unattended continuation within a grant; correct human gates,
  read-only boundary and stop (brief §2, AC03).
- R4 — One private `.eval/promotion-plan.json` or explicit ineligibility
  before PASS; identity resolves to the real file; public `promotionPlan`
  reference (brief §3, AC04; C2).
- R5 — Real governed candidate-evaluator fixture run with successful
  promotion action and byte-validated `promotion.json` plus
  `promotion-recorded`; N evaluates the fixture evidence (brief §3, AC05; C3,
  C7).
- R6 — Negative promotion states cannot fabricate archival; a genuine PASS
  survives a failed action; one bound B with B + 1 refused and representative
  archives fitting (brief §3, AC06; C4).
- R7 — Evaluator lineage; non-evaluator roles never exposed; real As-Built
  and Outcome gates (brief §1, AC07).
- R8 — No normal-path bridge, direct runner, prose protocol or command
  profile; legacy entrypoints classified (brief §7, AC08).
- R9 — Immutable trusted N prepares and verifies; candidate edits cannot
  defeat N; orchestrator outside trusted methodology; no spike-specific
  exception (brief §4, AC09; C1, C6, Invariants).
- R10 — Human trust promotion bound to an N-authored PASS and exact candidate
  commit and manifest; cross-candidate, stale and self-evaluated promotion
  rejected; trust event only after approval; acceptance evidence names the
  orchestrator identity (brief §4, AC10; C5, C6).
- R11 — No fixed eight-role allowlist; ninth optional role fixture;
  regression-recommendation seam (brief §5–§6, AC11).
- R12 — Stable/volatile context separation with enforced assignment
  identities; shared-public-context seam documented (brief §8, AC12; C9).
- R13 — Full checks and frozen independent evaluation pass at the exact
  candidate; truthful real-provider evidence (AC13).

## Derived Invariants

- I1 — A semantic result, a host-action result and a human decision are
  separate facts (design-map.md Invariants; R5, R6).
- I2 — A new workflow grant binds the latest trusted record rebuilt from its
  exact revision, independent of working-tree bytes (Invariants; R9).
- I3 — Trusted history is append-only and unchanged until explicit human
  approval (brief §4; R10).
- I4 — The evaluator-evidence `promotion` action stays a narrow archive
  (Invariants; R6, R11).
- I5 — The archive utility reads only the real persisted plan (Invariants;
  R4).
- I6 — One bound B: the published schema bound is the enforced bound (C4;
  R6).

## Negative Requirements

- N1 — No retroactive rewrite of 014c history (brief Context, "Do not do").
- N2 — No spike/version-ID-keyed runtime policy, trust record or code path
  (Invariants).
- N3 — No reactivated legacy `/workflow-runs` mutation (brief §7).
- N4 — No fabricated PASS, action, `promotion-recorded` or human event
  (AC06, AC13).
- N5 — No candidate self-evaluation or self-promotion (AC09, AC10).
- N6 — No hidden test bytes or private fixtures in public recommendations
  (brief §6).
- N7 — No split, bundled or truncated archival (C4).
- N8 — The candidate orchestrator never supervises this 014d workflow and is
  not added to trusted methodology before acceptance (C6).

## Evaluation Cases

Case definitions, procedures, decision rules and criterion mappings are frozen
in `case-manifest.json`. Summary:

- **E1** (executable, mandatory): C5 promotion binding (R10, I3, N5).
- **E2** (executable, mandatory): C9 stable prefix (R12).
- **E3** (executable, mandatory): archive-utility refusals that hold for every
  admissible plan schema (R4, R6, I5).
- **E4a/E4b** (executable, mandatory): new-grant trusted-N binding under
  working-tree edits (R9, I2); legacy mutation retired (R8, N3).
- **E5a–E5e** (executable, mandatory): trusted history unchanged (R10, I3);
  014c not rewritten (N1); no spike-ID exception (N2); orchestrator not a
  policy role or manifest component (R9, N8); revised orchestrator bumps its
  contract version and preserves the prior bytes as history (R2).
- **E6** (executable, mandatory): published bound B is the enforced bound, B
  accepted, B + 1 refused, B ≥ 38 (R6, I6, N7).
- **R-REG R1–R9** (public regression, mandatory): full checks plus genuine
  visible tests for implementation-owned seams, including B + 1 host refusal
  via the exported definition and the deterministic representative archive
  (R1, R3, R4, R6, R7, R8, R9, R11, R12, R13).
- **M-MATRIX MX1–MX4** (public evidence, mandatory): fidelity matrix truth,
  C7 labelling and evaluator/exposure lineage (R1, R7).
- **M-LIVE L1–L6** (public evidence, mandatory): real-provider and fixture
  promotion evidence, and the C4 bound record (R2, R4, R5, R6, R13, N4).
- **M-ORCH O1–O6** (composite review, mandatory): orchestrator instructions,
  observed run and C6 provenance (R2, R3).
- **M-CODE C1–C10** (manual review, mandatory): diff-level properties,
  including the one definition of B (R4, R6, R7, R8, R9, R11, R12, I4, N6,
  N7).
- **M-EVOL V1–V6** (public evidence, mandatory): N to N+1 process facts (R9,
  R10, R11, N5).

Mandatory cases: 52 (11 executable). Hidden coverage is withheld where the
Design Map leaves the seam free, as recorded per procedure in
`case-manifest.json`.

## Coverage Matrix

| Criterion | Procedures                            | Executable files                          |
| --------- | ------------------------------------- | ----------------------------------------- |
| AC01      | R-REG, M-MATRIX                       | —                                         |
| AC02      | E5, M-LIVE, M-ORCH                    | e5-authority-history-static.test.ts       |
| AC03      | R-REG, M-ORCH                         | —                                         |
| AC04      | E3, R-REG, M-LIVE, M-CODE             | e3-archive-plan-refusals.test.ts          |
| AC05      | M-LIVE                                | —                                         |
| AC06      | E3, E6, R-REG, M-LIVE, M-CODE         | e3-…, e6-artifact-bound.test.ts           |
| AC07      | R-REG, M-MATRIX, M-CODE               | —                                         |
| AC08      | E4, R-REG, M-CODE                     | e4-trusted-grant-resolution.test.ts       |
| AC09      | E4, E5, R-REG, M-CODE, M-EVOL         | e4-…, e5-authority-history-static.test.ts |
| AC10      | E1, E5, M-EVOL                        | e1-promotion-binding.test.ts, e5-…        |
| AC11      | R-REG, M-CODE, M-EVOL                 | —                                         |
| AC12      | E2, R-REG, M-CODE                     | e2-stable-context-prefix.test.ts          |
| AC13      | E1, E2, E3, E4, E5, E6, R-REG, M-LIVE | all six                                   |

Requirement mapping: R1→AC01; R2→AC02; R3→AC03; R4→AC04; R5→AC05; R6→AC06;
R7→AC07; R8→AC08; R9→AC09; R10→AC10; R11→AC11; R12→AC12; R13→AC13.
Invariants and negatives map through the cases listed above. This matrix
agrees with `case-manifest.json` and `.hidden-test/manifest.json`.

Not automatable by the evaluator: real-provider runs (AC02, AC05), the
observed orchestrator run (AC02, AC03), and diff-level review items.

## Out of Scope

- The final human methodology trust promotion itself (EA6), orchestrator
  adoption (after acceptance, C6), 014a recovery, 014e canary, 015
  usage/quota measurement, shared-session execution.
- Whether the plan schema adds particular field names (C2 freedom), where B's
  definition lives or what it is named, the fidelity matrix's machine form,
  test layout, the orchestrator test-subject harness, ninth-role contents and
  the regression-recommendation format beyond its documented safety
  properties.
- Whether this spike's own N-verified archive fits B. If it does not, that is
  a truthful incomplete phase handled at human acceptance (C4), not a
  criterion of this evaluation.
- Real-provider token/cache savings.

## Limitations

- AC02, AC03 and AC05 rest on committed evidence of real runs. The evaluator
  recomputes identities but cannot re-observe provider behavior.
- E3 asserts refusals only. Correct eligible expansion is judged through R3
  and L2/L5.
- E4a checks role set and skill identities against N's committed bytes. It
  does not judge validator-source resolution beyond the gate outcome (EA5).
- E5c is a lexical scan that ignores comments. Deeper exception patterns are
  covered by M-CODE C9.
- E5d is a lexical check for the orchestrator path in the committed policy and
  the built manifest. E5e passes vacuously for an unmodified orchestrator;
  M-ORCH O1/O6 require the revision.
- E6 checks the worker-protocol validation point. That the host check and the
  archive utility use the same one definition is judged by M-CODE C4 and
  R-REG R4.

## Revision History

- `001` — initial frozen revision against the invalidated Design Map
  `sha256:f5193434…ef6f`. Preserved under `.eval/revisions/001/`. Never used
  by a verification attempt.
- `002` — this document. Re-prepared against the replacement Design Map after
  pre-implementation recovery `d86c645e-d06c-4717-906e-439c0dfb7d83`.
