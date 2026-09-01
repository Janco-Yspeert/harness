# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/011-host-owned-workflow-runs`
- Project commit at preparation:
  `52dc78e6654fc53fba466a5003a40fb22f56ac18` (`feat/spike-011`)
- `spike.md`:
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
  (frozen at `9af63ce`)
- `design-map.md`:
  `sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`
  (frozen at `3689964`)
- `eval-requirements.md`:
  `sha256:<recorded in .eval/freeze.json inputs.evaluationRequirements>`
- Canonical evaluator skill: `skills/evaluator/SKILL.md`
- Evaluator skill name / contract version: `evaluator` v10
- Evaluator skill content identity:
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`
- Evaluation revision identity: content identity of the formatted
  `.eval/freeze.json` for revision `001`

This preparation runs under evaluator v10 with no bootstrap or process
exception: the frozen `spike.md` declares a bootstrap exception only for the
Spike 011 *workflow runner* dispatch path, not for evaluator preparation
integrity. Evaluator v10 step 4 pre-freeze integrity validation is performed
mechanically with `tools/evaluator-integrity.ts`
(`validatePreparedEvaluatorBundle` / `prepareEvaluatorBundle`) over the prepared
AC coverage bundle, supplemented by a deterministic checklist
(`pre-freeze-integrity-checklist.md`) for the structural properties that tool
does not itself check (physical file existence, hash recomputation of the frozen
bundle, public/private consistency, and no verification attempt allocated during
`prepare`). The Spike 010c human rejection (`IMPLEMENTATION_GAP`) recorded that
`tools/evaluator-integrity.ts` validates a supplied bundle description rather
than the physical bundle; the supplementary checklist closes exactly that gap
for this revision.

## Pre-Freeze Integrity Gate

Recorded before Status was set to Frozen. Full evidence in
`pre-freeze-integrity-checklist.md`; summarised in `.eval/freeze.json`
`integrityChecks` and `preFreezeIntegrityValidation`.

- Shared helpers: none. This revision freezes no executable hidden test and no
  evaluator helper script. Every evidence procedure is either a visible
  regression obligation the frozen brief places on the implementation
  (`test/*.test.ts` run through `npm test`; acceptance criterion AC20), a static
  inspection of the frozen implementation source at the evaluated commit, or a
  `git` / command-exit provenance inspection. `hash.mjs` in the private
  workspace parent is a disposable identity calculator, not part of any frozen
  revision.
- Mandatory executable cases (E1-E12) are visible-regression obligations that
  the implementation must materialize (brief scope 1-11; AC01-AC09, AC11-AC20).
  They are exercised at `prepare` only through the controlled
  pre-implementation baseline permitted by evaluator v10: at
  `52dc78e` `npm test` is green (42/42); `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` each exit 0; and inspection of
  `src/index.ts`, `src/session-backend.ts`, and `tools/workflow.ts` at the
  preparation commit confirms that no host-owned workflow-run registry, no
  workflow-run HTTP surface, no normalized workflow lifecycle events, and no
  workflow backend/factory seam exist yet, and that `tools/workflow.ts` still
  directly `spawn`s detached child processes (`launch()`), so E1-E12 have real
  falsifying power once implemented. No candidate implementation exists at
  freeze; none was used to shape any frozen case.
- Mandatory non-executable cases (S1-S4, P1-P2): each frozen procedure in
  `case-manifest.json` names a concrete artifact or command, a concrete
  inspection question, and a concrete decision rule. None defers "what will be
  inspected" until after candidate exposure. S1-S4 name repository regions
  (`src/`, `tools/workflow.ts`, and the implementation's own workflow-run
  module wherever it is placed) whose exact file layout is Design Map
  implementation freedom; the inspection question and decision rule are fully
  concrete regardless of where the implementation places the code.
- Runtime assumptions validated at `52dc78e`: Node `v24.18.0` present
  (`>=24.12.0`); `npm test` (42 tests, 42 pass); `npm run typecheck`,
  `npm run lint`, `npm run format:check`, and `git diff --check` clean;
  `node tools/workflow.ts authority status spikes/011-host-owned-workflow-runs`
  parses the two recorded authority events and reports `legalTransitions`
  `["brief-frozen","design-map-frozen"]`.
- Harness parse/compile/execute: `tools/evaluator-integrity.ts` and
  `tools/workflow.ts` execute under `npm test` and via direct invocation; the
  prepared AC coverage bundle passes `prepareEvaluatorBundle` with
  `integrity.status` `PASS` and a readiness attestation whose
  `integrityValidation` is `PASS`; the frozen `coverage-map.json` parses as JSON
  and satisfies the current `validatePreparedMap` shape (21 unique criterion
  records, readiness attestation with `integrityValidation: "PASS"`).

## Explicit Requirements

Sources are the frozen `spike.md` acceptance criteria (AC01-AC21), the frozen
`spike.md` scope sections, and the frozen Design Map. Existing behavior and
tests are evidence, not automatic requirements.

- **R1** - Canonical workflow role executions requested through the supported
  workflow path are owned by the existing Harness host/runtime architecture
  under `src/` (integrated into the `startHarnessHost` lifecycle) rather than by
  the initiating client process or a new methodology-specific daemon. (AC01;
  brief scope 1, 1A, 6; Design Map "Shared contracts", "Design decisions")
- **R2** - A client can disconnect after launch without terminating or losing
  the Harness-owned run while the host remains alive. (AC02; brief scope 1;
  Design Map invariant 1)
- **R3** - A later client can inspect the same active or terminal run by stable
  Harness identity. (AC03; brief scope 1; Design Map "Shared contracts")
- **R4** - The run record contains workflow slot, execution-attempt identity,
  role, executor/provider, invocation mode, allowed workspace(s),
  permission-profile identity, lifecycle status, created/started/last-activity/
  terminal timestamps, and available process id and/or provider session
  identity. (AC04; brief scope 2; Design Map "Design decisions")
- **R5** - Methodology/workflow attempt identity and operational
  execution-attempt identity are represented separately and both are observable.
  (AC05; brief scope 3; Design Map "Shared contracts")
- **R6** - Two concurrent or repeated start requests for the same active
  workflow slot produce at most one child/provider execution, and the check and
  allocation are concurrency-safe within one Harness host. (AC06; brief scope 4;
  Design Map "Shared contracts")
- **R7** - A duplicate start request returns/identifies the existing run or
  fails with an explicit conflict rather than spawning another worker. (AC07;
  brief scope 4; Design Map "Shared contracts", "Implementation freedom")
- **R8** - Replacement cannot be allocated while the prior canonical execution
  for that slot remains active. (AC08; brief scope 5, "Failure and recovery
  semantics"; Design Map "Shared contracts")
- **R9** - Replacement terminalizes and preserves the prior execution and
  records the reason and the executor/fallback change where applicable. (AC09;
  brief scope 5; Design Map "Shared contracts", invariant 4)
- **R10** - The canonical `tools/workflow.ts` execution path (or its
  Design-Map-approved successor) uses the existing Harness host-owned run
  mechanism rather than directly owning detached workflow child processes or
  routing through a parallel methodology-specific daemon; a host absent from the
  configured URL is an explicit dispatch failure, not permission to create a
  client-owned worker. (AC10; brief scope 6, 1A; Design Map "Shared contracts",
  "Design decisions")
- **R11** - A workflow phase cannot be recorded complete through that runner
  unless the canonical run for the matching phase/attempt is terminally
  complete. (AC11; brief scope 6; Design Map "Design decisions")
- **R12** - Harness exposes structured run lifecycle events for allocation,
  start, activity/output, completion, failure, cancellation, and replacement.
  (AC12; brief scope 7; Design Map "Design decisions")
- **R13** - Execution text/logs remain inspectable and tied to the run but are
  not automatically treated as frozen methodology evidence, downstream role
  context, or a workflow-completion signal. (AC13; brief scope 8; Design Map
  "Design decisions")
- **R14** - A standard workflow worker can perform routine repository-local
  reads, role-authorized writes, arbitrary local computation (including shell
  child processes), tests/build/typecheck/lint/format commands, normal Git
  inspection, and role-permitted Git staging/commit without per-command human
  prompts. (AC14; brief scope 9; Design Map invariant 5)
- **R15** - Evaluator execution can declare an additional private evaluator
  workspace without granting arbitrary unrestricted host access. (AC15; brief
  scope 9; Design Map invariant 5)
- **R16** - Routine workflow execution does not require an unrestricted
  permission/sandbox bypass mode (Codex
  `--dangerously-bypass-approvals-and-sandbox`, Claude `bypassPermissions`, or
  equivalent unrestricted-host mode); any narrow bootstrap exception is explicit
  in the Design Map and execution record. (AC16; brief scope 10; Design Map
  "Design decisions", invariant 5)
- **R17** - The applied permission profile is recorded on the run. (AC17; brief
  scope 9; Design Map "Design decisions")
- **R18** - Run accounting records directly observable elapsed time, executor,
  execution attempt/replacement count for the slot, and terminal disposition;
  unavailable provider usage/cost data is omitted, not estimated. (AC18; brief
  scope 11; Design Map invariant 3)
- **R19** - Directly launching a plausible Codex/Claude process outside the
  Harness run mechanism does not create a canonical run or satisfy the workflow
  runner's completion requirement merely by writing plausible artifacts. (AC19;
  brief scope 6; Design Map "Design decisions")
- **R20** - Visible regression coverage demonstrates client detachment,
  duplicate-launch prevention, replacement ordering, terminal-completion
  binding, event visibility, and diagnostic-log/noncanonical separation without
  requiring live paid provider calls. (AC20; brief scope 1A, 6, 7; Design Map
  "Design decisions")
- **R21** - Existing Harness session/backend behaviour remains green;
  repository tests, typecheck, lint, formatting, and `git diff --check` pass.
  (AC21)

## Derived Invariants

- **I1** - Host shutdown may terminate active runs; client disconnection may
  not, and an unknown/lost client does not imply the worker is lost. Run records
  and logs remain inspectable until that host exits; restart persistence is not
  established. (from R1, R2, R3; Design Map invariants 1, 2; brief "Failure and
  recovery semantics")
- **I2** - Allocation is atomic within one host: for an active slot a repeated
  allocation returns the existing canonical run and never creates a second
  backend/process, even across multiple clients or orchestrator turns. (from R6,
  R7; Design Map "Shared contracts")
- **I3** - Replacement is ordered: the prior execution is given a terminal
  disposition (`failed`, `cancelled`, or `replaced`) with the link and reason
  recorded before the next execution attempt is allocated; an active execution
  is never silently replaced. (from R8, R9; Design Map "Shared contracts",
  invariant 4; brief "Failure and recovery semantics")
- **I4** - Interactive sessions and workflow runs share host-owned identity
  allocation, backend lifecycle observation, termination, event publication, and
  diagnostic-output retention, but remain distinct records: only interactive
  sessions carry client attachment and input; workflow runs carry role/phase
  slot, methodology attempt, execution attempt, executor, invocation mode,
  workspace boundary, permission-profile identity, and replacement provenance.
  (from R1, R4, R5; brief scope 1A; Design Map "Design decisions")
- **I5** - Normalized workflow lifecycle events (allocated, started, activity,
  completed, failed, cancelled, replaced) are published on the existing Harness
  structured-event/domain stream; raw backend output is retained per run and may
  cause activity events, but is diagnostic data only and neither changes
  methodology state nor supplies downstream role context, and completion is
  never inferred from a phrase in agent output. (from R12, R13; brief scope 7,
  8; Design Map "Design decisions")
- **I6** - The host owns process creation through a workflow backend/factory
  seam; the default local backend invokes supported executors with an
  explicitly named workspace-bounded profile and must not use an
  unrestricted-bypass mode, and tests may supply an in-memory backend through
  that seam so the visible suite needs no paid provider. (from R10, R14, R16,
  R20; Design Map "Design decisions")
- **I7** - The workflow runner continues to own artifact authority and
  phase-order checks; before recording a phase complete it queries the matching
  canonical run and requires its terminal disposition to be `completed`, so a
  direct external process (which has no usable run identity) cannot satisfy
  completion binding. (from R10, R11, R19; Design Map "Design decisions")

## Negative Requirements

- **N1** - Host ownership must not be satisfied by creating a separate
  methodology-specific daemon, workflow daemon, second long-lived service beside
  the existing Harness host, or a parallel control plane. Shared lower-level
  abstractions must be integrated into the existing host lifecycle.
- **N2** - Starting a role execution through the supported workflow/run
  interface must not make the initiating Codex conversation, shell, browser, or
  CLI process the owner of that execution, and a client disconnecting or being
  lost must not terminalize the run.
- **N3** - A duplicate/concurrent start request for an already-active slot must
  not spawn a second worker; a slot must not have two active canonical
  executions.
- **N4** - An active worker must not be silently replaced: a replacement
  execution must not be allocated before the prior execution has an explicit
  terminal disposition.
- **N5** - Routine role-authorized work within the declared workspace must not
  require an unrestricted permission/sandbox bypass mode and must not repeatedly
  interrupt the human for command-level approval; the permission model must be
  capability/workspace-oriented rather than a fragile per-binary allowlist.
- **N6** - Raw Claude/Codex conversation text must not automatically become a
  frozen methodology artifact, must not be automatically fed to later roles as
  context, and workflow completion must not be inferred from a phrase in agent
  output.
- **N7** - A directly launched Codex/Claude process outside the Harness run
  mechanism must not be treated as a canonical execution for the workflow slot
  and must not satisfy the workflow runner's completion requirement merely
  because it writes plausible artifacts.
- **N8** - Spike 011 must not rewrite, repair, or otherwise alter the public
  artifacts, promoted `evaluation/**`, or `workflow.jsonl` timelines of Spikes
  008, 009, 010, 010a, 010b, or 010c; their technical results are historical
  evidence, not repaired by this spike.
- **N9** - Post-implementation evaluator correction must trace to frozen
  pre-implementation authority, preserve the prior revision, and adopt no
  implementation-shaped seam; after two post-implementation corrections the next
  issue is classified before any further revision, and a repeated
  preparation-integrity failure is a methodology/evidence-model defect, not an
  implementation failure.

## Evaluation Cases

See `case-manifest.json` for the machine-readable form. Every case is mandatory.
`.hidden-test/manifest.json` records that no evaluator-authored executable
hidden test is frozen in this revision.

- **E1** - public regression (`test/*.test.ts` via `npm test`). Verifies R1, R2,
  R3; I1, I4; N1, N2. Coverage mode: executable public regression; materialized
  by implementation (brief scope 1; AC01-AC03, AC20). Expected observable
  outcome: a workflow run requested through the supported workflow/run interface
  is owned by the existing Harness host; after the initiating client
  disconnects, the run keeps running while the host is alive, its record and
  diagnostic output remain inspectable, and a later client resolves and inspects
  the same run - active or terminal - by its stable Harness run identity;
  completion and failure remain observable after client disconnect. No hidden
  test: the run identity shape, route names, and JSON field spellings are Design
  Map implementation freedom, so an evaluator-authored executable test would
  have to invent that surface.
- **E2** - public regression. Verifies R4, R17; I4. Coverage mode: executable
  public regression; materialized by implementation (brief scope 2, 9; AC04,
  AC17). Expected observable outcome: the canonical run record exposes, in some
  stable observable form, the workflow/spike identity, workflow phase/role slot,
  methodology attempt where one exists, execution attempt identity, role, skill
  and skill version when known, actual executor/provider, invocation mode
  (delegated/direct/retry/fallback), reason for retry/replacement/fallback when
  applicable, allowed workspace(s), permission-profile identity,
  created/started/last-activity/terminal timestamps, current lifecycle status,
  terminal disposition/reason, parent/orchestrator identity when reliably
  available, process id and/or provider session identity when available, and the
  diagnostic log/event location; unavailable provider/model metadata is not
  invented.
- **E3** - public regression. Verifies R5; I4. Coverage mode: executable public
  regression; materialized by implementation (brief scope 3; AC05). Expected
  observable outcome: replacing a worker process/session for a workflow slot
  creates a new operational execution attempt for that slot without
  manufacturing a new methodology/workflow (e.g. evaluator-preparation or
  verification) attempt, and both the methodology attempt identity and the
  execution attempt identity are separately observable on the run record and/or
  events.
- **E4** - public regression. Verifies R6, R7; I2; N3. Coverage mode: executable
  public regression; materialized by implementation (brief scope 4; AC06, AC07,
  AC20). Expected observable outcome: two concurrent or repeated start requests
  for the same active workflow slot cause at most one child/provider execution;
  the duplicate request either returns/identifies the existing active run or
  fails with an explicit conflict; the check and allocation are concurrency-safe
  within one Harness host, including when multiple clients or orchestrator turns
  make the same request.
- **E5** - public regression. Verifies R8, R9; I3; N4. Coverage mode: executable
  public regression; materialized by implementation (brief scope 5; AC08, AC09,
  AC20). Expected observable outcome: a replacement execution cannot be
  allocated for a slot while its prior canonical execution is still active;
  allocating a replacement first gives the prior execution an explicit terminal
  disposition and records the prior execution identity, the new execution
  identity, the reason for replacement, and any executor change (for example
  `role: as-built`, `executor: codex`, `mode: fallback`,
  `reason: delegated executor failed`).
- **E6** - public regression. Verifies R10; I6, I7; N1. Coverage mode:
  executable public regression; materialized by implementation (brief scope 6,
  1A; AC10). Expected observable outcome: the canonical `tools/workflow.ts`
  execution path (or its Design-Map-approved successor) requests or attaches to
  a run owned by the existing Harness host-owned run mechanism rather than
  spawning or detaching a worker itself or routing through a methodology-only
  process supervisor; when the configured host URL has no reachable host, the
  dispatch is an explicit failure and no client-owned worker is created.
- **E7** - public regression. Verifies R11, R19; I7; N7. Coverage mode:
  executable public regression; materialized by implementation (brief scope 6;
  AC11, AC19, AC20). Expected observable outcome: the workflow runner cannot
  record a phase complete unless the canonical run allocated for that
  phase/attempt has a terminal `completed` disposition; a Codex/Claude process
  launched directly outside the Harness run mechanism has no usable canonical
  run identity for the slot and cannot satisfy the runner's completion
  requirement, even when it writes plausible artifacts.
- **E8** - public regression. Verifies R12; I5. Coverage mode: executable public
  regression; materialized by implementation (brief scope 7; AC12, AC20).
  Expected observable outcome: Harness exposes structured run lifecycle events
  that distinguish equivalents of allocated, started/running, activity/output
  observed, terminal completion, terminal failure, cancellation, and
  replacement, sufficient to supervise the owned execution without treating raw
  terminal text as workflow state; provider-specific events may be retained
  alongside the normalized lifecycle.
- **E9** - public regression. Verifies R13; I5; N6. Coverage mode: executable
  public regression; materialized by implementation (brief scope 8; AC13,
  AC20). Expected observable outcome: the run's stdout/stderr or provider
  text/event detail is retained, associated with the run, and remains
  inspectable for debugging/supervision, but is not turned into a frozen
  methodology artifact, is not automatically handed to a downstream role as
  context, and does not by itself drive workflow completion.
- **E10** - public regression. Verifies R14, R15, R16, R17; I6; N5. Coverage
  mode: executable public regression; materialized by implementation (brief
  scope 9, 10; AC14-AC17). Expected observable outcome: a standard
  repository-local worker profile permits, within its allowed workspace(s),
  repository reads, role-authorized file creation/editing, arbitrary local
  computation including shell child processes, test/build/typecheck/lint/format
  commands, normal Git inspection, and role-permitted Git staging/commit,
  without per-command human prompts; an evaluator run may additionally declare a
  private evaluator workspace without gaining arbitrary unrestricted host
  access; the applied permission profile is recorded on the run; and no routine
  path requires an unrestricted permission/sandbox bypass mode.
- **E11** - public regression. Verifies R18; I1. Coverage mode: executable
  public regression; materialized by implementation (brief scope 11; AC18).
  Expected observable outcome: the run records allocated/start/end timestamps,
  elapsed run time, executor/provider, the number of execution
  attempts/replacements for the slot, and the terminal disposition, all from
  directly observable facts; provider-native token/usage/cost statistics may be
  recorded when directly available but are never manually estimated and never
  block.
- **E12** - public regression. Verifies R20; I6. Coverage mode: executable
  public regression; materialized by implementation (brief scope 1A; AC20).
  Expected observable outcome: the E1, E4, E5, E7, E8, and E9 behaviours are
  exercised by the repository's visible test suite through an in-memory or
  otherwise substituted workflow backend supplied through the host's workflow
  backend/factory seam, with no live paid Codex/Claude provider call in the
  suite.
- **S1** - static inspection of the Harness runtime under `src/` and the
  implementation's workflow-run module at the evaluated commit. Verifies R1,
  R10; I1, I4; N1. Coverage mode: static inspection. No hidden test: the file
  layout, class names, and route/field spellings are Design Map implementation
  freedom. Evidence plan: confirm the workflow-run registry and its lifecycle
  are created and owned by the existing Harness host (`startHarnessHost` or its
  Design-Map-approved evolution) rather than by a new long-lived
  methodology/workflow daemon, a second service process, or a parallel control
  plane; and that any shared lower-level execution/run abstraction is integrated
  into the existing host lifecycle.
- **S2** - static inspection of the default local workflow backend / permission
  profile definition at the evaluated commit. Verifies R15, R16, R17; I6; N5.
  Coverage mode: static inspection. Evidence plan: confirm the default local
  workflow backend invokes supported executors with an explicitly named,
  workspace-bounded permission profile (a provider-native bounded
  sandbox/permission mode or another bounded local mechanism) and not Codex
  `--dangerously-bypass-approvals-and-sandbox`, Claude `bypassPermissions`, or
  an equivalent unrestricted-host mode; that the evaluator profile differs only
  by adding a declared private evaluator workspace; that any narrow bootstrap
  exception for a specific provider limitation is explicit in the Design Map and
  the execution record rather than the default; and that the applied profile is
  recorded on the run record.
- **S3** - static inspection of `tools/workflow.ts` (or its Design-Map-approved
  successor) and the session/run domain types at the evaluated commit. Verifies
  R10, R19; I4, I7; N1, N7. Coverage mode: static inspection. Evidence plan:
  confirm `tools/workflow.ts` no longer directly owns detached child-process
  execution for canonical workflow runs (no direct `spawn`/`detached` of the
  executor for a canonical run) and instead requests/attaches to a
  host-owned run over the supported interface; and that an interactive user
  session and a workflow role execution are represented as distinct domain
  records rather than one collapsed object.
- **S4** - static inspection of the workflow event and diagnostic-log handling
  at the evaluated commit. Verifies R12, R13; I5; N6. Coverage mode: static
  inspection. Evidence plan: confirm the normalized workflow lifecycle events
  reuse the existing Harness structured-event/domain protocol (the same event
  envelope/stream family used for session events) rather than a second
  unrelated event system; and that raw executor output is retained as per-run
  diagnostic data that is not written into a frozen methodology artifact, not
  copied into a downstream role's context, and not used as a completion signal.
- **P1** - provenance inspection. Verifies R20, R21. Coverage mode: provenance
  inspection. Evidence plan: at the evaluated commit run `npm test`,
  `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check`; require each to exit 0; require the pre-existing
  session/backend suites (`session-lifecycle`, `session-backend`,
  `session-events`, `codex-backend`) to remain green.
- **P2** - provenance inspection. Verifies N8. Coverage mode: provenance
  inspection. Evidence plan: at the evaluated commit, require the public
  artifacts and promoted `evaluation/**` of Spikes 008, 009, 010, 010a, 010b,
  and 010c, and their `workflow.jsonl` timelines, to be byte-for-byte identical
  to their pre-Spike-011 state (`git diff <pre-011-base>..<evaluated-commit> --
  spikes/008-* spikes/009-* spikes/010-* spikes/010a-* spikes/010b-*
  spikes/010c-*` shows no change); require no new verification result,
  rejection, or lineage event on any of those timelines.

## Coverage Matrix

| Requirement | Cases              | Mode                     |
| ----------- | ------------------ | ------------------------ |
| R1          | E1, S1             | executable + static      |
| R2          | E1                 | executable               |
| R3          | E1                 | executable               |
| R4          | E2                 | executable               |
| R5          | E3                 | executable               |
| R6          | E4                 | executable               |
| R7          | E4                 | executable               |
| R8          | E5                 | executable               |
| R9          | E5                 | executable               |
| R10         | E6, S1, S3         | executable + static      |
| R11         | E7                 | executable               |
| R12         | E8, S4             | executable + static      |
| R13         | E9, S4             | executable + static      |
| R14         | E10                | executable               |
| R15         | E10, S2            | executable + static      |
| R16         | E10, S2            | executable + static      |
| R17         | E2, E10, S2        | executable + static      |
| R18         | E11                | executable               |
| R19         | E7, S3             | executable + static      |
| R20         | E1, E4, E5, E7, E8, E9, E12, P1 | executable + provenance |
| R21         | P1                 | provenance               |

Every mandatory invariant and negative requirement is covered transitively:
I1 (E1, E11, S1), I2 (E4), I3 (E5), I4 (E1, E2, E3, S1, S3), I5 (E8, E9, S4),
I6 (E6, E10, E12, S1, S2), I7 (E6, E7, S3);
N1 (E6, S1, S3), N2 (E1), N3 (E4), N4 (E5), N5 (E10, S2), N6 (E9, S4),
N7 (E7, S3), N8 (P2), N9 (evaluator v10 post-implementation-repair contract,
enforced at `verify`).

Nothing in this suite is evaluated by a frozen executable hidden test authored
by the evaluator. Executable coverage is the implementation's own visible
regression suite, exercised through `npm test` (mandated by AC20). This mapping
agrees with `.hidden-test/manifest.json` and `case-manifest.json`.

Anything that cannot be evaluated automatically: S1-S4 are read by a human/agent
inspector against a concrete decision rule; P1 and P2 are command-exit and
`git` provenance checks.

## Out of Scope

- Whether any individual visible test is intellectually persuasive or a
  criterion is well phrased.
- The remaining Spike 010c evaluator-integrity implementation gaps (brief
  non-goals; explicitly deferred).
- Any wholesale rewrite of `GOALS.md`, a deterministic methodology phase
  scheduler, Harness-owned decision of the next phase, agent-neutral skill
  rewrite, methodology installation/package system, a complete permission
  broker or human approval UI, full Claude structured-hooks/native-backend
  integration, identical Codex/Claude event vocabularies,
  provider-independent token/cost accounting, daemon-restart workflow
  persistence, worktree automation, hostile same-user security/isolation proof,
  remote/mobile workflow UI, a generic distributed job scheduler, and automatic
  feeding of executor transcripts into later roles (brief "Non-goals").
- Daemon-restart persistence of run records (brief scope 1; Design Map
  invariant 2).
- Human product acceptance, which is a separate later gate.

## Limitations

- E1-E12 are visible-regression obligations. Preparation confirms the seam
  exists and is currently unmet (no host-owned workflow-run registry, HTTP
  surface, normalized workflow events, or backend/factory seam at `52dc78e`, and
  `tools/workflow.ts` still `spawn`s detached child processes) but cannot
  exercise the not-yet-written scenarios; `verify` runs them against the frozen
  implementation.
- S1-S4 assert the presence and binding force of architectural properties, not
  that a particular file layout or naming is optimal. Their targets' exact
  repository locations are Design Map implementation freedom; the inspection
  questions and decision rules are concrete regardless of location.
- The Design Map leaves route names, JSON field spellings, UUID format, internal
  registry/backend classes, log storage representation, and whether a duplicate
  allocation returns `200` or a conflict as implementation freedom; the
  evaluation asserts observable behaviour and structured event information, not
  a specific surface.
- `tools/evaluator-integrity.ts` validates a supplied bundle description, not
  the physical bundle (Spike 010c `IMPLEMENTATION_GAP`); the supplementary
  pre-freeze checklist performs the physical-existence and hash-recomputation
  checks for this revision.

## Revision History

- Revision `001` - initial frozen revision. Prepared under evaluator v10 with no
  process exception for evaluator preparation. No prior revision.
