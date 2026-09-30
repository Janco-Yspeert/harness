# Candidate evaluator subject 002

**Status:** Durable, public-safe, non-authoritative candidate-subject evidence.
This is not a 014g verification result, evaluator revision, promotion,
methodology adoption, acceptance, or workflow transition.

## Purpose and provenance

Trusted-N verification attempt 004 (`370e66df-cdb6-4104-827f-308f70b9404b`,
public result commit `dd89324`) passed its trusted-N checks but finalized
`BLOCKED / INFRASTRUCTURE_FAILURE` because it had no provider runtime or
bootstrap authority for the mandatory bounded N+1 subject. These disposable
subjects supplied that missing observation without authority over the real
014g workflow.

Both subjects used a disposable sequence-1 trust root over exact candidate
`651352329cca473fb920139e1496f9f508eeabbb`. They could neither advance 014g nor
establish methodology trust. Their evaluator contract was the candidate's
contract `sha256:8f0583a9ae99dec5df4ee38bc30e0ee0c2cda36ec028a04028db3a9cabf92cae`.

## Fixture attempt A — preserved infrastructure failure

- Execution: `ebce77c7-c3ea-49b4-b345-499850496710`.
- Role Grant: `sha256:dcf5f9fcf9a0034d5335446642a286ccdb507fc4d473ce11b729012a336c4753`.
- Candidate identity was bound by the grant, but `git rev-parse HEAD` could not
  resolve because the disposable Git worktree metadata lived outside the
  subject sandbox.
- The frozen 014e command failed before selecting any test because the external
  `node_modules` symlink was not traversable and package `ws` could not load.
- The subject did demonstrate a denied repository write and a successful
  evaluator-private write.
- Its bounded evidence action succeeded as
  `f3f6fa28-acaf-4dd7-96bc-f091e487e50c`, publishing report identity
  `sha256:3882470d0116a2764b48877fb5246082e2f3f3770703fc5f945f1eb8c814df5a`.

This attempt is retained because it truthfully exposed fixture defects. It does
not establish AC03.

## Fixture attempt B — exact candidate and frozen test execution

- Execution: `2671643d-c3f0-4b7c-8ad4-fe201b735800`.
- Role Grant: `sha256:6aca9c68da2ed8839f22d8fb1105fba38629e5c5fe867fb247c66793d41de781`.
- Provider runtime reported by the host: `claude-sonnet-5-5` through the Claude
  Agent SDK.
- `git rev-parse HEAD` reported exact candidate
  `651352329cca473fb920139e1496f9f508eeabbb`.
- `git hash-object test/external-project.test.ts` reported frozen blob
  `4b361f81e307e129be6d106c9df9a4910e674be9`.
- Public repository workspace: `read`.
- Evaluator-private workspace: `write`.
- Capabilities: `repository-read`, `local-computation`, `git-inspect`; no
  `repository-write` or `git-commit`.
- Evidence action allowlist: `verification-result.json`, `manifest.md`, and
  `feedback.md`. The subject had no real-014g result or workflow path.
- The bounded evidence action succeeded as
  `6cc2fb55-ad7c-436f-a5dc-4ff8b3154ec9`, publishing report identity
  `sha256:0fe3a85bafb5f34e49d3ee563da7d298cca3fe44fa57bf93e9a2c3096b6bc097`.

### Frozen 014e result

Command:

```text
node --test --test-name-pattern='^014e' test/external-project.test.ts
```

Exit status `1`; TAP summary: 17 tests, 16 passed, 1 failed, 0 skipped.
Every selected title ran exactly once. The sole failure was:

```text
014e AC03/AC04/D4: contained public and protected workers see only their
granted workspaces, no Harness writes and no Git credentials
```

The material assertion difference was:

```diff
- 'write-harness': 'no'
+ 'write-harness': 'yes'
```

The other sixteen 014e tests passed, including both nested-sandbox H3 cases and
both H4 Codex permission-profile cases. No test or assertion byte was modified.

### Boundary observations

- A harmless repository write through the shell was denied by the Claude tool
  permission layer; the dedicated write tool was unavailable and no repository
  probe file was created.
- A harmless evaluator-private write was also denied by the tool permission
  layer, so this execution did not demonstrate the grant's declared private
  write capability.
- No arbitrary home, credential, sibling-project, or unrelated temporary path
  was read.
- The subject did not classify the 014e failure as candidate, evaluator, or
  infrastructure fault. It emitted no authoritative verdict.

The subject process ultimately ended without an accepted semantic-result
handshake after its intentionally non-authoritative result was rejected. That
does not erase the host-confirmed evidence action or its published bytes.

## Adjudication boundary

This evidence establishes the exact candidate, candidate methodology
composition, registered provider runtime, unchanged frozen test blob, raw test
result, and bounded host evidence action. Only unchanged trusted evaluator
revision `002` may decide what those observations mean for 014g.
