# Spike 005 review feedback

## Findings

### Blocker — `turn_start_failed` is defined locally but contradicted by the public WebSocket contract

The revised active-turn section introduces a second client-visible Harness
message for a recoverable `turn/start` failure (`spike.md`, lines 500–518):

```json
{
  "type": "error",
  "code": "turn_start_failed",
  "data": "Codex could not start the turn."
}
```

However, the public WebSocket contract later says Spike 005 adds **one** explicit
Harness-generated message and lists only `turn_active` (`spike.md`, lines
1134–1164). The browser requirements likewise require rendering `turn_active`
but say nothing about `turn_start_failed` (`spike.md`, lines 794–823), and the
deterministic verification list has no recoverable turn-start-failure case
(`spike.md`, lines 930–1042).

This leaves externally observable behaviour unresolved: an implementation can
reasonably send `turn_start_failed` over the socket but have the browser ignore
it, while an evaluator can reasonably treat that message as outside the frozen
WebSocket contract. The current browser only renders `type: "output"`, so
client receipt and user visibility are materially different requirements.

Minimum decision before freeze: add `turn_start_failed` to the explicit
WebSocket contract and state whether the browser must display it or only receive
it. Add deterministic requirements covering the recoverable failure, transition
back to idle, exactly one error message, and a successful later turn attempt.

### Blocker — the protocol baseline exists but is not yet committed

The required baseline is now present under `protocol/app-server-schema/`, and
`protocol/README.md` records `codex-cli 0.147.0` and the non-experimental
protocol target. That resolves the previous missing-artifact finding and agrees
with the official App Server contract: generated schemas are version-specific,
and omitting `experimentalApi` keeps the client on the non-experimental
surface.

The brief nevertheless requires the schema and version record to be committed
before freeze (`spike.md`, lines 117–157 and 1389–1396). All 286 protocol files
are currently staged additions and do not exist in the current `HEAD` commit.
Until committed, evaluator and implementation do not have the immutable shared
baseline the brief requires.

Minimum action before freeze: commit the Spike 005 brief, protocol schema, and
version provenance together on the spike branch after resolving the contract
finding above.

## Resolved findings

The revised brief now resolves the earlier review findings:

- the protocol/schema artifact and exact generating CLI version now exist;
- the busy interval begins synchronously when Harness accepts an instruction;
- recoverable and fatal `turn/start` failures are distinguished;
- the Codex path removes the PTY-only trailing carriage return while preserving
  PTY behaviour;
- active-turn rejection is explicit and client-visible;
- graceful interruption, bounded fallback, and HTTP outcomes are defined;
- delta-first text projection prevents duplicate output; and
- diagnostic surfacing and sanitization are specified.

The brief otherwise fits the current repository architecture. Evolving the
`SessionBackend.write(): void` boundary and browser message handling is a
deliberate pressure test, not an accidental contradiction. The required
process/protocol seam is implementable without introducing the provider registry
or universal agent abstraction excluded by the brief.

## Verdict

**Not ready to freeze.** Resolve the `turn_start_failed` WebSocket/browser/test
contract, then commit the brief and generated protocol baseline. No other
material ambiguity, infeasible requirement, or disproportionate cost was
identified.

No root-level `eval-requirements.md` existed at review time. The review covered
the complete active brief, protocol provenance and generated baseline, current
implementation and public contracts, visible tests, project guidance, prior
public outcome context, and the current official
[Codex App Server documentation](https://developers.openai.com/codex/app-server).
Only this required `feedback.md` artifact was written; no brief,
implementation, schema, or test files were changed, and no tests were run.
