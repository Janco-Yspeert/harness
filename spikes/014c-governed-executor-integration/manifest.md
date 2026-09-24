# Spike 014c Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:d52ba4451b058f715197e2c2d2046f0d9d9897841233193fbbf7994985979f83`,
  assignment `802a34cd-450c-4d47-8f1c-5e5a5a16f659`; human-authorized 014c
  bootstrap execution).
- Input: draft `spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`,
  reviewed against `feat/spike-014` at
  `fd60b07f9bac407adeb4ff4ba5eb616672d14b46`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`). One blocker
  (B1: the trust-equivalence gate does not say how it applies to the synthetic
  real-provider smoke tests or to non-Harness projects), two material
  clarifications (M1: pinned evaluator launch path and host revision; M2: how
  the production configuration is kept apart from the test configuration), and
  two editorial notes.
- Outputs: `feedback.md`
  `sha256:f0bbe01ab6b89cd3c7201709752d3280db74a233d3a932c034d2699ca4ef17be`;
  preliminary snapshot `preliminary/001/spike.md` (identical to the input) and
  `preliminary/001/feedback.md` (identical to `feedback.md`).
- Repository evidence inspected: `AGENTS.md`; the draft brief and its commit
  history; `bootstrap/authority.md`; `tools/governed-claude-bootstrap.ts`;
  `src/kernel/{host,execution,methodology,configuration,model}.ts`;
  `src/methodology-evolution.ts`; `src/index.ts`; `harness.project.json`;
  `methodologies/harness/{policy.json,trusted.jsonl}`; and the public 014a
  manifest format.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity;
  SHA-256 equality of the preliminary snapshot; Prettier check of the feedback
  files; `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:3d5bec9555558f4be33976e8869ca10479e026d52d7c9fb08480c3c64d05333c`,
  assignment `844ba158-2cf0-40a8-895a-28d40919cf89`; human-authorized 014c
  bootstrap execution).
- Input: draft `spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
  (byte-identical to the Run 001 input), reviewed against `feat/spike-014` at
  `27655009f3e915b4973eaad5b82058bec190f41e`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`). The brief is
  unrevised, so Run 001's findings persist after re-verification: blocker B1
  (trust-equivalence gate scope versus synthetic smoke tests), material
  clarifications M1 and M2, and editorial notes E1–E3.
- Outputs: `feedback.md`
  `sha256:423c535a8f6cef3008fc84157d0d1fe20ca941078ab401fd84f4150c0063a1bb`;
  preliminary snapshot `preliminary/002/spike.md` (identical to the input) and
  `preliminary/002/feedback.md` (identical to `feedback.md`). `preliminary/001`
  was left untouched.
- Repository evidence inspected: the draft brief; the Run 001 feedback and
  manifest; `bootstrap/authority.md`; `harness.project.json`; `methodologies/`;
  `src/methodology-evolution.ts`; `src/kernel/{host,methodology,execution}.ts`;
  `src/index.ts`; and `git diff fd60b07 HEAD --stat`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity and
  the preliminary snapshots; Prettier check of the feedback files.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:71ea1023f4b40c016a923e0b37f428cb9504ac9f0ed3c06bcc0c282e86dd4de3`,
  assignment `01e707aa-a305-4b6d-b7f4-36a63841fe0c`; human-authorized 014c
  bootstrap execution).
- Input: draft `spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
  (byte-identical to the Run 001 and Run 002 inputs), reviewed against
  `feat/spike-014` at `bf8bc140338427904d4305fc1c9273345fbcf8aa`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`). The brief is
  unrevised and the repository evidence is unchanged, so blocker B1
  (trust-equivalence gate scope versus synthetic smoke tests), material
  clarifications M1 and M2, and editorial notes E1–E3 persist.
- Outputs: `feedback.md`
  `sha256:283874d28ef8ed3cde9bfe92258ee274bc9226faba338121be5f6c066fdfcf29`;
  preliminary snapshot `preliminary/003/spike.md` (identical to the input) and
  `preliminary/003/feedback.md` (identical to `feedback.md`).
  `preliminary/001` and `preliminary/002` were left untouched.
- Repository evidence inspected: the draft brief; the Run 002 feedback and
  manifest; `bootstrap/authority.md`; `harness.project.json`;
  `methodologies/harness/trusted.jsonl`; `src/methodology-evolution.ts`;
  `src/kernel/host.ts` and a trust search over `src/kernel/`; `src/index.ts`;
  and `git diff` stats since `2765500` and `fd60b07`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity and
  the preliminary snapshots; Prettier check of the feedback files.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:b5bc4c8da0d87f71ddc5f3ab0b4493ac9f3fe1215fe47a4b9131c8e26467587d`,
  assignment `72a50e0e-af22-468f-be95-35996ab21ca6`; human-authorized 014c
  bootstrap execution).
- Input: revised draft `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`,
  reviewed against `feat/spike-014` at
  `fea79abb0b9085f6ce90b2c94e750b15a38e56c8`.
- Result: succeeded; verdict **Ready after minor clarification** (`READY`).
  Earlier blocker B1, clarifications M1 and M2, and editorial notes E1 and E2
  are resolved. Two non-blocking clarifications remain: C1 (who records the
  fixture's human trust-root authority, and when) and C2 (generalizing the
  Harness-specific manifest construction to per-project trust histories and
  validator sets). One editorial note remains: E1 (record the freeze
  checkpoint).
- Outputs: `feedback.md`
  `sha256:18d02ec6f81aa5e93d7bd975bee74a16d73ee56985172aeb6c44e6775f778c10`.
  The verdict passes, so no preliminary snapshot was created. `preliminary/001`
  through `preliminary/003` were left untouched.
- Repository evidence inspected: the draft brief and its diff since Run 003;
  the Run 003 feedback and manifest; `bootstrap/authority.md`; commit
  `d447e385` and its `tools/governed-claude-bootstrap.ts`;
  `harness.project.json`; `methodologies/harness/trusted.jsonl`;
  `src/methodology-evolution.ts`; `tools/methodology.ts`; and `src/index.ts`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity;
  `git diff ccca429 HEAD --stat`; ancestry check of `d447e385`; Prettier check
  of `feedback.md`.
- Measurement cutoff: immediately before this manifest update.

## Run 005 — Design Map

- Skill: `design-map` v3,
  `sha256:c4f645a2d383ad15173131c72768eca723d7d6a8528b49cd273981d234d559ea`
  (pinned bytes delivered by Role Grant
  `sha256:52fd35c7c5cf2aa4718ab9ca81b060e7dd66aad9617f6797dcf4d86d1d942f69`,
  assignment `85f8a28d-3141-4035-afbc-fd64b55851cd`; human-authorized 014c
  bootstrap execution).
- Input: frozen `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`
  (`brief-frozen` at `889507128fed99db3e0af9aed7856b4d30b934cd`; working tree
  and committed bytes verified identical), mapped against `feat/spike-014` at
  that commit.
- Result: succeeded. The map settles the shared contracts that implementation
  and evaluation must agree on:
  - construction and configuration seams, with `claude`/`codex` as the
    registered adapter IDs and fixture command profiles limited to direct
    programmatic construction;
  - worker protocol v1 operations over the existing governed HTTP API;
  - a per-project trust-equivalence gate at `POST grants`, using a
    `trustedHistory` project field;
  - the synthetic fixture's human trust root (resolves Run 004 C1 and C2);
  - the diagnostic category vocabulary;
  - the public evidence artifacts;
  - the exact real-provider smoke procedure;
  - the fixed protected-execution threat model.

  No product, scope or behavior decision was returned to the brief.
- Output: `design-map.md`
  `sha256:9f98ebfcc201736737cb9e0f5dcebc29cafd1235a8e9465b02c81764013e82e1`
  (2,767 words).
- Repository evidence inspected: the frozen brief and Run 004 feedback;
  `bootstrap/authority.md`; `AGENTS.md`; the 014a Design Map;
  `harness.project.json`; `methodologies/harness/{policy.json,trusted.jsonl}`
  and the design-map/implementation contracts;
  `src/kernel/{host,model,configuration,methodology}.ts` and the relevant
  parts of `src/kernel/execution.ts`; `src/methodology-evolution.ts` (manifest
  construction, binding, promotion authority);
  `src/methodologies/harness-public.ts` validator identities;
  `src/index.ts` governed wiring; the exports of `src/claude-workflow.ts`,
  `src/workflow-backend.ts` and `src/codex-backend.ts`;
  `tools/fixtures/governed-executor.ts`;
  `tools/governed-claude-bootstrap.ts`; and the host construction in
  `test/kernel.test.ts`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 of `spike.md` against the host-bound identity and the
  `brief-frozen` commit; Prettier check of `design-map.md`;
  `git diff --check`; confirmed the 014a ledger is tracked.
- Measurement cutoff: immediately before this manifest update.

## Run 006 — Evaluator Prepare (blocked)

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:689fdde5cfe8a739fd8df1c6607aac5d0e711b452d52cec8a14dce123b4fa99a`,
  assignment `c29d2dad-d91c-4987-bfaa-96e5d9bfa5b0`; human-authorized 014c
  bootstrap execution), mode `prepare`.
- Inputs: frozen `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`
  (committed at `8895071`) and frozen `design-map.md`
  `sha256:9f98ebfcc201736737cb9e0f5dcebc29cafd1235a8e9465b02c81764013e82e1`
  (committed at `c98e04f`). Working-tree and committed bytes match the
  host-bound identities.
- Result: **blocked** (infrastructure). The bound private evaluation workspace
  `/tmp/harness-014c-private/evaluation` is readable but not writable in this
  execution. The Bash sandbox write allowlist excludes it, and the file tools
  are restricted to the repository and the bootstrap scratch directory. The
  evaluator skill forbids falling back to the public repository, and the
  bootstrap scratch directory is deleted when the provider exits. So no private
  specification, case manifest, freeze metadata or attempt ledger could be
  created, and no evaluator revision was frozen.
- Outputs: none. No `eval-requirements.md` or `coverage-map.json` was produced,
  because publishing either without a matching frozen private revision would
  falsely attest readiness. `evaluation-prepared` must not be recorded.
- Required recovery: rerun `evaluator prepare` with write access to the bound
  private evaluation workspace. This is a host or profile configuration change
  and needs separate authorization; it is not a change to the brief or Design
  Map.
- Restricted evaluator material inspected: none. The private workspace was
  empty.
- Measurement cutoff: immediately before this manifest update.

## Run 007 — Evaluator Prepare (blocked, repeat)

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:5231afd3b8b5d64842722387ba0fdbce6fcba89cd38a5ab6a312f712b6324cb0`,
  assignment `b248de13-d5fd-41ee-9a41-82c08497969c`, predecessor
  `6c2ca818-f8e0-4722-b044-d6e5b3131860`; human-authorized 014c bootstrap
  execution), mode `prepare`.
- Inputs: frozen `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`
  and frozen `design-map.md`
  `sha256:9f98ebfcc201736737cb9e0f5dcebc29cafd1235a8e9465b02c81764013e82e1`.
  Working-tree bytes match the host-bound identities.
- Result: **blocked** (infrastructure, unchanged from Run 006). The bound
  private evaluation workspace `/tmp/harness-014c-private/evaluation` is still
  mounted read-only in this execution (`ro` bind mount), and the file tools are
  still confined to the repository and the bootstrap scratch directory. No
  private artifact could be created and no evaluator revision was frozen.
- Outputs: none. No `eval-requirements.md` or `coverage-map.json` was produced.
  `evaluation-prepared` must not be recorded.
- Required recovery: fix the executor profile or sandbox so that the
  evaluator-private workspace is writable, then rerun. Reallocating the same
  profile again will not help. This needs separate authorization. It is not a
  change to the brief or the Design Map.
- Restricted evaluator material inspected: none. The private workspace was
  empty.
- Measurement cutoff: immediately before this manifest update.

## Run 008 — Evaluator Prepare

- Skill: `evaluator` v13,
  `sha256:0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`
  (pinned bytes delivered by Role Grant
  `sha256:3a1e1b51a592ec422a9c532b31620cb803b31ca01fdb482bf9b495b3898c26ec`,
  assignment `15719326-5827-4ed3-bc89-ea6b06763c3e`; human-authorized 014c
  bootstrap execution after the Addendum 2 launch correction), mode `prepare`.
- Inputs: frozen `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`
  and frozen `design-map.md`
  `sha256:9f98ebfcc201736737cb9e0f5dcebc29cafd1235a8e9465b02c81764013e82e1`.
  Working-tree and committed bytes match the host-bound identities. The
  pre-implementation baseline is `3830c992bccae2aec2d3a6b7f647f62f81b70e81`.
- Result: **succeeded**. The private evaluation workspace was writable this
  time.
  - Private evaluator revision `001` is frozen with identity
    `sha256:0f5e6846ac07c260f135e05d844a6487f29d35b64a3ba0d5a1738928c2687db8`.
  - The pre-freeze integrity validation passed with 0 diagnostics.
  - Every executable case passed under controlled compliant conditions and
    failed under controlled non-compliant conditions. No candidate
    implementation existed or was executed.
- Outputs:
  - `eval-requirements.md`
    `sha256:4208a00410787a09eb4fafdaacd1756fd4f5f00a9bb1bf26e077a52f1ef4338c`.
    It has 5 testability requirements, 4 evaluator assumptions and no blocking
    questions.
  - `coverage-map.json`
    `sha256:d9a843edfc9557e4e9e80af0b69b7855fc33447ba56dab471173baabdc7aecdf`.
    It has 16 criterion records (AC01–AC16) and a readiness attestation
    `integrityValidation: PASS`, with private inventory
    `sha256:bc16be57bb7ba358cafdfff75dc1d9374c316c741f35bf4ddb91a4e8f56fdc77`
    and validator result binding
    `sha256:417a459c39e1df084d538f1bac57b75eab844635f6f785abca996d322c745103`.
- Safe aggregates:
  - 9 evidence procedures: 4 executable, plus public regression, decision
    record, smoke evidence, code review and orchestrator review.
  - 58 mandatory cases, 15 of them executable.
- Checks: the repository's `prepared-coverage` validator
  (`validatePreparedMap`) accepts `coverage-map.json`. Prettier checks pass
  for both public artifacts.
- Requested host action: record `evaluation-prepared` after validating this
  checkpoint. Implementation may then begin against revision `001`.
- Restricted evaluator material inspected: only this run's own private bundle.
- Measurement cutoff: immediately before this manifest update.

## Run 009 — Implementation (blocked on human trust root and provider access)

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes delivered by Role Grant
  `sha256:c590c226467c06721989936398c39875d90e013f118ccf1aad2a8919d207a62f`,
  assignment `234e3308-013d-4ed0-badf-054149edf2c1`; human-authorized 014c
  bootstrap execution).
- Inputs: frozen `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`,
  frozen `design-map.md`
  `sha256:9f98ebfcc201736737cb9e0f5dcebc29cafd1235a8e9465b02c81764013e82e1`,
  `coverage-map.json`
  `sha256:d9a843edfc9557e4e9e80af0b69b7855fc33447ba56dab471173baabdc7aecdf`
  and `eval-requirements.md`
  `sha256:4208a00410787a09eb4fafdaacd1756fd4f5f00a9bb1bf26e077a52f1ef4338c`.
  Working-tree bytes matched the host-bound identities. There was no
  implementation feedback: no prior `verification-finalized` event exists.
  Work started on `feat/spike-014` at
  `da1c8cb1c8a8e2196a7f6abcd2594c7b06d063bf`.
- Result: **blocked**. The implementation is committed. The deliverable
  still missing is real-provider smoke evidence, which needs:
  - a human decision approving the synthetic fixture's trust root (Design
    Map §4 orders this after the fixture commit and forbids the worker from
    authoring it); and
  - an execution environment with Claude and Codex access. This worker could
    see neither the Claude binary nor provider network egress.

  AC05, AC09 and the real-provider parts of AC06, AC07 and AC11 are therefore
  unproven (see `smoke-evidence.md`). No provider call was made.
- Implementation checkpoint: `098b89934a3fbdf3ee18b02b9ac84e39365a4270`.
  It contains:
  - the registered `claude` and `codex` adapters (`src/executors/`);
  - worker protocol v1 and its MCP tool server;
  - host integration with categorized diagnostics and cancellation;
  - the per-project trust-equivalence gate (`src/kernel/trust.ts`);
  - production executor validation;
  - the governed-smoke fixture (manifest
    `sha256:726fbff1504b533104c1230a55bfea71885c5e6c8534f0dc79c5cb1716006161`);
  - orchestrator skill v2, with v1 preserved;
  - deterministic tests and the opt-in live smoke test.

  Across 35 files it adds 4,430 lines and removes 116.
- Evidence outputs: `executor-decision.md` (structured Claude CLI selected;
  SDK not executable under approved credentials; no live probes possible here)
  and `smoke-evidence.md` (status UNPROVEN; fixture identities and the required
  human step).
- Decisions:
  - Registered adapter IDs are `claude` and `codex`. Production profiles with a
    `command`, an unknown provider or an unknown key are refused at startup.
  - Governed provider discovery searches only absolute host `PATH` entries. It
    never executes the program, and it never selects one in a temporary or
    workspace directory. `HARNESS_CLAUDE_EXECUTABLE` is not honoured for
    governed execution.
  - The worker relay is loopback TCP with a per-execution relay key. The
    sandbox refused Unix-socket `bind`, and loopback TCP is the only transport
    the evaluator's documented environment guarantees.
  - The trust gate runs inside grant authorization for every host-constructed
    project, and it cannot be configured away.
  - New `kernel.diagnostic` and `kernel.executor-confirmed` events are
    mechanics, so they do not move the authority basis.
  - The confirmed model/effort is now `null` until the provider reports it.
    Profile configuration never confirms it.
- Checks:
  - `tsc --noEmit`: pass.
  - `eslint .`: pass.
  - `prettier --check` over the changed files: pass.
  - `npm test`: **143 passed, 0 failed**. The pre-change baseline was 125
    passed. The new tests are 18 in `test/governed-executors.test.ts`; existing
    kernel HTTP tests now record disposable test trust roots.
  - `npm run format:check` fails in this sandbox only on unreadable, untracked
    sandbox dotfiles (`.bashrc`, `.idea` and similar, `EACCES`). The same
    failure is in the pre-change baseline. `npm run check` stops there, so its
    remaining steps were run individually.
- Invariants checked by tests:
  - The 014a ledger is byte-identical to the brief-freeze commit.
  - Harness `trusted.jsonl` extends its brief-freeze bytes.
  - The Harness policy, contracts, skills and `harness-public.ts` are unchanged.
  - The current Harness definition passes the gate.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 010 — Implementation (blocked, repeat)

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes delivered by Role Grant
  `sha256:be99b728e0004e200f7ce94600ce3529f5a58be11fa819b3e13980fc964c0195`,
  assignment `56a18d54-6f3f-453e-9ba3-4a13aa8a7895`, predecessor
  `234e3308-013d-4ed0-badf-054149edf2c1`; human-authorized 014c bootstrap
  execution).
- Inputs: the same frozen `spike.md`, `design-map.md`, `coverage-map.json` and
  `eval-requirements.md` as Run 009. Working-tree bytes match the host-bound
  identities. There is no implementation feedback because no
  `verification-finalized` event exists. Work started on `feat/spike-014` at
  `33cc2ec2ed9275fcb6fc0c5d9e9cdcc2dd522a44`.
- Result: **blocked**, for the same reasons as Run 009. This worker was
  allocated immediately after Run 009 was recorded as blocked, and nothing it
  depends on has changed:
  - No human decision record exists. The fixture trust root
    `fixtures/governed-smoke/methodology/trusted.jsonl` is still absent, and
    no commit has been made since `33cc2ec`. Design Map §4 forbids the worker
    from authoring the root, and §7 step 1 requires it before any smoke run.
  - `claude` is still not on this worker's `PATH`. `codex` is now visible at
    `/usr/lib/chatgpt/resources/codex`, but the missing trust root blocks the
    smoke regardless.
- Outputs: none besides this entry. Implementation checkpoint `098b899` is
  unchanged. No provider call was made.
- Required recovery: a human approves the fixture trust root as
  `smoke-evidence.md` describes. The smoke then runs on a host with both
  providers available. Reallocating implementation before that happens will
  block again.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 011 — Implementation (blocked, repeat)

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes delivered by Role Grant
  `sha256:77928c041f44040ea89d0215821241e967ef12a8fecb7eb6cacbbf035e80587e`,
  assignment `db2e3cf2-7d6c-46b1-b003-477ee014162f`, predecessor
  `56a18d54-6f3f-453e-9ba3-4a13aa8a7895`; human-authorized 014c bootstrap
  execution).
- Inputs: the same frozen `spike.md`, `design-map.md`, `coverage-map.json` and
  `eval-requirements.md` as Runs 009 and 010. Working-tree bytes match the
  host-bound identities. There is no implementation feedback because no
  `verification-finalized` event exists. Work started on `feat/spike-014` at
  `35c08f422fd1d7211441ac806624cd348d4dd593`.
- Result: **blocked**, for the same reasons as Runs 009 and 010. This worker
  was allocated right after Run 010 was recorded as blocked, and nothing it
  depends on has changed:
  - No human decision record exists, and no commit has been made since
    `35c08f4`.
  - `fixtures/governed-smoke/methodology/trusted.jsonl` is still absent.
  - `claude` is still not on this worker's `PATH`. `codex` is visible at
    `/usr/lib/chatgpt/resources/codex`.
- Outputs: none besides this entry. Implementation checkpoint `098b899` is
  unchanged. No provider call was made.
- Required recovery: unchanged from Run 010. A human must first approve the
  fixture trust root as `smoke-evidence.md` describes. Then the smoke must run
  on a host where both providers are available. Allocating implementation again
  before both happen will block again.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 012 — Implementation (live-smoke corrections; real-provider rerun pending)

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes delivered by Role Grant
  `sha256:04fd084126ed03696e9e9962e15fc29cb9d167c31f95626da4486cdb11b982cb`,
  assignment `bd709dbb-9530-478a-9b37-5dfb504c90b6`; human-authorized 014c
  bootstrap execution).
- Inputs: the same frozen `spike.md`, `design-map.md`, `coverage-map.json` and
  `eval-requirements.md` as Runs 009–011. They match the host-bound
  identities. There is no implementation feedback because no
  `verification-finalized` event exists. Work started on `feat/spike-014` at
  `bfd14a5141a1bb9627312c32542ab74c60900f17`. The fixture trust root
  (`fac5c1c`, `55d9e1e`) and three failed live smoke records (`bfd14a5`) now
  exist.
- Result: **blocked**. The live-smoke defects are fixed in the adapters. A
  real-provider rerun is still required, and this worker cannot perform it
  (no `claude` binary and no provider credentials in its sandbox).
  - Claude: `--safe-mode` disables the explicitly passed Harness MCP server.
    Governed launches now use `GOVERNED_CLAUDE_FLAGS`, which keeps the other
    ambient exclusions (`--strict-mcp-config`, `--setting-sources ""`,
    `--disable-slash-commands`, `--restricted`). The legacy protected mode is
    unchanged. The tools-unavailable diagnostic now names the reported server
    status.
  - Codex: the Harness MCP tools are pre-approved with
    `mcp_servers.harness.default_tools_approval_mode="approve"`, because
    `approval_policy="never"` declines unapproved MCP calls. No sandbox,
    network or command permission changes. Failed Harness `mcp_tool_call`
    items are reported as `permission-denied`.
  - The fake provider now reproduces both observed behaviours. Two new tests
    and the existing Claude/Codex flow tests fail without the corrections (8
    failures when the source changes are reverted).
  - `executor-decision.md` and `smoke-evidence.md` record the failed live
    runs as AC11 diagnostic evidence, but not as AC05 or AC09 evidence.
- Changed before this entry: 6 files, 279 insertions and 10 deletions
  (`src/claude-workflow.ts`, `src/executors/adapters.ts`,
  `tools/fixtures/fake-provider.ts`, `test/governed-executors.test.ts`,
  `executor-decision.md` and `smoke-evidence.md`).
- Checks:
  - `tsc --noEmit`: pass.
  - `eslint .`: pass.
  - Prettier check of the changed files: pass.
  - `git diff --check`: clean.
  - `npm test`: **145 passed, 0 failed** (143 at start).
  - `npm run format:check` was not run repo-wide because of the known
    sandbox-dotfile `EACCES` failure recorded in Run 009.
- Not verified: whether the corrected flags succeed against real Claude Code
  `2.1.280` and Codex `0.155.1`. No provider call was made.
- Required recovery: rerun `npm run smoke:governed` on the provider host
  against this checkpoint, then commit the resulting `live-smoke/` records and
  update `smoke-evidence.md`.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 013 — Implementation (blocked, real-provider rerun unavailable)

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`
  (pinned bytes delivered by Role Grant
  `sha256:e3b9fc714615c8a35d185b37baca15c8379b896bf17f8bebe433d3df67e97b5e`,
  assignment `03db7416-7d04-4058-b480-18d32656f229`; human-authorized 014c
  bootstrap execution).
- Inputs: the same frozen `spike.md`, `design-map.md`, `coverage-map.json` and
  `eval-requirements.md` as Runs 009–012. Working-tree bytes match the
  host-bound identities. There is no implementation feedback: no
  `verification-finalized` event was bound. Work started on `feat/spike-014` at
  `ef23780f4c2718132223cafcddb47a71c4a5071d`.
- Result: **blocked**. The only remaining deliverable is Run 012's required
  recovery: rerunning `npm run smoke:governed` against the corrected adapters
  and committing the resulting `live-smoke/` records. This worker cannot do
  that. `claude` is not on its `PATH` (`which claude` finds nothing, and neither
  `/usr/bin` nor `/usr/local/bin` has it). `codex` is visible at
  `/usr/lib/chatgpt/resources/codex`, but a Codex-only run cannot satisfy AC05
  or AC09, and the brief forbids spending quota on partial retries. No provider
  call was made.
- Outputs: none besides this entry. Implementation checkpoint `ef23780` is
  unchanged. AC05, AC09 and the real-provider parts of AC06, AC07 and AC11 stay
  unproven, as `smoke-evidence.md` records.
- Checks at `ef23780`:
  - `tsc --noEmit`: pass.
  - `eslint .`: pass.
  - `npm test`: **145 passed, 0 failed**.
- Required recovery: run `npm run smoke:governed` on a host where both `claude`
  and `codex` are installed and logged in, then commit the records and update
  `smoke-evidence.md`. Reallocating implementation in this sandbox will block
  again.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.
