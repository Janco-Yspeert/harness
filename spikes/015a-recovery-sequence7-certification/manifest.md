# Manifest — Spike 015a Recovery Sequence 7 Certification

## Brief Readiness

- Skill: brief-readiness, contract version 5
- Inputs: `spike.md` (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`)
- Result: `succeeded`; verdict `READY` (Ready after minor clarification; six non-blocking material clarifications retained)
- Outputs: `feedback.md`; `manifest.md`; no preliminary snapshot
- Checks: bound input identity matched; targeted public-contract inspection (`AGENTS.md`, `skills/outcome/SKILL.md`, `methodologies/harness/policy.json`, `src/methodology-evolution.ts`, and selective prior public feedback); no executable checks run
- Measurement cutoff: immediately before this manifest update.

## Design Map

- Skill: design-map, contract version 4
- Inputs: frozen `spike.md` (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`), committed at `df46058ebfb19d4e820c29357f215f40ead391b3`
- Result: `succeeded`
- Output: `design-map.md` (`sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`)
- Checks: verified the bound brief identity and committed provenance; inspected the public brief-readiness findings and relevant public Outcome, policy, host, candidate-subject, and contract seams; no executable checks required for this documentation contract
- Measurement cutoff: immediately before this manifest update.

## Evaluator Prepare

- Skill: evaluator, contract version 14, mode `prepare`
- Inputs: frozen `spike.md` (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`), `design-map.md` (`sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`)
- Result: `succeeded`; evaluator revision `001` frozen (`sha256:2d8883ce53a17b9e04d6cf4eb2a6f530ca8f1219fb824f2fd15314978c224105`), private inventory `sha256:d8909283670e222339e2a9d28c4677766fae36749e6ca31c310426815e109ab4`
- Outputs: `eval-requirements.md` (`sha256:0d370ed19e102d40d89e0f010016383bfa7f50b801bae7bfbe4fbe2a90623f8f`); `coverage-map.json` (11 criterion records, BC01–BC11, readiness attestation PASS); `manifest.md`
- Checks: pre-freeze structural integrity validation passed; controlled positive/negative exercise of the one executable case passed; candidate implementation not executed
- Measurement cutoff: immediately before this manifest update.

## 2026-11-03 — Implementation

- Execution: `bb55896d-f3e2-497e-9383-312c27bc67b0`.
- Skill: implementation, contract version 6
  (`sha256:f41e0d0c335b8123a47590bf1cd9364c1473209064d74c542e16de25600c9e9e`).
- Inputs: `spike.md`
  (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`),
  `design-map.md`
  (`sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`),
  `coverage-map.json`
  (`sha256:8930ef2a750dadde7ff993fde41c7dc15d0efa560c6420f8e2a0d2949c4b43f7`),
  and `eval-requirements.md`
  (`sha256:0d370ed19e102d40d89e0f010016383bfa7f50b801bae7bfbe4fbe2a90623f8f`).
- Result: `succeeded`; not independently evaluated. The candidate adds the
  closed sequence-8 split-coding-smoke declaration, a host-only bounded Node
  test finalizer with distinct production/adapter-double provenance, immutable
  attempt and success evidence, and current-record enforcement for Outcome
  allocation and STANDARD transition while preserving explicit
  PROCESS_EXCEPTION and undeclared predecessor behavior. The Outcome skill is
  materially versioned to contract version 6.
- Output content identity before this entry:
  `sha256:749d808500ea5cb0592803689807d8cd47a68dd5e61324e8fbe6469417bc5780`
  over the staged binary diff of nine implementation/test/contract paths,
  excluding this manifest (2,356 insertions and 51 deletions).
- Visible verification: focused completion suite passed 14 tests; selected
  unaffected regression suites passed 72 tests; syntax/import checks, JSON
  parsing, scoped `git diff --check`, baseline ancestry, trusted-sequence-7,
  frozen Spike 015 history, baseline test inventory, and worker-protocol scope
  checks passed. The broad native suite was attempted but dependency-dependent
  files could not load because the lockfile install failed with registry DNS
  `EAI_AGAIN`; other Git-fixture tests encountered the environment's inherited
  `spawnSync git EPERM` condition. TypeScript, ESLint, and Prettier checks were
  therefore unavailable locally.
- Limitations: no live provider, network, remote push, methodology adoption, or
  post-adoption sequence-8 pilot was exercised. Evaluator-private material and
  workflow ledgers were not inspected. Unrelated worktree and runtime residue
  was preserved and excluded from the candidate.
- Measurement cutoff: immediately before this manifest update.

## 2026-11-03 — Evaluator Verify

- Skill: evaluator, contract version 14, mode `verify`; attempt 1.
- Inputs: candidate `62e78d481c061881c9aa971d9b74512ca18174b8`; evaluator revision `001`; all frozen brief, Design Map, requirements and evaluator identities matched.
- Result: `succeeded`; verdict `BLOCKED`, classification `INFRASTRUCTURE_FAILURE`.
- Checks: the Git-inspection case passed; the repository check run could not execute because the evaluation environment lacks installed dependencies and network access; review procedures not adjudicated. No promotion requested.
- Measurement cutoff: immediately before this manifest update.

## 2026-11-04 — Evaluator Verify

- Skill: evaluator, contract version 14, mode `verify`; attempt 2.
- Inputs: candidate `62e78d481c061881c9aa971d9b74512ca18174b8`; evaluator revision `001`; all frozen identities matched.
- Result: `succeeded`; verdict `FAIL`, classification `IMPLEMENTATION_FAILURE`.
- Checks: the Git-inspection case passed; typecheck, lint and format:check fail at the candidate while clean at baseline; test failures equal the inherited set. Review procedures not adjudicated. Public feedback in `feedback.md`. No promotion requested.
- Measurement cutoff: immediately before this manifest update.

## 2026-11-04 — Implementation Retry

- Execution: `587ac885-6a0e-4e85-bf14-aba30a66af68`.
- Skill: implementation, contract version 6
  (`sha256:f41e0d0c335b8123a47590bf1cd9364c1473209064d74c542e16de25600c9e9e`).
- Inputs: `spike.md`
  (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`),
  `design-map.md`
  (`sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`),
  `coverage-map.json`
  (`sha256:8930ef2a750dadde7ff993fde41c7dc15d0efa560c6420f8e2a0d2949c4b43f7`),
  `eval-requirements.md`
  (`sha256:0d370ed19e102d40d89e0f010016383bfa7f50b801bae7bfbe4fbe2a90623f8f`),
  and bound `IMPLEMENTATION_FAILURE` feedback
  (`sha256:840202d52057f664090e74713a55dbfd2afd0ab711b844aef18edae9fb71c1e6`).
- Result: `succeeded`; not independently evaluated. Corrected the reported
  TypeScript exact-optional and literal typing failures, ESLint violations and
  Prettier drift without changing the frozen completion behavior. Malformed
  non-string handoff commit evidence now remains non-satisfying without unsafe
  object stringification.
- Output content identity before this entry:
  `sha256:f3dd88a1df5552ffcad61ea620a68962632188446ab5fc819cf696f34360010e`
  over the staged binary diff of five implementation/test/contract paths,
  excluding this manifest (503 insertions and 534 deletions, including required
  Prettier normalization).
- Visible verification: `npm run typecheck`, `npm run lint`,
  `npm run format:check`, focused `node --test test/completion-smoke.test.ts`,
  scoped `git diff --check`, baseline ancestry/history checks and baseline test
  inventory preservation passed. The broad `npm test` run was attempted; the
  focused completion suite passed, while unrelated suites reproduced the
  sandbox's inherited Git/containment failures and the terminal wrapper stalled
  after the test process exited without emitting its final TAP summary.
- Limitations: no live provider, network, remote push, methodology adoption or
  post-adoption sequence-8 pilot was exercised. Evaluator-private material and
  workflow ledgers were not inspected. Unrelated worktree and runtime residue
  was preserved and excluded from the candidate.
- Measurement cutoff: immediately before this manifest update.
