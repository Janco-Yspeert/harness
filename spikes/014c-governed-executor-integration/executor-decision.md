# Executor Decision — Spike 014c

Status: **structured Claude Code CLI selected**. Live probes were not performed
in this execution, so the selection rests on static inspection plus existing
bootstrap evidence (details below).

- Checked: 2026-09-24, by the governed implementation worker (assignment
  `234e3308-013d-4ed0-badf-054149edf2c1`).
- Reference documentation (brief §1): **not reachable from this execution**.
  The sandbox egress proxy denied `code.claude.com:443`. No documentation text
  was fetched, so the authentication and billing position below uses only the
  frozen brief's own statements. Anyone who can reach the documentation should
  re-confirm that position before relying on it.

## Versions

| Component                 | Version                                             | How observed                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Agent SDK (TS)     | none pinned; not installed                          | Absent from `node_modules`. Installing it would add a dependency, and this execution had no registry access.                                                                            |
| Claude Code CLI           | not observable from this execution                  | The binary that runs this worker was not on the sandboxed `PATH`. The governed adapter records the provider-reported `claude_code_version` from the stream-json `init` event on every run. |
| Codex CLI                 | `codex-cli 0.154.0-alpha.6.2`                       | `codex --version` and `codex exec --help` (local help only; no provider call).                                                                                                          |
| Node                      | `v22.23.2` in this sandbox (`engines` asks `>=24.12`) | `node --version`                                                                                                                                                                       |

## Comparison worksheet

Verdicts: **pass**, **fail**, or **not executable under approved credentials
(NE)**. "Static" means the verdict comes from inspecting code, flags and
existing evidence, not from a new live probe.

| Question                   | Agent SDK                                                                                                                                                                                                                                                                                           | Structured CLI (`claude -p`)                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Authentication and billing | **NE.** The brief records that third-party use of a Claude subscription through the SDK requires Anthropic approval. No such approval is recorded, and no operator authorized an API key or new charges. This route was not authenticated or tried.                                                   | **Pass (static).** Uses the operator's existing local Claude Code login, the same route that already runs the human-authorized 014c bootstrap. The adapter's environment allow-list never forwards `ANTHROPIC_API_KEY` or any host credential (tested). No new charges.                                                                                                                                                              |
| Model and effort           | NE                                                                                                                                                                                                                                                                                                  | **Pass for model, fail-closed for effort.** The model is requested with `--model` and confirmed only from the provider-reported `init.model`. A result is refused until confirmation, and a mismatch terminates the run with `provider-config-invalid`. No attestable per-invocation effort control is used, so an exact effort constraint is refused before allocation. It is never optimistically attested.                          |
| Pinned instructions        | NE                                                                                                                                                                                                                                                                                                  | **Pass (static).** The exact host-delivered skill and contract bytes are passed as `--system-prompt`. `--safe-mode`, `--setting-sources ""`, `--strict-mcp-config` and `--disable-slash-commands` exclude ambient CLAUDE.md, settings, plugins, hooks and MCP servers. The assignment is verified against the Role Grant identities before launch.                                                                                  |
| Permissions                | NE                                                                                                                                                                                                                                                                                                  | **Pass (static).** One reviewed capability→tool mapping (`governedClaudePermissions`) applies `--tools`, `--allowedTools` and `--disallowedTools` (always `git push`, plus read-mode workspaces), with `acceptEdits`/`dontAsk` and the existing OS sandbox. Unknown capabilities fail closed. Bypass flags are rejected by `assertBoundedExecutorCommand`.                                                                           |
| Structured transport       | NE                                                                                                                                                                                                                                                                                                  | **Pass (static).** `--output-format stream-json --verbose` gives typed events. Worker operations are a repository-owned stdio MCP server passed with `--mcp-config`. **Unverified live:** whether `--safe-mode` admits an explicitly passed `--mcp-config` server. The adapter reports this as `assignment-not-delivered` when `init.mcp_servers` does not show `harness` connected.                                                  |
| Process lifecycle          | NE                                                                                                                                                                                                                                                                                                  | **Pass (static).** Covers exit code and signal, `result.is_error`/`subtype`, assistant `error: "rate_limit"` (the only rate-limit signal treated as reliable), `permission_denials`, and cancellation (SIGTERM, then SIGKILL).                                                                                                                                                                                                         |
| Operational compatibility  | Fail on current benefit: a new dependency with no concrete integration advantage, since both routes wrap the same local agent and the CLI route already works.                                                                                                                                       | **Pass.** No new dependency, reuses `src/claude-workflow.ts`, and runs on Node ≥22.18 type stripping (Node 24 per `engines`).                                                                                                                                                                                                                                                                                                         |

## Live probes

- Agent SDK: **none**. Not executable under approved credentials, so no probe
  was permitted.
- Structured CLI: **none performed in this execution.** The Claude binary was
  not reachable inside this worker's sandbox, and provider network egress is
  denied here.
- Existing supporting evidence (not a governed-adapter probe): the same CLI
  route (`claude -p` with `--safe-mode`, `--restricted`, `--setting-sources ""`
  and structured JSON output) has repeatedly authenticated and run under the
  operator's subscription for the human-authorized 014c bootstrap. That
  includes manifest runs 001–005 and 008 and this implementation execution.

## Charges and authorization

No new charge, API key, subscription workaround or permission weakening was
used or needed. **None required.** No operator authorization was requested.

## Decision

The SDK fails the permitted-authentication gate (NE) and offers no concrete
integration advantage. The structured CLI passes on static evidence. Under the
decision rule, the **single production Claude route is the structured Claude
Code CLI** (`src/executors/adapters.ts`, adapter `claude`). The SDK is not
implemented.

Replacement path: an adapter is only `checkCapabilities`, `command` and
`parse` behind `ProviderAdapter`. An SDK adapter could replace `claude.command`
and `claude.parse` with an SDK session while keeping the same worker protocol,
MCP tool server, relay, host lifecycle and diagnostics. That change requires
explicit human authorization of the SDK's authentication and billing
arrangement.

## Codex adapter (for completeness)

`codex exec --json --ephemeral --skip-git-repo-check --ignore-user-config
--ignore-rules`, with `approval_policy="never"`, network disabled for
`workspace-write`, and the same MCP tool server passed through
`-c mcp_servers.harness.*`. It is built by the shared `codexExecCommand`. Known
limits, all fail-closed:

- The Codex sandbox limits writes, not reads. The adapter therefore refuses
  protected and forbidden-exposure grants, and production validation rejects a
  Codex profile that declares `private-workspace` isolation.
- `--json` does not report the effective model or effort. Exact model and
  effort constraints are therefore refused before allocation.
- The sandbox always allows reading, running commands and Git inspection, and
  `workspace-write` always allows commits. A grant whose capabilities differ
  from what the selected sandbox actually provides is refused.
- Git commit under Codex `workspace-write` has not been verified live.

## Adapter reuse inventory (AC01)

| File                            | Before                                                          | After                                                                                                                                                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/claude-workflow.ts`        | Legacy Claude command and permission construction              | Shared `resolveClaudeCapabilityTools`, `CLAUDE_PROTECTED_FLAGS` and `claudeSandboxSettings`, used by both the legacy reader (`buildClaudeWorkflowCommand`, output unchanged) and the governed launcher (`governedClaudePermissions`, `buildGovernedClaudeCommand`). |
| `src/workflow-backend.ts`       | Legacy local backend; inline Codex command, bypass check and stop | Shared `codexExecCommand`, `assertBoundedExecutorCommand`, `stopChild` and `workflowScratchEnvironment`, used by the legacy backend and governed execution. The legacy `HARNESS_ROLE_RESULT` parser remains a legacy reader only.                                     |
| `src/codex-backend.ts`          | Interactive App Server backend                                  | Unchanged; not used for governed spawned execution.                                                                                                                                                                                                                   |
| `src/kernel/host.ts`            | Spawned execution launched an arbitrary profile `command` with `stdio: "ignore"` | Registered-adapter selection, categorized pre-allocation refusals, adapter launch, cancellation of the real child, and the trust gate. The `command` path remains only for programmatic test fixtures.                                                                 |
| `src/executors/*` (new)         | —                                                               | Adapter registry and discovery, the governed launcher and relay, protocol v1 schemas, and the MCP tool server. These are new provider-neutral pieces, not copies of provider code.                                                                                     |
| `tools/governed-claude-bootstrap.ts` | Pinned bootstrap runner                                    | Unchanged. It is pinned to a pre-candidate commit and is not a production path.                                                                                                                                                                                       |

## Residual risks (threat-model notes)

- The per-execution relay key is visible to the provider process, because it
  appears in the MCP configuration. It reaches only the four operations already
  bound to that one execution. The host session token and root credential never
  enter the provider environment, argv, prompts, workspaces or ledgers (tested).
- The production entrypoint reads the root credential from
  `HARNESS_ROOT_TOKEN`. Any process with the same UID can read a process's
  initial environment through `/proc`. The Claude sandbox isolates PIDs, but
  Codex's read-unrestricted sandbox does not. Loading the root credential from
  a file would close this gap; that change is outside 014c's scope.
