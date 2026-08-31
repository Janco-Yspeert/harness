# Design Map — Spike 010a

## Shared contracts

- Evaluator preparation commits public-safe `coverage-map.json` beside
  `eval-requirements.md`: `{ criteria: [{ id, mode, requirement, cases,
  required, reason }] }`. Every material frozen acceptance criterion has one
  entry. `BLOCKED` prevents an ordinary PASS.
- `evaluation-prepared` cites that map with ordinary artifact provenance.
  `verification-finalized` carries a `coverageResults` object keyed by map ids;
  `PASS` requires every required entry to be `SATISFIED`.
- `human-rejected` is guarded, provenance-validated public evidence with one of
  `IMPLEMENTATION_GAP`, `EVALUATOR_COVERAGE_DEFECT`,
  `SPECIFICATION_CHANGE`, or `OTHER_HUMAN_REJECTION`. It is later than, and
  never mutates, the technical PASS/promotion/As-Built evidence.
- A successor records `successor-linked` in its own append-only authority
  history with predecessor path and rejection-artifact provenance. This leaves
  Spike 010 untouched; attempts and evaluator revisions are local.
- Workflow skills invoke the authority for each applicable canonical boundary;
  manifests remain supplementary history.

## Invariants

- A rejected predecessor cannot record ordinary successful Outcome.
- Human rejection never rewrites a technical PASS, evaluator attempt, promotion,
  or As-Built.
- No criterion may be absent from a frozen evaluator coverage disposition.
- A finalized verification allocation is immutable; a later result needs a
  later allocation.

## Implementation freedom

- The CLI may add `successor-linked`; the reducer remains append-only JSONL.
  No generic cycle framework is introduced.
