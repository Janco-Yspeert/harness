# As-Built — Spike 011 Host-Owned Workflow Runs

## Inspected revision and evidence

- Final implementation revision: `22c9d96db4eb2603494bb611a7ea02c5aaafc458`
  (`feat: host-owned workflow runs (Spike 011)`).
- Frozen brief: `spike.md`
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`.
- Frozen Design Map: `design-map.md`
  `sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`.
- Frozen public evaluation inputs: `eval-requirements.md`
  `sha256:16766fafeba18217e5a97b90de97079ab0447878b919705381a6f397fa9f9af7`
  and `coverage-map.json`
  `sha256:3dd7ef05391c28880896bffe7fa4ab8b4b3ed17443f05146d3e9a776f8345ec3`.
- Promoted verification: attempt `001`, `PASS`, implementation
  `git:22c9d96db4eb2603494bb611a7ea02c5aaafc458`, result identity
  `sha256:3775a1f582044b7eccbc2b8a458eea7db5fa473d125139e765a2467a0aad53ad`.

## Built shape

`startHarnessHost` now creates a host-lifetime `WorkflowRunRegistry` alongside
its interactive-session state. Workflow runs and interactive sessions share the
existing host's identity allocation, backend lifecycle observation, event
publication, diagnostic-output retention, shutdown path, and loopback HTTP
server, but use distinct domain records. A workflow run has no client attachment
or user input; it carries its immutable workflow slot, separate methodology and
execution-attempt identities, role, executor, invocation mode, skill metadata,
workspace and named permission profile, optional process/provider identities,
lifecycle timestamps, terminal disposition, replacement provenance, and
host-derived accounting.

The host exposes allocation/listing/inspection, diagnostic-log, cancellation,
and replacement operations at `/workflow-runs`. Allocation is serialized per
workflow/phase/methodology-attempt slot: a concurrent or repeated request while
the canonical run is active returns that run with `duplicate: true` rather than
creating another backend. The registry retains all run records and their
in-memory diagnostic logs until the host closes. Host shutdown cancels active
runs; an initiating HTTP client disconnect does not.

Replacement is a host operation. It first terminalizes the canonical prior run
as `replaced`, preserving its reason, then creates a successor with the next
execution-attempt number, the prior execution id, replacement count, and an
explicit retry or fallback invocation mode. Cancellation, backend creation
failure, normal completion, and failed exit likewise produce terminal records.
The existing Harness event publisher emits structured
`workflow-run.allocated`, `started`, `activity`, `completed`, `failed`,
`cancelled`, and `replaced` envelopes. Output activity is retained as
per-run diagnostic text and does not itself change workflow methodology state.

`src/workflow-backend.ts` supplies the default local backend behind a
test-substitutable factory seam. It launches supported Codex or Claude
executors in explicit bounded, non-interactive modes using either the
`repo-local-worker` or evaluator profile. The evaluator profile requires its
declared extra workspace. The command construction rejects unrestricted bypass
flags; provider/session metadata remains absent when the backend cannot supply
it.

`tools/workflow.ts --execute` now requests the existing host's workflow-run
surface and records the allocated run identity in its local operational state.
It does not spawn or detach canonical workers, and an unavailable host is a
dispatch failure. Before recording a phase as complete, the runner re-inspects
the matching canonical run and requires status `completed`; an external process
or a cancelled/failed canonical run cannot satisfy that completion binding.

Visible integration coverage exercises client detachment and later inspection,
duplicate and concurrent allocation, replacement ordering/provenance, event
envelopes, diagnostic-log separation, permission profiles and executor command
construction, accounting, host co-location, and workflow-run completion
binding.

## Lifecycle and boundaries

- The run registry is in-memory and lasts only for the current Harness host;
  daemon-restart persistence is not implemented.
- The host owns operational run lifecycle. `tools/workflow.ts` retains
  methodology phase ordering, artifact authority, and the final
  complete-state check.
- The local executor adapter uses declared workspace/profile metadata and
  bounded command modes. It is not a universal provider abstraction and does
  not infer unavailable model, provider-session, usage, or cost facts.
- The final promoted verification reports all 18 mandatory procedures passed
  and no evaluator or specification finding. This record does not alter the
  promoted evaluator artifacts.

## Contract comparison

No Missing, Contradictory, or Extra material behavior or structure identified
against the frozen brief and Design Map.
