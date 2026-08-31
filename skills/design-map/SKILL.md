---
name: design-map
description:
  Establish the smallest shared design contract that independent implementation
  and evaluation must interpret consistently for a frozen Harness spike. Use
  after brief freeze and before evaluator preparation or implementation.
---

# Design Map

Contract version: 2

Answer one question: **what is the smallest shared design contract that
implementation and evaluation must interpret consistently?**

Read the frozen brief, relevant repository contracts, code, public interfaces,
and tests. Verify the brief's content identity and committed provenance. If a
material product, behavioral, scope, or architecture decision outside the
bounded authority below remains unresolved, stop; return to the brief, rerun
Brief Readiness, and refreeze.

First prefer evaluation through externally observable behavior. Establish a
shared structural contract only when implementation and evaluation would
otherwise need to guess independently and could choose incompatible but
individually reasonable seams.

The Design Map may make a bounded shared-contract decision when every valid
choice preserves the frozen product behavior and scope. Examples include a
stable construction or import surface, artifact location, ownership boundary,
lifecycle responsibility, or evaluation/testability seam genuinely required by
both roles.

It must not decide:

- externally observable behavior, product scope, or failure semantics omitted by
  the brief;
- architecture unnecessary for fair independent evaluation;
- algorithms, class hierarchies, dependencies, or file layouts that only
  implementation needs; or
- evaluator conveniences that could be replaced by a reasonable black-box test.

If a necessary decision changes observable behavior or the spike contract,
return to the brief, resolve it, rerun Brief Readiness, and refreeze. If only
implementation needs the decision, leave it as implementation freedom.

Write `design-map.md` beside the brief. Include only:

- shared contracts established by the map and their consequences;
- relevant structural decisions already settled by authoritative sources;
- relevant ownership, interface, lifecycle, persistence, or testability seams;
- invariants that hold across valid implementations; and
- meaningful implementation freedoms.

Do not invent product behavior, catalogue files, duplicate the brief, design
future architecture, or write an implementation plan. Do not leave a required
shared contract as an open question; decide it within the boundary above or
return to the brief.

Use a compact structure, omitting empty sections:

```markdown
# Design Map — <spike>

## Shared contracts

## Design decisions

## Invariants

## Implementation freedom
```

After writing and checking the map, make the `manifest.md` entry the final
repository-content step. Record its deterministic content identity, skill
version, result, and statistics reliably available through immediately before
that update. Capture a start baseline only for a directly measurable value; do
not create a provisional entry, estimate metrics, or measure the entry itself.
Commit and push the resulting checkpoint before evaluator preparation. A
material revision requires a new identity and invalidates downstream evaluation
where affected.

For authority-enabled spikes, record `design-map-frozen` after this checkpoint.
