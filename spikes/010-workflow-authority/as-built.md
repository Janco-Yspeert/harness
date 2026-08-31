# As-Built — Spike 010 Workflow Authority

## Inspected implementation

- Canonical implementation handoff: `e4be145fd17def9e46d42587c2804f3ff08a778c`.
- Fresh provenance-valid verification: public authority attempt `002`, mapped
  to evaluator-private attempt `001`, evaluator revision `001`, PASS.
- Promoted evaluator evidence: `0104d13`.

## Implemented shape

The repository workflow CLI now contains a public guarded authority surface
backed by append-only `<spike>/workflow.jsonl`. It separates canonical
methodology history from ignored operational dispatch state and supports status,
non-mutating validation, and transition recording.

Transitions validate public artifact identity/Git provenance, committed
implementation handoff attempts, immutable verification allocation, terminal
result/classification shape, promotion gating, and later As-Built/acceptance/
Outcome ordering. Existing process-dispatch behavior remains convenience only.

The authority is cooperative: direct same-user filesystem/Git changes remain
possible. During dogfooding, sandboxed successful Git subprocesses surfaced as
errors; the implementation now accepts their zero-status stdout rather than
mistaking valid provenance for failure.

## Frozen-contract comparison

- **Missing** — none observed in the evaluated public authority path.
- **Contradictory** — none.
- **Extra** — no material runtime/product behavior beyond repository tooling.
