---
name: implementation
description:
  Implement a frozen Harness spike from its public contract and produce a
  focused, reproducible implementation revision.
---

# Spike Implementation

Contract version: 3

Answer one question: **does the frozen spike now exist in the repository?**

## Inputs

Require and read the frozen `spike.md`, frozen `design-map.md`, public
`eval-requirements.md`, repository instructions, and any public implementation
feedback from earlier confirmed failures. Verify their recorded content
identities and committed provenance before changing files.

An explicitly frozen process exception may omit named inputs. Do not infer an
exception after work begins.

Never read, search, inspect, summarize, or use evaluator-private material.

## Branch and scope

Work on `feat/spike-NNN`, never `main`. Inspect the working tree and preserve
unrelated changes. Stop only when overlapping changes make a trustworthy
implementation revision impossible.

Implement the smallest coherent solution satisfying the frozen public contract.
Do not broaden scope, implement non-goals, or introduce dependencies and
abstractions without a current concrete benefit. If public inputs conflict or
leave a product, scope, or externally observable decision unresolved, stop and
report it; make ordinary internal choices yourself.

## Verification

Add visible tests where behavior changes. Run relevant tests, required static
checks, and the broader suite where practical. Inspect the final diff for
unrelated changes and explicit non-goals. Report unrelated pre-existing failures
with evidence instead of quietly fixing them.

## Revision and retry

Create a focused implementation checkpoint containing the complete candidate and
its manifest entry. Stage intended paths explicitly, inspect the staged diff,
and exclude private evaluation, promoted evaluation, Outcomes, and unrelated
work. Push the commit before external verification when the branch is the
handoff surface.

On a confirmed implementation failure, consume only sanitized public feedback
and the same frozen contract. Produce a new implementation commit. Do not ask
the evaluator to rerun `prepare` and do not attempt to reconstruct hidden tests.

After implementation and visible verification, make each attempt's `manifest.md`
entry the final repository-content step. Record skill/version, inputs, output
content identity, status, and statistics reliably available through immediately
before that update. Capture a start baseline only for a directly measurable
value; do not create a provisional entry, estimate metrics, or measure the entry
itself. Preserve prior attempts. Then commit and push the checkpoint as required
for evaluator handoff.

## Completion

Report branch, commit hash, changes, decisions, visible tests, checks, skipped
checks, assumptions, and limitations. Do not claim independent evaluation has
passed. The committed revision, not uncommitted residue, is the evaluator's
input.

For authority-enabled spikes, record `implementation-handoff` after the pushed
candidate checkpoint; its commit and attempt are the canonical handoff.
