# Design Map — Spike 012

## Shared contracts

`correction-cycle-opened` is the forward-only public authority transition. Its
evidence binds the new and predecessor cycle identifiers, immutable triggering
human-rejection evidence, normalized repairable finding classifications, the
frozen brief and Design Map identities, implementation/evaluator correction
requirements, and the inherited evaluator revision when one exists. Cycle
identifiers are zero-padded monotonic values; unannotated legacy authority
history is interpreted as immutable Cycle `001`.

New cycle-scoped authority records bind an explicit `cycle` identifier. The
authority derives the active cycle and its evaluator, implementation,
verification, promotion, As-Built, and human-decision state from the append-only
history; it does not retrofit cycle fields into legacy events. Its public status
returns the current-cycle state, historical cycle summaries, correction
eligibility, and the reason for that eligibility.

`evaluator-repair-recorded` is the public-safe authority binding for a completed
repair. It binds the authoritative trigger, source/result evaluator revisions,
affected public criteria, frozen brief/Design-Map/evaluation-requirements
identities, the immutable private repair-record identity, the integrity PASS,
and an acceptance-semantics-preserved attestation. Detailed repair records and
private evaluator inventory remain in the evaluator workspace.

For Spike 012 only, `bootstrap/evaluator-skill.md` is an exact committed copy
of the pre-implementation evaluator skill and `bootstrap/evaluator-authority.json`
binds its name, contract version, source Git object, and SHA-256 identity. The
workflow dispatcher loads that pinned material for both Spike 012 evaluator
phases and supplies it as the evaluator's operative instruction source; it must
not resolve `skills/evaluator/SKILL.md` from the potentially changed working
tree for those phases. The prepared evaluator freeze and the verification
result each bind the same bootstrap-authority identity. This exception ends with
Spike 012's human decision; it is not a new general skill-install mechanism.

## Design decisions

The authority recognizes legacy `classification` plus `secondaryFinding` and
new structured human findings through one normalized finding set. Only
`IMPLEMENTATION_GAP` and `EVALUATOR_COVERAGE_DEFECT` authorize a same-contract
cycle opening. `SPECIFICATION_CHANGE`, acceptance, duplicate consumption of a
rejection, or frozen-authority identity drift prevents it.

Cycle-local prerequisite checks replace spike-global completion booleans. A new
cycle starts with no implementation, verification, promotion, As-Built, or
human decision. A human implementation-gap opening permits its first new
implementation handoff without a fabricated failed verification; ordinary
technical-failure retry remains in the same cycle.

Evaluator repair is a distinct operation, not a `verify` side effect. It starts
only from immutable evaluator-defect evidence, preserves the source revision,
creates the next revision and private repair record, then runs full structural
integrity validation before recording the resulting revision as current. It
cannot alter frozen brief, Design Map, public evaluation requirements, or
acceptance semantics. A needed new public seam or semantic change blocks repair
onto the successor/methodology path.

## Invariants

- Verification finalizes its allocated attempt against exactly the frozen
  evaluator revision it started with; an evaluator defect is terminal evidence
  before repair begins.
- Every correction-cycle, evaluator-repair, attempt, and revision identity is
  append-only and never reused. Cycle 001 history remains queryable unchanged.
- PASS, promotion, As-Built, and a human decision satisfy prerequisites only in
  their own cycle.
- Spike 012's pinned pre-implementation evaluator contract governs its
  prepare/verify and any bootstrap recovery. Its newly implemented repair and
  correction-cycle facilities may be inspected and tested, but may not grade,
  repair, recover, or certify that bootstrap cycle before human acceptance.
- The Spike 011 regression fixture is derived from public preserved authority
  evidence and never opens or mutates Spike 011 itself.

## Implementation freedom

The internal authority representation, status JSON shape, private repair-record
format, executor command wiring, and test fixture location are free provided
the bindings and invariants above are observable. No public API beyond the
existing authority/status and workflow-run surfaces is required merely for
evaluator convenience.
