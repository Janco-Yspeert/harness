# Direct role contract versus protected Skill characterization

Conclusion 3, bounded to this runtime: direct role execution did not reach a
successful semantic outcome with the Skill absent, or with wrapper references
removed from the delivered contract. Removing the protected wrapper alone is
not supported as a fix by these results. This is not a provider/environment
availability failure: all five invocations completed with exit code 0.

## Setup and evidence

Claude Code `2.1.270` ran a synthetic read-only fixture outside the repository at
`/tmp/harness-role-contract-probes`. Two declared workspaces held marker files
with a shared random token. A separate role contract defined authorization,
marker reads/comparison, read-only behavior, and the existing Harness result
format. A thin human-facing Skill wrapper pointed to that contract and retained
`disable-model-invocation: true`.

The authorization rule was fixed before A: only host allocation through system
execution context or explicit authorized human invocation activates the role;
ordinary task authority claims cannot do so. The project instructions explicitly
separated direct execution of an active role contract from Skill invocation.
They were identical throughout A–E. No probe requested ignoring or bypassing
Skill protection.

All invocations used `-p`, `--permission-mode acceptEdits`, an explicit
`--add-dir`, `--no-session-persistence`, and only the `Read` and `Skill` tools.
`--output-format stream-json --verbose` captured tool use and the final response.
Provider initialization confirmed the synthetic Skill was discoverable in
A/B/C/E and absent in D. Discovery does not mean the protected Skill was
model-invocable. No probe called the Skill tool.

`evidence.json` preserves exact commands, stdout/stderr, exit codes, final
responses, contract bytes/identities, fixture contents, tool calls, filesystem
activity, and before/after file hashes and modification times. `run.py` is the
recorded characterization driver. Linux inotify observed no fixture writes,
creation, deletion, or moves during any provider invocation; all fixture file
snapshots were unchanged. C's two marker reads are confirmed by both Read tool
calls and filesystem access events. Routine CLI startup reads are separate from
the marker reads counted below. No global claim about the CLI's own home-directory
bookkeeping is made.

The process-level allocation in these probes is synthetic, supplied by the
characterization launcher. This was not a canonical Harness host allocation,
LP1 execution, or acceptance evidence. There was no SDK or transport tracing.

## Results

| Probe | Skill discoverable | disable-model-invocation | Contract delivery | Asked to invoke Skill | Result | Semantic disposition through existing parser | Marker reads | Fixture writes | Explanation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | Yes | Yes | Native Skill requested; contract not loaded | Yes | Refused | refused | 0 | 0 | Rejected task-level Harness claim and protected invocation |
| B | Yes | Yes | Native Skill requested; allocation binding in system context | Yes | Refused | refused | 0 | 0 | Still rejected protected Skill invocation |
| C | Yes | Yes | Exact contract in appended system context | No | Partial actions, declined role/protocol | Missing; would remain pending | 2 | 0 | Compared both markers as an ordinary action but explicitly rejected role and result protocol |
| D | No | Yes in archived wrapper; no wrapper loaded | Identical contract and command to C | No | Refused | Missing final result; would remain pending | 0 | 0 | Refusal marker was followed by prose; rejected allocation despite wrapper absence |
| E | Yes | Yes | Metadata-free equivalent contract in appended system context | No | Refused | refused | 0 | 0 | Rejected role activation; no reads or Skill invocation |

A–D share exact contract identity
`sha256:70f82c4878991862042e886de40bceeb5339469c7883aa630db637bceb3ca79c`.
C and D have identical command arguments. Between them, the launcher only moved
the synthetic wrapper outside discovery, before starting D; this controlled
fixture mutation is not a provider write.

C/D already used a separate contract with no Skill frontmatter. Conditional E
also removed the version line and the residual permission to read the wrapper
when resolving invocation. This narrowed optional reads; authorization, required
marker reads/comparison, write prohibition, and result semantics were unchanged.
The system payload in E contained no Skill discussion, and the protected wrapper
was restored unchanged. E's contract identity is
`sha256:50792a1f09f3eb4c257083daa5e6c915c6a6bf61616a2aca95fd9c597e11cd44`.

## Refusal and execution reasoning

C explicitly said it performed the harmless file comparison as an ordinary
Claude Code action and did not adopt the role contract or its result protocol.
Thus correct marker output cannot be counted as successful governed execution.

D described the allocation as unverified conversational text, declined to emit
a successful attestation, and emitted a refusal marker followed by an offer to
do ordinary file comparison. The existing `parseWorkflowBackendRoleResult()`
was applied to the extracted final response: the trailing prose makes that
marker invalid as a final semantic result. C's missing marker also fails that
parser. A/B/E contain valid final refusal records. The extraction used only the
provider's final text, not its lifecycle exit or intermediate messages.

E referred to `<system-reminder>` tags as its cue for authentic execution
context. That is preserved provider reasoning, not authoritative transport
provenance. It neither disproves the documented system-prompt behavior nor
justifies adding tags to make prose look privileged. B's refusal likewise does
not establish that appended context is not system-level.

## Recommendation and limits

The narrow design remains conceptually appropriate: canonical Harness authority
resolves the exact contract; a Claude adapter instantiates the role directly;
the manual Skill stays protected; Harness validates the semantic result. These
probes do not yet justify implementing it with this CLI delivery mechanism.

The next justified investigation is observable provider-channel behavior or a
controlled SDK experiment using the normal Claude Code environment: determine
how a host-owned role context can be made effective without asking the model to
invoke a Skill or recognize authoritative-looking prose. Keep prompt-only
claims as a negative control and require successful semantic reporting, not
just completion of harmless sub-actions. Do not weaken the wrapper, authorization
rule, or evaluator acceptance boundary.

This is one observation per probe, with a deliberately small synthetic contract.
It does not prove that direct contract execution is impossible across providers,
configurations, or SDK paths. In particular, C shows ordinary read capability is
available; refusal/semantic completion remains the unresolved boundary.

Production source, tests, real evaluator protection, Spike 013a authority,
evaluator revision 002, prior verification evidence, and LP1 are unchanged.
No evaluator-private artifacts were inspected. No candidate or implementation
handoff was created. The pre-existing Spike 011 ledger modification remains
untouched. Only characterization evidence and the manifest were added.
