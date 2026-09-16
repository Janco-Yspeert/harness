# Spike 013a — Verification Feedback (attempt 011)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  source commit `fae05912f59f8ebdb8982ab16deb26e293754647`), per the frozen
  `spike.md` "Evaluator bootstrap and self-modification exception".
  `skills/evaluator/SKILL.md` from the working tree was confirmed
  byte-identical to this pin.
- Implementation evaluated: cycle `002`, canonical `implementation-handoff`
  commit `eaaa53dc8ea487deff592f804154fd447bb26f86` ("fix: enforce
  host-owned evaluator permissions"), implementation attempt `10`. `HEAD`
  (`eaaa53dc8ea487deff592f804154fd447bb26f86`) was evaluated directly — no
  further commits on top, no implementation source content uncommitted.
- Frozen evaluator revision: `003` (unchanged since the cycle-002 repair; no
  further evaluator correction was needed or performed this attempt).
- Canonical binding: `workflow.jsonl` `verification-allocated` attempt `13`
  (`implementationAttempt: 10`, `cycle: "002"`).
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`, bootstrap snapshot) all re-hashed and confirmed
  byte-identical to their frozen identities this attempt — no specification
  drift.

## Result

**BLOCKED — `INFRASTRUCTURE_FAILURE`.** 32 of 35 mandatory criteria (AC01-07,
AC10-33, AC35) are `SATISFIED`, re-confirmed fresh this attempt. 3 of 35
(AC08, AC09, AC34) remain unestablished because the required live Claude
executor is still unreachable from this evaluation session, for the same
reason external to this implementation that blocked attempts 002, 004, 005,
007, 009, and 010.

Unlike the immediately preceding attempts, this attempt evaluates genuine new
implementation content, not a bookkeeping-only diff.

## What changed and was confirmed this attempt

- This candidate makes protected `evaluator-*` role permission profiles
  depend solely on the Harness host's own configuration
  (`HARNESS_EVALUATOR_WORKSPACE` read once, at the host's own process entry
  point) rather than on any caller-supplied request field. A protected
  allocation with no host-configured evaluator workspace is now rejected
  before any provider is launched, instead of silently falling back to a
  caller-influenced value. This closes a real caller-controlled-authority
  gap and is exercised directly by `npm test`, which now passes **78/78**
  (previously 75/76).
- The one previously-recurring non-mandatory finding
  (`verification-feedback-009.md`: a public regression test that entangled
  the live, ever-advancing real Spike 013a ledger instead of a disposable
  fixture) is now resolved — the candidate's own diff restructured that test
  to use a dedicated fixture workflow instead. No new public feedback is
  needed for it; it required no implementation action, and none further is
  needed now that it is fixed.
- All 6 mandatory hidden sub-tests (E1-E5) pass fresh against this candidate,
  including both `canonical-authority-adoption` fixtures.
- `npm run typecheck`, `npm run lint`, `npm run format:check` (tracked files),
  and `git diff --check` all pass.
- The Codex/host-boundary dispatch path that AC10, AC11, AC32, and AC33's
  evidence depends on remains untouched by this or any prior commit in this
  cycle (confirmed by direct diff/grep inspection against the last promoted
  candidate).

## What remains blocked, and why

**AC08, AC09 (Claude delegated evaluator execution), AC34 (Spike 011
readiness half depending on it)** remain unestablished: no `claude`
executable is reachable, no executor path is configured, and no live Harness
host process is reachable from this session — confirmed directly this
attempt (`command -v claude`, `printenv`, a direct connection attempt to the
default host port, and a listening-socket check), not inferred from a prior
attempt's result. Per the frozen evaluation's own decision rule,
required-executor unavailability for external (configuration) reasons is
`BLOCKED`, not `FAIL`. This fix does not touch the subprocess-spawn mechanism
`LP1` requires, so it could not and did not change this disposition.

## Not part of this candidate

The same pre-existing, unrelated, uncommitted drift in
`spikes/011-host-owned-workflow-runs/workflow.jsonl` every prior attempt
(002-010) observed and excluded was present again this attempt, confirmed
identical. An untracked, permission-masked `.mcp.json`, an untracked
`humam-acceptance.md`, an untracked `skills/orchestrator/` directory, and two
stale, untracked `spikes/998a-authority-fixture-*` fixture-residue
directories from an earlier, unrelated test run were also present and are
not attributed to this implementation. This evaluator did not modify any of
them.

## Next steps

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is still required, run from a session or
environment where a real `claude` executor and a reachable Harness host are
both available for the required live-Claude fixture to actually complete, or
supplied with fresh, independently-verified external live-Claude fixture
evidence for this exact candidate commit. Implementation is not required to
make further changes to resolve AC08/AC09/AC34 unless a future attempt
identifies a genuine candidate defect.
