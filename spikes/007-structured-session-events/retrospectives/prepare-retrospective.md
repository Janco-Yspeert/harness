# Retrospective: Spike 007 Evaluator `prepare` Run

Status: informal working note, published in the public repository at
explicit request. Note that this document names hidden test files and
describes hidden evaluation scenarios and oracle mechanics from Spike
007's private evaluator material (normally kept under the mirrored
`harness-hidden` path) — it was moved here deliberately, with that
tradeoff acknowledged. It is not itself part of the frozen evaluator
revision, the hidden test suite, or the promotion evidence chain.

Scope: a self-retrospective on the `/evaluator prepare 007` run, covering
where token/tool effort went and how much of it was necessary evaluator
work versus recovering from self-inflicted mistakes or avoidable
exploration.

---

## 1. Overall accounting

Rough share of tool calls (~85 total across the run) and qualitative
effort/token weight per category:

| Category | Tool calls (~%) | Effort/token weight | Notes |
|---|---|---|---|
| Understanding frozen brief/Design Map | 6% | Medium | 4 parallel Reads of spike.md/design-map.md/manifest.md/feedback.md, one clean pass |
| Reading repository (src, existing tests, fixtures) | 15% | Medium-high | index.ts, session-backend.ts, pty-backend.ts, codex-backend.ts, both integration test files, fixture greps |
| Designing evaluation strategy (case list, requirement IDs, coverage matrix) | ~0% tool calls | High reasoning, no tool cost | Happened between tool calls; largest "invisible" cost |
| Empirical assumption validation (ws broadcast/no-replay probe, 404 negative probe) | 7% | Low-medium | Deliberate, planned, low churn |
| Authoring hidden tests + support helpers | 15% | High (largest single Write output) | 11 Write calls |
| **Debugging own test-harness bugs** (hangs, cleanup bugs) | ~12% | Medium | See churn log — this is the "recovering from own mistakes" bucket |
| **Building + debugging throwaway reference server for positive control** | ~20% | Medium-high | Largest concentration of avoidable churn |
| Writing freeze artifacts (eval-spec.md, manifest.json, freeze.json, ledger, eval-requirements.md, manifest.md edit) | 12% | High (eval-spec.md is the largest single file) | Clean, low-churn |
| Final verification (hash checks, git add/commit/push, recompute-and-diff script) | 8% | Low-medium | Clean |
| Cleanup (rm -rf scratch, leftover checks) | 5% | Low | Clean |

The two largest buckets are "authoring the actual frozen deliverables"
(legitimate, ~42% combined) and "debugging things I built to validate the
deliverables" (~32% combined) — i.e., roughly a third of the run's
tool-call volume went into fixing my own mistakes in scaffolding that
never shipped.

## 2. Churn log

**C1 — `connectEvents`/`connectSession` hung forever on a rejected upgrade**
- What: original helper only did `await once(socket, "open")`. Against a
  404 rejection, `"open"` never fires, `"unexpected-response"` fires
  instead, nothing was listening for it.
- Type: **implementation churn** (missing timeout/error handling), though
  the *discovery mechanism* was the intended negative control.
- Evidence: `lifecycle-core.test.ts` negative-control run hit my 30s
  `timeout` kill with no output at all.
- Prior work at risk: three case tests already written against the
  un-fixed helper; all silently inherited the defect.
- Repeated work: rewrote `connectEvents`/`connectSession` to race `open`
  against `unexpected-response`/`error`/timeout; reran.
- Cost: **moderate** (one full debug cycle, plus every already-written
  file implicitly depended on the fix).
- Preventable: yes — racing `open` against `unexpected-response`/`error`
  with a timeout is a well-known `ws` gotcha; should have been the
  first-draft implementation, not a fix discovered by hanging.

**C2 — `host.close()` skipped on early throw (try/finally placed wrong)**
- What: in `runLifecycle`, `startHarnessHost` and `connectEvents` were
  called *before* the `try`, so when `connectEvents` threw (as intended,
  post-C1-fix), `host.close()` in the `finally` never ran, leaking a
  listening server and hanging the process.
- Type: **implementation churn** — a resource-cleanup ordering bug.
- Evidence: same negative-control run, still showed "Interrupted while
  running" at a 15s timeout even after C1 was fixed.
- Prior work at risk: none extra beyond C1 — caught in the same debugging
  pass.
- Repeated work: restructured to nested `try/finally` with host creation
  as the first statement of the outer `try`.
- Cost: **small-moderate**.
- Preventable: yes — "acquire, then immediately open `try`" is a
  mechanical rule I didn't apply consistently on first draft.

**C3 — Positive-control path/module-resolution churn (three separate
failures)**
- What: (a) copied the reference-shim import with the wrong relative
  depth (`../../reference-shim.mjs` vs `../reference-shim.mjs`); (b)
  placed the throwaway reference server + copied test files under
  `/tmp/.../scratchpad`, where `ws` isn't resolvable (no `node_modules` in
  that tree) — a failure mode I had *already hit once* with the very
  first `ws-probe.mjs` and then repeated minutes later in a different
  script; (c) had to `rm -rf` and rebuild the positive-control directory
  entirely under `harness-hidden` to get real `node_modules` access.
- Type: **environment/tool churn**, compounded by not applying an earlier
  lesson from the same run.
- Evidence: `ERR_MODULE_NOT_FOUND` for `ws` (twice) and for
  `reference-shim.mjs` (once).
- Prior work at risk: the copied test-file transformations had to be
  redone from scratch after the relocation.
- Cost: **moderate** — roughly 6-8 extra tool calls before the first
  positive-control test even ran.
- Preventable: yes, straightforwardly — I had direct evidence 20+ tool
  calls earlier that `/tmp` scripts can't resolve `ws`, and didn't apply
  it when setting up the positive-control harness.

**C4 — Throwaway reference server: default backend threw `"no backend"`**
- What: reference server's default `createBackend` fallback was a stub
  (`() => { throw new Error("no backend") }`) rather than a real PTY
  backend, so any test using `startHarnessHost(0)` (no explicit factory)
  got a 500 on session creation.
- Type: **implementation churn** in validation scaffolding (not in frozen
  hidden tests).
- Evidence: `500 !== 201` assertion failures in all 3
  `lifecycle-core.test.ts` positive-control cases.
- Cost: **small** — one-line fix (import real `PtyBackend`), but required
  a full read of the file and a rerun.
- Preventable: yes — should have wired the same default the real
  implementation uses from the start.

**C5 — Throwaway reference server: session socket never terminated on
session end**
- What: `endSession` in the reference server freed the session and
  published `session.ended`, but never called `session.socket?.terminate()`,
  so tests waiting on `once(socket, "close")` after natural exit hung.
- Type: **implementation churn** in validation scaffolding.
- Evidence: `natural-exit-and-races.test.ts` positive-control run hit a
  30s timeout with zero subtests printed.
- Cost: **moderate** — full hang-and-timeout cycle, then had to track
  session↔socket association I hadn't modeled at all in the first draft.
- Preventable: yes — this is exactly the kind of teardown detail the real
  `src/index.ts` already models (`removeSession` terminates the socket); I
  should have mirrored it going in rather than discovering the gap by
  hanging.

**C6 — Minor dead code left in a Write draft**
- What: `channel-and-lifecycle-isolation.test.ts` first draft contained a
  garbled, unused `parseSessionMessage(JSON.parse(raw) satisfies never as
  never as ...)` line and two files had an unused `parseSessionMessage`
  import.
- Type: **implementation churn**, trivial.
- Evidence: caught by my own re-read of the file, not by a failing run.
- Cost: **trivial**.
- Preventable: yes, with a habit of re-reading immediately post-Write
  before wiring into any run — I did this inconsistently.

**C7 — First path guess for spike 007 directories came back empty**
- What: initial `find` targeted `/home/.../harness/007` and
  `harness-hidden/007`, both wrong (actual path is
  `spikes/007-structured-session-events`).
- Type: **necessary discovery**, borderline environment friction — I
  hadn't yet seen the repo's directory convention.
- Evidence: empty `find` output.
- Cost: **trivial** — one extra round-trip, immediately corrected by
  listing `spikes/`.
- Preventable: marginally — listing the directory tree first, rather than
  guessing a slug, would have avoided it, but this is a minor, one-time
  cost.

No genuine **semantic churn** occurred — I did not have to discard or
rewrite a hidden test because I misunderstood a requirement, mis-scoped an
oracle, or picked an invalid expected behavior. The case list (E1–E12) and
requirement/invariant/negative-requirement set held from first draft
through freeze.

## 3. Waste versus necessary iteration

Rough proportions of total run effort:

- **Necessary evaluation work** (reading brief/repo, designing cases,
  writing hidden tests and freeze artifacts, git operations): **~55%**
- **Useful discovery that couldn't have been known earlier** (ws
  broadcast/no-replay empirical validation; discovering C1/C2 via negative
  control, which is the pre-freeze gate doing its job): **~10%**
- **Avoidable evaluator implementation churn** (C1, C2, C4, C5, C6): **~20%**
- **Avoidable environment/tooling churn** (C3, C7): **~12%**
- **Avoidable semantic churn**: **~0%**
- **Tooling/environment overhead not otherwise counted** (small): **~3%**

Basis: counted the tool-call clusters directly attributable to each churn
instance in the log above against the ~85 total calls, then sanity-checked
against relative Write/Edit output volume. The single biggest lever is
that **~32% of the run (C1–C5) was spent fixing bugs in code I wrote
myself to validate the actual deliverable**, not the deliverable itself
failing to satisfy a requirement.

## 4. Repeated infrastructure

Machinery built/debugged this run that will very likely recur:

- **Connect-with-timeout WebSocket helper** (`awaitOpen`, racing
  `open`/`unexpected-response`/`error`/timeout). Generic transport
  plumbing, encodes no spike-specific acceptance criteria. **High value to
  extract** — this exact bug (C1) will recur on any future spike
  evaluating a WS endpoint if each prepare run reinvents it from scratch.
- **Guaranteed-cleanup host wrapper** (open host → try → close in finally,
  correctly nested). C2 was purely a "forgot to nest the try" bug. A tiny
  shared `withHarnessHost(options, fn)` helper that structurally can't
  leak the server would eliminate this class of bug by construction.
  Generic, safe to share.
- **`MemoryBackend`-style `SessionBackend` test double.** Already mirrors
  the public repo's own test suite pattern almost exactly. Sharing a
  canonical version (still spike-agnostic — it only implements the public
  `SessionBackend` contract) would reduce reimplementation without leaking
  hidden acceptance criteria.
- **Positive-control "host-under-test" indirection.** This run's approach
  — copy hidden test files into a scratch dir and hand-edit their import
  statements to point at a throwaway double — is exactly the mechanism
  behind C3, C4, and C5. A shared seam (e.g., hidden tests import
  `startHarnessHost` from one small local indirection module that itself
  picks the real implementation or an injected double based on an env
  var) would let the *same, unmodified* frozen test files run against
  both real and reference implementations, eliminating the copy/sed/path-
  arithmetic step entirely. This is infrastructure about *how tests find
  their subject*, not about *what they assert*, so it doesn't encode
  hidden criteria.
- **Repo-root path resolution from `harness-hidden/spikes/<n>/...` back to
  `harness/...`.** Purely mechanical relative-path arithmetic, done by
  hand multiple times and gotten wrong more than once. A documented
  one-line pattern (or a tiny resolved-path constant computed via
  `path.resolve(import.meta.url, ...)`) would remove this as a source of
  errors.

## 5. Highest-cost mistakes, ranked

1. **Positive-control path/module-resolution churn (C3).** ~6-8 wasted
   tool calls, and notably a *repeated* mistake — I'd already learned
   "`/tmp` scripts can't resolve `ws`" from the very first probe and
   didn't apply it. **Fix:** always stage Node validation scripts under a
   directory with real `node_modules` from the first attempt (i.e.,
   `harness-hidden`, never `/tmp`), and compute relative import paths with
   a path-resolution snippet instead of counting `../` by hand.
2. **Reference-server hang from missing socket teardown (C5).** A full
   30s timeout plus a debug cycle, caused by not mirroring the real
   implementation's `removeSession` behavior in the throwaway double.
   **Fix:** when building any reference/mock double of an existing
   subsystem, diff its behavior against the real implementation's
   lifecycle methods (`removeSession`, `endSession`) before running it,
   not after it hangs.
3. **`awaitOpen` missing error/timeout race (C1).** Wrote a WS-connect
   helper without the standard defensive pattern; the bug then silently
   propagated into several already-written test files. **Fix:** treat
   "race open against unexpected-response/error/timeout" as a fixed idiom
   for any WS-connect helper in this codebase — ideally supplied by
   shared evaluator infrastructure (see §4) rather than re-derived per
   spike.
4. **`try/finally` cleanup-ordering bug (C2).** Small in isolation but
   stacked directly on top of #3, doubling the debugging cycle before the
   first clean negative control landed. **Fix:** the `withHarnessHost`
   wrapper from §4 makes this bug structurally impossible rather than
   relying on manual discipline.
5. **Reference-server default-backend stub (C4).** Small, one-line fix,
   but cost a full run-fail-diagnose-fix-rerun cycle. **Fix:** when
   standing up any throwaway double of `startHarnessHost`, wire its
   default exactly to what `HarnessHostOptions.createBackend` defaults to
   in the real implementation, checked against the real source, not
   assumed.

None of these are "be more careful" issues in the sense of needing more
attention — they're all instances where a small piece of shared, reusable
infrastructure (a connect helper, a cleanup wrapper, a host-under-test
indirection seam) would have prevented the mistake from being physically
possible to write, not just less likely.

## 6. Bottom line

I don't have visibility into a prior Spike 007-equivalent Prepare run
under this same evaluator contract (v6) to compare against directly —
spikes 003-005 predate the current public/private split described in the
hardening brief, so a churn comparison against "previous evaluator work"
isn't something I can honestly support from available context.

**Main source of remaining inefficiency:** tooling/repository-navigation
friction around the *validation scaffolding* I built for myself (the
throwaway reference server and its path/module-resolution setup), not the
frozen deliverable itself. The hidden tests, eval-spec, and requirements
held up without a single semantic rewrite.

**Diagnosis:** this run's inefficiency is primarily **repeated
infrastructure work done ad hoc** rather than excessive scope, semantic
uncertainty, or poor evaluator-code quality in the deliverable. The 12
mandatory cases were the right size for the brief (no scope creep, no case
had to be cut or merged after the fact), and the frozen test code itself
was correct on first execution once the shared helpers were fixed. The
cost was concentrated in inventing WS-connect and cleanup idioms from
scratch, and in improvising a positive-control mechanism with hand-edited
import paths instead of a structural seam.

**Single most valuable change to test next Prepare run:** promote a
small, generic, acceptance-criteria-free shared module — a
connect-with-timeout WS helper plus a guaranteed-cleanup host wrapper plus
a host-under-test indirection point for positive-control runs — into
stable evaluator infrastructure, and require any new Prepare run to use it
rather than reimplement it. That single change would have prevented four
of this run's five ranked mistakes (C1, C2, C3, C5) outright.
