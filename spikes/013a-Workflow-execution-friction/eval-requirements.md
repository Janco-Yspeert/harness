# Evaluation Requirements

## Testability Requirements

- **TR1** - The implementation must provide durable, visible in-repository
  regression evidence (executed through `npm test`) for the observable
  behaviors the frozen brief enumerates as governing authority and contract
  resolution: deterministic role-to-contract resolution; exact contract
  identity recorded on the host-owned run record where a frozen/versioned
  contract is required; an explicit recorded execution/delivery mode distinct
  from provider prose; a request/prompt claiming evaluator or Harness
  authority being refused outside a mechanically valid Harness evaluator-role
  allocation; a valid Harness evaluator-role allocation authorizing the
  protected evaluator role without weakening evaluator invocation protection
  globally; explicit authorized human evaluator invocation remaining valid as
  a separate route; and an ordinary implementation agent or workflow role
  being unable to elect to become the evaluator.
  - Reason: the frozen Design Map "Implementation freedom" deliberately
    leaves the execution-binding and delegation representation, storage,
    capability lifetime, and validation transport as implementation freedom.
    Independent evaluation therefore relies on the implementation's own
    visible regression suite rather than an evaluator-authored hidden test
    that would have to invent that representation.
  - Source: frozen brief AC01-AC07; "Deterministic skill and contract
    binding"; "Delegated authority source and validation boundary"; frozen
    Design Map "Shared contracts", "Design decisions", "Implementation
    freedom".
  - Implementation impact: these scenarios live in `test/*.test.ts` and run
    through `npm test`.

- **TR2** - The implementation must provide durable, visible regression
  evidence that provider/process lifecycle and methodology-role disposition
  are represented as distinct, durable facts; that a provider process exiting
  normally while refusing or blocking its assigned role is never represented
  as successful role completion; that successful role completion carries
  machine-readable evidence distinguishable from process exit alone; and that
  a governed workflow prerequisite cannot advance solely because the
  underlying process terminated successfully.
  - Reason: the frozen Design Map leaves the role-result schema and
    disposition vocabulary as implementation freedom ("result
    schema/disposition vocabulary... free provided they preserve the shared
    observable contracts").
  - Source: frozen brief AC12-AC15; "Authoritative semantic role result";
    frozen Design Map "Shared contracts", "Implementation freedom".
  - Implementation impact: `test/*.test.ts` coverage for the role-result
    boundary, run through `npm test`.

- **TR3** - The public run/workflow inspection surface (CLI and/or host API)
  must expose, without requiring the caller to hand-parse `.workflow` or
  `workflow.jsonl`: on a successful dispatch, the created host-owned run
  identity, the allocated role, and the executor; a way to follow or inspect
  the run to a semantic terminal outcome; the governing contract identity and
  its execution/delivery mode; both process state and methodology-role
  disposition together; and, after a fresh/restarted runner resumes from
  canonical authority, a distinguishable fact that adoption/resumption
  occurred rather than ordinary dispatch replay.
  - Reason: AC18 and AC23-AC26 require this information to be discoverable
    directly; the exact field spellings, command syntax, and API shape are
    explicit Design Map implementation freedom, the information content is
    not.
  - Source: frozen brief AC18, AC23-AC26; "Workflow and run observability";
    "Runner adoption and resume"; frozen Design Map "Shared contracts",
    "Implementation freedom".
  - Implementation impact: the status/inspect/follow surface returns the
    above fields; the exact command/route syntax is free.

- **TR4** - The implementation must ship a durable, visible regression
  fixture, plus preserved private evaluator-preparation history, establishing
  that the Spike 013a temporary direct host-owned bootstrap-allocation path
  identifies the exact upstream frozen canonical authority it derives from,
  is recorded distinguishably from ordinary runner dispatch history, and does
  not fabricate prior dispatch or completion events.
  - Reason: AC29 requires the bootstrap path used to implement this very spike
    to stay bounded and explicit; this spike's own `.workflow/state.json` and
    `manifest.md` already record two genuine uses of that exception (Run 002,
    Run 003) that the implementation's regression evidence must remain
    consistent with.
  - Source: frozen brief AC29; "Spike 013a bootstrap exception".
  - Implementation impact: `test/*.test.ts` coverage plus this spike's own
    preserved operational and manifest history remaining intact and
    unmodified by implementation.

- **TR5** - The implementation must generalize or duplicate, past Spike 012,
  the existing pinned-evaluator-authority enforcement mechanism
  (`resolveSpike012VerificationAuthority` in `src/workflow-run.ts` and
  `bootstrapAuthority` in `tools/workflow.ts`, both currently hardcoded to
  workflow `"012"`) so that Spike 013a's own `evaluator-prepare` and
  `evaluator-verify` allocations are bound to the pinned pre-implementation
  evaluator authority recorded at
  `spikes/013a-Workflow-execution-friction/bootstrap/`, not to a
  potentially-modified working-tree `skills/evaluator/SKILL.md`. The
  finalized Spike 013a verification result must bind the same
  bootstrap-authority identity.
  - Reason: AC30 and AC31 require both evaluator phases to be governed by an
    exact, provenance-verifiable pre-implementation evaluator skill identity,
    and the execution mechanism to prove the post-implementation skill was
    not substituted as the grading authority for this spike, which by its own
    nature is likely to modify evaluator invocation semantics.
  - Source: frozen brief AC30, AC31; "Evaluator bootstrap and
    self-modification exception"; frozen Design Map "Shared contracts".
  - Implementation impact: a generalized or duplicated pin-enforcement path
    plus `test/*.test.ts` regression coverage of it; both the freeze and the
    verification result cite the bootstrap-authority identity.

- **TR6** - Before evaluator preparation is exercised at verify time against
  the live Claude and Codex fixtures, the implementation must have already
  fixed - and preserved - for each fixture its role, canonical-authority
  prerequisite, required workspace/access boundary, permitted repository side
  effects, expected semantic role result, and cleanup/isolation requirements,
  as bounded, reproducible, repository-owned material. Neither fixture may
  advance `spikes/011-host-owned-workflow-runs` authority.
  - Reason: the frozen brief "Scenario prerequisites" requires these
    properties fixed before opportunistic selection after observing
    implementation behavior; AC08-AC11 and AC32-AC34 cannot be fairly
    evaluated without them.
  - Source: frozen brief "Reserved live-provider acceptance scenarios",
    "Scenario prerequisites", "Host boundary"; AC08-AC11, AC32-AC34.
  - Implementation impact: two bounded repository-owned fixtures (one
    Claude-targeted, one Codex-targeted) with their properties documented
    before verification begins.

- **TR7** - The full `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` must pass at the
  implementation commit, and the pre-existing workflow authority/provenance,
  evaluator-integrity, host-owned workflow-run, and session/backend suites
  must remain green.
  - Reason: existing behavior must not regress while this spike adds
    execution-binding, delegation, role-result, adoption, retry,
    observability, and authority-status behavior to the same code paths.
  - Source: `AGENTS.md` "Testing and verification"; frozen brief non-goals
    (no removal of evaluator independence or existing methodology
    guarantees).
  - Implementation impact: additive changes that do not break existing
    surfaces; all repository checks green.

## Evaluator Assumptions

- **A1** - The execution-binding and delegation representation, storage,
  capability lifetime, validation transport, role-result schema/disposition
  vocabulary, adapter entry-point layout, status/inspect/follow command
  syntax, operational adoption-record schema, retry/concurrency mechanism,
  fixture implementation, and cleanup machinery are all explicit Design Map
  implementation freedom. Evaluation asserts observable behavior and
  information content through the visible regression suite, hidden CLI-driven
  tests against already-existing public seams, and live-provider/host-boundary
  fixtures - not a specific schema, route, field name, or file path.
- **A2** - "The runner" means `tools/workflow.ts` (or its Design-Map-approved
  successor) together with its append-only `workflow.jsonl` canonical
  authority ledger and its `.workflow/state.json` local operational state.
  "The host" means the existing Harness host-owned workflow-run surface
  (`src/workflow-run.ts`, `src/workflow-backend.ts`, `src/index.ts`, or their
  Design-Map-approved successors).
- **A3** - This evaluator preparation, and Spike 013a verification, both
  execute under the pinned pre-implementation evaluator skill `evaluator` v11,
  content identity
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  per the frozen brief "Evaluator bootstrap and self-modification exception".
  At the preparation commit the working-tree `skills/evaluator/SKILL.md` is
  byte-identical to the pinned `bootstrap/evaluator-skill.md`, so this
  preparation already runs the pinned contract. Unlike Spike 012, no
  host/CLI-side mechanism yet enforces this pin for Spike 013a specifically;
  TR5 requires the implementation to add that enforcement, and doing so is
  itself in scope (AC30, AC31), not a precondition assumed to already exist.
- **A4** - "Acceptance semantics unchanged" is judged against the frozen
  `spike.md`, the frozen `design-map.md`, and the frozen public
  `eval-requirements.md`. Existing behavior and tests are evidence, not
  automatic requirements.
- **A5** - The two required live-provider fixtures (LP1 Claude, LP2 Codex) are
  bounded, repository-owned, and reproducible; neither advances
  `spikes/011-host-owned-workflow-runs` canonical authority. AC34 is evaluated
  as demonstrated readiness (LP1 exercising the original refusal condition,
  plus confirmation that Spike 011's public history is untouched), not as an
  actual Spike 011 recovery, per the frozen brief "Spike 011 recovery" and
  "Completion boundary".
- **A6** - A required live Claude or Codex executor being unavailable for
  external reasons (authentication, service availability, configuration) at
  verify time makes the affected criteria (AC08-AC11, AC32-AC34) `BLOCKED`,
  not `FAIL`, and does not permit substituting mocked or static evidence for
  the mandatory live-provider or host-boundary scenarios.

## Blocking Questions

None.

## Environment Requirements

Node.js `>=24.12.0`, Git, and the repository's existing public test,
typecheck, lint, and formatting tooling (`npm test`, `npm run typecheck`,
`npm run lint`, `npm run format:check`). A reachable Harness host process and
live Claude and Codex executor access are required specifically for the
mandatory live-provider fixtures (LP1, LP2) and the host-boundary case (HB1);
no other part of the evaluation requires external services, credentials, or
paid provider access.
