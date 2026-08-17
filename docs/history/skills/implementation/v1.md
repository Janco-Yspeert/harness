---
name: implementation
description:
  Implement a frozen Harness spike from its spike brief and public evaluation
  requirements. Use when implementing a spike under spikes/NNN-*.
---

# Spike Implementation

Implement the requested Harness spike.

Use the spike path identified by the request. If no single target spike can be
identified, stop and ask for the path.

The spike directory must contain:

- `spike.md`
- `eval-requirements.md`

Read both before changing code.

If either document is missing or unreadable, stop and report the problem.

Also obey the repository `AGENTS.md` and any relevant project documentation it
directs you to.

## Branch and provenance

Perform implementation on a focused feature branch, never directly on `main`.

Before changing files:

1. inspect the current branch and working tree;
2. if currently on `main`, create and switch to a focused feature branch;
3. identify and preserve pre-existing or unrelated working-tree changes.

Do not discard, overwrite, stage, or commit unrelated user changes. If existing
changes overlap the spike and prevent a trustworthy isolated implementation
commit, stop and report the conflict.

## Authority

`spike.md` defines the spike's intended behaviour, scope, constraints, and
non-goals.

`eval-requirements.md` contains additional public requirements needed for fair
independent evaluation.

Treat both as implementation inputs.

The public contract consists of the frozen `spike.md`, the public
`eval-requirements.md`, and applicable established project contracts.
Established project contracts include the repository `AGENTS.md`, `GOALS.md`,
and relevant project documentation they direct you to.

`eval-requirements.md` supplements the spike brief but does not silently
override it.

If any parts of the public contract conflict, stop implementation and report the
conflict unless the spike explicitly authorizes changing the established
contract.

Also stop when the public contract leaves a product, scope, or externally
observable behaviour decision unresolved. Make ordinary implementation and
architectural choices yourself when they preserve the public contract.

## Restricted evaluator material

Do not read, search, inspect, summarize, or use evaluator-private artifacts.

This includes all paths restricted by `AGENTS.md`, including private evaluation
specifications and hidden tests.

The implementation must be based only on information available to the
implementation role.

## Implementation

Implement the smallest coherent solution that satisfies:

- the spike brief;
- the public evaluation requirements;
- established project contracts.

Do not expand the spike scope.

Do not implement explicit non-goals.

Do not introduce abstractions, dependencies, infrastructure, or framework
changes unless they are required by the spike or clearly justified by the
existing project architecture.

Prefer extending existing structures over creating speculative future
architecture.

## Tests

Create and maintain visible tests for the behaviour being implemented.

Tests should verify the public contract rather than merely mirror the
implementation.

Where practical, include relevant:

- success cases;
- boundary cases;
- failure cases;
- lifecycle behaviour;
- isolation behaviour;
- regression coverage.

Do not attempt to predict or reconstruct hidden evaluator tests.

## Verification

Before declaring implementation complete:

1. Run the relevant visible tests.
2. Run the project's required type checking, linting, static analysis, and build
   checks.
3. Run the broader existing test suite where practical.
4. Inspect the final diff for unrelated changes.
5. Confirm that no explicit spike non-goal was implemented.

Fix failures caused by or relevant to the implementation before completion. If a
visible test or required check has an unrelated pre-existing failure, do not
broaden the spike to fix it; report the failure and the evidence that it is
unrelated.

## Implementation commit

After verification succeeds, create a focused implementation commit on the
feature branch before declaring the implementation complete.

The commit must contain the exact revision intended for independent evaluation,
including:

- implementation changes;
- visible tests added or changed for the spike; and
- the frozen `spike.md` and `eval-requirements.md` when they are not already
  committed unchanged in the branch history.

Do not include evaluator-private artifacts, promoted evaluation artifacts,
outcomes, or unrelated working-tree changes in the implementation commit.

Before committing:

1. stage the intended paths explicitly;
2. inspect the staged path list and staged diff;
3. confirm the staged content contains no unrelated changes or restricted
   evaluator material;
4. create a focused commit message identifying the spike implementation.

After committing:

1. resolve the full commit hash;
2. verify that the commit contains every intended implementation and visible-
   test change;
3. verify that no implementation change remains uncommitted relative to that
   commit;
4. leave unrelated pre-existing working-tree changes untouched.

The implementation commit is the immutable revision the evaluator must use. Do
not hand off an implementation represented partly by a commit and partly by
working-tree changes. Pushing is not required unless the user requests it.

## Completion report

Report:

- feature branch name;
- evaluated implementation commit hash;
- what was implemented;
- important implementation decisions;
- visible tests added or changed;
- verification commands run and their results;
- relevant checks skipped as impractical, and why;
- any assumptions made;
- any known limitations relevant to the spike.

Do not claim that the spike has passed independent evaluation.

Successful implementation means only that it is ready for the evaluator's
`verify` phase.

Do not report readiness for evaluation unless the focused implementation commit
has been created and the intended implementation matches that commit.
