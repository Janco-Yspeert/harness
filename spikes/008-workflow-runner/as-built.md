# As-Built — Spike 008 Local Workflow Runner

## Inspected implementation

- Final implementation revision: `e147e0f757699552d8d6e02a15618996174770a3`
  (`Implement local workflow runner`).
- Frozen brief identity:
  `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`.
- Frozen Design Map identity:
  `sha256:b57bfb2e8bb302717eff8549da56f23c85089e1f72e1165bf17264dc1be3d8fd`.
- Public evaluation requirements identity:
  `sha256:449873a0355cc377294d0ca1fa144a2d7d77347c4e96e4dd72b18bdea422a53a`.
- Final verification: attempt `002`, `PASS`, against evaluator revision `002`.

## Implemented shape

Harness now exposes a repository-local TypeScript workflow CLI through
`npm run workflow --`. It accepts only a normalized existing
`spikes/NNN-*/` directory beneath the repository root and implements `init`,
`status`, `dispatch`, `record`, and `cancel` commands.

Each initialized spike receives a Git-ignored `.workflow/state.json` with a
versioned, append-only sequence of initialization, dispatch, detached-job, and
terminal-outcome records. A record carries the canonical phase identifier, its
attempt number, and timestamp. Detached job records additionally carry the PID,
argument-vector command, local log path, and launch time. Status derives job
liveness with PID probing only; it does not read or interpret agent output.

The runner fixes the canonical seven-phase order and ownership: Codex owns
Brief Readiness, Design Map, implementation, As-Built, and Outcome; Claude owns
evaluator prepare and evaluator verify. It renders a short phase-specific
prompt that names the spike and corresponding repository skill without naming
evaluator-private locations or mechanics. The first three prerequisite phases
and the post-verification historical phases require their predecessor's explicit
`complete` outcome. Evaluation preparation cannot be re-dispatched. A failed
evaluator-verify attempt alone opens the next numbered implementation attempt;
the matching evaluator-verify attempt then follows that implementation.

`dispatch` writes the phase dispatch record before doing anything else. In its
default dry-run form it prints the selected command vector. With `--execute`,
it launches a detached child with stdin ignored and combined stdout/stderr
appended to `<spike>/.workflow/<phase>-<attempt>.log`, unrefs it, then appends
the job metadata. Codex commands use `codex exec --cd <repository-root>`;
Claude commands use `claude -p --permission-mode manual`. Process exit is not
treated as a workflow result: `record` is the only route that appends
`complete`, `blocked`, or `failed`, and refuses duplicate terminal outcomes.
`cancel` sends `SIGTERM` only to the last recorded live job for the specified
phase.

The runner uses Node's standard filesystem and child-process facilities; it
adds no dependency or daemon. `.workflow/` is excluded by the root `.gitignore`.
The runner performs no Git operation, network action, evaluator-private access,
hidden-workspace creation, permission bypass, or automatic workflow-success
claim. Its local state and logs remain operational bookkeeping rather than
frozen provenance, evaluator evidence, manifests, or human acceptance.

Visible integration tests create disposable spike directories and fixture
executors. They prove ordering and retry behavior, rejection without changing
state, append-only outcomes, detached job metadata and logs, and cancellation.
The promoted evaluator suite additionally verified all canonical requirements
against this exact implementation revision: 13 mandatory cases / 20 hidden test
blocks passed, along with the public typecheck, lint, format, test, and
whitespace checks.

## Frozen-contract comparison

- **Missing** — none.
- **Contradictory** — none.
- **Extra** — none.
