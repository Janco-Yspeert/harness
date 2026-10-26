# Split source and workflow repositories (Spike 015)

An external project may keep application source and public workflow
documentation in two Git repositories. See
`examples/split-project.example.json`.

Required checkouts, all distinct and non-nested real Git top levels:

- source (`root`, workspace `repository`): candidate code;
- docs (workspace named by `workflowWorkspace`): `workflowDirectory`, the one
  canonical `workflow.jsonl`, public role artifacts;
- Harness methodology/runtime (`methodologyRoot`).

Evaluator-private (`evaluation`) and host-private roots must be outside all
three. The configuration file lives outside every participating repository.

`workflowOrigin` is required exactly when `workflowWorkspace` names a workspace
other than `repository`, and must match the docs repository's `origin` remote.
`workflowDirectory` and `ledgerName` resolve against the docs repository.
Omitting `workflowWorkspace` keeps the single-repository meaning unchanged.

Preflight is `assertExternalProject` (run at host start, before any grant or
provider exposure); it refuses overlap, nesting, symlink escape, non-top-level
or originless docs repositories, origin mismatch, and misplaced private roots.

Split grants carry an `access` map (`none|read|write` per workspace), a
`gitCommit` list and the allocation's `commits` pair (source and workflow
bindings). Maxima follow the brief's role table and can only be narrowed.
Nothing here pushes, publishes or claims cross-repository atomicity.
