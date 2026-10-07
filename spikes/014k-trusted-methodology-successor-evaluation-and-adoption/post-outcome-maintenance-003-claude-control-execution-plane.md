# Post-Outcome maintenance 003: Claude control/execution plane

- Status: `IMPLEMENTED`; deterministic verification and the single authorized
  disposable protected-Claude preflight passed
- Performed at: `2026-10-07T14:22:18+02:00`
- Authority: explicit human authorization in the active Codex App session
- Provenance: human-authorized post-Outcome host/runtime maintenance performed
  through Codex App; this session was not a governed Harness role allocation
  and held no evaluator identity
- Implementation method: `skills/implementation/SKILL.md`, contract version 5,
  applied where relevant
- Base: `2bf56bee4efa10707ec1cf548110ac7e8f9e8993`
- Predecessors: post-Outcome maintenance 001
  `1c1b432ccb68e856926d8635a11ab39def7ef17e` and maintenance 002
  `2bf56bee4efa10707ec1cf548110ac7e8f9e8993`
- Implementation commit: the focused commit containing this record. Its exact
  Git identity is reported in the maintenance handoff; embedding a commit's own
  identity in its content would recursively change that identity.

## Completion boundary

The Spike 014k Outcome remains `COMPLETE` and immutable. This maintenance does
not reopen the workflow, evolve methodology, append sequence 7, or modify the
accepted sequence-6 verifier contract. Trusted methodology sequence 6 remains:

- methodology identity
  `sha256:da22079f636de3a498ec853dc6dd8785f3aa8daa387130c96ac9927b377301f2`;
- revision `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`;
- trusted-ledger file identity
  `sha256:56b0257bc9cd83a00faff7ed2227c5646b8d39411cd428f1a5ab17560eb466fd`.

`outcome.md` was not modified and retains identity
`sha256:fd80ceb980d428f8e6adad8e4c69610d3cdf2c46c30e27df20848da63a30c824`.
Spike 014f candidate `af75b14d1847af02404a591a8829751dc8df2a2e`
and evaluator revision `002` were not modified. No Workflow Grant, Role Grant,
or Spike 014f evaluator allocation was created; in particular, attempt 9 was
not launched.

## Installed-runtime diagnosis

Public 014k ledger events record successful protected evaluator executions on
model `claude-sonnet-5-5` with Claude Code `2.1.284`. The installed runtime is
now Claude Code `2.1.292`.

Inspection of the installed 2.1.292 binary and its effective `sandbox status`
surface established that it supports all parts of the required split:

- `sandbox.filesystem.disabled` leaves network and seccomp isolation active;
- `sandbox.network.strictAllowlist` deterministically rejects hosts outside the
  allowlist;
- `sandbox.credentials.files` mask entries remain enforced when filesystem
  isolation is disabled;
- `sandbox.credentials.envVars` deny entries remain enforced in that mode;
- these controls apply to sandboxed commands and descendants, not to the
  parent Claude process.

Harness did not propagate Anthropic credential environment variables. Current
authentication was instead file-backed at `~/.claude/.credentials.json`, which
`scratchHome()` copied into synthetic HOME so the parent Claude process could
authenticate. Maintenance 002 disabled Claude's duplicate filesystem sandbox
without adding the independent credential mask retained by 2.1.292. Therefore,
if Bash became usable, a child could have read the copied OAuth material.

At the permission layer, governed protected launches forced `dontAsk` despite
having already selected an enabled, sandboxed Bash tool family. With no approval
surface, 2.1.292 denied Bash before command execution and before the sandbox's
automatic approval could apply. Adding command spellings could not repair that
architectural mismatch and would have made provider syntax an authority model.

## Runtime correction

The corrected topology separates the Claude control plane from its command
execution plane:

1. Harness outer bubblewrap remains the sole filesystem authority. It exposes
   only the exact granted workspaces and runtime closure, mounts the public
   repository and Git metadata read-only, mounts evaluator-private and scratch
   state read-write, supplies isolated writable `/tmp`, and exposes no other
   host paths.
2. Claude's parent process retains provider connectivity and the exact
   repository-owned Harness MCP server passed by strict MCP configuration.
   Ambient setting sources, plugins, hooks, skills, slash commands and
   unrelated MCP servers remain excluded.
3. Claude's child command sandbox stays enabled, fail-closed and without any
   unsandboxed fallback. Its network policy has an empty allowlist, a deny-all
   entry, and `strictAllowlist: true`; this affects Bash and every descendant,
   independent of whether the child is Node, Python, a shell, `make`, a test
   runner, or a compiled executable.
4. The actual synthetic-HOME authentication files are masked for child
   commands. `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`,
   `CLAUDE_CODE_OAUTH_TOKEN`, and
   `CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR` are explicitly denied in the child
   environment in addition to Harness's provider-environment allowlist.
5. Protected mixed-workspace launches use the existing sandbox-aware
   noninteractive `acceptEdits` mode. This makes already-selected tools usable
   after sandbox construction. It grants no filesystem authority: explicit
   Edit/Write denials remain on read-only workspaces, and outer mounts enforce
   the boundary. `bypassPermissions` is not used.
6. Claude is now declared a nested-sandbox provider. Harness runs its existing
   nested namespace compatibility probe before session/allocation creation and
   refuses the launch if the child sandbox cannot start. There is no uncontained
   retry or fallback.

The provider-side `blockReadsOutsideWorkingDirectories` command-parser policy
is disabled only for host-contained launches. The outer mount topology already
enforces the exact read boundary, so command-string analysis is neither needed
nor allowed to become the security boundary. Legacy non-governed composition
retains its provider filesystem policy.

This restores existing sequence-6 runtime semantics. It changes no capability,
workspace mode, evaluator routing rule, contract, policy, skill, result
vocabulary, evidence action, frozen artifact, or trusted methodology identity.

## Files changed

- `src/claude-workflow.ts`
- `src/executors/adapters.ts`
- `test/evidence-action.test.ts`
- `test/external-project.test.ts`
- `test/governed-executors.test.ts`
- this maintenance record
- `manifest.md`

No other tracked file changed. Maintenance 001's Codex mixed-workspace
composition and ordinary writable Claude role behavior remain covered and
unchanged.

## Deterministic verification

- Test-first governed executor run before implementation: 34/35 passed; the
  new expected control/execution-plane assertion failed.
- Focused provider/containment run after implementation and the required stale
  nested-sandbox expectation update:
  `node --test test/governed-executors.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts`
  — 59/59 passed.
- Sequence-6 regression set:
  `node --test test/evidence-action.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts test/governed-executors.test.ts test/methodology-evolution.test.ts test/successor-closeout.test.ts test/skill-fidelity.test.ts test/candidate-subject.test.ts`
  — 115/115 passed.
- `npm test` — 263/263 passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run format:check` — passed after formatting the changed source.
- `git diff --check` — passed before and after the final evidence update.

Visible tests prove the constructed outer mount modes, read-only Git metadata,
ungranted-root exclusion, strict MCP and ambient-setting exclusions, strict
deny-all child network configuration, child credential masks/denials,
pre-allocation nested-sandbox refusal, absence of an uncontained fallback,
host-mediated evidence-only public mutation, ordinary writable Claude roles,
and the existing Codex mixed-mode behavior.

## Single disposable live preflight

Exactly one separately authorized disposable protected-Claude launch was made.
It was not a Harness workflow or role allocation. It used temporary repository,
private and scratch workspaces plus synthetic provider state, and all disposable
state was deleted afterward.

Observed boolean result:

- provider initialized: yes;
- confirmed model: `claude-sonnet-5-5`;
- Claude Code: `2.1.292`;
- Harness MCP connected and completed an assignment round-trip: yes;
- local Node computation executed: yes;
- repository fixture readable: yes;
- repository fixture writable: no;
- evaluator-private writable: yes;
- scratch writable: yes;
- isolated `/tmp` writable: yes;
- Git inspection available: yes;
- repository Git metadata writable: no;
- outside-grant fixture visible: no;
- external HTTPS reachable from child: no;
- DNS reachable from child: no;
- provider credential variables visible to child: no;
- real provider authentication material visible through the synthetic-HOME
  credential file: no;
- parent Claude completed a provider response after the child command: yes;
- disposable repository remained unchanged: yes.

No credential bytes, values, or files were logged or retained. These results
are operational evidence for the repaired runtime composition, not independent
semantic evaluation of this maintenance and not a verdict on Spike 014f.

The runtime is now safe for a separately reviewed and separately authorized
Spike 014f evaluator attempt using the unchanged candidate and evaluator
revision. This maintenance provides no authority to create that attempt.
