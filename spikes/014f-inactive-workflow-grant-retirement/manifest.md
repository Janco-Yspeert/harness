# Spike 014f Manifest

## Brief Readiness — execution 89d65247-0d7d-4472-aeea-171517263755

- Skill: `brief-readiness`, contract version 5
  (`sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`).
- Workflow: `014f-inactive-workflow-grant-retirement`; Role Grant
  `sha256:77e64adcd7f40fb6fb73eb54f19ddd80efc1690181dcebf4ee469ff6ab444876`.
- Input: `spike.md`
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`.
- Result: succeeded, verdict `READY` (Ready after minor clarification).
- Outputs: `feedback.md`, `manifest.md`. No preliminary snapshot (passing verdict).
- Checks: none run; static repository inspection only.
- Measurements: wall-clock time and token usage unavailable.

## Design Map — execution 6031ad78-dc32-4686-9e18-9fd80caba46d

- Skill: `design-map`, contract version 4
  (`sha256:238af12bbee012a784f234f2aaab9d4e783a58ec1b7c0257937bc54a16010136`).
- Workflow: `014f-inactive-workflow-grant-retirement`; Role Grant
  `sha256:92f55e46bf78f839139610243eff52f77006d01e8f3c2f9a40ab519d41d8d32e`.
- Input: `spike.md`
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`
  (verified by content hash).
- Result: succeeded.
- Output: `design-map.md`
  `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`.
- Checks: none run; static repository inspection only.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Prepare — execution d3c036e9-da32-4cc2-bf20-6a9f238ee1b5

- Skill: `evaluator`, mode `prepare`, contract version 14
  (`sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`).
- Workflow: `014f-inactive-workflow-grant-retirement`; Role Grant
  `sha256:85b7206810438cc7cea257ba1252a01142c69e7677655f0edd6a902590a079ae`.
- Inputs: `spike.md`
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`,
  `design-map.md`
  `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`
  (verified by content hash).
- Result: succeeded; evaluator revision `001` frozen.
- Outputs: `eval-requirements.md`
  `sha256:50182839061aeb7bd3efe6da2f6ce6d7166bb1ee6d0f6d393b4c692897c80820`,
  `coverage-map.json` (8 criterion records, pre-freeze integrity validation
  PASS, evaluator revision identity
  `sha256:393a71adc7df9fd60446a7cabcea16f4f7877d1604668720ee98d6dd03737f41`),
  `manifest.md`.
- Checks: controlled positive, baseline-negative and single-defect negative
  exercises on a discarded scratch reference; no candidate execution.
- Measurements: wall-clock time and token usage unavailable.

## Implementation — execution 7db79cf5-1777-4c91-a0b2-b88acfc25880

- Skill: `implementation`, contract version 5
  (`sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`).
- Workflow: `014f-inactive-workflow-grant-retirement`; Role Grant
  `sha256:a2bdbe5dda301d326b390b271c769f0414279f32f97f1e3b3e49688839e652b1`.
- Inputs: `spike.md`
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`,
  `design-map.md`
  `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`,
  `eval-requirements.md`
  `sha256:50182839061aeb7bd3efe6da2f6ce6d7166bb1ee6d0f6d393b4c692897c80820`.
  No implementation feedback (first attempt). Base commit `17bdde7`.
- Outputs (sha256): `src/kernel/execution.ts`
  `321c2a41c2573527454b74bca4693c000542b4650f040faf8a03b6d8ffba6690`,
  `src/kernel/host.ts`
  `a7c99cec44c8fee46742b7a118ba87bba07a4f93079db6167a8daed109058414`,
  `src/kernel/resolver.ts`
  `5291a24bfdc20bd327e69aa5b6368a48bec0a5a1bd0b443b7e54bdb5165f6263`,
  `test/kernel.test.ts`
  `1ada4a494cfea38e7e4021107a5805c07ad2892f432bed0f7f8afe21140047b2`.
- Status: candidate produced. Added `retireWorkflowGrant`, a shared
  revoked/retired liveness predicate, the `grant-retirements` host operation,
  and two visible tests.
- Checks: `node --test test/kernel.test.ts` 34/34 pass; `tsc --noEmit` clean;
  `eslint` clean; `prettier --check` on sources clean. `npm test`: 197/198
  pass; the one failure (`test/legacy-bridges.test.ts` 014d §7, EISDIR reading
  a directory) is unrelated to this change. `npm run format:check` reports an
  unreadable untracked `.zshrc` (EACCES) in the environment. `git diff --check`
  was not run.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator verify — attempt 001

- Skill: evaluator v14, mode verify. Candidate
  `a2ed538330ace7a51b9585dcba404035c72c973f`, evaluator revision 001
  (`sha256:393a71adc7df9fd60446a7cabcea16f4f7877d1604668720ee98d6dd03737f41`).
- Result: BLOCKED, INFRASTRUCTURE_FAILURE. Frozen identities matched; 6/6
  mandatory executable cases passed; 7/8 criteria satisfied. AC07 (repository
  regression) not adjudicated: an environment-caused failure of one unrelated
  test in each run, plus an unreadable untracked file for the formatter.
- No promotion requested. Measurements unavailable.

## Evaluator verify — attempt 002

- Skill: evaluator v14, mode verify. Candidate
  `a2ed538330ace7a51b9585dcba404035c72c973f`, evaluator revision 001
  (`sha256:393a71adc7df9fd60446a7cabcea16f4f7877d1604668720ee98d6dd03737f41`).
- Result: BLOCKED, INFRASTRUCTURE_FAILURE. Frozen identities matched; 6/6
  mandatory executable cases passed; 7/8 criteria satisfied. AC07 (repository
  regression) not adjudicated: the verification sandbox grants write access to
  the harness workspace, so one unrelated containment test cannot hold, and the
  formatter cannot read an untracked sandbox artifact.
- No promotion requested. Measurements unavailable.

## Evaluator Prepare — execution b0f964d3-0539-49c7-b1c8-20fb9ac8272e

- Skill: `evaluator`, mode `prepare`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Workflow: `014f-inactive-workflow-grant-retirement`; Role Grant
  `sha256:faec3b470cb23134d01a98055a53f341b82f6f8d9baaef1d736a1e43fe582908`.
- Inputs: `spike.md`
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`,
  `design-map.md`
  `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`
  (host-bound identities).
- Result: succeeded; evaluator revision `002` frozen (replaces the
  environment-blocked regression evidence plan of revision `001`; acceptance
  semantics unchanged).
- Outputs: `eval-requirements.md` `sha256:3e0c93e27cf21821703b1df7f2b3e7a9845d11967f95c3640520398ee7269cd4`, `coverage-map.json` (8
  criterion records, pre-freeze integrity validation PASS, evaluator revision
  identity
  `sha256:39fcf19c29b5562fdc482752b0d7a3fd6452cd566a0693170237a1c70be039ab`),
  `manifest.md`.
- Checks: controlled positive, baseline-negative and single-defect negative
  exercises on a discarded scratch reference; no candidate execution.
- Measurements: wall-clock time and token usage unavailable.

## Implementation — execution 6fab9128-013e-44cf-9f61-1b1a6fcb657a

- Skill: `implementation`, contract version 5
  (`sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`).
- Workflow: `014f-inactive-workflow-grant-retirement`; Role Grant
  `sha256:e5bbef29b253d25c909561ec86fdd81adeecc14e93418784b6dc7db5a9993a1b`.
- Inputs: `spike.md`
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`,
  `design-map.md`
  `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`,
  `coverage-map.json`
  `sha256:14527f3f714d5d0bb86de59762adc01303f9b11ef4c097870d50e7da1cc7f15a`,
  and `eval-requirements.md`
  `sha256:3e0c93e27cf21821703b1df7f2b3e7a9845d11967f95c3640520398ee7269cd4`.
  No implementation feedback was bound. Base commit `cbf2dd6`.
- Outputs (sha256): `src/kernel/execution.ts`
  `c83a37d36bb05ea667aed4ef99fb02b8634fce9a065dbd0aaac43e82842b2c05`,
  `src/kernel/host.ts`
  `91bdb534e04811f345be0def48031dda8530e625cfbd0c983ddd271138f24422`,
  `src/kernel/resolver.ts`
  `b8b7fd2ef653a0570421e2400ed7ff48ee7631443c61d908469d324ab143bb63`,
  and `test/kernel.test.ts`
  `5d4d8aa59386cc760d8ba3d42ceea26cba87678bb77339e68382e9986339f71d`.
- Status: candidate produced. The committed retirement implementation remains
  coherent under evaluator revision 002; that revision changed the regression
  evidence plan, not the frozen feature semantics, so no source rewrite was
  required.
- Checks: exact pure retirement kernel test 1/1 pass; `tsc --noEmit` clean;
  focused `eslint` clean; focused `prettier --check` clean; candidate
  `git diff --check` clean. The broader `npm test` run was stopped after two
  bounded waits: 5 of 20 test files reported pass, 15 reported failure, and the
  process did not terminate. Direct diagnostics identified worker-sandbox
  denials (`listen EPERM` and nested `git` `EPERM`); the pure retirement test
  passed, while the host retirement test was among the localhost-bind denials.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator verify — attempt 005

- Skill: `evaluator`, mode `verify`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Workflow: `014f-inactive-workflow-grant-retirement`; execution
  `832e166b-454d-4a55-ae33-d456dd9e1354`; Role Grant
  `sha256:283ae4834b45f9257f5366dbdd73a17638c1e1882c3ab6e92db7cc1de15011a8`.
- Inputs: candidate `af75b14d1847af02404a591a8829751dc8df2a2e`;
  evaluator revision `002`
  (`sha256:39fcf19c29b5562fdc482752b0d7a3fd6452cd566a0693170237a1c70be039ab`);
  brief `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`;
  design `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`;
  coverage `sha256:14527f3f714d5d0bb86de59762adc01303f9b11ef4c097870d50e7da1cc7f15a`.
- Result: `BLOCKED`, `INFRASTRUCTURE_FAILURE`. Frozen identities matched,
  but the runtime provided no writable disposable storage, so 0/11 mandatory
  executable cases ran and 0/8 criteria were adjudicated.
- Outputs: `verification-result.json`, `manifest.md`. No promotion requested.
- Measurements: unavailable.

## Evaluator verify — attempt 008 and forward evidence repair

- Authority: explicit one-use human authorization for the unchanged Spike 014f
  candidate and evaluator revision; Workflow Grant
  `96780035-e4b6-4c30-97e5-a7d644b3a831`, root authority
  `05928639-d540-4e6f-a226-68628581385a`, Role Grant
  `sha256:a733098af7fbcee216981189630c625794d7a897ebda8bc0ad5ff6c34d312ecf`.
- Execution: `7b26f056-fd50-46c1-90dc-a072295373a6`; provider profile
  `claude-sonnet`; confirmed model `claude-sonnet-5-5`; Claude Code `2.1.292`.
- Inputs: candidate `af75b14d1847af02404a591a8829751dc8df2a2e`;
  evaluator revision `002`; trusted methodology sequence 6.
- Result submitted: `BLOCKED`, `INFRASTRUCTURE_FAILURE`; 0/11 executable
  procedures ran and 0/8 criteria were adjudicated. Claude's nested shell
  sandbox failed before evaluator commands ran while trying to create
  `/home/velveteen/vk-code/harness/.claude/hooks` inside the outer read-only
  repository mount. No promotion was requested.
- Evidence history: the first bounded evidence action replaced this manifest
  with `PLACEHOLDER` and committed it with the attempted result as
  `5031475e47b0894c87e6bc8f89cf450ba73f61c5`; the second replaced the
  placeholder with a partial reconstruction in
  `f938fec61f7574a7e274a242a6522cb91e314fe7`. Both commits remain immutable in
  history. This forward correction restores the exact manifest at
  `1c1b432ccb68e856926d8635a11ab39def7ef17e` and appends this record; it does
  not erase the overwrite.
- Validation failure: `verification-result.json` used `candidate` instead of
  the validator-bound `commit` field. `schemaVersion: 1`, evaluator revision
  `002`, and result `BLOCKED` matched; the missing `commit` caused
  `verification result identity mismatch`.
- Canonical status: the ledger records `kernel.result` followed by
  `kernel.transition-blocked`; it contains no `verification-finalized` event
  for attempt 8. This correction does not fabricate one. The attempted public
  result remains historical infrastructure-failure evidence.
- Measurements: provider calls 1; other runtime measurements unavailable.

## Evaluator verify — attempt 009

- Skill: `evaluator`, mode `verify`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Workflow: `014f-inactive-workflow-grant-retirement`; execution
  `d59a2e87-2bf0-494c-86af-9012967229b6`; Role Grant
  `sha256:2be47c1a08de48261c0263c65ac6c9b356a97f2d2ad75cf0111441412d4a8f05`.
- Inputs: candidate `af75b14d1847af02404a591a8829751dc8df2a2e`; evaluator
  revision `002`
  (`sha256:39fcf19c29b5562fdc482752b0d7a3fd6452cd566a0693170237a1c70be039ab`);
  brief `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`;
  design `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`;
  coverage `sha256:14527f3f714d5d0bb86de59762adc01303f9b11ef4c097870d50e7da1cc7f15a`.
- Result: `PASS`. Frozen identities matched; 11/11 mandatory executable
  procedures passed; the 2 non-executable procedures (differential regression,
  provenance) were satisfied; 8/8 criteria adjudicated and satisfied.
- Outputs: `verification-result.json` (carries the validator-bound `commit`
  field), `manifest.md`. Promotion is requested separately through the host.
- Measurements: unavailable.
