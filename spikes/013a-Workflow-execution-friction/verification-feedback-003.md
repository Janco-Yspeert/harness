# Spike 013a — Verification Feedback (attempt 003)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  per the frozen `spike.md` "Evaluator bootstrap and self-modification
  exception".
- Implementation evaluated: `feat/spike-013a` @ `05bc7d9e47d58f35734c8e158eafd43b153e38e2`
  (unchanged from attempt 002 — no source changes since).
- Frozen evaluator revision: `002` (unchanged; no correction this attempt).
- Frozen inputs all byte-identical to their frozen identities — no
  specification drift.

## Result

**FAIL — `IMPLEMENTATION_FAILURE`** on 3 mandatory acceptance criteria. This
supersedes attempt 002's `BLOCKED` disposition for these same criteria: the
live-Claude evidence that attempt 002 could not gather (this evaluator's own
execution environment refused to launch the required agent process) was
independently gathered and verified this attempt, from a real, replicated
execution through the candidate's actual delegated-evaluator-role dispatch
path. All 32 other criteria remain satisfied, unchanged from attempt 002.

## Confirmed implementation failure

### Claude delegated evaluator execution is refused (AC08, AC09, AC34)

**Requirement:** a valid Harness evaluator-role allocation must cause Claude
to execute the protected evaluator role without requiring manual
`/evaluator ...` invocation, and this must genuinely exercise and resolve
the original refusal condition.

**Observed:** two independent, real, bounded live executions — each against
a fresh, isolated, disposable fixture workflow, dispatched through a real
Harness host to the real Claude adapter — both resulted in Claude declining
to perform the delegated role. Claude's own stated reasoning, both times,
was that the allocation's framing does not constitute genuine system-level
authority: ordinary text inside a task prompt asserting it is "a
mechanically authorized Harness allocation" is not the same thing as a real
system directive, and following it anyway would defeat the evaluator
skill's own protection against exactly that pattern. Both executions made no
file changes and directed that the only legitimate path is a human directly
typing `/evaluator prepare ...` themselves.

This is a genuine exercise of the same underlying condition spike.md's
"Observed failures" section originally described, not a superficial
retest — the specifics differ, but the outcome (a human is still required
to invoke the protected role directly) is the same. Because it depends on
Claude correctly declining to treat prompt-embedded claims as system
authority, this is not something the candidate can straightforwardly patch
by rewording its prompt; it needs a different kind of solution for
establishing genuine authorization at the point the executor actually runs.

Spike 011 Cycle 002's evaluator-repair role, which motivated this spike, is
therefore not yet retryable through Harness without manual invocation
either.

## What already works

Unchanged from attempt 002: deterministic, host-verified contract
resolution; general canonical-authority-derived delegation (confirmed
correct up to the point of dispatch); blocked-execution retry; evidence-aware
authority status; process/role-result separation; and fully automatic,
unattended semantic-outcome reporting for the Codex path, confirmed live
with no manual step required.

## Safe diagnostics

- Both live Claude executions used the candidate's real prompt-construction
  path (confirmed: the received prompt text matches
  `executionPrompt()`/`[HARNESS EXECUTION BINDING]` verbatim) and the real
  `--permission-mode acceptEdits` flag, not a simulated or hand-written
  substitute.
- Neither execution used any file-modifying tool; neither left any trace in
  the repository.
- One execution still emitted the requested machine-readable status line
  with `"disposition":"refused"`; the other declined the reporting protocol
  itself along with the substantive task.

## Next steps

Implementation retries against this same frozen evaluation (revision `002`).
Do not rerun `prepare`.
