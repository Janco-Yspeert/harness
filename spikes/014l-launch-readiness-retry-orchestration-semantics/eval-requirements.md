# Evaluation Requirements

## Testability Requirements

- **TR1** — Deterministic visible tests. The implementation must add committed
  deterministic tests, run by the repository's normal `npm test`, covering each
  of the 33 required deterministic tests listed in the frozen brief. Reason:
  the Design Map leaves fixtures, probe representation, record encoding and
  status nesting to the implementation, so these tests are the executable
  evidence. Source: brief "Required deterministic tests"; Design Map
  "Implementation freedom". Impact: tests must exercise the real host ordering,
  durable ledger records, adapter translation and `resolve` projection with
  injected provider/probe failures, not a duplicate orchestration model.
- **TR2** — Observable seams limited to those the frozen contract names: the
  ledger record kinds `kernel.launch-attempt`, `kernel.allocation`,
  `kernel.exposure`, `kernel.retry-authority`, `kernel.continuation-stopped`;
  the root-only `GET /governed/:workflow/resolve/:workflowGrant` response; the
  root-only `POST /governed/:workflow/retries` request
  `{ workflowGrant, kind, exhausted, count? }`; and the injectable probe
  boundary. No other seam is required or imposed. Source: Design Map shared
  contracts 1, 2, 5, 7, 8. Impact: none beyond the Design Map.
- **TR3** — The probe's inputs must be inspectable at the injectable probe
  boundary so a test can show no governed role material reaches readiness.
  Source: brief AC8; Design Map shared contract 4. Impact: probe boundary must
  be injectable (already required).

## Evaluator Assumptions

- **EA1** — Evaluation runs against one committed candidate revision with the
  repository's own runtime and dependencies. Evaluation impact: results are
  bound to that commit.
- **EA2** — No live provider is available or required; deterministic fixtures
  stand in for providers. Evaluation impact: live-provider behavior is not
  judged.
- **EA3** — Verification judges whether semantics are generic, deterministic
  and fail-closed, not whether specific historical incidents are reproduced.
  Source: brief "Evidence and verification".

## Blocking Questions

None

## Environment Requirements

- Node.js and the repository's installed dependencies (`npm test`,
  `npm run check`).
- Read access to the candidate git history and diff.
- No network or live provider access.
