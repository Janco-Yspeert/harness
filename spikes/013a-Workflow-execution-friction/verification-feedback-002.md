# Spike 013a — Verification Feedback (attempt 002)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  source commit `fae05912f59f8ebdb8982ab16deb26e293754647`), per the frozen
  `spike.md` "Evaluator bootstrap and self-modification exception".
  `skills/evaluator/SKILL.md` from the working tree was confirmed
  byte-identical to this pin and was not separately consulted.
- Implementation evaluated: `feat/spike-013a` @ `05bc7d9e47d58f35734c8e158eafd43b153e38e2`
  ("implementation retry"), implementation attempt `2`.
- Frozen evaluator revision: `002` (unchanged from attempt 001; no evaluator
  correction was needed this attempt).
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`) all byte-identical to their frozen identities — no
  specification drift.

## Result

**BLOCKED — `INFRASTRUCTURE_FAILURE`.** Not `FAIL`: no criterion was found
unsatisfied this attempt. Not `PASS`: 3 of 35 mandatory criteria remain
unestablished because required live-provider evidence could not be
gathered, for a reason external to this implementation.

## What was fixed since attempt 001

All 13 confirmed failures from attempt 001, plus both criteria that were
previously blocked, are now resolved:

- **Deterministic contract resolution** (AC01, AC02, AC03, AC10, AC25): the
  host now independently resolves and verifies which contract governs a
  role from the repository itself, rather than accepting a caller-declared
  name. A claim naming a nonexistent contract is now refused. A distinct
  field now records how the contract was delivered, separate from how the
  role was authorized.
- **Protected evaluator-role delegation now derives from general canonical
  authority** (AC05), not a hardcoded allowlist of specific workflows.
  Confirmed directly: a freshly built, fully isolated, disposable fixture
  workflow with its own genuine canonical authority is now correctly
  granted delegated evaluator authority, while the same fixture with only a
  prompt-shaped claim and no genuine trigger is correctly refused.
- **A genuinely blocked execution can now be retried** (AC22, AC35), both at
  the host level and in the CLI's local operational tracking, for any
  phase, not only two of them.
- **Authority status now explicitly distinguishes unavailable from
  available-but-requires-evidence transitions** (AC27, AC28), including for
  a repairable rejection state.
- **Unattended semantic-outcome reporting now works** (AC33): the executor
  is now instructed to emit a final structured completion line, which the
  host automatically parses and validates against the run's own binding —
  no manual step is required to determine and report whether a real,
  completed execution actually succeeded. Verified live: a real,
  correctly-sandboxed Codex execution reached a fully automatic validated
  `"succeeded"` disposition with no manual intervention of any kind.
- **AC04, AC06, AC07, AC12–AC21, AC23, AC24, AC26, AC29–AC32, AC35** all
  remain correctly satisfied (re-confirmed, not regressed).

## What remains blocked, and why

**AC08, AC09 (Claude delegated evaluator execution), AC34 (Spike 011
recovery readiness): `BLOCKED`.**

The fix underlying AC05 makes it possible, for the first time, to construct
a safe, fully isolated, disposable fixture that legitimately receives
delegated evaluator authority — without touching any real production
spike's state. With that in hand, a live Claude execution against exactly
such a fixture was attempted.

This evaluator's own execution environment refused to launch it: a
platform-level safety control blocked the specific action of starting a
process that would itself launch another Claude agent, independent of and
prior to any candidate behavior being observed. This is not a property of
the implementation under evaluation, and it is not evidence that the
implementation's Claude-facing mechanism is broken — the equivalent
mechanism for Codex was exercised live and worked correctly end-to-end, and
the authorization logic that would govern a Claude allocation is the exact
same code path already confirmed correct by direct inspection and by a
live, non-mocked diagnostic allocation.

Per the frozen brief, a required live-provider executor being unavailable
for an external reason blocks the affected criteria rather than passing them
on substitute evidence. That is what happened here, for a different and
narrower reason than attempt 001's block (there, no safe fixture existed at
all, because of the now-fixed AC05 defect).

## Next steps

This attempt's block is not resolvable by further implementation work, and
the evaluator will not apply a correction for it (there is no evaluator
defect here to correct). Resolving it requires either re-running the
live-Claude fixture from a session or environment where this specific
platform restriction does not apply, or an explicit change the human
operator makes to their own environment's permissions. Do not promote in the
meantime; this same frozen evaluation (revision `002`) governs any further
attempt.
