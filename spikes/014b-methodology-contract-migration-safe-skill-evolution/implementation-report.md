# Spike 014b Implementation Report

## Candidate shape

The candidate migrates all eight governed roles to local checkpoint ownership,
host-owned privileged actions, exact produced-commit reporting, consistent
result vocabularies, and the input/evidence boundaries frozen in the Skill ↔
Contract Fidelity Matrix. The active contracts and configured policy are under
`methodologies/harness/`; the corresponding agent contracts are the active
`skills/*/SKILL.md` files.

The safe-evolution entry points are:

- `src/methodology-evolution.ts` — the typed API for `candidate`, `check`,
  `diff`, `exercise`, future-workflow binding, and human-authorized `promote`;
- `tools/methodology.ts` — the machine-readable command surface for those five
  operations; and
- `methodologies/harness/trusted.jsonl` — append-only trusted-methodology
  history, initialized to the frozen pre-014b bootstrap methodology.

`test/methodology-evolution.test.ts` is the visible regression suite for stable
complete identities, trusted/candidate isolation, structural and authority
validation, component-level diffs, a deliberately contradictory skill/contract
fixture, candidate-bound disposable checkpoint exercise, recursion rejection,
revision/manifest promotion coherence, monotonic promotion, and unchanged
existing workflow bindings.

## Post-verification correction

The bounded correction keeps the original candidate shape and changes only the
three required defects:

- **D01:** `promoteMethodology` locates the repository containing canonical
  trust history, rebuilds the candidate from its exact claimed revision, and
  requires byte-derived manifest equality before appending a trust event. An
  independently supplied revision and manifest can no longer drift by ordinary
  handoff mistake.
- **D03:** `exerciseMethodology` loads the candidate's real `design-map` skill
  and contract, checks the role's checkpoint capabilities and declared
  `design-map.md` postcondition, commits that candidate-derived artifact in a
  disposable repository, and reports the exact role/component/artifact
  identities. It neither publishes nor changes trusted methodology history.
- **D05:** the implementation contract now selects the current
  `verification-finalized` event after the corresponding handoff only when it is
  classified `IMPLEMENTATION_FAILURE`, validates the committed public
  verification record, and binds that exact identity as retry feedback. The
  evaluator and implementation skills agree that this sanitized public record
  is the machine-bound retry authority; no ambient discovery or orphan
  transition remains.

The small generic input-event selector (`eventFields`, `current`, and `after`)
exists solely to make that exact binding real at allocation time. It reuses the
existing event predicate semantics rather than adding a feedback registry or a
new workflow phase.

## Kernel boundary

No `KERNEL_SUPPORT_REQUIRED` finding was disguised as worker prose or
methodology-specific runtime code. The complete generic-kernel handback remains
the frozen table in `design-map.md`. In particular, this candidate does not add
generic produced-evidence fields, conditional Role Result validation,
post-execution host-action requests, evaluator archival execution, private
postcondition validation, or protected Git workspace realization.

## Visible verification

The corrected candidate methodology identity is
`sha256:f8a08dfe1017f222fe168726180705e35c38e30585b9852cd48bad0d41cdb129`.
Candidate construction reports it as different from trusted methodology
`sha256:0ed6e2c936462ff00222e6e345bab8a600cc52428160cf17165992e3d50078d8`;
`check` returns valid with no diagnostics, and an actual bounded `exercise`
used the candidate `design-map` role to create a disposable `design-map.md`
checkpoint while leaving the trusted identity unchanged and performing no
publication.

Visible verification completed successfully: all 109 `npm test` cases,
`npm run typecheck`, `npm run lint`, `npm run format:check`, and
`git diff --check`. Independent evaluator verification was not run by the
implementation role. No evaluator preparation, evaluator promotion,
methodology trust promotion, canonical transition, direct publication, or push
was performed.
