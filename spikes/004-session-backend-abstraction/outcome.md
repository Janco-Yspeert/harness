# Spike 004: Session Backend Abstraction — Outcome

## Result

**PASS.** Independent evaluation found no implementation failures and no
specification drift. The evaluated implementation was present as uncommitted
working-tree changes on branch `feat/spike-004-session-backend-abstraction`, on
top of base commit `c44b945e4de4cbe7e42e01e74e4f58be01eb7527`; there is
therefore no final implementation commit to record.

The frozen suite passed 30 of 34 mandatory cases directly, plus all 9 evaluator
self-checks. Four mandatory cases were affected by one evaluator timing defect,
not an implementation failure. Two read-only diagnostic probes confirmed the
underlying behaviour after removing that race. No separate code-review artifact
was produced.

## What Was Proven

Harness can manage its logical session lifecycle through a backend boundary
without requiring that backend to be a PTY, shell, child process, or holder of
the Harness session identity. The production Bash/PTY path and an injected
in-memory backend both participated in the same host, HTTP, WebSocket,
attachment, and cleanup lifecycle.

Evaluation confirmed that asynchronous backend creation reserves the singleton
slot before startup completes, returns `201` only after successful startup, and
recovers cleanly from startup failure. Explicit deletion waits for backend
finalization before returning `204`; backend-initiated exit, explicit stop, and
host shutdown converge on one guarded finalization path without observably
duplicating teardown.

The spike also demonstrated recovery after backend exit. A stale session becomes
unavailable, its attached client is closed, and a replacement session can be
created, attached, and used. `GET /sessions/:id` gives the browser a transport-
independent way to distinguish a stale session from an ordinary WebSocket
failure. All 21 carried-forward Spike 003 regression cases passed, including PTY
detach/reattach, stop, natural exit, signal cleanup, and localhost-only binding.

This proves the boundary against one deliberately simple non-process backend. It
does not prove that the same string-oriented contract is sufficient for a real
Codex, Claude, or remote API integration.

## Implementation Summary

The implementation introduced a small `SessionBackend` contract supporting
string input, string output callbacks, independent-exit notification, and an
idempotent stop operation. `startHarnessHost` accepts an optional backend
factory while retaining the PTY backend as the default. Tests can therefore
inject a backend through normal host construction and exercise the real session
path.

PTY-specific behaviour moved into a `PtyBackend`: Bash spawning, the PTY handle,
process IDs, Unix signalling, exit observation, timeout escalation, and process-
group cleanup no longer live in generic session management. The host retains
ownership of Harness identity, attachment state, singleton reservation, and the
logical ending operation.

Async creation uses a separate reservation while the factory is unresolved. Once
started, a session has one memoized ending promise shared by explicit deletion,
backend exit, and shutdown. The backend is finalized before the session is
removed and its client is closed, which makes the browser's immediate post-close
existence check observe a stale session deterministically.

The browser checks `GET /sessions/:id` after an unexpected close. It discards
the stored ID only on `404`; it retains the ID when the session still exists or
the HTTP check itself fails. No browser framework, backend registry, provider
model, or new dependency was introduced.

## Evaluation Outcome

The final frozen evaluation returned **PASS**. It covered 34 mandatory cases
through 44 test invocations across 11 case files, plus 9 evaluator-helper
self-checks. Thirty mandatory cases and all self-checks passed directly.

Coverage included asynchronous startup ordering and failure recovery; active and
stale session lookup; PTY and injected-backend input/output; attachment
exclusivity and reattachment; explicit and independent termination; finalization
races; replacement-session recovery; programmatic and signal shutdown; and
localhost-only networking. Type checking passed. Repository-wide lint remained
non-clean because 17 promoted Spike 003 historical test files are outside the
current TypeScript project; no changed Spike 004 implementation file had a lint
failure.

Four cases—E6, E22, E26, and E27—contained a shared evaluator defect. They read
the fake backend's input array immediately after `WebSocket.send()`, sometimes
racing that network delivery against synchronous fake output. The contract only
requires eventual delivery through the real WebSocket path, not same-turn
synchronous mutation. Isolated reruns reproduced the timing issue. One
diagnostic probe observed the input absent immediately and present after 50 ms;
a second reconstructed the complete non-PTY exit-and-replacement sequence with
proper synchronization and passed. Frozen artifacts were not modified during
verification.

The browser's stale-ID state transition was not covered by automated hidden
browser tests because the repository has no proportionate DOM or browser-
automation setup. Host-side `GET` behaviour and the complete server-observable
recovery sequence were automated; browser logic was limited to manual
verification and code inspection as allowed by the frozen contract.

## Evaluation History

There was one frozen evaluation attempt and no earlier blocked or failed
evaluator run. Before evaluation preparation, implementation-readiness review
substantially revised the original brief. The archived original draft lacked
decisions for asynchronous startup, failed-start cleanup, finalization
ownership, termination races, an independently usable injection seam, and a
browser-observable stale-session mechanism. Those decisions were added before
freeze rather than left for implementation or evaluation to invent.

The sole issue during final verification was the evaluator timing defect
described above. It was classified as `EVALUATOR_DEFECT`, with zero
`IMPLEMENTATION_FAILURE`, `SPECIFICATION_AMBIGUITY`, `INFRASTRUCTURE_FAILURE`,
or `SPEC_DRIFT` findings. The evaluator preserved the frozen tests unchanged and
used diagnostic probes only to classify the failures, not to pretend the four
broken assertions had passed.

## Decisions Made

- **Keep the backend contract deliberately small.** Input and output remain
  strings, with start, exit observation, stop, and finalization as the common
  lifecycle. This is a spike-local proof boundary, not a universal AI-provider
  interface.
- **Make backend construction injectable at host construction.** A zero-argument
  factory provides an ordinary testability seam without adding registries,
  discovery, plugins, or user-visible backend selection.
- **Reserve before asynchronous startup.** The singleton constraint applies to
  both active sessions and in-progress creation, preserving deterministic
  single-session behaviour during this spike.
- **Separate failed-start cleanup ownership.** A failing backend factory owns
  cleanup of resources acquired before it reports failure; Harness owns release
  of its creation reservation. Normal finalization begins only after successful
  startup.
- **Coalesce all successful-session endings.** One guarded ending operation owns
  finalization and removal regardless of whether deletion, backend exit, or host
  shutdown arrives first. This is intended as a durable lifecycle principle,
  though the current singleton storage remains spike-local.
- **Use HTTP for browser stale-session detection.** WebSocket failure alone is
  ambiguous in browser APIs. `GET /sessions/:id` supplies the missing existence
  signal without treating disconnect as session death or introducing a general
  inspection API.
- **Retain PTY shutdown semantics inside the adapter.** Existing signal
  escalation and process-group cleanup remain valid PTY behaviour but are no
  longer concepts required by generic session management.

## Discoveries

- Browser WebSocket APIs cannot reliably expose the HTTP status of a rejected
  upgrade. Correct stale-session recovery therefore needs a separate observable
  signal; interpreting every close as session death would break detachability
  and ordinary network-loss recovery.
- The ordering of backend finalization, session removal, and socket closure is
  externally significant. Closing the socket before removing the session lets an
  immediate browser existence check observe `200` and remain stuck with a stale
  ID. Closing after finalization/removal makes the documented recovery sequence
  deterministic.
- A backend can report exit synchronously from inside `stop()`. The generic
  ending guard must therefore be installed before invoking stop, or re-entrant
  exit handling can initiate duplicate teardown.
- Real WebSocket input delivery is asynchronous even over loopback. Evaluation
  assertions against shared fake state require explicit synchronization;
  `socket.send()` is not a server-side delivery barrier. This was missed by the
  frozen evaluator despite its helper self-checks.
- The existing implementation's PTY coupling was concentrated enough to move
  behind a small adapter. The spike did not require a provider framework or a
  generalized state machine.

## Deferred Concerns

- **Structured backend events.** The current string data plane is sufficient for
  this proof but will probably need revision for approvals, tool calls, agent
  state, metadata, and other native-provider semantics. It was deferred to the
  first real structured integration to avoid false universality.
- **Stop and finalization failure.** Backends in this spike stop successfully
  and finitely. Timeouts, lost connectivity, rejected cancellation, degraded or
  zombie sessions, retries, and partial finalization remain unresolved and will
  matter for remote providers.
- **Multiple sessions.** The backend boundary avoids identifying sessions with
  processes, but the host still deliberately supports one active or reserved
  session. Multi-session storage, isolation, and concurrent cleanup remain
  unproven.
- **Browser-state automation.** The stale-ID client logic lacks automated DOM or
  browser coverage. Adding a framework solely for this regression was
  disproportionate, but future browser complexity will make code inspection and
  manual checks increasingly weak evidence.
- **PTY descendant cleanup.** As in Spike 003, processes escaping the directly
  managed Bash process group may survive. The adapter relocation does not solve
  that ownership problem.
- **Durable implementation provenance.** Evaluation passed against uncommitted
  working-tree changes. Until those changes are committed, the exact evaluated
  implementation is recorded by the evaluation report and current diff rather
  than an immutable implementation commit.

## AI-Development Process Findings

Implementation-readiness review materially improved this spike before freeze.
Repeated review passes resolved externally observable decisions around startup,
cleanup, browser recovery, and test injection. Archiving the original draft
makes that evolution visible rather than rewriting it as if the final contract
arrived fully formed.

Evaluation preparation was still inadequate in one concrete respect. Nine helper
self-checks verified the fake backend in isolation, but none checked its use
through the asynchronous WebSocket transport. Four mandatory cases therefore
froze with the same invalid same-turn input assertion. The verification process
classified the defect carefully and preserved the frozen artifacts, but that is
damage containment; transport-aware oracle validation should have caught it
before freeze.

The same broad lesson appeared in Spike 003, where PTY echo and job-control
noise made plausible assertions observe the wrong event. Here the problem was
event-loop ordering rather than terminal noise. In both cases, test helpers
being correct in isolation did not make the end-to-end oracle trustworthy.

The workflow also permitted evaluation and promotion without a committed
implementation. That preserved progress but weakened provenance and makes the
historical result harder to reproduce exactly. A future implementation/evaluator
handoff should require either a clean implementation commit or an explicitly
recorded patch identity before verification begins.

## Recommended Follow-ups

- Commit the evaluated implementation and promoted Spike 004 artifacts on the
  feature branch before opening the pull request; record the resulting commit in
  later provenance rather than retroactively inventing it here.
- Repair future copies of the four affected evaluator cases by waiting for
  backend input delivery or synchronizing on an explicit acknowledgment before
  inspecting fake state. Add an end-to-end self-check that crosses the actual
  WebSocket boundary.
- Use the first real non-PTY provider integration to revisit the string data
  plane and determine which structured concepts belong in Harness core versus a
  provider adapter.
- Address multi-session storage and isolation in a separate spike while
  preserving the backend-independent identity and finalization boundary proven
  here.
- Introduce proportionate browser-state tests when client behaviour grows beyond
  this small recovery path; do not add a browser framework solely to decorate
  the current spike with more machinery.
- Keep PTY descendant/background-process ownership as a separate Linux lifecycle
  investigation rather than leaking it back into generic session management.

## Provenance

- Spike brief: `spikes/004-session-backend-abstraction/spike.md`
- Archived original brief:
  `spikes/004-session-backend-abstraction/attempts/original-spike.md`
- Public evaluation requirements:
  `spikes/004-session-backend-abstraction/eval-requirements.md`
- Evaluated base commit: `c44b945e4de4cbe7e42e01e74e4f58be01eb7527`
- Final implementation commit: none; evaluation used uncommitted working-tree
  changes on the feature branch
- Final evaluation specification:
  `spikes/004-session-backend-abstraction/evaluation/eval-spec.md`
- Final evaluation result:
  `spikes/004-session-backend-abstraction/evaluation/eval-result.md`
- Promoted hidden-test manifest and tests:
  `spikes/004-session-backend-abstraction/evaluation/hidden-tests/`
- Visible implementation tests: `test/session-backend.integration.test.ts`,
  `test/session-lifecycle.integration.test.ts`
- Implementation: `src/index.ts`, `src/session-backend.ts`,
  `src/pty-backend.ts`, `public/client.js`
- Prior related outcome: `spikes/003-session-lifecycle/outcome.md`
- No ADR or separate code-review artifact was created.
