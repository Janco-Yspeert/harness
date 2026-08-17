# Harness

Harness is an experimental Ubuntu-hosted control plane for supervising AI coding
agents.

The long-term goal is to provide one place to start, observe, reconnect to, and
interact with coding-agent sessions running on a development machine, with a
clean boundary between the host that owns those sessions and the clients used to
control them.

The current implementation is deliberately narrower. It is focused on proving
the host/session model, backend abstraction, lifecycle behaviour,
reconnectability, and native agent integration before attempting remote access
or multi-agent orchestration.

The broader product direction and architectural constraints are documented in
[`GOALS.md`](./GOALS.md) and [`AGENTS.md`](./AGENTS.md).

## Current Status

Harness is an experimental engineering project, not a production-ready
remote-access tool.

Development is progressing through focused implementation spikes. The completed
work so far establishes:

- bidirectional browser-to-PTY control;
- explicit session creation, attachment, deletion, and cleanup;
- detach and reconnect behaviour;
- browser recovery from stale sessions;
- a backend abstraction separating session management from the controlled
  process;
- a native Codex backend using the Codex App Server protocol;
- structured handling of agent events and turn lifecycle;
- integration and lifecycle testing around both PTY and Codex-backed sessions.

The current browser interface remains a minimal development client rather than
the intended end-user experience.

The host is deliberately local-first. Public-network exposure, daemon-restart
persistence, a dedicated mobile client, and multi-agent orchestration are later
concerns.

## Why Harness?

Coding agents are increasingly capable of carrying out substantial engineering
work, but interaction with them is still commonly tied to an individual terminal
or application.

Harness explores a different model:

- the **host owns the agent session**, rather than the client;
- clients can attach and detach without necessarily owning the session lifetime;
- agent backends can sit behind a common control boundary;
- lifecycle and session state are explicit rather than implicit in a terminal
  process;
- clients can eventually be separated from the machine doing the engineering
  work;
- richer supervision and multi-agent coordination can be built above that
  boundary later.

The immediate goal is not to design the complete system upfront.

Harness is being developed incrementally through small spikes intended to expose
architectural assumptions before increasingly complex behaviour is built on top
of them.

## Requirements

- Ubuntu
- Node.js 24.12 or newer
- npm 11 or newer

## Running Harness

Install dependencies:

```sh
npm install
```

Start the host with the default PTY backend:

```sh
npm start
```

To use the native Codex backend instead:

```sh
HARNESS_BACKEND=codex npm start
```

The Codex backend uses the locally installed Codex CLI and its existing
authentication. Harness does not manage Codex credentials. By default, Codex
uses the directory from which Harness was started; set `HARNESS_CODEX_CWD` to
use another working directory:

```sh
HARNESS_BACKEND=codex HARNESS_CODEX_CWD=/path/to/project npm start
```

The development interface is available at:

```text
http://127.0.0.1:3000
```

Harness currently binds its HTTP and WebSocket interfaces to `127.0.0.1`. This
is intentional. The current security model is suitable for local development
only and should not be treated as a complete trust boundary for remote access.

## Development

During development:

```sh
npm run dev
npm test
npm run check
```

Harness uses Node's native TypeScript type stripping at runtime.

TypeScript syntax must therefore remain erasable, while static type checking is
performed separately.

The project also includes repository CI under
[`.github/workflows/`](./.github/workflows/).

## AI-First Development

Harness is also an experiment in **AI-first software development**.

AI is used as an active participant in planning, implementation, evaluation, and
review rather than only as a code-generation tool.

The development process is **not based on a prescribed methodology, course, or
certification**. It has evolved through practical experimentation with coding
agents and continues to change as those experiments reveal useful techniques,
failures, and new problems.

The human remains responsible for deciding scope, resolving architectural
questions, adjudicating ambiguity, and deciding what evidence is sufficient to
accept an engineering result.

Practices currently being explored include:

- separating implementation from evaluation;
- freezing spike requirements before implementation;
- giving implementation and evaluation agents different responsibilities and
  context;
- independently deriving evaluation from the frozen requirements;
- withholding selected executable evaluation tests from the implementation
  agent;
- making assumptions required for fair evaluation visible to the implementer;
- retaining every evaluation attempt privately and promoting eligible exact
  evidence immediately after evaluator `PASS`, before human acceptance;
- explicitly recording what a spike demonstrated — and what it did not;
- treating the development workflow itself as something that can be measured and
  improved.

These are **working hypotheses rather than claimed best practices**.

A technique working successfully during one spike is evidence about that spike.
It is not automatically treated as proof that the technique is generally
reliable.

Part of the purpose of Harness is to discover which practices actually improve
reliability, efficiency, and human oversight when coding agents participate
deeply in software development.

### The Workflow Is Part of the Experiment

The AI-development process itself is treated as engineering work rather than
invisible prompting infrastructure.

An early Harness spike was dedicated specifically to establishing the
development and evaluation workflow. Subsequent spikes have exposed weaknesses
in both implementations and the workflow used to evaluate them.

That distinction matters.

An AI evaluator is not treated as a truth oracle. Evaluation infrastructure can
itself contain incorrect assumptions, defective tests, infrastructure problems,
or specification drift.

The process therefore attempts to distinguish between:

- implementation defects;
- evaluator defects;
- specification ambiguity;
- infrastructure failures;
- specification drift.

The development artefacts used to reach those conclusions are kept alongside the
implementation where useful, making the evolution of the project inspectable
rather than leaving important engineering context only inside transient AI
conversations.

## Independent Evaluation

Some Harness spikes use independently prepared evaluation that is hidden from
the implementation agent while implementation is in progress.

The implementation agent receives:

- the frozen spike brief;
- the frozen Design Map;
- public evaluation requirements;
- public feedback from prior confirmed implementation failures, if any;
- relevant repository contracts and operating instructions.

It does **not** receive the private evaluation specification or hidden
executable tests.

The purpose is not secrecy for its own sake.

It reduces the opportunity for an implementation to optimise specifically for a
known test suite while still requiring the evaluator to expose assumptions that
materially affect what constitutes a fair implementation.

“Hidden” describes the tests' relationship to the implementation agent **during
evaluation**, not their permanent visibility.

After successful verification, the exact evaluator revisions and complete
attempt/result history from that evaluation cycle can be promoted into the
repository as part of the spike's historical record.

That means a reader can inspect not only the implementation, but also the
evidence used to verify it.

## Development Workflow

Harness is developed incrementally through focused spikes.

At a high level:

1. **Spike design** — Human + AI work through the intended behaviour, scope, and
   constraints of the next increment.

2. **Brief Readiness** — A separate agent reviews the proposed brief against the
   current repository and identifies ambiguities, contradictions, missing
   decisions, and hidden implementation assumptions.

3. **Brief freeze** — Those findings are resolved and the spike brief becomes
   the implementation contract.

4. **Design Map** — A compact shared contract records existing constraints and
   establishes only the behavior-preserving seams that implementation and
   evaluation must interpret consistently.

5. **Independent evaluation preparation** — An evaluator derives public
   evaluation requirements and private executable evaluation from the frozen
   contract.

6. **Implementation** — A separate implementation agent works from the frozen
   brief, Design Map, public evaluation requirements, applicable repository
   instructions, and sanitized feedback from confirmed earlier failures without
   access to hidden evaluation.

7. **Independent verification** — The evaluator runs the previously prepared
   evaluation against the completed implementation.

8. **Failure diagnosis and retry where necessary** — A failure is investigated
   to determine whether it represents an implementation defect, evaluator
   defect, ambiguity, infrastructure failure, or specification drift rather than
   merely attempting to make the result green.

9. **Evaluation promotion** — Immediately after evaluator `PASS`, eligible exact
   evaluator revisions and the complete attempt history are preserved with the
   spike before the later human acceptance gate.

10. **As-Built** — A fresh-context pass records material behavior and structure
    actually present and classifies discrepancies as Missing, Contradictory, or
    Extra.

11. **Outcome** — Evidence from the spike is synthesised into an explicit
    outcome describing what was demonstrated, what failed, what changed, and
    what remains unresolved.

Additional independent code review can be performed where warranted by the scope
or risk of the change.

The separation is deliberate:

- the implementer knows the contract but not the hidden evaluation;
- the evaluator derives its tests independently of the implementation;
- assumptions required for fair evaluation should be visible;
- hidden tests should not silently impose undisclosed architecture;
- failed implementations should not cause the evaluator to move the goalposts;
- defects in the evaluator should not be misrepresented as defects in the
  implementation.

The detailed operational rules live in repository instructions, skills, and
individual spike artefacts rather than in this README.

## Repository Structure

The high-level repository structure is intentionally fairly conventional:

```text
harness/
├── src/                 # Host, session and backend implementation
├── test/                # Integration tests
├── public/              # Minimal development browser client
├── fixtures/            # Test fixtures and fake backends
│
├── skills/              # Canonical reusable AI workflows
│   ├── as-built/
│   ├── brief-readiness/
│   ├── design-map/
│   ├── evaluator/
│   ├── implementation/
│   └── outcome/
├── docs/history/skills/ # Immutable prior skill contracts
│
├── spikes/              # Incremental experiments and engineering evidence
│   ├── 001-pty/
│   ├── 002-ai-development-workflow/
│   ├── 003-session-lifecycle/
│   ├── 004-session-backend-abstraction/
│   ├── 005-native-codex-backend/
│   └── 006-Development-Workflow-Skills-Refactor/
│
├── .github/
│   └── workflows/       # CI
│
├── GOALS.md
├── AGENTS.md
├── CONTRIBUTING.md
└── SECURITY.md
```

### Spikes

[`spikes/`](./spikes/) contains the incremental engineering experiments used to
develop Harness.

Later spikes typically contain artefacts such as:

```text
spikes/
└── NNN-example/
    ├── spike.md
    ├── feedback.md
    ├── design-map.md
    ├── eval-requirements.md
    ├── manifest.md
    ├── as-built.md
    ├── outcome.md
    ├── preliminary/
    ├── attempts/
    └── evaluation/
        ├── eval-spec.md
        ├── eval-result.md
        └── hidden-tests/
            ├── manifest.json
            └── ...
```

The exact structure has evolved with the development process rather than being
retroactively normalised.

Failed, blocked, preliminary, or superseded attempts may be retained where they
provide useful evidence about how a requirement, implementation, or evaluation
changed.

The repository is intended to preserve useful parts of the **engineering
trail**, not only the final green result.

Spike 005 also contains the Codex App Server protocol schema against which the
native Codex backend was developed and evaluated. Keeping that protocol baseline
with the spike makes the integration and its evaluation reproducible against a
known contract.

### Skills

Reusable AI workflows live under [`skills/`](./skills/).

The `skills/` directory is deliberately part of the documented project
structure.

These files are not intended to be transient prompts or AI conversation history.
They contain task-specific operating instructions for repeatable agent
responsibilities that would otherwise have to be reconstructed in individual
prompts or placed in broader always-loaded agent instructions.

Current skills include:

- **Brief Readiness** — reviews a proposed brief before it is frozen.
- **Design Map** — establishes the smallest shared design contract needed by
  evaluator and implementation.
- **Evaluator** — prepares and runs independent spike evaluation.
- **Implementation** — implements a frozen spike from its public contract.
- **As-Built** — records the material behavior and structure actually built.
- **Outcome** — synthesises evidence and conclusions from a completed spike.

Active skills carry monotonically increasing integer contract versions.
Materially replaced contracts are preserved as non-executable historical
documents under [`docs/history/skills/`](./docs/history/skills/) as well as in
Git history. Spikes using the revised workflow record the skill versions that
actually ran in their append-only `manifest.md`.

Some skills are deliberately detailed. They act as operational contracts for
coding agents rather than introductory documentation for human readers.

The canonical definitions live under `skills/`.

Local tool-specific discovery directories, such as those used by Codex or Claude
tooling, can symlink to these canonical definitions where necessary. Those local
adapter directories are gitignored and are not part of the public repository.

One of the project's near-term goals is to make the canonical skills
increasingly **CLI- and vendor-neutral**, so that they describe capabilities,
responsibilities, permissions, inputs, and outputs rather than unnecessarily
depending on a particular coding-agent interface.

## Current Limitations

Harness remains intentionally constrained while the core host/client and backend
boundaries are being established.

Current limitations include:

- localhost-only operation; remote access is not implemented;
- no authentication suitable for remote access;
- sessions do not survive a host restart;
- multi-agent orchestration is not yet implemented;
- there is no dedicated mobile client;
- the browser UI is a development client rather than the intended product
  interface;
- the current implementation still prioritises proving backend and lifecycle
  behaviour over user-facing polish.

These are deliberate sequencing decisions rather than descriptions of the
intended final product.

See [`GOALS.md`](./GOALS.md) for the broader direction and current non-goals.

## Next Steps

With the initial session architecture, backend abstraction, and native Codex
integration established, the next phase includes improving both Harness itself
and the AI-development process being used to build it.

Near-term areas of investigation include:

### Evaluator Performance

Measure the cost and efficiency of the current evaluation workflow, particularly
the Claude-based evaluator.

This includes examining factors such as:

- agent turns;
- token and context growth;
- file-read volume;
- shell/tool output;
- repeated repository discovery;
- other significant sources of evaluation overhead.

The aim is not simply to reduce token usage, but to identify where additional
context or agent work contributes useful verification and where it represents
avoidable process cost.

### Evaluation and Promotion Lifecycle

Refine the rules around how evaluation evidence becomes part of the permanent
spike record.

The current workflow already preserves successful evaluation evidence and
selected failed or diagnostic attempts, but later work should make the lifecycle
more explicit, particularly around:

- failed evaluations;
- corrected evaluator artefacts;
- repeated implementation attempts;
- evaluator defects;
- diagnostic evidence;
- which artefacts become canonical after eventual success.

### CLI-Neutral Skills

Reduce unnecessary assumptions about Codex, Claude, or any particular
coding-agent CLI inside the reusable skills.

The goal is for skills to describe the engineering role and contract — including
permissions, inputs, outputs, responsibilities, and boundaries — while local
adapters handle tool-specific discovery and invocation.

### Context Efficiency

Review the accumulated skill and agent instructions for:

- duplicated rules;
- obsolete constraints;
- vendor-specific assumptions;
- explanatory material that does not need to be loaded during execution;
- context that could live in narrower task-specific documentation.

The goal is **not simply shorter files**.

It is to reduce unnecessary agent context while preserving the constraints and
safeguards learned through previous spikes.

### Further Control-Plane Development

Continue incrementally toward the broader Harness product direction, including
richer agent supervision, additional backend capabilities, detachable clients,
and eventually multi-agent coordination.

These are experimental directions rather than a fixed product roadmap.

Their order may change as subsequent spikes expose new constraints or invalidate
existing assumptions.

## License

No license is currently granted for reuse or redistribution. The Harness source
is public for demonstration and evaluation purposes.

Third-party generated artefacts retain their upstream licences and are not
subject to that restriction.

In particular, the Codex App Server schemas under:

```text
spikes/005-native-codex-backend/protocol/app-server-schema/
```

are derived from OpenAI Codex and redistributed under the included
[Apache License 2.0](./spikes/005-native-codex-backend/protocol/app-server-schema/LICENSE).
