# Spike 008 — Local Workflow Runner

## Goal

Provide a small local command-line runner for the canonical Harness spike
workflow. It must make the workflow's phase ordering, agent ownership, and
handoff records executable without becoming a general workflow platform.

## Scope

Add a repository-local TypeScript CLI, exposed as `npm run workflow --`, that
operates on one `spikes/NNN-*/` directory at a time.

The runner must:

- define the canonical phases and their responsible agent: Codex for Brief
  Readiness, Design Map, implementation, As-Built, and Outcome; Claude for
  evaluator prepare and verify;
- create an append-only, public `.workflow/state.json` in the target spike
  which records initialization, dispatched phases, and explicitly recorded
  phase outcomes;
- reject an unknown phase, a non-spike path, a transition that skips a prior
  phase, and a duplicate terminal outcome for the same numbered phase attempt;
- model the implementation/evaluator retry loop as monotonically numbered
  attempts: a failed evaluator verify may open the next implementation attempt
  against the same frozen evaluation; evaluator prepare cannot be repeated by
  this runner;
- render a phase-specific prompt that names the target spike and the
  corresponding repository skill, without embedding evaluator-private paths or
  test mechanics;
- by default, print the selected executor command without starting it;
- start the installed Codex or Claude CLI only when `--execute` is supplied,
  as a detached local child rather than a child of the runner invocation;
- write each detached job's combined output to a public per-spike log and
  record its PID, command, log path, and launch time in state;
- invoke Codex using `codex exec --cd <repository-root>` and Claude using
  `claude -p --permission-mode manual`, each with the rendered prompt; and
- make no Git commit, push, branch, merge, evaluator-private read, hidden
  workspace creation, permission bypass, or automatic phase-success claim.

The runner's state is dispatch bookkeeping, not workflow authority. Frozen
artifact identities, manifests, Git provenance, evaluation results, and human
acceptance remain governed by their existing contracts.

## Commands

```text
npm run workflow -- init <spike>
npm run workflow -- status <spike>
npm run workflow -- dispatch <phase> <spike> [--execute]
npm run workflow -- record <phase> <spike> <complete|blocked|failed>
npm run workflow -- cancel <phase> <spike>
```

`init` creates the state file. `dispatch` requires the prior phase to have a
`complete` outcome, except for the first phase. It writes a dispatch record
before optionally launching the executor. `record` is a separate explicit
operation because a process exiting successfully does not prove the skill did
its job. `status` reports recorded job metadata and liveness without parsing
agent output; `cancel` sends a termination signal only to the recorded live job.
A failed evaluator verify opens the next implementation attempt;
otherwise no earlier phase can be reopened. `status` prints the current phase
records as JSON.

For this spike, the runner need not dispatch itself through the runner. The
normal workflow governs this spike; a process exception is not requested.

## Non-goals

- no daemon, service, persistence outside the target spike, scheduling,
  web UI, remote execution, task queue, concurrency, or provider
  abstraction;
- no parsing of Codex or Claude output, automated quality judgment, or agent
  session resumption;
- no evaluator implementation or modification of evaluator-private material;
- no replacement for `manifest.md`, skill contracts, Git provenance, or human
  acceptance; and
- no changes to Harness runtime behavior.

## Acceptance criteria

1. The four commands implement the stated validation and state semantics.
2. The default dispatch is demonstrably dry-run; `--execute` launches only the
   selected command with the stated safe flags.
3. Tests cover valid progression, the permitted retry transition,
   skipped/unknown/duplicate rejection, prompt ownership, and command
   construction, detached-job metadata, and cancellation without invoking real
   agents.
4. `npm test`, `npm run typecheck`, linting of changed files, Prettier, and
   `git diff --check` pass.
