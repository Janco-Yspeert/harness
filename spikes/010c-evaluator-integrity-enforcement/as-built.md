# As-Built — Spike 010c Evaluator Integrity Enforcement

## Inspected revision and evidence

- Final implementation revision: `29159c6bb3416022bad93eda646269b415d057be`
  (`feat: enforce evaluator preparation integrity`).
- Frozen brief: `spike.md`
  `sha256:adf1e47d5b6142e2a69a50f79c1e3f9af2cc3263edc99145cce8ab93f3c29d50`.
- Frozen Design Map: `design-map.md`
  `sha256:3276a4278e237c30b7466cb4ea6523a4f239858ee4c6b2e7afa791bee1a56521`.
- Frozen public evaluation inputs: `eval-requirements.md`
  `sha256:88f82f9be608645f1652f695510d4f5f23841e93cb6d70a0b5cc0955f5298ca5`
  and `coverage-map.json`
  `sha256:398250a93dbabd5d83648e5a7e5da7ec952c1f498bac78f95199ef877408c10a`.
- Promoted evaluation: attempt `001`, `PASS`, result identity
  `sha256:4b5aba0b582869af62a921a69978770c34b8f53f9397224cc55ae88f4cf16257`.

## Built shape

The implementation adds a local TypeScript preparation-integrity validator in
`tools/evaluator-integrity.ts`. It consumes a prepared evaluator bundle with
criterion records, procedures, required material, freeze inventory, and the
public criterion projection. It accumulates structural diagnostics rather than
stopping at the first failure.

The validator checks required dispositions; criterion-to-procedure and
procedure-to-criterion mappings; procedure material presence in both the bundle
and its freeze inventory; and equivalence of the public criterion projection to
the prepared criteria. A bundle passes only when no diagnostic is present. The
CLI reads one local JSON bundle and prints the preparation result; the validator
has no network, model, or evaluator-quality judgement path.

`prepareEvaluatorBundle` derives a readiness attestation only from a passing
validation result. The attestation carries the evaluator revision, a SHA-256
identity of the sorted freeze inventory, a SHA-256 binding of that identity and
the validation result, and `integrityValidation: "PASS"`. A failed bundle
returns diagnostics without readiness data, leaving freeze, authority recording,
and attempt allocation to remain unavailable to their existing callers.

`validateResultAccounting` derives expected mandatory-case,
criterion-record, procedure, and executable-case counts from the supplied
prepared bundle, and reports every supplied count that differs. This supplies
the structural accounting check used by the visible regression surface.

The public workflow authority remains a public-JSON structural consumer. Its
prepared-map validation now requires a non-empty
`readiness.validatorResultBinding` in addition to the existing revision,
inventory identity, and passing readiness fields; it does not dereference the
private inventory or inspect evaluator-private material.

Visible regression coverage adds complete, incomplete, traceability/projection,
non-executable, result-accounting, CLI, and authority-binding scenarios. The
incomplete-bundle case removes required material from both the bundle and the
freeze inventory instead of smuggling in a pre-set failure value. Existing
workflow tests cover rejection of a public readiness attestation that lacks the
validator-result binding.

## Lifecycle and boundaries

- Integrity validation is side-effect-free and local. A failing draft has no
  generated readiness attestation; it does not itself create a revision or
  allocate verification work.
- Public readiness metadata carries opaque identities and a result binding.
  The authority checks their public structure only.
- The final verification used the frozen evaluator revision `001` under the
  declared bootstrap exception. Promoted evidence records that the newly built
  mechanism was not used as that verification's grading instrument, so frozen
  acceptance semantics did not move during self-hosting.
- The implementation revision changes no Spike 010b historical artifact. Its
  forward-only human-rejection and successor-link history predates the
  implementation handoff.

## Contract comparison

No Missing, Contradictory, or Extra material behavior or structure identified
against the frozen brief and Design Map.
