# Evaluation Specification

## Status

Frozen.

## Source

- spike path: `spikes/009-workflow-tightening`
- project commit: `01b9f24`
- brief: `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`
- Design Map: `sha256:46d2822e9a8498b9bd470a73afd151fd907b594f3c652f8fa064d131780c726a`
- evaluation requirements: `sha256:7cdff1c201e9a514348f805c9a14dc152832646eb18a89b8915c869de9cc5386`
- evaluator skill: `skills/evaluator/SKILL.md`, evaluator v7,
  `sha256:ca26532a3011caef8de2f027c6bb32be81d46bd451cc855db1bd0ad8983fd238`
- evaluator revision identity: recorded in `.eval/freeze.json`

## Pre-Freeze Integrity Gate

The test helper uses the public command and JSON status surface only. Its
positive controls are the expected completed workflow sequences; its negative
controls are the unimplemented 008 runner, which fails the new requirements.
Each case uses fresh temporary state, fixture executors on `PATH`, and cleanup.
The current repository compiles and the suite executes; its failures before
implementation are contractual rather than harness failures.

## Explicit Requirements

- R1: independent implementation and verification attempt numbering, including
  blocked evaluator recovery against unchanged implementation.
- R2: executor selection is role-based and defaults remain practical.
- R3: executor launch failure is retryable without consuming a phase attempt.
- R4: newly-created local operational state is owner-restricted.
- R5: tooling moves outside `src/` while invocation and prior behavior remain.

## Derived Invariants

- I1: each verification record identifies its evaluated implementation attempt.
- I2: public/evaluator role selection is independent.
- I3: launch failure is not a terminal workflow outcome.
- I4: permissions do not depend on the invoking umask.
- I5: no Harness runtime path depends on the tooling module.

## Negative Requirements

- N1: no provider framework, evaluator-private access, or automatic result
  classification is introduced.

## Evaluation Cases

- E1: mandatory recovery paths; verifies R1/I1 in `attempt-recovery.test.ts`.
- E2: mandatory independent selection; verifies R2/I2 with fixture executors.
- E3: mandatory launch recovery; verifies R3/I3.
- E4: mandatory mode checks; verifies R4/I4.
- E5: mandatory module-boundary check; verifies R5/I5/N1.

## Coverage Matrix

R1/I1: E1; R2/I2: E2; R3/I3: E3; R4/I4: E4; R5/I5/N1: E5. All are
executable in the named hidden tests and correspond to `.hidden-test/manifest.json`.

## Out of Scope

Internal state schema, launch-failure record shape, command construction
details, and workflow correctness outside this spike's changed boundaries.

## Limitations

The suite checks mode bits on the Ubuntu POSIX host; it does not evaluate ACLs
or alternate filesystem semantics.

## Revision History

Revision 001 — initial frozen suite.
