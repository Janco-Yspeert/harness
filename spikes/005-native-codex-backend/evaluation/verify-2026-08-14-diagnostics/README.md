# Spike 005 — verify diagnostics (2026-08-14)

This directory is **evaluator-repair/diagnostic material** produced while
running `/evaluator verify 005` against implementation commit
`38b581572fa27b0b63a0732c4063790e3d4ec320`
(`implementation/spike-005-native-codex-backend`). It is **not** part of the
frozen v1 evaluation contract, and it is **not promoted** — verification
result was `FAIL` (see `../eval-result.md`), and per the evaluator skill's own
promotion rules, evaluator artifacts are only promoted on `PASS`.

The frozen `../eval-spec.md` and `../.hidden-test/**` are **unchanged** —
left exactly as they were at freeze time (v1), preserved as historical
evidence of what was actually verified against. Nothing in this directory
was ever applied back onto those frozen files.

## Why this exists

Running the frozen v1 hidden-test suite against the real implementation
produced 14 failing cases out of 31. Investigating each one (see
`../eval-result.md` for the full account) found:

- **13 were evaluator defects** — bugs in the frozen v1 test code itself, not
  in the implementation. Four distinct root causes:
  1. `assert.equal(x, { ...objectLiteral })` under `node:assert/strict`
     performs reference equality on objects, not deep equality — always
     fails even when the actual value is exactly correct. (E8, E11, E12,
     E14, E17, E18)
  2. A bare `socket.close()` with no await, racing a subsequent reattach
     `connect()` against the close handshake actually completing
     server-side. (E18)
  3. `startAttachedCodexSession`'s `createBackend` closure is wired to a
     single `peer` for the lifetime of the host; a later retry
     (`createSession(host.url)` / `postJson` on the same host) tries to
     reuse that already-exited peer, whose `initialize` request can never be
     answered — deadlock. (E19, E21, E22)
  4. `await controller.attempt(n)` written *before* the request that would
     trigger the Nth factory invocation, deadlocking on a promise that can
     never resolve until the very code that's blocked on it runs.
     (E25, E26, E27, and — for `attempt(1)` specifically, not just
     `attempt(2)` — the same tests deadlocked immediately)
  3. A `initialize` request consumed via a bare `waitForRequest()` call and
     never responded to, then `autoHandshake()` separately waiting for a
     *second* `initialize` request that can never arrive. (E3)

  Every one of these, once fixed, passes cleanly and quickly against the
  real implementation — see `corrected-hidden-test/` and the individual
  `probes/diag-*` scripts that isolated each root cause before the fix was
  applied to the full suite.

- **1 (E24) had a fundamentally unfalsifiable oracle**, not merely a bug: the
  frozen v1 version simulated "backend cannot finalize" by having the peer
  ignore SIGTERM only. Any implementation that correctly escalates to
  SIGKILL after a SIGTERM timeout — the normal, correct way to build
  this — passes regardless of whether bounded-fallback failure is actually
  handled, because SIGKILL cannot be ignored by any process. Redesigning the
  oracle (`makeUnkillableAppServerProcess`, which intercepts `kill()` itself
  rather than relying on the child's cooperation) revealed a **genuine
  implementation gap**: `CodexBackend#terminateProcess()` awaits process exit
  after escalating to SIGKILL with **no further bound at all**, violating
  N10 ("Harness stop must not wait indefinitely for provider interruption;
  teardown must complete... within the configured grace period plus a
  bounded finalization allowance"). This is the sole `IMPLEMENTATION_FAILURE`
  reported in `../eval-result.md`.

## Contents

- **`corrected-hidden-test/`** — a full copy of the frozen v1
  `.hidden-test/**`, with the above fixes applied (search each changed file
  for `DIAGNOSTIC/EVALUATOR-REPAIR FIX` comments marking exactly what
  changed and why). Import paths adjusted for the extra directory depth.
  Self-checked and typechecked; 41/42 tests pass against the real
  implementation (only the genuine E24/N10 finding fails, cleanly, in
  ~10s). This is what a v2 freeze of the evaluation contract should be
  based on, once the implementation fix lands and this is re-verified.
- **`probes/`** — standalone, throwaway diagnostic scripts used to isolate
  each root cause before committing to a fix in `corrected-hidden-test/`.
  Not intended to be run as a suite; each is self-contained. Kept for
  provenance, per explicit instruction not to lose this evidence.

## What happens next

The implementation is being handed back to the implementor to fix the
`#terminateProcess()` unbounded-wait gap (N10) on the implementation branch,
committed separately. Re-running `/evaluator verify 005` afterward should:
reuse `corrected-hidden-test/` (promoting it to replace the frozen v1
`.hidden-test/**` as an explicit, deliberate revision — recorded in
`eval-spec.md`'s own revision history at that time, not silently), then
verify the fix against it.
