# Design Map — Spike 014c Governed Executor Integration

Frozen brief: `spike.md`
`sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`,
`brief-frozen` at `889507128fed99db3e0af9aed7856b4d30b934cd`.

## Shared contracts

### 1. Construction and configuration seams

- **Programmatic host construction is the only test seam.** Tests, including
  the real-provider smoke host, construct the production host through the
  existing programmatic surface: `startHarnessHost(port, { governed })` in
  `src/index.ts` with `GovernedHostOptions` from `src/kernel/host.ts`. An
  `ExecutorProfile` that carries `command` stays valid only when it is passed
  directly in this way. That is the one retained fixture-command form, and
  existing kernel tests already use it. Every fixture-command test still goes
  through the trust gate in §3.
- **Production configuration is the entrypoint environment.** The production
  surface is the `src/index.ts` main entrypoint's existing environment
  (`HARNESS_ROOT_TOKEN`, `HARNESS_PROJECT_CONFIG`, `HARNESS_EXECUTOR_CONFIG`,
  `HARNESS_PRIVATE_DATA_ROOT`) together with the project file it loads. The
  executor configuration stays a JSON array of `ExecutorProfile`s. A
  production profile names its registered adapter through `provider`. The
  only registered adapter identifiers are `"claude"` and `"codex"`. A
  production profile fails if it carries `command`, names any other provider,
  or names an adapter whose provider is not installed or whose configuration is
  invalid. No governed process is launched. The failure is an inspectable
  error: either the host refuses to start with a message, or the allocation
  request gets a non-2xx response and records no `running` process. Either form
  satisfies this contract. No environment variable, configuration key, test
  flag, or alternative trust root turns a production profile into a
  fixture-command profile.
- **Operator provider-program overrides are production configuration.** This
  includes the existing `HARNESS_CLAUDE_EXECUTABLE`. If such an override is
  kept, it may only locate the installed provider. It falls under the same
  AC04 prohibition: it cannot designate a generated, temporary-directory, or
  otherwise non-provider executable as the launched program.
- **Adapter mocking is internal to the implementation.** The deterministic
  mocks of SDK/CLI event streams and HTTP transport are implementation-owned
  seams. Independent evaluation relies on four things instead of their exact
  API: the HTTP surface, the production entrypoint configuration,
  fixture-command programmatic construction, and the committed smoke evidence.

### 2. Worker-to-host protocol (version 1)

- **Host-facing implementation.** The host side is the kernel's existing
  root- or session-authenticated `/governed/:workflow/...` HTTP API. The
  existing paths and bodies stay supported:
  - assignment: `GET sessions/:id`
  - submitResult: `POST executions/:id/result`
  - requestHuman: `POST executions/:id/human`
  - requestAction: `POST executions/:id/promote` or `POST executions/:id/publish`
  - lifecycle: `started`, `exited`, `cancel`
  
  Additions must be additive. No other authoritative event store is added.
- **Worker-facing operations.** The model-visible operations are exactly
  `assignment`, `submitResult`, `requestAction` and `requestHuman`. They are
  exposed under those names; provider namespace prefixes such as
  `mcp__<server>__submitResult` are allowed. The same names and semantics
  apply to both Claude and Codex.
- **Diagnostics are not worker authority.** Diagnostic and lifecycle reports
  come from the adapter and host. The model cannot call them to create
  authority.
- **Explicit versioning.** The protocol version (`1`) is explicit. It appears
  in the delivered assignment and in machine-readable schemas for each
  operation's request and response. The schemas live in one repository
  module.
- **`submitResult` shape.** It carries a generic `disposition`
  (`succeeded | blocked | refused | failed`) and a `methodology` object. The
  host validates both against the pinned role contract.
- **`requestAction` shape.** It carries a typed `kind` (`promotion` or
  `publication`) plus that kind's existing request fields. It is honored only
  when the host has configured the action for the execution's Role Grant
  (`hostActions`). An unconfigured kind is denied by the host, not by adapter
  judgment.
- **Binding comes from the adapter, not the model.** The adapter supplies the
  execution, session, and credential for every call. Tool arguments cannot
  select another execution, carry credentials, or broaden authority.

### 3. Trust-equivalence gate (every project)

- **Each project declares its own trust history.** The project configuration
  adds a `trustedHistory` field, a root-relative path to that project's
  append-only trusted methodology history. For Harness, this is
  `methodologies/harness/trusted.jsonl`. It is configuration, not
  methodology, so adding it does not change any Harness manifest identity.
- **Each project declares its validator sources.** The manifest's validator
  set comes from the project configuration. It is a map from validator name to
  a root-relative source path, not the fixed Harness map. The Harness
  declaration must reproduce today's `VALIDATOR_SOURCES` exactly. The field
  name and shape are free.
- **When the gate runs.** Before the host records any new Workflow Execution
  Grant (`POST grants`), it reconstructs the latest trusted record's manifest
  at the record's exact revision. It then requires that manifest to equal the
  recorded identity. Finally, it requires the current kernel definition to
  match it component for component: policy identity, each role's contract and
  skill identity, and each validator identity.
- **Mismatch or missing history is a denial.** A mismatch, a missing or empty
  history, or a non-reconstructible revision makes `POST grants` return
  non-2xx, with an error that identifies the trust-equivalence failure. No
  `kernel.workflow-grant` is recorded. Whether the denial is also recorded as a
  durable fact is free.
- **Scope of the gate.** Existing grants keep their bound definitions. The
  gate does not re-check continuation, allocation, or result handling under an
  existing grant.

### 4. Synthetic fixture project and its trust root

- **One committed fixture project.** The smoke tests and AC16 fixture tests
  use one fixture project committed in this repository. It holds its own
  project configuration, a synthetic policy, trivial roles and contracts
  (including one protected role with a `promotion` contract), precreated
  harmless promotion bytes, and its own trust-history file. Workflow ledgers,
  workspaces, sockets, logs, and provider scratch for each run are created in
  disposable temporary directories. The fixture's committed location is free,
  but it must be named in `smoke-evidence.md`.
- **Worker prepares; human authorizes.** The implementation worker prepares
  and commits the fixture methodology and reports its revision and manifest
  identity. A human then approves that exact revision and manifest identity,
  after the fixture commit and before any smoke execution. The approval takes
  the form of a human-authored decision record committed in this repository,
  or the existing human approval mechanism with its result committed as that
  record.
- **The root event cites the human record.** The fixture's root trust event
  uses the existing `promoteMethodology` form: `authority.kind: "human"` with
  `evaluation.kind: "human-bootstrap"`, and its evidence cites the human
  record. The worker never authors, or paraphrases into existence, the human
  evidence. Without that record, live smoke criteria are reported as blocked
  or unproven, never self-authorized.
- **The fixture root is confined to the fixture.** It has no effect on
  Harness's `trusted.jsonl`, on 014c's own workflow, or on 014a evidence. A
  post-root edit to the fixture's policy, contracts, skills, or validator
  sources must fail §3.

### 5. Diagnostic categories

Every failure below is recorded as a public-safe, execution-bound fact with a
`category` field. Pre-allocation failures appear in the rejecting response,
and in `kernel.continuation-stopped` when continuation was automatic.
Execution-bound categories are visible through root execution inspection and
the workflow ledger. The categories are:

| Category | Meaning |
| --- | --- |
| `no-adapter` | No eligible registered adapter |
| `provider-not-installed` | The adapter's provider is not installed |
| `provider-config-invalid` | The adapter's provider configuration is invalid |
| `assignment-not-delivered` | The assignment was not delivered to the worker |
| `permission-denied` | The provider rejected a tool or permission |
| `provider-crashed` | The provider process failed |
| `missing-result` | Clean exit without a semantic result |
| `result-rejected` | Malformed or rejected semantic result |
| `action-omitted` | A required host action was not requested after a valid result |
| `action-denied` | A required host action was denied |
| `action-failed` | A required host action failed |
| `rate-limited` | Quota or rate limit, only where the provider reliably distinguishes it |
| `provider-error` | Any other provider failure |
| `cancelled` | Explicit cancellation |

Existing `failure` strings and `process` states may remain alongside the
category. Richer diagnostics stay only in the isolated private workspace, with
explicit size bounds.

### 6. Public evidence artifacts (beside the brief)

- **`executor-decision.md`** records the §1 worksheet for both routes. For
  each worksheet row it gives the evidence and a per-route verdict of
  pass, fail, or not executable under approved credentials. It also records:
  - the documentation checked date;
  - the exact SDK package version and the installed CLI version;
  - live probes: at most one per permitted route, with outcomes;
  - the operator's authorization record for any new charge, or an explicit
    "none required";
  - how the decision rule was applied;
  - the single selected production route;
  - its replacement path.
- **`smoke-evidence.md`** records each real-provider governed run, along with
  any public-safe supporting files it references. See the procedure below.

### 7. Real-provider smoke procedure (exact)

1. **Check the fixture's trust root.** Confirm the committed fixture's §4
   human record and root trust event exist. Record the fixture location,
   revision, manifest identity, and trust-root evidence path.
2. **Build the smoke host in test code.** Use programmatic construction (§1)
   with the fixture project configuration, the fixture trust history, and
   production profiles `{provider: "claude"}` and `{provider: "codex"}`. Do
   not use a `command` profile, a mock provider, or an alternate pipeline.
3. **Authorize through the gate.** Use `POST grants` with the root credential.
   It must pass §3 on the unmodified fixture.
4. **Run Codex.** Launch one spawned execution of a trivial synthetic role
   through the `codex` adapter. It must read its exact pinned assignment and
   submit one typed result.
5. **Run Claude with one host action.** Launch one spawned execution of the
   protected synthetic role through the `claude` adapter. It submits a typed
   result, then one `requestAction(promotion)` of the precreated fixture bytes
   within a controlled private workspace. The host validates the actual bytes
   and records the action result and the configured transition.
6. **Run the negative case.** Have the host reject one unauthorized action
   (unconfigured kind, wrong execution, or superseded authority). This may use
   the real Claude run or a deterministic test through the same host.
7. **Record the evidence** in `smoke-evidence.md` for each run:
   - provider and CLI/SDK version;
   - requested versus confirmed-or-unavailable model and effort;
   - provider/process lifecycle facts and diagnostic categories;
   - the actual result and action events;
   - the resulting action bytes' identities;
   - a SHA-256-identified public-safe copy of the fixture workflow ledger;
   - a statement, with its check, that no generated bridge or wrapper code
     was created or executed.
8. **Stay bounded.** Use low turn limits, make no automatic retries, and
   exclude these runs from `npm test` and `npm run check`. If credentials or
   quota are missing, record the exact criterion as unproven.

### 8. Protected-execution threat model (fixed)

| Asset | Threat | Required boundary |
| --- | --- | --- |
| Root credential | Exposure to adapter, provider, or model | Never leaves the host process. Not in any child environment, prompt, workspace, tool argument, ledger, or diagnostic. |
| Session bearer token | Model reads it, or the provider environment leaks it | Held by the adapter side only. Absent from the provider subprocess environment unless unavoidable (and then justified in `executor-decision.md`). Never model-visible, in a workspace, in tool arguments, in a ledger, or in a diagnostic. |
| Provider login / API credentials | Extraction or reuse of undocumented tokens, or new billing | Only the supported authentication selected in `executor-decision.md`. Never copied into Harness configuration, workspaces, or logs. |
| Evaluator-private content and private workspaces | Disclosure through public logs, diagnostics, or broader reads | Monotonic exposure provenance. Raw protected output is kept only in the isolated private workspace, with bounds. Public records carry categories and safe details only. |
| Publication and remotes | Worker turns protected access or commit capability into a push | No `git push` tool or remote credential for the worker. Publication happens only as the host-configured `requestAction(publication)`. |
| Methodology authority | A working-tree edit silently governs new grants, or a synthetic root leaks | The §3 gate for every project. The §4 fixture root is confined to the fixture. |
| Workflow authority | Superseded, duplicate, or other-session worker gains effect; exit is read as a result or action; orchestrator improvises a bridge | Execution and session binding on every call. Supersession invalidation. Idempotent reconciliation. No inference from process exit or prose. Registered adapters only (§1). |
| Permission boundary | Ambient settings, plugins, hooks, or unrestricted modes widen access | One reviewed mapping from contract capability to provider permission, failing closed. Ambient project and user settings are excluded. No bypass or unrestricted permission mode. |

## Design decisions

These decisions are already settled by authoritative sources.

- **Ownership (brief §2).**
  - The governed host (`GovernedHost` and `ExecutionKernel`) alone selects
    executors, allocates, authenticates, validates, and records.
  - Adapters translate the grant into provider configuration, monitor the
    provider, and relay typed worker calls.
  - Workers do domain work.
  - The orchestrator only requests work and inspects status.
- **One governed launch path per provider.** There is exactly one production
  governed launch path per provider, built by moving or factoring the relevant
  code from `src/claude-workflow.ts` and `src/workflow-backend.ts`, not by
  copying it. `src/codex-backend.ts` keeps its interactive App Server role.
  Legacy readers may remain. The `HARNESS_ROLE_RESULT` parser never carries
  governed authority.
- **Required host actions reuse the existing mechanism.** They are expressed
  with the existing policy `outcomes[].requiredActions` and the
  execution-bound `kernel.result` and `kernel.action-result` facts. A valid
  result without the required successful action records no transition. It
  stays inspectably incomplete, and `kernel.result` is preserved.
- **Executor records separate requested from confirmed.** Records distinguish
  requested model/effort from confirmed model/effort, as in 014a. Confirmed
  values come only from provider-reported evidence, never from profile
  configuration or supervisor identity.
- **Legacy `/workflow-runs` stays retired (HTTP 410)** whenever governed
  execution is configured.
- **The 014c evaluator runs on the bootstrap path.** Evaluator preparation and
  verification for 014c use the pinned bootstrap path in
  `bootstrap/authority.md`: host and executor from detached commit
  `d447e385018fd587809431d2f6e9363ddb304a66`, with the pre-014c evaluator
  snapshot. Candidate adapter restrictions and the §3 gate bind only the
  candidate code path.
- **The orchestrator skill is outside the methodology.** `skills/orchestrator/SKILL.md`
  is not a role in `methodologies/harness/policy.json`. Editing it therefore
  does not change the Harness trusted manifest.

## Invariants

- **Harness trust history is unchanged.** Every record in
  `methodologies/harness/trusted.jsonl` still reconstructs to its recorded
  manifest identity at its recorded revision. This means the manifest schema,
  capability vocabulary, and Harness validator set stay unchanged. Harness's
  policy, role contracts, role skills, and `src/methodologies/harness-public.ts`
  also stay unchanged. Otherwise the candidate's own §3 gate would deny new
  Harness grants, and restoring them would require separate methodology
  promotion.
- **014a history is untouched.**
  `spikes/014a-kernel-hardening-authority-cutover/workflow.jsonl` stays
  byte-identical to its content at the brief-freeze commit. No 014a evidence
  is created, retried, or recovered.
- **Semantic result and host action stay separate.** Process exit, semantic
  result, and host-action result are separate facts. None is inferred from
  another. A required action that is omitted, denied, or failed never removes
  a recorded PASS and never fabricates promotion.
- **Allocation is the only start.** No governed process starts without a
  recorded allocation from a grant that passed §3 and a registered adapter.
  Startup, failure, and cancellation create no authority and no hidden
  retries.
- **Cancellation reaches the provider.** Cancellation terminates the actual
  provider process that the adapter launched, and leaves an inspectable
  `cancelled` status.
- **Constraint enforcement fails closed.** An unknown or unmapped capability,
  or an exact model/effort constraint that cannot be enforced or attested,
  blocks before launch. It is never switched to unrestricted permission
  mode.
- **Deterministic checks stay offline.** Deterministic checks
  (`npm run check`) make no real provider call. Real-provider evidence is
  never inferred from them, from terminal probes, or from fixture-command
  runs.

## Implementation freedom

- **SDK or CLI.** The choice of Agent SDK versus structured CLI follows the
  brief's decision rule. Provider flags and SDK options are free, as is
  whether the worker surface is an MCP tool server or another equally typed
  first-party interface, provided the §2 names and semantics are identical for
  both providers.
- **Adapter placement.** Adapter placement, meaning in the host process or a
  repository-owned child, is free, subject to the credential boundaries. So
  are module layout (for example, `src/executors/`), the registry
  representation, and how availability is detected.
- **Project configuration details.** The field shape for declaring validator
  sources and the fixture's committed location are free. So is how the
  equivalence check and manifest construction are factored in
  `src/methodology-evolution.ts` and `src/kernel/`, provided Harness
  identities are preserved.
- **Diagnostic internals.** The diagnostic record shape (beyond `category`),
  the retention bounds, and the redaction technique are free. So are
  streaming, event parsing, the cancellation signal sequence, and the
  internal mocking seams.
- **Smoke-test mechanics.** The synthetic role names, prompts, and task
  content are free, as are the command used to run the opt-in smoke tests and
  the format of the supporting evidence files.
