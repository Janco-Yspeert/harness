# Evaluation Requirements

## Testability Requirements

- **TR1** — authority status/history exposes criterion maps/results, human
  acceptance/rejection, and successor lineage as parseable public JSON.
- **TR2** — authority validate/record rejects invalid transitions without
  changing public canonical history.
- **TR3** — visible tests may create disposable public spikes/evidence and use
  synthetic evaluator coverage summaries; no private evaluator data is needed.
- **TR4** — workflow-skill integration is established by inspecting the
  repository-owned skill contracts at the evaluated commit.

## Evaluator Assumptions

- **A1** — criterion coverage results are evaluator judgments supplied as
  public-safe transition evidence; Harness checks their completeness only.
- **A2** — visible authority tests are the justified executable seam; hidden
  tests are optional where they would duplicate the public state machine.

## Blocking Questions

None.

## Environment Requirements

Node.js, Git, and the repository's existing public test/tooling stack.
