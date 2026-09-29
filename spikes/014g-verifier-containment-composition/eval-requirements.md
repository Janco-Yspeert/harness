# Evaluation Requirements

## Testability Requirements

- **TR1 — Public regression tests for the mediated evidence action.** The
  implementation must ship deterministic tests in the repository's ordinary test
  suite that cover: a request for a destination outside the declared allowlist
  is denied and leaves nothing written; an allowed request writes and commits
  only the bytes the requester supplied, attributed to the allocated execution,
  with the request, destination and content identity recorded in the ledger; and
  a launch that cannot enforce the selected composition is refused before any
  session or allocation exists, with no fallback to the earlier write grant.
  - Reason: the wire shape of the action is deliberate implementation freedom
    (Design Map), so these behaviors can only be evidenced by the implementer's
    own tests plus review.
  - Source: spike.md AC02, AC06; design-map.md SC4, SC5.
  - Impact: the tests must pass in the full regression run.
- **TR2 — Inspectable effective permissions.** The verifier's effective
  workspace modes, capabilities and host actions must be readable from its
  existing Role Grant assignment.
  - Reason: AC06 requires explicit, inspectable permissions.
  - Source: design-map.md SC3.
  - Impact: none beyond recording them in the grant.
- **TR3 — Existing role-contract interface.** The verifier's contract continues
  to be resolved through the existing `methodologies/harness/policy.json` role
  entry and its contract file, using the existing `workspaces`, `capabilities`
  and `protected` fields.
  - Reason: this is the authoritative public interface for role permissions.
  - Impact: new fields may be added; these three must keep their meaning.

## Evaluator Assumptions

- **EA1 — Baseline.** Pre-implementation base is commit
  `502727dbfe4860d9f60f1a1e994b3ae84a07a59b`. Changes to other governed roles,
  the 014e and 014f spike directories and the 014g brief and Design Map are
  measured against it. Evaluation reason: AC05 and AC07 need a fixed reference.
- **EA2 — Frozen regression bytes.** The frozen 014e tests are the blocks at git
  blob `4b361f81e307e129be6d106c9df9a4910e674be9` of
  `test/external-project.test.ts`. Edits to shared helpers outside those blocks
  are permitted; their effect is judged by the frozen tests passing.
- **EA3 — Verification runs in the verifier.** The frozen 014e group, the full
  repository regressions and a live observation of the verifier's effective
  boundary are run by the allocated verifier itself, under its real effective
  sandbox.
- **EA4 — Genericity check.** Added non-comment code and data under `src`,
  `tools`, `methodologies` and the executor and project configuration must not
  contain spike, workflow, candidate or Stockdif identifiers.

## Blocking Questions

None

## Environment Requirements

- A Node.js runtime and the repository's installed dependencies.
- Git access to the repository history, including the base commit and the 014f
  candidate commit.
- The Linux containment facilities that the frozen 014e tests already require.
- Verification is launched through the registered Harness adapter path.
