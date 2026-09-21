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
fixture, disposable local checkpoint exercise, recursion rejection, monotonic
promotion, and unchanged existing workflow bindings.

## Kernel boundary

No `KERNEL_SUPPORT_REQUIRED` finding was disguised as worker prose or
methodology-specific runtime code. The complete generic-kernel handback remains
the frozen table in `design-map.md`. In particular, this candidate does not add
generic produced-evidence fields, conditional Role Result validation,
post-execution host-action requests, evaluator archival execution, private
postcondition validation, or protected Git workspace realization.

## Visible verification

The exact candidate methodology identity is
`sha256:d1b50f5633911a69a81071e6cf316056015e2c78223f8ca6349362713dbb1324`.
Candidate construction reports it as different from trusted methodology
`sha256:0ed6e2c936462ff00222e6e345bab8a600cc52428160cf17165992e3d50078d8`;
`check` returns valid, and an actual bounded `exercise` created a disposable
local commit while leaving the trusted identity unchanged and performing no
publication.

Visible verification completed successfully: all 107 `npm test` cases,
`npm run typecheck`, `npm run lint`, `npm run format:check`, and
`git diff --check`. Independent evaluator verification was not run by the
implementation role.
