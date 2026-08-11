# Harness Goals

## Purpose

Harness is an Ubuntu-hosted, vendor-neutral control plane for supervising multiple AI coding agents from one place.

It exists to reduce the fragmentation that comes from running different coding agents through separate tools, terminals, apps, and remote-control systems.

Harness should make it easy to answer:

> What are my agents doing, and which of them needs me right now?

Remote access from a phone is an important use case, but it is not the defining feature of Harness.

Harness is not primarily a remote terminal and is not intended to recreate the full native experience of Codex, Claude Code, or other agent tools.

Its role is supervision, allowing for human coordination and intervention across agents.

## Primary User

Harness is initially intended for a developer working on an Ubuntu workstation who uses multiple AI coding agents.

The developer may:

* Run Codex, Claude Code, and other agents concurrently.
* Work across multiple repositories or workspaces.
* Start sessions from the workstation using familiar tools.
* Leave the workstation while agents continue working.
* Check progress remotely.
* Identify agents waiting for human input.
* Review and respond to questions or approval requests.
* Send additional prompts or instructions.
* Disconnect and reconnect without disrupting underlying work.

Harness should optimize for this workflow before becoming a more general development or orchestration platform.

## Core Product Experience

A developer has several coding agents working on their Ubuntu workstation.

For example:

* Codex is implementing a feature in one repository.
* Claude Code is reviewing changes in another.
* Another session is investigating failing tests.

Harness presents these sessions in one place.

Instead of requiring the developer to watch several terminals or switch between vendor-specific applications, Harness summarizes the important state of each session.

The developer can quickly see:

* Which agents are working.
* What they are broadly doing.
* Which agents have completed.
* Which agents have failed or become stuck.
* Which agents require human attention.

When an agent requires input, Harness should make that obvious.

The developer should be able to inspect enough context to make a decision, respond, and allow the agent to continue.

## Remote Experience

A developer starts or attaches Harness to coding-agent work on their Ubuntu workstation.

They leave the workstation.

The underlying sessions continue running.

From a phone or other remote client, the developer can inspect progress and respond where necessary.

The remote client may disconnect, lose network connectivity, or close entirely without terminating the underlying sessions.

Later, the developer reconnects and continues supervising the same work.

Remote clients observe and control sessions.

They do not own them.

## Unified Attention

Human attention is a scarce resource.

A central goal of Harness is therefore to surface work that requires human intervention rather than forcing the developer to continuously observe all agent output.

A future Harness home view should be capable of presenting something conceptually similar to:

```text
NEEDS YOU

Claude · conduit-python
Permission requested

Codex · Harness
Architecture question


WORKING

Codex · conduit-node
Running tests

Claude · postgres-adapter
Reviewing implementation


DONE

Codex · Go spike
Completed successfully
```

Harness should help answer:

> Which agent needs me?

rather than:

> What characters are currently appearing in every terminal?

This unified attention model is a core product differentiator.

## Vendor Neutrality

Codex and Claude Code are the initial target agents.

Harness should not assume that either provider defines the overall product model.

Each provider may expose different capabilities, session models, approval mechanisms, structured APIs, hooks, or terminal interfaces.

Harness should present a coherent supervisory experience across those differences.

Provider-specific behaviour should be isolated where practical.

Harness should not attempt to make all providers internally identical.

## Native Integration First, PTY Fallback

Harness should prefer structured or officially supported provider integrations when they are available and useful.

For example, an agent may expose:

* A local API.
* A protocol server.
* Structured event streams.
* Hooks.
* Session identifiers.
* Approval APIs.
* Machine-readable output.

These should generally be preferred over interpreting terminal output.

However, Harness should retain a generic PTY-based integration path.

PTY support provides a universal fallback for agents or command-line tools that do not expose richer integration mechanisms.

The initial PTY outcome is an integration spike, not a commitment to model all provider sessions as terminals.

The intended model is approximately:

```text
                     Harness
                        |
                unified session model
                  /      |      \
                 /       |       \
              Codex    Claude    Generic CLI
                |        |           |
             native    native       PTY
           integration integration  fallback
           preferred   preferred
```

PTY is therefore an important capability, but it should not define the entire Harness architecture.

## Sessions Started Outside Harness

Harness should ideally support normal developer workflows.

A developer should not necessarily have to launch every coding agent from within Harness.

Where provider capabilities allow it, Harness should be able to discover, observe, attach to, or otherwise integrate with agent sessions that were initiated outside Harness.

For example, a developer may start an agent directly from an Ubuntu terminal and later want that session visible in Harness.

How this works will differ between providers and remains an open architectural question.

Harness should not assume from the outset that it must own the creation of every agent process.

Supporting externally initiated sessions is a product goal, but is not required for the first working slice. Initial implementations may supervise only work launched through Harness.

## Product Principles

### The Host Owns the Work

The Ubuntu host is authoritative for local execution.

Remote clients must not implicitly own the lifetime of agent work.

Client lifecycle, network lifecycle, Harness session lifecycle, and underlying provider/process lifecycle are separate concepts.

### Detachability Is Fundamental

A remote client must be able to disconnect without terminating ongoing work.

Temporary network failure must not imply session failure.

### Multiple Agents Are Normal

Multiple concurrent sessions are a core product assumption.

The architecture must not assume a single:

* Agent.
* Provider.
* Project.
* Repository.
* Workspace.
* Session.

Parallel work should remain independently identifiable and controllable.

### Harness Is a Supervisory Layer

Harness should not attempt to replace the full desktop experience offered by the underlying coding agents.

When a developer is sitting at the workstation, using Codex or Claude Code directly may remain the best experience.

Harness should focus on the common supervisory operations that provide value across providers.

These may include:

* Viewing session state.
* Inspecting recent meaningful activity.
* Sending a prompt.
* Answering a question.
* Approving or rejecting an action.
* Detecting completion or failure.
* Viewing enough context to understand what requires attention.

Provider-specific advanced functionality may remain in native tooling.

### Agent Semantics Matter More Than Terminal Semantics

Raw terminal output is valuable and should remain available where appropriate.

However, Harness should prefer meaningful states and events such as:

* Working.
* Waiting.
* Requesting approval.
* Asking a question.
* Producing a meaningful agent message.
* Completing.
* Failing.

The desired product abstraction is an agent session, not a terminal window.

### Protocol Is Independent of Transport

Harness has a domain protocol independent of its transport.

WebSocket is currently the likely initial transport between Harness clients and the daemon.

Harness should not treat WebSocket messages themselves as the domain model.

This preserves the possibility of using different transports later without redesigning the Harness protocol.

## Conduit Compatibility

Harness messages should remain structurally compatible with the Conduit message model where that continues to fit naturally.

Likely message metadata includes:

* `id`
* `kind`
* `type`
* `version`
* `streamId`
* `correlationId`
* optional `causationId`
* `timestamp`
* `source`
* optional `extensions`

with domain-specific content carried in `data`.

Harness does not currently depend on Conduit.

Conduit should not be introduced merely because the message shape is useful.

Harness owns its domain protocol independently.

If Harness exposes weaknesses or awkwardness in the Conduit message model, that should be treated as useful architectural feedback rather than something Harness must work around to preserve compatibility.

## Ubuntu First

Ubuntu is the host platform.

Harness may make sensible use of Linux-specific capabilities including:

* PTYs.
* Process management.
* Signals.
* Unix sockets.
* Filesystem conventions.
* Git tooling.
* Other Linux-native facilities.

Cross-platform host support is not currently a goal.

Ubuntu support itself should not be treated as Harness's long-term product differentiator.

Vendor support for operating systems can change.

The stronger product identity is vendor-neutral supervision across agents.

## Security Direction

Harness controls or influences software capable of:

* Reading files.
* Modifying source code.
* Running commands.
* Installing dependencies.
* Accessing developer credentials.
* Making network requests.
* Interacting with Git repositories and remote services.

Harness must therefore be treated as a remote code-execution control surface.

Early development should remain conservative:

* Start locally.
* Avoid accidental public exposure.
* Add remote access deliberately.
* Make trust boundaries explicit.
* Avoid logging credentials, tokens, secrets, or sensitive environment values.
* Do not weaken security merely to simplify development.

A complete authentication, authorization, pairing, and remote-connectivity system is not required for the earliest spikes.

Early shortcuts must remain clearly identified as development-only behaviour.

## Near-Term Outcomes

Development should proceed through small, working outcomes.

The approximate near-term progression is:

1. Prove reliable bidirectional control of a PTY-backed process on Ubuntu.
2. Establish Harness-owned supervisory session semantics without assuming Harness owns every underlying provider session or process.
3. Allow clients to disconnect without implicitly terminating work.
4. Support multiple concurrent sessions.
5. Integrate a real coding agent.
6. Investigate and use structured provider integration where practical.
7. Normalize enough state to provide a useful cross-agent session view.
8. Provide a practical remote client.
9. Surface questions, approvals, failures, and completion as attention-worthy events.
10. Support useful interaction with more than one provider through the same Harness interface.

This sequence describes desired outcomes rather than mandatory implementation steps.

The implementation order may change as spikes produce new information.

## Current Provisional Decisions

The following are current architectural preferences rather than permanent commitments:

* Ubuntu is the host platform.
* Harness will have a long-lived host daemon or equivalent host-side process.
* Node.js and TypeScript are strong candidates for the initial daemon.
* WebSocket is the likely initial client/daemon transport.
* JSON is the likely initial wire representation.
* Harness messages should be Conduit-shaped where natural.
* Codex and Claude Code are the first target providers.
* Harness should support multiple concurrent agent sessions.
* Sessions should have stable Harness identities where Harness needs to track them.
* Client disconnects should not terminate underlying work.
* Structured provider integrations should be preferred over terminal parsing.
* PTY integration should exist as a generic fallback.
* A lightweight browser client may be used before Android to prove client/daemon behaviour.
* Persistence across Harness daemon restarts is not required for the earliest proof.
* Localhost-first development is preferred before remote network exposure.

These decisions should change when implementation evidence provides a good reason to change them.

## Open Questions

The following remain intentionally unresolved:

* Whether Harness should manage PTYs directly or delegate some responsibilities to tools such as `tmux`.
* How Harness should discover or attach to agent sessions started outside Harness.
* Which structured integration mechanisms Codex exposes that are suitable for Harness.
* Which structured integration mechanisms Claude Code exposes that are suitable for Harness.
* Whether Harness should launch provider sessions itself, attach to externally launched sessions, or support both models.
* How agent state should be normalized without hiding important provider differences.
* How reliably Harness can determine states such as:

  * working;
  * waiting for input;
  * approval required;
  * blocked;
  * completed;
  * failed.
* The eventual authentication and device-pairing model.
* How remote access beyond the local network should work.
* Whether sessions should survive Harness daemon restarts.
* What history should be persisted.
* How much raw terminal history should be retained.
* How permissions and approval policies should work across providers.
* Whether Harness should eventually provide unified approval policies.
* How repositories, branches, and Git worktrees should interact with concurrent agents.
* Whether Harness needs a higher-level task abstraction above sessions.
* Whether agent-to-agent orchestration belongs in Harness.
* Whether agents should ever be able to coordinate through Harness.
* Whether and where Conduit itself eventually becomes useful.
* How much provider-specific functionality Harness should expose versus delegating back to native applications.

Open questions should remain open until there is enough evidence or a concrete need to decide them.

## Current Non-Goals

Harness is not currently intended to be:

* A generic SSH client.
* A remote desktop platform.
* A generic remote terminal product.
* A replacement for a desktop IDE.
* A replacement for Codex.
* A replacement for Claude Code.
* A recreation of the complete Codex mobile experience.
* A recreation of the complete Claude mobile experience.
* A complete terminal emulator.
* Harness will not build its own terminal-emulation engine; established terminal components may be used for fallback access.
* A cloud-hosted development environment.
* A general workflow orchestration platform.
* An autonomous multi-agent organization.
* A message-broker-based distributed system.
* A cross-platform host daemon.
* A system that eliminates human supervision.

Harness should avoid competing with vendor-specific tools in areas where those tools naturally have better access to their own functionality.

Its value should come from providing a useful layer above them.

### Near-term non-goals:

* No daemon-restart persistence initially.
* No public-network exposure initially.
* No Android client until the host/client boundary is proven.
* No semantic parsing of terminal output unless required by a specific experiment.
* No worktree automation, agent-to-agent orchestration, or task scheduling initially.
* Multiple concurrent sessions should be supported before any higher-level orchestration is attempted.

## Architectural Test

When considering a feature or abstraction, ask:

> Does this make it easier or safer to supervise, coordinate, or intervene in coding-agent work across providers?

If not, it probably does not belong in Harness yet.

When considering provider-specific functionality, also ask:

> Does Harness need to own this, or should the native provider tool continue to own it?

The first useful version of Harness does not need to predict the final architecture.

It needs to prove that multiple coding agents can run on an Ubuntu development machine while the developer retains a single, useful view of their progress and can intervene when their attention is required.



