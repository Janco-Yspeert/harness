# Brief Readiness Review — Spike 015

Reviewed: `spikes/015-separate-source-and-workflow-repositories/spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), read completely.

## Repository evidence consulted

- `AGENTS.md` (scope, explicit non-goals as requirements, no speculative abstraction).
- `harness.project.json`: single `repository` workspace; `workflowDirectory` and ledger resolved relative to the project root.
- `src/kernel/roots.ts` (`assertExternalProject`): rejects public workspaces and workflow directories outside the project repository; `project.origin` is optional and validated against the actual remote; the methodology repository is already required to be distinct and non-overlapping.
- `src/executors/containment.ts`, `src/executors/adapters.ts`: containment binds each workspace at its own `read`/`write` mode; `repository-write`/`git-commit` are flat grant capabilities.
- `src/kernel/model.ts`, `src/kernel/execution.ts`: commit bindings are currently single-repository.

The brief's problem statement matches the repository. The seam (`workflowWorkspace`, defaulting to `repository`) is small and recognizable. Per-workspace modes already exist in containment, so per-workspace access is feasible without a new isolation model. Deferring exact property names, schema layout and commit-pair representation to the Design Map is ordinary freedom, because the behavioral constraints are stated.

## Findings

### Blockers
None.

### Material clarifications (non-blocking)

1. **Minimum authority for the smoke dispatch (§5.3, AC14, AC15).** A fixture may supply prerequisites "with honest, explicit provenance", but the brief does not say whether a fixture may stand in for evaluator-attested prerequisites such as prepared evaluation. Implementation dispatch depends on frozen brief, design map and prepared evaluation. Smallest clarification: fixture-created prerequisites must be labelled as fixture-sourced, must not be indistinguishable from evaluator-attested events, and carry no adoption authority.
2. **Source/docs commit pair selection (§2.2).** The source commit granted to docs-authoring roles is unspecified. Likely answer: source HEAD at allocation, recorded and never re-resolved. State this, and state that a docs-only advance does not invalidate the source side of an implementation's pair.
3. **Implementation's docs evidence channel (§3, AC08).** "Existing pattern or a minimal equivalent" leaves open whether a new host-action destination class is needed. Confirm it may only be extended to name the docs workspace as owner, with no new authority kind.
4. **Config location and relative-path base.** Today `workflowDirectory` resolves against the project root. State that in split mode it resolves against the docs workspace root (implied by §1.2).

### Editorial

- Step 7 (smoke after adoption) follows human acceptance (step 6); state explicitly that AC14/AC15 may remain unmet under the permitted incomplete/blocked closeout.
- Consolidate the live-scope limits scattered across §5 and AC14.

## Limitations

Review limited to the brief and visible repository evidence. No evaluator-private material inspected. No prototype or tests run. `manifest.md` did not exist and was created with this entry.

## Files changed

`feedback.md`, `manifest.md` in this spike directory. No preliminary snapshot (passing verdict).

## Checks run

Full read of `spike.md`; sha256 matched the bound identity; targeted inspection of `src/kernel/roots.ts`, `src/executors/*`, `harness.project.json`.

**Ready after minor clarification**
