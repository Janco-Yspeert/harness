# Design Map — Spike 010b

## Shared contracts

- Evaluator preparation produces a public-safe `coverage-map.json` that is both
  the authority evidence artifact and the public projection of the frozen
  evaluator's criterion evidence records. Each material criterion has exactly
  one record with its identifier, frozen-authority source, evidence mode,
  required disposition, procedure/case identifiers, and a criterion-specific
  sufficiency reason. Several records may name the same procedure.
- The map also carries a public-safe readiness attestation binding the prepared
  evaluator revision to a deterministic private inventory identity and declaring
  that pre-freeze integrity passed. It contains no private paths, cases,
  fixtures, or grader logic.
- The authority validates this public structure when it records
  `evaluation-prepared`. It rejects absent or duplicate criterion records,
  missing required dispositions or traceability fields, blocked required
  coverage, and any map without a passing readiness attestation. It does not
  inspect or judge private evaluator contents.
- Evaluator v10 preparation owns the private bundle. It creates an explicit
  criterion-evidence record for every material criterion, validates its
  bidirectional traceability, procedure materialization, freeze inventory,
  public/private consistency, and controlled readiness of mandatory executable
  cases before freezing. The validator result is recorded in private freeze
  metadata and projected only through the public attestation.
- A verification allocation binds a prepared evaluator revision as well as the
  current implementation handoff. Verification cannot allocate from an
  evaluator revision without a successful attestation. If later bundle
  integrity validation fails, the allocated attempt is finalized `BLOCKED` with
  `EVALUATOR_DEFECT`, retaining its allocated implementation and evaluator
  identities; it is never reported as an implementation failure.

## Design decisions

- The deterministic preparation-integrity validator is evaluator-owned, using
  its existing private freeze/case-manifest boundary. The public workflow tool
  validates only the attestation and map shape, keeping private semantics out
  of Harness.
- `coverage-map.json` remains the one public authority artifact rather than
  adding a second public evaluator manifest. This keeps the authority boundary
  small and makes its criteria projection directly comparable to the frozen
  evaluator bundle.
- Repeated post-implementation evaluator corrections are tracked in the
  evaluator's immutable revision/attempt history. At the existing threshold,
  the evaluator must classify the next issue and stop automatic correction;
  this spike adds no generic workflow-cycle machinery.

## Invariants

- Freeze occurs only after private integrity validation passes; a failed draft
  has no frozen evaluator revision and cannot produce `evaluation-prepared`.
- Mandatory executable evidence is prepared using controlled,
  implementation-independent conditions. Non-executable evidence is equally
  concrete and criterion-specific, but need not be executable.
- Every frozen evaluator dependency is represented in its inventory, and every
  required criterion and procedure has a reverse traceability link.
- Spike 010a remains untouched; this spike's declared process-successor
  exception is provenance only and creates no synthetic authority event.

## Implementation freedom

- The private record/validator schema, its helper layout, and the exact
  controlled test mechanisms remain evaluator implementation details provided
  they establish the shared contract.
- The public authority may use ordinary JSON parsing and structural validation;
  it need not understand evaluator quality, execute private evidence, or expose
  private material.
