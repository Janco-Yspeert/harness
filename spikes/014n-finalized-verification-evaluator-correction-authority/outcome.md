# Outcome — 014n Finalized Verification Evaluator-Correction Authority

## Result and exact provenance

**COMPLETE — STANDARD.** Candidate
`6fa5ed9fc62077dbe4be144c6f8ec5e026cc6d67` was independently evaluated as
`PASS` by evaluator revision `005`
(`sha256:1f074b457b9ab4f02e227b6f1aeb86afd61e9563620d6020ee6a1b7450d351de`)
in attempt `010`. The result identity is
`sha256:2ec60f3f7b0242abc09630bdd3c096f3e6035ec5fa2e1fbbb4134899e49fe653`.
The accepted candidate exactly matches that evaluated commit.

The promoted evaluation is recorded by `evaluation/promotion.json`
(`sha256:890a238fee31aa9982e257c655cd61e8024ea6274149e9a9dfc518d362e412ac`)
at checkpoint `df2ad66b1375cc5dca26ef9364c5629092120f0b`; it inventories 30 artifacts
and an integrity identity of
`sha256:439e0edcd93f46cb584f6179ec1514c0faf64fe8924473b360b149c698a38c7f`.
The final As-Built is
`sha256:d9d24470d3f4e0b62c5797e254d37da1f81dde81126be2b65a717e5745771f21`
at checkpoint `56c79d54d8fb0d44352fc3b172a05cba4b0e9205`.

## What Was Established

Harness can layer explicit human evaluator-correction authority over an
immutable, finalized `BLOCKED` verification without rewriting its original
result or classification. The authority is exact-lineage, fail-closed,
content-derived, and one-shot: it makes only evaluator repair eligible, binds
the repair to the source revision and authority identity, and is consumed only
by a correctly bound successful repair.

The spike also established that the new finalized-verification authority can
share the existing correction route, event type, policy, and role contracts
without widening evaluator workspaces or capabilities. The omitted-source
legacy rejected-execution flow remains compatible.

## Implementation Summary

The existing evaluator-correction request and authority became discriminated
unions with a `finalized-verification` variant. Kernel validation resolves the
canonical finalized and allocated events, re-reads the committed result
artifact, compares its provenance and semantic fields, derives staleness from
ledger order, and refuses missing, ambiguous, stale, duplicate, or mismatched
bindings before appending authority.

Resolver handling suppresses only the exact source-classification gate for a
properly bound authority and its one successful repair. Role-input projection
passes the human diagnosis and source bindings to evaluator repair while
preserving legacy revision resolution when an older authority lacks the new
field. No methodology, policy, role-contract, persistence, route, or transition
identity was added.

## Evaluation Evidence

Final attempt `010` ran the frozen revision `005` executable evaluation with
20 of 20 cases passing. Typecheck passed, the methodology/skill diff against
the base was empty, and differential full-suite comparison found the same 22
environment-dependent containment failures at the parent and candidate, with
no candidate regression. AC01–AC17 were satisfied. AC18, the non-required
post-acceptance operator application, was intentionally not adjudicated.

The As-Built found no missing, contradictory, or extra behavior relative to
the frozen contract and confirmed all 30 promoted artifact identities. These
findings describe the exact final candidate; they do not generalize beyond the
tested authority and lifecycle boundaries.

## Material History

The first candidate encountered an evaluator fixture defect, then failed after
that repair exposed an implementation eligibility error. The second candidate
passed its focused evaluator but first hit an infrastructure blockage in the
full-suite evidence environment. A corrected evaluator revision then produced
an earlier PASS, which was later superseded when a human-authorized correction
cycle expanded the candidate and evaluator evidence for the complete lifecycle
contract.

In that later cycle, revision `004` was blocked by another evaluator fixture
defect. Revision `005` then exposed a legacy-flow regression in candidate
`bb84849b...`; candidate `6fa5ed9f...` fixed it by preserving legacy source
revision resolution and passed attempt `010`. Nonterminal allocations 005–007
recorded no evaluator semantic result. The immutable promoted history retains
all terminal attempts and all five evaluator revisions rather than presenting
only the final success.

## Decisions

- Human authorization appends authority over immutable history; it never
  changes the source verification.
- Duplicate identity is verification-lineage based across both source
  variants.
- Existing methodology policy and role contracts remain the single lifecycle
  seam; the implementation adds validation and projection, not a second state
  machine.
- A finalized artifact may omit `execution`, but any present value must match
  canonical evidence.
- Automatic correction accounting is not reset or widened by explicit human
  authority.

## Discoveries

Evaluator fixtures must model host-written event shapes and committed artifact
bindings precisely; otherwise failures can be defects in adjudication rather
than candidate behavior. Differential comparison against the pre-implementation
parent was necessary to distinguish containment-environment failures from new
regressions. The final retry also showed that a new optional authority binding
must not overwrite a value already established by the legacy public contract.

## Deferred Concerns

The declared operator-owned application to workflow `014m` remains outside the
evaluated candidate: AC18 was non-required and not adjudicated. The visible full
suite still has 22 containment-dependent failures in the evaluation environment,
although the identical parent/candidate failure set provides evidence that this
spike introduced none of them. The spike does not establish broader workflow
backend consolidation or any weakening of evaluator isolation.

## Skill Versions and Workflow Cost

Material runs used Brief Readiness contract version 5, Design Map version 4,
Evaluator version 14, Implementation version 5, As-Built version 4, and Outcome
version 5. The manifest records three brief-readiness reviews, one design map,
one evaluator preparation, four implementation attempts, five evaluator
revisions, seven terminal verification attempts, three nonterminal allocations,
and two As-Built snapshots. Entries are contemporaneous unless explicitly
described by their source as historical; no material run entry is marked as a
retrospective statistic. No token, call, or elapsed-time estimates were added.

## Next Step

Adopt the accepted candidate through the operator-owned runtime-successor path,
then perform the frozen brief's bounded root-only application to the named
`014m` finalized verification. Record exactly one correction authority and
confirm that only evaluator repair becomes eligible with unchanged evaluator
isolation; do not allocate that repair as part of this spike.
