# Design Map — Spike 010a

## Shared contracts

- Evaluator freeze metadata gains a public-safe criterion coverage map keyed by
  frozen acceptance-criterion identifiers. Each entry declares evidence mode,
  evaluator requirement/case reference, and a reason; verification supplies a
  terminal result for every required entry.
- The authority receives the evaluator revision's public coverage summary as
  transition evidence and structurally rejects PASS unless every required
  criterion is terminally satisfied. It does not read private evaluator files
  or judge evidence semantics.
- `human-rejected` is a public guarded transition with a bounded classification
  and provenance-validated acceptance artifact. It preserves all prior events
  and closes accepted completion for that spike.
- Successor initialization records the rejected predecessor spike identifier and
  immutable predecessor reference in the successor's public authority history;
  attempts remain local to the successor.
- Workflow skills invoke the authority for every transition it supports; their
  prose/manifest artifacts are supplementary execution history.

## Invariants

- A rejected predecessor cannot record ordinary successful Outcome.
- Human rejection never rewrites a technical PASS, evaluator attempt, promotion,
  or As-Built.
- No criterion may be absent from a frozen evaluator coverage disposition.

## Implementation freedom

- JSON field names, CLI subcommands, coverage vocabulary spelling, and reducer
  implementation are free provided public status exposes the required state and
  visible tests exercise the frozen paths.
