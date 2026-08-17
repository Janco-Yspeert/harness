# Spike 006 — Workflow Manifest

This append-only record begins during Spike 006. Earlier entries are
retrospective and contain only facts recoverable from preserved artifacts.
Unavailable runtime telemetry is recorded as unavailable rather than invented.

## Run 001 — Brief Readiness

- Recorded: retrospectively
- Skill: `spike-review` v1
- Agent/tool: Codex
- Result: `Not ready to freeze`
- Input: `preliminary/001/spike.md`
- Output: `preliminary/001/feedback.md`
- Findings: 2 blockers, 2 material clarifications
- Other execution statistics: unavailable

## Run 002 — Brief Readiness

- Recorded: retrospectively
- Skill: `spike-review` v1
- Agent/tool: Codex
- Result: `Not ready to freeze`
- Input: `preliminary/002/spike.md`
- Output: `preliminary/002/feedback.md`
- Findings: 2 blockers, 1 material clarification
- Other execution statistics: unavailable

## Run 003 — Brief Readiness

- Recorded: retrospectively
- Skill: `spike-review` v1
- Agent/tool: Codex
- Result: `Not ready to freeze`
- Input: `preliminary/003/spike.md`
- Output: `preliminary/003/feedback.md`
- Findings: 1 blocker
- Other execution statistics: unavailable

## Run 004 — Brief Readiness

- Recorded: retrospectively
- Skill: `spike-review` v1
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: `spike.md`
- Input content identity: `sha256:21b6f9da7507c518b0d91f8d28111db9ba56a7d525472fc800e952a1c3213549`
- Output: `feedback.md`
- Output content identity: `sha256:39648e0bd8b26a137603b9e4dbd6fa4cbd9bf91834b623e8814d23117c2f6965`
- Findings: none
- Other execution statistics: unavailable

## Run 005 — Implementation

- Recorded: contemporaneously
- Skill: `implementation` v1, under the frozen Spike 006 process exception
- Agent/tool: Codex
- Result: candidate prepared and committed by the containing implementation commit
- Inputs: frozen `spike.md`, `AGENTS.md`, `GOALS.md`, repository documentation,
  active v1 skills, and preserved readiness history
- Output: methodology skills, supporting templates, repository instructions,
  documentation, historical skill contracts, and this manifest
- Output identity: the containing implementation commit; resolved after commit
- Files inspected: repository instructions, workflow documentation, active skill
  contracts/templates, Spike 006 brief and readiness history, package tooling
- Files changed: 29 paths in the candidate working tree
- Tests/checks: `npm run check` passed (typecheck, lint, Prettier check, 21 tests)
- Other reliably available statistics: unavailable

## Run 006 — Claude evaluator compatibility

- Recorded: contemporaneously
- Skill: `evaluator` v2
- Agent/tool: Claude Code 2.1.232
- Mode/stage: compatibility review; neither `prepare` nor `verify` was run
- Result: `PASS`
- Input: public candidate commit `e943b1bed4b609f685e52761db4e2d65183875ef`
- Output: `claude-compatibility.md`
- Checks: skill discovery, invalid-mode invocation, frontmatter and arguments,
  project-root and mirrored hidden-sibling conventions, Codex-specific
  assumption review
- Private evaluator content inspected: none
- Correction: removed one obsolete redundant permission rule from gitignored
  local Claude settings
- Limitation: no end-to-end evaluator mode was exercised
- Other reliably available statistics: unavailable

## Run 007 — Candidate contract correction

- Recorded: contemporaneously
- Skill: `skill-creator` (system skill)
- Agent/tool: Codex
- Result: candidate revised; prior readiness result and candidate revision
  invalidated pending another Brief Readiness pass
- Reason: project-owner direction expanded Design Map from recording settled
  structural decisions to establishing the smallest behavior-preserving shared
  contract required by implementation and evaluation
- Inputs: `skills/design-map/SKILL.md`, live Spike 006 brief, repository workflow
  documentation, Codex skill-format guidance
- Outputs: revised Design Map contract, aligned brief and README wording, and
  Codex-compatible body-level contract versions for active skills
- Validation: `quick_validate.py` passed for all Codex-facing active skills;
  evaluator retains its required Claude-specific frontmatter and therefore is
  not expected to pass the Codex-only validator
- Consequence: the prior Claude compatibility result must be rerun because the
  evaluator frontmatter representation changed
- Repository checks: `npm run check` passed after one transient test-runner
  startup failure; direct rerun passed all 21 tests before the full check passed
- Other reliably available statistics: unavailable

## Run 008 — Claude evaluator compatibility revalidation

- Recorded: contemporaneously
- Skill: `evaluator` v2
- Agent/tool: Claude Code 2.1.232
- Mode/stage: compatibility review; neither `prepare` nor `verify` was run
- Result: `PASS`
- Input: candidate commit `2cf889a`
- Output: appended revalidation evidence in `claude-compatibility.md`
- Checks: skill discovery, body-level contract version parsing, invalid-mode
  gating, unchanged project-root and hidden-sibling conventions
- Private evaluator content inspected: none
- Limitation: no end-to-end evaluator mode was exercised
- Other reliably available statistics: unavailable

## Run 009 — Evaluator review corrections

- Recorded: contemporaneously
- Skill: `skill-creator` (system skill)
- Agent/tool: Codex, applying focused Claude review findings
- Result: evaluator candidate corrected
- Input: `skills/evaluator/SKILL.md` v2 and public evaluator templates
- Outputs: explicit diagnostic-probe contract, terminal
  `SPECIFICATION_DRIFT` handling, and bounded public aggregate-statistics rule
- Review disposition: accepted the dangling-reference and drift findings;
  refined rather than deleted telemetry because the current Spike 006 brief
  requires capability-dependent manifest statistics
- Private evaluator content inspected: none
- Validation: formatting passed; `npm run check` passed with all 21 tests after
  the same transient first-launch test-runner failure already recorded for the
  candidate revision
- Other reliably available statistics: unavailable
