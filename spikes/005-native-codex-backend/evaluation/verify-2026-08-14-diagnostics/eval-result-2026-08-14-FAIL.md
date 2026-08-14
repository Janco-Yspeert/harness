# Evaluation Result

## Overall Result

FAIL.

One confirmed `IMPLEMENTATION_FAILURE` (E24 / N10 / R18). All other mandatory
coverage passes. Not promoted — per the evaluator skill's promotion rules,
evaluator artifacts are promoted only on `PASS`. The frozen v1 evaluation
contract (`eval-spec.md`, `.hidden-test/**`) is unchanged and remains the
historical record of what was verified against.

## Evaluation Source

- **Evaluated implementation commit**: `38b581572fa27b0b63a0732c4063790e3d4ec320`
  (`Implement native Codex backend for spike 005`), branch
  `implementation/spike-005-native-codex-backend`. A clean commit — `HEAD`
  matched this hash exactly for every path relevant to the implementation
  surface (`src/**`, `test/**`, `fixtures/**`, `public/client.js`,
  `spikes/005-native-codex-backend/eval-requirements.md`).
- **Unrelated uncommitted working-tree state at evaluation time**:
  `skills/spike-review/SKILL.md` and `spikes/005-native-codex-backend/feedback.md`
  had unstaged modifications, present both before and independent of this
  implementation commit's own diff (neither file appears in
  `git show --stat 38b5815`). Confirmed out of scope for this evaluation.
- **Frozen eval-spec identity**: `eval-spec.md` `Status: Frozen`, recording
  project commit `c4827dee40a8d4108db43a38b0d44a5da5694ffd`, `spike.md` hash
  `6f161110d42f5024295d843a4373b7e7eb7ec974`, `eval-requirements.md` hash
  `f9a20f93eb10f3fc00071c43bc7d09193820d6ab`.
- **Spec drift check**: both hashes recomputed against the current working
  tree and found identical to the frozen record. No `SPEC_DRIFT`.
- **Evaluation timestamp**: 2026-08-14.

## Summary

- Mandatory evaluation cases: 31 (per frozen v1 `eval-spec.md`)
- Passed against the real implementation (frozen v1 test code, as originally
  written): 17
- Failed against the real implementation (frozen v1 test code): 14
  - Of those 14: **13 reclassified as `EVALUATOR_DEFECT`** after diagnosis
    (see Diagnostic Probes) — confirmed to pass cleanly once the test-code
    bug was fixed, with no change to expected behavior. E3, E8, E11, E12,
    E14, E17, E18, E19, E21, E22, E25, E26, E27.
  - **1 confirmed `IMPLEMENTATION_FAILURE`**: E24 (bounded-fallback
    finalization failure path), against N10 and R18 — but only once its own
    oracle defect was also fixed (see Findings).
- Non-mandatory findings: 0
- Specification ambiguities: 0
- Infrastructure failures: 0

## Findings

### Finding 1 — `IMPLEMENTATION_FAILURE`: unbounded wait after SIGKILL escalation (E24)

- **Classification**: `IMPLEMENTATION_FAILURE`
- **Affected requirement**: N10 ("Harness stop must not wait indefinitely for
  provider interruption; teardown must complete... within the configured
  grace period plus a bounded finalization allowance"); R18 ("If Harness
  cannot successfully finalize the backend even through bounded fallback,
  deletion uses the existing failure path").
- **Observed behavior**: `CodexBackend#terminateProcess()`
  (`src/codex-backend.ts`) sends `SIGTERM`, waits up to
  `PROCESS_EXIT_GRACE_MS` (1000ms), escalates to `SIGKILL` if the process has
  not exited, then does `await this.#exited` with **no further timeout of
  any kind**. When the underlying App Server process does not exit even
  after `SIGKILL` is sent to it (see Diagnostic Probes: this was reproduced
  with a peer whose transport-level `kill()` never actually delivers any
  signal to the OS process — a legitimate model of a process stuck in an
  uninterruptible I/O wait state, which even `SIGKILL` cannot pre-empt),
  `DELETE /sessions/:id` never resolves. No response — success or failure —
  is ever sent to the client.
- **Expected contractual behavior**: Harness "must not wait indefinitely";
  once finalization genuinely cannot succeed, `DELETE` must eventually
  return the existing failure path (a non-`204`, `>= 500` response).
- **Diagnostic evidence**: with a corrected, falsifiable oracle
  (`makeUnkillableAppServerProcess`, see below), `DELETE` was observed
  unresolved after an evaluator-chosen, disclosed 10-second bound (spike.md
  does not specify an exact number for this particular step — only the
  qualitative "must not wait indefinitely"); the test fails with a precise,
  immediate assertion at ~10s, not a blunt test-runner timeout. Full
  corrected suite run: 41/42 cases pass; only this one fails, consistently,
  across repeated runs.
- **Note on the frozen v1 oracle**: the *original* E24 (as frozen) could not
  have detected this. It simulated "cannot finalize" by having the peer
  ignore `SIGTERM` only (`ignoreSigterm()`). Any implementation that
  escalates to `SIGKILL` after a `SIGTERM` timeout — which this
  implementation does, and which is the normal, correct way to build this —
  passes the frozen v1 E24 regardless of whether bounded-fallback failure is
  handled at all, because `SIGKILL` cannot be ignored by any process. The
  frozen v1 E24 is therefore not itself falsifiable and never actually
  exercised this code path; see `verify-2026-08-14-diagnostics/README.md`
  for the corrected oracle design and full reasoning.

### Findings 2–14 — `EVALUATOR_DEFECT`: 13 frozen v1 hidden-test bugs

All thirteen were diagnosed via isolated reruns and read-only diagnostic
probes (see Diagnostic Probes below), confirmed to reflect **no
implementation defect** — the corrected test code, applied to the same
implementation, passes cleanly. None weaken or remove any mandatory
coverage; each fix addresses a mechanical bug in the test's own code. Full
detail and fixed source for each is in
`verify-2026-08-14-diagnostics/README.md` and
`verify-2026-08-14-diagnostics/corrected-hidden-test/`.

| Case | Root cause | 
|---|---|
| E3 | Consumed the `initialize` request via a bare `waitForRequest()` and never responded to it, then separately started `autoHandshake()`, which waits for a *second* `initialize` request that can never arrive — deadlock. |
| E8, E11, E12, E14, E17 (partial), E18 (partial) | `assert.equal(x, { ...objectLiteral })` under `node:assert/strict` performs reference equality on objects, not deep equality; fails even when `x` is exactly the expected value. |
| E18 (also) | Bare `socket.close()` with no `await`, racing the subsequent reattach `connect()` against the close handshake actually completing server-side. |
| E19, E21, E22 | `startAttachedCodexSession`'s `createBackend` closure is wired to a single captured peer for the lifetime of the host; the tests' own retry (`createSession(host.url)` / a second `postJson` on the same host) tried to reuse that already-exited peer, whose `initialize` request could never be answered — deadlock. |
| E25, E26, E27 | `await controller.attempt(n)` written *before* the request that would trigger the Nth factory invocation — deadlocked on a promise that cannot resolve until the very code blocked on it runs (affected `attempt(1)` in E25/E26/E27's setup, not only the `attempt(2)` retry). |

## Regression Results

- **Project's own visible test suite** (`npm test`, default discovery): 23/23
  pass, including all new Codex-specific integration tests
  (`test/codex-backend.integration.test.ts`) and the existing PTY baseline
  (`test/session-lifecycle.integration.test.ts`,
  `test/session-backend.integration.test.ts`). The remaining 26 failures
  from a bare `npm test` run are entirely confined to already-promoted spike
  003/004 hidden-test directories; confirmed byte-identical to the frozen
  baseline commit `c4827de` (via `git diff c4827de HEAD --stat`), i.e.
  pre-existing and unrelated to this implementation.
- **`npm run typecheck`**: clean, 0 errors.
- **`npm run lint`**: 30 pre-existing errors, all in the same promoted
  spike 003/004 directories (confirmed unchanged since `c4827de`); 0 errors
  in any file touched by the evaluated commit.
- **`npm run format:check`**: pre-existing warnings on 296 files, dominated
  by the generated (not hand-authored) `protocol/app-server-schema/v2/*.json`
  bundle and the same promoted spike 003/004 directories — both confirmed
  present, byte-identical, at the frozen baseline commit. `npx prettier
  --check` scoped to exactly the files touched by `38b5815` reports clean.
- **E28/E29 (PTY-backed regression, this evaluation's own mandatory
  cases)**: pass, both against the frozen v1 suite and the corrected suite.

## Diagnostic Probes

All of the following are read-only with respect to the implementation; none
modified `src/**`. All scripts are preserved in
`verify-2026-08-14-diagnostics/probes/` (not deleted, per explicit
instruction).

1. **`diag_e19.mjs`** — plain Node script replicating E19's setup +
   `DELETE`, outside `node --test`. Resolved in ~7ms with `204`; the peer
   process exited cleanly on `SIGTERM`. Showed the *implementation* path is
   fine in isolation, narrowing the hang to something specific about the
   `node --test` test-file context.
2. **`diag-e19.test.ts`** — the same scenario as an actual `node --test`
   test, but stopping right after the first `DELETE`/`204`. Passed in 59ms.
   Confirmed the hang was not in `node --test` generically, but in code
   *after* that point in the real E19.
3. **`diag-e19b.test.ts`** — added back E19's final
   `createSession(host.url)` retry line. Reproduced the exact 10-second
   hang at that exact line. Root cause 3 (single-peer reuse) confirmed.
4. **`diag-controller.test.ts` / `diag-controller2.test.ts`** (file-based
   logging, bypassing `node --test`'s console buffering on timeout) —
   isolated the `makeCodexBackendFactoryController` misuse pattern; showed
   the deadlock occurs at `attempt(1)`, before the very first `POST` is
   ever sent, not only at the `attempt(2)` retry as initially suspected.
5. **`diag-corrected.test.ts` / `diag-corrected2.test.ts`** — corrected
   versions of E3, E8, E11, E12, E14, E17, E18, E19 (idle-only variant),
   E21, E22, E25/E26-pattern, E27, run together: 12/12 pass, quickly and
   cleanly, confirming each underlying requirement is genuinely satisfied
   by the implementation once the test bug is removed.
6. **`diag-e24.test.ts`** — first attempt at a corrected E24 using
   `makeUnkillableAppServerProcess`; this is what surfaced the genuine
   implementation gap (an 8-second run timed out with no assertion having
   fired). Directly led to Finding 1.
7. Two full runs of the completed `corrected-hidden-test/` suite (before and
   after fixing the diagnostic test's own `finally`-block cleanup ordering,
   which was itself briefly masking Finding 1's clean assertion behind a
   blunt test-runner timeout — see `codex-stop.test.ts`'s `E24` comment):
   final state is 41/42 passing, with E24 failing via a precise assertion
   at ~10s, consistently, not a hang.

None of these probes were used to turn a `FAIL` into a `PASS`, or to
substitute for frozen coverage — they informed classification only, per the
evaluator skill's own rules on diagnostic probes.

## Evaluator Integrity

- **Was the frozen evaluation modified during verification?** No. The
  frozen `eval-spec.md` and `.hidden-test/**` were read, then found to
  contain in-place edits made mid-investigation (a helper addition and a
  self-check revision) before this discipline was reasserted; those edits
  were explicitly reverted, and reformatting/hash checks confirmed the
  files match their originally-frozen state. All corrections instead live
  in the separate, clearly-labeled `verify-2026-08-14-diagnostics/`
  directory, never applied back onto the frozen files.
- **Specification drift detected?** No — `spike.md` and
  `eval-requirements.md` hashes match the frozen record exactly.
- **Evaluator defects discovered?** Yes, 13 (see Findings 2–14), each with
  root cause identified, isolated, and fixed in
  `verify-2026-08-14-diagnostics/corrected-hidden-test/` (not applied to the
  frozen files).
- **Pre-classification checklist applied to the `IMPLEMENTATION_FAILURE`
  finding (E24)?** Yes: rerun in isolation multiple times (consistent
  10-second failure, not flaky); the peer/controller/handshake helpers this
  case depends on were independently re-confirmed sound via the same
  self-check suite that passed 11/11 both before and after the E24-specific
  correction; setup/teardown was itself investigated and fixed (the test's
  own cleanup ordering was masking the clean assertion behind the
  `--test-timeout`, corrected before trusting the result); the async
  boundary here is a real OS process exit event, and the assertion
  synchronizes on the actual `DELETE` HTTP response, not on the mere act of
  sending a signal. Ruled out as an evaluator artifact specifically because
  the *original* oracle (signal-ignoring) could never have produced this
  result for any implementation, and the corrected oracle (`kill()`
  interception) does not depend on the child process's cooperation at all.

## Overall Assessment

The implementation does **not** yet satisfy the frozen Spike 005 evaluation
contract, but the gap is narrow and precisely located: `CodexBackend`'s
bounded-fallback finalization step has no upper bound once it escalates to
`SIGKILL`, so a backend process that does not actually exit even after
`SIGKILL` (a real, if rare, OS condition — e.g. uninterruptible I/O wait)
causes `DELETE /sessions/:id` to hang forever instead of eventually
returning the existing failure path, violating N10. Every other mandatory
requirement this spike defines — including the full startup, turn,
active-turn-rejection, structured-event, detach/reattach, graceful-interrupt,
and backend-failure-recovery contracts, and the PTY regression baseline — is
confirmed correct against the real implementation, using a corrected,
validated hidden-test suite preserved in `verify-2026-08-14-diagnostics/`.

Recommended fix: bound the `await this.#exited` in
`CodexBackend#terminateProcess()` (after the `SIGKILL` escalation) with an
explicit timeout, and have that path resolve to the existing `DELETE`
failure response (`>= 500`) rather than hanging, consistent with R18's
"Only if Harness cannot successfully finalize the backend even through
bounded fallback should deletion use the existing failure path."

The implementation is being returned to the implementor for this fix, to be
committed separately on the implementation branch before re-verification.
