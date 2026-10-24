# Spike 014a methodology cutover review — cycle 002

## Candidate and baseline

- Candidate methodology: `sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`
- Candidate revision: `0a3dafe8e103cc7376bdd7fae32493710613d0c0`
- Current trusted methodology: `sha256:ee77b80b26f1f4fdcd0699ca9807c1e4710aa805dbe5bbef479adec070db311d`
- Trusted methodology revision: `a79f7bc94a5b8ddf25054a5edb1f0b9980414c91`
- Frozen evaluator revision: `004`
- Candidate implementation handoff: `0a3dafe8e103cc7376bdd7fae32493710613d0c0`

The candidate reconstructed deterministically from its exact commit and passed
`methodology check` with no diagnostics. It is distinct from the currently
trusted methodology.

## Material changes

- The evaluator-verification contract adds a declarative, host-mediated
  `promotion` action. It binds source and destination workspaces, destination,
  candidate and evaluator-revision inputs, PASS condition, verification
  allocation/attempt identity, and the `promotion-recorded` transition.
- The policy adds configured accept/reject decisions. Each decision binds the
  current candidate, verification semantic result, promotion identity, As-Built
  result, and correction scope; acceptance/rejection preconditions require the
  corresponding canonical evidence.
- The host-action representation adds a structured promotion action. It does not
  grant evaluator publication credentials. Promotion is validated and performed
  by the host, with exact identities and an action result.
- No evaluator skill, validator implementation, capability vocabulary, or
  result vocabulary changed. The methodology diff therefore reports policy and
  evaluator-verify contract changes only; its privileged-action summary is empty
  because the action is a contract field rather than a capability vocabulary
  change.

## Validation

- `methodology check`: passed with no diagnostics.
- Disposable methodology exercise: passed; created only a disposable Design Map
  checkpoint and left trusted methodology unchanged.
- Real host-bound focused tests passed:
  - promotion validates exact evidence, promotes only through the host, and
    keeps failed/denied promotion distinct from semantic PASS;
  - configured acceptance and rejection bind canonical evidence through the
    root host path;
  - existing real publication failure behavior remains distinct from semantic
    results.
- The promotion implementation uses the declarative role-grant action rather
  than direct executor publication access. Inspection found no new
  Harness-specific role-name branch in the promotion path; existing role lookups
  are generic grant/policy resolution and lifecycle mechanics.

## Limitation and decision boundary

This is an independent bounded review under the previously trusted methodology,
not a canonical methodology evaluation. The candidate is not trusted and cannot
authorize a new verifier grant until a human explicitly accepts this cutover and
the append-only trust mechanism records the exact candidate revision.

No unresolved implementation concern prevents human promotion. The remaining
required action is the human acceptance decision.
