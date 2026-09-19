# As-Built dispatch — explicit human process exception

## Authority basis

This is explicit human root authority, not a canonical-authority exception.
Canonical authority genuinely and unambiguously permits As-Built right now:

- `workflow.jsonl` last transition: `verification-finalized`, cycle `002`,
  attempt `16`, `result: PASS`, all 35 criteria `SATISFIED`.
- `authority status` reports `as-built-recorded` as
  `available-requires-evidence`.
- Cycle `002` implementation attempt: `13`, candidate
  `c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88`.
- Evaluator revision `003` (unchanged), pinned contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`).
- Promotion content already committed and published on `feat/spike-013a`
  (`0c9bd55`, published via the host-mediated `git-publish` recovery for run
  `cb314e67-eff3-41ce-adfb-d925cf390ac2`).

The host itself has no As-Built-specific authority gate at all (confirmed by
inspecting `src/workflow-run.ts`: `role: "as-built"` only appears in the
contract-name lookup table, nowhere in allocation/authority resolution).

## What is actually being excepted

Only the ordinary `tools/workflow.ts dispatch as-built <spike> --execute`
CLI path, not canonical authority. That CLI command refused with
`As-Built requires a completed evaluator verify`.

The reason is a real gap, not a false alarm: the CLI's As-Built
precondition (`canDispatch`'s `"as-built"` branch) checks a *local*
`.workflow/state.json` record — an `evaluator-verify` entry with
`outcome: "complete"` — which is itself only ever written by
`tools/workflow.ts record evaluator-verify ... complete`, which in turn
requires the *host-level run* to report `roleDisposition: "succeeded"`.

That local/host-role-disposition proxy has now diverged from canonical
authority for a case current tooling doesn't reconcile: the evaluator
recorded its own canonical `verification-finalized: PASS` directly (its own
delegated authority, a different code path entirely), but the host-level
run that produced it, `cb314e67-eff3-41ce-adfb-d925cf390ac2`, never itself
reported `roleDisposition: "succeeded"` — it genuinely, correctly reported
`"blocked"`, because its own required git push failed before it could
self-report completion. That commit was separately published afterward via
the host-mediated `git-publish` recovery, which intentionally left the run
itself unchanged (still `"blocked"`) per its own explicit constraint.

The CLI's local gate is therefore checking a duplicate, host-role-disposition
-derived proxy for a fact canonical authority already states directly and
authoritatively. This is the "duplicate local operational state" this
directive was asked to record: the local runner should be able to derive
As-Built eligibility from canonical `verification-finalized` directly (the
same way it already falls back to canonical authority for implementation
and evaluator-verify eligibility), rather than requiring a local outcome
record that can only ever be produced by a successful host role-disposition
for that exact run.

## What this exception does and does not authorize

Authorized: allocating the `as-built` role directly against the Harness
host (`POST /workflow-runs`), using the same field shape the CLI's own
`allocateHostRun` would have used, since the *authority* for this allocation
is genuinely canonical and the only thing bypassed is a locally-duplicated,
currently-incorrect eligibility proxy.

Not authorized, and not done: mutating run `cb314e67-eff3-41ce-adfb-d925cf390ac2`
(its role disposition, its record, or any evidence it produced) in any way;
recording a fabricated `evaluator-verify` outcome in `.workflow/state.json`;
editing `.workflow/state.json` at all; modifying canonical authority beyond
the ordinary, honest `as-built-recorded` transition this dispatch is
expected to produce once the as-built role itself completes and reports.

## Recommended follow-up (not performed here)

`tools/workflow.ts`'s `canDispatch` "as-built" branch
(`src/../tools/workflow.ts`) should derive eligibility from canonical
`verification-finalized: PASS` for the current implementation attempt
directly, mirroring how `evaluator-verify`'s own branch already falls back
to canonical authority via `completedImplementation(state, target)` instead
of requiring only a local record. This is a real, reportable gap, not
something this exception attempts to fix.
