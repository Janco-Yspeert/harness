# Spike 007 Brief Readiness — Pass 2

## Review basis

Reviewed the complete revised `spikes/007-structured-session-events/spike.md`
against `AGENTS.md`, `GOALS.md`, the preserved first-pass findings in
`spikes/007-structured-session-events/preliminary/001/feedback.md`, the current
host/session implementation in `src/index.ts`, the backend contract in
`src/session-backend.ts`, the browser client in `public/client.js`, visible
lifecycle/backend/Codex integration tests, package tooling, selective public
Outcomes for Spikes 003–005, and the public Conduit protocol repository named by
the brief. Evaluator-private material was not inspected.

## Findings

No blockers or material clarifications.

The revised brief resolves the first pass's delivery issue by choosing a
dedicated host-level live broadcast WebSocket, defining connection eligibility,
fan-out, ordering, disconnection behavior, and explicit no-replay semantics. It
also keeps that channel separate from the existing session-specific WebSocket,
preserving the client/session lifetime boundary established by earlier spikes.

The revised startup and ending rules now cover the current implementation's
important lifecycle edges: failed construction does not start a public session;
successful publication produces one start event; permanent Harness-session
removal produces one end event; coalesced end paths cannot duplicate it; and a
cleanup error does not erase the Harness-level end fact. The exact internal
emission seam and HTTP/WebSocket implementation ordering remain legitimate
Design Map and implementation choices because the externally observable facts
are settled.

The Conduit dependency is now bounded and reproducible. The brief names the
canonical public protocol repository, requires the Design Map to pin a Git
revision, makes only the frozen Design Map's recorded adoption/divergence
decisions binding, and excludes runtime/package/transport coupling. The named
protocol currently supports the assumed shape and semantics: a
transport-independent `meta`/`data` JSON envelope, required identity/type/
version/stream/correlation/timestamp/source metadata, optional causation and
extensions, and an object payload that may be empty. Its experimental status is
handled by the required revision pin.

The remaining schema choices—exact pinned revision, source string, local TypeScript
representation, identifier generation, and the event-publishing seam—are
appropriately delegated to the Design Map. They do not alter the product scope
or leave evaluator-visible behavior to chance once that frozen shared contract
exists.

## Limitations and checks

This was a static contract review. No implementation, Design Map, evaluation,
or runtime test was performed. The external Conduit repository was inspected
at its public moving head only to verify feasibility; the Design Map still owns
the required immutable revision pin. Restricted evaluator material was neither
read nor searched.

Files changed by this run are `spikes/007-structured-session-events/feedback.md`
and the appended `spikes/007-structured-session-events/manifest.md`. No
`preliminary/002/` snapshot is required for a passing review.

**Ready to freeze**
