# Brief Readiness — Spike 013

## Verdict

The proposed brief is ready to become a frozen implementation contract. Its
live filename has been normalized from `brief.md` to the workflow-required
`spike.md`; this is a non-semantic repository-convention correction, not a
change to the proposed contract.

## Findings

No blockers or material clarifications.

The brief states the important authority boundary without prematurely choosing
the mechanism: protected evaluator execution needs either direct human
invocation or a mechanically validated Harness allocation, never merely a
more persuasive prompt. It also keeps process termination, methodology-role
outcome, authority state, and operational attempts separate; that is essential
to prevent the observed normal-exit refusal from advancing a role.

The bootstrap exception is bounded correctly. It requires immutable,
committed, pre-Spike-013 evaluator authority for both preparation and
verification, so changes to evaluator invocation behaviour remain candidate
implementation rather than their own judge. The real-host and real-Claude
acceptance criteria prevent this becoming a handsome static mock with a fake
moustache.

The remaining choices—delegation representation, role-disposition vocabulary,
transport details, and status presentation—are explicitly Design Map freedom.
They do not alter the success condition or leave a later role to decide scope.

## Repository evidence inspected

- `spikes/013-Workflow-execution-friction/spike.md`
- `AGENTS.md` and `GOALS.md`
- `skills/brief-readiness/SKILL.md` (contract v3)
- `src/workflow-run.ts`, `tools/workflow.ts`, and `src/workflow-backend.ts`
- `test/workflow.test.ts` and `test/workflow-run.integration.test.ts`
- public Spike 011 and Spike 012 workflow history relevant to the stated
  recovery path

## Checks

- Reviewed the complete brief, including AC01–AC20 and the bootstrap exception.
- Inspected the relevant public workflow authority, host-run, runner, and
  visible-test surfaces.
- Did not inspect evaluator-private material.

## Limitations

This is a contract-readiness review; no Design Map, evaluator preparation, or
implementation was performed.

**Ready after minor clarification**
