# Evaluation Requirements

## Testability Requirements

- **TR1 — Public governed surfaces.** The successor must remain observable
  through the existing configured human-decision operation, workflow resolution,
  Role Grant/assignment, execution result, handoff, and trusted-methodology
  adoption surfaces. This follows from AC01–AC14 and the Design Map. The
  implementation may factor policy and minimal generic enforcement freely, but
  evaluation must not require a private helper or duplicate state model.
- **TR2 — Deterministic authorization identity.** The
  `pre-semantic-implementation-correction-authorized` record must expose the
  `authorization` identity and the public-safe bound evidence/diagnosis needed to
  recompute it. This is required by the Design Map's canonical identity rule and
  lets evaluation detect caller substitution, drift, and replay without internal
  state access.
- **TR3 — Public regression evidence.** Repository tests must exercise the real
  configured decision, resolver, retry, handoff, assignment, and adoption
  surfaces for the positive and negative boundaries in the frozen brief. This
  is required by the brief's verification boundaries. Test organization,
  fixture names, and helper names remain implementation choices.

## Evaluator Assumptions

- **EA1.** `kernel.launch-attempt`, `kernel.retry-exhausted`,
  `kernel.allocation`, `implementation-handoff`, Workflow Grants, Role Grants,
  and trusted-methodology history retain their existing public meanings. A
  change to those meanings is outside this spike and would require separate
  authority.
- **EA2.** Authentication, quota, provider, sandbox, and readiness failures are
  operational classifications. Human diagnosis may authorize bounded candidate
  correction but never turns them into evaluator classifications.
- **EA3.** Trusted sequence 6 remains the authority for evaluating and adopting
  the successor; sequence 7 becomes authoritative only after the specified
  append-only adoption and host restart.

## Blocking Questions

None.

## Environment Requirements

- The project-supported Node.js runtime and installed repository dependencies.
- Git, including temporary local repositories used by the existing test suite.
- The exact committed candidate and the protected frozen evaluator revision.
- For AC12–AC14, host-produced prepared-observation, closeout, adoption, restart,
  and fresh-grant evidence bound to the exact identities required by the brief.
  No live external provider, credential, or network service is required by the
  evaluator itself.
