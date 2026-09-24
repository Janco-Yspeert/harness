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
