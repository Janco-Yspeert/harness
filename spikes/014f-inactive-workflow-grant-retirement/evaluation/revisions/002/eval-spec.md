# Private evaluation specification — 014f (evaluator revision 002)

Authority: frozen `spike.md`, `design-map.md`, public `eval-requirements.md`.
Revision 002 supersedes the earlier published revision 001 (its private bundle is
not part of this workspace); no acceptance semantics differ. Revision 002 fixes
the AC07 evidence plan, which could not be adjudicated in a sandbox where
unrelated repository tests fail for environmental reasons.

## Coverage modes

| Procedure | Mode | Criteria |
| --- | --- | --- |
| E1 | executable | AC01, AC02, AC08 |
| E2 | executable | AC04, AC05, AC08 |
| E3 | executable | AC03, AC08 |
| E4 | executable | AC01, AC03, AC05, AC08 |
| E5 | executable | AC04, AC08 |
| E6 | executable | AC02, AC06, AC08 |
| R1 | public regression (non-executable, differential) | AC07 |
| P1 | provenance (non-executable, mechanical) | AC08 |

Executable procedures use only the public seams named by the Design Map and
eval-requirements TR1–TR4. Message wording is judged only by the markers the
Design Map requires ("retired", "already retired", "unknown workflow grant",
and no pre-implementation-recovery wording for a retired grant).

Deliberately NOT executably covered, preserving implementation freedom:
the exact `GET` listing body shape (only that it names each retired grant),
internal predicate shape, refusal wording beyond markers, and the
"already permanently revoked" refusal (reaching a revoked grant needs the
pre-implementation recovery fixture, outside the spike's contract; the
existing recovery regression in R1 guards it). Automatic continuation (AC03)
is evaluated through the identical request the host issues (EA5).

## Running (verify)

From the candidate's clean committed checkout (the public project root):

    HARNESS_EVAL_ROOT=<candidate root> node --test <private>/.hidden-test/e*.test.ts

All 11 cases must pass. Each case builds its own disposable fixture project
(temp dir, scripted policy, repository fixture executor); no Stockdif, network
or provider. A failing case is re-run in isolation (`--test-name-pattern`)
before classification; helper integrity is confirmed by `support.ts` having
matched its frozen identity in `freeze.json`.

## R1 — differential public regression (AC07)

1. Materialise the baseline: a detached `git worktree` of the base commit the
   Implementation role recorded for the candidate (`17bdde7…` for this cycle),
   with the same installed dependencies linked.
2. In the baseline tree and the candidate tree, same environment, run
   `node --test test/*.test.ts` and collect each test's name and ok/not-ok.
3. Pass condition: every test name that is `ok` at the baseline is `ok` at the
   candidate. A test failing at the baseline is environmental, recorded, and not
   attributed to the candidate. A baseline-ok test failing at the candidate is
   rerun in isolation once; persisting failure is `IMPLEMENTATION_FAILURE`.
4. At the candidate: `tsc --noEmit` exits 0 (or its diagnostics are a subset of
   the baseline's); `eslint` and `prettier --check` exit 0 over the changed
   files that exist at the candidate; `git diff --check <base>..<candidate>` is
   clean.
5. If the baseline suite cannot even start, record `INFRASTRUCTURE_FAILURE`.

## P1 — provenance (AC08)

- sha256 of `spike.md`, `design-map.md` and public `eval-requirements.md` equal
  the identities in `freeze.json`; every private bundle file matches `freeze.json`.
- The candidate is a commit; `git status --porcelain --untracked-files=no` is
  empty; the base commit is an ancestor of the candidate.
- No hidden case reads Stockdif state or live providers (the fixtures above).
Any mismatch is `SPECIFICATION_DRIFT`.

## Pre-freeze controls (performed during prepare, never on the candidate)

A discarded scratch reference was derived from the baseline using only the
Design Map. Controls: positive (reference: 11/11, three consecutive runs),
baseline negative (unmodified baseline: 0/11), and single-defect mutants each
detected: retirement not honored by inspection / by allocation / anywhere;
active-execution check removed; unresolved-request check removed; repeat made
non-refusing; allocation consumed; origin not human; cross-workflow binding
unchecked; host not root-guarded; recovery wording on retired denial; event not
classified as ledger mechanics.
