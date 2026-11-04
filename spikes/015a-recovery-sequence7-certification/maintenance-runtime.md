# Operator maintenance-runtime authorization — Spike 015a recovery

Date: 2026-11-03  
Status: authorized operator maintenance; applies before `evaluator-prepare`

## Authority and identity

The human operator authorized the maintenance runtime in the 2026-11-03
"Spike 015a Recovery: Authorize Maintenance Runtime and Resume" instruction.
That authority is narrowly limited to the defects recorded below and does not
adopt a new methodology or relabel the maintenance commit as the trusted
sequence-7 runtime.

- Trusted sequence-7 baseline:
  `3e753a4a732c87fc5b42e9e3cf771482aba6a522`
- Authorized maintenance runtime:
  `ee12d26238b9258f49ef9a2fa6db78d1ec243adc`
- Ancestry: the baseline is an ancestor of the maintenance commit.
- Methodology: existing sequence 7; its policy, role contracts, skills,
  public validators, and frozen acceptance inputs are unchanged by this
  maintenance commit.

The maintenance runtime is an explicit operational exception for this
successor workflow. It is not evidence that the original trusted runtime had
the maintenance commit's identity.

## Permitted runtime delta

The reviewed diff from the baseline changes only host/runtime integration code
and its tests:

- `src/executors/adapters.ts`
- `src/executors/governed.ts`
- `src/kernel/host.ts`
- `src/kernel/model.ts`
- `src/kernel/orchestration.ts`
- `src/kernel/resolver.ts`
- `test/external-project.test.ts`
- `test/governed-executors.test.ts`
- `test/orchestration.test.ts`

It corrects exactly three defects:

1. Claude readiness uses a host-selected readiness-only MCP allowlist
   (`mcp__harness__readiness`); governed worker launches retain the normal
   four-operation allowlist and do not receive that readiness operation.
2. Claude provider permission denial and required MCP connectivity failures are
   classified separately from provider authentication failure.
3. Retry-accounting mechanics no longer alter the already-derived launch
   intent. A bounded human-authorized operational retry therefore consumes the
   intended original allowance, while material input or execution-shape changes
   still produce a distinct identity.

No acceptance criterion, Design Map decision, frozen brief, public evaluation
requirement, evaluator content, workflow ledger, or workflow transition was
changed by this authorization record or by the maintenance commit.

## Validation evidence

The maintenance work completed deterministic type, lint, formatting, focused
behavioural, and diff checks. The focused tests cover readiness-only and
worker-only Claude tool permissions, authentication-versus-permission and
connectivity classification, retained authentication handling, retry identity
stability, changed-input identity distinction, bounded exhaustion, and
unaffected Codex selection.

A contained live readiness smoke used the registered `claude-sonnet` profile,
the real Claude command, Bubblewrap containment, and the real readiness MCP
server. It successfully invoked only `mcp__harness__readiness`. The smoke used
synthetic workspaces: it did not mount the recovery repository, candidate
escrow, or evaluator-private workspace, and it did not allocate a governed
role.

The full suite remains red. Five pre-existing failures were reproduced on a
pristine checkout of the trusted baseline using
`node --test test/governed-executors.test.ts`:

1. `014k AC06/AC10/AC15: a later-cycle promotion preserves the valid earlier archive atomically`
2. `014k AC06/AC10/AC15: changed, extra or occupied-history earlier archives fail closed`
3. `AC04/AC13: unregistered, generated, uninstalled or unenforceable launches cannot start`
4. `014k AC10/AC11: exact constraints fail before launch when generic adapter cannot attest`
5. `014h AC11: unavailable namespaces ...`

Those failures are outside this narrowly scoped repair. Other remaining full-
suite failures were not classified by this maintenance authorization.

## Scope and limitations

This record supplies durable public operator provenance for use of
`ee12d26238b9258f49ef9a2fa6db78d1ec243adc` while the successor resumes at
`evaluator-prepare`. It does not alter the original 015a workflow, its lost
evaluator revision, its incomplete verification attempt, or candidate
`92295e83fe0a6029ac12c0dae263f90ad6eea980`.

The successor's frozen public inputs remain:

- Brief: `sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`
- Design Map: `sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`
- Public evaluation requirements:
  `sha256:22ae63c1828c0db812a59b9e19c63c11500f2f46953459a9361425944dfc2b07`

The record does not expose implementation candidate material to evaluator
preparation and does not authorize any later role automatically.

## Readiness maintenance supplement (2026-11-04)

The human operator separately authorized the use of maintenance runtime
`e332b14e3754b84597b3dfe159bd15f370886562`, descended from
`f216b99b607305db11f143d2a8444fd096cf70db`, for the existing correction
Implementation grant only. It remains an operator-approved runtime exception,
not a replacement identity for the trusted sequence-7 baseline.

Its narrowly reviewed delta changes only readiness plumbing and tests:

- Codex readiness defaults to a bounded 60-second deadline (Claude remains at
  15 seconds); a validated executor-profile override is available only between
  1 and 120 seconds.
- A completed `mcp__harness__readiness` invocation is recorded as positive MCP
  connectivity evidence for adapters such as Codex that do not emit Claude's
  initialization event.

Focused readiness regressions, typecheck, lint, formatting, and diff checks
passed. A real Bubblewrap-contained Codex Sol Medium probe using synthetic
workspaces completed in 16,587 ms with exit status 0 and invoked only
`mcp__harness__readiness`; it exposed neither candidate C nor evaluator-private
material. The pre-existing full-suite failures listed above remain outside this
supplement.

This supplement neither changes methodology, frozen inputs, evaluator revision
001, candidate C, prior failed attempts, nor the canonical workflow ledger. It
authorizes one bounded operational retry only after the host confirms that the
existing correction-grant launch intent and authority bindings are unchanged.
