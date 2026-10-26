# Outcome — Spike 014m Pre-Semantic Implementation Correction

## Result and exact provenance

- Result: **COMPLETE — independently evaluated PASS** (completion mode `STANDARD`).
- Accepted candidate: `3e753a4a732c87fc5b42e9e3cf771482aba6a522`.
- Frozen brief `sha256:d0623b61…f224`; Design Map `sha256:a07c99f8…973d`.
- Final verification: attempt 015, evaluator revision 005
  (`sha256:a69d0f41571f4302143145fed3f51f420f4b46104a4dea13d8e694d1d1546134`),
  `PASS`; `verification-result.json` `sha256:42841121…5239`.
- Promotion record `evaluation/promotion.json` `sha256:d7b79ae5…fbdc`
  (checkpoint `874395c9`); As-Built `sha256:263c3b97…74f4` (`e101370c`).
- Post-acceptance: human adoption (`22dd3978`) as trusted methodology sequence 7
  (`ddbfe280`); cutover proof recorded at `82b0c25c`.

## What Was Established

- Proven (independent evaluation): Harness can authorize one human-approved
  implementation correction when host-owned evidence shows a downstream role
  launch failed before semantic allocation and operational retries are
  exhausted, without fabricating an evaluator verdict (AC01–AC12 satisfied).
- Observed (cutover evidence, not independently re-evaluated): after adoption
  and restart, the preserved 014l failure resolved to a fresh Workflow Grant at
  sequence 7 with `implementation` as next role and the correction bound as an
  input; the pre-cutover grant remained pinned to sequence 6. The correction
  itself was not executed in this proof.

## Implementation Summary

One configured human decision, `authorize-pre-semantic-implementation-correction`
(records `pre-semantic-implementation-correction-authorized`), backed by a small
kernel evidence resolver because the policy predicate language could not express
the required relationships. The resolver derives the candidate, downstream role,
launch intent, latest launch attempt, retry-exhaustion identity, operational
failure class and scope; the caller must repeat them exactly and add a reason and
concrete defect descriptions. The authorization is content-identified, projected
into the Role Grant and worker context, retained across failed/interrupted
retries, and consumed by the next successful handoff. The implementation skill
advanced to v6. No new ledger, dependency, or automatic outage classification;
existing evaluator and post-verification correction paths untouched.

## Evaluation Evidence

Attempt 015 passed: oracle self-check 4/4; contract-surface matrix on the real
decide/resolve path; differential full suite against baseline `11334109` showed
no candidate-only failures (two environmental failures on both); bootstrap
boundary confirmed (trusted sequence 6 governs the verdict, the candidate does
not govern itself). AC13/AC14 were deferred to post-acceptance adoption and
cutover, which are now recorded. Limitation: no live provider was exercised.

## Material History

- A candidate was first written on explicit operator request (`295dd4ae`), then
  re-done under governed implementation after audit; the manifest does not claim
  the earlier work as governed evidence.
- Attempts 7, 12, 13, 14 were all `BLOCKED`: infrastructure (read-only sandbox),
  evaluator defect (implementation-shaped structural check), evaluator defect
  (literal fixture-token check), infrastructure/coverage (full-suite
  containment failures, trusted-N unavailable). No implementation failure was
  ever found.
- Evaluator revisions 002–005 repaired these without changing acceptance
  semantics; 004 made regression evidence differential and deferred AC13/AC14;
  005 restored AC12 as required at candidate verification. Revisions 004/005
  were human-authorized under bounded root authority.
- Attempt 007's archive was lost; promotion proceeded through a declared
  archive-loss recovery (`recovery/archive-loss-declaration.json`), preserving
  the final accepted attempt and revision.

## Decisions

- Operational classification stays operational; human reasoning does not turn it
  into an evaluator classification.
- Candidate adopted as sequence 7 only via the trusted sequence-6 boundary.
- Cutover is non-retroactive for existing grants.

## Discoveries

- A methodology-only solution was insufficient; a minimal kernel resolver was
  needed to enforce the bindings.
- Four of five verification attempts were blocked by evaluator/environment
  problems rather than the candidate — evaluator design cost dominated the work.
- Candidate-bootstrapping needs an explicit rule: the predecessor trusted
  methodology governs the candidate's verdict.

## Deferred Concerns

- Actually executing the 014l correction under sequence 7 (only resolution was
  proven).
- Broad parallel test suite is unreliable as acceptance evidence (shared
  fixtures/retry ledgers); sandbox limits blocked some existing integration tests
  during implementation.
- Archive loss for attempt 007 remains a recorded historical gap.

## Skill Versions and Workflow Cost

Material skills: brief-readiness v5, design-map v4, evaluator v14 (preparation,
verification, repair), implementation v5 (governed) / v6 (candidate; the
advanced contract in the final revision), as-built v4, outcome v5. Several
manifest entries (repairs, later verifications) are terse and lack execution
identifiers; runtime token and wall-clock statistics were unavailable. Cost:
five verification attempts and four evaluator revisions for one implementation
candidate.

## Next Step

Allocate the preserved 014l correction under sequence 7 and have implementation
consume the bound authorization.
