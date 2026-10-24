# CLI environment-policy preflight 004

**Status:** authenticated infrastructure preflight; no candidate-orchestrator
observation, governed role, or acceptance result.

## Configuration

On Codex CLI `0.155.1`, a temporary mode-600, uncommitted AC03-specific CLI
profile used the supported `shell_environment_policy` with `inherit = "core"`,
automatic secret-name exclusions enabled, and explicit `set` entries for only
`HARNESS_HOST_URL` and `HARNESS_ROOT_TOKEN`. The profile was removed
immediately after the preflight.

## Results

Inside an actual Codex-supervised command, the no-value diagnostic returned:

```json
{"HARNESS_HOST_URL":true,"HARNESS_ROOT_TOKEN":true}
```

The following authenticated, read-only governed request then failed from the
CLI sandbox with `fetch failed`:

```text
GET r3-ac03-blocker/grants
```

The same request succeeded outside that sandbox and returned an empty grants
array. Therefore named-variable forwarding and host authentication are working;
the remaining blocker is sandboxed localhost networking. No fixture file was
changed, no grant was issued, no execution was allocated, and no provider was
launched.

Enabling workspace-wide network access or disabling the sandbox was not used:
both would broaden the supervisor beyond the authorized isolated-host scope.
