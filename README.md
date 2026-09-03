# Harness

Harness is a Linux control plane for supervising coding agents, and a test bed
for a structured way of building software with them.

## What is Harness?

Harness began with a practical problem: coding agents were doing longer pieces
of work on a Linux machine, while the person responsible for them could not
comfortably leave the terminal.

The original idea was to make those sessions belong to the host rather than to
whichever client happened to be connected. A developer could start an agent,
walk away, check it from a phone, answer a question, approve an action, and
reconnect later without disturbing the underlying work. Harness would be more
than a remote terminal: it would understand that an agent session has a
lifecycle and occasionally needs a human.

Then Codex became capable of doing a surprising amount of the orchestration
itself. From a higher-level conversation it could operate the development host,
launch processes, inspect their output, and carry a workflow across multiple
steps. The original runtime problem still mattered, but it was no longer the
whole project.

At the same time, Harness was becoming an experiment in AI-first development.
Its skills already separated brief review, design, implementation, evaluation,
As-Built inspection, and Outcome synthesis. The problem was that a sufficiently
capable orchestrator could wear every hat. One Codex context could invoke the
skills, implement the feature, understand the private evaluation machinery,
judge the result, and manage the evidence saying those jobs were independent.
Convenient, certainly. Convincing, less so.

That gave the runtime a second job: execute methodology roles through distinct,
host-owned agent runs and keep their identities, inputs, permissions, logs, and
outcomes separate. The orchestrator can still decide what should happen next; it
should not quietly become implementer, examiner, records clerk, and appeals
court at the same time.

Harness now has two connected purposes:

1. **Runtime supervision** — launch, observe, direct, detach from, reconnect to,
   and recover agent work running on a Linux host.
2. **Methodology execution** — run an evidence-producing development workflow
   whose authority survives any one agent context.

The result is part control plane, part methodology laboratory. The two halves
are still uneven, but they now solve parts of the same problem: how to let
agents do substantial work without making their activity opaque or their claims
self-authenticating.

The broader product direction lives in [`GOALS.md`](./GOALS.md). Repository-wide
engineering and workflow rules live in [`AGENTS.md`](./AGENTS.md).

## Current State

Harness is experimental. Individual capabilities have integration tests and
preserved evaluation evidence; the whole is still a development system rather
than a production remote-access product.

### Runtime

The current implementation provides:

- a loopback-only HTTP and WebSocket host on Ubuntu;
- a generic PTY backend and a native Codex backend using the Codex App Server
  protocol;
- browser-driven session creation, attachment, input, detachment, deletion, and
  cleanup;
- a live host-level structured event stream for session and workflow-run
  lifecycle events;
- host-owned workflow runs with stable identity, lifecycle state, diagnostic
  logs, cancellation, explicit replacement, and execution-attempt provenance;
- named workspace-oriented profiles and local executor commands for Codex and
  Claude; and
- a repository-local workflow CLI that handles phase order, local operational
  state, public methodology authority, and canonical run dispatch.

Interactive sessions and methodology runs share the Harness host but remain
different domain objects. An interactive session accepts client input. A
workflow run instead records a role, phase, executor, workspace boundary,
permission profile, attempt identity, lifecycle, and terminal disposition.

The host-owned workflow-run path is active prototype work. Spike 011 established
the model and its integration surface, then failed human acceptance because the
real Claude executor boundary had not been demonstrated strongly enough. The
technical `PASS`, the human rejection, and the reason for it all remain in the
repository. That is a useful miniature of the methodology doing its actual job.

See the [Spike 011 manifest](./spikes/011-host-owned-workflow-runs/manifest.md)
for the precise evidence and rejection record.

### Development methodology

The repository also contains a working set of versioned skills and supporting
tools for:

- reviewing a brief before it becomes binding;
- freezing a small shared Design Map;
- preparing evaluation before implementation;
- implementing from the public frozen contract;
- verifying through a separate evaluator role;
- preserving evaluator revisions and every allocated attempt;
- recording the system that was actually built;
- keeping technical verification separate from human acceptance; and
- synthesising the accepted result into an Outcome.

The workflow has accumulated some ceremony, and much of it has a scar behind it:
an evaluator moved, an attempt lost its identity, a technical `PASS` hid missing
coverage, or an orchestrator crossed a boundary it was meant to supervise. The
spike history keeps those failures visible instead of sanding them into a
suspiciously perfect origin story.

## Running Harness

Harness currently requires:

- Ubuntu;
- Node.js 24.12 or newer; and
- npm 11 or newer.

Install dependencies:

```sh
npm install
```

Start the host with the default PTY backend:

```sh
npm start
```

Use the native Codex backend:

```sh
HARNESS_BACKEND=codex npm start
```

The Codex backend uses the locally installed Codex CLI and its existing
authentication. By default it works in the directory from which Harness was
started. Set a different working directory with:

```sh
HARNESS_BACKEND=codex HARNESS_CODEX_CWD=/path/to/project npm start
```

The development client is available at
[`http://127.0.0.1:3000`](http://127.0.0.1:3000).

Harness binds its HTTP and WebSocket interfaces to `127.0.0.1`. There is no
remote authentication boundary yet. Read [`SECURITY.md`](./SECURITY.md) before
putting it anywhere near a tunnel, proxy, or shared machine.

### Development checks

```sh
npm run dev
npm test
npm run check
```

Harness uses Node's native TypeScript type stripping at runtime, so runtime
TypeScript syntax must remain erasable. Static checking, linting, formatting,
and tests are collected under `npm run check`.

### Workflow CLI

The workflow runner operates on one `spikes/NNN-*/` directory at a time:

```text
npm run workflow -- init <spike>
npm run workflow -- status <spike>
npm run workflow -- dispatch <phase> <spike> [--execute]
npm run workflow -- record <phase> <spike> <complete|blocked|failed>
npm run workflow -- cancel <phase> <spike>
npm run workflow -- authority status <spike>
```

Dispatch is a dry run unless `--execute` is supplied. Canonical execution uses
the running Harness host; the CLI does not create a private substitute when the
host is unavailable.

The CLI has two kinds of state:

- ignored `.workflow/` data for local dispatch and run bookkeeping; and
- committed `workflow.jsonl` evidence for guarded methodology transitions.

Raw agent output is diagnostic. It does not become a completed phase merely by
sounding pleased with itself.

## The AI-First Workflow

An ordinary implementation spike follows this shape:

1. Draft the spike brief.
2. Run **Brief Readiness**, resolve material findings, and freeze the brief with
   committed provenance.
3. Create and freeze the **Design Map**, which pins shared decisions while
   leaving ordinary implementation freedom alone.
4. Run evaluator **prepare**. It derives public evaluation requirements and a
   private evaluation bundle from the frozen contract, validates their
   integrity, and freezes them before implementation begins.
5. Run **Implementation** in a separate role context using only the public
   contract and public evaluation material.
6. Run evaluator **verify** against the frozen evaluator revision. A failure is
   classified before deciding whether implementation, evaluation, or the
   specification must change.
7. After evaluator `PASS`, promote the eligible evaluator history and attempt
   results into the public spike record.
8. Run **As-Built** against the final implementation and frozen contract.
9. Ask for explicit human acceptance or rejection.
10. After acceptance, run **Outcome** to record what the spike established,
    discovered, and left unresolved.

Routine transitions continue without a human ceremony break. Humans remain the
authority for product acceptance, material scope decisions, and genuinely
ambiguous recovery choices.

### Separate roles, not costume changes

Implementation and evaluation are authority-sensitive roles. They need distinct
execution contexts and controlled access, especially while evaluator material is
private. Starting a fresh prompt inside an otherwise omniscient orchestrator is
a costume change, not separation.

The workflow runner and Harness host are intended to make that separation
observable. A run has an executor, role, skill version, workspace boundary,
attempt identity, and lifecycle independent of the conversation coordinating it.

### Hidden evaluation

Evaluator preparation happens before implementation and publishes the
assumptions that affect a fair implementation. Executable evaluator tests may
remain hidden from the implementer during the active cycle.

Hidden tests are a tool, not a quota. If the frozen contract leaves no stable
observable seam, a test written before implementation may simply guess the
eventual representation. The evaluator can use visible tests, static inspection,
provenance checks, or a concretely defined procedure instead. Whatever it uses
must map back to the frozen criteria and survive pre-freeze integrity checks.

After `PASS`, eligible private evaluation material is promoted into the spike's
public historical record. Failed attempts and superseded revisions stay in the
chain. A green result is useful; a green result with a chain of custody is more
useful.

### Technical verification and human acceptance

Evaluator `PASS` means the implementation satisfied the frozen,
machine-verifiable evaluation contract. It does not settle every product or
methodology judgement.

Human review has rejected technically passing Harness spikes after finding
missing evaluator coverage or a gap between a constructed executor profile and
its real behaviour. Those rejections preserve the original implementation,
evaluation, promotion, and As-Built records. Material correction moves forward
through a successor such as `010a` rather than editing history until it agrees
with the latest conclusion.

### Evidence

Depending on the workflow generation, a spike may contain:

- `spike.md` — frozen intent and acceptance criteria;
- `feedback.md` — Brief Readiness findings;
- `design-map.md` — shared contracts and implementation freedom;
- `eval-requirements.md` — public evaluation obligations;
- `coverage-map.json` — criterion-level coverage and readiness attestation;
- `manifest.md` — append-only execution history and available measurements;
- `workflow.jsonl` — guarded public methodology transitions;
- `evaluation/` — promoted revisions, attempts, results, and promotion metadata;
- `as-built.md` — comparison of the final system with the frozen contract;
- `acceptance.md` — the human decision where recorded; and
- `outcome.md` — the accepted spike's historical synthesis.

Exact layouts vary because the methodology evolved in public. Historical
artefacts are left in the shape that was authoritative at the time.

## Repository Map

```text
harness/
├── src/                  # Host, sessions, backends, events, workflow runs
├── public/               # Minimal browser development client
├── test/                 # Integration and workflow tests
├── fixtures/             # Test processes and backend fixtures
├── tools/
│   ├── workflow.ts       # Workflow runner and public methodology authority
│   └── evaluator-integrity.ts
│
├── skills/               # Active, versioned methodology roles
│   ├── brief-readiness/
│   ├── design-map/
│   ├── evaluator/
│   ├── implementation/
│   ├── as-built/
│   └── outcome/
├── docs/history/skills/  # Replaced skill contracts
├── spikes/               # Experiments, failures, evidence, and outcomes
│   ├── 001-pty/
│   ├── ...
│   └── 011-host-owned-workflow-runs/
│
├── GOALS.md
├── AGENTS.md
├── CONTRIBUTING.md
└── SECURITY.md
```

The active skill files are operational contracts for agents, so some are much
more detailed than normal human-facing documentation. Tool-specific discovery
directories can point to these canonical definitions without becoming a second
copy of the methodology.

## Current Limits

The sharp edges are currently:

- one active interactive session rather than the intended multi-session
  supervisory view;
- localhost-only operation with no remote authentication;
- no dedicated phone client;
- no persistence of sessions, workflow runs, event history, or logs across host
  restart;
- a live-only event stream with no replay or reconnect snapshot;
- a minimal browser interface;
- native interactive integration for Codex, while other tools still need PTY or
  workflow-specific execution paths;
- an unresolved proof gap around bounded unattended Claude workflow execution;
- incomplete cost, token, context, and orchestration-time measurement; and
- no general-purpose scheduling or agent-to-agent coordination layer.

Harness can execute separate methodology roles, but that is narrower than the
eventual product goal of supervising many independent agents and projects from
one place.

## Direction

Near-term work falls into four threads:

1. **Make workflow execution trustworthy.** Close the real executor-boundary and
   evaluator-integrity gaps exposed by human review.
2. **Make the methodology portable.** Package the skills so they can be
   installed into projects in different languages and used by different capable
   agents.
3. **Measure the trade.** Record reliable provider cost, agent effort, and Codex
   orchestration time so the rigorous workflow can be compared with lighter
   approaches.
4. **Return the methodology's attention to the product.** Build multiple-session
   supervision, meaningful attention states, reconnectable history, and a safe
   remote/mobile experience.

The methodology has recently been eating most of the project. That has produced
useful machinery and several excellent failure records. It should now start
paying rent by helping build the control plane it was created inside.

The order is provisional. Harness spikes have a habit of turning an apparently
obvious next step into a more interesting problem.

## Contributing

Harness is a personal experimental project, but focused external contributions
may be considered. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before investing
in a substantial change. Changes go through focused branches and squash-merged
pull requests; historical spike evidence is not tidied for presentation.

## License

No license is currently granted for reuse or redistribution. The Harness source
is public for demonstration and evaluation purposes.

Third-party generated artefacts retain their upstream licences. In particular,
the Codex App Server schemas under
[`spikes/005-native-codex-backend/protocol/app-server-schema/`](./spikes/005-native-codex-backend/protocol/app-server-schema/)
are derived from OpenAI Codex and redistributed under the included
[Apache License 2.0](./spikes/005-native-codex-backend/protocol/app-server-schema/LICENSE).
