# Evaluation Requirements

## Testability Requirements

- **TR1** — `npm run workflow -- authority status <spike>` emits one parseable
  JSON document with reconstructed canonical state, ordered history, legal
  transitions, blocked reasons, and human-acceptance status. Source: Design Map
  Shared contracts. Implementation impact: these are the stable black-box
  surfaces; internal reducer/storage structure remains free.

- **TR2** — `authority validate` and `authority record` accept the same
  transition/evidence input. Validation has no side effects; a rejected record
  exits non-zero and leaves `<spike>/workflow.jsonl` byte-identical. Source:
  brief Scope 2. Implementation impact: no specific CLI parser is required.

- **TR3** — public transition evidence uses SHA-256 identities and immutable Git
  commit IDs; claimed public files and commits are mechanically checked before
  recording. Source: brief Scope 4. Implementation impact: tests may create
  known public files/commits and provide stale/mismatched values.

- **TR4** — verification allocation records an immutable binding of verification
  attempt, implementation attempt/commit, and evaluator revision; finalization
  requires that allocation. Source: brief Scope 6. Implementation impact:
  `status` history exposes the public relationship.

- **TR5** — the public authority must demonstrate the implementation-failure
  and evaluator-defect recovery paths, PASS/promotion separation, and explicit
  acceptance gate. Source: brief Acceptance Criteria 9–15. Implementation
  impact: public fixture spikes may use synthetic public evidence; no private
  evaluator workspace is needed.

## Evaluator Assumptions

- **A1** — tests may create disposable public spike directories and commits in
  a controlled repository fixture without invoking coding-agent executables.
- **A2** — evaluator evidence is synthetic public provenance where a real
  evaluator promotion would be disproportionate; it tests authority validation,
  not the evaluator's hidden mechanics.

## Blocking Questions

None.

## Environment Requirements

- Node.js, Git, and the repository's existing test/tooling stack on Ubuntu.
- No coding-agent executable, external service, or evaluator-private workspace
  is required to run the public transition tests.
