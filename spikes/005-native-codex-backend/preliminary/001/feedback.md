# Spike 005 review feedback

## Findings

### Blocker — active-turn input has no defined observable behaviour

The brief allows concurrent input to be “reject[ed] or declin[ed] internally,”
postponing the actual behaviour until the outcome (`spike.md`, line 286). That is
an externally observable product decision, not an implementation detail.

The current backend contract returns no result from `write()`
(`src/session-backend.ts`, line 1), and the WebSocket handler provides no
acknowledgement or error path (`src/index.ts`, line 297). Consequently,
implementations could silently discard input, emit an error as agent text, close
the socket, or accidentally steer the turn—all while arguably satisfying the
wording.

Minimum decision before freeze: state exactly what happens to active-turn input
and whether the client receives any indication. A deliberately narrow behaviour
is fine; it just cannot be invented during implementation.

### Blocker — stop completion and interruption semantics remain unresolved

For an active turn, the brief says the backend “should request interruption,”
then finalize resources, and permits bounded fallback (`spike.md`, line 381).
The evaluation requirement only checks that interruption was requested before
teardown (`spike.md`, line 633).

The official protocol emits `turn/completed` after interruption, so there are
materially different interpretations: fire the request and immediately kill App
Server; await the interrupt response; await the interrupted terminal event; or
time out and fall back. The existing HTTP lifecycle waits for `backend.stop()`
and returns either `204` or `500` (`src/index.ts`, line 264), making this
difference externally observable.

Minimum decision: specify what evidence of interruption is awaited, when
fallback teardown is permitted, and whether successful bounded fallback
produces `204` or `500`.

### Material clarification — supported App Server version is not pinned

The brief targets the locally installed App Server and requires deterministic
protocol substitution, but identifies no minimum Codex CLI version or
protocol-schema baseline. OpenAI explicitly states that generated App Server
schemas are specific to the Codex version that generated them. Without a
baseline, an implementation and evaluator peer can legitimately encode
different request fields or notifications.

“Stable App Server surface only” is otherwise meaningful: the documented way
to remain on it is to omit `capabilities.experimentalApi`. However, the App
Server command itself is still described as experimental, so “stable” refers to
its gated protocol subset—not product maturity. That distinction should be
stated to avoid a fairly obvious semantic banana skin.

Minimum clarification: name the minimum/tested Codex CLI version or committed
schema baseline and explicitly define “stable surface” as operating without
experimental API opt-in.

### Material clarification — agent-text projection can duplicate output

The brief permits agent text or deltas to flow through the string channel
(`spike.md`, line 309), while automated verification likewise says
“text/deltas” (`spike.md`, line 612).

App Server emits incremental `item/agentMessage/delta` notifications and
completed item notifications. Forwarding both naively can display the answer
twice. The brief currently gives neither implementers nor evaluators a
correctness oracle for duplication.

Minimum clarification: define one authoritative projection rule—for example,
stream deltas and do not subsequently emit the completed message text, with
whatever narrow fallback is desired when no deltas arrive.

### Material clarification — diagnostic error surfacing is untestable

Authentication errors must be surfaced “sufficiently for diagnosis”
(`spike.md`, line 190), while structured errors may remain internal
(`spike.md`, line 333). No minimum destination is given.

This affects whether sanitized stderr/logging is sufficient, whether startup
returns `500`, whether an active session ends, or whether browser-visible text
is expected.

Minimum clarification: state the acceptable diagnostic surface—most narrowly,
sanitized server logging plus the established startup/failure HTTP
behaviour—and explicitly say browser error UX is not required if that is the
intent.

## Verdict

**Not ready to freeze.** The active-turn input contract and active-turn stop
semantics are unresolved blockers. The protocol-version baseline, text
projection rule, and diagnostic-error surface should also be tightened to
prevent divergent implementations and unfair evaluation.

No technically infeasible or obviously disproportionate requirement was
identified. The real App Server smoke adds environmental fragility and cost,
but the brief acknowledges that explicitly and keeps deterministic verification
responsible for exhaustive behaviour.

No `eval-requirements.md` existed at review time. The review covered the
complete brief, current implementation and public contracts, visible tests,
project guidance, prior public outcome context, and the current official
[Codex App Server documentation](https://developers.openai.com/codex/app-server).
No files other than this feedback artifact and the spike-review skill were
changed, and no tests were run for the review.
