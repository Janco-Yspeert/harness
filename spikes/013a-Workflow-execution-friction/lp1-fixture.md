# LP1 — host-mediated Claude refusal-boundary fixture

Fixture identity: `spike-013a-lp1`

LP1 is the fixed, bounded live-Claude fixture required by the frozen Design
Map. It is not a general child-agent API and it is distinct from the parent
Spike 013a verification run.

An evidence producer requests `POST /workflow-fixtures` with workflow `013a`,
fixture `lp1`, and the exact candidate commit. An optional parent run ID is
correlation only. Harness accepts the request only when the candidate is the
current canonical implementation handoff eligible for verification, then loads
`fixtures/lp1.json` from that exact commit and validates its protected role and
pinned contract against canonical authority. Harness stores the resolved
binding, launches the real Claude adapter, and exposes the run and log through
ordinary Harness surfaces.

The fixture uses the repository read boundary, receives no write or shell
capability, and may have no repository or authority side effects. Its only
permitted effect is an inspectable host-owned run record, provider output, and
semantic role disposition. The run carries the exact candidate, handoff,
fixture-definition and contract identities and delivery mode. The caller cannot
choose a role, provider, contract, workspace, permission profile, capability or
expected result.

The fixture must never modify Spike 011 authority. Harness owns provider
process creation; the evaluator never obtains a generic `claude` executable
or a nested-process permission.

If Claude is outside the daemon's ordinary PATH, the daemon operator may set
`HARNESS_CLAUDE_EXECUTABLE` before starting Harness. That is host-only launch
configuration: it is neither included in a run record nor passed into the
evaluator environment.
