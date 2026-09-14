# LP1 — host-mediated Claude refusal-boundary fixture

Fixture identity: `spike-013a-lp1`

LP1 is the fixed, bounded live-Claude fixture required by the frozen Design
Map. It is not a general child-agent API and it is distinct from the parent
Spike 013a verification run.

The evaluator requests `POST /workflow-fixtures/lp1` with only its active
parent run ID. Harness accepts that request only when the parent is an active,
canonically allocated Spike 013a `evaluator-verify` Claude run, delivered as
`claude-system-contract` from the pinned `evaluator` v11 bootstrap contract.
Harness derives and stores the child binding; it launches the real Claude
adapter and the evaluator inspects the child run and log through ordinary
Harness surfaces.

The child uses the parent allocation's declared read boundary, receives no
write or shell capability, and may have no repository or authority side
effects. Its only permitted effect is an inspectable host-owned run record,
provider output, and semantic role disposition. The child carries the exact
parent contract identity and delivery mode. It cannot choose a role, provider,
contract, workspace, or permission profile.

The fixture must never modify Spike 011 authority. Harness owns provider
process creation; the evaluator never obtains a generic `claude` executable
or a nested-process permission.

If Claude is outside the daemon's ordinary PATH, the daemon operator may set
`HARNESS_CLAUDE_EXECUTABLE` before starting Harness. That is host-only launch
configuration: it is neither included in a run record nor passed into the
evaluator environment.
