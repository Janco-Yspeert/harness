# Evaluation Requirements

## Testability Requirements

- **TR1** — Requirement: `/events/ws` must be reachable as a WebSocket
  upgrade on the same host/port returned by `startHarnessHost`'s `url`,
  independent of any particular session. Reason: evaluation connects real
  WebSocket clients directly, exactly as the existing session-specific
  `/sessions/:id/ws` is already exercised by the public integration suite.
  Source: brief "Structured event channel"; Design Map "GET /events/ws is
  the host-level WebSocket upgrade surface." Implementation impact: no new
  public API surface is required beyond the endpoint itself; the existing
  `HarnessHostOptions.createBackend` injection seam is sufficient.

- **TR2** — Requirement: the existing `HarnessHostOptions.createBackend`
  injection seam must remain sufficient to deterministically construct
  backends that succeed, fail startup, exit naturally, and fail
  finalization (a rejecting `stop()`), without requiring any additional
  public seam to observe or trigger event publication. Reason: evaluation
  drives these scenarios entirely through backend doubles and the public
  HTTP/WebSocket surface, the same way the existing public integration
  suite already does. Source: Design Map "Shared contracts." Implementation
  impact: none beyond preserving the current `SessionBackend`/
  `SessionBackendFactory` contract.

- **TR3** — Requirement: each structured event delivered over `/events/ws`
  must be exactly one complete JSON envelope per WebSocket text frame (not
  newline-delimited, not batched, not split across frames). Reason:
  evaluation parses each received frame independently with `JSON.parse`.
  Source: brief "The event representation must remain serializable as JSON
  over the event WebSocket." Implementation impact: one `send()` call per
  emitted envelope.

- **TR4** — Requirement: a client must be able to connect to
  `/events/ws` and, independently, to `/sessions/:id/ws` for the same host
  at the same time, without one connection blocking, delaying, or being
  rejected because of the other. Reason: several evaluation cases exercise
  both channels concurrently to verify their separation. Source: brief
  "Existing session WebSocket" and "Event WebSocket behavior."
  Implementation impact: none beyond keeping the two channels independent,
  as already required by the brief.

## Evaluator Assumptions

- **A1** — Assumption: "a session was successfully started" is observed as
  HTTP `201` from `POST /sessions` with a JSON body containing `id`; "a
  session was permanently removed" is observed as a subsequent
  `GET /sessions/:id` returning `404`. Reason: these are the existing
  public observables already used by the public integration suite.
  Evaluation impact: cases correlate structured events with these HTTP
  observables rather than any internal state.

- **A2** — Assumption: evaluation may construct backends via the existing
  `createBackend` injection using in-memory doubles, the real PTY backend,
  and the Codex backend driven by the repository's existing
  `fixtures/fake-app-server.mjs` test double, exactly as the current public
  integration suite already does. This does not, by itself, impose any new
  implementation constraint. Evaluation impact: PTY- and Codex-backed
  scenarios are both exercised for lifecycle equivalence.

- **A3** — Assumption: absence of an event (for example, no
  `session.started` after a failed startup) is asserted after a bounded
  wait (on the order of a few hundred milliseconds), not an unbounded or
  sub-millisecond guarantee. Evaluation impact: cases confirm the event
  channel remains live and responsive (via a subsequent, real event)
  rather than relying solely on a timeout to prove absence.

- **A4** — Assumption: "UTC RFC 3339 date-time" (Design Map) is validated
  with a standard pattern accepting an optional fractional-seconds
  component and a literal `Z` UTC designator (for example, the format
  produced by `Date.prototype.toISOString()`), not a specific numeric UTC
  offset representation. Evaluation impact: `meta.timestamp` conformance
  checks accept any value matching that pattern.

## Blocking Questions

None. The frozen brief and Design Map together settle the endpoint path,
envelope shape, closed-object requirement, session/stream identity mapping,
and the existing public seam sufficient for evaluation. No material
ambiguity was found that would prevent fair evaluation.

## Environment Requirements

- Node.js `>=24.12.0` (per `package.json` `engines`), run with the public
  project's own dependencies (`ws`, `node-pty`) and working directory.
- The public repository's existing `fixtures/fake-app-server.mjs` test
  double is used to drive Codex-backed scenarios; no real `codex` binary or
  network access is required, matching the existing public Codex
  integration test suite.
- No external services, environment variables, or additional test tooling
  beyond the public project's existing `node --test` runner are required.
