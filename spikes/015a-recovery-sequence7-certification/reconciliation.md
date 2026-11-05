# Reconciliation — Spikes 015 and 015a

Audit date: 2026-11-05. This is an observation record only. It does not alter
workflow state, methodology, runtime selection, or Git refs.

## Conclusion

Spike 015a successor certification is complete and valid for candidate
`5df58ccd70b8fc8954f7497279d823ab2088842d` (D), not for the original
candidate `92295e83fe0a6029ac12c0dae263f90ad6eea980`. D is a recovery-derived
successor, not a byte-identical or ancestral continuation of the original.
The original Spike 015 `FAIL / IMPLEMENTATION_FAILURE` remains historical fact;
neither it nor its evaluator is retroactively converted into a PASS.

## Candidate and certification reconciliation

| Item | Identity | Classification |
| --- | --- | --- |
| Spike 015 technical baseline | `1159f66422796c14a68428990ae93768ce3102fd` | Historical, retained |
| 015a isolated pre-prepare base | `2e8e9bb797226dd23ac6b5cc15fe9578e8daa54e` | Historical, retained |
| Original 015a candidate | `92295e83fe0a6029ac12c0dae263f90ad6eea980` | Historical, local-only named line |
| Recovery integration candidate C | `62e78d481c061881c9aa971d9b74512ca18174b8` | Superseded by D after static-check failure |
| Certified candidate D | `5df58ccd70b8fc8954f7497279d823ab2088842d` | Accepted successor |
| Certification Outcome | `2f2fd6f0fac71f433ad697934be8264ac87adff8` | Integrated on GitHub `feat/spike-015a` |

Both `92295e83` and D descend from `1159f664` and `2e8e9bb`; their merge base
is `2e8e9bb`. Neither candidate is an ancestor of the other. The implementation
patch identities differ:

- `2e8e9bb..92295e83`: `d40c4a0c72cf811dbdbee2a632d1a0d304bb9593`
- recovery base `ee7f424..62e78d4`: `d4c35933d877a048a9bc6b81feeb722fd868b8a8`
- `2e8e9bb..5df58ccd`: `db12fbebe35214d44b1b02b42d7b05c46d8cb618`

That negative equivalence check is intentional and material: D includes
recovery-specific public artifacts and fixes to static TypeScript/lint/format
defects found after C. Its source tree therefore must not be described as a
byte-for-byte copy of `92295e83`. The positive evidence is the successor
evaluation: revision 001, attempt 003, `PASS`, with BC01–BC11 all SATISFIED,
and the inherited Spike 015 AC01–AC13 obligations in scope. Promotion identity
is `sha256:19e4b8d47306ee18085168f068f5eddb94990bcbd3521a11a8c7ccad771dd7d9`.

No loss of frozen 015a requirements was found. This proves the accepted
contract for D; it does not prove arbitrary source-tree equivalence to the
original failed candidate.

## Runtime and methodology identities

| Role | Identity / location | Classification |
| --- | --- | --- |
| Trusted sequence-7 methodology | `3e753a4a732c87fc5b42e9e3cf771482aba6a522`; manifest `sha256:bea2ae256165b900a40e4cefd0fa98cfad665b5511bf2107f02b785f3fe00eea` | Historical trusted predecessor |
| Approved maintenance runtime | `c7ffb1ca56db5ef8df0ec7fe283c7c263fe2bea7` | Needed maintenance exception; not methodology adoption |
| Persistent pinned runtime worktree | `/home/velveteen/vk-code/harness-015a-maintenance-runtime`, detached at `c7ffb1ca` | Preserved, idle |
| Runtime actually listening on `127.0.0.1:31961` at audit | `/tmp/harness-015a-readiness-diagnostics/src/index.ts`, commit `c7ffb1ca` | Same bytes/commit, but temporary execution location |
| Accepted successor repository | `/home/velveteen/vk-code/harness-015a-recovery`, `feat/spike-015a` at `2f2fd6f` | Published certification record |

The temporary runner is not lost—`operator/015a-readiness-diagnostics` is
published at `c7ffb1ca`—but it should be stopped and restarted from the pinned
persistent worktree before future operator work. That is housekeeping, not a
reason to alter the completed certification.

## Generic runtime maintenance

All entries below are absent from `origin/main` (`529424fd969d7b9bacb4775c5a62dd7a268e1a48`).
They are reachable from the published maintenance branch
`operator/015a-readiness-diagnostics` at `c7ffb1ca`.

| Commit | Fix | Classification |
| --- | --- | --- |
| `ee12d26238b9258f49ef9a2fa6db78d1ec243adc` | Claude readiness-only MCP allowlist; permission-denial classification; operational-retry launch identity | Outstanding for maintained codebase |
| `f216b99b607305db11f143d2a8444fd096cf70db` | Provider readiness diagnostics and tool-invocation evidence | Outstanding for maintained codebase |
| `e332b14e3754b84597b3dfe159bd15f370886562` | Completed Codex readiness probes | Outstanding for maintained codebase |
| `7210c9c8c25b182c2c0327c5ecb269353074dbf6` | Legacy evaluator attempt-ledger normalization for archive derivation | Outstanding for maintained codebase |
| `c7ffb1ca56db5ef8df0ec7fe283c7c263fe2bea7` | Active evaluator-root archive paths | Outstanding for maintained codebase |

`c7ffb1ca` is a replay of the same active-root archive patch as
`1c206039c8873a2bffa894b36e76db7746cf26bd` (identical stable patch id
`850cd9a3cee638df5c7edd387720464d0b1b037d`). The latter is already published
on `feat/spike-014`; integrate that correction once, not twice.

Related but separate historical maintenance includes
`214d549d28acb9f52c7e8c7f0aada32d69788754` (one-use 014m attempt-ledger
migration) and its predecessor `5129ce16db544193c57c92790bc8695e035b1579`.
They are not in `origin/main` and are not substitutes for `7210c9c8`; assess
them independently during runtime consolidation.

The Spike 015 readiness hardening `1159f664` is in D's ancestry and therefore
reachable from the published successor branch, but `origin/feat/spike-015`
still points only at `d4479fd083529169fafd09f1155a19c31ba7d01d`.

## Branches, worktrees, and retention

- GitHub `feat/spike-015a` is `2f2fd6f`; it contains the recovery certification
  and Outcome. It deliberately replaces neither the meaning nor the verdict of
  original 015.
- The original repository's local `feat/spike-015a` remains at `92295e83`, four
  commits ahead of its stale local tracking ref. It contains the original
  015a prepare checkpoint `9f65c63e` and candidate `92295e83`, neither of
  which is represented by the recovery's canonical evaluator history.
- Local `feat/spike-015` is at `1159f664`, one commit ahead of its remote
  tracking ref. Its source change is also duplicated by detached experiment
  `29eb21bbb2e6a4d3d7c324e49086704ab622d8d3`; the two have the same stable
  source patch id `c5fa6b34073b311111c1225c5a484d05e9f15492`. The detached
  experiment has no unique value.
- `operator/015a-claude-readiness-repair` at `ee12d262` is locally named, but
  its work is preserved as an ancestor of published `c7ffb1ca`.
- Recovery evaluator directories, ledgers, fixture directories, `node_modules`,
  and old `/tmp` worktree registrations are untracked host residue, not commits.
  Do not add evaluator-private files to Git. Prune them only after explicit
  retention and process-shutdown decisions.

## Minimal ordered integration plan before sequence-8 adoption

1. Preserve the original 015a line under a distinct immutable remote ref (for
   example `archive/spike-015a-original-candidate` at `92295e83`) before any
   worktree cleanup. Do not force-push it over the certified successor branch.
   Publish/update the original 015 historical ref only with its existing FAIL
   evidence intact.
2. Stop the temporary `c7ffb1ca` host and restart it from the verified
   persistent `c7ffb1ca` worktree. Keep the temporary directory until the
   replacement has started successfully.
3. Create a normal integration branch from the maintained target after fetching
   it. Port reviewed runtime fixes in dependency order: `ee12d262`, `f216b99b`,
   `e332b14e`, `7210c9c8`, then exactly one active-root archive patch
   (`1c206039` or `c7ffb1ca`). Review `5129ce16`/`214d549d` separately; they
   solve a distinct older migration problem. Run their focused regressions and
   the normal static suite on the integrated branch.
4. Integrate the Spike 015/015a implementation through the normal PR path with
   an explicit candidate/provenance decision. A squash or rebase creates a new
   commit identity, so it is **not** the certified D and cannot inherit D's
   exact-commit verdict by prose. Either preserve D's exact committed lineage
   through an allowed integration mechanism, or certify the resulting
   integration candidate under the existing methodology before adoption.
5. Only after the maintained branch has a verified candidate, runtime fixes,
   durable evaluator storage, and preserved original history should a human
   consider sequence-8 adoption. Adoption remains separate from the required
   fresh post-adoption split-workflow smoke.
