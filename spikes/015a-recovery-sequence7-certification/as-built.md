# As-Built — Spike 015a Recovery Sequence 7 Certification

## Implemented shape

The final candidate, `5df58ccd70b8fc8954f7497279d823ab2088842d`, adds a narrow, optional completion obligation for fresh sequence-8 split source/workflow-repository workflows.  The feature is host-owned: workers neither run nor attest the completion check.

At Brief freeze, the kernel reads only a committed, regular `completion-obligation.json` from the workflow repository.  It accepts the closed version-1 `split-coding-smoke` shape only when the configured source and workflow workspace identities, `manifest.md` evidence destination, and repository-relative Node test paths match.  A valid sequence-8 declaration becomes a `completion-obligation-declared` ledger fact bound to the committed bytes, workflow, methodology/runtime source binding, and configured origins.  No declaration preserves the existing path; malformed, late, unsafe, mismatched, or sequence-7 declarations block the freeze transition.

An accepted implementation handoff for a declared workflow triggers a host finalizer.  It creates one completion-attempt key from the declaration, handoff, execution, candidate, and repository bindings, so recovery or repeated finalization converges on the same attempt.  Before it can succeed, the finalizer requires a contained spawned implementation through a registered provider adapter, consumed host readiness, a managed process, an accepted source commit that descends from and changes the allocation baseline, the exact descended workflow checkpoint produced by the successful brokered `manifest.md` evidence action, and matching sequence-8 methodology/runtime/origin bindings.

The fixed check uses disposable Git worktrees and a bubblewrap-contained `node --test` launch.  The source checkout is read-only, scratch is the writable mount, networking is unshared, and the runner has no worker-provided executable, command, environment, or installer input.  Both the immutable baseline and exact candidate must contain the committed test target.  A satisfying run records bounded exit/output-digest facts only when the baseline exits normally with `1` and the candidate exits normally with `0`; timeout, signal, overflow, spawn/setup, containment, path, or other exit failures are non-satisfying.

Every finalization records a host-owned `completion-smoke-attempted` fact.  On success the host writes and locally commits the public `completion-smoke.json` in the workflow repository, verifies its committed bytes, then records `completion-smoke-recorded` with the declaration, handoff, candidate/baseline, grant, provider-provenance, evidence-action, check, and artifact bindings.  A failed or partial checkpoint remains an attempt and cannot produce the success event.

Outcome allocation and terminal transition both revalidate a declared workflow's current success record against the latest handoff, source/workflow lineages, committed artifact bytes, declaration, and sequence-8 methodology/runtime binding.  STANDARD is rejected without that record.  PROCESS_EXCEPTION remains available only with the pre-existing explicit exception authorization and evidence, binds the declaration and outstanding obligation, and cannot replace an already satisfied obligation.  The Outcome contract has optional declaration and completion-record inputs, and the Outcome skill is version 6; undeclared workflows and predecessor-pinned sequence-7 workflows retain prior completion meaning.

The feature is exercised by `test/completion-smoke.test.ts`, covering declaration closure, check exit semantics, provenance and evidence negatives, idempotence, stale/current record handling, STANDARD and PROCESS_EXCEPTION boundaries, legacy absence, and forward-only methodology adoption.  The final candidate's retry commit also corrects static typing/lint/format issues in this implementation without changing these completion semantics.

## Contract comparison

No Missing, Contradictory, or Extra material behavior or structure was identified against the frozen brief and Design Map.

## Inspected evidence

- Frozen brief: `spike.md`, `sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`.
- Frozen Design Map: `design-map.md`, `sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`.
- Candidate: `5df58ccd70b8fc8954f7497279d823ab2088842d`.
- Final accepted verification: `verification-result.json`, `sha256:c15811403dbbe5ff046d0c65d92bf0d393d47d2569c0d8d9433f28bfad42403a`; attempt 003, evaluator revision 001, `PASS` for BC01–BC11.
- Completed promotion record: `evaluation/promotion.json`, `sha256:19e4b8d47306ee18085168f068f5eddb94990bcbd3521a11a8c7ccad771dd7d9`.
