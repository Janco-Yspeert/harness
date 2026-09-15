# Spike 013a — Verification Feedback (attempt 007)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  source commit `fae05912f59f8ebdb8982ab16deb26e293754647`), per the frozen
  `spike.md` "Evaluator bootstrap and self-modification exception".
  `skills/evaluator/SKILL.md` from the working tree was confirmed
  byte-identical to this pin.
- Implementation evaluated: `feat/spike-013a` @ `2bce70339cc99cb2b7ccffe5623ae20627c65fc3`
  ("fix: canonicalize workflow run identity"), implementation attempt `7`.
  `HEAD` (`df2dbd4`, "chore: allocate Spike 013a verification 9") adds only a
  `workflow.jsonl` allocation record on top of this commit.
- Frozen evaluator revision: `002` (unchanged from attempts 002-006; no
  evaluator correction was needed or performed this attempt).
- Canonical binding: `workflow.jsonl` `verification-allocated` attempt `9`
  (`implementationAttempt: 7`).
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`, bootstrap snapshot) all re-hashed and confirmed
  byte-identical to their frozen identities this attempt — no specification
  drift.

## Result

**BLOCKED — `INFRASTRUCTURE_FAILURE`.** Not `FAIL`: the specific,
independently-demonstrated defect attempt 006 found (LP1's fixture endpoint
rejecting every genuine canonical Spike 013a evaluator-verify parent) is
confirmed fixed this attempt, by direct exercise, not by inspection alone.
Not `PASS`: 3 of 35 mandatory criteria (AC08, AC09, AC34) remain unestablished
because the required live-Claude executor is unreachable from this
evaluation session, for a reason external to this implementation. The other
32 criteria remain `SATISFIED`, re-confirmed fresh this attempt.

## What was fixed since attempt 006

`resolveWorkflowLocation` now returns, and `resolveSpec` now stores, the
canonical spike-directory name in the resolved run's `slot.workflow`, instead
of the caller-supplied value verbatim. The LP1 fixture endpoint's guard now
checks this canonical value, which is exactly what the repository's own
canonical dispatcher (`tools/workflow.ts`) always produces; a shorthand input
alias continues to resolve to the same canonical run rather than a distinct
one.

This evaluator independently confirmed the fix works, not only that the
candidate's own added test passes: a genuine, real-backend Harness host (the
same production code path `node src/index.ts` uses, not a fake/mocked
backend) was started, and a parent run was allocated with the exact field
values/shape the real dispatcher produces for a genuine Spike 013a
`evaluator-verify` allocation. That allocation succeeded (previously it was
rejected for exactly the reason attempt 006 identified). The subsequent
attempt to construct the bounded LP1 fixture against that parent then failed
for a *different*, genuine reason — see below — rather than the
previously-demonstrated allocation-logic defect.

## What remains blocked, and why

**AC08, AC09 (Claude delegated evaluator execution), AC34 (Spike 011
readiness half depending on it)** remain unestablished. With the
allocation-logic defect fixed, the real backend attempted to spawn the
configured Claude executor for the genuine parent allocation and failed
immediately (a process-spawn-not-found condition specific to this evaluation
session's own environment). Per the frozen evaluation's own decision rule,
required-executor unavailability for external (configuration) reasons is
`BLOCKED`, not `FAIL`, and is not resolved by substituting a mock or by
treating the successful allocation step alone as sufficient — the frozen
requirement is a host-validated *successful role disposition*, which needs
the real executor to actually run. This is the same general category of
environment limitation that blocked private attempts 002, 004, and 005
before this fix even mattered, now confirmed specifically at the process-spawn
layer rather than the allocation-logic layer.

## Safe diagnostics

- The same unconditional host-only environment-variable consumption attempt
  006 reported (`HARNESS_EVALUATOR_HIDDEN_WORKSPACE` in
  `resolvePermissionProfile`; `HARNESS_CLAUDE_EXECUTABLE` in
  `workflowProviderProgram`) is unchanged by this commit and still causes
  `npm test` to regress from 74/74 to 71/74 under this evaluator's real
  ambient environment (the identical 3 pre-existing, unrelated tests fail for
  the identical reason). This does not by itself flip any of the 35
  criteria, but remains an outstanding, reproducible regression sharing the
  same root cause as the now-fixed defect above (host-only configuration
  consumed without being scoped to the one canonical allocation it is
  introduced for) and should be corrected.

## Not part of this candidate

The same pre-existing, unrelated, uncommitted drift in
`spikes/011-host-owned-workflow-runs/workflow.jsonl` every prior attempt
(002-006) observed and excluded (a single line dated before this spike's
implementation began) was present again this attempt. It is not attributed to
this implementation.

## Next steps

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is required, run from a session or
environment where a real `claude` executor is reachable for the mediated LP1
fixture's real-backend spawn to actually complete, or supplied with fresh,
independently-verified external live-Claude fixture evidence for this exact
candidate commit. Implementation is not required to make further changes to
resolve AC08/AC09/AC34 unless a future attempt identifies a genuine candidate
defect; correcting the still-outstanding unconditional environment-variable
consumption (see Safe diagnostics) remains advisable regardless.
