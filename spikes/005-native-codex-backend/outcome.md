# Spike 005: Native Codex Backend — Outcome

## Result

_PASS after evaluator revision and one implementation correction._

**PASS.** The final frozen v2 evaluation passed all 31 mandatory cases against
implementation commit `bb67186d7a5b8fdcba7409ce89e593427d6c52eb`. The promoted
evaluation is committed at `5878209d8e69201158644a1fe26f4a919aeb9bc6`.

The first implementation commit, `38b581572fa27b0b63a0732c4063790e3d4ec320`, did
not pass verification. Diagnosis found thirteen evaluator defects and one
genuine implementation defect. The latter was fixed in `bb67186`; the evaluator
was deliberately corrected and frozen as v2 before re-verification.

The implementation-readiness review concluded that the final brief was ready to
freeze. No separate post-implementation code-review artifact was produced.

## What Was Proven

Harness can supervise a real Codex conversation through Codex App Server's
structured stdio protocol without treating Codex as a terminal. A Harness UUID,
Codex thread ID, Codex turn ID, and App Server process remain distinct
identities with distinct lifecycles.

The Spike 004 backend boundary survived contact with a provider-native agent,
but not unchanged. The common lifecycle concepts—backend startup, input, textual
output, backend termination, asynchronous stop, detach/reattach, and guarded
finalization—remained useful. Input needed an explicit acceptance result and
error channel because a Codex instruction can be rejected while a turn is
active. Backend exit remained meaningful only for loss of the App Server control
backend; ordinary turn completion does not end the Harness session.

Evaluation confirmed that one Harness session can own one Codex thread across
multiple sequential turns; turn completion leaves the session usable; active
turn input is rejected synchronously rather than queued, steered, or silently
discarded; and recoverable `turn/start` failure returns the same session and
thread to idle.

The delta-first projection was sufficient to carry agent text through the
existing string data plane without duplicating completed messages. It did not
establish strings as a sufficient long-term representation for tool activity,
approvals, file changes, provider state, usage, or other structured events.

Harness stop was proven to distinguish graceful provider interruption from local
fallback finalization. Successful graceful or fallback cleanup returns `204`;
failure to terminate the owned App Server even after bounded signal escalation
reaches the existing HTTP failure path instead of hanging forever. Stopping
Harness does not permanently delete the Codex thread.

The deterministic peer exercised the real asynchronous JSONL-over-stdio path,
while a separate authenticated live smoke proved compatibility with the actual
locally installed App Server. The smoke used `codex-cli 0.147.0`, matching the
schema-generating version, ran through the normal `HARNESS_BACKEND=codex`
runtime path, completed two turns (`ALPHA`, then `BETA`) across detach/reattach,
and stopped with `204`.

The spike proves the Codex backend through the existing client transport path;
it does not prove that Codex is yet accessible as a first-class session type
from the normal Harness UI.

## Implementation Summary

`CodexBackend` owns a local `codex app-server --stdio` process, performs the
initialization handshake, creates one provider thread in an explicit working
directory, and translates Harness instructions into turns on that thread. It
uses the non-experimental protocol surface with approvals disabled and a
read-only sandbox for this spike.

The generic session boundary gained a narrow `BackendInputResult` and
`HarnessErrorMessage` channel. These support the two required control errors,
`turn_active` and `turn_start_failed`, without moving App Server protocol types
into generic session management. The PTY backend retains its terminal-input
semantics and reports accepted input through the same minimal result shape.

Agent-message deltas are forwarded as text. Completed agent-message text is a
fallback only when no delta was observed for that item. Other structured events
remain backend-internal or unsupported rather than being serialized into fake
terminal output.

Stop first requests `turn/interrupt` for an active turn and waits for both the
response and interrupted terminal event. After the configurable interruption
grace period, local process teardown escalates from `SIGTERM` to `SIGKILL`. Both
process-exit waits are bounded; inability to finalize is reported as a stop
failure.

Runtime selection is deliberately small: PTY remains the default, while
`HARNESS_BACKEND=codex` selects Codex and `HARNESS_CODEX_CWD` supplies its
working directory. The process-construction seam permits deterministic
process-backed evaluation without creating a provider registry or plugin
framework.

## Evaluation Outcome

The final frozen v2 evaluation passed 31/31 mandatory cases. It covered protocol
initialization and identity, startup ordering and recovery, sequential and
failed turns, active-turn rejection, text projection, unmodeled structured
events, detach/reattach, idle and active stop paths, bounded failure, fatal
backend termination, finalization races, PTY regression, and programmatic host
shutdown.

Visible verification also passed 21/21 integration tests, type checking, and
scoped lint/format checks. Repository-wide default discovery remains polluted by
historical promoted test directories and generated artifacts; the evaluator
therefore ran the active integration files explicitly and documented the
pre-existing failures separately.

The deterministic suite provides strong evidence for the frozen protocol
surface, but it models only fields and event categories needed by this spike.
Runtime backend selection, absence of Harness-owned authentication, and the live
smoke were assessed by inspection and recorded execution rather than hidden
automation. The live smoke stopped an idle session after its second completed
turn; it did not establish whether real Codex active-turn stop completes
gracefully or requires fallback.

## Evaluation History

The first verification evaluated `38b5815` against frozen v1. Fourteen cases
failed. Investigation classified thirteen as `EVALUATOR_DEFECT`, caused by
reference-equality assertions, unsynchronized WebSocket close, reuse of exited
fake peers, controller waits ordered before the actions that triggered them, and
an initialization request consumed without response.

E24 also had an unfalsifiable v1 oracle: a real child can ignore `SIGTERM`, but
cannot ignore `SIGKILL`, so the test could not exercise failure after
escalation. A corrected process wrapper intercepted `kill()` itself. That
correction exposed one genuine `IMPLEMENTATION_FAILURE`: after sending
`SIGKILL`, the backend awaited process exit without a bound. A process that
never reported exit caused `DELETE` to hang instead of returning the required
failure response.

The implementation added a second bounded process-exit wait in `bb67186`. The
evaluation contract retained the same requirements, invariants, and negative
requirements; only defective test mechanics and E24's oracle were corrected. The
corrected suite was frozen as v2 before the second verification, which then
passed all cases.

Promotion subsequently exposed a separate process failure. The evaluator's
fixed-path promote-and-clean-up workflow overwrote the private v1 suite with v2
and deleted the private workspace. The original frozen v1 files had never been
committed independently, so evaluator-defect provenance was erased. Attempt 001
was reconstructed later and committed at
`08dab28a4993aa42d1eeca4b84a054674633d21d`. Its failure signature was
empirically reproduced, including the same fourteen cases and byte-identical E24
assertion error, but it remains a reconstruction rather than a retrieved exact
snapshot. The contemporaneous failed result, corrected suite, and diagnostic
probes survived under the promoted diagnostic record and provide stronger
primary evidence for what happened than the reconstruction alone.

## Decisions Made

- **Keep Harness, thread, turn, and process identities separate.** This is a
  durable domain boundary supported by both PTY and Codex evidence.
- **Retain a small shared session-backend lifecycle, but add explicit input
  acceptance and control errors.** This is a durable correction to the false
  assumption that every backend write is unconditionally accepted.
- **Project only agent text onto the string output channel.** This is a
  spike-local presentation decision, not a declaration that structured agent
  events are strings.
- **Reject active-turn input.** Steering, queuing, and overlapping turns were
  deliberately excluded for this spike; this policy may be revisited when the
  product defines instruction semantics more broadly.
- **One active Harness session owns one newly-created Codex thread.** This is a
  Spike 005 constraint, not a durable limit on session count, thread recovery,
  or externally-created threads.
- **Use bounded local teardown and distinguish finalization failure from
  successful fallback.** A missing graceful provider acknowledgement does not
  itself make stop fail, but inability to finalize Harness-owned infrastructure
  does.
- **Do not delete provider history when Harness supervision ends.** Provider
  conversation ownership and Harness session lifecycle remain separate.
- **Keep provider mechanics inside `CodexBackend`.** No universal provider or
  structured-event framework was justified by one native integration.

## Discoveries

- The Spike 004 boundary was located reasonably well, but `write(): void` hid a
  PTY assumption. Provider-native input needs acceptance/failure semantics.
- A long-lived provider conversation maps naturally to a Harness session, while
  provider turns are subordinate operations rather than sessions.
- App Server's agent-message deltas and completed items require per-item
  bookkeeping to avoid duplicate text. Other valid notifications can be safely
  ignored for this proof without pretending they do not exist.
- Bounded interruption alone is insufficient. Local process finalization must
  also be bounded after every escalation step, including `SIGKILL`.
- The same evaluator weakness seen in Spike 004 recurred in a larger form:
  helpers that appear sound in isolation can still produce invalid or deadlocked
  oracles across WebSocket, process, and event-ordering boundaries.
- The live App Server accepted the frozen `codex-cli 0.147.0` protocol shapes
  used by the implementation and produced non-duplicated text across two turns.
  The retained smoke evidence does not enumerate every real non-text event
  category encountered, so no stronger claim is warranted.
- Fixed-path evaluator promotion is destructive. Deleting the private workspace
  after promotion can erase the precise defective evaluator revision needed to
  explain later corrections.

## Deferred Concerns

- **Structured provider events and attention state.** Approvals, questions,
  tools, file changes, progress, usage, and failure metadata remain outside the
  Harness protocol. They matter directly to the product's supervisory goal.
- **Replay and resynchronization.** Work can continue while detached, but output
  produced during detachment is not replayed. This becomes increasingly weak as
  sessions become longer-lived.
- **Approval handling and writable workloads.** The spike used approval policy
  `never` and a read-only sandbox. Real coding work will require an explicit,
  secure interaction model rather than silently dropping provider requests.
- **Thread persistence and recovery.** Codex history may survive Harness stop,
  but Harness does not retain or expose the thread ID, resume it later, or
  recover after daemon restart.
- **Multiple sessions and providers.** The host still has a singleton slot. The
  backend boundary avoids single-process assumptions, but concurrent storage,
  isolation, and cleanup remain unproven.
- **Richer fatal/protocol-error handling.** The proof covers process exit and
  required request failures, not reconnection, malformed-stream recovery,
  degraded backends, or general server-to-client requests.
- **Real active-turn stop evidence.** Deterministic evaluation proves both
  graceful and fallback contracts, but the live smoke did not record which path
  a real active Codex turn takes.

## AI-Development Process Findings

Repeated implementation-readiness review materially improved the brief. It
resolved protocol versioning, the synchronous busy window, recoverable turn
startup failure, PTY carriage-return normalization, text de-duplication, and
bounded stop semantics before implementation. The frozen public contract was
therefore strong enough to distinguish the eventual E24 implementation defect
from evaluator mistakes without changing product requirements.

Evaluator preparation nevertheless failed badly. Thirteen mechanical defects
survived the pre-freeze integrity gate, and E24's original oracle could not
falsify the behavior it claimed to test. Diagnosis was careful and correctly
separated evaluator defects from the one product defect, but that is damage
control, not evidence that preparation was adequate.

This repeats the transport lesson recorded by Spike 004: direct helper checks do
not validate an oracle that is later exercised through a different asynchronous
path. Spike 005 broadened the lesson from WebSocket delivery to process
creation, IPC control, request ordering, socket closure, and process
termination.

The implementation workflow improved provenance by requiring clean,
implementation-specific commits before evaluation. The final evaluator record
correctly names `bb67186`, and the promotion commit is separate. However, the
evaluator's destructive promotion policy then erased the original frozen test
revision. Reconstructing it was useful and unusually well validated, but it
cannot restore the evidentiary quality of a contemporaneously committed
snapshot.

## Recommended Follow-ups

- **AI workflow:** Make evaluator promotion non-destructive and versioned.
  Preserve every frozen attempt, failed result, diagnostic revision, and
  supersession relationship before deleting any private workspace.
- **AI workflow:** Split evaluator instructions into a canonical semantic core
  with thin Codex and Claude execution overlays, while ensuring overlays cannot
  redefine the evaluation contract.
- **AI workflow:** Strengthen pre-freeze oracle validation through the exact
  asynchronous path used by each mandatory case; specifically test trigger/wait
  ordering, retry factories, object assertions, close handshakes, and
  falsifiability of failure simulations.
- **Likely implementation spike:** Introduce the minimum structured
  Harness-level state/events needed for attention, approvals, questions, and
  provider activity, based on the concrete Codex categories rather than a
  speculative universal schema.
- **Likely implementation spike:** Add detached-session replay or state
  resynchronization sufficient for useful long-running supervision.
- **Architectural investigation:** Define durable provider-thread ownership,
  resume, and daemon-restart behavior before treating persistent provider
  history as recoverable Harness state.
- **Future verification:** Exercise and record active-turn stop against the real
  authenticated Codex service, including whether graceful interruption or local
  fallback occurs.

## Provenance

- Spike brief: `spikes/005-native-codex-backend/spike.md`
- Public evaluation requirements:
  `spikes/005-native-codex-backend/eval-requirements.md`
- Protocol/schema baseline: `spikes/005-native-codex-backend/protocol/`
  (`codex-cli 0.147.0`, committed with baseline commit
  `c4827dee40a8d4108db43a38b0d44a5da5694ffd`)
- Initial implementation commit: `38b581572fa27b0b63a0732c4063790e3d4ec320`
- Evaluated implementation commit: `bb67186d7a5b8fdcba7409ce89e593427d6c52eb`
- Evaluation promotion commit: `5878209d8e69201158644a1fe26f4a919aeb9bc6`
- Final evaluation specification:
  `spikes/005-native-codex-backend/evaluation/eval-spec.md`
- Final evaluation result:
  `spikes/005-native-codex-backend/evaluation/eval-result.md`
- Final promoted hidden tests and manifest:
  `spikes/005-native-codex-backend/evaluation/hidden-tests/`
- First failed verification and evaluator-repair diagnostics:
  `spikes/005-native-codex-backend/evaluation/verify-2026-08-14-diagnostics/`
- Reconstructed frozen v1 attempt:
  `spikes/005-native-codex-backend/attempts/001/` (reconstruction commit
  `08dab28a4993aa42d1eeca4b84a054674633d21d`)
- Implementation-readiness review: `spikes/005-native-codex-backend/feedback.md`
- Visible Codex integration tests: `test/codex-backend.integration.test.ts`
- Implementation: `src/codex-backend.ts`, `src/session-backend.ts`,
  `src/index.ts`, `src/pty-backend.ts`, `public/client.js`
- No ADR or separate post-implementation code-review artifact was created.

## Human/ChatGPT Additions

Evaluator preparation was also operationally expensive. The Spike 005 prepare
run used approximately 155 agent/inference cycles, generated about 202k output
tokens, reached roughly 270k context, returned about 54k tokens of file reads
and 39k tokens of shell output, and required repeated permission interaction.
These numbers are a baseline rather than a target; future evaluator revisions
should measure whether stronger oracle validation can be achieved with fewer
iterative turns, less retained command output, and less context growth.

**AI workflow**: Run future spikes with Claude and Codex swapped between
implementation and evaluation roles, and selectively replay equivalent frozen
spikes with isolated same-model implementor/evaluator sessions. Compare
evaluator defects, implementation defects found, human intervention, tool/turn
cost, and completion reliability before permanently assigning roles by model.

Codex is not yet exposed through the normal browser UI. The Spike 005 Codex
backend is selectable through host/runtime configuration
(HARNESS_BACKEND=codex), but the current web application still presents the
terminal-oriented session flow and does not provide a user-facing way to launch
or select a Codex-backed session. The live smoke therefore proves the backend
and existing client transport path, not a finished Codex supervisory UX. A later
spike must decide how backend/session type is selected and how native-agent
sessions are represented in the UI without treating them as terminals.
