# Correction directive — implementation attempt 13 (cycle 002)

## Authority

Explicit human root authority. Cycle `002` remains open. Current canonical
implementation handoff: attempt `12`, candidate
`2c8bdb78d56dad19253dc634ae3ab57552f7e716`. No verification has been
allocated since that handoff. This is implementation attempt 13, building on
attempt 12 — preserve all existing history, do not fabricate or rewrite it.

## What already happened, and why you are being dispatched

Two prior implementation workers (attempts 11 and 12) completed real
implementation and check work but could not finish their own git
publication: the ordinary Claude execution path never translated Harness's
resolved permission-profile capabilities (`git-inspect`, `git-commit`) into
actual Claude command permissions, so a worker holding those capabilities
was still blocked at `git add`/`commit`/`push` by its own session's ambient
allowlist, and the orchestrator had to finish publication manually both
times. That was real, repeated workflow friction, contrary to the goal of
this whole spike.

The orchestrator has already made the underlying Harness-execution
correction directly (explicitly authorized to do so for this narrow,
infrastructure-level fix, since no worker process could have its
already-launched permissions changed in place). The working tree right now
contains **uncommitted** changes to:

- `src/claude-workflow.ts` — a shared `resolveClaudeCapabilityTools()`
  helper now used by both the ordinary and protected/system-contract Claude
  execution paths. Git capabilities are translated to bounded per-subcommand
  `--allowedTools` entries (`Bash(git status *)`, `Bash(git diff *)`, etc.)
  instead of the previous blanket `Bash(git *)`. The ordinary path now also
  passes `--setting-sources ""` and `--permission-prompts none` so its
  effective permissions are deterministic and Harness-owned rather than
  dependent on the launching account's ambient `.claude/settings.local.json`
  — that dependency is exactly what caused the friction. Evaluator-specific
  isolation (hidden workspace, strict OS sandbox, system-prompt replacement)
  is unchanged and still exclusive to protected execution.
- `src/workflow-run.ts` — added a `git-publish` capability (alongside the
  existing `git-inspect`/`git-commit`), and a host-mediated
  `WorkflowRunRegistry#publishCommit(runId, commit, branch)` primitive: a
  role reports a commit it already created, the host verifies the commit
  exists and is a fast-forward descendant of the branch's current remote
  tip (refusing to rewrite published history), then pushes it using the
  host process's own git credentials and records the result on the run.
  This exists so a future network-isolated role could hold `git-publish`
  without ever gaining outbound network access itself; the currently pinned,
  immutable evaluator contract's own text still assumes direct push, so this
  correction does not switch evaluator over to host-mediated-only
  publication — that is deliberately deferred, not silently done.
- `src/index.ts` — a `POST /workflow-runs/{id}/publish` endpoint exposing
  the above.
- `test/workflow-run.integration.test.ts` — new regression coverage for the
  bounded git-capability mapping (present and absent cases) and for
  `publishCommit` (successful host-mediated push + result recorded on the
  run; refusal of a non-fast-forward/orphan commit).

`npm run check` (typecheck, lint, format:check, full suite — 86/86 tests)
and `git diff --check` were confirmed green by the orchestrator before this
dispatch, but the *point* of this correction is that an implementation-role
worker should be able to prove it works, not just be told it works.

## Your job

1. Read the frozen `spike.md`, frozen `design-map.md`, public
   `eval-requirements.md`, and this directive.
2. Inspect the uncommitted working-tree diff yourself — do not just trust
   this summary. Confirm it does what this directive claims, is scoped to
   what it claims (no Spike 011 work, no frozen-document changes, no
   `harness-hidden` exposure widening, no `--dangerously-skip-permissions`
   or bypass permission mode anywhere, no general remote-operation
   framework beyond the one bounded `publishCommit` primitive).
3. Re-run `npm run check` yourself and confirm it is green.
4. Write the `implementation-report.md` addition and the `manifest.md` `Run
   034` entry per `skills/implementation/SKILL.md`'s normal completion
   procedure, describing this correction accurately.
5. Stage exactly the intended paths (the four files above, plus your own
   `implementation-report.md`/`manifest.md` entries), inspect the staged
   diff, and create the commit yourself.
6. **Then prove the fix**: use your own `git-publish` capability to push
   this branch yourself. You should no longer be blocked the way attempts
   11 and 12 were. If you are still blocked, do not paper over it or ask
   the orchestrator to finish for you silently — stop and report exactly
   what happened; that would mean this correction did not actually work and
   needs further diagnosis, not another manual bypass.

## Scope discipline

Do not touch Spike 011, evaluator revision 003, LP1, the frozen documents,
or anything under `harness-hidden`. Do not weaken any permission boundary
beyond what is described above. Do not use `--dangerously-skip-permissions`
or any bypass permission mode. Do not grant unrestricted host shell
capability. Do not special-case Spike 013a or a particular commit inside
`src/`.

## Completion

After you have staged, committed, and pushed successfully yourself, stop.
Do not record the canonical `implementation-handoff` transition — the
orchestrator will do that once it has independently confirmed your commit
is on the remote branch. Do not run the LP1 fixture and do not allocate a
new evaluator verification attempt.
