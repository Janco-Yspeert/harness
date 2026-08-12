# Harness

Harness is an Ubuntu-hosted control plane for supervising multiple AI coding
agents from one place.

The product direction and architectural constraints are documented in
[`GOALS.md`](./GOALS.md) and [`AGENTS.md`](./AGENTS.md).

## Requirements

- Node.js 24.12 or newer
- npm 11 or newer
- Ubuntu

## AI-First Development

Harness is intentionally designed and developed using an AI-first engineering
process.

AI is not treated only as a code-generation tool. Planning, implementation,
evaluation, and review are separate parts of the development workflow, with
different agents given different responsibilities and context.

The repository therefore includes the AI-development artifacts used to build and
verify Harness alongside the implementation itself.

These include:

- agent operating instructions;
- reusable AI skills;
- spike briefs;
- public evaluation requirements;
- evaluation specifications;
- hidden evaluation tests after successful verification;
- evaluation results;
- architectural decisions and spike outcomes.

This makes the development process itself inspectable and versioned rather than
leaving important engineering context inside transient AI conversations.

### Development Workflow

Harness is developed incrementally through focused spikes.

The current workflow is:

1. **Spike design** Human + ChatGPT discuss the next increment, resolve its
   intended scope, and create a spike brief.

2. **Implementation-readiness review** Codex reviews the proposed brief against
   the current repository and surfaces ambiguities, contradictions, missing
   decisions, or implementation assumptions.

3. **Brief freeze** Human + ChatGPT resolve those findings and establish the
   implementation-ready spike brief.

4. **Independent evaluation preparation** Claude acts as the evaluator. From the
   frozen brief and existing project contracts it:

   - derives the evaluation contract;
   - surfaces assumptions and testability requirements;
   - writes public `eval-requirements.md`;
   - creates a private `eval-spec.md`;
   - creates hidden executable evaluation tests.

5. **Implementation** Codex implements the spike using:

   - the spike brief;
   - `eval-requirements.md`;
   - the applicable repository instructions and skills.

   The implementation agent cannot use the private evaluation specification or
   hidden tests.

6. **Independent verification** Claude runs the frozen hidden evaluation against
   the completed implementation.

   Evaluation failures are distinguished between:

   - implementation failures;
   - specification ambiguities;
   - evaluator defects;
   - infrastructure failures;
   - specification drift.

7. **Evaluation promotion** After successful verification, the exact evaluation
   specification, evaluation result, manifest, and hidden tests used for
   verification are promoted into the spike directory and committed as part of
   its permanent historical record.

8. **Independent code review** The verified implementation receives an
   additional independent review before the spike is considered complete.

This separation is deliberate:

- the implementer knows the contract but not the hidden evaluation;
- the evaluator derives its tests independently of the implementation;
- assumptions required for fair evaluation are public;
- hidden tests cannot silently impose undisclosed architecture;
- failed implementations do not cause the evaluator to move the goalposts.

### Skills

Reusable AI workflows live under [`skills/`](./skills/).

The canonical Harness copies are kept there even where a particular AI tool
requires a vendor-specific discovery path. Tool-specific directories may
therefore symlink back to the canonical skill.

Current skills include:

- **Evaluator** — prepares and runs independent spike evaluation.
- **Implementation** — implements a frozen spike from its brief and public
  evaluation requirements.

Detailed workflow instructions belong in skills rather than being duplicated
throughout `AGENTS.md`. This keeps always-loaded agent context relatively small
while allowing task-specific procedures to be loaded when needed.

### Spike Artifacts

Spikes use zero-padded three-digit identifiers:

```text
spikes/
├── 001-...
├── 002-...
├── 010-...
└── 123-...
```

During implementation, a spike contains its public development artifacts,
including its brief and evaluator-surfaced requirements.

Private evaluator material is deliberately kept outside the Harness repository
while evaluation remains hidden.

Conceptually:

```text
harness/
└── spikes/
    └── NNN-example/
        ├── spike.md
        └── eval-requirements.md

harness-hidden/
└── spikes/
    └── NNN-example/
        ├── eval-spec.md
        ├── eval-result.md
        └── .hidden-test/
```

After successful verification, the evaluated artifacts are promoted without
modification into the permanent spike record:

```text
spikes/
└── NNN-example/
    ├── spike.md
    ├── eval-requirements.md
    └── evaluation/
        ├── eval-spec.md
        ├── eval-result.md
        └── hidden-tests/
            ├── manifest.json
            └── ...
```

The promoted files are the exact artifacts used during successful verification.

The hidden evaluation workspace is temporary; the promoted spike artifacts
become the canonical historical record.

## Spike 1: Bidirectional PTY Control

The first implementation spike proves basic bidirectional control of a real PTY.

It runs one interactive Bash process in a real PTY and connects a single browser
to it over WebSocket.

Both the HTTP and WebSocket servers are bound to `127.0.0.1`; they are
deliberately unavailable from other machines.

### Run the Spike

Install dependencies and start the host:

```sh
npm install
npm start
```

Open http://127.0.0.1:3000 in a browser on the same Ubuntu machine.

Enter commands such as:

```text
pwd
echo hello
ls
```

and confirm that Bash output appears in the browser.

Closing the page disconnects the WebSocket but does not stop the Bash process
while the host remains running.

Press Ctrl+C in the host terminal to stop Harness and its Bash child.

### Development

During development:

```sh
npm run dev
npm test
npm run check
```

This project uses Node's native TypeScript type stripping at runtime.

TypeScript syntax must therefore remain erasable. `npm run typecheck` performs
static type checking separately.

### Known Spike Limitations

- There is one Bash process and at most one connected browser.
- PTY output is not retained or replayed while no browser is connected.
- A newly connected browser sees only output produced after it connects.
- ANSI control sequences are displayed as plain text rather than interpreted.
- The command form sends complete lines; it is not a full terminal keyboard.
- There is no authentication.
- Localhost-only binding prevents network exposure, but any local process able
  to connect can control Bash.
- This is strictly a development-only security posture, not a complete trust
  boundary.
