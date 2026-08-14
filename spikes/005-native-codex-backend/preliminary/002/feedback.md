# Spike 005 review feedback

## Findings

### Blocker — the required protocol baseline has not been frozen

The revised brief correctly requires an exact Codex CLI version and generated
App Server schema to be committed before the spike is frozen (`spike.md`, lines
94–124). It repeats that requirement in the success criteria (`spike.md`, lines
989–995) and provenance contract (`spike.md`, lines 1120–1125).

No root-level `protocol/` artifact, schema bundle, or equivalent version record
currently exists. The locally installed CLI reports `codex-cli 0.147.0`, and
its `codex app-server generate-json-schema` command supports generating the
required non-experimental bundle when `--experimental` is omitted. Official
App Server documentation also states that generated schemas are specific to
the Codex version that produced them.

This is no longer an ambiguity in the brief; it is an explicit freeze
prerequisite that has not yet been performed. Implementation and evaluator
preparation cannot share the required immutable wire contract until it exists.

Minimum action before freeze: generate the non-experimental schema from the
chosen installed Codex CLI, save its exact version alongside it, and commit
both under Spike 005.

### Material clarification — the active-turn rejection window does not cover turn startup explicitly

The brief defines the client-visible rejection contract for input received
while a Codex turn is active (`spike.md`, lines 365–404), but does not say when
Harness enters that state. There is an asynchronous interval after Harness
accepts the first browser instruction and sends `turn/start`, but before App
Server returns the new turn or emits its lifecycle notifications.

If a second WebSocket message arrives in that interval, one implementation may
reject it with `turn_active`, while another may send a second `turn/start` and
leave overlap prevention to App Server. The latter conflicts with the intended
guarantee that Harness itself does not create overlapping turns, and the
deterministic evaluator has no unambiguous oracle for this race.

Minimum clarification: define the busy/rejection interval as beginning
synchronously when Harness accepts an idle instruction and lasting until that
turn reaches a terminal event or its start attempt fails. State what state the
session returns to after a non-fatal `turn/start` rejection.

### Material clarification — the existing browser adds a PTY carriage return to provider input

The current browser sends each instruction as `${command.value}\r`
(`public/client.js`, line 103), because Spike 004 input was terminal input. The
revised brief now treats input as a provider-native textual instruction
(`spike.md`, lines 315–337), but does not decide whether that trailing carriage
return remains part of the Codex prompt.

Either retaining or normalizing it is cheap, but evaluator peers comparing the
`turn/start` input and implementers trying not to leak PTY mechanics into Codex
need the same rule.

Minimum clarification: require the Codex path to submit the browser's logical
text without the PTY-only trailing carriage return, or explicitly declare that
the existing input payload—including `\r`—is passed through unchanged for this
spike.

## Resolved from the preliminary review

The replacement brief now clearly defines:

- the non-experimental App Server protocol surface;
- active-turn rejection and its client-visible error;
- graceful interruption, the five-second fallback, and resulting HTTP status;
- delta-first text projection without duplicate completed output; and
- the server-side diagnostic and sanitization contract.

Those preliminary findings are resolved and are not blockers in the revised
brief.

## Verdict

**Not ready to freeze.** The only blocker is the brief's own missing
version-specific protocol/schema artifact. Once that is generated and
committed, the two named wording clarifications should be made so implementation
and evaluation handle the startup race and browser input payload consistently.

No technically infeasible or disproportionately costly requirement was
identified. The real-provider smoke remains environment-dependent, but the
brief separates that limitation cleanly from deterministic evaluation.

No root-level `eval-requirements.md` existed at review time. The review covered
the complete replacement brief, current implementation and public contracts,
visible tests, project guidance, prior public outcome context, the installed
Codex CLI, and the current official
[Codex App Server documentation](https://developers.openai.com/codex/app-server).
Only this required `feedback.md` review artifact was added; no brief,
implementation, or test files were changed, and no tests were run.
