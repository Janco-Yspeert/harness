# Design Map — Spike 010 Workflow Authority

## Shared contracts

- The public authority interface is `npm run workflow -- authority <command>
  <spike> ...`. `status` emits one JSON document containing reconstructed
  canonical state, ordered history, legal transition names, blocked transition
  reasons, and whether human acceptance is required. Existing top-level
  dispatch/status/cancel remain operational convenience only.
- `authority validate <spike> <transition> <evidence-json>` performs the same
  validation as `record` without mutation; `authority record` appends exactly
  one accepted transition. Both produce machine-readable JSON. Rejection is
  non-zero, reports the violated invariant, and leaves public canonical history
  unchanged.
- Canonical history lives at `<spike>/workflow.jsonl`: append-only, public,
  one JSON transition per line. `.workflow/` remains ignored operational state.
- Every transition carries a transition identifier, timestamp, and only the
  public evidence needed to reconstruct state. Content identities use
  `sha256:<hex>` and Git evidence uses immutable commit IDs. The authority
  verifies claimed public files and commits before recording them.
- The stable transition vocabulary is: `brief-frozen`, `design-map-frozen`,
  `evaluation-prepared`, `implementation-handoff`, `verification-allocated`,
  `verification-finalized`, `promotion-recorded`, `as-built-recorded`,
  `human-accepted`, and `outcome-recorded`. Evidence schemas are public CLI
  input and may be documented in `workflow --help`; only relevant fields are
  required per transition.
- Verification allocation binds verification ID, implementation attempt/commit,
  and evaluator revision. Finalization may only target that allocation and
  supplies one terminal result plus one evaluator classification. PASS permits
  promotion; an implementation-failure FAIL permits the next implementation
  handoff; evaluator-defect BLOCKED permits a new evaluator revision without a
  new implementation.
- Promotion evidence references the committed public `evaluation/promotion.json`
  and must mechanically agree with the allocated passing verification. As-Built,
  human acceptance, and Outcome are separate guarded transitions.

## Invariants

- Canonical state is reconstructed only from `workflow.jsonl`, never from
  process dispatch, logs, manifests, or conversational claims.
- The authority validates provenance and structural consequences, never hidden
  evaluator content, quality, failure cause, or strategic choice.
- Same-user direct edits remain outside this cooperative interface's protection.
- The guarded interface is used for Spike 010's post-implementation handoff,
  verification allocation/finalization, promotion, As-Built, acceptance, and
  Outcome wherever their evidence exists.

## Implementation freedom

- Reducer shape, JSON field ordering, hash/Git helper design, error text,
  transition timestamp source, and public evidence-field implementation details
  are free provided the stable commands and relationships above hold.
- Skills may call the CLI directly or through small local helper commands; they
  must not treat a successful process dispatch as canonical advancement.
