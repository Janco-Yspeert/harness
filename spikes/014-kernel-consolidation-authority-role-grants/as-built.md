# As-Built — Spike 014 Kernel Consolidation: Authority, Role Grants, and Execution Binding

## Inspected revision and evidence

- Implementation candidate: `309d87ba2e1833c0bb9dade338794ec863a3d2df`.
- Frozen brief: `spike.md`,
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`.
- Frozen Design Map: `design-map.md`,
  `sha256:848a79c193f809a5252f94dbc1ec0ee605aa7ea63cb6034884bd7c72225988f9`.
- Public prepared evaluation inputs: `eval-requirements.md` and
  `coverage-map.json`, the latter
  `sha256:286b7ff910dcdf0e64eeb75f3ae35dd4b6f73cea43dd9ae107246046b8f0418a`.
- Promoted verification: evaluator revision `001`, attempt `001`, `PASS` for
  candidate `git:309d87ba2e1833c0bb9dade338794ec863a3d2df`; all 35 required
  criteria are recorded `SATISFIED`.

## Status: ALIGNED

## Built shape

The candidate introduces a version-1 governed-execution kernel under
`src/kernel/`. Its generic model distinguishes Methodology Definitions,
Workflow Execution Grants, authority bases, immutable Role Grants, sessions,
executions, semantic Role Results, host actions, human requests/responses, and
forward-only root-authority records. Kernel ledger handling is append-only and
the resolver derives configured eligibility from the ledger, pinned definition,
artifact inputs, provenance, and policy predicates; local `.workflow` state is
not used to determine ordinary governed eligibility.

Harness methodology is represented outside the kernel by
`methodologies/harness/policy.json` and eight machine-readable role contracts.
Definition loading content-addresses the policy, every contract, governing
skill content, and required public validator identities. A Workflow Execution
Grant remains bound to that exact definition, while resolution derives a
content-addressed Role Grant with exact inputs, workspaces, direct capabilities,
host actions, constraints, and predecessor/root-authority lineage.

`ExecutionKernel` persists allocations, sessions, exposure records, process
facts, role results, host-action records, human interactions, and transition
facts through the workflow ledger. Allocation is serialized and keyed by the
authority basis and resolved grant semantics. An attached pre-existing session
and a spawned executor both receive a resolved Role Grant; repeated allocation
returns the existing binding, while an authorized replacement records explicit
predecessor lineage. Session exposure is accumulated from host-owned ledger
facts across configured workflow ledgers, so revocation and kernel restart do
not make a previously exposed executor eligible for a forbidden role.

The governed localhost host supplies root-token and session-token boundaries,
session registration, inspection, allocation, result recording, human
wait/resume, and host actions. Semantic role result, provider/process state,
methodology transition, and host-action result are independently retained.
Publication is a host action restricted to the Role Grant's exact workspace,
remote, ref, commit, and base; the executor receives no direct publication
capability. Telemetry and executor selection are explicit optional seams and
do not decide authority.

`src/index.ts` installs the configured governed host. `tools/workflow.ts` is a
thin governed-host client; the former workflow recorder and run adapter remain
available only for explicitly enabled legacy/historical replay. The normal
configured host rejects legacy execution writes.

## Observable boundaries and retained proofs

`test/kernel.test.ts` covers the configured eight-role policy, immutable
definition/grant binding, input-sensitive and deduplicated allocation,
private-exposure monotonicity, root authority, separate semantic/action facts,
restart/interruption lineage, and non-authoritative telemetry/selection. Its
real-process cases use the host HTTP boundary for an already-running attached
fixture, spawned fixture execution, a bounded human wait/resume on the same
execution, and host-mediated publication to a local bare remote.

The retained attached proof records one process started before its grant,
remaining on the same execution through `WAITING_FOR_HUMAN` and resumption,
then a successful host publication with `directPublication: false`. The spawned
proof records separate spawned session/execution identities and terminal
semantic results after the allocating caller has no continuing role. The
promoted independent verification reran the public checks and required live
boundaries, reporting 35/35 required criteria satisfied.

## Inherited behavior, limits, and deliberate omissions

- Existing legacy workflow records and `src/workflow-run.ts` are retained for
  historical diagnostics/replay behind explicit legacy enablement; they are not
  the configured normal governed-execution authority path.
- The kernel supports configured executor profiles and external attached or
  spawned commands. It does not add a production Claude provider adapter; the
  Spike's real-boundary fixtures use a repository-controlled external process.
- Recovery preserves prior execution history and represents unrecoverable work
  as interrupted/lost. It does not resurrect an arbitrary provider process or
  add dynamic executor routing.
- The governed host is loopback-oriented and requires a root token of at least
  32 characters. Protected roles require a configured private workspace;
  protected human payloads are host-owned outside executor workspaces.

## Frozen-contract comparison

No Missing, Contradictory, or Extra material behavior or structure was
identified against the frozen brief and Design Map.
