# Spike 013a — Verification Feedback (attempt 004)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  source commit `fae05912f59f8ebdb8982ab16deb26e293754647`), per the frozen
  `spike.md` "Evaluator bootstrap and self-modification exception".
  `skills/evaluator/SKILL.md` from the working tree was confirmed
  byte-identical to this pin.
- Implementation evaluated: `feat/spike-013a` @ `3edb31603c1b97eb4f2d52b56c52d4965962113d`
  ("fix: allow bounded Claude evaluator commands"), implementation attempt `4`.
- Frozen evaluator revision: `002` (unchanged from attempts 002/003; no
  evaluator correction was needed or performed this attempt).
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`, and every hidden test file) all re-hashed and confirmed
  byte-identical to their frozen identities — no specification drift.

## Result

**BLOCKED — `INFRASTRUCTURE_FAILURE`.** Not `FAIL`: no criterion was found
unsatisfied this attempt. Not `PASS`: 2 of 35 mandatory criteria (plus one
criterion that depends on them) remain unestablished because required
live-Claude evidence could not be gathered this attempt, for a reason external
to this implementation.

## What was fixed since attempt 003

Attempt 003 confirmed a genuine implementation failure: real, replicated live
Claude executions through the candidate's delegated-role path refused the
role, because the framing used to deliver it did not read as genuine system
authority. This candidate replaces that framing with a real Claude Code
`--system-prompt` replacement (rather than any user-turn-embedded header) and,
separately, fixes a distinct problem this evaluator observed in an interim
runtime attempt: even once delegation itself succeeds, the delegated Claude's
Bash tool denied the ordinary `git`/`npm`/`node` commands the evaluator
contract requires, with no approval channel available to unblock them.

This candidate now derives a bounded, capability-scoped command-family allow
list (`git`, `npm`/`npx`, `node`/`python3`) and layers it inside Claude Code's
own mandatory native OS sandbox (sandboxed commands auto-approved; unsandboxed
retry disabled; only the exact declared workspaces plus a fresh, run-scoped,
host-created, auto-removed scratch directory are readable). No bare/unbounded
Bash approval and no permission-prompt bypass was introduced.

All 33 previously-satisfied criteria remain satisfied, re-confirmed fresh
against this exact commit: 5/5 mandatory hidden tests, 70/70 visible tests
(one new public regression added for the scratch-workspace behavior),
typecheck, lint, and diff checks all clean.

## What remains blocked, and why

**AC08, AC09 (Claude delegated evaluator execution), AC34 (Spike 011 recovery
readiness): `BLOCKED`.**

This evaluator attempted the full, real, frozen live-Claude fixture procedure
against this exact candidate: a disposable fixture spike, a real locally
started Harness host (not a mock backend), a genuine allocation request, and
a genuine attempt to launch the real Claude executor. The host correctly
resolved canonical authority and attempted a real process launch; that launch
failed because the required Claude executable is not present in this
evaluation session's own environment (`spawn claude ENOENT`) — an external
executor-availability limitation, not a candidate defect. The equivalent
Codex path remains independently confirmed working end-to-end from earlier
attempts and is unaffected by this candidate's changes.

Per the frozen brief, a required live-provider executor being unavailable for
an external reason blocks the affected criteria rather than passing them on
substitute evidence.

## Next steps

This attempt's block is not resolvable by further implementation work, and
the evaluator will not apply a correction for it (there is no evaluator
defect here to correct). Resolving it requires either a subsequent
verification attempt run from a session or environment where the real Claude
executor is reachable, or fresh, independently-verifiable external live-Claude
evidence for this exact candidate commit (as was obtained and independently
corroborated for a prior candidate in attempt 003). Do not promote in the
meantime; this same frozen evaluation (revision `002`) governs any further
attempt.
