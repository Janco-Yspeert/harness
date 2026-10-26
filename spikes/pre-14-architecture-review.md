# Pre-014 Architecture Review

Independent architectural assessment of Harness, redone against the rewritten
`GOALS.md` ("Realign Harness goals around governed execution," commit
`4aebf3c`) and against the current state of `main` after Spike 013a's
acceptance. This supersedes the informal post-013a review that preceded the
goals rewrite; it is not itself an implementation and nothing here has been
applied to the codebase.

## 0. What changed since the last pass

Two things moved since the prior review:

1. **Spike 013a reached acceptance.** Cycle 002 was `human-accepted` and
   `outcome-recorded` (`spikes/013a-Workflow-execution-friction/outcome.md`,
   `workflow.jsonl`). The isolation-boundary problem that previously stalled
   six-plus consecutive `BLOCKED` verifications (AC08/AC09/AC34 — live-Claude
   evidence unreachable from the evaluator's own sandbox) was resolved by
   decoupling evidence *production* from evidence *corroboration*: a real
   Claude run captured outside any evaluator session is now independently,
   cryptographically corroborated (re-hashed log, recomputed
   `basisIdentity`/`ledgerIdentity` against primary Git history) rather than
   re-run live inside the sandbox or accepted on prose. This is exactly the
   shape of fix the prior review recommended rather than a further
   mechanization pass, and it worked on the first attempt after being framed
   that way.
2. **`GOALS.md` was rewritten**, and the rewrite directly encodes most of the
   prior review's findings as explicit, permanent product principles: one
   canonical authority ("Harness should not maintain two state machines that
   must remain synchronized by convention"), methodology as configuration
   plus skills rather than kernel law, project portability as a required
   forcing function, host-mediated privileged actions, multi-dimensional
   execution results, and an explicit "What Belongs in the Kernel" list. It
   also introduces genuinely new commitments not present before: existing
   sessions should be able to assume authorized roles without spawning a new
   process ("Roles, Not Processes"), execution-identity provenance must track
   exposure to private evaluator material, workers should be able to pause
   for legitimate human input without dying, and a two-level authority model
   (workflow execution authority, with role authority derived beneath it)
   should replace prose-only judgment about whether execution was actually
   authorized.

Because the new `GOALS.md` already validates the prior review's central
recommendations, this redo does not re-argue them from scratch. It re-grounds
the classification in the new document's own language, checks the current
codebase against it directly, and highlights what the new goals require that
didn't exist as a stated requirement before.

## 1. The clearest new evidence: the defect recurred, in a new place

013a's `outcome.md` names, in its own words, a defect that is direct,
first-party confirmation of the prior review's single biggest "simplify or
consolidate" finding — and shows it was not actually fixed by 013a, only
patched around:

> "A duplicate local/canonical runner-state gap in As-Built dispatch... The
> ordinary `tools/workflow.ts dispatch as-built --execute` CLI path refused
> with 'As-Built requires a completed evaluator verify,' even though canonical
> authority already recorded `verification-finalized: PASS` for this exact
> attempt... The gate was checking a duplicate, host-role-disposition-derived
> proxy for a fact canonical authority already stated directly."

This happened *after* 013a had already fixed the same defect class for
evaluator-verify adoption. It recurred one phase later, in As-Built dispatch,
because the fix was applied to one gate rather than to the underlying pattern.
013a's own "Deferred Concerns" section names it as still open:

> "The local runner's phase-dispatch eligibility checks in `tools/workflow.ts`
> still derive some gates... from local operational-state proxies of host
> role-disposition rather than reading canonical authority directly."

and separately:

> "Distinct attempt counters — canonical verification attempt, the
> evaluator's own private attempt ledger id, `.workflow/state.json`'s local
> per-phase dispatch attempt, and the host registry's execution-attempt
> counter — remain unreconciled into one identity scheme."

`GOALS.md`'s "One Canonical Authority" section now makes fixing this a
first-order requirement, not a suggestion: *"Harness should not maintain two
state machines that must remain synchronized by convention."* The evidence
says this has already produced two separate incidents (evaluator-verify
adoption in cycle 002; As-Built dispatch immediately after) and is still live
in `tools/workflow.ts` today. This is the single highest-leverage fix
available, and it is now explicitly mandated rather than merely recommended.

## 2. Kernel classification against the new `GOALS.md`

`GOALS.md`'s own "What Belongs in the Kernel" section is now the authoritative
list. Checked against the current implementation:

**Already real, already mechanical — keep:**

- Host-owned execution identity independent of caller connection
  (`WorkflowRunRegistry`, tested against a run outlives its client).
- Content-identity provenance for frozen artifacts (`sha256` checked against
  committed bytes at point of use, not trusted from a caller's claim).
- Host-mediated capability → tool translation and bounded, ancestry-checked
  git publication (`resolveClaudeCapabilityTools`, `publishCommit`). 013a
  exercised this for real for the first time, and it correctly preserved a
  `blocked` role disposition alongside a genuinely `PASS`ed evaluation when
  the push itself failed before self-report — a concrete, working instance of
  "Execution Results Are Multi-Dimensional."
- Role-result binding validated against the host's own allocation record
  (`reportRoleResult` refuses a role/skill/authority mismatch).
- The append-only, git-anchored authority-ledger *concept* (not its current
  duplicated implementation — see §1).
- Deduplicated allocation per canonical basis (`slotKey` folding in
  `basisIdentity`) — this already satisfies the new "Idempotency and
  Concurrency" section's requirement that a repeated request not launch
  duplicate work.

**Required by the new goals, not yet built — new kernel work:**

- **Session eligibility / role grants without spawning a process** ("Roles,
  Not Processes"). Today every governed role execution spawns a fresh
  provider process (`createLocalWorkflowBackend`); there is no mechanism for
  binding an already-running, eligible session to a role instead. This is the
  single largest gap between the new goals and the current kernel.
- **Execution-identity provenance for private-material exposure.** Nothing
  today records that a given session or process has been exposed to
  evaluator-private material, so nothing can use that fact in a future
  eligibility decision. Directly required by "Execution Identity and
  Provenance."
- **A real workflow execution authority object, distinct from role
  authority.** Today, "was this workflow actually authorized to run or
  continue" lives only in the `orchestrator` skill's prose
  (`skills/orchestrator/SKILL.md`) — nothing mechanical distinguishes an
  agent correctly following that policy from one with raw API access calling
  `/workflow-runs` directly. `GOALS.md`'s "Workflow Execution Authority"
  section now asks for this to be a real, checked object ("Observation is not
  execution authority... must not silently become... Continue the
  workflow"), not a policy an agent is trusted to have read.
- **Human-interaction pause states.** No mechanism exists for a dispatched
  role to pause and wait for legitimate human input without the process
  exiting and consuming an execution attempt. Required by "Human
  Interaction."
- **Telemetry hooks covering model/token/human-wait time.**
  `WorkflowRunAccounting` already gives host-observed wall-clock timing and
  attempt/replacement counts for free — a solid start, explicitly
  host-derived rather than self-reported. It does not yet cover model
  execution time, provider/token usage, human-wait time, or distinguish
  Harness-observed from agent-reported measurements, all of which the new
  "Telemetry" section now requires as an architectural seam.
- **Bounded exceptions as a mechanical type.** Human override/correction
  currently exists as ledger conventions (`correction-cycle-opened`,
  `human-rejected`) plus 013a's own ad hoc "process exception" used to
  unblock As-Built dispatch. `GOALS.md`'s "Human Root Authority" section wants
  this generalized: exceptions should use "generic root-authority mechanisms
  rather than hard-coded knowledge of particular spikes or workflows." The
  013a As-Built exception is itself evidence this doesn't exist yet — it had
  to be improvised.

**Correctly kept out of the kernel, and now explicitly confirmed as such:**

- The 8-phase Harness SDLC (brief-readiness → ... → outcome), the
  correction-cycle/evaluator-repair state machine, and the orchestrator's
  authorization-judgment policy. `GOALS.md` explicitly states the kernel
  "should not need to understand the semantic meaning of names such as...
  Brief Readiness... As-Built... evaluator repair." Confirmed as a concrete,
  current violation: `tools/workflow.ts:19-28` still hardcodes exactly this
  list as the `phases` array, and `src/workflow-run.ts`'s `ROLE_CONTRACTS`
  hardcodes the same role names against `skills/${name}/SKILL.md`.

## 3. Simplify, consolidate, remove — updated

- **Fix the canonical-authority-vs-local-proxy duplication as one
  structural change, not per-gate patches.** §1's evidence shows the
  per-gate patch approach (fix evaluator-verify adoption, leave As-Built
  dispatch alone) does not generalize — the same bug reappeared one phase
  later within the same spike. `tools/workflow.ts`'s phase-dispatch
  eligibility checks should read canonical authority (`workflow.jsonl` +
  host run records) directly, everywhere, with `.workflow/state.json`
  reduced to a disposable, reconstructable cache — exactly what "One
  Canonical Authority" now requires.
- **Reconcile the four unreconciled attempt counters** 013a's own outcome
  names (canonical verification attempt, evaluator private attempt ledger
  id, local per-phase dispatch attempt, host execution-attempt counter) into
  one identity scheme, as part of the same consolidation.
- **Externalize `ROLE_CONTRACTS`, `skills/<role>/SKILL.md`, and
  `spikes/<id>` resolution** into per-project configuration — this is no
  longer just a portability nice-to-have, it's a named, concrete violation
  of the new goals' explicit kernel boundary.
- **Isolate the self-hosting evaluator bootstrap** (`bootstrap/
  evaluator-authority.json`, `claude-system-contract` as a peer of two
  otherwise-generic delivery modes) behind a narrow extension point, per
  "Human Root Authority"'s explicit instruction that bootstrap/recovery
  should use generic mechanisms rather than hard-coded knowledge of
  particular workflows.
- **Retire the improvised "process exception" pattern for stuck dispatch
  gates** (used for As-Built in 013a) once the consolidation above removes
  the local-proxy gates that made it necessary. A one-off human exception
  that had to invent its own scope on the spot is a symptom, not a
  mechanism — and `GOALS.md` now wants exceptions to be a generic,
  reusable, mechanical primitive instead.

## 4. Flaws and hidden coupling — updated

The repository-hardcoding problem (tools/workflow.ts's phases, `spikes/`
and `skills/` path assumptions) remains the sharpest concrete portability
gap, now with an explicit mandate to fix it (`GOALS.md` Near-Term Direction
item 6) and fresh evidence of its cost (the As-Built dispatch incident, which
was a direct consequence of local-state gates that only make sense under
Harness's own methodology shape).

One prior finding is **retracted, not carried forward**: the earlier review
treated the single-session limit in `src/index.ts` as a "must fix before
external use" blocker. The new `GOALS.md` explicitly and deliberately
separates governed execution from agent supervision, states multi-session
support is a product goal rather than a prerequisite, and instructs that it
"should not postpone the external workflow pilot unless real usage
demonstrates that they are prerequisites." That reprioritization is
defensible: a governed-execution pilot on an external project does not
require concurrent interactive sessions to be meaningful, and forcing
multi-session work first would repeat the exact failure mode this whole
history warns against — polishing architecture before it has been proven
against real use. The caveat GOALS.md itself states is the right one: this
must remain a live tripwire ("unless real usage demonstrates..."), not a
permanent deprioritization.

The attention-state gap is broader than previously framed: it's not just
interactive-session approval/question surfacing (Codex's `approvalPolicy:
"never"` still throws away real structured approval events), it now also
covers workflow-role "needs input" pauses under "Human Interaction." Both are
still entirely unbuilt.

## 5. Before external use — reconciled against both documents

`GOALS.md`'s own "Near-Term Direction" and 013a's `outcome.md` "Next Step"
give two different orderings for what comes next, and they are in tension:

- `GOALS.md` Near-Term Direction puts **kernel/authority consolidation
  first** (item 1), then declarative methodology (item 2), then attached/
  spawned execution parity (item 3), then telemetry (item 5), then removing
  repository assumptions (item 6), then the external pilot (item 7).
- `outcome.md`'s "Next Step" says, concretely: *"resume the already-open
  Spike 011 Cycle 002 evaluator-repair... then proceed to executor
  model/reasoning/cost/token/time telemetry, then separately address
  lightweight-change and workflow-entry friction."* It does not mention
  kernel consolidation or removing repository assumptions at all.

Taking `outcome.md`'s literal next step at face value would mean resuming
Spike 011's evaluator-repair on the *current*, still-duplicated authority
model — the same model that just produced the As-Built dispatch incident one
phase after a related fix. That risks reproducing the defect a third time in
whatever phase Spike 011's repair happens to touch next. I'd resequence: do
the canonical-authority consolidation (§3, first bullet) before or alongside
resuming Spike 011's repair, not strictly after it.

**Fix before/alongside resuming Spike 011:**
- Canonical-authority consolidation (§1, §3) — small, bounded, and directly
  protects whatever Spike 011's repair does next from hitting the same bug.
- Nothing else needs to block Spike 011's repair; it was already in flight
  and is real, wanted product capability (host-owned workflow runs
  surviving client disconnect).

**Fix before the external-project pilot specifically:**
- Repository-hardcoded methodology resolution (`ROLE_CONTRACTS`, `skills/`,
  `spikes/` path assumptions) — the pilot is meaningless without this.
- At minimum the telemetry seams named in `GOALS.md`'s Telemetry section,
  so the pilot actually produces the cost/friction evidence it's meant to.

**Still correctly deferred:**
- Multi-session supervision, richer attention-state UI, remote clients —
  per §4, correctly not required before the pilot.
- A further (fifth) evaluator-integrity mechanization pass — 013a's
  resolution vindicates trusting host-mediated corroboration over more
  validator layers; no evidence currently calls for another one.
- Generalizing the self-hosting bootstrap into a fully generic methodology-
  verification system before the external pilot has actually exercised a
  second, different methodology.

## 6. Proposed spike sequence (pre-014)

1. **Single canonical authority, no synced duplicates.** Make
   `tools/workflow.ts`'s phase-dispatch gates read canonical authority
   directly instead of local `.workflow/state.json` proxies; reconcile the
   four unreconciled attempt counters. Small, bounded, and directly named by
   both `GOALS.md` item 1 and 013a's own Deferred Concerns.
2. **Methodology as configuration; remove Harness-repository assumptions
   from the kernel.** Externalize `ROLE_CONTRACTS`, the `skills/<role>/
   SKILL.md` convention, and `spikes/<id>` workflow-location resolution into
   per-project configuration, per "Methodology Is Configuration Plus
   Skills." Harness's own SDLC becomes the first configured methodology,
   not hardcoded kernel logic. Matches `GOALS.md` items 2 and 6; hard
   precondition for item 7.
3. **Resume Spike 011 Cycle 002's evaluator-repair, on the consolidated
   kernel.** Finish the actual product capability the correction spiral has
   been protecting — host-owned workflow runs surviving client
   disconnect — now that it won't immediately hit the defect class §1
   describes. Matches `outcome.md`'s literal next step, resequenced after
   step 1 rather than before it.
4. **Telemetry and provider-usage seams.** Wall-clock and model execution
   time, retries/repairs, human-wait time, provider/model selection,
   token/usage snapshots where measurable, Harness-observed vs.
   agent-reported kept distinguishable. Matches `GOALS.md` item 5 and
   `outcome.md`'s stated next step.
5. **Install and use Harness on a real second project.** The forcing
   function both documents name explicitly. Use steps 1–4's primitives;
   treat any failure to reach usable governed execution on a genuinely
   different repository as the review's central signal, and harden from
   what's actually found there (`GOALS.md` item 8) rather than continuing
   to iterate on Harness's own methodology in isolation.

Multi-session supervision, richer attention states, and remote clients
remain deliberately out of this sequence, consistent with `GOALS.md`'s own
explicit reprioritization — not because they don't matter, but because
nothing in the evidence so far says they're a prerequisite for proving
governed execution on real work.
