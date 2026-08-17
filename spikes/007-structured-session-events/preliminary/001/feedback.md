# Spike 007 Brief Readiness

## Review basis

Reviewed `spikes/007-structured-session-events/spike.md` against `AGENTS.md`,
`GOALS.md`, the current host/session implementation in `src/index.ts`, the
backend contract in `src/session-backend.ts`, the browser client in
`public/client.js`, visible lifecycle/backend/Codex integration tests, and the
public Outcomes for Spikes 003–005. Evaluator-private material was not
inspected.

## Findings

### 1. Blocker — event observation timing and delivery ownership are unresolved

The brief requires clients to receive started and ended events through the
control surface, calls them lifecycle activity, and excludes persistence,
historical replay, and detached-client resynchronization
(`spikes/007-structured-session-events/spike.md`, “Scope”, “Client behavior”,
“Session lifecycle”, and “Non-goals”). It does not say which control-surface
operation carries either event, which client is eligible to observe it, or how
delivery is ordered relative to the lifecycle transition.

That omission is material in the current system. Successful startup completes
before `POST /sessions` returns the session ID, and a WebSocket can only attach
after that (`src/index.ts`). At the other edge, session finalization currently
terminates the attached socket while removing the session, before DELETE
settles (`src/index.ts`). The browser follows exactly that create-then-attach
sequence and treats closure as a reason to check whether the session became
stale (`public/client.js`). Consequently, emitting only at the transition loses
the started event before attachment; emitting it on attachment is snapshot or
re-delivery semantics; placing it in the HTTP response changes the meaning of
“delivered events”; and sending the ended event immediately before terminating
the socket does not by itself define observable delivery. Independent Design
Map, implementation, and evaluation roles can therefore make incompatible but
plausible choices.

Smallest required clarification: for each required lifecycle event, state the
control-surface observation path, eligible recipient, and observable ordering
relative to `POST /sessions`, WebSocket attachment/closure, and
`DELETE /sessions/:id`. Also state whether an event occurs once per session or
may be synthesized per attachment, while retaining the no-replay and
no-resynchronization non-goals.

### 2. Blocker — the normative Conduit reference and compatibility bar are not identifiable

The brief requires review of a separate Conduit Events project and makes
absence of gratuitous conflict with “relevant” conventions an acceptance
criterion (`spikes/007-structured-session-events/spike.md`, “Conduit Events
architectural awareness” and acceptance criterion 8). It provides neither an
artifact/repository location nor a revision, and it leaves “relevant” and
“gratuitously” as the effective pass/fail rule. `GOALS.md` contains a local,
reviewable provisional list of likely Conduit-shaped metadata and explicitly
allows Harness to diverge where the model is awkward, but it does not identify
the external work or turn that preference into a reproducible acceptance bar.

This materially affects scope and fair evaluation: Design Map and evaluator
roles could consult different Conduit generations or disagree about which
optional metadata is mandatory, while the frozen brief would offer no way to
classify the disagreement.

Smallest required clarification: either make the repository-owned Conduit
compatibility section in `GOALS.md` the complete normative reference for this
spike, or identify a stable public Conduit artifact and revision. In either
case, state that the frozen Design Map’s recorded adoption/divergence decision
is the evaluable result, rather than leaving evaluation to apply an independent
subjective compatibility test.

### 3. Material clarification — startup and ending failure boundaries need explicit event semantics

The brief says “session-started” represents successful startup and
“session-ended” represents the end of a Harness session, while preserving
existing backend cleanup behavior (`spikes/007-structured-session-events/spike.md`,
“Session lifecycle” and “Existing behavior”). The existing host has several
observable boundary cases: backend construction can fail before a session is
published; a backend can exit during startup; and finalization can remove the
Harness session even when `backend.stop()` rejects and DELETE returns 500
(`src/index.ts`; visible backend and Codex integration tests).

The likely startup boundary is publication of the session through a successful
201 response, but the ended boundary on finalization failure is not safely
inferable. Choosing “backend stopped successfully” versus “Harness identity was
removed” changes whether an ended event exists in a real failure path and what
clients may conclude from it.

Smallest required clarification: define the exact successful-start boundary,
and say whether ended follows removal of the Harness session or only successful
backend finalization. No reason/status field is required unless the author
intends clients to distinguish those outcomes in this spike.

## Editorial observations

None worth delaying the contract. The intentionally small event schema can be
settled by the Design Map once the externally observable lifecycle choices
above are fixed.

## Limitations and checks

This was a static contract review. No implementation, Design Map, evaluation,
or runtime test was performed. Restricted evaluator material was neither read
nor searched. The unrelated in-progress Spike 006 path rename was left
untouched.

Files changed by this run are `spikes/007-structured-session-events/feedback.md`,
the matching immutable `preliminary/001/` snapshot, and
`spikes/007-structured-session-events/manifest.md`.

**Not ready to freeze**
