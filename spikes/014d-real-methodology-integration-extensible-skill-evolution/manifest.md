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

## Run 008 — Implementation (retry: promotion-to-As-Built repair)

- Skill: `implementation` contract version 4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes from Role Grant
  `sha256:e2a7f7907dab3eab502eb96729b0e10b4462eb689092e0ba220ecd9a5a270db4`,
  execution `803512fd-879a-467a-9020-0bfb67186d6c`), under trusted N
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
- Authority: human root `e3cf32b7-3940-4d77-855e-c4813aa84e5d`, which allows
  one bounded promotion-to-As-Built repair and excludes R3. The scope was set
  by canonical human response `f8d9bf62-0612-4189-98aa-dfbb16584a23` to
  request `3639624d-15aa-4603-8067-8bb6fe0e7cf7`.
- Inputs, all recomputed and matching:
  - `spike.md`
    `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`;
  - `design-map.md`
    `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`;
  - `coverage-map.json`
    `sha256:a7abb9d197d50154c113fc9a6f85b639fdbce1c1cd912d15ff6990e05e8c349b`;
  - `eval-requirements.md`
    `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`;
  - implementation feedback `verification-result.json`
    `sha256:5da738d9f473958f5eea72d7df4e9692a9604030e8a01bd7b27750ae62de3820`
    (`IMPLEMENTATION_FAILURE`, committed in `0c6500a`).

  The base is `HEAD` `0c6500a`.
- Diagnosis, from the human response: the host's promotion action writes
  `evaluation/promotion.json` and records `promotion-recorded`, but it does
  not commit the file. Candidate As-Built v4 required an already-committed
  file, so it blocked.
- Changes:
  - `skills/as-built/SKILL.md` (candidate v4, not yet trusted; identity now
    `sha256:dc3c422691fb36a292b49db411ff9aefd5199f8602b73ef87428fd0a09ea534b`):
    - As-Built checks that the host file's identity equals the bound
      promotion identity.
    - If the file is missing or does not match, the result stays `blocked`.
    - If it matches and is already committed, it is used as is.
    - If it matches and is untracked, As-Built stages only that path with
      simple individual Git commands and commits it as a separate checkpoint.
      The ordinary `as-built.md` and `manifest.md` checkpoint follows.
  - `test/skill-fidelity.test.ts`:
    - The scripted As-Built path now commits the promotion record first.
    - The end-to-end test checks four things. The promotion commit contains
      only `evaluation/promotion.json`. The committed bytes match
      `promotionIdentity`. The other promoted files stay untracked. The
      As-Built checkpoint directly follows the promotion commit. The existing
      human-gate acceptance then leads to `outcome-recorded`.
    - A new test covers the repaired skill wording and the blocked path. In
      that path there is no `as-built-recorded`, the host file is unchanged
      and untracked, nothing is staged, acceptance is refused and no Outcome
      grant is issued.
  - Evidence: the As-Built row and a repair note in
    `evidence/real-provider-runs.md`, and the As-Built row in
    `evidence/fidelity-matrix.md`.
  - Unchanged: the host, provider profiles, evaluator authority, fixture
    evidence and R3.
- Result: **succeeded** for this bounded repair. The real-provider proofs R1,
  R2 and R3 (AC02, AC03, AC05 and AC13, plus the C4 fixture count) remain
  **outstanding**. None is imported, claimed or fabricated here.
- Candidate content: 4 paths plus this manifest; 134 insertions and 8
  deletions before this entry.
- Checks, on the working tree:
  - `tsc --noEmit` passes.
  - ESLint passes.
  - Prettier passes for this repair's files.
  - `node --test test/skill-fidelity.test.ts`: 12 of 12 pass.
  - `npm test`: 174 of 174 pass.
- Checks not run cleanly:
  - `prettier --check .` cannot read root sandbox placeholder files.
  - The working tree also holds the uncommitted, separately authorized
    host-maintenance-003 change (`src/kernel/{execution,resolver}.ts`,
    `test/kernel.test.ts`, `host-maintenance-003.md`). It is left unstaged and
    untouched. It causes the only working-tree Prettier warning
    (`test/kernel.test.ts`).
  - A clean detached worktree of the first checkpoint of this content, before
    this correction to the entry, passed on its own: `tsc --noEmit`,
    `eslint .`, `prettier --check .` and `node --test test/*.test.ts` with 174
    of 174 tests. The new As-Built test accounts for the change from the
    previous 173 tests.
  - No start baseline was captured.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 009 — Implementation (completion of the promotion-to-As-Built repair)

- Skill: `implementation` contract version 4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes from Role Grant
  `sha256:0f843a37ccc1286b455f84fc3bfadfc0ccbca43c5640c1bff8b47ba5b1a82a78`,
  execution `a31d8ea3-e21b-46fc-993c-6c7932c1b723`), under trusted N
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
- Authority: human root `a1960899-88d4-4ea4-9c20-6df6161f4a8d` (one use). It
  allows only adding the missing deterministic mismatched-promotion-identity
  regression to the committed repair, running the relevant checks and
  committing it. It excludes R3 fixture execution, provider-profile changes,
  evaluator actions and workflow advancement.
- Inputs, all recomputed and matching:
  - `spike.md`
    `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`;
  - `design-map.md`
    `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`;
  - `coverage-map.json`
    `sha256:a7abb9d197d50154c113fc9a6f85b639fdbce1c1cd912d15ff6990e05e8c349b`;
  - `eval-requirements.md`
    `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`.

  The host bound no implementation feedback to this execution. The base is
  `HEAD` `a396cabec8e5153cc4c5607a4937a637bce31971`.
- Changes: `test/skill-fidelity.test.ts` gains one test, "014d AC07: As-Built
  bound to a promotion identity that the host record no longer matches stays
  blocked and commits nothing". It works like this:
  - The first bounded grant (`maxAllocations: 5`) stops after
    `promotion-recorded`, before any As-Built allocation.
  - The test then changes the untracked host `evaluation/promotion.json` so
    that its `sha256` differs from the recorded `promotionIdentity`.
  - A second grant allocates As-Built. Its Role Grant binds the recorded
    identity, not the changed bytes.
  - The scripted As-Built submits `blocked`. The test asserts: no
    `as-built-recorded`; exactly one `promotion-recorded`; the changed bytes
    left as found; nothing tracked, staged or committed under `evaluation/`;
    acceptance refused; and no Outcome grant.
- Unchanged: `skills/as-built/SKILL.md`, the host, provider profiles,
  evaluator authority, fixture evidence and R1–R3.
- Result: **succeeded** for this bounded completion. The real-provider proofs
  R1, R2 and R3 (AC02, AC03, AC05 and AC13, plus the C4 fixture count) remain
  **outstanding**. None is claimed or fabricated here.
- Candidate content: 1 path plus this manifest; 85 insertions before this
  entry.
- Checks, on the working tree:
  - `tsc --noEmit` passes.
  - `eslint .` passes.
  - Prettier passes for `test/skill-fidelity.test.ts`.
  - `node --test test/skill-fidelity.test.ts`: 13 of 13 pass.
  - `npm test`: 175 of 175 pass.
- Checks not run cleanly:
  - `npm run check` stops at `prettier --check .`. The sandbox cannot read the
    root placeholder files. Prettier also warns on `test/kernel.test.ts`,
    which is part of the uncommitted host-maintenance-003 change
    (`src/kernel/{execution,resolver}.ts`, `test/kernel.test.ts`,
    `host-maintenance-003.md`). That change is not part of this implementation
    work, so it is left unstaged and untouched. The 175-test count includes
    its kernel test.
  - No clean-worktree run of this checkpoint was made.
  - No start baseline was captured.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 010 — Implementation (consume committed repaired-R3 fixture evidence)

- Skill: `implementation` contract version 4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes from Role Grant
  `sha256:7cc5f939b43380fe953ddab0f0c47102221995f8d5ca9469c2d7474fd16b2a02`,
  execution `e65e8e83-1530-4f13-b0f0-88dfca7856c8`, predecessor
  `444a6def-d91b-4ba9-aa9b-e6fc6ec7f62b`), under trusted N
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
- Authority: human root `7d18576c-0b7c-4113-9a8b-56b78cfa959d` (one use),
  issued after the administrative import commit `01875f3`. It allows
  consuming the committed repaired-R3 fixture evidence, checking R1/R2/R3
  completion without re-running providers, updating the public evidence and
  manifest, running the checks and creating one checkpoint. It excludes
  fixture mutation, direct provider invocation, evaluator-private access,
  methodology promotion and profile changes.
- Inputs, all recomputed and matching:
  - `spike.md`
    `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`;
  - `design-map.md`
    `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`;
  - `coverage-map.json`
    `sha256:a7abb9d197d50154c113fc9a6f85b639fdbce1c1cd912d15ff6990e05e8c349b`;
  - `eval-requirements.md`
    `sha256:c47e49c8c478ff4c77fdf908eb8105d9c2d7ce6c728f9d594af845054d88691a`;
  - `evidence/r3-repaired-fixture/canonical-observations.md`
    `sha256:6e2d29403221605209f177b3bc1f3a57403c859b478a2715e18b194266c82127`,
    matching the destination identity in `import-manifest.md`;
  - `evidence/r3-repaired-fixture/import-manifest.md`
    `sha256:970ab701457d7190aae55edddd4ae77f01d816afcf3c758959098f845f4f0a5b`.

  The host bound no implementation feedback to this execution. The base is
  `HEAD` `01875f337b355f5cc08f98c1cc3e6f245f4f94f3`. The fixture commit
  `82ce3c4…` and fixture candidate `2ff9921…` are not in this repository's
  object store and were not accessed.
- Cross-checks against committed bytes: the orchestrator, evaluator and
  As-Built identities named in the extract equal the committed candidate
  bytes. The orchestrator also equals
  `git:b68ad3c5d35ba3415849073ae8206953cb807e97:skills/orchestrator/SKILL.md`.
- Changes:
  - `evidence/real-provider-runs.md`: the status changes from OUTSTANDING to
    recorded. The Results table maps R1, R2 and R3 to the extract's event ids,
    identities, runtime, model and host results. A new section lists what the
    extract does not show: the R1 role skill identities and brief artifact
    identity, R2 byte recomputation and a separate trust-root proof, R3
    blocker reporting, and the R3 initiating request text. The candidate
    identity table is unchanged.
  - `evidence/promotion-bound.md`: records 3 mappings for the AC05 fixture
    archive, within B = 64. B is unchanged.
  - Unchanged: source, skills, tests, the host, provider profiles, evaluator
    authority, the imported fixture evidence, execution `444a6def` and
    host-maintenance records 001–003.
- Result: **succeeded** for this bounded evidence consumption. R1 and R2 are
  recorded, and R3 is recorded with the gaps above. Whether this satisfies
  AC02, AC03, AC05, AC13 and C4 is for independent verification to decide.
  It is not claimed here.
- Candidate content: 2 paths plus this manifest; 64 insertions and 21
  deletions before this entry.
- Checks, on the working tree:
  - `tsc --noEmit` passes.
  - `eslint .` passes.
  - `npm test`: 175 of 175 pass, including "014d TR6: evidence skill
    identities and contract versions recompute from committed bytes".
- Checks not run cleanly:
  - `prettier --check .` cannot read the root sandbox placeholder files.
    `prettier --check src test tools skills docs methodologies` warns only on
    `test/kernel.test.ts`, which belongs to the uncommitted
    host-maintenance-003 change. That change is left unstaged and untouched,
    and the 175-test count includes its kernel test. `spikes/` is
    Prettier-ignored.
  - No clean-worktree run of this checkpoint was made.
  - No start baseline was captured.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 011 — Evaluator Verify (attempt 005)

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:56db2e9d3351d6de8493b3debb1517a761eee936f12d4df941f5f5ffc9649de0`,
  execution `89207741-2ec2-435f-8223-26fb904072a0`), mode `verify`, under
  trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Allocation: host attempt 5, cycle `001` (`verification-allocated`
  `c7d722a7-a6d4-4760-a4ac-9417aabe60e7`).
- Candidate: `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`, evaluated from a clean
  clone. The shared working tree, which holds the uncommitted host maintenance
  003, was not evaluated.
- Evaluator revision `002`,
  `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`.
  All frozen public and private identities were recomputed and match. There
  is no drift.
- Result: **FAIL**, classification `IMPLEMENTATION_FAILURE`.
  - Executable cases passed 11 of 11.
  - `npm run check` on a clean offline clone exited 0, with 175 of 175 tests
    passing.
  - The new committed real-run evidence closes most of attempt 004's gaps. The
    handoff itself declares four frozen proof items as gaps, and the evaluator
    confirmed each from committed bytes:
    - blocker reporting in the observed orchestrator run (AC03);
    - default selection by an ordinary request (AC02);
    - the fixture's explicitly initialized trust root (AC05);
    - the fixture result's `promotionPlan` binding to the plan bytes (AC04,
      AC05).
  - Criteria: 5 not satisfied and 8 not adjudicated.
- Public artifacts: `verification-result.json` and `verification-feedback.md`.
- Host actions requested: none. There is no promotion after FAIL.
- Measurement cutoff: immediately before this manifest update.

## Run 012 — Evaluator Verify (attempt 006)

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:8a8517ba781b84da52a69f65fe24e72bd5707da2e17596472d7b1ac7b0e58c3d`,
  execution `2e924108-802f-4c7a-a91d-64754a50af10`), mode `verify`, under
  trusted N (kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`).
- Allocation: host attempt 6, cycle `001` (`verification-allocated`
  `736eeaf7-27a2-4f96-92bf-9ce71fa7d5cc`). Root authority `9e7060e6`
  authorized this single fresh retry after the public R3 evidence imports.
- Candidate: `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`, unchanged since
  attempt 005 and evaluated from a clean clone.
  - The public-evidence review also read the docs-only evidence imports
    committed after the candidate, up to `f62e4ed`.
  - The shared working tree, which holds the uncommitted host maintenance
    003, was not evaluated.
- Evaluator revision `002`,
  `sha256:386ed11bdd491aea3262122e684fd106798e07bc5df3d34d95d57aa86c171319`.
  All frozen public and private identities were recomputed and match. There
  is no drift.
- Result: **FAIL**, classification `IMPLEMENTATION_FAILURE`.
  - Executable cases passed 11 of 11.
  - `npm run check` on a clean offline clone exited 0, with 175 of 175 tests
    passing.
  - The imported evidence closes all four gaps from attempt 005.
  - Every procedure was adjudicated to decision depth. One frozen proof item
    is missing: brief §4 step 1 asks for the `candidate`, `check` and `diff`
    evidence for the exact candidate against trusted N, and none is
    committed (AC09).
  - Criteria: 11 satisfied and 2 not satisfied (AC09, and AC13 as a
    consequence).
- Public artifacts: `verification-result.json` and `verification-feedback.md`.
- Host actions requested: none. There is no promotion after FAIL.
- Measurement cutoff: immediately before this manifest update.
