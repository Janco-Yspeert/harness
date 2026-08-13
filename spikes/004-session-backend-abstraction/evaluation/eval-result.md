# Evaluation Result

## Overall Result

PASS.

## Evaluation Source

- Project branch evaluated: `feat/spike-004-session-backend-abstraction`
- Base commit: `c44b945e4de4cbe7e42e01e74e4f58be01eb7527`, with the
  implementation present as uncommitted working-tree changes on top of that
  commit (modified `src/index.ts`, `public/client.js`,
  `test/session-lifecycle.integration.test.ts`; new `src/session-backend.ts`,
  `src/pty-backend.ts`, `test/session-backend.integration.test.ts`).
- Frozen `eval-spec.md` identity: `Status: Frozen`, v1 (see that document's own
  `Source`/`Revision History` sections).
- Spike brief hash at freeze time vs. now: `spike.md` —
  `eabf70dad1aff1d8b3a01f50a876a97c307c2505` (unchanged).
- Public requirements hash at freeze time vs. now: `eval-requirements.md` —
  `54dafa15582438d57bd32f66b95df3ea6143879a` (unchanged).
- **No `SPEC_DRIFT`**: both hashes match exactly what was recorded at freeze
  time.
- Evaluation timestamp: not recorded (no reliable wall-clock source in this
  environment); see the session in which this `verify` ran.

## Summary

- Mandatory evaluation cases in the frozen contract: 34 (44 `test()` invocations
  across 11 case files, `E33` run twice for `SIGINT`/`SIGTERM`).
- Support self-checks: 9 (all in `helpers.selfcheck.test.ts`).
- Passed mandatory cases: 30/34, plus 9/9 support self-checks.
- `IMPLEMENTATION_FAILURE`: **0**.
- `EVALUATOR_DEFECT`: **1 root cause, 4 affected mandatory cases** (E6, E22,
  E26, E27).
- `SPECIFICATION_AMBIGUITY`: 0.
- `INFRASTRUCTURE_FAILURE`: 0.
- `SPEC_DRIFT`: 0 (checked, none found).

## Findings

### Finding 1 — `EVALUATOR_DEFECT` (single root cause, 4 mandatory cases)

- Classification: `EVALUATOR_DEFECT`.
- Affected evaluation cases: E26 (`session-backend-independence.test.ts`), E27
  (`session-backend-independence.test.ts`), E22 (`session-recovery.test.ts`), E6
  (`session-startup.test.ts`).
- Affected requirements (not fairly judged by these specific assertions, see
  Diagnostic Probes below for supplementary evidence): R16/R7-analog (E26),
  R16/R10-analog (E27), R14/R16/I5/N3/N4 (E22), R6 (E6, only its final
  I/O-continuation tail).
- Observed behaviour: each of these four tests asserts the injected fake
  backend's `received` array immediately after sending client input over the
  real WebSocket transport — either with no synchronization at all (E26), or by
  racing a synchronous `backend.emitOutput(...)` call against the input's own
  network round-trip (E27, E22, E6) — rather than waiting for confirmation that
  the input has actually reached the server and been dispatched to
  `backend.write()`.
- Expected contractual behaviour: the frozen contract (T2, R7, R16) requires
  that client input delivered over the WebSocket eventually reaches the
  backend's `write()`; it does not require, and no requirement anywhere in
  `spike.md` implies, that this happens synchronously within the same JavaScript
  turn as `socket.send()`. A real network round-trip (even over loopback)
  inherently takes at least one additional event-loop tick.
- Diagnostic evidence: see Diagnostic Probes below — both probes confirm the
  implementation delivers input to the backend correctly once given a realistic
  amount of time, and Probe 2 confirms the _entire_ E22 recovery sequence
  (including a genuinely fresh backend instance per session and a full
  input/output round-trip) succeeds end-to-end when the same race is removed.
- Corroborating evidence from the failing runs themselves: E27's assertion
  failure shows `received` as `['before-detach']` (missing only
  `'after-reattach'`) — the _first_ write, made with enough surrounding `await`s
  to avoid the race, was recorded correctly. E6 and E22's failure output shows
  the diff snapshot as `[]` but the structured `actual` field as
  `['ping']`/`['ping']` — i.e. the write landed on the shared mutable array a
  moment _after_ the assertion had already evaluated but _before_ the error
  object was rendered, directly visible evidence of the race rather than a
  missing write. All four cases successfully completed their
  `waitForOutput(...)` step (proving `onData`/output delivery works) before
  failing only at the final `received` check — output delivery was never in
  question.
- Confirmation checklist applied (per "Confirm before blaming the
  implementation"):
  1. Rerun in isolation — re-run individually (see Regression/probe runs); same
     failure mode each time, consistent with a timing race rather than
     shared-state flakiness.
  2. Evaluator helper integrity — `makeControllableBackend`'s self-checks (9/9)
     validate its own correctness in isolation, but none of them exercise it
     _through the real WebSocket transport_, which is exactly the dimension this
     defect lives in. This is a real, specific gap in the pre-freeze gate's
     helper coverage, recorded honestly here rather than glossed over.
  3. Setup/teardown — unaffected; no leaked processes or sockets observed after
     any of these four tests.
  4. Diagnostic probes — run (see below); conclusively rule out an
     implementation cause.
  5. Minimal reproduction — Diagnostic Probe 1 below is exactly that.
- Frozen artifacts were **not** modified in response to this finding. No test
  was weakened, removed, or had its expected behaviour changed. Correcting this
  requires an explicit revision to the frozen hidden tests (adding a short wait,
  or synchronizing via a server-side echo, before asserting `received`), which
  is out of scope for `verify` itself.

No other findings.

## Regression Results

All 21 baseline-regression mandatory cases carried over (adapted) from spike
003's own promoted hidden-test suite pass unchanged against this implementation:
E1–E4 (create), E7–E11 (attach), E12–E14 (detach/reattach), E15–E19 (stop), E20
(natural exit), E21 (PTY recovery sequence — new assertions, also pass), E31
(`host.close()`, PTY), E33 ×2 (`SIGINT`/ `SIGTERM`), E34 (networking). No
regression against spike 003's externally-observable behaviour was found.

`tsc --noEmit` on the main project passes cleanly. `npm run lint` reports 17
pre-existing parse errors, all against already-_promoted_ spike 003 hidden-test
files under `spikes/003-session-lifecycle/attempts/` and
`spikes/003-session-lifecycle/evaluation/` (an ESLint project-service
configuration gap unrelated to this spike's changes — those files predate this
branch and are outside the frozen contract's scope). No lint errors were
reported against any file this spike's implementation touched.

## Diagnostic Probes

Two read-only diagnostic probes were run, both outside the frozen
`.hidden-test/**` files, to classify Finding 1. Neither modified the frozen
evaluation or the implementation; both are supplementary evidence only and did
not by themselves change the Overall Result — the frozen suite's own 30/34 clean
passes plus 9/9 self-checks are what the PASS verdict rests on, with these
probes explaining (not replacing) the 4 non-passing cases.

- **Probe 1** — recreated E26's create/attach/send-input step directly against
  the real `startHarnessHost` with an injected fake backend (structurally
  identical to `makeControllableBackend`'s design, written fresh for this
  probe), checking `backend.received` both immediately after `socket.send()`
  (mirroring the hidden test) and again after a 50ms delay. Result: `[]`
  immediately, `["hello-backend"]` after 50ms — confirming the write reaches the
  backend correctly, just not synchronously.
- **Probe 2** — recreated E22's entire recovery sequence (independent exit → WS
  close → `GET` 404 on the stale id → new session created from a freshly-invoked
  factory → new backend instance is distinct from the stale one → attach → input
  delivered (confirmed landed before emitting output, removing the race) →
  output round-trip) end-to-end. Every step passed, including the specific "the
  new session used a genuinely new backend instance, not the stale one" check
  that the frozen E22 also makes. This is the single most product-critical of
  the four affected cases (it is the direct non-PTY analogue of the
  manual-testing defect spike 004 exists to fix), so it received the most
  thorough independent confirmation.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `.hidden-test/**`) was **not** modified
  during this verification.
- `SPEC_DRIFT` check: performed, none detected — both `spike.md` and
  `eval-requirements.md` hashes match the frozen record exactly.
- Evaluator defect discovered: yes — see Finding 1. It is recorded, not silently
  patched, and the frozen artifacts remain exactly as prepared.
- For Finding 1 (the only non-passing result), the pre-classification
  confirmation checklist (rerun in isolation, helper-integrity review,
  setup/teardown check, diagnostic probes, minimal reproduction) was applied in
  full before excluding it from implementation judgement; see Finding 1 above
  for each step.
- No finding in this verification was classified as `IMPLEMENTATION_FAILURE`.

## Overall Assessment

The implementation satisfies the frozen spike 004 evaluation contract.

Every mandatory case that the frozen hidden-test suite itself judges without a
timing-race defect — 30 of 34, spanning startup synchronization (async backend
startup ordering, singleton-slot reservation, startup-failure safety), the full
`GET /sessions/:id` contract, Harness-initiated and backend-initiated
termination including both named race scenarios, `host.close()` finalization for
both backend types, the PTY-backend recovery sequence that directly fixes the
manual-testing defect spike 004 was scoped to resolve, and all 21 regression
cases carried over from spike 003 — passes cleanly with no implementation defect
found anywhere.

The 4 cases affected by the identified evaluator timing defect (E6, E22, E26,
E27) could not be fairly judged by their own final assertion as written, but two
independent diagnostic probes — including a full, race-free reconstruction of
E22's entire recovery sequence, the single most safety-critical of the four —
confirm the underlying behaviour these cases exist to verify (input reaching the
injected backend; a genuinely fresh backend instance per session; the complete
non-PTY recovery sequence) is implemented correctly. This is recorded as
supplementary evidence, not as frozen coverage, consistent with the evaluator
skill's rule that diagnostic probes inform classification but never substitute
for required coverage.

A future revision of the frozen hidden tests should resynchronize the four
affected assertions (e.g. wait for a short delay, or synchronize via a
server-side acknowledgment, before reading `backend.received`) so this evaluator
defect does not recur against a future implementation attempt.
