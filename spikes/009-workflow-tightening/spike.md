# Spike 009 — Workflow Runner Recovery and Executor Neutrality

## Goal

Harden the local Harness workflow runner based on lessons discovered while
reviewing and dogfooding Spike 008.

The runner must correctly represent canonical evaluator recovery paths, remain
neutral about which installed agent performs a workflow role, and recover safely
from executor launch failure without becoming a general orchestration system.

## Context

Spike 008 established a small local executable state machine for the Harness
development workflow.

Review of the completed Spike 008 history exposed an important mismatch between
the runner and the workflow it is intended to represent:

- evaluator verification attempt `001` was blocked by an evaluator defect;
- the evaluator was corrected from revision `001` to revision `002`;
- the implementation remained unchanged; and
- evaluator verification attempt `002` then passed against that same
  implementation.

The current runner cannot represent this path because evaluator verification
attempt numbering is coupled to implementation attempt numbering.

Spike 008 also fixes Codex and Claude as canonical phase owners, although the
methodology requires role/context separation rather than permanent vendor
ownership.

This spike corrects those issues without expanding the runner into a scheduler,
agent supervisor, workflow daemon, or workflow authority.

## Scope

Update the repository-local workflow runner introduced by Spike 008.

### 1. Independent verification attempts

Implementation attempts and evaluator verification attempts must be independently
numbered.

A verification attempt must reference the implementation attempt it evaluates
rather than inheriting its attempt number.

The runner must support at least these canonical paths:

```text
implementation 1 COMPLETE
evaluator verify 1 FAILED
implementation 2 COMPLETE
evaluator verify 2 ...
```

and:

```text
implementation 1 COMPLETE
evaluator verify 1 BLOCKED
evaluator corrected outside the runner
evaluator verify 2 ...
```

where evaluator verify attempt `2` may evaluate the unchanged implementation
attempt `1`.

A failed evaluator verification may open a new implementation attempt only when
the recorded workflow outcome represents an implementation failure path.

A blocked verification must not automatically require implementation retry.

The runner need not inspect evaluator-private evidence or determine why a
verification was blocked. The human/operator remains responsible for recording
the appropriate next action.

### 2. Executor neutrality

The canonical workflow model must define workflow roles and skills independently
of agent vendor.

The runner may retain Codex and Claude as current default executors, but must not
describe phases as intrinsically "Codex-owned" or "Claude-owned".

At minimum distinguish:

- public workflow work:
  - Brief Readiness
  - Design Map
  - implementation
  - As-Built
  - Outcome
- independent evaluator work:
  - evaluator prepare
  - evaluator verify

The implementation must provide a small explicit mechanism for selecting the
executor for each role without introducing a provider framework.

Reasonable mechanisms include repository-local configuration, environment
variables, or narrow command-line options.

The exact mechanism remains an implementation decision, provided:

- existing Codex/Claude defaults remain practical;
- phase → skill mapping remains fixed;
- phase → vendor executable mapping is not part of the canonical methodology;
- evaluator and implementation roles can be assigned to different executors;
- no general provider abstraction is introduced.

### 3. Recoverable executor launch failure

A failed local executor launch must not permanently consume a phase attempt.

If `dispatch --execute` cannot successfully launch the selected executable, the
runner must leave the workflow in a state from which that same phase attempt can
be dispatched again after the local problem is corrected.

Historical records of the failed launch may be retained.

The runner must not silently treat launch failure as phase completion, workflow
failure, or implementation failure.

No output parsing or automatic result classification is required.

### 4. Local workflow data permissions

`.workflow/` may contain coding-agent stdout/stderr and must be treated as
potentially sensitive local operational state.

On supported Ubuntu/POSIX filesystems:

- the `.workflow/` directory must not be created with permissions broader than
  owner-only access;
- newly created workflow state and log files must not be created with
  permissions broader than owner read/write access.

The runner need not implement encryption, secret detection, credential
redaction, or a credential-management system.

`.workflow/` remains Git-ignored and remains operational state rather than
workflow evidence.

### 5. Tooling boundary

The workflow runner is repository-development tooling, not Harness runtime
product behavior.

Move it from the product `src/` namespace to an appropriate repository tooling
location such as `tools/` or `scripts/`, while preserving:

```text
npm run workflow -- ...
```

as the public invocation.

No Harness daemon/runtime behavior may depend on the workflow runner.

## Workflow semantics

Preserve the canonical high-level ordering:

```text
Brief Readiness
→ Design Map
→ evaluator prepare
→ implementation
→ evaluator verify
→ As-Built
→ Outcome
```

Retries and corrections form explicit branches around this sequence rather than
changing the frozen historical record.

The runner remains bookkeeping only.

It does not establish:

- brief freeze;
- Design Map freeze;
- evaluator revision identity;
- implementation Git provenance;
- evaluation classification;
- evaluation PASS;
- promotion;
- human acceptance;
- As-Built correctness; or
- Outcome correctness.

Those remain governed by their existing workflow contracts and artifacts.

## Non-goals

- no daemon or background workflow service;
- no scheduling or task queue;
- no remote execution;
- no concurrency orchestration;
- no automatic phase chaining;
- no parsing or semantic interpretation of agent output;
- no automatic detection of evaluator failure classification;
- no automatic evaluator revision management;
- no evaluator-private workspace access;
- no automatic Git commit, branch, push, merge, or pull request operations;
- no automatic manifest generation;
- no provider/plugin framework;
- no agent-session resumption;
- no changes to Harness runtime/product behavior; and
- no rewriting or normalization of Spike 008 historical artifacts.

## Acceptance Criteria

1. Evaluator verification attempts are independently numbered from
   implementation attempts.

2. Tests demonstrate both:
   - implementation failure → new implementation attempt → new verification;
   - evaluator-blocked verification → corrected evaluator outside the runner →
     new verification against the unchanged implementation attempt.

3. Workflow roles are independent of agent vendor. Codex and Claude may remain
   defaults, but switching the executor used for public work and evaluator work
   does not require changing canonical phase definitions.

4. A failed `dispatch --execute` caused by an unavailable or unlaunchable
   executable does not prevent retrying the same phase attempt.

5. `.workflow/`, newly created state files, and agent-output logs use
   owner-restricted permissions on the supported Ubuntu/POSIX host.

6. The workflow runner lives outside the Harness runtime `src/` namespace while
   `npm run workflow --` remains the stable invocation.

7. Existing Spike 008 behavior not deliberately changed by this spike remains
   intact, including:
   - normalized spike-path validation;
   - explicit `record` outcomes;
   - dry-run dispatch by default;
   - detached execution;
   - local combined-output logs;
   - status/liveness reporting;
   - cancellation;
   - Git-ignored local workflow state;
   - no evaluator-private access;
   - no Git operations; and
   - no automatic success claim.

8. Visible tests cover the new recovery paths and executor-selection behavior
   without invoking real coding agents.

9. `npm test`, `npm run typecheck`, lint, formatting checks, and
   `git diff --check` pass.

## Evidence expectations

Evaluation should focus on externally observable runner behavior and state
transitions.

Do not require internal state representation, helper names, configuration-file
shape, or process abstractions unless a stable public seam is required for fair
evaluation.

Where the frozen brief deliberately leaves an internal representation free, the
evaluator may record that no hidden structural test is justified rather than
inventing an implementation contract.

## Process

This is an ordinary Harness implementation spike and should run through:

1. Brief Readiness;
2. frozen brief;
3. Design Map;
4. evaluator prepare;
5. implementation;
6. evaluator verify;
7. As-Built; and
8. Outcome.

Spike 008 is historical evidence and must not be modified as part of this work.