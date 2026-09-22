# Verification feedback — Spike 014a attempt 001

## Implementation failure

- Classification: `IMPLEMENTATION_FAILURE`
- Violated public requirement: AC11 — supervisor identity is non-authoritative
  for worker roles.
- Expected behavior: an ordinary workflow-execution grant must not let a
  supervisor perform an attached worker role inline without explicit inline or
  mechanically satisfied fallback authority.
- Observed behavior: an attached supervisor can obtain a governed worker
  allocation by using the ordinary attached continuation path without inline
  authority.
- Safe diagnostic: enforce the supervisor-to-worker authority boundary for all
  attached role adoption paths, not only requests that explicitly set an
  `inline` flag.

The frozen evaluator revision remains valid. Repair the implementation and
verify the new committed handoff against the same revision.
