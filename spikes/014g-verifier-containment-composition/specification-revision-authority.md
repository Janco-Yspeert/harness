# Human Specification Revision Authority

Date: 2026-10-04

Authority: explicit human decision

## Decision

The frozen 014g SC1/AC03 regression requirement is partially superseded by
subsequently accepted Spike 014h.

The original 014e D4 assertion that adapter/provider metadata must cause
`planLaunch` refusal is no longer authoritative because accepted 014h moved
that security boundary into mandatory host-owned containment for every spawned
registered-adapter launch.

This authority does not waive the underlying containment invariant. It
authorizes a forward specification revision that replaces only the obsolete
mechanism-specific assertion with the accepted 014h host-containment behavior
and corresponding regressions.

All other frozen 014g requirements and historical attempts remain unchanged.

## Immediate effect

This record is authority for a later forward specification revision. It does
not itself modify the frozen 014g brief, Design Map, evaluator revisions,
candidate identities, verification results, or prior attempts, and it does not
allocate or authorize role execution.
