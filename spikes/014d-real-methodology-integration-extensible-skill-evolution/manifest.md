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
