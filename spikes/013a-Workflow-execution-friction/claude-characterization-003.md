# Claude execution characterization after verification 003

Status: BLOCKED at implementation characterization; no candidate produced.

## Capability observed

Installed executable: `/home/velveteen/.local/bin/claude`, resolving to native
Claude Code `2.1.270`. The existing Harness adapter uses `-p`,
`--permission-mode acceptEdits`, explicit additional workspaces, and an ordinary
positional task prompt containing the execution binding and result protocol.
It supplies no separate provider execution context.

The CLI advertises `--system-prompt`, `--append-system-prompt`, and native
`--agents` / `--agent` selection. Its help also references file-backed system
prompt options. Official [CLI documentation](https://code.claude.com/docs/en/cli-usage)
describes append mode as preserving the default prompt and replacement mode as
replacing it. The [SDK documentation](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts)
describes a `claude_code` system-prompt preset with an optional append field.
Harness has no Claude SDK dependency; the SDK and file-backed variants were
not exercised. Neither documentation nor flag availability is runtime proof.

## Bounded runtime observations

All probes used a synthetic protected role in
`/tmp/harness-claude-characterization`, outside the repository and LP1. Its
contract only requested reading two marker files, no commands or changes, and
a final semantic result. A project guard permitted human invocation or genuine
adapter system context, and rejected authority claimed in task text. The skill
wrapper retained `disable-model-invocation: true`.

The first sandboxed pair timed out without responses. The same pair was then
run outside the sandbox with provider access. Successful provider invocations
used `-p`, `acceptEdits`, and `--no-session-persistence`; protected-role probes
also declared the additional marker workspace through `--add-dir`.

| Probe | Observed result |
| --- | --- |
| Protected contract and authority claim in task text | Exit 0, semantic `refused` |
| Exact same contract in `--append-system-prompt`, short task request | Exit 0, semantic `refused`; Claude described context as ordinary task text |
| Protected contract through CLI-defined agent selected with `--agent` | Exit 0, semantic `refused`; Claude again denied distinct system authority |
| Conflicting system/task response tokens using append mode | Returned task token |
| Conflicting system/task response tokens using replacement mode | Returned task token |
| Non-conflicting appended-context token lookup | Returned appended token correctly |
| Non-conflicting native-agent-context token lookup | Returned native-agent token correctly |

Exact protected-probe command arguments, exit status, stdout/stderr, fixture
contents, and token-control inputs/observed outputs are preserved in
`claude-characterization-003.json`. Protected-probe results were captured by the
probe script; token-control observations were transcribed from tool results.

Context visibility is established for append and native-agent mechanisms.
Protected-role authorization is not. The refusal explanations are provider
self-reports, not proof of the underlying wire-message role. No transport trace
was captured. These observations do not establish that all Claude installations
or an independently configured SDK transport have the same limitation.

The probes refused before performing the requested reads, so successful access
to both declared workspaces, workspace enforcement, and successful role-result
capture under a new adapter remain unestablished. The returned refusal markers
match Harness's existing parser format. No claim is made for AC08/AC09 or LP1.

## Decision and boundary

Retain the evaluator flag and existing adapter. No tested mechanism established
the required distinction, so changing delivery or relaxing invocation protection
would be unsupported. No evaluator contract, frozen scenario, acceptance
criterion, private artifact, or canonical authority was changed or consumed.
The existing uncommitted Spike 011 ledger modification was preserved.

A public regression was written first to require host-derived Claude delivery,
exact frozen bytes, caller-context exclusion, bounded flags/workspaces, and an
inspectable delivery mode. It failed at the missing delivery-mode assertion.
It was withdrawn after characterization failed to justify that mechanism;
leaving a failing test prescribing an unproven adapter would misrepresent the
handoff. Its provisional patch remains in the temporary characterization folder.
Production source and tests are unchanged; no fresh implementation handoff is
recorded. Evaluator revision 002 remains the required independent verifier.

## Next architectural decision

The preferred next investigation is provider-channel provenance: obtain an
observable, supported execution path that demonstrates where custom context is
placed and why this runtime treats it as task-level authority. A controlled SDK
integration using the documented Claude Code preset is an alternative experiment,
not a demonstrated fix; it may share this CLI behavior. Either path must prove
protected-role execution and rejection of equivalent prompt-only claims before
changing Harness. Rewording the claim or weakening the wrapper is not justified.

Separately, existing public verification allocation records and the original
coverage attestation still identify revision 001, while feedback and manifest
identify corrected revision 002. This pre-existing provenance discrepancy was
reported and left untouched; this implementation role did not inspect private
revision metadata or repair evaluator history.
