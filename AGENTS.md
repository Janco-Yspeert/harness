# Harness — Project Instructions

Harness is an Ubuntu-hosted control plane for supervising multiple AI coding agents from a phone or other remote client.

The project is intentionally being built in small, reviewable increments. Do not attempt to complete anticipated future features unless explicitly requested.

## Product Direction

Harness should eventually support:

* Multiple concurrent AI coding-agent sessions.
* Codex and Claude Code as first-class agents.
* Additional agents through adapters where practical.
* Persistent sessions owned by the Ubuntu host, not by connected clients.
* Remote observation and interaction from an Android client.
* Human-in-the-loop approvals and decisions.
* Attention-based notifications when an agent requires intervention.
* Raw terminal access as a fallback, not as the primary product abstraction.

This describes the intended direction, not the scope of the current task.

## Platform

The host/daemon is Ubuntu-first.

Do not add cross-platform abstractions unless explicitly requested.

It is acceptable to use Linux-specific facilities when they materially simplify the implementation.

## Architecture

The intended high-level boundary is:

Android / other clients
↕
Harness protocol
↕
Harness daemon
↕
Session / agent integration
↕
PTY / Codex / Claude / other agents

Preserve these boundaries where useful, but do not create speculative frameworks or abstractions simply because they may be needed later.

## Incremental Development

Implement only the requested slice.

A task is complete when:

* The requested behaviour works.
* Relevant tests pass.
* Relevant linting/type checks pass.
* No unrelated behaviour was changed.

A task is not an invitation to implement the next logical feature.

Prefer the smallest implementation that leaves a reasonable path for later extension.

Do not introduce abstractions for hypothetical future requirements.

## Sessions

The Harness daemon owns session lifetime.

A WebSocket connection, Android activity, browser tab, or other client must never implicitly own the lifetime of the underlying agent process.

Clients should be able to disconnect and later reattach without terminating the agent session.

Session lifecycle, process lifecycle, and client connection lifecycle are separate concepts.

## Agent Integration

Codex-specific or Claude-specific behaviour should not leak unnecessarily into the core session model.

However, do not design a large universal agent framework prematurely.

Introduce agent abstractions only as required by actual supported agents or by an explicitly requested architectural boundary.

Where structured agent APIs or events are available, prefer them.

PTY-based integration is an acceptable fallback and may be the initial implementation.

Do not implement fragile terminal-output parsing unless the current task requires it.

## Protocol

The Harness protocol is independent of its transport.

WebSocket may carry Harness messages, but WebSocket is not the domain protocol.

Harness messages should, where natural, remain structurally compatible with the Conduit message model:

* `meta.id`
* `meta.kind`
* `meta.type`
* `meta.version`
* `meta.streamId`
* `meta.correlationId`
* `meta.causationId` when applicable
* `meta.timestamp`
* `meta.source`
* optional `meta.extensions`
* `data`

Do not add Conduit itself as a dependency unless explicitly requested.

Do not force Conduit semantics where they do not fit the Harness domain.

Harness owns its protocol independently.

## Message Semantics

Prefer domain-level events and commands over transport-level concepts.

Examples may eventually include:

* `session.started`
* `session.stopped`
* `session.output`
* `agent.message`
* `agent.waiting`
* `approval.requested`
* `approval.resolved`
* `agent.completed`
* `agent.failed`

Do not implement these merely because they are listed here.

Add message types only when required by current behaviour.

A session is the likely natural `streamId`.

Higher-level tasks may eventually use `correlationId`, but do not introduce a task system until requested.

## Multiple Agents

Multiple concurrent agents are a core product requirement.

Avoid assumptions that only one active session or one agent provider exists.

Do not, however, build orchestration, scheduling, worktree management, or agent-to-agent coordination until explicitly requested.

## Security

Treat Harness as a remote code-execution control surface.

Security-sensitive shortcuts must not silently become production behaviour.

In particular:

* Do not expose the daemon publicly by default.
* Do not bind to arbitrary network interfaces merely to make development easier.
* Do not disable authentication or authorization mechanisms once they have been introduced.
* Do not log secrets, credentials, tokens, or sensitive environment values.
* Do not permit broader command execution than the requested feature requires.

For early localhost-only proofs of concept, keep security simple rather than prematurely building a full security system.

Clearly identify any deliberate development-only security limitations.

## Dependencies

Prefer standard platform capabilities and small focused dependencies.

Do not add a framework, event bus, database, message broker, plugin framework, dependency injection system, or persistence layer without a current requirement.

Every new dependency should solve a concrete present problem.

## Testing

Add tests around behavioural boundaries rather than implementation details.

Pay particular attention to:

* Process lifecycle.
* Session lifecycle.
* Attach/detach behaviour.
* Disconnect behaviour.
* Concurrency.
* Message validation.
* Error propagation.
* Cleanup of processes and resources.

Do not mock away the behaviour the test is intended to prove.

Use integration tests where lifecycle or PTY behaviour cannot be meaningfully validated with isolated unit tests.

## Changes

Avoid unrelated refactoring.

Do not rename or reorganize existing code merely for consistency unless required by the current task.

Do not silently change public contracts.

If the requested change reveals an architectural problem outside the task scope, report it rather than automatically redesigning the surrounding system.

## Git Workflow

Treat `main` as protected even when the GitHub account plan cannot enforce branch protection.

* Do not commit or push changes directly to `main`.
* Create a focused feature branch for each change.
* Merge changes into `main` through a pull request.
* Use squash merge only; do not create merge commits or rebase-merge pull requests.
* Do not bypass this workflow unless the user explicitly requests an exception.

## Completion

Before declaring a task complete:

1. Run the relevant tests.
2. Run relevant lint/type checks.
3. Review the diff for unrelated changes.
4. Report what changed.
5. Report any known limitations, assumptions, or unresolved risks.

Keep completion summaries concise and factual.
