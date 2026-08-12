# Spike 002 — AI-First Development Workflow

## Goal

Establish the first explicit, repository-owned AI-first development workflow for
Harness.

The workflow must separate spike design, implementation, independent evaluation,
and code review while keeping the contract visible to the implementation agent
and evaluator-private material inaccessible until a successful evaluation is
promoted.

The success condition is:

> A future Harness spike can move from a frozen brief through independent
> evaluation preparation, implementation, verification, promotion, and review
> using versioned repository instructions and reusable skills rather than
> reconstructing the process from conversation history.

This is a process and repository-structure spike. It does not add Harness
runtime behaviour.

Read and follow `AGENTS.md` and `GOALS.md` before making changes.

## Why This Spike Exists

Harness is being built through small spikes with AI agents performing different
engineering roles. Without an explicit workflow, important boundaries exist only
as conversational convention:

- an implementer may accidentally see hidden evaluation material;
- an evaluator may impose undisclosed requirements;
- evaluation may drift after seeing an implementation;
- task-specific instructions may bloat the always-loaded agent context;
- successful evaluation evidence may disappear with a temporary workspace.

This spike turns those conventions into a small, inspectable repository
contract.

## Public Contract

For a Harness implementation spike, the public implementation and evaluation
contract consists of:

- the frozen `spike.md`;
- the evaluator-produced `eval-requirements.md`;
- applicable established project contracts, including `AGENTS.md`, `GOALS.md`,
  and relevant project documentation they direct agents to.

`eval-requirements.md` may clarify testability, observable behaviour, and fair
evaluation requirements. It must not silently override the frozen brief or add
undisclosed product scope.

Conflicts or unresolved product, scope, and externally observable behaviour
decisions must be surfaced before implementation begins.

## Workflow

Document and support the following workflow:

1. A human and planning agent produce a spike brief.
2. The proposed brief receives an implementation-readiness review.
3. The human resolves material findings and freezes the brief.
4. An independent evaluator prepares public evaluation requirements and private
   evaluation artifacts from the frozen public contract.
5. An implementation agent implements the spike using only the public contract.
6. The evaluator verifies the implementation against the frozen private
   evaluation.
7. After successful verification, the exact evaluation artifacts used are
   promoted into the permanent spike record.
8. The verified implementation receives an independent code review.

The workflow is human-directed. Do not build orchestration software for these
steps.

## Agent Instructions

Refine `AGENTS.md` into concise, always-loaded repository instructions.

Keep rules there when they apply broadly to engineering work in the repository,
especially:

- incremental scope discipline;
- important architectural and lifecycle invariants;
- security boundaries;
- dependency and testing discipline;
- protected Git workflow;
- completion requirements;
- restrictions on evaluator-private artifacts.

Remove or condense product exposition that duplicates `GOALS.md`. Link to
`GOALS.md` as the authoritative product-direction document instead.

Do not move evaluator or implementation procedures into `AGENTS.md`. Detailed
role-specific workflows belong in reusable skills, and the human-facing process
overview belongs in `README.md`.

Shortening `AGENTS.md` is not a target measured by line count. The objective is
to reduce duplicated always-loaded context without weakening operational rules
or making agents chase references for instructions required on every task.

## Reusable Skills

Add canonical skills under `skills/` for these roles:

### Evaluator

The evaluator skill must support two explicit modes:

- `prepare`, which derives and freezes evaluation artifacts from the public
  contract before implementation;
- `verify`, which evaluates a completed implementation using those frozen
  artifacts.

The skill must distinguish public evaluation requirements from evaluator-private
specifications and tests. It must define promotion of successful evaluation
artifacts without rewriting them after verification.

### Implementation

The implementation skill must:

- identify one target spike;
- read its `spike.md` and `eval-requirements.md` before changing code;
- obey the complete public contract;
- refuse access to evaluator-private artifacts;
- implement only the requested slice;
- add visible contract-level tests;
- run and report relevant verification;
- report unrelated pre-existing failures without expanding scope to repair them;
- avoid claiming independent evaluation success.

Keep the canonical skill sources vendor-neutral where practical. Tool-specific
discovery paths may link to the canonical copies rather than duplicating them.

## Spike Artifact Structure

Use zero-padded three-digit spike identifiers and descriptive directory names:

```text
spikes/NNN-description/
```

Before implementation, the public spike directory contains:

```text
spikes/NNN-description/
├── spike.md
└── eval-requirements.md
```

Evaluator-private material must remain outside the implementation agent's
accessible repository context during implementation and verification. This
includes:

- `eval-spec.md`;
- hidden evaluation tests;
- temporary evaluator state and results not yet promoted.

After successful verification, promote the exact evaluated artifacts into:

```text
spikes/NNN-description/
├── spike.md
├── eval-requirements.md
└── evaluation/
    ├── eval-spec.md
    ├── eval-result.md
    └── hidden-tests/
```

The precise promoted hidden-test contents may include a manifest and supporting
files required to preserve what was executed.

Promotion makes previously private artifacts part of the permanent historical
record. It does not retroactively make them valid implementation inputs for the
evaluated change.

## Restricted Evaluator Material

Define repository-wide restrictions preventing implementation, planning, and
review agents from reading, searching, inspecting, summarizing, or using active
evaluator-private artifacts.

At minimum, reserve these path patterns:

```text
**/eval-spec.md
**/.hidden-test/**
**/.eval/**
```

An evaluator role may access them only when its active workflow explicitly
grants that access.

The restriction must explicitly exclude artifacts promoted after successful
verification under `spikes/NNN-*/evaluation/**`. Promoted artifacts are public
historical records even when they retain names such as `eval-spec.md`.

It must also exclude the repository-owned structural template at
`skills/evaluator/templates/eval-spec.md`. The template is public; evaluator
specifications created from it remain private until successful promotion.

## Documentation

Update `README.md` with a concise human-facing description of:

- the AI-first development workflow;
- the separation of planning, implementation, evaluation, and review;
- canonical skill locations and tool-specific discovery links;
- public versus evaluator-private artifacts;
- spike naming and artifact layout;
- promotion after successful verification.

Do not duplicate full skill procedures in the README.

## Deliverables

- A shortened, operationally complete `AGENTS.md` that delegates product detail
  to `GOALS.md` and role-specific procedure to skills.
- An evaluator skill under `skills/evaluator/`.
- An implementation skill under `skills/implementation/`.
- A documented AI-first development workflow in `README.md`.
- A documented spike naming and artifact convention.
- Repository instructions protecting evaluator-private artifacts.
- A defined promotion path for successful evaluation artifacts.
- Tool-specific skill discovery links where needed for current development.

## Verification

Verify this process spike by inspection and focused skill validation:

1. Confirm `AGENTS.md` retains the repository-wide rules needed on every task
   while avoiding substantial duplication of `GOALS.md`, `README.md`, and the
   skills.
2. Validate each skill with the validator appropriate to its target tool, where
   available.
3. Confirm the evaluator and implementation skills agree on public inputs,
   restricted artifacts, conflict handling, and the promotion boundary.
4. Confirm the documented artifact layouts and filenames agree across
   `README.md`, `AGENTS.md`, and both skills.
5. Confirm tool-specific discovery links resolve to the canonical skills.
6. Inspect the final diff for unrelated runtime changes.

This spike requires no Harness runtime test solely because documentation or
skill files changed. Existing project checks should still be run if any checked
source or configuration is modified.

## Done When

- A future spike has one unambiguous public contract available to both the
  implementation agent and evaluator.
- The evaluator can prepare an evaluation before implementation and later verify
  without changing the frozen contract in response to implementation details.
- The implementation agent can work without access to evaluator-private
  artifacts.
- Successful evaluation evidence has a defined, immutable promotion path into
  the repository.
- `AGENTS.md`, `README.md`, and the reusable skills have distinct
  responsibilities and do not substantially duplicate one another.
- The next implementation spike can use the workflow without redefining it.

## Explicitly Out of Scope

Do not:

- add or change Harness runtime functionality;
- build a general-purpose evaluation framework;
- build a custom test runner;
- automate workflow orchestration;
- add token, cost, or model-performance telemetry;
- add databases, services, or dependencies for this workflow;
- define a general multi-agent coordination system;
- redesign product goals or resolve open Harness architecture questions;
- require every AI tool to share an identical skill-discovery mechanism;
- treat hidden tests as a substitute for public requirements or visible tests.
