# Outcome — 014k Trusted Methodology Successor Evaluation and Adoption

## Result and Exact Provenance

**COMPLETE — STANDARD.** Trusted methodology N independently evaluated and the
human authority accepted candidate
`f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`. Evaluator revision `004`
(`sha256:dd9e3a8a646f2fe862da843b36c2d7cff63f4ea01a9b0786230ddbf23f251c11`)
returned `PASS` on attempt `002`; the verification artifact is
`sha256:001af4733cedac7a70613b86d0bc54cb1c0824f4b05f2e033385a671fb0b3c36`.
The committed promotion record is
`sha256:2965c3f2264fade33941a7efae52ac21e552e319ffb0bdedab514fd057b67cf6`
at `ed99cd3`, and the completed As-Built is
`sha256:a69839d86b4e337f7667456e5a94416ed0ff1804cbee2f3098920bf83393d6e0`.
Human acceptance binds those exact identities.

The separately authorized adoption appended methodology sequence `6` at
`348f1a8644ec6bd40248a07431142777cce808fc`. The adopted methodology is
`sha256:da22079f636de3a498ec853dc6dd8785f3aa8daa387130c96ac9927b377301f2`;
its predecessor remains sequence `5`, methodology
`sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`.

## What Was Established

- Trusted N can evaluate a methodology successor without granting candidate
  N+1 authority over its own verdict. Prepared candidate observations remain
  bounded, identity-bound evidence rather than authority.
- Evaluator verdict and host archival state are separate facts. Attempt history
  distinguishes nonterminal, terminal and durably lost evidence, while host
  closeout derives archive contents rather than accepting evaluator-authored
  archival policy.
- Host promotion can archive the active evaluator state from the workflow-bound
  private root, scope allocations and promotion records to the active correction
  cycle, and preserve a valid earlier-cycle canonical archive before installing
  a later one. Identity drift, extra content and occupied-history conflicts fail
  closed.
- Methodology adoption binds the exact predecessor, candidate methodology,
  trusted-N result and closeout identity. It is distinct from evaluator `PASS`
  and human acceptance, and it refuses stale-head replay.
- The cutover worked through ordinary authority: after the sequence-6 append, a
  fresh Workflow Grant resolved N+1 through the normal trust-equivalence path.
  The pre-cutover grant remained pinned to sequence `5`.

## Implementation Summary

The candidate added a closed prepared-observation declaration, an evaluation
fact and closeout library, host-derived promotion, stronger adoption bindings,
and identity-checked earlier-cycle archive preservation. Runtime promotion uses
the grant-bound workspace and host-derived correction-cycle history. Tests cover
the declaration and closeout model, methodology promotion, workflow-private
archive resolution, correction-cycle scoping, preservation, rollback and
fail-closed cases.

## Evaluation Evidence

Final verification ran the exact candidate from a clean clone. All 15 frozen
criteria and mandatory executable procedures passed. The full suite reported
261 of 262 tests passing; the sole failure was the documented 014e containment
environment failure reproduced at baseline. The promoted cycle-4 archive binds
both revision-004 attempts: attempt `001` failed on the prior candidate, and
attempt `002` passed on `f64b552…`.

## Material History

The spike required four evaluator revisions and six verification attempts
across four correction cycles. The initial candidate failed AC06 and AC10; its
retry passed revision `001`. Three later evaluator corrections preserved prior
revisions and verdicts while adding frozen coverage for the real workflow-root
resolution chain, correction-cycle provenance, and preservation of an existing
canonical archive. Revision `002` and revision `003` each produced a PASS.

Under revision `004`, candidate `6e2cec8…` failed AC06, AC10 and AC15 because it
still refused an occupied promotion destination. The final implementation added
host-derived, identity-validating archive preservation and passed without moving
the evaluator contract. Earlier cycle-2 and cycle-3 histories remain preserved;
the maintenance used to close those old-N cycles is historical compatibility
evidence, not proof of the new N+1 behavior.

## Decisions

- Keep successor evaluation under predecessor authority until independent
  evaluation, closeout, As-Built and explicit human adoption authority all bind
  the same candidate.
- Treat prepared observations as declarations and sealed evidence, never as a
  path for candidate-selected private bytes or authority.
- Keep semantic verdicts immutable when archival operations fail; recover the
  archive without recreating the verdict.
- Derive correction-cycle and prior-archive provenance from host history, never
  worker or provider input, and preserve history forward-only.

## Discoveries

- A workflow-private source root is insufficient unless every archive
  allocation is also scoped to the active correction cycle.
- Recording cycle provenance is insufficient unless a later successful archive
  can safely preserve the already occupied canonical destination.
- End-to-end trust adoption needs proof after the append: reconstructing N+1 and
  allocating a fresh ordinary grant established that the cutover was usable and
  non-retroactive.

## Deferred Concerns

- `executeArchive` and `closeoutPermitted` remain library/test behavior; the
  runtime gate uses the established promotion action and `promotion-recorded`
  event instead.
- The observation declaration has no runtime consumer yet, as permitted by the
  frozen design.
- `human-adoption-decision.md` is not itself parsed by runtime code; adoption
  enforcement occurs through the exact authority fields supplied to the trusted
  promotion boundary.
- Making promotion artifacts optional in the protocol schema applies to all
  grants, not only host-derived archive grants. This broader surface should be
  revisited if another promotion mode is introduced.
- The known 014e sandbox-dependent containment test remained outside this
  spike's repair scope.

## Skill Versions and Workflow Cost

Material roles recorded in the manifest were Brief Readiness v5, Design Map v4,
Evaluator v14, Implementation v5 and As-Built v4; this Outcome uses v5. The
workflow recorded four evaluator revisions, six verification attempts and five
implementation runs including retries. Entries that report provider usage
record zero provider calls. Token and duration measurements were unavailable and
are not estimated. No prior manifest entry is labelled retrospective; this
Outcome entry is contemporaneous.

## Next Step

Use trusted methodology sequence `6` for new ordinary workflows and exercise
its observation and closeout contracts through those governed paths. Treat the
unwired library predicates and protocol-wide optional-artifact surface as
explicit follow-up candidates, not as changes to this accepted spike.
