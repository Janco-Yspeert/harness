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
