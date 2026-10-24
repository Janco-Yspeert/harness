# Evaluation Requirements

## Testability Requirements

- **TR1** - The implementation must provide durable, visible in-repository
  regression evidence (executed through `npm test`) that: exactly one
  authority-resolution path reads the canonical Authority Ledger for a
  governed transition; deleting/recreating local `.workflow` operational
  state does not change the next legally eligible methodology role and does
  not fabricate historical dispatch (spike.md's own R2 fixture); a fresh
  runner instance with no local operational history derives the correct next
  action from canonical authority and configured methodology alone; and a
  fixture equivalent to spike.md's own R1 scenario (canonical verification
  PASS and promotion complete, an operational evaluator run blocked by a
  later publication-transport failure, local runner state absent/stale)
  still reaches As-Built eligibility through canonical authority and policy.
  - Reason: the Authority Resolver's internal shape, storage, and
    API/transport are explicit Design Map implementation freedom
    ("resolver API/transport... free"); independent evaluation therefore
    relies on the implementation's own visible regression suite reproducing
    the brief's own named scars rather than an evaluator-authored hidden
    test that would have to invent that representation.
  - Source: frozen brief AC01-AC04; "Scope" §1-§2; "Required regression
    scenarios" R1, R2; "Primary scars" #1; frozen Design Map "Shared
    contracts", "Invariants", "Implementation freedom".
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`.

- **TR2** - The implementation must provide durable, visible regression
  evidence that a running Workflow Execution Grant binds exactly one
  content-addressed Methodology Definition; that role availability/eligibility
  for at least one non-trivial transition is demonstrably data-driven rather
  than hard-coded; and that changing workflow policy, a contract, or a
  governing skill produces a new Methodology Definition identity without
  reinterpreting an already-bound Workflow Execution Grant. The
  implementation's own As-Built or implementation report must additionally
  identify, by path, which files constitute "the normal kernel path" so the
  evaluator can perform the AC06/AC07/AC31 manual source-inspection
  component fairly.
  - Reason: the Methodology Definition's storage representation and the
    kernel file layout are explicit Design Map/implementation freedom; the
    absence of hard-coded phase/role/path knowledge in the normal kernel
    path (AC06, AC07, AC31; "Simplification requirements" #2-#3) is
    genuinely a source-inspection fact, not something a pre-authored hidden
    test can target without knowing the eventual file layout.
  - Source: frozen brief AC05-AC08, AC31; "Scope" §3-§4, §24;
    "Simplification requirements"; frozen Design Map "Shared contracts",
    "Implementation freedom".
  - Implementation impact: `test/*.test.ts` coverage, plus an explicit
    kernel-path identification in the As-Built/implementation report.

- **TR3** - The implementation must provide durable, visible regression
  evidence that a human instruction to run/continue a workflow creates or
  binds an explicit Workflow Execution Grant with bounded continuation/
  stopping scope; that an observation/status/inspection request does not
  create execution authority or allocate a role; that every governed
  execution is bound to one exact immutable, inspectable Role Grant; and that
  provider or orchestrator prompt text alone cannot grant a governed role.
  - Reason: the Workflow Execution Grant and Role Grant's storage/API shape
    are explicit Design Map implementation freedom.
  - Source: frozen brief AC09-AC12; "Scope" §7-§8; frozen Design Map "Shared
    contracts".
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`.

- **TR4** - Before AC13/AC14 are exercised at verify time, the implementation
  must fix and preserve, as bounded, reproducible, repository-owned material:
  (a) a spawned-execution fixture whose Role Grant and Execution Handle are
  inspectable end to end through the real supported host boundary; and (b) an
  attached-execution fixture that is a real external OS process or
  equivalent independently running executor, started before the Role Grant
  is issued, connected through the actual supported host boundary,
  long-lived enough to receive a later Role Grant, and incapable of
  satisfying the proof through an in-memory callback or direct test-only
  method invocation. Both fixtures must durably persist or expose: existing
  session/executor identity; Workflow Execution Grant identity; Role Grant
  identity; execution/run identity or Execution Handle; and semantic Role
  Result.
  - Reason: spike.md's own "Minimum reproducible proof protocol" and
    "Live-provider evidence" require these exact properties fixed before
    implementation; AC13/AC14 cannot be fairly evaluated without them, and
    the Design Map leaves endpoint names, transport, and storage free.
  - Source: frozen brief AC13, AC14; "Scope" §9 "Attached and spawned
    execution"; "Live-provider evidence" #1-#2.
  - Implementation impact: two bounded, repository-owned/host-controlled
    fixtures with their properties documented before verification begins.

- **TR5** - The implementation must provide durable, visible regression
  evidence reproducing spike.md's own R4 fixture: a session/execution
  identity mechanically granted evaluator-private material has that exposure
  fact recorded against it; removing the private workspace grant afterward
  does not erase the recorded exposure; a clean session (no exposure) may be
  implementation-eligible while a session that has seen evaluator-private
  material is mechanically denied the same implementation Role Grant
  regardless of prompt wording.
  - Reason: the exposure/provenance representation is Design Map freedom
    ("workspace identity... as needed").
  - Source: frozen brief AC15-AC17; "Scope" §10; "Required regression
    scenarios" R4.
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`.

- **TR6** - The implementation must provide durable, visible regression
  evidence reproducing spike.md's own R5 fixture: for one execution, process
  state, semantic Role Result, methodology result, and Host Action Result
  remain independently inspectable; a later host-action failure (e.g.
  publication) recorded after a successful semantic role result does not
  retroactively change that already-recorded semantic result.
  - Reason: the exact result schema/vocabulary is explicit Design Map
    implementation freedom.
  - Source: frozen brief AC18-AC19; "Scope" §13; "Required regression
    scenarios" R5.
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`.

- **TR7** - Before AC20/AC21 are exercised at verify time, the implementation
  must fix and preserve, as bounded, reproducible, repository-owned/
  host-controlled material, a local bare-remote publication proof exactly as
  spike.md's "Required bounded publication environment" specifies: the bare
  remote is host-created/controlled and lives outside every executor
  workspace grant; the executor receives no remote credentials and no direct
  publication/network capability; the Role Grant permits only the structured
  host publication action; Harness validates the request and performs the
  actual ref advance; and the following durable evidence is preserved: the
  requested commit identity, target ref/branch, remote ref identity before
  and after publication, the exact host action/result that caused the
  advance, and confirmation the executor's grant/profile lacked direct
  remote-publication authority.
  - Reason: spike.md fixes these exact properties before implementation
    precisely so no GitHub credentials or external network are required for
    the mandatory proof, and to rule out a mocked `git push` or a
    successful direct executor push as sufficient evidence.
  - Source: frozen brief AC20-AC21; "Scope" §12 "Required bounded
    publication environment".
  - Implementation impact: a bounded, reproducible local bare-remote
    publication fixture and the listed durable evidence, preserved before
    verification begins.

- **TR8** - The implementation must provide durable, visible regression
  evidence reproducing spike.md's own R7 fixture: a bounded human-root
  authority record, interpreted generically by the resolver from data (not
  spike-specific kernel conditionals such as `if spike === "014"`), changes
  what may happen next without editing old ledger events, rewriting a
  blocked run, or mutating an existing immutable Role Grant.
  - Reason: the root-authority record's storage/schema is Design Map
    freedom; the generic-interpretation requirement is what AC22 actually
    tests.
  - Source: frozen brief AC22; "Scope" §15; "Required regression scenarios"
    R7.
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`.

- **TR9** - Before AC24-AC26 are exercised at verify time, the implementation
  must fix and preserve, as bounded, reproducible, repository-owned material,
  one real human-wait/resume proof through the actual supported Harness host
  boundary: a real governed execution requests permitted human input,
  enters a structured `WAITING_FOR_HUMAN` state without being cancelled,
  terminated, or replaced, receives a permitted human response recorded
  against the exact same execution/request identity, records any
  authority-changing response canonically before delivery/resume, and
  resumes the same execution identity to a later terminal semantic result.
  The fixture must durably persist or expose, in addition to TR4's
  identities: human-request identity and response identity/reference.
  - Reason: spike.md's own "Required bounded proof" fixes these exact
    properties before implementation; the transport/storage for the waiting
    state and human request/response are Design Map freedom.
  - Source: frozen brief AC24-AC26; "Scope" §14; "Required regression
    scenarios" R6.
  - Implementation impact: one bounded, repository-owned human-wait/resume
    fixture with its properties documented before verification begins.

- **TR10** - The implementation must provide durable, visible regression
  evidence reproducing spike.md's own R3 fixture (two continue requests,
  including concurrent ones, against the same canonical authority basis,
  resulting in exactly one allocation/Role Grant); that a policy-permitted
  retry/replacement produces a distinct execution identity with explicit
  predecessor lineage rather than overwriting the prior one; that a caller
  can inspect/await the same execution by stable identity after
  disconnecting and reconnecting; and that an execution Harness cannot
  reattach to after host recovery is represented as interrupted/lost, not
  silently absent.
  - Reason: the allocation-keying mechanism, durable-identity transport, and
    interrupted-execution representation are explicit Design Map
    implementation freedom.
  - Source: frozen brief AC27-AC30; "Scope" §16-§18; "Required regression
    scenarios" R3.
  - Implementation impact: `test/*.test.ts` coverage run through `npm test`.

- **TR11** - The implementation must provide durable, visible regression
  evidence that kernel lifecycle and host-action operations emit/expose
  telemetry correlated to stable Workflow Execution Grant/Role Grant/
  execution identities through a seam distinct from authority decisions,
  and that a failed/unavailable telemetry collection does not invalidate an
  otherwise successful governed role; and manual-inspection-reviewable
  evidence (in the As-Built/implementation report) that an explicit
  executor-selection seam exists in the Role Grant/execution data model,
  capable of later incorporating provider/model/reasoning/isolation/
  availability/usage/cost without changing the authority/methodology model,
  and that each new persisted structure Spike 014 introduces (Methodology
  Definition, Workflow Execution Grant, Role Grant, structured role result,
  root-authority record, host-action request/result) carries explicit
  schema/version information where persisted as a distinct artifact.
  - Reason: the telemetry sink, executor-selection seam shape, and concrete
    schema/version encoding are explicit Design Map implementation freedom;
    full telemetry accounting, executor policy, and a migration framework
    are explicit non-goals.
  - Source: frozen brief AC32-AC35; "Scope" §20-§21, §25; non-goals.
  - Implementation impact: `test/*.test.ts` coverage plus an explicit
    schema-version/executor-seam identification in the As-Built/
    implementation report.

- **TR12** - The full `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` must pass at the
  implementation commit, and the pre-existing workflow authority/provenance,
  evaluator-integrity, host-owned workflow-run, and session/backend suites
  must remain green.
  - Reason: existing behavior must not regress while this spike consolidates
    and replaces authority, contract-resolution, execution-binding, and
    result-representation machinery those suites already exercise.
  - Source: `AGENTS.md` "Testing and verification"; frozen brief
    "Simplification requirements" #6 (prior truthful blocked/failure
    history remains preserved).
  - Implementation impact: additive/consolidating changes that do not break
    existing surfaces; all repository checks green.

## Evaluator Assumptions

- **A1** - The Authority Resolver, Methodology Definition, Workflow
  Execution Grant, Role Grant, execution-binding/session-registry,
  provenance, result-schema/disposition vocabulary, host-action, root-
  authority-record, telemetry-sink, and executor-selection-seam
  representations, storage, and API/transport are all explicit Design Map
  implementation freedom ("Implementation freedom" section). Evaluation
  asserts observable behavior and information content through the
  implementation's own visible regression suite, mandatory real-boundary
  proofs, and manual source/data-model inspection against the decision
  rules frozen in `eval-spec.md`/`case-manifest.json` - not a specific
  schema, route, field name, or file path.
- **A2** - "The normal kernel path", for the AC06/AC07/AC31 manual
  source-inspection component, means whatever files the implementation's
  own As-Built or implementation report identifies as the authority/
  execution kernel. Evaluation reviews that identified set of files; it does
  not presume a specific pre-implementation path.
- **A3** - Unlike Spike 012 and Spike 013a, no pinned pre-implementation
  evaluator-authority snapshot applies to Spike 014's own `evaluator-prepare`
  or `evaluator-verify` allocations: the existing `bootstrapAuthority()` pin
  mechanism in `tools/workflow.ts` special-cases only
  `012-correction-cycles-evaluator-repair` and
  `013a-Workflow-execution-friction`. This preparation therefore executes
  directly under the plain working-tree `skills/evaluator/SKILL.md`,
  `evaluator` v11, content identity
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
- **A4** - "Acceptance semantics unchanged" is judged against the frozen
  `spike.md`, the frozen `design-map.md`, and the frozen public
  `eval-requirements.md`. Existing behavior and tests are evidence, not
  automatic requirements.
- **A5** - The four mandatory real-boundary proofs (attached execution,
  spawned execution, host-mediated publication, human-wait/resume) are
  bounded, repository-owned/host-controlled, and reproducible without
  GitHub credentials or external network availability, per spike.md
  "Required bounded publication environment" and "Minimum reproducible
  proof protocol". None may advance `spikes/011-host-owned-workflow-runs`
  Cycle 002 authority, per spike.md "Spike 011 Cycle 002".
- **A6** - A required executor, host process, or local git-remote capability
  being unavailable for external/environmental reasons at verify time makes
  the affected criteria (AC13, AC14, AC20, AC21, AC24-AC26) `BLOCKED`, not
  `FAIL`, and does not permit substituting mocked or static evidence for a
  mandatory real-boundary proof.
- **A7** - Evidence produced by the Spike 014 process-execution bootstrap
  path (the current Codex-driven Brief Readiness / Design Map / evaluator-
  preparation cycle, including this preparation itself) does not, by itself,
  satisfy any criterion concerning the new authority, grant, provenance,
  attached-execution, or human-interaction mechanisms (at minimum AC09-AC17,
  AC22-AC30). Those criteria require evidence produced through the
  implemented Spike 014 path, per spike.md "Process-execution bootstrap".

## Blocking Questions

None.

## Environment Requirements

Node.js `>=24.12.0` (the repository's own `engines` requirement; evaluator
preparation itself ran under the locally available Node `v22.23.2`, which
was sufficient to execute the full pre-implementation `npm test` (86/86
passing), `npm run typecheck`, `npm run lint`, `npm run format:check`, and
`git diff --check`), Git, and the repository's existing public test,
typecheck, lint, and formatting tooling (`npm test`, `npm run typecheck`,
`npm run lint`, `npm run format:check`). A reachable Harness host process,
the ability to start real OS-level child executor processes, and the
ability to create a local bare Git repository are required specifically for
the mandatory real-boundary proofs (LB1, LB2, LB3); no GitHub credentials or
external network access are required for any part of this evaluation,
including publication (spike.md "Required bounded publication environment").
