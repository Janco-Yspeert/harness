# 014c Bootstrap Authority — Governed Evaluator Launch Path

**Status:** inactive pending trusted-methodology provenance resolution

## Human authority

The explicit human authorization of 2026-09-23 permits one bounded
infrastructure bootstrap for Spike 014c. It permits local governed-host
provisioning and the smallest repository-owned executor correction needed to
launch the independent evaluator. It does not authorize a `/tmp` bridge,
legacy `/workflow-runs` mutation, handwritten canonical events, direct
provider dispatch outside Harness, evaluator self-evaluation, new paid API
usage, unrestricted provider permissions, or recovery of 014a.

## Permitted correction

`tools/governed-claude-bootstrap.ts` at commit
`d447e385018fd587809431d2f6e9363ddb304a66` is the only permitted bootstrap
executable. It is scoped to `014c-governed-executor-integration`, receives an
assignment only from the governed host's authenticated session endpoint, uses
the existing Claude command/permission construction in
`src/claude-workflow.ts`, and returns only a schema-constrained semantic result
to the governed host. It has no root credential, legacy workflow endpoint,
publication capability, or authority-writing operation.

It is intended to be pinned through a detached repository worktree at that
commit and selected only by a named bootstrap profile with repository-local
write access, private-workspace isolation, local computation, Git inspection,
and Git commit capability. Provider credentials remain outside the profile
configuration and worker environment. The tool creates only bounded scratch
data and deletes it after the provider process ends.

The pre-existing launcher cannot serve this purpose unchanged: its allocation
surface is the retired `/workflow-runs` API and its result surface is the legacy
`HARNESS_ROLE_RESULT` terminal parser. Neither is activated by this exception.

## Independent evaluator authority

The requested pre-014c evaluator authority is the current trusted evaluator
skill and prepare contract as observed before any 014c candidate adapter work:

- evaluator skill: `skills/evaluator/SKILL.md`, contract version 13,
  SHA-256 `0baace2d74de2c7f9768c2f7d46c4fab67d034f6ecb73da6c86dd18342e3de80`;
- evaluator-prepare contract identity:
  `sha256:a65ddd80eea69fae4e43b50f44864d21ad7c16c364a00244052fa29a39173e50`;
- trusted-record revision: `0a3dafe8e103cc7376bdd7fae32493710613d0c0`.

No evaluator allocation, provider call, canonical grant, result, transition, or
verification evidence has been produced under this bootstrap authority.

## Provenance blocker and expiry

Before host activation, inspection found a material mismatch: the final record
in `methodologies/harness/trusted.jsonl` names trusted methodology
`sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`,
while the repository's current definition and the latest canonical 014a kernel
definition both resolve to
`sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.

The bootstrap executable must not be activated until an explicit human decision
identifies which definition is authoritative or supplies a bounded correction
that restores the trusted-record binding. This exception otherwise expires as
soon as a repository-owned governed adapter and a separately pinned independent
evaluator path are established; it cannot become a production executor.
