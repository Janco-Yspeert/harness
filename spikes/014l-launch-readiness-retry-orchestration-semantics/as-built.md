# As-Built — 014l Launch, Readiness, Retry, and Orchestration Semantics

Inspected revision: `4f0560165a14c44f76c6fdd540f4bc456ef208ae` (diff from design-freeze
`03330f5a`: 22 files, +4193/−181, source, tests, methodology policy and skill). Promotion record
`evaluation/promotion.json` matched the bound identity and was committed as a separate checkpoint.
Final verification: attempt 5, PASS, 25/25 criteria satisfied (fresh-clone suite 331 tests, 330
pass; the one failure is a containment test that also fails at the pre-014l baseline).

## What was built

- **Orchestration module** (`src/kernel/orchestration.ts`): host-derived canonical execution
  shapes (spawned launch and attached attachment), shape/effective-shape comparison that fails
  closed, launch-intent identity, readiness-probe input and identity, launch-attempt records,
  operational retry allowance, exhausted-state identities, and the semantic-progress identity.
  `AUTOMATIC_OPERATIONAL_RETRIES = 3`, so allowance is one initial try plus three retries per
  launch intent, plus any human-authorized count.
- **Durable ledger records**: `kernel.launch-attempt` (operational, no semantic execution or
  grant binding), `kernel.retry-exhausted`, `kernel.retry-authority`,
  `kernel.semantic-progress`, `kernel.continuation-stopped` (reason `repeated-no-progress`).
  Existing `kernel.allocation` remains the semantic commit and `kernel.exposure` follows it.
- **Spawned readiness**: the host runs a separate probe through the registered provider adapter
  before allocation, using a purpose-built material-free MCP server
  (`src/executors/readiness-tools.ts`, one `readiness` tool). A pass requires positive
  `tool-confirmed` evidence from the adapter. The pass is a single-use state of its launch
  attempt, consumed by the following allocation. Failure is classified, recorded, and retried
  within the budget. On exhaustion the host records exhaustion and returns a 409 stop
  (`operational-retry-exhaustion`).
- **Adapters** (`adapters.ts`, `governed.ts`): take the canonical shape instead of the grant,
  accept an optional reduced worker-operation set for probes, and report tool-confirmed events.
  The governed run re-derives the shape from the delivered assignment and fails
  (`provider-config-invalid`) if its identity differs from the launch shape.
- **Attached mode**: compatibility is validated against session provenance before allocation. A
  failure is an operational refusal with no automatic retry.
- **Human retry**: root-only `POST /governed/:workflow/retries` with `{workflowGrant, kind,
  exhausted, count?}`; it appends `kernel.retry-authority` bound to the exhausted state identity.
  Default count is one.
- **Status**: the existing `resolve` GET response is augmented with an `orchestration` object
  rebuilt from ledger events (`#orchestrationStatus`).
- **No-progress**: before a further automatic semantic continuation the host compares progress
  identities and records `kernel.continuation-stopped` on equality.
- **Tests**: new `test/orchestration.test.ts`, `test/readiness-evidence.test.ts`, and large
  additions to `kernel.test.ts` and `successor-closeout.test.ts`. Existing suites were adjusted
  for the readiness probe.

## Comparison with the frozen contract

### Missing
None found.

### Contradictory
None found.

### Extra
- **Pre-semantic implementation correction path.** A new methodology transition
  `authorize-pre-semantic-implementation-correction` and input
  `preSemanticImplementationCorrection` (`methodologies/harness/policy.json`,
  `contracts/implementation.json`, `trusted.jsonl`) let a human authorize implementation
  correction after operational exhaustion. The implementation skill moved to contract version 6
  to consume it. `methodology.ts` gained `excludePreservedInputs` and an `evidenceResolver`
  decision field to support it. The brief and Design Map do not name this path.
- **Evaluation-closeout changes** (`src/evaluation-closeout.ts`): `parseFreeze` and
  `privateAttempts` are exported, active evaluator archive sourcing changed, and a new
  `validatePrivateAttemptFinalization` checks the private attempt ledger against the finalized
  result. This is not an orchestration-semantics requirement in the brief.
- **Shape re-check inside the governed run**: the delivered assignment's shape is re-derived and
  compared at delivery time, beyond the pre-allocation checks the brief requires.
