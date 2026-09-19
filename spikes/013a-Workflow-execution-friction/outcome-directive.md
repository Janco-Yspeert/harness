# Outcome directive — Spike 013a

## Authority

Explicit human root authority. Canonical authority: cycle `002`,
`human-accepted` recorded (commit `0f34444`), binding implementation
attempt `13` (candidate `c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88`),
verification attempt `16`, evaluator revision `003`, result `PASS`.
`as-built-recorded` and `promotion-recorded` are both canonical. This is an
ordinary Outcome per `skills/outcome/SKILL.md`'s normal preconditions — not
a process exception. Verify all of this yourself from `workflow.jsonl`,
`manifest.md`, and Git provenance before writing anything; do not take this
directive's citations on faith.

## What this directive asks, beyond your normal contract

Nothing procedurally different from your normal contract. This is emphasis,
not a departure: this spike's real history includes a human rejection, a
full second correction cycle, a publication failure inside a genuine PASS,
and a live-discovered architectural gap during As-Built. Write the Outcome
so a future reader — including whoever plans the next spike — gets that
history accurately, not a narrative smoothed into "implementation passed
verification." `skills/outcome/SKILL.md` already requires you to "preserve
material failures and evaluator corrections" and to distinguish "what was
proven, observed, decided, deferred, or merely recommended" — apply that
fully here, from your own reading of the evidence, not from this list:

- **Cycle 001 was rejected**, not merely superseded. Find and read the
  `human-rejected` event and its classification
  (`IMPLEMENTATION_GAP`/`EVALUATOR_COVERAGE_DEFECT`) directly from
  `workflow.jsonl`, and the evaluator-repair records that followed it.
- **Duplicate canonical/local runner state.** During this cycle, ordinary
  As-Built CLI dispatch (`tools/workflow.ts dispatch as-built ... --execute`)
  refused with "As-Built requires a completed evaluator verify," even
  though canonical authority already recorded `verification-finalized:
  PASS`. Read `as-built-dispatch-exception.md` for the root cause: the
  local CLI gate depends on a `.workflow/state.json` outcome record that
  can only be produced by a host run reaching `roleDisposition:
  "succeeded"`, which is a different, narrower fact than canonical
  authority's own `verification-finalized` state. As-Built was ultimately
  dispatched directly against the host under an explicit human process
  exception, documented in that same file.
- **A publication-boundary failure inside a genuine PASS.** The evaluator
  verification run that produced attempt 16's PASS (all 35 acceptance
  criteria satisfied) completed its full substantive evaluation and
  committed its result locally, but could not push to the remote branch:
  its own session's sandbox denied outbound network to GitHub, not a
  Harness permission gate. Its Harness-level semantic role disposition
  therefore stayed `"blocked"`, distinct from and alongside a real,
  independently-verified `PASS` recorded in canonical authority. Find the
  exact run and its `roleResult.reason` yourself; do not soften this into
  "verification passed."
- **The recovery.** That blocked publication was resolved through the
  host-mediated `git-publish` capability (`WorkflowRunRegistry#publishCommit`,
  `POST /workflow-runs/{id}/publish`) added earlier in this same cycle
  (implementation attempt 13) for exactly this class of problem — the host
  itself verified the commit was a fast-forward and pushed it with its own
  credentials, without rewriting the run's own honestly-reported `blocked`
  disposition. Record that this mechanism was exercised for real, not just
  built and left theoretical.
- **The distinction between what cycle 002 actually fixed and what remains
  deliberately deferred for a future spike's simplification work.** Cycle
  002 fixed: caller-environment-dependent evaluator permissions; durable
  host-owned run evidence (public/private split by resolved permission
  profile) surviving host restart; run-slot deduplication keyed on
  canonical allocation identity, not just `(workflow, phase,
  methodologyAttempt)`; test-execution evidence pollution of real evidence
  locations; a stale LP1 permission-profile declaration; bounded
  per-subcommand git capability translation for Claude execution (replacing
  a blanket `Bash(git *)`); and the host-mediated publish primitive itself.
  Left deliberately unaddressed, and worth naming explicitly as intended
  next-spike work, not oversights: the evaluator's own frozen v11 contract
  still assumes *direct* git push rather than host-mediated publication
  (deferred because changing it would alter what an immutable pinned
  contract requires); the local runner's phase-dispatch eligibility checks
  in `tools/workflow.ts` still derive some gates (as-built, and originally
  evaluator-verify before this cycle) from local operational-state proxies
  of host role-disposition rather than reading canonical authority
  directly, which is the same class of defect as the As-Built gap above and
  was only worked around, not fixed at the root, for this cycle; and the
  proliferation of distinct attempt counters (canonical verification
  attempt, evaluator's own private attempt ledger id, local
  `.workflow/state.json` per-phase dispatch attempt, and the host registry's
  execution-attempt counter) remains unreconciled.

## Scope

Write only `outcome.md` and your `manifest.md` entry, exactly as your
normal contract specifies. Do not touch implementation, tests, contracts,
evaluation evidence, `GOALS.md`, or any other project documentation. Do not
start Spike 014 or propose its brief. Perform your normal final manifest
update, commit, publish, and `outcome-recorded` transition if your contract
permits them at this point — do not ask the orchestrator to do any of that
for you unless you are genuinely blocked the way implementation attempts 11
and 12 were before the adapter fix; that fix now applies to you too, so you
should not need to be.
