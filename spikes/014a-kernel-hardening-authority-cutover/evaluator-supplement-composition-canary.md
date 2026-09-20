# Evaluator supplement — disposable full-workflow composition canary

Status: **human-requested supplementary evaluation evidence**

This document does **not** revise the frozen Spike 014a brief, Design Map, or
acceptance criteria. The frozen authorities remain authoritative.

Its purpose is to ask the evaluator for one additional product-composition proof
before human acceptance, because Spike 014 demonstrated that strong kernel and
real-process fixture coverage can still miss a failure in the assembled Harness
methodology.

If this supplement conflicts with frozen authority, the frozen authority wins and
the evaluator should report the conflict rather than reinterpret the contract.

## Why this proof is useful

Spike 014's evaluator genuinely exercised real host, HTTP, process, publication,
and human-wait boundaries. However, its spawned/attached execution proofs used a
purpose-built governed fixture role/executor.

That proved the generic kernel boundary, but not necessarily that the actual
configured Harness product could compose:

- the real Harness methodology;
- the real role contracts;
- the real role skills;
- the real provider/executor adapters;
- role-derived canonical transitions;
- promotion;
- As-Built;
- and the human-decision path.

The 014a bootstrap failures around Brief Readiness provide concrete evidence that
this distinction matters.

## Requested supplementary proof

Against the exact Spike 014a candidate under evaluation, create a fresh,
disposable project outside the Harness repository working tree and run one tiny
workflow through the actual assembled Harness product.

The task should be intentionally trivial so task intelligence and repository size
are not meaningful sources of difficulty.

A suitable task is:

> Implement a program or command that emits the exact integer value of `5^32`
> and add a deterministic test for it.

Expected exact value:

`23283064365386962890625`

An equally trivial deterministic task is acceptable if the evaluator has a
practical reason to use one.

## Canary project constraints

Keep the project deliberately small. It should contain only the minimum needed
for the configured Harness workflow, for example:

- minimal project instructions;
- minimal source/test scaffolding;
- one tiny spike brief;
- no copied Harness history or accumulated Harness documentation.

The canary must be isolated from the Harness repository working tree so ordinary
role execution does not ingest Harness's large development history merely to
perform the trivial task.

## Composition that should be exercised

Use the actual candidate's supported product path wherever applicable:

- configured Harness methodology definition;
- active role contracts;
- active role skills;
- governed host and authority path;
- supported real provider/executor adapters rather than
  `tools/fixtures/governed-executor.ts` or an equivalent purpose-built semantic
  fixture;
- semantic Role Results;
- role-derived canonical transitions;
- configured promotion path;
- As-Built;
- bounded evaluator-controlled human decision for the disposable project only;
- terminal continuation / Outcome where supported by the candidate.

Synthetic kernel fixtures remain valuable evidence. They should not be treated as
a substitute for this supplementary composition proof.

## Evidence to preserve

Preserve enough bounded evidence to identify:

- disposable project identity/location;
- candidate identity;
- methodology definition;
- each governed Role Grant and execution;
- semantic Role Results;
- canonical transitions;
- promotion result;
- As-Built result;
- bounded human decision;
- terminal workflow state;
- the independent deterministic product test/output.

Where usage/context metrics are reliably available, preserve them as observations
for the later runtime-context optimization work. Do not estimate or invent
metrics the runtime does not expose.

## Interpretation

Report the canary separately from the frozen acceptance-criterion accounting.

A successful canary is additional evidence that the assembled product works, not
a replacement for the frozen evaluator.

A failed or blocked canary must be reported prominently with the exact failing
boundary. Do not silently downgrade it to a fixture-only success. Unless the
failure independently violates a frozen acceptance criterion, classify it as
supplementary evidence for the human acceptance decision rather than rewriting
the frozen evaluation contract.
