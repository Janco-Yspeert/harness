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

## Run 005 — Implementation (Track A, candidate H1)

- Skill: `implementation` v5,
  `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
  (pinned bytes delivered by Role Grant
  `sha256:2d8b5d884538f0234f7367c87b37e9fdc723de15419b14150d64a4929a2300a7`,
  execution `20db9184-5c47-4d67-87ad-edf2c66edb2a`, workflow
  `014e-external-project-live-canary`).
- Inputs (SHA-256 matched against the host-bound identities):
  - frozen `spike.md`
    `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`;
  - frozen `design-map.md`
    `sha256:997690bb15a9436beb08fc547881b005b80ce3d010591488dd21c490a40f97c0`;
  - `eval-requirements.md`
    `sha256:186a2cc1809fab3561aa1bd523123d511051bc66386141328f32a8251160b3ef`;
  - coverage binding
    `sha256:2536a2fbdb88bc6874af693082e13395a49f94d24d8cee1cae9f91bc45534c04`.
  - No implementation feedback (first attempt).
- Baseline: `feat/spike-014` at `730ef2a016606d0a167afbf63d1aa240f6a03e95`.
- Result: succeeded. The candidate is the local checkpoint that contains this
  entry.
- Changes:
  - D2: optional `methodologyRoot` and `origin` fields in `loadProject`.
    - Policy, trusted history and validator sources resolve in the
      methodology repository.
    - An external project reads trusted history only from a committed revision
      (the methodology `HEAD` pinned at host start).
    - Provenance checks stay in the project repository.
    - `harness.project.json` loads unchanged.
  - D3: every new Workflow Execution Grant records `source`: the methodology
    repository, the trusted `{sequence, manifest, revision}` and, for external
    projects, the exact Harness `runtime` commit. An external host refuses to
    start, grant or launch when the runtime checkout has uncommitted tracked
    changes or its `HEAD` has moved.
  - D2 invariants and D5 (`src/kernel/roots.ts`): fail-closed host-start checks
    for:
    - missing, identical, nested, overlapping or symlink-escaping roots and
      workspaces;
    - a private workspace inside the project repository;
    - a private data root inside a workspace;
    - a remote naming the methodology repository;
    - an origin identity that is absent, unrecognized, mismatched or swapped
      with the methodology repository's origin.
  - D4 (`src/executors/containment.ts`): every external-project provider
    process is launched inside a host-built bubblewrap user, PID, IPC and UTS
    namespace at the single `GovernedProviderRun` spawn seam.
    - Visible: only the granted workspaces at grant mode, scratch with a
      scratch `HOME`, read-only system/Node/provider paths and the read-only
      worker-tools closure.
    - Hidden: ledgers are masked; the root and `/tmp` are read-only.
    - Withheld: Git credentials.
    - Containment unavailability and fixture command profiles are refused
      before any session or allocation.
    - Under containment, forbidden-exposure grants become eligible for the
      Codex adapter.
  - `npm start` reports a refused external host start and exits with status 2.
  - README section on governing a project in another repository.
  - A Prettier-only reformat of `test/kernel.test.ts`. It is a pre-existing
    `format:check` failure introduced at `f6d1456` (host maintenance 003),
    reproduced from `HEAD` bytes before the change.
- Unchanged: trusted history, policy, contracts, role skills and orchestrator.
- Output identities (SHA-256 of the committed bytes):
  - `src/kernel/roots.ts`
    `6283c7a9f656fd11798481b4ba3abbc6917f970c9eed9849caab3b910c0b729a`;
  - `src/executors/containment.ts`
    `c4ca1c319b3f8e3a1b5151a3af6430f3e1d832897045dc2258c2e60b6478c39a`;
  - `src/kernel/trust.ts`
    `841e670de9f8adc885bd7e59bb7871551cd3b5f72d3279f8b91f7a47f621b38c`;
  - `src/kernel/host.ts`
    `c297b2a3c29960339036ebb4d9efbf1f8f6d628809d4e9514e9f3ca6391b4c44`;
  - `src/kernel/configuration.ts`
    `b8d27764a794fa6d8042b90f71ca4eeaaee6401ae0d18f8be489f261d904b87c`;
  - `src/kernel/execution.ts`
    `db46f522b1fb46279a9f93b97d4d387cb1c2b63d6d53d5b00e9bf78631a6020f`;
  - `src/kernel/model.ts`
    `b288719f9df17d2ecb902555a4c07718a11a368d8271c98e8a697eb1ceac635f`;
  - `src/kernel/methodology.ts`
    `2dfd76c3d7d85067a992c92cbee1d85f675ebc784f124fde94556b19aefe80e0`;
  - `src/executors/governed.ts`
    `79e8ceb7b21a1745d7d1c7742f4479449bf846c06a851addd5613e09bf459594`;
  - `src/executors/adapters.ts`
    `da179a21c88f62fe7e5fce8eb144b242005d4b7fa3b4d3378230492ceaae785d`;
  - `src/methodology-evolution.ts`
    `8b8ab01b30edf62eac7f7e34e16228e1c07559420c4e588881df6d9997ac1829`;
  - `src/index.ts`
    `d5e9204b432622b585a55145bb6e37ea62ac5565f0da01dde99a75f5d1878159`;
  - `test/external-project.test.ts`
    `9b637844b4fbbbf03de27025577f2a23cca6cd512e72131cb6c98cc631f987ff`;
  - `test/kernel.test.ts`
    `6e4fa81a3da6af835c689513130beff478a2a9018fbd96a1e4cc9350b9c87efb`;
  - `README.md`
    `e483a9a76f8aa4741a5faf59e3702ce83b7b0278cacc17b527b367ba1d0191bc`.
- Visible tests: `test/external-project.test.ts` adds 11 deterministic tests.
  They cover:
  - the same trusted N+1 (sequence 5) for the self and external configs;
  - the grant source/runtime record and pinning;
  - committed-only trusted history;
  - 15 host-start refusal cases;
  - origin normalization;
  - cross-repository committed-input provenance refusal;
  - containment eligibility;
  - black-box bwrap probes through the real launch path (public denial,
    protected positive, no Harness or methodology writes, no push, no
    credentials);
  - a contained worker-tool result round trip;
  - pre-allocation refusals.
- Checks:
  - `npm test`: 186 tests, 186 pass, 0 fail. This includes the host maintenance
    003 recovery-authority regressions.
  - `npm run typecheck`: pass.
  - `npm run lint`: pass.
  - Prettier check of all tracked and new files: pass. `npm run format:check`
    in this working tree also meets pre-existing, unreadable, untracked sandbox
    dotfiles (for example `.zshrc`, EACCES). These are outside the candidate.
  - Full `npm run check` on a disposable clean clone under `/tmp` with the final
    source bytes: typecheck, lint and format pass; 186 tests pass, 0 fail.
    - An earlier clone run found the public probe could create a phantom file
      on the in-namespace `/tmp` tmpfs when the checkout lives under `/tmp`.
      No host file was created.
    - The fix remounts `/tmp` read-only; the scratch bind stays writable.
- Host observations: `bwrap` 0.9.0 is available, and nested unprivileged
  namespaces work in this environment. No provider was called.
- Restricted evaluator material inspected: none. The Stockdif repositories
  were not inspected.
- Limitations:
  - The live Track B canary, real Codex/Claude behaviour inside containment
    and the H1E evidence are not part of this run.
  - Attached (inline) executors are not processes and are not contained.
  - Stockdif should ignore its untracked ledger; containment masks ledger
    content.

## Run 006 — Evaluator Verify (attempt 001, candidate H1)

- Skill: `evaluator` v14, mode `verify`,
  `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`
  (Role Grant
  `sha256:a6489b976c5d2ed4aceb6fa7676c110a8c8a25ce5f2e2eda85ea8d2aedfd8990`,
  execution `d6103126-6441-46c0-89d9-503434d6bf84`).
- Inputs:
  - candidate H1 `27430d9e80df6e7d075edb549c7c4e7b2c5a48e7`;
  - evaluator revision `001`
    `sha256:8ef73bd723d0471bee546f704c376554c0a1fca8957a298620c9b64e77d95623`;
  - evidence commit `96a3f6e933cc8f6e02f74a081de9cc168b3268d7`, found by D7
    rules 1–4.
  - The brief, Design Map, evaluation requirements and coverage map all
    matched their frozen identities. No drift.
- Result: **BLOCKED**, `INFRASTRUCTURE_FAILURE`.
  - D7 rule 5 is unestablished: no recorded human authorization naming the
    evidence commit was available.
  - The evidence index lacks the terminal Stockdif ledger state with the
    canary status.
  - The canary was blocked before any Stockdif run.
  - The operator-recorded containment preflight failure was not reproducible
    in the evaluator environment. It is reported as an unconfirmed
    observation for Track A, not as an implementation failure.
- Safe aggregates:
  - 6 executable procedures: 5 pass, 1 fails (evidence binding and index);
  - 3 public-evidence procedures: regression review partially established,
    design-conformance review found no contradiction, live-canary review
    blocked;
  - criteria: 3 satisfied, 4 not satisfied, 3 not adjudicated;
  - visible regression: typecheck, lint and tracked-file format pass;
    186/186 tests pass.
- Output: `verification-result.json`
  `sha256:7d00bc2a02ec9607bfb47b879f595e287185bf9701dc3de3141f0003a295a29d`.
- Host actions requested: none. There is no promotion after BLOCKED.
- Wall-clock: not measured. Token usage: unknown.

## Run 007 — Evaluator Verify (attempt 002, candidate H1)

- Skill: `evaluator` v14, mode `verify`,
  `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`
  (Role Grant
  `sha256:ab5acb662a9b7a8469dcddd0f9353839214c96ee144c393db446c3f4939eeee6`,
  execution `1233b758-e687-4bb2-8553-2826ffb4b392`).
- Retry authority: human root `162b2495-da58-4383-9d63-8a241bb848be`.
  Attempt 001 and evaluator revision 001 are preserved.
- Inputs:
  - candidate H1 `27430d9e80df6e7d075edb549c7c4e7b2c5a48e7`;
  - evaluator revision `001`
    `sha256:8ef73bd723d0471bee546f704c376554c0a1fca8957a298620c9b64e77d95623`;
  - evidence commit `96a3f6e933cc8f6e02f74a081de9cc168b3268d7`, bound by D7
    rules 1–5.
  - The brief, Design Map, evaluation requirements and coverage map all
    matched their frozen identities. No drift.
- Result: **FAIL**, `INFRASTRUCTURE_FAILURE`.
  - The evidence binding now holds.
  - The evidence index still lacks the terminal Stockdif ledger state with
    the canary status.
  - The bound evidence records a canary blocked before any Stockdif run.
  - The operator-recorded containment preflight failure was not reproduced
    in the evaluator environment. It stays an unconfirmed observation routed
    to Track A for H2.
- Safe aggregates:
  - 6 executable procedures: 5 pass, 1 fails (evidence index);
  - 3 public-evidence procedures: regression review partially established,
    design-conformance review found no contradiction, live-canary review
    failed;
  - criteria: 3 satisfied, 4 not satisfied, 3 not adjudicated;
  - visible regression: `npm run check` passes; 186/186 tests pass.
- Output: `verification-result.json`
  `sha256:3638803e9655f778584237cdd239805a92fcd50a35dd63ccb337b06ffddb4094`.
- Host actions requested: none. There is no promotion after FAIL.
- Wall-clock: not measured. Token usage: unknown.

## Run 008 — Implementation (Track A, correction candidate H2)

- Skill: `implementation` v5,
  `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
  (pinned bytes delivered by Role Grant
  `sha256:4ff133920510782e013ede54bb4631c9dc72441d4354df3eda6dd2a9f90462a0`,
  execution `3449bc1c-f859-4e36-95a2-7ecdde141e10`, workflow
  `014e-external-project-live-canary`).
- Authority: human root `009a0fe5-9c62-4668-ba7d-061317a72e3b` (permit-role
  implementation). It names Evaluator Verify attempt 002 (FAIL,
  `INFRASTRUCTURE_FAILURE`) and asks for a forward-only H2 correction of the
  operator-environment containment failure. H1
  `27430d9e80df6e7d075edb549c7c4e7b2c5a48e7`, H1E
  `96a3f6e933cc8f6e02f74a081de9cc168b3268d7` and both verification attempts
  are preserved.
- Inputs (host-bound identities):
  - frozen `spike.md`
    `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`;
  - frozen `design-map.md`
    `sha256:997690bb15a9436beb08fc547881b005b80ce3d010591488dd21c490a40f97c0`;
  - `eval-requirements.md`
    `sha256:186a2cc1809fab3561aa1bd523123d511051bc66386141328f32a8251160b3ef`;
  - coverage binding
    `sha256:2536a2fbdb88bc6874af693082e13395a49f94d24d8cee1cae9f91bc45534c04`.
  - No `IMPLEMENTATION_FAILURE` feedback exists. The current
    `verification-finalized` event is `INFRASTRUCTURE_FAILURE`. Only its
    public, non-authoritative observation and routing in
    `verification-result.json` and `evidence/preflight.md` were used.
- Baseline: `feat/spike-014` at `2d6e0274201d09180e6575757b509d11d9d55334`.
- Result: succeeded. The candidate H2 is the local checkpoint that contains
  this entry.
- Investigation:
  - The operator preflight ran with a Node runtime installed under the
    operator home (nvm, on the operator `PATH`). The evaluator ran with Node
    under `/usr`.
  - H1 bound the whole Node installation prefix (`dirname(dirname(node))`).
    This caused two things:
    1. The prefix's mount-point ancestors (for example `~/.nvm`) appeared in
       the in-namespace home listing. The visible probe's oracle allowed only
       the worker-tools ancestor, so it reported `read-real-home: yes`. This
       was an over-strict oracle, because D4 permits the Node runtime.
    2. A real D4 defect: when Node lives in `~/.local/bin`, the whole of
       `~/.local` became visible, including `~/.local/share`. The new test
       reproduces this against H1's `containment.ts`, where
       `read-prefix-sibling` and `read-bin-sibling` are `yes`.
- Changes:
  - `src/executors/containment.ts`: a Node runtime outside `/usr` is now
    exposed only as:
    - the Node executable;
    - its `lib/node_modules`;
    - the `bin` launcher links that resolve into those modules (npm, npx,
      corepack).

    Nothing else from the prefix is exposed. A protected-root overlap still
    refuses the launch.
  - `test/external-project.test.ts`:
    - The AC03/AC04/D4 probe oracle now allows only the mount-point ancestors
      of D4-permitted bindings under home: the worker-tools closure, the Node
      runtime, and the temporary scratch or fixture directories when they
      live under home. Any other home entry is still a leak.
    - A new black-box namespace test places Node under a fixture home
      (`.local/bin/node` with an `npm` link, prefix siblings and `.ssh`). It
      asserts that Node and npm run, that the siblings and `.ssh` are
      invisible, and that the home and prefix listings are exactly `.local`
      and `bin,lib`.
- Unchanged: trusted history, policy, contracts, role skills, orchestrator
  and every other H1 file.
- Output identities (SHA-256 of the committed bytes):
  - `src/executors/containment.ts`
    `ae53f7d46177bba5a7cec306db962b626075b92cf7255e3e9b2cfff54f8f244f`;
  - `test/external-project.test.ts`
    `d757e0323f078f0ddc16ffbe1cbb5c5c1d4b120885be9f51a20925b66ee94fb4`.
- Checks:
  - `node --test test/external-project.test.ts`: 12 tests, 12 pass.
  - `npm test`: 187 tests, 187 pass, 0 fail. This includes the host
    maintenance 003 regressions.
  - `npm run typecheck`: pass.
  - `npm run lint`: pass.
  - Prettier check of the changed files: pass.
  - The new test was also run against H1's `containment.ts`, where it fails
    as expected.
- Skipped: a full `npm run check` on a disposable clean clone. This session's
  permission policy denied it (the `node_modules` link needs a path outside
  the granted workspace). The working-tree checks above ran instead.
- Host observations: `bwrap` and nested unprivileged namespaces work in this
  worker environment. This worker's sandbox hides the operator home, so the
  operator's exact nvm layout could not be run here. It is reproduced through
  a fixture home instead. No provider was called.
- Restricted evaluator material inspected: none. The Stockdif repositories
  were not inspected.
- Measurements: wall-clock time and token usage are unknown.
- Limitations:
  - H2E, the rerun of the canary preflight under H2, and a D6-conformant
    canary record are supervisor work. They are not part of this run.
  - The Node runtime no longer exposes prefix `include/` or `share/`. Native
    add-on builds that need local Node headers must fetch them.

## Run 009 — Evaluator Verify (attempt 003, candidate H2)

- Skill: `evaluator` v14, mode `verify`,
  `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`
  (Role Grant
  `sha256:ad2a15ff010b7a5b3ddd981a3667a5141d27ee459dde0f14c4d68a874909e904`,
  execution `c2d6c80f-13de-4eb1-ad8f-16b384dcd325`).
- Authority: human root `9ed2a324-49a6-4953-a040-fc3454d08d8d`. Attempts 001
  and 002 and evaluator revision 001 are preserved.
- Inputs:
  - candidate H2 `d4b7975d1bc52ce1f029acc5aba4dd9855ae9743`;
  - evaluator revision `001`
    `sha256:8ef73bd723d0471bee546f704c376554c0a1fca8957a298620c9b64e77d95623`;
  - evidence commit `2604e0590f513c33d7ce05398423d3dc338ad1d5`, bound by D7
    rules 1–5.
  - The brief, Design Map, evaluation requirements and coverage map all
    matched their frozen identities. No drift.
- Result: **FAIL**, `IMPLEMENTATION_FAILURE`.
  - The live canary is blocked by a recorded Harness runtime defect. The
    Codex public worker cannot start its nested sandbox inside H2
    containment.
  - H2 does not refuse that condition before any session exists, which D4's
    fail-closed clause requires.
  - Secondary operator-evidence finding (`INFRASTRUCTURE_FAILURE`): the
    evidence index does not list every evidence file, and unavailable usage
    is not written as `"unknown"`.
- Safe aggregates:
  - 6 executable procedures: 5 pass, 1 fails (evidence index);
  - 3 public-evidence procedures: regression review passes,
    design-conformance review found no contradiction, live-canary review
    fails;
  - criteria: 4 satisfied, 5 not satisfied, 1 not adjudicated;
  - visible regression: `npm run check` passes; 187/187 tests pass.
- Outputs:
  - `verification-result.json`
    `sha256:d626cfef3644894273e1ca136d6218fd41db323d24a60c21884af4d3c3d374f3`;
  - `verification-feedback-003.md`
    `sha256:b184bcbe63ac08d1d645a8438a03b3bbb755248abbc59e1c7661f2f08a13bb04`.
- Host actions requested: none. There is no promotion after FAIL.
- Next: an implementation retry (H3) against the same frozen evaluation.
- Wall-clock: not measured. Token usage: unknown.

## Run 010 — Implementation (Track A, correction candidate H3)

- Skill: `implementation` v5,
  `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
  (pinned bytes delivered by Role Grant
  `sha256:3bb0864aded0c61e160368e4768264b9dee546aa5fcc794a14d219aa7f276953`,
  execution `59fd60e5-8e75-42a6-8cee-fd7e270af8dc`, predecessor
  `3449bc1c-f859-4e36-95a2-7ecdde141e10`, workflow
  `014e-external-project-live-canary`).
- Inputs (host-bound identities; each recomputed before any change):
  - frozen `spike.md`
    `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`;
  - frozen `design-map.md`
    `sha256:997690bb15a9436beb08fc547881b005b80ce3d010591488dd21c490a40f97c0`;
  - `eval-requirements.md`
    `sha256:186a2cc1809fab3561aa1bd523123d511051bc66386141328f32a8251160b3ef`;
  - coverage binding
    `sha256:2536a2fbdb88bc6874af693082e13395a49f94d24d8cee1cae9f91bc45534c04`;
  - implementation feedback `verification-result.json`
    `sha256:d626cfef3644894273e1ca136d6218fd41db323d24a60c21884af4d3c3d374f3`.
    It is the current `verification-finalized` event (attempt 003,
    `IMPLEMENTATION_FAILURE`, candidate H2), committed at
    `1f41328300ff967ea84bc78fbc6b0acc642243c5`. The committed bytes match.
    The public `verification-feedback-003.md` was read with it.
- Baseline: `feat/spike-014` at `1f41328300ff967ea84bc78fbc6b0acc642243c5`.
  H1, H1E, H2, H2E and attempts 001–003 are preserved.
- Result: succeeded. The candidate H3 is the local checkpoint that contains
  this entry.
- Investigation:
  - Codex's own sandbox was reproduced locally through H2's
    `containedLaunch`, with no model call: `codex sandbox -P :workspace`
    (codex-cli 0.153.1).
  - It failed with `bwrap: Can't mkdir /tmp/.git: Read-only file system`.
    Codex treats `/tmp` as a writable root and protects `/tmp/.git` in it.
    That needs a new mount point on the namespace `/tmp`, which H2 remounted
    read-only. `:read-only` started.
- Changes:
  - `src/executors/containment.ts`:
    - The namespace root stays read-only. The namespace-private `/tmp` tmpfs
      is no longer remounted read-only. It maps no host path and persists
      nothing, so D4's visible and writable host paths are unchanged.
    - Added `probeNestedSandbox` for D4 fail-closed. Before any session
      exists, it runs a nested bubblewrap inside the exact containment for
      the grant, using a temporary scratch that is removed afterwards. The
      nested bubblewrap has new user, PID and network namespaces, the
      contained root read-only, the writable roots (write workspaces,
      scratch, `/tmp`) re-bound, and a new mount point on `/tmp`. If it fails,
      the launch is refused with `provider-config-invalid`.
  - `src/executors/adapters.ts`: adapters declare `nestedSandbox`, `true` for
    Codex and `false` for Claude.
  - `src/kernel/host.ts`: for a contained launch of a `nestedSandbox`
    adapter, the probe runs after launch planning and before session
    registration or allocation. A refusal therefore creates no session or
    allocation, and Claude, which has no nested sandbox, stays eligible for
    the pre-authorized substitution.
  - `src/executors/governed.ts`: exports `launchWorkspaces` so the probe uses
    the same workspace order as the launch.
  - `README.md`: one line on the nested-sandbox refusal.
  - `test/external-project.test.ts`, three new tests:
    - A black-box namespace test. A contained program starts a nested
      bubblewrap that creates `/tmp/.git` with its own network namespace. The
      namespace root stays unwritable, and namespace `/tmp` writes do not
      reach the host.
    - The probe passes under real containment and refuses with
      `provider-config-invalid` when the nested sandbox cannot start.
    - Through the host: a Codex grant whose nested sandbox cannot start is
      refused with 409 `provider-config-invalid`. No `kernel.session` or
      `kernel.allocation` is recorded and the provider never starts. On the
      same host, a Claude role is still allocated.
- Unchanged: trusted history, policy, contracts, role skills, orchestrator,
  evaluation artifacts and evidence.
- Output identities (SHA-256 of the committed bytes):
  - `src/executors/containment.ts`
    `be51997bee59ffcbfb267808536e06ae3dd21b7293f874881dc207231e76e59a`;
  - `src/executors/adapters.ts`
    `8c0ea8911afc2139d9904227a61efea22862950bb87c95e225dd1129ae5d5ee4`;
  - `src/executors/governed.ts`
    `efda8bd21931305694a9596c4f82d44174ab4bd65286aa31a2f1316ec3625eeb`;
  - `src/kernel/host.ts`
    `b8cfa218aef1f00c74db6aecfdd7301c472f55e148825b2022a16a370c236a24`;
  - `test/external-project.test.ts`
    `fe3005b6a2275ecaae509137064990922411e86217af41eb7df7520c4c54d99f`;
  - `README.md`
    `b5c4a40cbf262e9a6edcf3cf3e5c9de65e7eab1ade9d678eb9b43ef06d6862e1`.
- Checks:
  - `node --test test/external-project.test.ts`: 15 tests, 15 pass.
  - `npm test`: 190 tests, 190 pass, 0 fail. This includes the host
    maintenance 003 regressions.
  - `npm run typecheck`: pass.
  - `npm run lint`: pass.
  - Prettier check of every tracked file: no style differences.
    `npm run format:check` itself exits non-zero here only because it cannot
    read untracked, permission-denied files at the repository root (for
    example `.profile`, `.zshrc`). These are sandbox residue and are not
    repository content.
  - With H2's read-only `/tmp` restored temporarily, both new namespace tests
    fail as expected: the nested sandbox cannot start and the probe refuses.
  - With the fix, real `codex sandbox -P :workspace` and `-P :read-only` run
    `sh` inside `containedLaunch` and exit 0. No model was called.
- Skipped: `npm run check` on a disposable clean clone. The working-tree
  checks above ran instead.
- Restricted evaluator material inspected: none. The Stockdif repositories
  were not inspected.
- Measurements: wall-clock time and token usage are unknown.
- Limitations:
  - The exact nested sandbox command of a full `codex exec` session was not
    observed. The probe models its shape, and the real Codex sandbox helper
    was run locally.
  - H3E, the rerun of the affected canary steps under H3, and the evidence
    index corrections (`artifacts` listing every evidence file, `"unknown"`
    for unavailable usage) are supervisor operator-evidence work. They are
    not part of this run.

## Run 011 — Evaluator Verify (attempt 007, candidate H3)

- Skill: `evaluator` v14, mode `verify`,
  `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`
  (Role Grant
  `sha256:e8aa1f55d0bc10d10711dd1f38a73c52d1fc8d7ed3b269d40c2db150cbedee26`,
  execution `67511e4b-91f6-442c-b31a-11a7a1a6ec1a`).
- Authority: human root `58b469c6-2cbc-4c5c-a408-351e88a4bdb5`.
  - Host attempts 4–6 against H3 produced no typed result because of
    provider rate limits. They are not rewritten.
  - Attempts 001–003 and evaluator revision 001 are preserved.
- Inputs:
  - candidate H3 `eb6a06e5bd808918e958103fd63589b4e67d8ce3`;
  - evaluator revision `001`
    `sha256:8ef73bd723d0471bee546f704c376554c0a1fca8957a298620c9b64e77d95623`;
  - evidence commit `ae04f9b35c9656c0e28e550052534f3701f837d1`, found by D7
    rules 1–4.
  - The brief, Design Map, evaluation requirements and coverage map all
    matched their frozen identities. No drift.
- Result: **BLOCKED**, `EVALUATOR_DEFECT`.
  - The frozen containment procedure gives a false positive on H3. A write
    it attributes to the Harness checkout lands on a namespace-private path.
    Authoritative host-side checks show no escape.
  - An evaluator repair is required before verify is rerun against the
    unchanged H3.
  - Secondary operator-evidence findings (`INFRASTRUCTURE_FAILURE`):
    - the human authorization names a non-existent evidence commit that
      shares only its 7-hex prefix, so D7 rule 5 fails;
    - the evidence index still omits one evidence file;
    - unavailable usage is not written as `"unknown"`.
- Safe aggregates:
  - 6 executable procedures: 4 pass, 1 blocked (evaluator defect), 1 fails
    (evidence index);
  - 3 public-evidence procedures: regression review passes,
    design-conformance review found no contradiction, live-canary review
    blocked at binding;
  - criteria: 3 satisfied, 2 not satisfied, 5 not adjudicated;
  - visible regression: `npm run check` passes; 190/190 tests pass.
- Outputs: `verification-result.json`
  `sha256:7b77a12fe11068e6554ed4f627005a6631d25eb7b209e80c20313b39fb5a25cc`.
- Host actions requested: none. There is no promotion after BLOCKED.
- Next:
  1. Evaluator repair of revision 001's containment procedure.
  2. Verify against the unchanged H3, with a human authorization naming the
     full evidence commit and a corrected evidence index.
- Wall-clock: not measured. Token usage: unknown.
