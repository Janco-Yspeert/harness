# Spike 014 implementation — attempt 1

This is the implementation handoff, not an independent evaluation or As-Built.
The candidate commit is bound by the subsequent canonical
`implementation-handoff` event. No evaluator verification, acceptance, Outcome,
or private evaluator inspection was performed by this implementation role.

## Authority and provenance

The initial local and remote `feat/spike-014` tips were both exactly
`3a6d5a2a0ce2ae47d792457e386683bb693f57c6`, with a clean working tree.
Implementation used the frozen brief, Design Map, public evaluation
requirements, coverage readiness attestation (revision `001`), and public
bootstrap history. Their identities are recorded in the manifest. Historical
spike artifacts and the frozen public inputs are unchanged.

## Normal authority/execution kernel path

The normal path is the following explicit set of files:

- `src/kernel/model.ts`: versioned authority, execution, result, interaction,
  action, telemetry, and executor-selection types.
- `src/kernel/ledger.ts`: canonical JSON/content identity, append-only durable
  ledger I/O, scoped event predicates.
- `src/kernel/methodology.ts`: configured policy, contract, skill, and validator
  snapshotting into a content-addressed Methodology Definition.
- `src/kernel/resolver.ts`: the single normal authority-resolution path;
  configured eligibility, gates, bounds, provenance, immutable Role Grants,
  canonical-basis/input-sensitive allocation keys.
- `src/kernel/execution.ts`: Workflow Execution Grants, session registry,
  serialized allocation, execution/result projections, exposure history,
  publication, human interaction, transitions, and interrupted-run recovery.
- `src/kernel/host.ts`: authenticated HTTP operations, attached assignment
  delivery, spawned process ownership, and bounded automatic continuation.
- `src/kernel/configuration.ts`: project/workflow/workspace configuration.

`src/index.ts` installs this path on the existing localhost Harness host.
`tools/workflow.ts` is its HTTP client, not another execution state machine.
Neither resolver nor execution code knows Harness role names, phase ordering,
spike directories, or governing skill paths.

Harness-specific data is in `harness.project.json`,
`methodologies/harness/policy.json`, and the eight
`methodologies/harness/contracts/*.json` files. Public readiness and verification
accounting validation lives in `src/methodologies/harness-public.ts`; its source
identity is pinned into the Methodology Definition. It reads public artifacts
only. A missing or changed pinned validator denies progression.

## Consolidation and deliberate boundaries

The configured host rejects legacy execution writes with HTTP 410. Legacy CLI
execution requires `HARNESS_LEGACY_WORKFLOW=1`, and legacy host execution
requires the explicit `legacyWorkflowExecution` embedding option. The ordinary
daemon does not enable that option. Existing regression fixtures opt in to
historical replay; their assertions remain intact except for the client-file
location assertion after extraction.

`tools/legacy-workflow.ts` preserves the existing public artifact recorder and
historical operational diagnostics. `src/workflow-run.ts` remains the legacy
execution adapter, not a parallel normal authority path. Its old role table is
removed in favor of the configured policy's skill mapping. Its ledger parser
and the recorder now share the kernel parser; public prepared-coverage validation
is also shared. Legacy `.workflow` files can be inspected but do not participate
in normal eligibility. No historical blocked run is rewritten or invented.

Definitions bind policy, contracts, skill contents, and public validators.
Changing them creates a new definition for a new Workflow Execution Grant;
already-bound grants retain their exact definition. Project, workflow grant,
authority basis, role grant, execution, session, semantic result, action, and
replacement identities remain distinct. Attempt counters are policy evidence,
not identity. Allocation uses canonical basis plus resolved grant/input semantics
and explicit predecessor lineage. Duplicate requests reuse an allocation;
permitted replacement keeps the predecessor and creates a new execution.

Root authority is a bounded, forward-only canonical record, scoped to an exact
workflow grant and authority basis. Human responses bind request, execution,
response identity, and decision; permission-bearing responses record root
authority before resumption. Neither operation mutates old grants or results.
Private human payloads are stored outside all executor workspaces and only
delivered to the owning session or authenticated human. Exposure is recorded
before delivery and unioned across the project's workflow ledgers, including
after workspace revocation or restart.

Process lifecycle, semantic disposition, methodology result, and host actions
are separate projections. Committed-artifact checks and configured required
actions gate canonical transitions without overwriting semantic success.
Publication validates exact granted repository/commit/ref/base, actual remote
ancestry, and a compare-and-swap ref update against the observed remote tip.
The host performs real Git operations. Remotes resolve outside every configured
executor workspace, including symlink aliases. No root credential or remote
configuration is passed to the fixture executor.

## Supported host flow

Configure `HARNESS_ROOT_TOKEN` (at least 32 characters), optionally
`HARNESS_PROJECT_CONFIG`, `HARNESS_EXECUTOR_CONFIG`, and
`HARNESS_PRIVATE_DATA_ROOT`, then start the existing daemon with `npm start`.
The default project discovers work items from its configured directory. It
does not import stale evaluator workspace environment grants. Protected roles
require an explicit workflow-specific private workspace and eligible host-owned
executor profile; the default external profile cannot execute them.

The root-authenticated CLI accepts:

```text
npm run workflow -- governed POST <workflow>/grants <json>
npm run workflow -- governed GET <workflow>/resolve/<workflow-grant-id>
npm run workflow -- governed POST <workflow>/sessions {"profile":"external"}
npm run workflow -- governed POST <workflow>/continue <json>
npm run workflow -- governed GET <workflow>/executions/<execution-id>
```

Grant JSON specifies `continuation`, `delegation` (`attached`/`spawned`),
`maxAllocations`, and optionally `roles` and `stopAfter`. Continue JSON specifies
`workflowGrant`, `mode`, and for attachment an existing `session`; optional
`role` and `predecessor` support explicit selection/retry. Inspection is read-only.

Registered executors use their own bearer token and `x-harness-session`, never
the root token. `GET sessions/<id>` delivers only that session's assignments,
including the frozen skill, contract, and grant. Execution suboperations are
`started`, `result`, `human`, `publish`, and `exited`. Only root may `respond`,
`cancel`, authorize a grant, register a session, allocate, or append a bounded
`root` decision. `tools/fixtures/governed-executor.ts` is an executable protocol
example. Caller HTTP lifetime does not own execution lifetime.

The bundled verification policy consumes a committed public
`verification-result.json` with `schemaVersion: 1`, `commit`,
`evaluatorRevision`, `result`, and `coverageResults` keyed by every public
criterion. A PASS requires every required criterion to be `SATISFIED`. This is
public result accounting, not a replacement evaluator or a private test format.
No such result was produced for Spike 014 during implementation.

## Visible regression and real-boundary evidence

`test/kernel.test.ts`, run by `npm test`, contains sixteen visible tests covering
TR1–TR11; the complete repository check set covers TR12. The named tests expose
their requirement mapping directly. They include the canonical PASS/promotion
scar with absent/stale local history, changed frozen inputs, definition changes,
all eight configured roles, protected exposure/revocation, non-authoritative
telemetry failure, independent result dimensions, bounded root/retry behavior,
concurrent allocation, durable interruption/lineage, and artifact provenance.

The four mandatory real-boundary proofs share two reproducible scenarios:

- `TR4/TR7/TR9`: register an external session, start a separate Node process
  before issuing either grant, attach through HTTP, observe the same live PID
  and execution waiting, reject forged/mismatched human responses, record human
  authority, resume that same execution, preserve semantic PASS, and have the
  host advance a real local bare remote to the exact requested commit.
- `TR4/TR10/TR11`: the host spawns the executor under a Role Grant, the allocating
  request ends, later observers inspect the same execution, and configured
  result policy drives a second spawned role under the same bounded workflow
  grant despite unavailable telemetry.

`implementation-proofs/attached/` and `implementation-proofs/spawned/` preserve
the executed `proof.json`, raw `authority.jsonl`, and `executor.jsonl` snapshots.
The attached proof contains the pre-grant PID, grant/session/execution identities,
waiting state, human request/response, semantic result, exact publication request,
remote before/after, and `directPublication: false`. These are synthetic public
fixtures, not evaluator output. No live provider or GitHub credential is used.

Reproduce from the repository root (Node 24 and Git):

```sh
proof_dir=$(mktemp -d /tmp/harness-014-proof-XXXXXX)
HARNESS_PROOF_ROOT="$proof_dir" node --test \
  --test-name-pattern='real attached process|real spawned execution' \
  test/kernel.test.ts
```

The command prints retained proof paths. Without `HARNESS_PROOF_ROOT`, tests
clean up their own temporary fixtures. A sandbox must permit localhost sockets
and child processes. The implementation's sandboxed retained-proof invocation
failed to start; the identical command succeeded outside that sandbox (2/2).

## Executor selection, schemas, and limitations

The selection seam is `ExecutorSelector`/`ExecutorProfile` in
`src/kernel/model.ts`, injected as `KernelOptions.selectExecutor` and invoked by
`ExecutionKernel.select` in `src/kernel/execution.ts`. It can consider provider,
model, reasoning, isolation, capabilities, availability, usage, and cost. The
default is a static eligible profile; no routing, quota accounting, or scheduler
is implemented. Telemetry is a separate best-effort sink, never authority.

Schema definitions are centralized in `src/kernel/model.ts` (`SCHEMA_VERSION =
1`). New definitions, workflow/role grants, sessions, executions, structured
results, root records, human records, host-action requests/results, and emitted
ledger envelopes carry explicit `schemaVersion: 1`. Legacy ledger events remain
readable without an invented migration. There is no migration framework.

One host owns a project's live executions. Ledger transactions serialize
allocation and reject competing writers. Recovery preserves unrecoverable active
work as interrupted; it does not resurrect processes. The external fixture is
trusted repository-owned code operating under the declared workspace/capability
boundary, not an adversarial operating-system sandbox demonstration. Executor
profiles are trusted host configuration, not executor-supplied capability claims.
Live Codex/Claude attachment, dynamic selection, external-network publication,
and full workflow progression beyond this handoff were deliberately not run.
