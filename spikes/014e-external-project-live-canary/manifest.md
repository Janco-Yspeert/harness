# Spike 014e Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v5,
  `sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`
  (pinned bytes delivered by Role Grant
  `sha256:c99a176fe94dea86b752f0241f63dbf619cbd233c0300c28f670a36059fceba8`,
  execution `d34baca5-5319-4edc-bb31-c467c177a8c0`, workflow
  `014e-external-project-live-canary`).
- Input: draft `spike.md`
  `sha256:949579299e7068fb3f1f25f90326a49c54f09749585706a5e783a899e302a54d`,
  reviewed against `feat/spike-014` at
  `e20253b15bc5c3b2db57004d3922d808672471fa`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`).
  - One blocker:
    - B1: Track B has no execution owner, authority or position in the 014e
      lifecycle, and the 014e Evaluator Verify candidate/evidence binding is
      undefined.
  - Four material clarifications:
    - M1: freeze-before-Design-Map ordering;
    - M2: provider-independent read denial and Codex substitution;
    - M3: model/effort preference vs. exact constraint;
    - M4: what the 10-allocation bound counts.
  - Two editorial notes (E1–E2).
- Outputs:
  - `feedback.md`
    `sha256:cc239bef9a4a612ab3b444e0fe8fa8bb2217cc4e86236183ec270e42831f44c9`;
  - preliminary snapshot `preliminary/001/`, containing `spike.md`
    `sha256:949579299e7068fb3f1f25f90326a49c54f09749585706a5e783a899e302a54d`
    and `feedback.md`
    `sha256:cc239bef9a4a612ab3b444e0fe8fa8bb2217cc4e86236183ec270e42831f44c9`.
- Repository evidence inspected:
  - `AGENTS.md`;
  - `harness.project.json`;
  - `methodologies/harness/{trusted.jsonl,policy.json}` (content search only
    for the policy);
  - `src/kernel/{configuration,trust,resolver}.ts`;
  - `src/executors/adapters.ts`;
  - `skills/{implementation,evaluator}/SKILL.md` (selected sections);
  - the 014d `as-built.md`, `host-maintenance-003.md` and `manifest.md`;
  - the Git log.
- Restricted evaluator material inspected: none. The Stockdif repositories
  are outside the granted workspace and were not inspected.
- Checks:
  - SHA-256 comparison of the input against the host-bound identity (match);
  - Prettier check of `feedback.md` (pass).

## Run 002 — Brief Readiness

- Skill: `brief-readiness` v5,
  `sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`
  (pinned bytes delivered by Role Grant
  `sha256:ab121bca24313e337eb5ddf6bfee405b1cc039afa761f2eba5ad12aacd2d7213`,
  execution `2f57f604-96bb-4394-a6c6-c9c62f65e577`, workflow
  `014e-external-project-live-canary`).
- Input: revised `spike.md`
  `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`,
  reviewed against `feat/spike-014` at
  `ec42cef7820d3274b3dffaf907798a6db2c43e22`.
- Result: succeeded; verdict **Ready after minor clarification** (`READY`).
  - Run 001 findings B1, M1–M4 and E1–E2 resolved.
  - Two non-blocking material clarifications:
    - C1: where the H1E identity is recorded, given that the Evaluator Verify
      grant binds only the `implementation-handoff` candidate;
    - C2: how Track A is held between H1 handoff and Evaluator Verify
      allocation.
  - Two editorial notes (E1–E2).
- Outputs: `feedback.md`
  `sha256:ab843614e61ab2a8144c26e6ceab7a9fae66c11be52635e0fcf0bc547f946d26`.
  No preliminary snapshot (passing verdict).
- Repository evidence inspected:
  - `AGENTS.md` (supervisor identity, autonomous orchestration);
  - `methodologies/harness/policy.json` (evaluator-verify, human decisions,
    gates);
  - `methodologies/harness/contracts/evaluator-verify.json`;
  - `src/kernel/execution.ts` (publication and promotion checks);
  - `skills/orchestrator/SKILL.md` (stop rules, content search);
  - run 001 `feedback.md` and `manifest.md`;
  - the Git log and diff `e20253b..ec42cef`.
- Restricted evaluator material inspected: none. The Stockdif repositories
  are outside the granted workspace and were not inspected.
- Checks:
  - SHA-256 comparison of the input against the host-bound identity (match);
  - Prettier check of `feedback.md` (pass).

## Run 003 — Design Map

- Skill: `design-map` v4,
  `sha256:238af12bbee012a784f234f2aaab9d4e783a58ec1b7c0257937bc54a16010136`
  (pinned bytes delivered by Role Grant
  `sha256:02efc65ad73b98d1541f6ed1cb85dd97badaec312000053162584dd665f49dc0`,
  execution `7b105acd-4304-49f0-8839-5f663dfb899a`, workflow
  `014e-external-project-live-canary`).
- Input: frozen `spike.md`
  `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`
  (committed at `ec42cef7820d3274b3dffaf907798a6db2c43e22`), mapped against
  `feat/spike-014` at `a1158637740a2960f2d7be4b05c58ee9944e3b52`.
- Result: succeeded.
- Output: `design-map.md`
  `sha256:997690bb15a9436beb08fc547881b005b80ce3d010591488dd21c490a40f97c0`.
  - Contracts D1–D8:
    - trusted authority;
    - `methodologyRoot` configuration seam;
    - grant source and runtime binding;
    - host-owned bubblewrap containment at the provider spawn seam;
    - origin identity and no publication;
    - evidence index;
    - structural H1E binding (resolves readiness C1);
    - Verify hold (resolves readiness C2).
  - Readiness note E1 is resolved in D6.
- Repository evidence inspected:
  - `harness.project.json`;
  - `methodologies/harness/{policy.json,trusted.jsonl,contracts/}` (content
    search);
  - `src/kernel/{configuration,trust,host,execution,model}.ts` (selected
    sections);
  - `src/executors/adapters.ts`;
  - `AGENTS.md` (supervisor and orchestration sections);
  - the 014d `design-map.md`;
  - run 002 `feedback.md`.
- Host tool observations: `bwrap` 0.9.0 is installed; `codex-cli` 0.153.1 is
  installed; `claude` was not found on the worker PATH. Nested-namespace
  viability was not exercised.
- Restricted evaluator material inspected: none. The Stockdif repositories were
  not inspected.
- Checks:
  - SHA-256 comparison of the input against the host-bound identity (match);
  - Prettier check of `design-map.md` (pass).

## Run 004 — Evaluator Prepare

- Skill: `evaluator` v14, mode `prepare`,
  `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`
  (pinned bytes delivered by Role Grant
  `sha256:81333c45cfb61cfb8facb7cd72ae8676db5d80c3c01e9144349597774cffeacb`,
  execution `cc074408-05ec-48a7-af08-9b65c6c38f57`, workflow
  `014e-external-project-live-canary`).
- Inputs:
  - frozen `spike.md`
    `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`
    (committed at `ec42cef7820d3274b3dffaf907798a6db2c43e22`);
  - frozen `design-map.md`
    `sha256:997690bb15a9436beb08fc547881b005b80ce3d010591488dd21c490a40f97c0`
    (committed at `d365138b49d1991d5c6d320e132c712da6517c7f`).
- Result: succeeded. Private evaluator revision `001` is frozen, with identity
  `sha256:8ef73bd723d0471bee546f704c376554c0a1fca8957a298620c9b64e77d95623`.
  No blocking questions.
- Outputs:
  - `eval-requirements.md`
    `sha256:186a2cc1809fab3561aa1bd523123d511051bc66386141328f32a8251160b3ef`
    (seven testability requirements and six evaluator assumptions);
  - `coverage-map.json`: one record for each of AC01–AC10; the readiness
    attestation has private inventory
    `sha256:d024b7a2fd3dffb682121f797c7f4c34b0ba07a03ae376cf9d8b5687e3fe44e6`
    and integrity validation `PASS`.
- Safe aggregates:
  - 10 criterion records;
  - 9 evidence procedures: 6 executable and 3 public-evidence reviews (public
    regressions, design conformance and live-canary evidence);
  - 18 files in the private freeze inventory.
- Pre-freeze validation:
  - The repository's `evaluator-integrity` structural validation passed with
    0 diagnostics, plus bundle-specific consistency checks.
  - Executable cases were exercised against controlled positive and negative
    conditions: the pre-implementation baseline and evaluator-authored control
    commits that are not candidates. No candidate implementation existed or was
    run.
- Restricted evaluator material: kept in the private evaluation workspace. None
  of it is in this checkpoint. The Stockdif repositories were not inspected.
- Measurements: wall-clock time and token usage are unknown (not exposed to the
  worker).
- Checks:
  - SHA-256 comparison of both inputs against the host-bound identities
    (match);
  - the repository `prepared-coverage` validator on `coverage-map.json` (pass);
  - Prettier check of the public artifacts (pass).
