# Brief Readiness Feedback — Spike 014n (review 002)

Reviewed: `spikes/014n-finalized-verification-evaluator-correction-authority/spike.md`
(`sha256:8b5d3b4036306a225ff6de46dbd586a71b7d12a623a9fcd25207b4ae13d5263d`).

## Prior findings (review 001, `spikes/014n-finalized-verification-evaluator-correction-authority/preliminary/001/feedback.md`)

- B1 (eligibility/consumption machinery missing): resolved. The brief now puts
  the resolver and transition-validation seams in scope, defines consumption as
  a recorded `evaluator-repair-recorded` that binds the authority
  `semanticResult`, leaves failed/interrupted repairs unconsumed under the
  ordinary retry policy, and applies this to both source variants without
  changing the rejected request/evidence contract.
- B2 (request/authority shape): resolved. Discriminated `finalized-verification`
  variant on the same route, omitted discriminator = legacy, matched fields
  enumerated, Git re-read required, duplicate key defined by lineage
  (workflow, execution, attempt, candidate, evaluator revision).
- B3 (staleness): resolved. Five ledger conditions enumerated; currentness is
  derived from ledger order.
- M1–M4: resolved (BLOCKED-only admissibility, exhausted-allowance accounting,
  application ownership and acceptance evidence, `reason` as diagnosis).

## Blockers

None.

## Material clarifications (non-blocking)

- **C1. Duplicate key vs. legacy data.** Extending the duplicate key to
  `workflow, execution, attempt, candidate, evaluator revision` slightly widens
  the existing rejected-flow key (`src/kernel/execution.ts`
  `authorizeEvaluatorCorrection`). Implementers should treat any pre-existing
  rejected authority matching that key as a duplicate; the "unchanged rejected
  flow" test should not assert that a previously accepted request pair is still
  accepted when it shares the lineage.
- **C2. 014m currentness at application time.** The application requires the
  014m finalized verification to still be current under the staleness rules. If
  a later event exists in that lineage the mechanism will (correctly) refuse and
  the application step is blocked rather than bypassed. The 014m workflow
  ledger was not readable here, so currentness was not checked.

## Editorial

- "outside the exhausted automatic post-implementation allowance" could cite the
  counter's ledger field for the evaluator.

## Verdict

**Ready after minor clarification**

Limitations: 014m ledger and evaluator-private material not inspected; code
cited in review 001 not re-traced beyond that review. Files changed:
`feedback.md`, `manifest.md`. Checks run: complete reading of the brief, diff
against `preliminary/001/spike.md`; no tests executed.

---

# Verification feedback — attempt 2 (evaluator revision 002)

Candidate `04f2745558fa51432b6c4dffb219a611f00bd0df`. Result: `FAIL`, classification `IMPLEMENTATION_FAILURE`.

- **Violated requirement:** an unconsumed authority makes `evaluator-repair` eligible, including for a finalized `BLOCKED / INFRASTRUCTURE_FAILURE` source, without methodology/policy change and without special-casing that classification.
- **Expected:** after the authority is recorded, the resolver selects `evaluator-repair` (trigger = authority semantic result, source revision = bound revision); `implementation` and `evaluator-verify` stay ineligible; a recorded repair consumes the authority.
- **Observed:** the authority is accepted, but the resolver still returns the gate "infrastructure failure requires recovery before continuation"; `evaluator-repair` never becomes eligible and consumption cannot happen.
- **Safe diagnostics:** reproduced in isolation; legacy-flow controls and an arbitrary-classification source pass. Affected: AC01, AC03, AC04, AC08, AC10, AC11, AC12. Typecheck passes; methodology diff is empty.
