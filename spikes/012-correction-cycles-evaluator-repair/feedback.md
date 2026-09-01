# Brief Readiness — Spike 012

## Verdict

The proposed brief is ready to become a frozen implementation contract.

## Findings

No blockers or material clarifications.

The brief makes the expensive boundaries explicit rather than leaving them for
the implementation or evaluator to improvise:

- correction cycles, implementation attempts, verification attempts, evaluator
  revisions, and executor/process attempts remain distinct;
- legacy histories are interpreted as Cycle 001 without historical mutation;
- same-spike correction is limited to explicitly repairable human findings,
  while specification changes retain successor lineage;
- an evaluator defect finalizes the allocated verification attempt before a
  separately recorded, bounded repair may create another evaluator revision;
- repair cannot change frozen product authority, public evaluation requirements,
  or success semantics; and
- the Spike 012 bootstrap exception pins both evaluator `prepare` and `verify`
  to the same exact pre-implementation evaluator material and predecessor
  recovery semantics. The new repair mode and correction-cycle authority are
  therefore implementation under test, not self-grading authority.

The remaining choices, such as event/artifact shapes and the operational
mechanism that executes the pinned evaluator material, are explicitly assigned
to the Design Map and do not change the public success condition.

## Repository evidence inspected

- `spikes/012-correction-cycles-evaluator-repair/spike.md`
- `AGENTS.md` and `GOALS.md`
- `skills/brief-readiness/SKILL.md` (contract v3)
- `skills/evaluator/SKILL.md` (pre-implementation contract v10)
- `tools/workflow.ts`, `src/workflow-backend.ts`, `tools/evaluator-integrity.ts`
- `test/workflow.test.ts`, `test/evaluator-integrity.test.ts`, and the public
  Spike 011 workflow/manifest history relevant to the stated recovery proof

The current authority has only spike-global PASS/promotion/As-Built/decision
state and no correction-cycle or evaluator-repair transition. That is the
intended implementation gap, not a brief ambiguity. Spike 011's immutable
primary `IMPLEMENTATION_GAP` plus secondary `EVALUATOR_COVERAGE_DEFECT` record
is present as described and supplies a concrete legacy fixture target.

## Checks

- Reviewed the complete brief, including all 30 acceptance criteria and the
  bootstrap process exception.
- Inspected the relevant public authority, workflow-runner, evaluator-integrity,
  and visible regression-test surfaces.
- Did not inspect evaluator-private material.

## Limitations

This is a contract-readiness review; no Design Map, evaluator preparation, or
implementation was performed.

**Ready to freeze**
