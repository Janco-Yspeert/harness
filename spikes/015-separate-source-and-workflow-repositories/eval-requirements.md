# Evaluation Requirements

## Testability Requirements

- **TR-01** — Split-mode configuration and preflight remain reachable through
  the existing public interfaces: `loadProject(path)` in
  `src/kernel/configuration.ts` and
  `assertExternalProject(project, { privateDataRoot? })` in
  `src/kernel/roots.ts`. Their call signatures stay compatible; a refusal is a
  thrown `Error`, and acceptance of a split configuration returns normally. In
  split mode `project.root` remains the source repository, and workflows are
  discovered from `workflowDirectory` inside the workspace named by
  `workflowWorkspace`. _Reason:_ the Design Map fixes the new property names but
  leaves everything else as implementation freedom; these are the only
  pre-existing seams for configuration and preflight outcomes. _Source:_ brief
  §1, AC01–AC03; Design Map "Observable surface". _Impact:_ keep these entry
  points; no new import surface is required.
- **TR-02** — Behaviour that is not reachable through those seams (allocation
  pairs, grant `access` maps, containment, evidence routing, lifecycle roles) is
  evaluated from the candidate's own committed deterministic integration suite
  run through `npm test`, plus the recorded ledger, grant, Git and host-action
  outputs. _Reason:_ the Design Map leaves record spelling to implementation.
  _Source:_ brief "Verification boundaries". _Impact:_ the suite must exercise
  real Git repositories, ledger, host actions and containment (attempted writes)
  rather than mocking the boundary under test.
- **TR-03** — The candidate ships an understandable example split configuration
  and preflight instructions, and commits public evidence of the one
  real-provider coding smoke (starting/ending source and docs commits, accepted
  semantic Role Result). _Source:_ brief §5, AC13–AC14.

## Evaluator Assumptions

- **EA-01** — Node ≥ 24.12 with the checked-in dependencies, local Git, and (for
  containment evidence) bubblewrap are available. Evaluation impact: needed to
  run the public suite and local Git fixtures; no provider or network is needed
  by the evaluator.
- **EA-02** — Pre-existing CI/environment failures are identified by running the
  same commands on the candidate's parent commit; only differences count as
  regressions.
- **EA-03** — Where the specification is silent (for example whether a docs
  origin may equal another repository's origin) the evaluator imposes no
  requirement.

## Blocking Questions

None.

## Environment Requirements

- Ubuntu host, Node ≥ 24.12, Git, temporary directories, symlink support.
- Local filesystem only for deterministic evaluation; no secrets or external
  services. The recorded real-provider smoke evidence is inspected, not re-run.
