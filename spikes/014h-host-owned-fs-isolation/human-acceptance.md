# Spike 014h — Human Acceptance

**Date:** 2026-10-02  
**Decision:** ACCEPTED

## Accepted candidate

I accept Spike 014h's implementation at the exact independently verified candidate:

`dee86d2314bffa7cc2da0d8ac72004250a06debb`

This acceptance is for the frozen 014h scope: host-owned filesystem isolation derived from Role Grants, reuse/generalization of the existing 014e bubblewrap path, public Codex execution under that boundary, mixed protected-workspace enforcement, fail-closed launch behaviour, and separation of configured executor settings from provider attestation.

## Independent verification

The exact candidate was independently verified under frozen evaluator revision `001`, attempt `006`, execution:

`9539f28b-5cb6-4dbc-b903-b57dbacafb05`

The authoritative result was:

- **PASS**
- **14/14 acceptance criteria satisfied**
- **4/4 executable evaluator cases passed**
- **219/219 evaluator regression tests passed**
- typecheck, lint and format checks passed

Public verification evidence is recorded in `verification-result.json`.

## Promotion-history qualification

Promotion required an explicit loss-aware bootstrap exception because evaluator-private artifacts from attempts 001–005 had not been durably retained.

I accept 014h despite that historical retention gap because:

- the authoritative passing attempt is intact;
- the missing artifacts were not reconstructed or fabricated;
- the loss is explicitly recorded as `incomplete-known-loss`;
- the ordinary archive validator remained truthful that the archive was incomplete.

This acceptance does **not** make missing evaluator evidence an acceptable normal condition and does not waive complete attempt retention for future evaluation cycles. The loss-aware path is treated as recovery machinery for a known historical defect, not as evidence that an evaluator may simply omit required history.

## Provenance boundary

The independently evaluated 014h product ends at `dee86d2`.

Later bootstrap/runtime changes used to make the legacy evaluator executable and to complete promotion are not silently incorporated into the independent 014h PASS merely because they are present later on the branch. Their provenance is recorded separately in `provenance-note.md`.

Likewise, 014h was developed on a branch that already contained candidate implementations from 014f and 014g. Their presence in the runtime, and their survival of 014h regression testing, does not constitute human acceptance of either spike.

## Decision

No material concern remains that blocks acceptance of the verified 014h scope.

Spike 014h is **ACCEPTED**.

This acceptance does not itself authorize or complete 014f, 014g, or the proposed candidate-evaluator N → N+1 successor work.
