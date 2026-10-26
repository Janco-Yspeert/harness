# Evaluation Requirements

## Testability Requirements

There are no additional testability requirements. Independent evaluation uses
only seams the frozen brief and Design Map already name: the
`ExecutionKernel.authorizeEvaluatorCorrection` method, the root-only
`POST …/evaluator-corrections` route, the canonical ledger events, and the
resolver's grant/denial output for the workflow. Request and authority field
names are those fixed in the Design Map. Internal structure, helper names and
fixture construction remain implementation freedom.

## Evaluator Assumptions

- **EA1.** Eligibility is observed through resolver output: the resolved role
  and, for `evaluator-repair`, its `repairTrigger` and `sourceEvaluatorRevision`
  inputs. Reason: the Design Map makes the resolver the single eligibility seam.
  Evaluation impact: no private state is inspected.
- **EA2.** A finalized `BLOCKED` source whose recorded classification is
  `INFRASTRUCTURE_FAILURE` must, after one valid authority, resolve to
  `evaluator-repair` (the brief's stated application). Reason: the brief forbids
  special-casing that classification yet requires this outcome, using the pinned
  methodology bytes unchanged. Evaluation impact: the evaluation includes a
  source with that recorded classification and a source with a different
  non-eligible classification.
- **EA3.** Consumption is observed by appending the canonical
  `evaluator-repair-recorded` event after the authority and re-resolving.
  Reason: that event is the Design Map's consumption marker. Evaluation impact:
  evaluation does not depend on how the repair role itself is run.
- **EA4.** Staleness events are appended to the canonical ledger in the
  disposable fixture exactly as named in the brief. Evaluation impact: currentness
  is judged only from ledger order.
- **EA5.** Refusal means the request is rejected and the workflow ledger bytes
  are unchanged.

## Blocking Questions

None.

## Environment Requirements

- Node.js `>=24.12.0`, `git`, and the public project's installed dependencies;
  evaluation runs from the public project root with its existing runtime.
- Disposable temporary projects and local `git` repositories; no network,
  provider or live-session access.
- The public regression suite (`npm run typecheck`, `npm test`) must be runnable.
- Unchanged pinned methodology bytes (`methodologies/`, evaluator and other role
  skills) relative to the frozen Design Map commit.
