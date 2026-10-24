# Evaluation Requirements

Prepared for brief
`sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c` and
Design Map
`sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de`.

## Testability Requirements

- **TR1 — Existing authoritative seams only.** The candidate must leave
  `methodologies/harness/trusted.jsonl` unchanged (head sequence `5`), must not
  expose methodology adoption or trusted-history operations in
  `src/executors/protocol.ts` or `src/executors/worker-tools.ts`, and must not
  delete any test file present at the Design Map commit
  `c9679ce008cb29bacac7836830eb28d9575fe722`.
  - Reason: adoption is a later host/root operation; the candidate never
    self-approves; accepted regressions must remain.
  - Impact: none beyond the Design Map; all other names stay implementation
    freedom.
- **TR2 — Implementer-owned deterministic tests.** The ordinary repository suite
  (no live provider, no credentials) must contain tests that fail on regression
  of: (a) the future prepared-observation declaration being closed and
  canonical with exactly the Design Map facts, rejecting unknown fields,
  filesystem paths and inline content, and conferring no authority;
  (b) candidate-subject results being unable to finalize verification, mutate
  trusted workflow state, alter methodology trust or adopt; (c) trusted N
  resolving and recomputing sealed prepared evidence and rejecting mismatched or
  tampered evidence; (d) a controlled post-PASS archive failure leaving the PASS
  unchanged and blocking closeout/adoption by policy; (e) NONTERMINAL,
  TERMINAL and LOST attempt states, including NONTERMINAL needing no terminal
  artifact, a never-produced artifact not being LOST, and a recorded-then-missing
  artifact being treated differently; (f) an identity-valid active revision
  archiving without a pre-existing `.eval/revisions/<id>/` copy, changed or
  missing bytes failing archival, the host constructing the archive from exact
  identities with no evaluator eligibility judgment, and a later PASS archiving
  despite earlier NONTERMINAL history; (g) adoption refusing candidate,
  methodology, predecessor, trusted-head, evaluated-candidate drift and stale
  or replayed authority, and the append being forward-only from sequence `5`;
  (h) a fresh allocation after a fixture adoption resolving and binding the
  adopted methodology through the standard trust-equivalence gate while earlier
  grants keep their original methodology; (i) the accepted 014h/014i/014j
  guarantees remaining asserted.
  - Reason: the Design Map leaves modules, signatures, serialization and
    fixtures as implementation freedom, so these behaviors have no public seam
    for independent import.
  - Impact: the evaluator runs the whole suite and reviews that each behavior is
    asserted.

## Evaluator Assumptions

- **EA1 — Bootstrap-closed evidence.** All mandatory evidence uses only Git
  inspection of the committed candidate, repository check commands and review
  under trusted N; none needs authority introduced by the candidate. Any
  prepared observation of candidate behavior goes only through the accepted
  014j root path and is supplementary.
  - Reason: AC01.
  - Evaluation impact: no procedure grants N+1 authority.
- **EA2 — No live provider.** Evaluation needs no credentials and no live call.
  - Reason: brief's closure rules.
  - Evaluation impact: provider calls 0.
- **EA3 — Review standard.** Reviews judge against the Design Map text, not a
  candidate-specific interpretation; Design Map implementation freedom is never
  penalised.
  - Reason: implementation freedom is preserved.
  - Evaluation impact: naming and serialization choices are not failures.
- **EA4 — Cutover timing.** The live post-adoption allocation (AC14) occurs
  after the trusted-N PASS and human adoption; the verdict relies on the
  deterministic fixture evidence only.
  - Reason: no authority is backdated.
  - Evaluation impact: absence of live cutover evidence is not a failure.

## Blocking Questions

None

## Environment Requirements

- Linux with unprivileged user namespaces and `bubblewrap` on `PATH`, as the
  existing 014h/014i tests require.
- Node 22+ with the repository's installed dependencies; evaluation runs from
  the exact committed candidate checkout.
- `git` on `PATH`.
