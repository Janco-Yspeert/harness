# Evaluation Requirements

## Testability Requirements

Spike 004's construction seam — `startHarnessHost(port, { createBackend })`,
where `createBackend` is a zero-argument factory
`() => SessionBackend | Promise<SessionBackend>` — is already implemented in
`src/index.ts` and is reused unchanged. It is not repeated here as a new
requirement.

Spike 005 itself requires "a normal programmatic seam through which evaluator
tests can substitute the real App Server process/peer with a deterministic
protocol peer or equivalent controlled test double" that "exercise[s] the actual
asynchronous transport/framing path used by the Codex backend, not merely call
backend callbacks directly" (spike.md, "Provider protocol verification seam").
The exact shape is explicitly left unspecified. Because evaluation is being
prepared before implementation exists, the hidden tests need one concrete shape
to compile and run against. The shapes below are the evaluator's minimal
invention, made only because the spike mandates that _some_ seam exist and
leaves its shape open — they are not a preference about internal Codex-backend
architecture.

- **T1 — Codex backend construction entry point.** A module at
  `src/codex-backend.ts` must export a function

  ```ts
  export function createCodexBackend(
    options?: CodexBackendOptions,
  ): Promise<SessionBackend>;
  ```

  usable directly as a `createBackend` factory:
  `startHarnessHost(port, { createBackend: () => createCodexBackend(options) })`.
  The returned promise resolves only once the Codex backend and its thread are
  ready for use (App Server initialized, thread created), consistent with
  spike.md's "Backend startup" ordering, and rejects if startup fails. Reason:
  this is the only way hidden tests can drive the real `POST /sessions` → attach
  → turn → stop lifecycle against a real, asynchronous, process-backed Codex
  backend through the actual Harness session-management path, exactly as
  spike.md's "Provider protocol verification seam" requires. Source: spike.md,
  "Provider protocol verification seam"; "Runtime backend selection"; Success
  criterion 20. Implementation impact: add one new module exporting one new
  function; how `CodexBackend` is internally structured, and whatever
  `SessionBackend`-shaped (or evolved) object it resolves to, remain the
  implementation's choice — see "Do not preserve false abstraction" in spike.md,
  which this evaluator takes at face value: no particular
  `write`/`onData`/`onExit`/`stop` shape is required for the Codex backend
  beyond satisfying whatever interface Harness's own session management ends up
  using. Every mandatory evaluation case in this spec exercises Codex-backed
  sessions only through the public HTTP/WebSocket surface, never through the
  resolved backend object directly.

- **T2 — App Server process construction override.** `CodexBackendOptions` must
  include an optional field

  ```ts
  interface CodexBackendOptions {
    cwd?: string;
    spawnAppServer?: () => AppServerProcess;
    interruptGraceMs?: number; // see T3
  }

  interface AppServerProcess {
    readonly stdin: NodeJS.WritableStream;
    readonly stdout: NodeJS.ReadableStream;
    readonly stderr?: NodeJS.ReadableStream;
    readonly pid?: number;
    on(
      event: "exit",
      listener: (code: number | null, signal: NodeJS.Signals | null) => void,
    ): unknown;
    kill(signal?: NodeJS.Signals | number): boolean;
  }
  ```

  When omitted, `spawnAppServer` defaults to spawning the real local
  `codex app-server --stdio` process (the "normal runtime path" spike.md
  requires — "Runtime backend selection"). When supplied, the Codex backend must
  use exactly the process object `spawnAppServer()` returns as its App Server
  transport — writing JSON-RPC request/notification lines to its `stdin` and
  reading response/notification lines from its `stdout` — rather than spawning
  its own process. Reason: this lets hidden tests substitute a real,
  separately-spawned Node child process speaking the real, empirically-confirmed
  newline-delimited-JSON App Server wire protocol (see Environment Requirements)
  in place of the real `codex` binary, so the Codex-backend implementation under
  test still exercises genuine OS process spawning, real stdio pipes, and real
  asynchronous framing — it merely talks to a deterministic peer process instead
  of the real provider. This directly satisfies spike.md's explicit instruction
  that the seam "exercise the actual asynchronous transport/framing path ... not
  merely call backend callbacks directly," which follows from evaluator defects
  discovered in prior spikes (helper correctness in isolation being insufficient
  when the production path crosses an asynchronous transport boundary). Source:
  spike.md, "Provider protocol verification seam," explicit; "Transport."
  Implementation impact: the Codex backend's own process-spawning call must be
  reachable through this one injection point; how it frames/parses the protocol
  internally, and any additional fields it reads off the spawned process, are
  unconstrained.

- **T3 — Interrupt grace-period override.**
  `CodexBackendOptions.interruptGraceMs` (shown above), when supplied, overrides
  the "maximum five-second grace period" spike.md defines for graceful
  `turn/interrupt` completion before bounded fallback teardown is permitted
  ("Turn interruption and Harness stop," "Active turn: bounded fallback"). When
  omitted, the implementation must use a default of 5000ms. Reason: spike.md's
  own "Evaluation discipline" section requires that "timeout/fallback tests ...
  control time deterministically where practical rather than sleeping for real
  five-second interval throughout the suite." Making the bound overridable lets
  most fallback-mechanism cases run in milliseconds; one dedicated case (see
  eval-spec's Limitations) still verifies the undisclosed real default is
  materially close to five seconds, run once. Source: spike.md, "Active turn:
  bounded fallback," explicit five-second bound; "Evaluation discipline."
  Implementation impact: the bounded-fallback timer's duration must be
  parameterized by this one option instead of a hardcoded literal; the fallback
  teardown mechanism itself is otherwise unconstrained.

## Evaluator Assumptions

- **A1 — WebSocket frame ordering.** Two `input` messages sent back-to-back over
  the same, already-open WebSocket connection are delivered to and processed by
  the server in the order they were sent (standard WebSocket/TCP in-order
  delivery on a single connection — not a Harness-specific or Node-event-loop
  assumption). Evaluation impact: active-turn input-rejection cases send a
  second `input` message immediately after the first without waiting for the
  first turn to resolve, and rely on the server observing them in send order; no
  artificial concurrency (e.g. `Promise.all`) is needed for this specific race,
  unlike Spike 004's singleton-slot cases.
- **A2 — App Server newline-delimited JSON-RPC framing.** The real local
  `codex app-server --stdio` process (Codex CLI `codex-cli 0.147.0`, matching
  the frozen schema baseline in `protocol/README.md`) frames every JSON-RPC
  message as one complete JSON object per line, terminated by `\n`, in both
  directions over stdio — not `Content-Length`-header-prefixed framing.
  Empirically confirmed against the real installed binary before relying on it
  in the deterministic peer (see eval-spec's Pre-Freeze Integrity Gate).
  Evaluation impact: the deterministic App Server peer used by hidden tests
  emits and expects this exact framing; a Codex-backend implementation that
  assumed different framing would fail every mandatory Codex-backed case, not
  merely appear to work by accident.
- **A3 — Session ID and thread ID are opaque strings.** No particular format is
  asserted for the Harness session UUID or (indirectly, through the fake peer)
  the Codex thread ID; only that they are non-empty strings and that the Harness
  session ID is never equal to the thread ID or any provider-issued identifier
  the fake peer generates. Evaluation impact: mirrors Spike 004's A2, extended
  to the provider-identity distinction spike.md requires ("A Harness session is
  not a Codex thread ID").
- **A4 — Startup-failure and turn-failure cases use the deterministic App Server
  peer, not the real `codex` binary.** Mandatory coverage of failed App Server
  startup/initialization, failed thread creation, and recoverable `turn/start`
  failure is exercised exclusively through the injected `spawnAppServer` peer
  (T2) deliberately returning JSON-RPC errors or exiting early, not by
  attempting to force the real Codex CLI into a failure mode. Evaluation impact:
  no case asserts a specific HTTP status code for a failed `POST /sessions`
  beyond "not `201`" (mirrors Spike 004 A3).
- **A5 — WebSocket upgrade-rejection detection.** Rejected upgrades are observed
  via the `ws` client library's `unexpected-response` event, the same
  established pattern used by this project's own visible tests and Spike 004's
  hidden tests. Evaluation impact: none beyond confirming the existing detection
  mechanism continues to apply for Codex-backed sessions; no new
  upgrade-rejection behavior is introduced by this spike.
- **A6 — Runtime backend-selection mechanism is not automated.** Spike.md
  explicitly leaves the "normal, non-test-only way to run Harness with the Codex
  backend" unspecified in mechanism (host configuration, CLI flag, environment
  variable, or another seam). Evaluation impact: the deterministic hidden-test
  suite verifies the Codex backend and lifecycle entirely through the T1/T2
  construction seam, not through this runtime-selection mechanism; the existence
  and usability of a normal (non-test-only) runtime path is assessed by code
  inspection at `verify` time and is a precondition for the separately-required
  live Codex smoke, not a mandatory automated hidden-test case.
- **A7 — Live Codex smoke verification is outcome/implementation evidence, not a
  hidden-test case.** Spike.md requires a live smoke against the real,
  authenticated Codex App Server "somewhere in the implementation/
  evaluation/outcome workflow," but explicitly separates this from "the majority
  of mandatory evaluation," which "must not depend on model wording, network
  latency, account quotas, or stochastic model behaviour." Evaluation impact:
  this evaluation specification's mandatory hidden-test cases are entirely
  deterministic (no live-model dependency); `verify` additionally checks that a
  live smoke was performed and recorded (per spike.md's "Live-service
  availability"), but its absence due to unavailable authentication is not, by
  itself, classified as an implementation defect.
- **A8 — Sanitized diagnostics are observed via `console.error`/`console.warn`/
  `console.log` interception.** Spike.md requires sanitized server-side
  diagnostic evidence for startup/runtime failures but does not prescribe a
  logging mechanism. The existing codebase already logs failures via
  `console.error` (`src/index.ts`, e.g. "Failed to start session backend").
  Evaluation impact: sanitization cases (e.g. confirming a planted secret-shaped
  string never appears in emitted diagnostics) capture all three `console.*`
  methods during the test rather than assuming one specific method; an
  implementation that logs through a different mechanism entirely (e.g. writing
  directly to a file or a dedicated logger object never routed through
  `console.*`) would not be observed by this capture and should be confirmed by
  inspection at `verify` time instead.

## Blocking Questions

None. Spike.md is marked "Ready to freeze" in its own review feedback
(`feedback.md`), and every ambiguity encountered while deriving the evaluation
model was resolvable either because spike.md explicitly declines to prescribe
the detail (e.g. exact failed-startup HTTP status, exact runtime
backend-selection mechanism — see A4/A6) or via a narrow, disclosed testability
requirement (T1–T3) or evaluator assumption (above).

## Environment Requirements

- Node.js `>=24.12.0` (already required by `package.json`), used both for
  running the implementation and for executing hidden tests directly via
  `node --test` against `.ts` sources.
- The deterministic App Server peer used by mandatory hidden tests is a locally
  forked Node.js child process speaking the frozen, committed App Server
  JSON-RPC schema (`spikes/005-native-codex-backend/protocol/`) over real stdio
  pipes. No external network access, OpenAI account, or Codex CLI authentication
  is required to run or pass the mandatory hidden-test suite.
- The real, locally installed, authenticated Codex CLI (`codex-cli 0.147.0` at
  evaluation-freeze time — the same version that generated the committed schema
  baseline) is required only for the separately-required live smoke verification
  (spike.md, "Live Codex smoke verification"), not for the deterministic
  hidden-test suite. Its absence does not block deterministic `verify`.
- Hidden tests run against `127.0.0.1`-bound Harness instances only, consistent
  with the project's localhost-only posture.
