# Evaluation Requirements

## Testability Requirements

- **TR1** - The implementation must provide durable, visible in-repository
  regression evidence (executed through `npm test`) for the observable
  host-owned-run behaviour: a run requested through the supported workflow/run
  path is host-owned and survives client disconnect while the host is alive; a
  later client resolves and inspects the same run by stable Harness identity;
  two concurrent/repeated start requests for one active slot produce at most one
  worker and the duplicate returns the existing run or an explicit conflict; a
  replacement cannot be allocated while the prior execution is active and, once
  allocated, preserves the prior identity, the new identity, the reason, and any
  executor/fallback change; a workflow phase cannot be recorded complete unless
  the matching canonical run is terminally complete, and a directly launched
  external process cannot satisfy that binding; structured run lifecycle events
  distinguish allocation, start, activity/output, completion, failure,
  cancellation, and replacement; and execution logs remain inspectable and tied
  to the run without becoming frozen methodology evidence or downstream role
  context.
  - Reason: the frozen Design Map deliberately leaves route names, JSON field
    spellings, UUID format, internal registry/backend classes, log storage
    representation, and the duplicate-allocation `200`-vs-conflict choice as
    implementation freedom, so independent evaluation relies on the
    implementation's own visible regression suite rather than an
    evaluator-authored hidden test that would have to invent that surface.
  - Source: frozen brief scope 1-8 and acceptance criteria AC01-AC13, AC19,
    AC20; frozen Design Map "Shared contracts", "Design decisions", and
    "Implementation freedom".
  - Implementation impact: these scenarios live in the public test suite under
    `test/` and are run by `npm test`.

- **TR2** - The visible regression suite must exercise these behaviours without
  a live paid Codex/Claude provider call. The host must own workflow process
  creation through a workflow backend/factory seam that tests can substitute
  with an in-memory backend, analogous to the existing
  `startHarnessHost({ createBackend })` seam for interactive sessions.
  - Reason: AC20 requires the coverage "without requiring live paid provider
    calls"; the Design Map states the workflow backend is a host-owned factory
    seam and that tests may supply an in-memory backend through it.
  - Source: frozen brief scope 1A and AC20; frozen Design Map "Design
    decisions".
  - Implementation impact: a documented, test-substitutable workflow backend
    seam on the host; the visible suite uses it.

- **TR3** - The canonical run record must expose, in a stable form observable
  through the supported workflow/run interface, at least the run fields the
  brief enumerates: workflow/spike identity, workflow phase/role slot,
  methodology attempt identity where one exists, execution attempt identity,
  role, skill and skill version when known, actual executor/provider, invocation
  mode, retry/replacement/fallback reason when applicable, allowed workspace(s),
  permission-profile identity, created/started/last-activity/terminal
  timestamps, current lifecycle status, terminal disposition/reason,
  parent/orchestrator identity when reliably available, process id and/or
  provider session identity when available, and the diagnostic log/event
  location. The methodology/workflow attempt identity and the operational
  execution-attempt identity must be separately observable.
  - Reason: independent evaluation of AC04 and AC05 requires reading the run
    record's information content through a stable seam; the exact field
    spellings and transport are implementation freedom, the information content
    is not.
  - Source: frozen brief scope 2, 3 and AC04, AC05; frozen Design Map "Shared
    contracts", "Design decisions".
  - Implementation impact: the supported interface can return/inspect a run by
    its stable identity and surfaces the enumerated information; unavailable
    provider/model metadata is omitted rather than fabricated.

- **TR4** - Dispatch through the supported workflow path (`tools/workflow.ts` or
  its Design-Map-approved successor) against a configured host URL with no
  reachable host must be an explicit, observable dispatch failure, not a
  fallback to a client-owned worker.
  - Reason: AC10 and the Design Map require the runner to be a client of the
    host-owned surface; a missing host must fail loudly.
  - Source: frozen brief scope 6 and AC10; frozen Design Map "Shared
    contracts".
  - Implementation impact: the runner surfaces a clear error and creates no
    detached worker when the host is absent.

- **TR5** - The applied permission profile must be recorded on the run record
  and observable through the supported interface, and the standard
  repository-local worker profile and the evaluator profile (standard plus a
  declared private evaluator workspace) must be nameable/identifiable.
  - Reason: AC17 requires the applied profile to be recorded; AC15 and AC16
    require the profile to be bounded and capability/workspace-oriented, which
    is only independently checkable if the profile is identifiable on the run.
  - Source: frozen brief scope 9, 10 and AC15, AC16, AC17; frozen Design Map
    "Design decisions", invariant 5.
  - Implementation impact: a named/identified permission profile stored on the
    run record.

- **TR6** - Run accounting fields (allocated/start/end timestamps, elapsed run
  time, executor/provider, execution attempt/replacement count for the slot,
  terminal disposition) must be present on the run record and derived from
  directly observable facts.
  - Reason: AC18 requires cheap directly-observable run accounting; independent
    evaluation reads it from the run record.
  - Source: frozen brief scope 11 and AC18; frozen Design Map invariant 3.
  - Implementation impact: host-derived accounting on the run record; no manual
    token/cost estimation; unavailable provider usage omitted.

- **TR7** - The pre-existing interactive session/backend behaviour and its
  visible tests must remain unchanged in externally observable contract, and the
  full `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`,
  and `git diff --check` must pass at the implementation commit.
  - Reason: AC21 requires existing behaviour to remain green and repository
    validation to pass.
  - Source: frozen brief AC21; `AGENTS.md` "Testing and verification".
  - Implementation impact: additive host generalization that does not break the
    session surface; all repository checks green.

## Evaluator Assumptions

- **A1** - Route names, JSON field spellings, UUID/identifier format, internal
  registry and backend class names, log storage representation, and whether a
  duplicate allocation returns `200` or an explicit conflict are implementation
  freedom under the frozen Design Map. Evaluation asserts observable structural
  behaviour and the normalized structured-event information through the visible
  regression suite and static inspection, not a specific route, schema, or file
  path.
- **A2** - "The supported workflow path" means `tools/workflow.ts` or a
  successor the frozen Design Map approves; "the existing Harness host/runtime"
  means the host created by `startHarnessHost` under `src/` or its
  Design-Map-approved evolution.
- **A3** - The workflow backend/factory seam is exercised in tests with an
  in-memory backend so the visible suite needs no paid provider; a real
  provider adapter is not required to be exercised by the visible suite.
- **A4** - Daemon-restart persistence of run records is not required by this
  spike; run records and logs need only remain inspectable while the host that
  created them is alive.
- **A5** - This evaluator preparation runs under evaluator v10 with no process
  exception. The bootstrap exception declared in the frozen `spike.md` applies
  to the Spike 011 *workflow runner* dispatch path during implementation, not to
  this evaluator preparation or its pre-freeze integrity validation.
- **A6** - "The frozen evaluator bundle" for traceability purposes means the
  criterion-evidence records, case manifest, hidden-test manifest, and freeze
  inventory of evaluator revision `001` bound to the attempt.

## Blocking Questions

None.

## Environment Requirements

Node.js `>=24.12.0`, Git, and the repository's existing public test, typecheck,
lint, and formatting tooling (`npm test`, `npm run typecheck`, `npm run lint`,
`npm run format:check`). No external services, credentials, or paid provider
access are required to run the evaluation.
