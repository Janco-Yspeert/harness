# Design Map — Spike 011

## Shared contracts

The existing Harness host created by `startHarnessHost` owns a host-lifetime
workflow-run registry in addition to its interactive-session state. A workflow
run has a stable host-generated run id and an immutable workflow slot key
(`workflow`, `phase`, and methodology attempt where present). Its operational
execution-attempt number is separate from that methodology attempt.

The host exposes a small workflow-run HTTP surface beside the existing session
surface: allocate/inspect a run, inspect its diagnostic output, and explicitly
cancel or replace it. `tools/workflow.ts` is an HTTP client of that surface for
canonical execution; it must not spawn or detach a worker itself. A host absent
from the configured URL is an explicit dispatch failure, not permission to
create a client-owned worker.

Allocation is atomic within one host. For an active slot, a repeated allocation
returns the existing canonical run and never creates a second backend/process.
Replacement is a separate host operation: it first gives the prior execution a
terminal `replaced` disposition, records the link/reason, then allocates the
next execution attempt. Active executions cannot be silently replaced.

## Design decisions

Interactive sessions and workflow runs share host-owned identity allocation,
backend lifecycle observation, termination, event publication, and diagnostic
output retention. They remain distinct records: only interactive sessions have
client attachment and input; workflow runs instead carry role/phase slot,
methodology attempt, execution attempt, executor, invocation mode, workspace
boundary, permission-profile identity, and replacement provenance.

The host normalizes workflow lifecycle events into allocated, started, activity,
completed, failed, cancelled, and replaced envelopes on the existing event
stream. Raw backend output is retained per run and may cause activity events,
but is diagnostic data only; it neither changes methodology state nor supplies
downstream role context.

The host owns process creation through a workflow backend/factory seam. The
default local backend may invoke supported executors with an explicitly named
workspace-bounded profile; it must not use an unrestricted-bypass mode. Tests
may supply an in-memory backend through that seam, avoiding paid providers.

The workflow runner continues to own artifact authority and phase-order checks.
Before recording a phase complete it queries the matching canonical run and
requires its terminal disposition to be `completed`. A direct external process
therefore has no usable run identity and cannot satisfy completion binding.

## Invariants

- Host shutdown may terminate active runs; client disconnection may not.
- Run records and logs remain inspectable until that host exits; restart
  persistence is not established.
- Terminal status, timestamps, process/provider identity when available, elapsed
  time, and replacement count are host-derived facts. Unavailable provider
  usage/cost data is omitted.
- Cancellation, failure, and replacement are terminal dispositions. A later
  execution for the same slot preserves its predecessor and reason.
- A workflow run has only its declared workspace boundary and permission profile;
  an evaluator may declare an additional private workspace. This is capability
  metadata enforced by the selected bounded executor mode, not a brittle
  per-binary allowlist.

## Implementation freedom

The exact route names, JSON field spellings, UUID format, internal registry and
backend classes, log storage representation, and whether a duplicate allocation
returns `200` or a conflict are free, provided the stated observable behavior
and structured event information are preserved. Provider-native event details
and process/session identifiers may be included when available.
