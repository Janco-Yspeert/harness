# Retrospective: Evaluator Promotion Fix

Status: informal working note created at explicit request. This document is not
part of the evaluator skill contract, a frozen evaluator revision, or promoted
evaluation evidence.

Scope: the focused revision that moved evaluator promotion from contract v6 to
v7 after Spike 007 exposed lifecycle, procedural, and provenance weaknesses.

---

## What prompted the change

Spike 007 passed machine verification, but promotion happened only after a
separate human instruction. The evaluator then had to inspect older spikes to
infer directory layout, copy/reference conventions, and the expected evidence
set. That turned what should have been archival bookkeeping into methodology
archaeology.

Worse, the promoted attempt ledger was deliberately edited to replace its
private `resultPath` with a public path. The change was documented, but it meant
the promoted ledger was no longer the exact artifact that participated in the
verification cycle. That is a provenance defect, not a cosmetic discrepancy.

## What changed

Evaluator contract v7 now defines the lifecycle as:

```text
VERIFY PASS
  → determine promotion eligibility
  → preserve eligible historical evidence exactly
  → write promotion-time metadata
  → verify identities and Git provenance
  → yield to human acceptance
```

`FAIL` and `BLOCKED` retain their evidence and correction/retry paths but do not
promote.

The contract now specifies a canonical public `evaluation/` layout, immutable
attempt numbering, a deterministic evaluator-revision identity derived from
formatted freeze metadata, and explicit `copied`, `referenced`, and
`not-promoted` dispositions. An unchanged revision is preserved once and
referenced by later attempts.

Frozen evaluator revisions are treated as all-or-nothing eligibility units. A
partial directory is not allowed to masquerade as an exact revision. If a
revision is ineligible for public promotion, its bundle and freeze metadata stay
private; only its canonical identity and disposition appear in newly generated
promotion metadata.

Historical evidence and promotion-time metadata are now deliberately separate:

- Historical evidence is copied byte-for-byte or referenced by verified
  identity. Embedded private paths remain untouched.
- `promotion.json` is newly generated bookkeeping. It maps attempts, revisions,
  public paths, identities, and dispositions without pretending it existed at
  freeze or verification time.
- Promotion does not generate explanatory READMEs merely to make the archive
  look friendly. Archives do not need interior decorating.

## Where the implementation churned

The first draft fixed the lifecycle and exact-copy rule but still left two
important contradictions:

1. It required a canonical evaluator-revision identity without defining how
   normative artifacts represented or derived that identity.
2. It allowed artifact-by-artifact eligibility while also calling the resulting
   directory an exact frozen revision.

The independent reviewer caught both. The correction introduced an explicit
freeze template and made revision eligibility all-or-nothing.

A second review caught another subtle leak: the procedure initially copied
freeze metadata publicly even for an ineligible revision, despite that metadata
listing hidden artifact paths. The final contract keeps both the bundle and
freeze metadata private when the revision is ineligible.

The reviewer also found stale “after an accepted pass” wording in two places in
the root README. Those phrases were removed so active documentation no longer
permits the obsolete `PASS → human acceptance → promotion` interpretation.

There was one minor execution blunder while recording the work: the new manifest
entry was initially inserted after Run 001 because the patch anchor matched the
first repeated measurement-cutoff line. It was immediately moved to the end as
Run 008. Repeated generic anchors in append-only files are tiny procedural
landmines wearing sensible shoes.

## Validation

The final independent review walked these scenarios without consulting prior
spikes:

1. first verification attempt passes;
2. first attempt fails, the evaluator is corrected, and a later attempt passes;
3. a later pass uses an already-promoted unchanged revision;
4. no evaluator revision qualifies for public promotion;
5. historical artifacts already exist and only promotion metadata is new; and
6. source and destination hashes differ.

The reviewer found the final procedure deterministic and no remaining blocker.
The mismatch case stops promotion without rewriting either side or yielding to
human acceptance.

Formatting and diff checks passed. The archived evaluator v6 file matched the
previous active contract byte-for-byte. The full test suite passed once through
`npm run check`; a later parallel launch failed at the test-worker level without
individual assertion output, while the affected test in isolation and the full
serial suite both passed, 25/25. The generic skill validator still rejects the
evaluator's intentional Claude-specific frontmatter, a known compatibility
limitation rather than a v7 regression.

## Historical finding

Existing Spike 007 evaluation artifacts were not modified. Its public manifest
and evaluation README explicitly state that the promoted
`evaluation/attempt-ledger.json` had its `resultPath` rewritten. Under v7's
provenance invariant, that ledger is not byte-identical historical evidence.

The two Spike 007 promotion READMEs were newly generated explanatory documents,
not frozen evidence. The old layout did not machine-label that distinction. No
further alteration could be established without reading the active private
workspace, which this revision deliberately did not do.

## Bottom line

The important improvement is not merely that promotion moved earlier. Promotion
is now a self-contained archival procedure: the evaluator knows when to run it,
where every artifact belongs, whether to copy or reference it, how to prove its
identity, and when to stop. Historical precedent is no longer part of normal
execution.

The main lesson is equally plain: provenance contracts need mechanical shapes,
not stern prose alone. “Preserve the exact revision” sounds rigorous until the
contract forgets to define revision identity, partial eligibility, and reference
metadata. Then it is just a strongly worded invitation to improvise.
