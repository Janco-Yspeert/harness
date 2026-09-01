# Design Map — Spike 010c

## Shared contracts

- Evaluator preparation supplies one candidate-bundle root to a locally
  executable deterministic integrity command. Its freeze metadata must resolve
  the actual criterion-evidence records, procedure/case definitions, required
  material, freeze inventory, public `coverage-map.json` projection, and
  structured result-accounting source used for that revision. The validator
  derives or checks accounting from those structures; it never accepts a
  caller-supplied PASS/FAIL or manually maintained counts as authority.
- The command returns a machine-readable PASS or FAIL with all independently
  detectable structural diagnostics practical for one run. A PASS is the only
  result eligible for private freeze and the public readiness attestation. A
  FAIL leaves the same draft unfrozen: no evaluator revision, readiness PASS,
  `evaluation-prepared`, implementation handoff, or verification allocation.
- The public `coverage-map.json` remains the authority artifact. Its readiness
  attestation binds the evaluator revision, opaque private inventory identity,
  and validator/result identity (or an equivalent opaque binding) to PASS. The
  authority checks that public structure and binding only; it neither receives
  nor interprets private evaluator contents.

## Design decisions

- The validator is evaluator-owned tooling at the existing private
  freeze/case-manifest boundary, invoked against the candidate bundle before
  freeze. Its input representation may remain private, but it must be the
  actual freeze inputs rather than a parallel readiness summary.
- Structural validation covers bidirectional criterion/procedure traceability,
  materialized procedures and their required files, inventory membership,
  required dispositions, public/private projection consistency, and result
  accounting consistency. It reports structure, identity, existence, and
  mapping defects only.
- Frozen terminal result accounting is produced from, or checked against, the
  same frozen inventory and manifests the validator used. Contradictory counts
  invalidate the result rather than being repaired by explanatory prose.

## Invariants

- A complete bundle may pass and freeze; a deliberately incomplete
  criterion-to-procedure/material relationship must fail through this command,
  not through a pre-set readiness value.
- Non-executable evidence remains valid when concretely prepared and linked;
  the validator does not judge evaluator quality or require executable coverage.
- Validator execution is local, deterministic, and model-free. Its use during
  Spike 010c verification, if any, is recorded as bootstrap/self-hosting
  provenance without changing the frozen evaluation contract.

## Implementation freedom

- The private schemas, command implementation, diagnostics format, helper
  layout, and exact identity algorithm are free provided the shared structures
  above are consumed and the public boundary stays opaque.
- The authority may continue ordinary JSON structural validation and need not
  execute the validator or inspect private paths, cases, fixtures, or grader
  logic.
