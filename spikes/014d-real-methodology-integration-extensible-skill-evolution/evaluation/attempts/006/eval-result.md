# Evaluation Result

## Overall Result

FAIL — classification `IMPLEMENTATION_FAILURE`.

## Evaluation Source

- Verification attempt: `006` (host `verification-allocated` event
  `736eeaf7-27a2-4f96-92bf-9ce71fa7d5cc`, attempt 6, cycle `001`; execution
  `2e924108-802f-4c7a-a91d-64754a50af10`; Role Grant
  `sha256:8a8517ba781b84da52a69f65fe24e72bd5707da2e17596472d7b1ac7b0e58c3d`,
  allocation key
  `sha256:a54498c25e2af4310c262edd651c1a152e9339a2dec815a3bd177d2c02dd703a`;
  predecessor execution `89207741-2ec2-435f-8223-26fb904072a0`; root authority
  `9e7060e6-fb38-43f0-934d-649a3d6da89e`, "one fresh independent Evaluator
  Verify retry after authenticated public R3 evidence import").
- Implementation: `git:9169ccf7d4543c214e7b7890ee29e428a5f8c01a`. This is the
  same candidate as attempt 005. It was evaluated from a fresh clean clone at
  that commit, with dependencies symlinked from the project's installed
  runtime. The shared working tree was not evaluated. Its uncommitted
  `src/kernel/*` and `test/kernel.test.ts` changes are host maintenance 003,
  which is outside the candidate.
- Evidence basis for the non-executable procedures: the committed public
  evidence at repository `HEAD` `f62e4ed61e2c001ed6a6704f8de94e72a7025bc4`.
  Every commit from `9169ccf` to `f62e4ed` changes only files under the spike
  directory: the attempt-005 result, imported R3 fixture evidence (`51d5df6`,
  `4f98c71`), CLI setup and preflight records, and the AC02/AC03 CLI
  observations (`f62e4ed`). No code, skill, contract, policy or test differs
  from the candidate. These human-authorized public imports were the stated
  basis of root authority `9e7060e6`, so they are treated as committed evidence
  for the frozen evidence procedures. They are not candidate code.
- Frozen identities were recomputed before execution. All of them match:
  - brief `sha256:8d4302b2…ac710d`;
  - Design Map `sha256:50780fa3…1200e`;
  - eval-requirements `sha256:c47e49c8…8691a`;
  - coverage-map `sha256:a7abb9d1…e8c349b` (at the candidate and at `HEAD`;
    equal to the Role Grant input);
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
- Evaluation time: 2026-09-27, from 09:13Z.

## Summary

- Executable mandatory cases: 11 of 11 passed (E1, E2, E3, E4a, E4b, E5a–E5e,
  E6).
- Regression R1 (`npm run check`, clean clone, offline, no provider credential
  variables present): exit 0; 175 tests, 175 passed.
- Failed mandatory case: M-EVOL V1 (AC09).
- Evidenced without a finding. This attempt adjudicated every non-executable
  case to decision depth:
  - R-REG R2–R9;
  - M-MATRIX MX1–MX4;
  - M-LIVE L1–L6;
  - M-ORCH O1–O6;
  - M-CODE C1–C10;
  - M-EVOL V2–V6.
- Attempt 005's findings F1–F4 are closed by the imported evidence (see
  "Closed findings").
- Evaluator defects: 0. Specification ambiguities: 0. Infrastructure
  failures: 0.

## Findings

### F1 — Candidate/check/diff evidence for the exact candidate is not presented (M-EVOL V1; AC09)

- Classification: `IMPLEMENTATION_FAILURE`.
- Frozen rule: "V1: committed candidate/check/diff evidence for the exact
  candidate commit against trusted N is presented." "Missing V1 evidence … is
  a FAIL (V1, V2: AC09)."
- Public authority: brief §4, ordinary path step 1: "Resolve immutable trusted
  N and create an exact candidate N+1; present the existing
  `candidate`/`check`/`diff` evidence." AC09: "uses immutable trusted N to
  prepare and independently verify the exact candidate."
- Observed:
  - Nothing committed under the spike directory, at the candidate or at
    `HEAD`, presents `methodology candidate` output for the candidate
    revision, its `check` result, or its `diff` against trusted N (trusted
    record 4, manifest `sha256:5fc66acd…`, revision `0a3dafe`).
  - The only candidate/check/diff material is the disposable ninth-role
    extensibility test (AC11). That is a different candidate.
  - The implementation manifest entries report `npm run check` results and
    skill identities, but no methodology candidate identity, check or diff.
- Isolation and cause:
  - Searched the complete committed spike tree at both revisions, including
    `manifest.md`, every `evidence/**` file and the imported fixture files.
  - Evaluator cause ruled out: the procedure is concrete, was frozen before
    implementation, and was applied literally.
  - Specification cause ruled out: brief §4 step 1 states the requirement
    explicitly and publicly.
  - Infrastructure cause ruled out: the evidence is producible with the
    candidate's own tool, as diagnostic probe P3 below shows.

### Closed findings from attempt 005

- F1 (O5 blocker reporting, AC03): closed.
  - `evidence/r3-cli-observations/ac03/observation.md` records the candidate
    orchestrator v3 (`sha256:4ca4d899…`, recomputed at the candidate) under
    Codex CLI 0.155.1, model unavailable. An ordinary request produced a
    bounded grant and continuation.
  - The host returned the error "no eligible spawned executor" with category
    `no-adapter`. The candidate reported it as the blocker and stopped, with no
    direct provider or substitute adapter.
  - The committed ledger snapshot (`sha256:5b97d80f…`, recomputed) holds only
    the definition and grant, with no execution. The committed
    `executors.json` is `[]`.
- F2 (O2 default selection, AC02): closed.
  - `ac02/observation.md` quotes the exact ordinary request ("Please add
    fixture-marker.txt with the requested ready content and run the
    appropriate check."), which has no Harness incantation.
  - The committed ledger (`sha256:3e24e947…`, recomputed) shows one grant, two
    spawned governed executions (`brief-frozen`, `design-map-frozen`) and no
    `kernel.human-request`.
  - The later host exit at Evaluator Prepare (the fixture configuration lacks
    an evaluation workspace) is recorded truthfully, not as success.
- F3 (L3 fixture trust root, AC05): closed.
  - The committed `r3-repaired-fixture/source/fixture-trusted.jsonl`
    (`sha256:80500291…`, recomputed) holds an explicitly initialized
    sequence-1 human-bootstrap root: methodology `sha256:47296d5c…`, revision
    `b68ad3c`, `previous: null`.
  - The committed `project.json` (`sha256:9a853853…`, recomputed) names it as
    the fixture's own `trustedHistory` in a distinct project
    (`harness-014d-r3-repair2-fixture`).
  - Production `trusted.jsonl` is byte-unchanged (E5a), so the fixture cannot
    certify the production candidate.
- F4 (L5 `promotionPlan` binding, AC04/AC05): closed.
  - The committed fixture `verification-result.json` (`sha256:42a86bb6…`,
    recomputed and equal to the bound `verification-finalized` identity)
    carries `promotionPlan` with identity `sha256:bbe3cbc5…` and decision
    `ELIGIBLE`.
  - The committed `promotion-plan.json` hashes to exactly
    `sha256:bbe3cbc59a59da8f1378c37e91c7ba023496893362416dfd54509c4e83ac4fb5`.
  - The committed `promotion.json` hashes to `sha256:30cb2004…`, equal to the
    `promotionIdentity` in the byte-copied `promotion-recorded` event. Its 3
    mappings recompute the L6 fixture count.

## Adjudication of the remaining procedures

- R-REG, visible tests at the candidate, read for genuineness:
  - R2: `skill-fidelity` "one bounded grant carries all eight real roles …"
    asserts the exact transition list, pinned skill and contract identities
    per role, artifact identities from committed bytes, the plan to
    `promotionPlan` binding and the As-Built commit shape. There is also the
    static test (c).
  - R3: `archive-manifest` C2/AC04/AC06/C4 tests, including the 38-mapping,
    14-attempt, 2-revision representative within `MAX_ACTION_ARTIFACTS`.
  - R4:
    - `skill-fidelity` AC06 tests: omitted, ineligible, wrong candidate,
      wrong attempt, omitted plan, `padTo: MAX_ACTION_ARTIFACTS + 1`, mutated
      source and duplicate delivery;
    - `governed-executors` "PASS survives an omitted required promotion" and
      "denied and failed promotions keep the PASS".
  - R5: `methodology-evolution` AC11 ninth-role test.
  - R6: `governed-executors` AC16/EA5 tests.
  - R7: `worker-context` C9 tests.
  - R8: the eight-role grant test with no human request and the gate
    preserved, plus the NOT_READY and stop test.
  - R9: production executor configuration, generated-bridge refusal,
    `legacy-bridges` and "worker prose does not create a human gate".
  - All pass under R1.
- M-MATRIX:
  - MX1: eight rows with every required column.
  - MX2: rows agree with the candidate contracts, policy and the skills'
    worker-protocol sections.
  - MX3: layer (b) is labelled scripted compliance, and C7 non-substitution
    is stated.
  - MX4: only the three evaluator contracts are protected and hold
    `evaluation`. The others forbid `evaluator-private`. As-Built requires
    `promotion-recorded`. Outcome requires `human-accepted` and distinguishes
    STANDARD from PROCESS_EXCEPTION.
- M-LIVE:
  - L1: the real governed Claude adapter, provider 2.1.280, confirmed
    `claude-opus-5-5`, reasoning unavailable, and host results. Role skill
    identities are now in `source/ledger-provenance.md` (Brief Readiness
    `sha256:439432d1…` equals the candidate's).
  - L2: the evaluator v14 subject `sha256:7a0e6531…`, one action with status
    `succeeded`, then `promotion-recorded`.
  - L3: see F3 above.
  - L4: nothing fabricated. The AC02 interruption and the AC03 refusal are
    reported truthfully.
  - L5: see F4 above.
  - L6: B = 64 equals `MAX_ACTION_ARTIFACTS` and E6. The counts 38 and 3 are
    within B, and 3 now recomputes.
- M-ORCH:
  - O1: every rule is present in the candidate v3 instructions.
  - O2: see F2 above.
  - O3: the `human acceptance required` stop.
  - O4: read-only and explicit stop (canonical observations).
  - O5: see F1 above.
  - O6: identity `sha256:4ca4d899…` and v3 recompute at the candidate. The
    runtime is Codex CLI 0.155.1, model unavailable. The orchestrator ran only
    as a fixture subject.
- M-CODE:
  - C1: one plan path and schema v2 in `tools/archive-manifest.ts`, named by
    the skill and the contract.
  - C2: the evaluator skill instructs the C3 order and archival only on
    `succeeded`.
  - C3: `promotionPlan` is the plan's `decisionIdentity`.
  - C4: one definition, `MAX_ACTION_ARTIFACTS`, used by the schema, the
    parser, `ExecutionKernel.promote` and the utility alias. Tests refer to it.
  - C5: the §7 classification exists.
  - C6: `ACTIVE_ROLES` is removed and the role set derives from policy.
  - C7: the regression-recommendation seam is documented, and promotion is
    not broadened.
  - C8: `{system, prompt}` is kept and the shared-public-context seam is
    documented.
  - C9: no spike identifier in runtime code or configuration (only the
    unchanged historical trusted records).
  - C10: the evaluator workspaces are protected. Non-evaluator contracts
    forbid `evaluator-private`.
- M-EVOL:
  - V1: FAIL (F1).
  - V2: every allocation in this workflow's ledger (brief-readiness 1,
    design-map 4, evaluator-prepare 3, evaluator-verify 6, implementation 10)
    binds `sha256:f03608ba…`.
  - V3: no trust event (E5a).
  - V4: E1.
  - V5: the ninth-role fixture stays untrusted and cannot hold private
    exposure.
  - V6: the identity is named, and adoption is stated to follow acceptance.

## Regression Results

- R1: exit 0, 175/175. The log is at `/tmp/harness-scratch-ak3dVG/a6/r1.log`
  (execution scratch space; not retained as evidence).
- R2–R9: genuine falsifiable visible tests exist and pass.

## Diagnostic Probes

All probes were read-only and supplementary. None is frozen coverage.

- P1: `git diff --stat 9169ccf f62e4ed` and the commit log, to establish that
  later commits touch only spike-directory evidence.
- P2: `sha256sum` recomputation of every imported R3 and CLI-observation file
  and of the candidate orchestrator.
- P3: `node tools/methodology.ts candidate 9169ccf… methodologies/harness/trusted.jsonl`
  and `check` in the scratch clone. This produced candidate manifest
  `sha256:47296d5c…` with `valid: true`, which shows the V1 evidence was
  producible. It is not V1 evidence and does not change F1.
- P4: read the trusted validator `src/methodologies/harness-public.ts` at
  `0a3dafe` to learn the public result shape. This is not evaluation evidence.

## Evaluator Integrity

- Frozen evaluation modified: no.
- Specification drift: none.
- Evaluator defects discovered: none.
- Setup and teardown: one clean scratch clone at
  `/tmp/harness-scratch-ak3dVG/a6/cand` (execution scratch space). Hidden tests
  created and removed their own disposable clones.

## Overall Assessment

The imported evidence closes every gap from attempt 005. The executable
evaluation, the regression and all other review items pass. One frozen proof
item is still missing. The committed record does not present the ordinary N
to N+1 path's step-1 evidence, which is the `candidate`, `check` and `diff`
output for the exact candidate against trusted N. AC09, and therefore AC13,
is not satisfied.

## Public Feedback

- `verification-feedback.md` and the canonical `verification-result.json`, both
  for attempt 006, in the spike directory.
