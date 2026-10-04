# Evaluation Requirements

Forward specification-recovery revision for brief
`sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559` and Design Map
`sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`. It supersedes
the earlier public requirements only where the human decision in
`specification-revision-authority.md` supersedes the obsolete mechanism-specific
assertion; prior evaluator revisions and attempts are preserved unchanged.

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
  existing Role Grant assignment, including when the verifier runs as a bounded
  candidate subject.
  - Reason: AC06 requires explicit, inspectable permissions.
  - Source: design-map.md SC3.
  - Impact: none beyond recording them in the grant.
- **TR3 — Existing role-contract interface.** The verifier's contract continues
  to be resolved through the existing `methodologies/harness/policy.json` role
  entry and its contract file, using the existing `workspaces`, `capabilities`
  and `protected` fields.
  - Reason: this is the authoritative public interface for role permissions.
  - Impact: new fields may be added; these three must keep their meaning.
- **TR4 — Candidate-subject evidence is public and self-describing.** Evidence
  from the bounded candidate-subject run is published apart from the
  authoritative verification result and states the exact candidate commit, the
  candidate composition (workspace modes, capabilities, host actions), the
  runtime, and the raw observed output of the commands it ran. Its packaging is
  implementation freedom provided these facts are stated.
  - Reason: trusted N must independently establish the binding before using it.
  - Source: design-map.md SC2; spike.md required behavior 9.
  - Impact: evidence that does not state them is not admitted and the affected
    criteria are not satisfied.
- **TR5 — Distinguishable boundary observations.** Candidate-subject evidence
  states, separately: the host-created topology (synthetic HOME, scratch, mount
  parents) captured on the host before launch; the paths actually visible to the
  subject; the paths actually writable to the subject; and host-side
  before/after snapshots of the real home, sibling, Harness checkout and
  temporary locations.
  - Reason: host-created topology is not exposure, and exposure must be
    distinguishable from it (spike.md AC01; design-map.md SC5).
  - Impact: observations that do not make these distinctions are not admitted.

## Evaluator Assumptions

- **EA1 — Baseline.** Pre-implementation base is commit
  `502727dbfe4860d9f60f1a1e994b3ae84a07a59b`. Changes to other governed roles
  and the 014e and 014f spike directories are measured against it.
- **EA2 — Revised SC1 regression bytes.** The selected tests are those defined
  by design-map.md SC1: every test block of git blob
  `4b361f81e307e129be6d106c9df9a4910e674be9` (`test/external-project.test.ts`,
  commit `a36fd6e`) whose title begins `014e` except the single superseded D4
  block; the `014h AC10` block of blob
  `74a51d545681532ac4c49ac9034712ee3217974d`; and every `014h` block of blob
  `b9c135790860a87e76afdfb458a7b0758d129704` (`test/host-fs-isolation.test.ts`).
  Edits to shared helpers outside those blocks are permitted; their effect is
  judged by the selected tests passing.
- **EA3 — Two evidence classes.** The authoritative verdict is produced by the
  allocated verifier under unchanged trusted methodology N. The revised SC1
  selection and a live observation of the effective verifier boundary are run
  inside a bounded candidate-subject verifier under the candidate's proposed
  composition; trusted N launches it, captures its output and judges it. The
  subject cannot author the authoritative result or advance the workflow.
- **EA4 — Revised SC1 under trusted N.** A revised-SC1 result observed under trusted N's own
  broader authority is recorded as not adjudicated: neither a pass nor an
  implementation failure, and never a substitute for the subject run. The rest
  of the repository regression suite is run and adjudicated by trusted N.
- **EA5 — Genericity check.** Added non-comment code and data under `src`,
  `tools`, `methodologies` and the executor and project configuration must not
  contain spike, workflow, candidate or Stockdif identifiers.
- **EA6 — Reuse of earlier subject evidence.** Fixture evidence at commit
  `27af3a8` may support only launch-composition and evidence-action
  observations; it satisfies the revised SC1 requirement only if independently established valid for it (candidate, composition, runtime, fixture and observations).

## Blocking Questions

None

## Environment Requirements

- A Node.js runtime and the repository's installed dependencies.
- Git access to the repository history, including the base commit and the 014f
  candidate commit.
- The Linux containment facilities that the frozen 014e tests already require.
- Ability to launch a disposable candidate-subject fixture through the
  registered Harness adapter path.
