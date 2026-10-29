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

## Implementation Retry

- Skill: implementation, contract version 6 (attempt 2)
- Inputs: `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`), implementation feedback (`sha256:7120b812f36ea16386f2817ac9b1978e7089dfa710d3075d3864526c5ff851d5`)
- Result: `succeeded`; correction candidate produced; not independently evaluated
- Changes: repository-qualified source/workflow binding validation and ancestry checks; split allocation/result/transition authority snapshots; docs-owner committed-input validation; writable-workspace launch selection; attached-session workspace-provenance refusal; split-only implementation manifest evidence; stale docs/source partial-checkpoint refusal; host-committed split promotion checkpoint; expanded 25-case split integration/configuration suite and operator documentation
- Output content identity: implementation diff excluding this manifest entry (`sha256:77016dca2d023db52eac943672d74c62fdf25cd5bb66f401d63c46e98e9c854b`)
- Checks: `npm run typecheck`, `npm run lint`, and `npm run format:check` PASS; `node --test test/orchestration.test.ts test/worker-context.test.ts` PASS (2 files); current methodology including split-only evidence contract loaded with the pinned public validators
- Environment limitation: the 25-case Git-backed `test/split-workflow.test.ts` suite could not execute in this worker sandbox because every Node `spawnSync git` call was refused with `EPERM`; the broader suite was not completed for the same process-spawn restriction
- Scope limitations: no real-provider coding smoke was run (AC14); the changed implementation contract is a candidate identity only and was not self-adopted (AC15); independent evaluation and later human trust/adoption remain required
- Measurement cutoff: immediately before this manifest update.

## Pre-Semantic Implementation Correction

- Skill: implementation, contract version 6 (attempt 3)
- Inputs: candidate `781b54ecd2fbb8296291d0b0ea50d14fbbfe2715`; `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`); one-shot root authority `60d8c4a9-e0d4-4de5-bd51-6de5d6846007`
- Result: `succeeded`; authorized test-only correction candidate produced; not independently evaluated
- Changes: updated the two split-workflow refusal assertions to the configured writable-public-workspace diagnostic; completed the synthetic `RoleGrant` fixture with mandatory provenance, executor-constraint and predecessor/root-authority fields; removed the unsafe double assertion
- Output content identity: implementation diff excluding this manifest entry (`sha256:0e0d5f19f82bcab6a09ae6c140be553bbe2922bce95288573a9d8b54f0843111`)
- Checks: `npm run typecheck`, `npm run lint`, and `npm run format:check` PASS; `node --test test/orchestration.test.ts test/worker-context.test.ts` PASS (2 files); `git diff --check` PASS for the corrected test
- Environment limitation: `test/split-workflow.test.ts` could not execute because all 25 cases were refused at fixture setup when Node `spawnSync git` returned `EPERM`; the broader `npm test` run likewise did not complete successfully under the sandbox's subprocess restrictions
- Scope: no production, evaluator, routing or acceptance-criteria changes
- Measurement cutoff: immediately before this manifest update.

## Evaluator Verify (attempt 2)

- Skill: evaluator, contract version 14, mode `verify` (attempt 2)
- Inputs: candidate `5ef6230eb85b4fc0371bcdbc54007c525725e658`, evaluator revision 001, `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`)
- Result: `succeeded`; verdict `FAIL`, classification `IMPLEMENTATION_FAILURE`
- Outputs: `verification-result.json`, `feedback.md`, `manifest.md`
- Checks: frozen inputs matched; configuration cases 32/32 passed; public regression unchanged versus parent; AC10, AC14 and AC15 unmet; 8 criteria not individually adjudicated
- Measurement cutoff: immediately before this manifest update.

## Implementation Retry (attempt 4)

- Skill: implementation, contract version 6
- Inputs: `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`), implementation feedback (`sha256:5eac816cac5dac0b9f1db96840257f2d7f709fa68ee0347e79d8ee62da710840`)
- Result: `succeeded`; bounded AC10 correction candidate produced; not independently evaluated
- Changes: extended the production-host scripted fidelity fixture to create distinct source, workflow-docs and methodology Git repositories; routed scripted public writes to the granted writable repository; added split lifecycle coverage for brokered implementation/evaluator evidence, repository-qualified promotion, As-Built, human acceptance, Outcome, implementation retry and evaluator repair with preserved three-attempt history
- Output content identity: implementation diff excluding this manifest entry (`sha256:b4eec50502b74e06cfa031c5bb0a8c5c2a14ae024197478fb0210406487e3ad4`)
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, targeted `git diff --check`, and `node --test test/orchestration.test.ts test/worker-context.test.ts` PASS
- Environment limitation: `test/skill-fidelity.test.ts` could not execute in this worker sandbox because Node `spawnSync git` was refused with `EPERM`/`ENOENT` at fixture initialization; no lifecycle assertion ran, and the failure occurred before candidate test logic
- Frozen-sequence limitation: human input `808db1fe-ccab-4988-aeb1-9c63800b86e5` confirmed that trusted sequence-7 runtime `3e753a4a732c87fc5b42e9e3cf771482aba6a522` cannot represent the split smoke and that no accepted split-capable runtime exists. Per the frozen post-acceptance order, no real-provider smoke or trust adoption was attempted; AC14 and AC15 remain explicitly unresolved and no authority was fabricated.
- Measurement cutoff: immediately before this manifest update.

## Pre-Semantic Implementation Correction (attempt 5)

- Skill: implementation, contract version 6
- Inputs: candidate `5cf454eeeaaae363d5b5f48c23db77ab32485d98`; `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`); one-shot root authority `a9633cf0-aceb-4cff-89e4-d35f9fa5aaf5`
- Result: `succeeded`; authorized test-fixture correction candidate produced; not independently evaluated
- Changes: created the disposable split-fixture source directory recursively before its Git initialization; no production, evaluator, adoption, smoke or acceptance-criteria behavior changed
- Output content identity: implementation diff excluding this manifest entry (`sha256:35013fea76cb65a31e27f4ce23a5a80b4469070d8e6504e5e155e5c6e6e4034f`)
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, and targeted `git diff --check` PASS
- Environment limitation: both `015 AC10` cases and the broader `npm test` suite were attempted, but this managed worker reports Node `spawnSync git` as `EPERM` despite child status 0; the focused cases stopped at fixture Git initialization before lifecycle assertions, and the broader run was terminated after the same failures left it hanging
- Scope: no further fixture defect was exposed before the environment-level process-spawn refusal
- Measurement cutoff: immediately before this manifest update.

## Pre-Semantic Implementation Correction (attempt 6)

- Skill: implementation, contract version 6
- Inputs: candidate `57b2266318f70f8cc49fcd695d6d4916588606d6`; `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`); one-shot root authority `e3b2e7ff-6fff-4796-9f20-76dbd3df312b`; validated disposable patch `f3b81a866d49a2db8b8c7d358529a84c1f6d4a0f`
- Result: `succeeded`; authorized AC10 correction candidate produced; not independently evaluated
- Changes: allowed only split Implementation grants with writable source and source-only Git commit authority alongside read-only docs and host-brokered evidence; refused missing, mismatched or widened split authority; preserved ordinary and legacy evidence composition; corrected mixed-workspace worker instructions; completed deterministic adapter, lifecycle, recovery and worker-context coverage
- Output content identity: implementation diff excluding this manifest entry (`sha256:a7b5023a6465613e23e79cac32861e7b194c273644a9627ebb062f36dea8fee2`)
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, `git diff --cached --check`, and `node --test test/worker-context.test.ts` PASS; the five corrected files match the authorized disposable patch tree exactly
- Environment limitation: focused Git-backed split workflow and AC10 lifecycle tests failed at fixture setup because Node `spawnSync git` reported `EPERM`; `npm test` was attempted and all visible test files reported, but the runner did not exit after the same sandbox subprocess failures and was interrupted after three empty 30-second polls
- Scope: no evaluator, adoption, smoke, frozen-contract or unrelated production change; existing unrelated working-tree residue was preserved and excluded
- Measurement cutoff: immediately before this manifest update.

## Root-Authorized Implementation Correction (attempt 7)

- Skill: implementation, contract version 6
- Inputs: candidate `d4479fd083529169fafd09f1155a19c31ba7d01d`; `spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), `design-map.md` (`sha256:0c4682d02c8b3cc74818000625bfe9a79f60a5b4561607b9c7dac1db5eaf5a5c`), `coverage-map.json` (`sha256:25774ad65316d4e8ec2c2e586ba4f526f74787e3390a39f063a293997304bc27`), `eval-requirements.md` (`sha256:bb09fe3bd974c337f97679a69ed43143a966d3c9426363520b498ac4ac31bcdd`); one-shot root authority `07addd27-77c0-4535-a121-5ee8e44ead3f`; validated experimental runtime `29eb21bbb2e6a4d3d7c324e49086704ab622d8d3`
- Result: `succeeded`; authorized readiness-hardening correction candidate produced; not independently evaluated
- Changes: incorporated the exact authorized eight-file runtime diff; added configurable bounded readiness deadlines, explicit structured rate-limit recognition, bounded redacted private readiness diagnostics, bounded stream parsing, and deterministic timeout termination/reaping; preserved the existing Spike 015 split-workflow and AC10 changes
- Output content identity: implementation diff excluding this manifest entry (`sha256:1198a651a383d985bd9c3b9547db99700d41aa225b25f9ff1b148a9192251d7a`)
- Checks: `test/readiness-evidence.test.ts`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and targeted `git diff --check` PASS; all eight changed files match the validated runtime tree exactly
- Environment limitation: focused adapter, containment, split-workflow and both `015 AC10` lifecycle cases stopped at fixture initialization because Node `spawnSync git` reported `EPERM` despite child status 0; `npm test` reported 8 passing and 16 failing test files, then did not exit through two 30-second polls and was interrupted, with the same sandbox subprocess restriction confirmed by the focused runs
- Scope: no evaluator, adoption, smoke, methodology, routing, authority or unrelated change
- Measurement cutoff: immediately before this manifest update.
