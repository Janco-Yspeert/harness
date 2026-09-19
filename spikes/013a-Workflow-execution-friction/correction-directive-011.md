# Correction directive — implementation attempt 11 (cycle 002)

## Authority

Explicit human root authority, given directly to the Harness orchestrator
session in this repository, authorizes this correction. Canonical authority
confirms cycle `002` is open (opened by `correction-cycle-opened` with
`implementationCorrection: true`), unclosed, and `implementation-handoff` is
currently `available-requires-evidence` per `authority status`. No new
correction cycle is required; this is implementation attempt 11 within the
existing open cycle 002, following unchanged candidate
`eaaa53dc8ea487deff592f804154fd447bb26f86` (implementation attempt 10, verified
BLOCKED/INFRASTRUCTURE_FAILURE at canonical verification attempts 11-15 for
AC08/AC09/AC34 only — no confirmed implementation defect in any of those
attempts; 32-35 of 35 criteria SATISFIED throughout).

This directive is root-authority input, not public implementation feedback
from a confirmed failure. Treat it as an explicitly frozen process exception
input per `skills/implementation/SKILL.md` ("An explicitly frozen process
exception may omit named inputs"). It does not modify the frozen brief,
Design Map, or evaluation requirements, and it does not authorize weakening
any frozen acceptance criterion.

Human intent (verbatim governing goal):

> pursue the smallest coherent correction that gives Harness durable,
> independently verifiable execution evidence while preserving the bounded
> evaluator role and reducing workflow friction.

## Why AC08/AC09/AC34 keep coming back BLOCKED

This is not an implementation defect. `WorkflowRunRegistry` holds run records
only in host-process memory (no persistence), and the evaluator's own verify
sandbox has no network path to whatever host process ran a live fixture. The
one attempt that ever satisfied AC08/AC09/AC34 (implementation attempt 8,
canonical verification attempt 10, PASS) worked because the same session that
had live Claude access committed the result as a public Git artifact —
`lp1-primary-evidence-008.md` — and the evaluator independently recomputed its
embedded identities from primary Git history rather than trusting the file's
own assertions. Read that file before designing anything; it is the working
prototype.

What made it trustworthy, concretely:

- It is a **public**, git-committed artifact (LP1's fixture permission profile
  is `repository-read-only` with no hidden-workspace grant, so nothing private
  was ever at stake for this specific fixture).
- It contains the **exact host-owned run record** (JSON, host-produced, not
  caller-suppliable) plus the raw provider transcript.
- Its `allocationAuthority`/`verificationAuthority` carry `ledgerIdentity`
  (SHA-256 of the exact historical `workflow.jsonl` bytes), `basisIdentity`
  (SHA-256 of the exact `implementation-handoff` event object), and
  `definitionIdentity` (SHA-256 of the exact `fixtures/lp1.json` bytes at the
  candidate commit) — every one of these is **independently recomputable by
  the evaluator from Git history it already trusts**, without relying on the
  artifact author's word.
- What is *not* independently provable this way is "a live process genuinely
  ran" — that rests on ordinary Git commit provenance and the whole-system
  invariant that no Harness role fabricates historical activity. The
  recomputable identities prove the record is not lying about *which*
  candidate/contract/ledger state it binds to; they do not add cryptographic
  proof of execution beyond that.
- A prompt-pasted transcript with a self-quoted checksum fails this precisely
  because nothing in it is checkable against a primary source the evaluator
  didn't get from the same untrusted channel — self-consistency is not
  provenance. (See `verification-feedback-013.md`.)

## Required correction (smallest coherent shape)

### 1. Durable, host-owned evidence, public/private split

On terminal disposition, a host-owned run must be able to become durable
evidence that survives the host process, keyed generically off the resolved
permission profile (not spike/provider identity):

- **Non-evaluator-profile runs** (e.g. LP1-style read-only fixtures, ordinary
  worker runs): the full run record may be written to a durable, public,
  per-workflow location.
- **Evaluator-profile runs** (i.e. the resolved permission profile granted
  hidden-workspace access): the full record + raw log must be written under
  the private `harness-hidden` mirror, not the public repository. Only a
  sanitized manifest — binding/identity fields, no raw prose, no free-text
  `roleResult.reason` — may be durable in the public location, plus a
  `logIdentity` (hash of the private raw log) linking the two without
  exposing content.

Reuse the existing `<spike>/.workflow/` convention (where `state.json`
already lives) for the durable location rather than inventing a new
subsystem; mirror the same relative path under `harness-hidden` for the
private case, exactly as `resolvePermissionProfile` already does for the
hidden-workspace grant itself (`resolve(workspace, "..", "harness-hidden")`).

Do not build a database or a general artifact/evidence service. This is a
small, mechanical "write what the host already produced to disk on terminal
disposition" addition to `WorkflowRunRegistry`, generalized from the shape
`lp1-primary-evidence-008.md` already demonstrates worked.

Ordinary implementation/workflow roles must not gain read access to anything
under `harness-hidden`. This durability mechanism must not create a new path
by which a non-evaluator-profile run or caller can reach private evidence.

### 2. Fix run-deduplication identity

`slotKey()` in `src/workflow-run.ts` currently keys on
`(workflow, phase, methodologyAttempt)` alone. This collapses two *distinct*
canonical verification allocations that happen to target the same
implementation attempt (e.g. canonical verification attempts 11-15, all
against implementation attempt 10) onto one slot. If a prior run for that slot
ever reaches `roleDisposition: "succeeded"`, `allocate()` short-circuits and
silently returns the old record (`duplicate: true`) instead of creating a new
execution — meaning a genuinely new canonical verification allocation could
be silently rebound to a stale prior successful run instead of getting its
own fresh execution.

Correct this by folding an existing canonical allocation/basis identity into
the slot key for allocations that have one (the canonical
`verification-allocated.attempt` number is already assigned by
`workflow.jsonl` and already threaded into the runner's dispatch path — reuse
it, do not invent a new counter). Same canonical allocation authority + same
role slot must remain idempotent (retries within one verification attempt
still work as today). A new canonical allocation authority targeting the same
`(workflow, phase, methodologyAttempt)` must create a new host execution
rather than being deduplicated against the old one.

Do not attempt to unify every attempt counter in Harness (canonical ledger
attempt, evaluator's private ledger id, `.workflow/state.json` per-phase
attempt, registry `executionAttempt`) as part of this correction — out of
scope, larger and riskier than this problem requires.

### 3. Readiness/preflight — only if it stays small

Repeated canonical verification attempts (11-15) were allocated even though
the required Claude executor was already known to be unreachable from that
environment, wasting five canonical attempts on an identical, already-
diagnosed infrastructure disposition. If it can be added cleanly and small
(a pure check + a thin CLI surface, no new subsystem), add a lightweight
readiness/preflight concept that reports whether the required executor is
currently invocable — informational only. Readiness must never become
methodology authority: canonical authority alone still governs whether a role
*may* execute; readiness only reports whether the runtime is currently
*capable*. If this starts growing into its own subsystem, stop and leave it
out of this correction; note it as deferred instead.

## Scope discipline — do not do these

- No database, no general artifact/evidence service, no evaluator network
  access (localhost or otherwise), no generic secrets/config framework.
- No unification of all attempt counters.
- No Spike 011 work of any kind.
- No evaluator rubric/semantic changes; do not weaken any frozen criterion to
  manufacture a PASS.
- No Spike-013a-, Claude-, or phase-specific hardcoding — express this
  generically (permission-profile-driven, not spike-name-driven), exactly as
  the existing hidden-workspace grant already is.
- Do not expose `harness-hidden` to ordinary workers.
- Prefer Claude-neutral, provider-neutral code paths wherever practical.

## Validation required

Add focused public regression coverage demonstrating, at minimum:

- durable evidence originates from host-owned execution state, not
  caller-supplied claimed contents;
- evidence is exactly bound to the candidate/run/contract/authority it
  claims;
- the identities required for independent recomputation are present and a
  test recomputes at least one from a primary source and confirms the match
  (mirroring what the evaluator did by hand for attempt 8);
- private evidence (hidden-workspace-profile runs) is not readable by an
  ordinary-profile role or from the public durable location;
- a fresh registry/process instance can read previously-written durable
  evidence (i.e. it does not depend on the writing process's live memory);
- the same canonical allocation remains idempotent on retry;
- a new canonical verification allocation targeting the same implementation
  attempt as a prior *successful* one is not incorrectly deduplicated against
  it.

Run the complete `npm run check` (typecheck, lint, format:check, full test
suite) and `git diff --check` before considering the candidate complete.

## Completion

Produce the exact candidate commit and its `manifest.md` entry per
`skills/implementation/SKILL.md`'s normal completion procedure. Report
branch, commit hash, changes, decisions, tests, checks, assumptions, and
limitations. Do not claim independent evaluation has occurred — that remains
a separate, later, explicitly-authorized step. **Do not run the LP1 fixture
and do not allocate a new evaluator verification attempt as part of this
work; implementation ends at the pushed/committed candidate.**
