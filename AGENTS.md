# Harness — Project Instructions

Harness is an Ubuntu-hosted control plane for supervising multiple AI coding
agents. Read `GOALS.md` for authoritative product direction, architectural
preferences, current non-goals, and open questions.

This file contains the rules that apply broadly to engineering work in this
repository. Task-specific workflows belong in the relevant skill or spike
contract, not here.

## Scope and design

- Implement only the requested slice. Do not silently broaden the task or build
  anticipated follow-on features.
- Prefer the smallest design that preserves the required behaviour and leaves a
  reasonable path to evolve.
- Do not introduce speculative abstractions, dependencies, frameworks,
  infrastructure, or persistence.
- Preserve established behaviour and public contracts unless the task
  explicitly changes them.
- Inspect the surrounding implementation, tests, conventions, and public API
  before making meaningful changes.
- Fix root causes. Avoid unrelated refactoring, renaming, or reorganization.
- Report important out-of-scope problems separately instead of quietly folding
  them into the change.
- Treat explicit non-goals as requirements.

If applicable project contracts conflict, or leave a product, scope, or
externally observable behaviour decision unresolved, stop and report the issue.
Make ordinary implementation and architectural choices yourself when they
preserve those contracts.

## Architectural invariants

- Ubuntu is the host platform. Do not add cross-platform host abstractions
  unless explicitly requested; use Linux facilities where they materially
  simplify the implementation.
- Harness supervises multiple agents and sessions. Do not introduce assumptions
  that only one agent, provider, project, workspace, or session can exist unless
  a spike explicitly limits its proof-of-concept scope.
- Session lifecycle, underlying process or provider lifecycle, and client
  connection lifecycle are separate concerns. A client disconnect must not
  implicitly terminate agent work.
- Keep the Harness domain protocol independent of its transport.
- Keep provider-specific behaviour out of the core session model where
  practical, but do not build a universal agent framework before supported
  integrations require one.
- Prefer structured provider APIs and events when available. PTY integration is
  a fallback; do not parse terminal output semantically unless required by the
  current task.
- Keep Harness messages structurally compatible with the Conduit message model
  where that fits naturally, but do not add Conduit or force its semantics
  without a current requirement.

These are constraints, not an invitation to implement the architecture
described in `GOALS.md` ahead of need.

## Security

Treat Harness as a remote code-execution control surface.

- Do not expose the daemon publicly or bind it to arbitrary network interfaces
  by default.
- Do not weaken authentication or authorization mechanisms once introduced.
- Do not log secrets, credentials, tokens, or sensitive environment values.
- Do not permit broader command execution than the requested feature requires.
- Keep deliberate early-development security limitations localhost-only where
  practical and identify them clearly as development-only.

## Dependencies

- Prefer standard platform capabilities and small, focused dependencies.
- Every new dependency must solve a concrete current problem.
- Do not add a framework, event bus, database, message broker, plugin framework,
  dependency-injection system, or persistence layer without a current
  requirement.

## Testing and verification

- Test behavioural boundaries rather than implementation details.
- Pay particular attention where relevant to lifecycle, attach/detach and
  disconnect behaviour, concurrency, isolation, message validation, failure
  propagation, and resource cleanup.
- Do not mock away the behaviour a test is intended to prove. Use integration
  tests when process or PTY behaviour cannot be validated meaningfully in
  isolation.
- Run relevant visible tests and required lint, type, static-analysis, and build
  checks before declaring work complete.
- Run the broader test suite where practical.
- Fix failures caused by or relevant to the change. Report unrelated
  pre-existing failures with evidence rather than expanding scope to repair
  them.
- Review the final diff for unrelated changes.
- Do not claim verification you did not actually perform.

## Development workflow

### Autonomous orchestration

A phase boundary is not a human gate. Before returning control, determine
whether a valid next workflow action can be performed without human authority.
If it can, perform it. Progress reports are observational and do not transfer
control. Do not describe an action as running after returning control unless
runtime state exposes a real asynchronous execution.

Yield only for an explicit human gate, a material decision reserved to a human,
information that cannot be obtained autonomously, a genuine unrecoverable
block, or a terminal workflow state. Evaluator defects, implementation defects,
attempt allocation, ordinary phase completion, and BLOCKED results with a
prescribed recovery all continue autonomously.

When an evaluator is corrected after implementation exposure, every material
change must cite frozen pre-implementation authority, preserve the prior
revision, and confirm that no implementation-specific behavior became an
acceptance requirement. An implementation failure fixes implementation; a
missing frozen requirement starts a new brief cycle rather than rewriting the
evaluator. After two post-implementation evaluator corrections in one cycle,
explicitly classify the next issue as evaluator defect, specification defect,
or methodology/evidence-model defect before another correction. Do not revise
the evaluator indefinitely.

Ordinary implementation spikes use this order:

1. draft the brief;
2. run Brief Readiness;
3. resolve findings and freeze the brief;
4. create and freeze the Design Map;
5. run evaluator `prepare` and freeze evaluation;
6. implement;
7. run evaluator `verify`, retrying implementation when required;
8. create As-Built; and
9. create Outcome.

Brief Readiness is the first code-facing workflow. It runs before freeze, Design
Map, evaluation, or implementation. A process exception must be declared in the
frozen brief before implementation and must define substitute evidence; it is
never a retroactive escape from failed evaluation.

### Freeze and provenance

A frozen artifact is identified by a deterministic content identity. Exact
public frozen content must also have committed Git provenance before downstream
work relies on it. Private evaluator artifacts remain outside this repository
and use private content identities and freeze metadata.

Material changes create a new frozen revision and invalidate dependent work.
Implementation failure never permits the evaluator contract to move. Evaluator
defects may create a corrected revision only when the prior revision and attempt
provenance are preserved.

Use `feat/spike-NNN` as the normal spike branch. Commit and push stable public
handoff boundaries. Never include evaluator-private material merely to satisfy
the public branch convention.

### Workflow evidence

Spikes using the revised workflow maintain an append-only `manifest.md` that
records material runs, skill versions, input/output identities, results, and
reliably available execution statistics. Capture a lightweight start baseline
only when needed to measure a real value; do not append a provisional entry just
to mark that work began. After substantive work and verification, make the
manifest update the run's final repository-content change. Its measurement
cutoff is immediately before that update, so the entry does not measure itself
or later commit, push, or response activity.

Record only runtime-provided or cheaply and directly measured values. Do not
manually estimate tokens, context, calls, or duration, and omit unavailable
metrics instead of adding ceremonial `unknown` fields. Statistics available
only after the response may be appended later by a runtime or orchestrator when
clearly marked retrospective. If a failed or interrupted run retains control,
record it under the same rule. The manifest is authoritative for execution
history and skill provenance, not freeze state.

Public entries must not leak evaluator-private mechanics. Evaluators write any
richer execution detail to the private evaluator workspace before appending
only safe aggregates to the public manifest. Private detail may become public
only through promotion after a successful evaluator result.

When Brief Readiness blocks freeze, preserve the exact reviewed draft and its
matching findings under the next `preliminary/NNN/` directory before revising
the live brief. Preliminary snapshots are immutable. Passing briefs remain live
at the spike root.

Active skills use monotonically increasing integer contract versions. Increment
the version for material responsibility, input, output, permission, lifecycle,
safety, or procedure changes; editorial corrections do not require a bump.
Preserve replaced contracts outside active skill-discovery paths.

Evaluation preserves an immutable private result for every attempt. After a
`PASS`, evaluator-owned promotion completes before the later human acceptance
gate. Promotion preserves eligible artifacts from the exact final evaluator
revision, every eligible superseded revision from the cycle, and the complete
attempt/result history with implementation/evaluator provenance. An unchanged
evaluator suite is stored once and referenced by multiple attempts. Promotion
never rebuilds, cleans up, or selectively omits failed attempts to manufacture a
tidier history.

## Git workflow

Treat `main` as protected even when the hosting plan cannot enforce it.

- Do not commit or push changes directly to `main`.
- Use a focused feature branch and merge through a pull request.
- Use squash merge only. Do not create merge commits or rebase-merge pull
  requests.
- Do not bypass this workflow unless the user explicitly requests an exception.

## Restricted evaluator material

The following paths contain active evaluator-private material:

- `**/eval-spec.md`
- `**/.hidden-test/**`
- `**/.eval/**`

Implementation, review, and planning agents must not read, search, inspect,
summarize, or use these paths unless the active skill explicitly grants
evaluator access.

Evaluator skills may access them only as required by their workflow.

Exception: artifacts promoted after successful verification under
`spikes/NNN-*/evaluation/**` are public historical records. They may be read by
any role and are not evaluator-private, even when a promoted file is named
`eval-spec.md`.

The repository-owned structural template at
`skills/evaluator/templates/eval-spec.md` is also public and may be read by any
role. This exception applies only to the template, not to an evaluation
specification created from it.

### Outcome synthesis exception

When the active `outcome` skill is producing the historical record for a
completed spike, it may read normally restricted evaluation artifacts that
have been promoted into that target spike's directory.

This authority is read-only and applies only to the target completed spike.

The outcome skill:

- may read promoted evaluation specifications, results, hidden tests, manifests,
  and archived evaluation attempts for the target spike;
- may read `outcome.md` from other completed spikes as read-only historical
  context;
- must not inspect other spikes' implementation, evaluation artifacts, hidden
  tests, or private evaluator workspaces unless explicitly instructed;
- must not modify historical artifacts;
- may write only the target spike's `outcome.md` unless explicitly instructed
  otherwise.
  
## Completion

Report concisely:

- what changed;
- verification performed and its results;
- relevant checks skipped and why;
- known limitations, assumptions, or unresolved risks.
