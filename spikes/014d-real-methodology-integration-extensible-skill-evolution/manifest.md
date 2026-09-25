# Spike 014d Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:81d5e907f36d8fbc9c4da443de805357bb8e6e69668c2f959127b3147161b66f`,
  execution `6f454b8a-2682-47e8-83b5-ae166dd9b352`, workflow
  `014d-real-methodology-integration-extensible-skill-evolution`).
- Input: draft `spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`,
  reviewed against `feat/spike-014` at
  `de3cc807e47a5d679607c5bebb1978e7d30b1291`.
- Result: succeeded; verdict **Ready after minor clarification** (`READY`). No
  blockers. Three material clarifications, all non-blocking:
  - M1: how the orchestrator instructions are adopted and tracked, and which
    runtime the observed run uses;
  - M2: what happens to a legitimately large eligible PASS given the
    64-artifact bound on `requestAction`;
  - M3: what the deterministic exercise of real skill bytes must assert.

  Three editorial notes (E1–E3).
- Outputs: `feedback.md`
  `sha256:71f48a8776afa94ffdcf8017af7722972a8bc0677ee004dde37044847fbd78bb`.
  No preliminary snapshot (passing verdict).
- Repository evidence inspected:
  - `AGENTS.md`;
  - `skills/{evaluator,orchestrator,outcome}/SKILL.md`;
  - `tools/archive-manifest.ts`;
  - `src/methodology-evolution.ts`;
  - `src/kernel/{trust,host,execution,resolver}.ts`;
  - `src/executors/{protocol,governed}.ts`;
  - legacy-bridge call sites;
  - the public 014c feedback and manifest format;
  - published `evaluation/` directory listings.
- Restricted evaluator material inspected: none.
- Checks:
  - SHA-256 comparison of the input against the host-bound identity;
  - Prettier check of `feedback.md`.
- Limitations: a sandbox approval restriction blocked one shell loop that
  counted archived evidence files. That estimate therefore comes from a glob
  listing.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Design Map

- Skill: `design-map` v3,
  `sha256:c4f645a2d383ad15173131c72768eca723d7d6a8528b49cd273981d234d559ea`
  (pinned bytes delivered by Role Grant
  `sha256:bdc61277a44148d060e28e5e41482981b29983344fb967c3a66b5c236d1cc7e3`,
  execution `440f5e20-424c-4f6a-bd48-335161ed755c`, workflow
  `014d-real-methodology-integration-extensible-skill-evolution`).
- Input: frozen `spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
  (`brief-frozen` at `047daacb683203bbd3ebb2bd808cff3404e60042`). The
  identity and committed provenance were verified.
- Result: succeeded. The map makes shared contracts C1–C9:
  - C1: trusted authority N;
  - C2: the promotion plan's path and format;
  - C3: the promotion action sequence;
  - C4: the 64-artifact bound stays unchanged;
  - C5: trust-promotion candidate binding;
  - C6: orchestrator provenance;
  - C7: what the deterministic real-skill exercise asserts;
  - C8: the public evidence location;
  - C9: the stable context prefix.

  It resolves readiness clarifications M1–M3 within the Design Map's bounded
  authority. No return to the brief was required.
- Outputs: `design-map.md`
  `sha256:f5193434bb20a2500466938305c38e835db7cd19575432af271bce47f3e2ef6f`
  (1584 words).
- Repository evidence inspected:
  - `spike.md`, `feedback.md` and `workflow.jsonl` (the freeze event only);
  - `methodologies/harness/{policy.json,trusted.jsonl}` and
    `contracts/evaluator-verify.json`;
  - `harness.project.json`;
  - `tools/archive-manifest.ts`;
  - `src/kernel/trust.ts`;
  - `ExecutionKernel.promote` in `src/kernel/execution.ts`;
  - `src/executors/{protocol,governed}.ts`;
  - `src/methodology-evolution.ts` (`promoteMethodology`, trusted-history
    types);
  - `src/methodologies/harness-public.ts`;
  - the inventory identity in `tools/evaluator-integrity.ts`;
  - `skills/{evaluator,orchestrator}/SKILL.md`.
- Restricted evaluator material inspected: none.
- Checks:
  - SHA-256 of the input compared against the host-bound identity and the
    committed `HEAD` blob;
  - Prettier check of `design-map.md`.
- Limitations: a sandbox approval restriction blocked a scripted summary of
  `workflow.jsonl`, so freeze evidence was read directly from its lines.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Evaluator Prepare

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:0ad0c85435e6088f8b5954bbd708c6396957cffca09f10143d9dd80d8f71567c`,
  execution `ea181833-1294-446a-9509-c97af2e78cc8`, workflow
  `014d-real-methodology-integration-extensible-skill-evolution`), mode
  `prepare`, under trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Inputs: frozen `spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
  (committed at `047daac`) and frozen `design-map.md`
  `sha256:f5193434bb20a2500466938305c38e835db7cd19575432af271bce47f3e2ef6f`
  (committed at `eeae1f5`). The working-tree and committed bytes match the
  host-bound identities. The pre-implementation baseline is `eeae1f5`.
- Result: **succeeded**.
  - Private evaluator revision `001` is frozen with identity
    `sha256:d03975365d8e1a624854a305d494c7018125849ea560070be4c03fff56cc80f5`.
  - The pre-freeze integrity validation passed with 0 diagnostics.
  - Every executable case passed under controlled compliant conditions and
    failed, for its intended reason, under controlled non-compliant
    conditions. No candidate implementation existed or was executed.
- Outputs:
  - `eval-requirements.md`
    `sha256:1ecb9187bc13f88249b25235daa6102833b080f7cdf446c52fdf3bfd739b06e4`.
    It has 6 testability requirements, 6 evaluator assumptions and no
    blocking questions.
  - `coverage-map.json`
    `sha256:b0af4e7de325c23ae198d7b0fe476f196b2cb5f5fee9a241d5f6fb2d222f3c8c`.
    It has 13 criterion records (AC01–AC13) and a readiness attestation
    `integrityValidation: PASS`, with private inventory
    `sha256:c747eac6b74e3d6e4308ddbd840bf0f9b08f7443a7916fc6e4236d18af7d98ea`
    and validator result binding
    `sha256:4d78f33e112a46532b6e3840ce06b7ea4cf6544a60bf2d12cd31376fa5cdce12`.
- Safe aggregates:
  - 11 evidence procedures: 5 executable, plus public regression, fidelity
    matrix, live evidence, orchestrator review, code review and
    methodology-evolution evidence.
  - 48 mandatory cases, 8 of them executable.
- Checks:
  - The repository's `prepared-coverage` validator (`validatePreparedMap`)
    accepts `coverage-map.json`.
  - Prettier checks pass for both public artifacts.
  - The public map was scanned for private paths or case names; none found.
- Restricted evaluator material disclosed: none.
- Limitations: sandbox approval restrictions blocked a few compound shell
  forms. Equivalent direct commands were used, and the evaluation substance
  was unaffected.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Design Map (after pre-implementation recovery)

- Skill: `design-map` v3,
  `sha256:c4f645a2d383ad15173131c72768eca723d7d6a8528b49cd273981d234d559ea`
  (pinned bytes delivered by Role Grant
  `sha256:ce97ba44520aadcd518a90f46a41be68afbd75c5a8d5446f412b811a71cc04f1`,
  execution `d0231f1e-3464-45cf-be8c-448e9ed069d2`, Workflow Grant
  `f5807562-c7e1-4aed-8ba6-6f5cf6d3ef0b`, workflow
  `014d-real-methodology-integration-extensible-skill-evolution`), under
  trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Context: recovery `d86c645e-d06c-4717-906e-439c0dfb7d83` invalidated the Run
  002 Design Map and the dependent Run 003 Evaluator Prepare. Both entries above
  are preserved as history and are no longer current authority.
- Input: frozen `spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
  (`brief-frozen` at `047daacb683203bbd3ebb2bd808cff3404e60042`). The identity
  and committed provenance were verified at that freeze commit and at `HEAD`
  `d6f48374be1361c0d01e377147e9a1ffc7abce4c`.
- Result: **succeeded**. The map makes shared contracts C1–C9, the same set as
  the invalidated map. Changes:
  - C4, C6 and C7 now apply the canonical human response
    `8545a0d6-a5ba-4943-bb20-e334ec356a56` to request
    `680fdfec-ce7f-4069-9753-309b11a25d86`:
    - C4: the promotion artifact bound is now a single exported definition B.
      It stays 64 only if representative complete evaluator archives fit
      without truncation; otherwise that one definition is raised. There is
      still no split, bundling or truncation.
    - C6: the orchestrator stays outside trusted methodology and is a test
      subject only. It is adopted with N+1 only after final human acceptance.
      Its exact runtime and instruction identity are recorded; the runtime
      list was removed.
    - C7: deterministic checks support AC01 but do not replace real-role or
      real-provider integration evidence.
  - C1 and C8 have small clarifications.

  No return to the brief was required.
- Outputs: `design-map.md`
  `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`
  (1791 words).
- Repository evidence inspected:
  - `spike.md`, the invalidated `design-map.md`, `manifest.md`, and
    `host-maintenance-00{1,2}.md`;
  - the `workflow.jsonl` freeze, human-request, human-response, recovery and
    grant events;
  - `methodologies/harness/trusted.jsonl`;
  - `src/executors/protocol.ts` and `tools/archive-manifest.ts` at `HEAD`;
  - `git ls-files` counts of every committed `spikes/*/evaluation/` archive.
    The largest are 38 files (005) and 34 files (013a).
- Restricted evaluator material inspected: none.
- Checks:
  - SHA-256 of the input compared against the host-bound identity and the
    committed blobs;
  - Prettier check of `design-map.md`.
- Limitations:
  - The size of this spike's own private evaluator archive cannot be seen from
    the public role, so C4 turns the human's retention condition into required
    evidence rather than asserting it.
  - A sandbox approval restriction blocked one shell loop that counted archive
    files. An equivalent `git ls-files | uniq -c` was used instead.
  - The working tree contains uncommitted changes that this role neither made
    nor used as authority, including `tools/archive-manifest.ts`, `src/**` and
    `skills/**`. They are excluded from this checkpoint.
- Measurement cutoff: immediately before this manifest update.

## Run 005 — Evaluator Prepare (after pre-implementation recovery)

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:2c588152332ec5091d6b07e211d7ca3c56a8fd5db8567b331756ba63245527bd`,
  execution `1f5d8020-262c-499e-a651-cace0b9af4c9`, workflow
  `014d-real-methodology-integration-extensible-skill-evolution`), mode
  `prepare`, under trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Context: recovery `d86c645e-d06c-4717-906e-439c0dfb7d83` invalidated the Run
  003 evaluator revision `001` together with its Design Map. Revision `001` is
  preserved privately, unchanged. It was never used by a verification attempt.
- Inputs:
  - frozen `spike.md`
    `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
    (committed at `047daac`);
  - frozen `design-map.md`
    `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`
    (committed at `a429ecd`).

  Both working-tree and committed bytes match the host-bound identities. The
  pre-implementation baseline is `a429ecd`.
- Result: **succeeded**.
  - Private evaluator revision `002` is frozen with identity
    `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`.
  - The pre-freeze integrity validation passed with 0 diagnostics.
  - Every executable case passed under controlled compliant conditions and
    failed, for its intended reason, under controlled non-compliant
    conditions. All controls ran in disposable clones of the committed
    baseline. No candidate implementation existed or was executed.
- Changes from revision `001` follow only the replacement Design Map:
  - C4: one artifact bound B, the B + 1 oversized case, and the
    representative-archive record;
  - C6: orchestrator identity and history, test-subject-only use, and no place
    in trusted methodology;
  - C7: deterministic evidence never replaces the real proofs.
- Outputs:
  - `eval-requirements.md`
    `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`.
    It has 8 testability requirements (TR7 and TR8 are new), 6 evaluator
    assumptions and no blocking questions.
  - `coverage-map.json`
    `sha256:a7abb9d197d50154c113fc9a6f85b639fdbce1c1cd912d15ff6990e05e8c349b`.
    It has 13 criterion records (AC01–AC13) and a readiness attestation
    `integrityValidation: PASS`, with private inventory
    `sha256:3b53050650f05741cb3ef745a7e23be54d8d5e8126c8439a7bba4d85ddb3d484`
    and validator result binding
    `sha256:24b66965dd4e286abcef876bc411e08311e1e0cb605e311060ce75b1e58f8de0`.
- Safe aggregates:
  - 12 evidence procedures: 6 executable, plus public regression, fidelity
    matrix, live evidence, orchestrator review, code review and
    methodology-evolution evidence.
  - 52 mandatory cases, 11 of them executable.
- Checks:
  - The repository's `prepared-coverage` validator (`validatePreparedMap`, at
    the committed baseline) accepts `coverage-map.json`.
  - Prettier checks pass for both public artifacts.
  - Both public artifacts were scanned for private paths, file names or case
    names; none found.
- Restricted evaluator material disclosed: none.
- Limitations:
  - Sandbox approval restrictions blocked some compound shell forms.
    Equivalent direct commands were used, and the evaluation substance was
    unaffected.
  - The working tree contains uncommitted changes that this role neither made
    nor evaluated. They are excluded from this checkpoint.
- Measurement cutoff: immediately before this manifest update.

## Run 006 — Implementation (attempt 1)

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes delivered by Role Grant
  `sha256:8827bede35784e6eebe7311d5316c7546930b2f00f5d0dca7929f1ca1584050c`,
  execution `cd96aa6f-1fdc-4521-9238-4b45ff1c9e22`, Workflow Grant
  `3223abe5-dd9e-4e58-8fcc-9df8f80c20b9`, workflow
  `014d-real-methodology-integration-extensible-skill-evolution`), under
  trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Context:
  - The predecessor implementation execution
    `bdfa50ec-a7f9-467d-925e-d43551d5dc68` changed no files. It asked the
    human request `4fef0137-e8f7-4bfd-9ba9-ed7951a0273a` and then ended with
    no semantic result.
  - This run followed the canonical response
    `b90a79da-738b-4df5-ac8b-e1e65c589a1a`: preserve the current work and the
    authorized maintenance, inventory first, finish the deterministic work,
    record the real-provider proofs as outstanding, and invoke no provider.
- Inputs. The working-tree and committed bytes match the host-bound
  identities:
  - frozen `spike.md`
    `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`;
  - frozen `design-map.md`
    `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`;
  - `coverage-map.json`
    `sha256:a7abb9d197d50154c113fc9a6f85b639fdbce1c1cd912d15ff6990e05e8c349b`;
  - `eval-requirements.md`
    `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`.

  No implementation feedback was bound. The base is `HEAD`
  `0b550644544f98571fbbade9af2234bdd70cd98d`.
- Result: **succeeded** for the deterministic implementation. The real-provider
  proofs for AC02, AC03, AC05 and AC13 are **outstanding** and were not run
  (`evidence/real-provider-runs.md`).
- Starting point:
  - `evidence/working-tree-inventory.md` inventories the preserved tree: the
    unattributed pre-recovery draft (probably execution `49e9dfe9`),
    authorized maintenance 001 and 002, and the unrelated paths that were left
    out.
  - The draft was reviewed against the replacement Design Map, then completed
    and reconciled.
- Changes made in this run:
  - **C4.** One exported bound B, `MAX_ACTION_ARTIFACTS` = 64 in
    `src/executors/protocol.ts`. It is used by the schema, request parsing,
    the host promotion check and the archive utility. The oversized cases use
    B + 1. There is a representative-archive retention test (38 mappings, at
    least the largest committed archive), and `evidence/promotion-bound.md`
    records it.
  - **Policy.** A NOT_READY readiness verdict is now a human gate. Before, an
    unchanged brief was re-reviewed automatically.
  - **C6.** The orchestrator provenance wording now covers acceptance naming
    the exact identity and the fields recorded for observed runs.
  - **Evaluator skill.** It refers to bound B instead of a literal.
  - **Legacy tests.** They expect implementation skill version 5.
  - **§7.** `test/legacy-bridges.test.ts` statically guards the retired
    bridges.
  - **TR6.** A test checks that the evidence skill identities recompute.
  - **C8 evidence.** `fidelity-matrix.md`, `legacy-classification.md`,
    `promotion-bound.md`, `real-provider-runs.md`, `extension-seams.md` and
    `working-tree-inventory.md` under `evidence/`.
- Candidate content: 45 paths plus this manifest; 5594 insertions and 360
  deletions before this entry. `methodologies/harness/trusted.jsonl` and the
  014c files are unchanged.
- Checks:
  - `npm run typecheck` passes.
  - `eslint .` passes.
  - Prettier passes for every readable file. Root sandbox device placeholders
    are unreadable and are not repository content.
  - `node --test test/*.test.ts` on the working tree: 173 tests, 170 pass and
    3 fail. The 3 are legacy `workflow-run.integration` bootstrap-provenance
    tests: "canonical evaluator delegation …", "repository fixtures resolve
    from candidate bytes …" and "a fixture whose declared permissionProfile
    disagrees …". They pin the evaluator skill at `git rev-parse HEAD` but read
    the working-tree bytes, so they can pass only once the candidate is
    committed.
  - Baseline: a clean worktree at `HEAD` passed 147 of 147.
- Restricted evaluator material inspected: none.
- Limitations:
  - No provider CLI or credentials were available, so no real-provider or
    orchestrator run happened.
  - Sandbox approval restrictions blocked several compound shell forms and a
    scratch-worktree commit. Equivalent direct commands were used.
- Measurement cutoff: immediately before this manifest update.

## Run 007 — Evaluator Verify (attempt 004)

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:c48afa1bf3908c5cce4facc8563e0066368cb4443af32c13c09c41b685ad7747`,
  execution `37ea25ba-f832-4215-8815-eed9372efcdd`), mode `verify`, under
  trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Allocation: host attempt 4, cycle `001`. Earlier attempts:
  - attempt 1 reached a private FAIL, but its public checkpoint was lost to a
    provider rate limit;
  - attempts 2 and 3 ended at the rate limit before evaluation.
- Candidate: `0e2789c4e2040a3bafb6d173506f65be66d44956`, evaluated from a clean
  clone. This is the same candidate as attempt 1.
- Evaluator revision `002`,
  `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`.
  All frozen public and private identities were recomputed and match. There
  is no drift.
- Result: **FAIL**, classification `IMPLEMENTATION_FAILURE`.
  - Executable cases passed 11 of 11.
  - `npm run check` on a clean offline clone exited 0, with 173 of 173 tests
    passing.
  - The required committed evidence (EA1) is absent: the real-provider role
    run, the AC05 candidate-evaluator fixture promotion and the observed
    orchestrator run. The C4 fixture count is also absent.
  - Criteria: 6 not satisfied and 7 not adjudicated.
- Public artifacts: `verification-result.json` and `verification-feedback.md`.
- Host actions requested: none. There is no promotion after FAIL.
- Measurement cutoff: immediately before this manifest update.
