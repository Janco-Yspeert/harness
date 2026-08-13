# Evaluation Requirements

## Testability Requirements

Spike 004 itself requires "an explicit programmatic seam through which
independent tests can provide a backend implementation or backend factory"
(spike.md, "Backend construction and verification seam"; Success criterion 11).
The exact TypeScript shape of that seam is explicitly left unspecified by the
brief. Because evaluation is being prepared before implementation exists, the
hidden tests need one concrete shape to compile and run against. The shape below
is the evaluator's minimal choice, invented only because the spike mandates that
_some_ seam exist and leaves its shape open — it is not a preference about
internal architecture.

- **T1 — Construction seam.** The module that exports the host-construction
  entry point (currently `startHarnessHost` in `src/index.ts`) must accept an
  optional way to supply a backend factory, without changing the meaning of
  calling it with just a port, e.g. `startHarnessHost(0)` must keep working
  exactly as it does today (production PTY backend, no injection). Evaluator
  tests will call it as:

  ```ts
  startHarnessHost(port, { createBackend });
  ```

  where `createBackend` is a zero-argument factory,
  `() => SessionBackend | Promise<SessionBackend>`, invoked once per
  session-creation attempt. A rejected/thrown result from `createBackend` (or
  from whatever async step the implementation uses to start the backend) must be
  treated as backend startup failure per spike.md's "Startup failure" section.
  Reason: this is the only way hidden tests can drive the real `POST /sessions`
  → attach → input/output → stop lifecycle against a deliberately non-PTY,
  non-process backend through the actual Harness session-management path, as
  spike.md's "Non-PTY backend proof" section requires ("tests that only
  instantiate an isolated backend implementation are not sufficient by
  themselves"). Source: spike.md, "Backend construction and verification seam";
  Success criterion 11. Implementation impact: add one optional parameter to the
  existing construction entry point. Internal backend architecture, class names,
  and the _production_ PTY backend's own internal shape remain the
  implementation's choice.

- **T2 — Minimal backend contract.** An object returned (or resolved) by
  `createBackend` must support:

  ```ts
  interface SessionBackend {
    write(input: string): void;
    onData(listener: (output: string) => void): void;
    onExit(listener: () => void): void;
    stop(): void | Promise<void>;
  }
  ```

  - Harness registers at most one `onData` listener and one `onExit` listener
    per backend instance (no multi-listener fan-out is required).
  - `onExit`'s listener fires when the backend ends on its own, independent of
    an explicit `stop()` call.
  - `stop()` must be safe to call more than once and safe to call after the
    backend has already reported exit via `onExit` — i.e. idempotent from the
    caller's perspective. This lets Harness's generic termination handling stay
    simple regardless of which path (explicit stop vs. backend-initiated exit)
    occurred first, without the evaluator needing to assert which specific
    internal path the implementation chose.
  - This shape covers exactly spike.md's six enumerated "Required backend
    capabilities" (establish, input, output, detect independent end, explicit
    stop, finalize-on-end) and nothing beyond them — no structured events, no
    capability metadata, no multi-session concerns. Method names
    (`write`/`onData`/`onExit`) mirror the naming this project's own PTY
    integration already uses (`terminal.write`, `terminal.onData`,
    `terminal.onExit`) to minimize the chance of an unfair mismatch with a
    reasonable implementer's natural design, but the _production_ PTY backend is
    not required to literally implement this TypeScript interface internally —
    only the seam in T1 must be able to accept a `createBackend` factory whose
    result satisfies this shape and have Harness drive a full session lifecycle
    through it correctly. Source: spike.md, "Required backend capabilities";
    "Non-PTY backend proof"; "Backend termination and finalization"
    (finalization invariant). Implementation impact: whatever internal backend
    abstraction is designed, it must be reachable through an adapter conforming
    to this shape when constructed via `createBackend`.

## Evaluator Assumptions

- **A1 — Single-threaded ordering for concurrency cases.** Node's
  single-threaded event loop is relied on to make "exactly one winner" outcomes
  for concurrent `POST /sessions` (including during in-flight async backend
  startup) deterministically reproducible via `Promise.all(...)` without true
  OS-level parallelism. This mirrors the pattern already used by this project's
  own visible test (`test/session-lifecycle.integration.test.ts`, "serializes
  creation and rejects a second attachment"). Evaluation impact: concurrency
  cases assume requests are dispatched without an `await` between them from a
  single Node process; they do not attempt to prove behavior under genuine
  multi-process or multi-machine concurrency.
- **A2 — Session ID is opaque.** No particular ID format (e.g. UUID) is
  asserted, only uniqueness across issued IDs and non-empty string shape.
  Evaluation impact: an implementation may generate IDs however it likes.
- **A3 — Startup-failure cases use the injected backend, not the PTY backend.**
  Spike.md explicitly does not prescribe the HTTP status for a failed startup
  and does not require the PTY backend itself to be able to fail startup
  deterministically. Mandatory startup-failure coverage (singleton slot
  released, no active session left behind, later creation succeeds) will
  exercise this exclusively through a `createBackend` factory that deliberately
  rejects/throws, not by trying to force a real `node-pty`/Bash spawn failure.
  Evaluation impact: no case asserts a specific status code for the failed
  `POST /sessions` response itself.
- **A4 — WebSocket upgrade-rejection detection.** Rejected upgrades (`404`/`409`
  before `101`) are observed via the `ws` client library's `unexpected-response`
  event, the same pattern already used in this project's own visible test.
  Evaluation impact: none beyond confirming the existing detection mechanism
  continues to apply; no new upgrade-rejection behavior is introduced by this
  spike.
- **A5 — "Close together" termination races are approximated, not simulated with
  true concurrency.** Spike.md's termination-race scenarios (e.g. "Harness
  initiates stop → backend reports termination" and "backend reports termination
  → client concurrently requests DELETE") will be exercised by triggering the
  two events within the same tick or with a minimal explicit delay, consistent
  with A1's single-threaded model. Evaluation impact: cases check for absence of
  duplicate finalization, uncaught errors, leaked slots, or stale state — they
  do not assert one specific outcome for whichever response happens to "lose" an
  inherently racy request (e.g. the exact status code returned to a `DELETE`
  that arrives essentially simultaneously with backend-initiated exit is not
  prescribed by spike.md and is not asserted).
- **A6 — Browser-side (client-JS) stale-ID state transitions are verified
  manually, not by an automated hidden test.** Spike.md permits this explicitly
  when the repository lacks "a proportionate mechanism for automated
  browser/client-state testing" ("Bash/backend exit recovery"). This repository
  currently has no DOM or browser-automation test dependency (`package.json` has
  none). Evaluation impact: the browser's own `public/client.js` logic for
  discarding a stale session ID after a `404` from `GET /sessions/:id` (vs.
  retaining it on `200` or on a failed HTTP request) is **not** covered by a
  mandatory automated hidden test; it will be assessed by manual verification
  and/or code inspection at `verify` time. This does **not** reduce the
  mandatory, fully automated coverage of: the host-side `GET /sessions/:id`
  `200`/`404` contract itself, or the complete server-observable recovery
  sequence spike.md lists under "Bash/backend exit recovery" (create → attach →
  backend terminates independently → original session becomes stale → new
  session created → attached → input/output exchanged) — both of these are
  exercised entirely over HTTP/WebSocket and require no browser.

## Blocking Questions

None. Every ambiguity encountered while deriving the evaluation model was
resolvable either because spike.md explicitly declines to prescribe the detail
(e.g. exact failed-startup status code — see A3) or via a narrow, disclosed
testability requirement (T1/T2) or evaluator assumption (above).

## Environment Requirements

- Node.js `>=24.12.0` (already required by `package.json`), used both for
  running the implementation and for executing hidden tests directly via
  `node --test <path>` against `.ts` sources (no separate transpile step;
  confirmed working against this project's Node version).
- No external services, network access, or additional environment variables are
  required beyond what already exists. The `PORT` environment variable override
  on the CLI entrypoint (used by the existing SIGINT/SIGTERM regression
  coverage) is already established behavior from spike 003 and is reused as-is —
  this spike introduces no new environment-variable requirement.
- Hidden tests run against `127.0.0.1`-bound instances only, consistent with the
  project's localhost-only posture.
