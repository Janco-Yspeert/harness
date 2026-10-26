# Manifest — Spike 015

## Brief Readiness

- Skill: brief-readiness, contract version 5
- Inputs: `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`)
- Result: `succeeded`; verdict `READY` (Ready after minor clarification; four non-blocking material clarifications retained)
- Outputs: `feedback.md`; `manifest.md`; no preliminary snapshot
- Checks: input identity matched; targeted repository inspection (`src/kernel/roots.ts`, `src/executors/`, `harness.project.json`); no code changes or tests run
- Measurement cutoff: immediately before this manifest update.

## Design Map

- Skill: design-map, contract version 4
- Inputs: `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`)
- Result: `succeeded`
- Outputs: `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`); `manifest.md`
- Checks: brief identity matched and committed (`550cbd14`); inspected `feedback.md`, `harness.project.json`, `src/kernel/configuration.ts`, `src/kernel/model.ts`, `src/executors/adapters.ts`; no code changes or tests run
- Measurement cutoff: immediately before this manifest update.

## Evaluator Prepare

- Skill: evaluator, contract version 14, mode `prepare`
- Inputs: `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`)
- Result: `succeeded`; evaluator revision 001 frozen; pre-freeze integrity validation PASS
- Outputs: `eval-requirements.md`, `coverage-map.json` (15 criterion records), `manifest.md`
- Checks: input identities matched; structural integrity validation passed; controlled pre-implementation exercise of mandatory executable cases; candidate not executed
- Measurement cutoff: immediately before this manifest update.

## Implementation

- Skill: implementation, contract version 6 (attempt 1)
- Inputs: `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`)
- Result: `succeeded` (partial scope, see limitations); not independently evaluated
- Outputs: `workflowWorkspace`/`workflowOrigin` configuration and preflight, workflow-root routing of ledger/artifact/coverage lookups, split grant `access`/`gitCommit`/`commits` with fail-closed `assertSplitGrant`, `test/split-workflow.test.ts` (17 tests), `docs/split-workflow.md`, `examples/split-project.example.json`
- Checks: `tsc`, eslint, prettier clean; `npm test` fails the same 11 pre-existing tests as the parent commit (no regressions); split tests pass
- Limitations: no real-provider smoke (AC14) was run; no contract/skill changes or trust adoption (AC15); implementation's brokered docs-evidence channel, per-role dispatch integration through a real split ledger, and partial-checkpoint/promotion integration tests are not implemented
- Measurement cutoff: immediately before this manifest update.

## Evaluator Verify

- Skill: evaluator, contract version 14, mode `verify` (attempt 1)
- Inputs: candidate `f2def40a5fe06701b499c24aaa0d8d5c70e80478`, evaluator revision 001, `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`)
- Result: `succeeded`; verdict `FAIL`, classification `IMPLEMENTATION_FAILURE`
- Outputs: `verification-result.json`, `feedback.md`, `manifest.md`
- Checks: frozen inputs matched; configuration cases passed; public regression unchanged versus parent; 9 of 15 criteria unmet or partially unmet are listed in the result
- Measurement cutoff: immediately before this manifest update.

## Verification Result Publication Correction

- Authority: bounded human-authorized, forward-only correction of attempt 1 public evidence format; no new evaluation or semantic result
- Inputs: candidate `f2def40a5fe06701b499c24aaa0d8d5c70e80478`; evaluator revision 001; original public checkpoint `0e8ea60be6833091637d9d71331519e2c942a536`; original artifact `sha256:bbc2e831928d91d1da5de10092c159a308b8b5140e9e3ec01f65b4063d578c58`; semantic result `021df628-d0cc-4a44-a93e-b027f870bae2`
- Result: corrected public schema; verdict remains `FAIL / IMPLEMENTATION_FAILURE`; 15 criteria accounted as 4 `SATISFIED`, 10 `NOT_SATISFIED`, and 1 `NOT_ADJUDICATED`
- Outputs: `verification-result.json` (`sha256:7120b812f36ea16386f2817ac9b1978e7089dfa710d3075d3864526c5ff851d5`); `verification-result-correction-001.md`; `manifest.md`
- Checks: exact pinned `verification-accounting` validator PASS; candidate/revision/attempt/verdict binding PASS; private finalization validator PASS; independent public-only evidence review PASS; recovery not yet invoked
- Measurement cutoff: immediately before this manifest update.
