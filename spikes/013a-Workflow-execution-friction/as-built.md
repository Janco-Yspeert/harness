# As-Built — Spike 013a Deterministic Workflow Execution and State Adoption

## Inspected revision and evidence

- Final implementation revision: `bb541265d994aad1f1af30446bf0a19ad59e1537`
  (`feat: add candidate-bound workflow fixtures`).
- Frozen brief: `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`.
- Frozen Design Map: `design-map.md`
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7c3723835e0721e8673554f93b407`.
- Promoted final verification: evaluator revision `002`, attempt `008`,
  `PASS`, result identity
  `sha256:8b818f23887a739a2dc177ec13df75f98017324a91a885bbf594f39fee1866e5`.
  The promotion preserves all eight attempts and the frozen evaluator bundle
  under `evaluation/**`.

## Built shape

Harness resolves an immutable execution binding before it launches a workflow
provider. A host-owned run record carries its workflow slot, methodology and
execution-attempt identities, role, executor, canonical repository contract
path/version/SHA-256 identity, delivery mode, allocation and verification
authority, permissions/workspaces, process lifecycle, semantic role result,
and diagnostic log reference. Caller contract aliases are compatibility hints;
conflicting claims are rejected and cannot define the binding.

Semantic role completion is separate from process completion. The local backend
recognizes one final structured `HARNESS_ROLE_RESULT` stdout envelope and
records its disposition against the already-resolved binding. The explicit
result surface independently validates role, methodology attempt, contract
metadata, and verification authority. A clean provider exit without a valid
result remains `pending`, so the workflow runner records phase completion only
when the inspected host run is both `completed` and semantically `succeeded`.

The registry preserves terminal non-successful runs and creates linked retry
executions with a new execution-attempt number and `previousExecutionId`; a
successful canonical execution remains idempotent for its slot. Provider
delivery differs only at the adapter boundary: ordinary repository-loaded
contracts are used where supported, while the protected Claude path receives
the pinned contract as `claude-system-contract`. Delegated evaluator authority
is derived from the workflow's committed canonical authority rather than from
request fields or provider prose; explicit human evaluator invocation remains
a distinct authorization path.

`tools/workflow.ts` now adopts completed canonical brief, Design Map, and
evaluation-preparation checkpoints into local operational state as one
inspectable adoption fact. It derives the next phase from canonical authority,
without fabricating historic dispatches or outcomes. Planning is read-only;
dispatch history is committed only after a host allocation succeeds. Runner
status joins the recorded job to host inspection and exposes both process state
and role disposition. Authority status also distinguishes a structurally
unavailable transition from one that is available but needs evidence.

The host exposes a bounded candidate-commit fixture allocation at
`POST /workflow-fixtures`. It accepts only workflow, fixture name, exact
candidate commit, and optional inspection-only parent correlation. The host
loads `fixtures/<name>.json` from that exact commit, requires that commit to be
the current canonical implementation handoff, validates the frozen public
artifacts and pinned protected evaluator contract, and derives role, executor,
permissions, workspaces, side-effect boundary, and delivery mode itself. The
fixture is a separate `fixture:<name>` run, not a verification allocation.
`isSuccessfulWorkflowFixtureEvidence` checks the completed semantic result and
the fixture, handoff, allocation-authority, contract, and candidate identities
as one bound fact.

Spike 013a supplies the LP1 fixture: a Claude `evaluator-verify` execution
bound to evaluator v11 via `claude-system-contract`, repository-read access,
and no permitted side effects. The promoted final verification corroborates a
real host-owned LP1 run with a successful semantic result, as well as the
corresponding live Codex path. Visible tests cover binding resolution and
mismatch rejection, result capture, retries, adoption, non-consuming planning,
pre-execution recovery, evidence-aware authority status, and candidate-bound
fixture allocation.

## Lifecycle and boundaries

- Execution bindings and run records are host-memory state; they remain
  inspectable until that host closes, but daemon-restart persistence is not
  introduced.
- Canonical workflow authority and runner operational history remain separate,
  append-only sources. Adoption and retries add facts rather than rewriting
  either history.
- Fixture allocation has no caller-shaped worker command, provider choice,
  evaluator authority, contract, or side-effect grant. Parent correlation is
  diagnostic only.
- The structured provider-result envelope is intentionally small. Provider
  output that omits or malforms the final envelope cannot advance methodology.

## Frozen-contract comparison

- **Missing** — none observed in the promoted PASS evaluation.
- **Contradictory** — none observed.
- **Extra** — none material. The generic candidate-bound fixture endpoint and
  LP1 fixture are the selected implementation of the required bounded live
  provider evidence path, not an additional product surface beyond the frozen
  contract.
