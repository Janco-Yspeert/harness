# Brief Readiness Review — Spike 015

Reviewed: `spikes/015-separate-source-and-workflow-repositories/spike.md` (`sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010`), read completely.

(Earlier brief-readiness verdict: **Ready after minor clarification**; see git history for its full text.)

# Verification Feedback — attempt 1

Candidate `f2def40a5fe06701b499c24aaa0d8d5c70e80478`, evaluator revision 001. Result: **FAIL**, classification `IMPLEMENTATION_FAILURE`.

## Passing

- AC01-AC03 (legacy parity, split positive, refusal matrix), AC12, AC13: satisfied; public regression unchanged versus parent commit.

## Violated public requirements

- AC04-AC06 (repository-qualified lineage, refusal of wrong repository/stale/content/ancestry, partial checkpoints yield no transition): no committed deterministic coverage or behaviour beyond grant shape.
- AC07-AC09, AC11 (per-role access enforced through containment/launch, docs evidence only via host action, commit authority per workspace): only the grant `access` map and `assertSplitGrant` exist; no enforced path or host evidence channel to docs.
- AC10 (lifecycle roles and promotion archive resolve via docs ledger): not delivered.
- AC14 (recorded real-provider smoke): not run.
- AC15 (forward-only authority adoption of access/ownership changes): not done.

## Expected vs observed

Expected: the behaviours above, demonstrated by committed deterministic tests on real Git repositories and the real ledger. Observed: the implementation manifest itself declares these as not implemented.

## Safe diagnostics

Configuration cases ran 32/32 pass. Public `npm test` has the same single failing test on candidate and parent; typecheck clean on both.
