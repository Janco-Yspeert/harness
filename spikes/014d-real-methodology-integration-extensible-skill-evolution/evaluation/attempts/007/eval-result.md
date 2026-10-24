# Evaluation Result

## Overall Result

PASS — no classification.

## Evaluation Source

- Verification attempt: `007` (host `verification-allocated` event
  `11996290-1d95-4fee-8f12-ce8c59e5a53a`, attempt 7, cycle `001`; execution
  `7b3daed7-6a33-4602-abde-1935c0757056`; Role Grant
  `sha256:4142f54d5a6ce7c4c143168608b8889019b3f0c98cfe1a37fd39b359f77b38da`,
  allocation key
  `sha256:f8d10008f231d692ceda6a4ea608f669433bfcc9449b63df44a42176f005fdad`;
  predecessor execution `2e924108-802f-4c7a-a91d-64754a50af10`; root authority
  `348cdfff-5732-47fc-b753-2c9e9bb2a04b`. The human authorized this attempt to
  independently verify the unchanged candidate after administrative commit
  `41726f7` recorded the missing AC09 methodology candidate/check/diff
  evidence. Evaluator revision `002` and trusted N stay fixed.)
- Implementation: `git:9169ccf7d4543c214e7b7890ee29e428a5f8c01a`. This is the
  same candidate as attempts 005 and 006. It was evaluated from a fresh clean
  clone at that commit, with dependencies symlinked from the project's
  installed runtime. The shared working tree was not evaluated. Its
  uncommitted `src/kernel/*` and `test/kernel.test.ts` changes are host
  maintenance 003, which is outside the candidate.
- Evidence basis for the non-executable procedures: the committed public
  evidence at repository `HEAD` `41726f75b9a0260dd606613aadcf78fd21d1e937`.
  `git diff --name-only 9169ccf HEAD` lists only files under the spike
  directory. No code, skill, contract, policy, trusted history or test
  differs from the candidate. Since attempt 006 there are two new commits:
  - `f79e502`, the attempt-006 public result;
  - `41726f7`, the methodology-evolution evidence under
    `evidence/methodology-evolution/`.
- Frozen identities were recomputed before execution. All of them match:
  - brief `sha256:8d4302b2…ac710d`;
  - Design Map `sha256:50780fa3…1200e`;
  - eval-requirements `sha256:c47e49c8…8691a`;
  - coverage-map `sha256:a7abb9d1…e8c349b`. It is the same at the
    candidate, at `HEAD` and in the working tree, and equals the Role Grant
    input;
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
- Evaluation time: 2026-09-27, from 10:04Z.

## Summary

- Executable mandatory cases: 11 of 11 passed (E1, E2, E3, E4a, E4b, E5a–E5e,
  E6), in about 0.93 s.
- Regression R1 (`npm run check`, clean clone, no provider credential
  variables present): exit 0; 175 tests, 175 passed.
- Non-executable procedures: every one is evidenced, to decision depth:
  - R-REG R2–R9;
  - M-MATRIX MX1–MX4;
  - M-LIVE L1–L6;
  - M-ORCH O1–O6;
  - M-CODE C1–C10;
  - M-EVOL V1–V6.
- Attempt 006's finding F1 (V1, AC09) is closed. See below.
- Criteria: 13 of 13 satisfied.
- Evaluator defects: 0. Specification ambiguities: 0. Infrastructure
  failures: 0. Implementation failures: 0.

## Closed finding from attempt 006

### F1 — Candidate/check/diff evidence for the exact candidate (M-EVOL V1; AC09)

- Frozen rule: "V1: committed candidate/check/diff evidence for the exact
  candidate commit against trusted N is presented."
- Committed evidence (`41726f7`, `evidence/methodology-evolution/`):
  - `trusted-n.candidate.json`
    `sha256:a763151b2bf7e3fc031b63ab2aa0a79587c7a218e0a3ff54b00157586996649d`.
    This is `candidate` at revision `0a3dafe8…`. It records
    `trustedIdentity` `sha256:5fc66acd…`, and `relationToTrusted` is `equal`.
  - `candidate-n-plus-one.candidate.json`
    `sha256:dfac9e8edb9e4a2a45532d0441bfc1148d055c9f943f0fb2d5ba3307c185c7b4`.
    This is `candidate` at revision `9169ccf7…`, with manifest
    `sha256:47296d5c…` and `relationToTrusted` `different`.
  - `candidate-n-plus-one.check.json`
    `sha256:164f06b9ac886e4f0e15ecbb3741e8341114c51836ae4637fd5210b41bf74c7b`.
    `check` of `sha256:47296d5c…` returns `valid: true` with no diagnostics.
  - `trusted-n-to-candidate.diff.json`
    `sha256:3fc1516d80459cd878ef0f6b3e28aff50d246fab4462a5a681cbdb467fcc88cd`.
    The diff runs from `sha256:5fc66acd…` to `sha256:47296d5c…`. It reports
    changes to the policy, to all eight skills, and to the evaluator-verify
    and implementation contracts. No roles were added or removed.
  - `provenance.md` records the exact commands, the tool and trusted-history
    source identities, and these output bindings.
- Independent recomputation: diagnostic probe P2 re-ran the four recorded
  commands in the clean candidate clone. The output was byte-identical to all
  four committed outputs. The trusted history at the candidate
  (`sha256:d9d4519a…`) holds record 4 = `sha256:5fc66acd…` at `0a3dafe8…`.
  The recorded tool-source identities equal the candidate's `tools/methodology.ts`
  (`sha256:f315a0d9…`) and `src/methodology-evolution.ts`
  (`sha256:a01caed0…`).
- Decision: V1 is evidenced. Probe P2 only authenticated the committed
  evidence. It did not substitute for it.

## Adjudication of the remaining procedures

The candidate is unchanged since attempt 006. The only public changes are the
two documentation commits listed above, so the attempt-006 adjudication of the
items below still applies to the same bytes. It was re-confirmed where new
facts could affect it:

- R-REG R2–R9: the visible tests named in attempt 006 are unchanged at the
  candidate and pass under R1 (175/175).
- M-MATRIX MX1–MX4: `evidence/fidelity-matrix.md` and the candidate contracts
  and policy are unchanged. Satisfied.
- M-LIVE L1–L6: the real-provider, R3 fixture and promotion evidence is
  unchanged since attempt 006, and its identities still recompute. B = 64
  (`MAX_ACTION_ARTIFACTS`). Satisfied.
- M-ORCH O1–O6: the orchestrator v3 instructions and the committed AC02 and
  AC03 observations are unchanged. Satisfied.
- M-CODE C1–C10: the code is unchanged. Satisfied.
- M-EVOL:
  - V1: satisfied (see above).
  - V2: every evaluator-prepare (3) and evaluator-verify (7, including this
    attempt) allocation in the workflow ledger binds `sha256:f03608ba…`. So do
    all brief-readiness, design-map and implementation allocations.
  - V3: the ledger has no trust event and no `human-accepted` or
    `promotion-recorded` event. Those names appear only as predicate text in
    the definition and the grants. Production `trusted.jsonl` is unchanged
    (E5a), and the new provenance explicitly leaves trusted history
    unaltered.
  - V4: E1.
  - V5: the ninth-role fixture is unchanged, stays untrusted and cannot hold
    private exposure.
  - V6: unchanged since attempt 006. The identity is named, and adoption is
    stated to follow acceptance. Nothing claims earlier adoption.

## Regression Results

- R1: exit 0, 175/175. The log is at `/tmp/harness-scratch-XXYwBn/a7/r1.log`
  (execution scratch space; not retained as evidence).
- R2–R9: genuine falsifiable visible tests exist and pass.

## Diagnostic Probes

All probes were read-only and supplementary. None is frozen coverage.

- P1: `git diff --name-only 9169ccf HEAD`, to establish that later commits
  touch only spike-directory files.
- P2: re-ran the four `tools/methodology.ts` commands recorded in
  `provenance.md` in the clean candidate clone. The output was byte-identical
  to the committed outputs. This authenticates the V1 evidence. It is not
  itself V1 evidence.
- P3: a scan of workflow-ledger transitions and methodology bindings, for V2
  and V3.

## Evaluator Integrity

- Frozen evaluation modified: no.
- Specification drift: none.
- Evaluator defects discovered: none.
- Setup and teardown: one clean scratch clone at
  `/tmp/harness-scratch-XXYwBn/a7/cand` (execution scratch space). Hidden tests
  created and removed their own disposable clones.

## Overall Assessment

Candidate `9169ccf` satisfies frozen evaluator revision `002`. All
executable cases pass, and so does the regression. The committed evidence
now presents every proof item, including the step-1 N to N+1
candidate/check/diff evidence for the exact candidate against trusted N.
All 13 criteria are satisfied. Human product and methodology acceptance is a
separate, later gate.
