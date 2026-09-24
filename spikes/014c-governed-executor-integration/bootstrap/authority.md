# 014c Bootstrap Authority — Governed Evaluator Launch Path

**Status:** active human-authorized bootstrap; trust equivalence verified

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

The original conclusion was intentionally conservative and is retained above as
historical context. Human review identified the two identities as distinct
schemas rather than competing definitions. The equivalence evidence below
resolves that conclusion. This exception otherwise expires as soon as a
repository-owned governed adapter and a separately pinned independent evaluator
path are established; it cannot become a production executor.

## Addendum 1 — trusted manifest ↔ kernel definition equivalence

Read-only reconstruction used `buildMethodologyManifest` from
`src/methodology-evolution.ts` against exact revision
`0a3dafe8e103cc7376bdd7fae32493710613d0c0`. It reconstructed manifest
`sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`,
which exactly equals the final append-only trusted-history record. Resolving
the present kernel through `loadDefinition` produced the expected distinct
kernel-definition identity
`sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.

The representations agree component-for-component:

- policy: `sha256:c038371aa60236bd5a4dc907c8a7fde03755ebe89feab7b5724fd57701c31aca`;
- every active role's contract and skill identity, including evaluator v13;
- `prepared-coverage` and `verification-accounting`, each sourced from
  `src/methodologies/harness-public.ts` at
  `sha256:5323695f5917f969c90530d15048df4250c653cf1d8ab59a2dac2820fd2a3508`.

The trusted revision through this addendum changes no policy, active contract,
active skill, or validator source; the only methodology-related later change is
the append-only trust-history record. The bootstrap may therefore bind the
current kernel definition only as the verified projection of the stated trusted
manifest/revision, not as an independently chosen working-tree authority.

014c's permanent governed integration must enforce that same relationship: a
new Workflow Execution Grant must reject an untrusted working-tree methodology
edit rather than silently binding it. The implementation must include a
regression test that changes a relevant policy, role contract, role skill, or
validator after the trusted revision and observes an inspectable grant denial.

## Addendum 2 — evaluator workspace launch correction

The first three governed `evaluator-prepare` attempts were preserved as
`BLOCKED` infrastructure results. Their public evidence identifies the cause:
the bootstrap runner asked `buildClaudeWorkflowCommand` for the evaluator's
private working directory, then mistakenly spawned the provider in the public
repository directory. In Claude restricted mode that made the private evaluator
workspace an added read-only directory, so the worker correctly refused to
create private evaluation artifacts there.

The human-authorized smallest correction is
`tools/governed-claude-bootstrap.ts` at commit
`60f97be21bd0c1b57cca7a014a2785a3f8a44f55`. It uses the existing
`claudeWorkflowDirectory` helper from `src/claude-workflow.ts` for the spawned
process working directory. This changes neither the governed host, provider
command construction, role contract, capabilities, result protocol, nor
private-workspace exposure. It supersedes the executable pin in the
"Permitted correction" section only for the independently pinned evaluator
bootstrap. The old pin and all blocked attempts remain historical evidence.

The replacement runner must be a detached repository worktree pinned to that
commit, with the host itself launched from the same pinned revision. The
bootstrap exception remains limited to that path and expires when the
repository-owned governed adapters and pinned independent evaluator path have
been established.

## Addendum 3 — non-evaluator workspace mapping and private diagnostics

The three immutable implementation allocations `debd9069-1afa-4805-b694-e3ebc2f30a0e`,
`94cbb5ca-5ddf-4c27-80f7-35239f06152b`, and
`e29d059c-e8e6-432a-a7cb-d3cc8f40abd8` each granted only the public
repository workspace. The previous pinned bootstrap runner assigned every role
the `evaluator` permission-profile ID. Its evaluator-only directory selection
therefore resolved `workspaces[1]` for an implementation grant and failed
before Claude launched.

The human-authorized correction is
`tools/governed-claude-bootstrap.ts` at commit
`9d513624e2d4c10b5891222455dbcf81848574c0`. It maps only
`evaluator-*` roles to the existing `evaluator` profile and private workspace;
all other permitted bootstrap roles use the existing `repo-local-worker`
profile and their granted `workspaces[0]`. It neither creates a second
workspace nor changes evaluator revision 001, the frozen brief, Design Map,
methodology, host architecture, capabilities, or the historical failures.

`test/governed-claude-bootstrap.test.ts` deterministically reproduces the old
single-workspace evaluator-profile failure, then proves evaluator and
implementation workspace selection. The runner also writes bounded, sanitized
pre-launch or provider-phase failure diagnostics only to its provisioned
private bootstrap data directory. Diagnostics are not ledger events and never
enter public repository evidence; they distinguish launch configuration errors
from a provider failure without granting the worker new authority.

This pin supersedes Addendum 2's runner pin for future bootstrap allocations.
The detached host and runner must both be pinned to this exact revision before
another provider call. Earlier pins and all previous execution records remain
unchanged.

## Addendum 4 — evaluator-launch diagnostic recovery

Human authorization of 2026-09-24 permits one narrowly bounded operational
recovery of the independently pinned evaluator launcher. It is not evaluator
methodology correction, candidate implementation work, a new implementation
cycle, or authority to modify the frozen brief, Design Map, evaluation revision
001, trusted methodology, or 014a history. It permits one fresh,
evaluator-only, non-continuing Workflow Execution Grant with at most one
allocation after the correction's tests pass.

The three preserved evaluator verification executions
`ecf45129-8349-4b55-a52a-f8a907629db7`,
`743a6097-2e47-49bc-980f-7ea8397e5e7d`, and
`69d4513b-86c8-44af-a0ff-2438eb7a4f4d` all exited 1. The pinned `9d513624…`
runner retained only the empty stderr field, so its private diagnostic records
contain `Claude exited with 1:` for each. Although the runner had collected
stdout in memory, it neither retained it on nonzero exit nor retained its
deleted scratch workspace. Historical stdout therefore cannot establish an
authentication, permission, sandbox, configuration, or provider cause.

Comparison against the older working `src/workflow-backend.ts` establishes one
diagnostic-relevant difference, but not a cause: the backend overlays scratch
variables on its inherited process environment, while the bootstrap runner
passes only `PATH` and scratch variables. The evaluator runner's private
working-directory selection, capability-derived command, restricted settings,
and sandbox construction come from the same pinned pre-candidate helpers.
`claude --version` succeeds under the runner's narrow environment, so no
environment, authentication, or sandbox conclusion is inferred from the
difference and this recovery does not copy the parent environment.

The authorized correction is `tools/governed-claude-bootstrap.ts` at commit
`de195fee7ef1b7c68397835f997bc3960bb76d35`. For a nonzero provider exit it
records only private, bounded, allowlisted metadata: exit code, whether stdout
and stderr were present, whether stdout was structured JSON, and a recognized
provider error category/code. It never records raw stdout, stderr, evaluator
content, credentials, or host/session credentials. Deterministic tests cover a
structured authentication error and unstructured private-looking output;
focused tests, typecheck, lint, and targeted formatting checks pass.

The replacement runner is the detached worktree
`/tmp/harness-014c-bootstrap-executor-de195fe`, pinned to exactly
`de195fee7ef1b7c68397835f997bc3960bb76d35`. It supersedes Addendum 3 only for
the single authorized evaluator attempt. The host must use that exact
repository-owned executable; there is no generated bridge or candidate adapter
fallback. If the attempt fails, retain its private diagnostic and public-safe
failure classification, with no automatic retry.
