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
bindings). A binding uses the semantic owner (`repository` or `workflow`), the
configured repository id and origin, an exact commit, and—when it names a
file—the repository-relative path and SHA-256 identity. Committed inputs are
read from that declared repository; wrong-repository, missing, stale-content and
non-descendant checkpoint bindings fail closed.

Maxima follow the brief's role table and can only be narrowed. A docs-authoring
role starts in the writable docs workspace with source mounted read-only. An
implementation starts in writable source with docs read-only; its contract's
split-only `workflowEvidence` allowlist gives the host permission to commit the
exact authored manifest bytes to docs. The docs HEAD must still equal the
allocation's workflow snapshot, so a partial or concurrently advanced docs
checkpoint cannot be reported as a combined handoff. Nothing here pushes,
publishes or claims cross-repository atomicity.
