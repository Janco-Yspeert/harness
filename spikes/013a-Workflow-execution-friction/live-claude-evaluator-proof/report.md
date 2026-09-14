# Live Claude evaluator launch proof

This is public execution-path evidence from an isolated live-launch exercise.
It proves that canonical Harness authority resolved the pinned evaluator
bootstrap and that the real Harness host launched a separate real Claude
evaluator process. It is **not** a technical verification PASS and does not,
by itself, establish AC08, AC09, or AC34.

## Isolated control and allocation

The negative control submitted a delegated `evaluator-verify` request before a
new allocation existed. It returned HTTP 400 before process launch because the
verification allocation did not bind the current implementation handoff. No
Harness-owned Claude child was launched.

The disposable canonical verification allocation used:

- implementation commit: `77a23e89ef4718d2c93506c01ed42e0634109ecd`
- implementation attempt: `3`
- verification attempt: `4`
- public evaluator revision: `"001"` (the value required by the current
  validator)

## Host and child evidence

- Harness run ID: `1822f618-4735-47ff-8265-7045c50dafc4`
- Harness host PID: `2148424`
- real child Claude PID: `2150883`
- Claude executable: `/home/velveteen/.local/share/claude/versions/2.1.270`
- Claude Code version: `2.1.270`

The child was a direct child of the real Harness host. It remained active for
more than seven minutes, used the disposable private evaluator workspace as
its working directory, and used the disposable public worktree as its declared
additional workspace.

## Harness-resolved binding

- role: `evaluator-verify`
- executor: `claude`
- methodology attempt: `3`
- permission profile: `evaluator`
- frozen evaluator bootstrap contract version: `11`
- frozen contract identity:
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`
- contract delivery mode: `claude-system-contract`
- canonical authority basis: `verification-allocated`
- pinned source commit: `fae05912f59f8ebdb8982ab16deb26e293754647`
- pinned source: `skills/evaluator/SKILL.md`
- snapshot: `bootstrap/evaluator-skill.md`

The caller supplied none of: `skill`, `skillVersion`, contract contents, a
system prompt, or `verificationAuthority`. Harness resolved the canonical
authority, bootstrap snapshot, and Claude system-contract delivery itself.

No `HARNESS_ROLE_RESULT` was emitted before cancellation. The run was
explicitly cancelled through Harness for cleanup and therefore remained
semantically pending. The disposable public and private state was removed, and
the real public and private repositories remained unchanged.

PROVED: canonical Harness authority → exact frozen evaluator v11 → separate real Claude evaluator execution
