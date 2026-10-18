# As-Built — 014m Pre-Semantic Implementation Correction

## Inspected basis

- Final implementation revision: `3e753a4a732c87fc5b42e9e3cf771482aba6a522`.
- Frozen brief: `spike.md`,
  `sha256:d0623b61c859a4eb4ec9b11d2894cd26ea66a2f2228a89de6e1b2a83b1bdf224`.
- Frozen Design Map: `design-map.md`,
  `sha256:a07c99f8c8fb4bac61896fec343ab87b89b6dad287be7e4bbd41ee3f456e973d`.
- Final verification: `verification-result.json`,
  `sha256:42841121dec71ee874556c70404c46cb31e9a6a9650b3e87430bbfb8ee615239`;
  attempt 15, evaluator revision 005, `PASS` for the exact implementation.
- Completed promotion record: `evaluation/promotion.json`,
  `sha256:d7b79ae595a50db5e50d6015faead025b3dbfea14b80d439a6c86da38e2cfbdc`.
  The promoted archive records declared known historical loss for attempt 007;
  it preserves the final accepted attempt and revision through the recorded
  archive-loss recovery path.

## Implemented shape

The trusted Harness methodology now defines one configured human decision,
`authorize-pre-semantic-implementation-correction`, which records
`pre-semantic-implementation-correction-authorized`. The transition is the only
new route that makes `implementation` eligible. Existing ordinary initial,
post-verification implementation-failure, evaluator, acceptance, promotion,
As-Built, Outcome, and adoption predicates remain separate.

The decision uses a small kernel evidence resolver because the policy predicate
language does not express all of the required relationships. At decision time
the resolver derives, rather than trusts from the caller:

- the current implementation handoff and candidate commit;
- the latest downstream, failed, unconsumed launch refusal after that handoff;
- its downstream role, launch intent, launch-attempt identity, Workflow Grant,
  and a recognized operational failure classification;
- an operational retry-exhaustion record after that attempt, whose scope is the
  launch intent, whose Workflow Grant matches the attempt, whose used count
  equals the complete attempt count, and whose identity is recomputed from that
  intent and count;
- exhaustion of both automatic and human operational retry allowance;
- absence of readiness consumption for the launch intent and absence of a later
  matching downstream semantic allocation; and
- the current correction-cycle scope and the prior implementation input
  lineage, excluding the two correction-feedback inputs.

The caller must repeat the derived candidate, role, intent, attempt, exhaustion,
failure class, and cycle exactly, and must add a non-blank reason plus a
non-empty list of non-blank defect descriptions. A mismatch or missing field
refuses the decision. The durable feedback object also contains the current
handoff identity, content identities of the launch-attempt and exhaustion
evidence, and preserved implementation inputs. Its canonical content identity
is stored as `authorization`; the operational classification is retained as
recorded and is not converted into an evaluator classification. Recording this
decision creates no evaluator allocation, semantic attempt, verdict, result, or
`verification-finalized` event.

The implementation contract adds the optional
`preSemanticImplementationCorrection` input. Role resolution checks that the
structured feedback hashes to the authorization identity and that every
preserved input agrees with the newly resolved Role Grant. The Role Grant binds
both the authorization identity and the structured public evidence; the worker
execution context projects the same evidence under
`inputEvidence.preSemanticImplementationCorrection`. Structured input evidence
also participates in the launch authority-scope identity, so changing it changes
the launch intent rather than silently reusing prior authority.

Failed or interrupted correction executions use the existing implementation
retry policy (two retries for those dispositions) while retaining the same
authorization and input lineage. A successful implementation result records a
new `implementation-handoff`; the policy's current/after conditions then consume
the authorization, establish the new sole candidate, and return eligibility to
the ordinary downstream path. A newer handoff, changed input, stale scope,
different evidence, remaining retry authority, semantic consumption, or replay
after handoff prevents reuse.

The implementation is persisted entirely through the existing append-only
workflow events, Role Grant, and implementation handoff. It adds no database,
parallel correction ledger, provider-specific state, dependency, or automatic
outage classification. The implementation skill contract was advanced to
version 6 so a correction worker consumes only the bound public authorization
projection and never treats it as evaluator feedback.

## Frozen-contract comparison

No **Missing**, **Contradictory**, or **Extra** behavior or structure was found
against the frozen brief and Design Map in the inspected final revision.

The accepted verification explicitly defers AC13 (human-authorized methodology
adoption) and AC14 (post-adoption existing-workflow cutover). Those are later
workflow steps described by the frozen contract, not behavior claimed as part
of this implementation revision.
