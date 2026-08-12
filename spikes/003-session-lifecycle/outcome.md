# Spike 003: Session Lifecycle — Outcome

## Result

**PASS.** The session-lifecycle implementation was completed at commit
`839c5114a01bb2014ef0c3da7765c6560f33c9df`. The second, final frozen evaluation
passed all 21 mandatory cases (22 invocations) and all three evaluator-helper
self-checks. The implementation and promoted historical artifacts were later
collected on the feature branch at `ccd098e`.

No separate formal code-review artifact was produced for this spike. The
implementation was reassessed against the amended brief after evaluation, and
two weak visible-test oracles were strengthened before the final artifact
commit.

## What Was Proven

Harness can own the lifetime of an in-memory Bash/PTY session independently of
the lifetime of a connected client. A client can create a session, attach,
interact with Bash, disconnect without ending the work, and later reattach to
the same shell with its process identity and shell state intact.

Evaluation confirmed the externally observable lifecycle boundaries:

- session IDs remain stable while active and are not reused by the host;
- concurrent creation and attachment attempts produce one winner without
  disturbing the existing session or client;
- unknown and stopped IDs are rejected at the HTTP WebSocket-upgrade boundary;
- explicit stop and natural Bash exit invalidate the session, close an attached
  client, and release the active-session slot;
- programmatic shutdown, `SIGINT`, and `SIGTERM` terminate the directly owned
  Bash process before the host exits;
- the daemon remains bound to `127.0.0.1`.

The spike established the host/session/client ownership boundary for the PTY
fallback. It did not establish multi-session supervision, persistence, output
replay, semantic agent state, or comprehensive descendant-process cleanup.

## Implementation Summary

The host now maintains one optional in-memory session record containing an
opaque UUID, the `node-pty` terminal, its exit lifecycle, the current WebSocket
attachment, and stop state. `POST /sessions` creates the record synchronously,
which serializes competing requests in the Node event loop. WebSocket upgrades
reserve the attachment before completing the upgrade so two clients cannot both
win.

WebSocket closure clears only the attachment. Explicit deletion owns terminal
shutdown, waits for Bash to exit, invalidates the session, and only then returns
`204`. Natural terminal exit follows the same observable invalidation path. Host
shutdown calls the same stop operation before closing its servers. Cleanup
signals Bash and its current process group, with escalation to `SIGKILL` if it
does not exit promptly; it does not discover processes that moved into other
process groups.

The CLI accepts `PORT` for isolated real-process testing while retaining the
existing default. The development browser exposes create, attach, disconnect,
reattach, stop, session-ID, and attachment-state controls. No new dependency or
general session framework was introduced.

## Evaluation Outcome

The final independent evaluation passed all mandatory requirements, derived
invariants, and negative requirements. Coverage included creation and ID
uniqueness, concurrent requests, bidirectional PTY traffic, upgrade-level
rejections, attachment isolation, detach/reattach state, absence of detached
output replay, explicit and natural termination, all supported shutdown paths,
and localhost-only binding.

The frozen hidden suite reported 25/25 passing tests: 22 mandatory-case
invocations plus three helper self-checks. Type checking, linting, and the four
visible integration tests also passed. Repository-wide formatting remained
non-clean only because two archived attempt-001 files were deliberately
preserved byte-for-byte; the final evaluation classified this as historical
archival state rather than a product regression.

The evaluation deliberately did not judge cleanup of background or descendant
processes that moved into separate process groups. It also left the observable
interleaving of session creation during an in-flight DELETE unspecified.

## Evaluation History

The first frozen evaluation returned **BLOCKED**, not FAIL. It found no
confirmed implementation failure, but could not produce a trustworthy verdict
because of three evaluator defects and one specification ambiguity:

- a shared WebSocket-rejection helper removed its error listener before
  terminating a connecting socket, causing several mandatory cases to crash;
- a PTY assertion matched echoed command text instead of executed command
  output;
- an output-replay test could be satisfied by Bash job-control noise and was
  therefore unfalsifiable;
- the cleanup contract did not clearly say whether background jobs in their own
  Unix process groups had to be terminated.

Read-only diagnostics supported the implementation's rejection and natural-exit
behaviour, but correctly did not substitute for frozen mandatory cases or turn
the result into PASS.

Before the second prepare run, the brief was deliberately narrowed to defer
cleanup of descendants in separate process groups. The evaluator skill was
hardened with a pre-freeze integrity gate, oracle and falsifiability review,
runtime-assumption validation, failure-confirmation rules, diagnostic-probe
boundaries, and skill provenance. The hidden suite was rebuilt with independent
helper self-checks and echo-safe output markers. The second frozen evaluation
then passed without diagnostic probes or evaluator findings.

## Decisions Made

- **Separate session and client lifetimes.** WebSocket detachment does not own
  or terminate session work. This is a durable product and architectural
  boundary, not merely a spike convenience.
- **Keep a single active session and attachment for this spike.** This was a
  spike-local constraint used to prove lifecycle semantics without prematurely
  building multi-session infrastructure. It is not the intended long-term
  Harness cardinality.
- **Use explicit opaque IDs and ID-addressed routes.** Even with one active
  session, public operations identify a session rather than relying on an
  implicit singleton. This leaves the contract able to evolve.
- **Limit the cleanup guarantee.** Spike 003 guarantees termination of the
  directly owned PTY/Bash process and closure of the attached client.
  Discovering and terminating descendants that escape into other process groups
  is explicitly deferred rather than being silently inferred from vague
  “process-group cleanup” language.
- **Preserve failed evaluation attempts.** The blocked attempt was archived as
  historical evidence rather than overwritten by the successful run. This is a
  workflow decision intended to remain durable.

## Discoveries

- Interactive Bash job control places background jobs into process groups
  distinct from Bash's process group. Signalling `-bashPid` therefore does not
  imply comprehensive descendant cleanup.
- PTYs echo typed commands, so a marker present contiguously in input can make a
  naive regex report success before the command executes.
- Interactive Bash may print completed background-job source text later. That
  noise can make a stale-output assertion pass or fail for the wrong reason.
- A small shared evaluator helper can invalidate several otherwise independent
  mandatory cases. Shared test machinery needs its own integrity checks, but
  those checks are infrastructure rather than contractual coverage.
- The evaluator's classification boundary worked better than its initial test
  design: it refused to blame the implementation when its evidence was
  unreliable. That prevented a false implementation failure, but the defects
  should have been caught during prepare rather than verify.

## Deferred Concerns

- **Descendant process cleanup.** Jobs that move into separate process groups or
  otherwise detach may survive session shutdown. This was excluded because a
  reliable ownership mechanism requires separate lifecycle design; it matters
  before Harness supervises arbitrary long-running commands remotely.
- **Multiple sessions and attachments.** The in-memory singleton proves the
  boundary but not concurrency or isolation across several sessions. Harness's
  product goals require that later.
- **State and output recovery.** Detached output is intentionally discarded and
  sessions do not survive host restart. Remote supervision will eventually need
  explicit decisions about history, resynchronization, and persistence.
- **Cleanup interleavings.** The contract does not define what a concurrent
  `POST /sessions` should observe while DELETE cleanup is still in flight. The
  post-`204` state is defined; the intermediate state is not.
- **Development-only trust boundary.** Localhost-only binding avoids public
  exposure but provides no authentication against other local processes. This
  remains acceptable only for the current development slice.

## AI-Development Process Findings

The first real use of the evaluator workflow exposed concrete weaknesses rather
than merely theoretical ones. Prepare validated that the harness ran, but did
not adequately validate shared helpers, noisy PTY oracles, falsifiability, or a
material Unix process-group assumption. Consequently, verify discovered problems
that should have prevented freeze.

The evaluator still made the correct verification decision: it classified the
run as BLOCKED, separated evaluator defects from specification ambiguity, left
the frozen artifacts unchanged, and used diagnostics only as supplementary
evidence. That was useful damage containment, not proof that preparation was
good enough.

The workflow was strengthened in response. New evaluation preparation records
skill provenance, validates shared machinery independently, reviews mandatory
oracles for false signals, and empirically checks material runtime assumptions.
Verification now requires confirmation before attributing a failure to the
implementation. The successful second run showed that these safeguards were
practical for this spike without requiring a custom evaluator framework.

The implementation-side visible tests had analogous weak PTY markers. They were
changed to construct expected output from separate shell arguments, making the
full marker absent from echoed input. The generic test filename was also renamed
to `session-lifecycle.integration.test.ts`, describing enduring behaviour rather
than development chronology.

## Recommended Follow-ups

- Run a focused future spike on Linux process ownership and descendant cleanup
  before claiming that stopping a Harness session terminates all work it
  started.
- Introduce multi-session lifecycle and isolation only when the next product
  slice requires it; preserve the ID-addressed API and client/session lifetime
  separation established here.
- Decide explicitly whether detached output should be discarded, buffered, or
  represented as structured agent events before building remote history or
  reconnection semantics.
- Define concurrent create/delete behaviour if clients will issue lifecycle
  operations concurrently in a later multi-session design.
- Keep evaluator helper self-checks and echo-safe marker controls for future PTY
  evaluations; do not count them as product coverage.
- Exclude or otherwise account for immutable historical evaluation archives in
  repository formatting policy so faithful archival records do not permanently
  make the aggregate format check red.

## Provenance

- Spike brief: `spikes/003-session-lifecycle/spike.md`
- Public evaluation requirements:
  `spikes/003-session-lifecycle/eval-requirements.md`
- Final implementation commit: `839c5114a01bb2014ef0c3da7765c6560f33c9df`
- Final artifact commit: `ccd098e`
- Final evaluation specification:
  `spikes/003-session-lifecycle/evaluation/eval-spec.md`
- Final evaluation result:
  `spikes/003-session-lifecycle/evaluation/eval-result.md`
- Final hidden-test manifest and promoted tests:
  `spikes/003-session-lifecycle/evaluation/hidden-tests/`
- Archived blocked attempt: `spikes/003-session-lifecycle/attempts/001-Blocked/`
- Visible integration tests: `test/session-lifecycle.integration.test.ts`
- Implementation: `src/index.ts`, `public/client.js`, `public/index.html`
- No ADR or separate formal code-review artifact was created for this spike.
