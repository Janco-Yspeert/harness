# Evaluation Requirements

Prepared for brief
`sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d` and
Design Map
`sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`.

## Testability Requirements

- **TR1 — Stable public names.** The committed candidate source under `src/`
  must contain, literally, the Design Map names `prepareCandidateObservation`,
  the record kind `kernel.prepared-observation` and the field `exactModel`. The
  preparation operation and record must not appear in
  `src/executors/protocol.ts` or `src/executors/worker-tools.ts`.
  - Reason: the Design Map fixes these names and the host-only authority seam.
  - Impact: none beyond using the names already specified; everything else
    stays implementation freedom.
- **TR2 — Implementer-owned deterministic tests.** The ordinary repository suite
  (no live provider, no credentials) must contain tests that fail on regression
  of: (a) a synthetic committed candidate evaluator being reconstructed and
  observed through the accepted 014i/014h path; (b) valid host/root authority
  succeeding and candidate/provider output alone failing to authorize; (c) wrong
  candidate, evaluator revision, private inventory and procedure identities
  failing closed, and caller-supplied private paths or contents being rejected;
  (d) unrelated evaluator-private material not being exposed, and no private
  bytes or raw private output entering the public tree or public ledger; (e)
  host inputs being read-only to the subject where required; (f) sealed evidence
  separating host-created, subject-visible, subject-writable and host-observed
  state, with omission or tampering invalidating the bundle; (g) the canonical
  record binding the private evidence identity, public projection safety,
  preparation not finalizing, promoting or advancing a workflow, and resolution
  of the sealed bundle using only evaluator-private workspace, repository read,
  local computation and Git inspect; (h) selector precedence, a non-exact launch
  recording a different attested model without string comparison, exact-model
  mismatch failing, required-but-unavailable attestation not confirming, and
  at least two provider/profile shapes or generic fixtures.
  - Reason: the Design Map leaves modules, signatures, serialization and
    fixtures as implementation freedom, so these behaviors have no public seam
    for independent import.
  - Impact: the evaluator runs the whole suite and reviews that each behavior is
    asserted.
- **TR3 — Baseline.** The pre-implementation baseline for diff checks is the
  Design Map commit `32bdc94b65c08e3677f32c5baee8d277f2fc2830`. The candidate
  must not change `spikes/014g-verifier-containment-composition/`, `skills/` or
  `methodologies/` relative to it (ledger files excepted), and must not add
  public content naming evaluator-private workspace mechanics.
  - Reason: AC01, AC07, AC13 and the non-goals.
  - Impact: none for a conforming implementation.

## Evaluator Assumptions

- **EA1 — Bootstrap-closed evidence.** All evidence uses only Git inspection of
  the committed candidate, the repository test/check commands and review; it
  needs no capability introduced by the candidate.
  - Reason: AC01.
  - Evaluation impact: no procedure invokes the new operation.
- **EA2 — No live provider.** Evaluation needs no credentials and no live call.
  - Reason: brief's closure rules.
  - Evaluation impact: provider calls 0.
- **EA3 — Review standard.** Reviews judge against the Design Map text, not a
  candidate-specific interpretation.
  - Reason: implementation freedom is preserved.
  - Evaluation impact: freedom listed in the Design Map is never penalised.

## Blocking Questions

None

## Environment Requirements

- Linux with unprivileged user namespaces and `bubblewrap` on `PATH`, as the
  existing 014h/014i tests require.
- Node 22+ with the repository's installed dependencies; evaluation runs from
  the exact committed candidate checkout.
- `git` on `PATH`.
