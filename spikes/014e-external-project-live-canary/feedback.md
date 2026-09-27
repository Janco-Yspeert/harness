# Spike 014e — Brief Readiness Feedback

**Reviewed input:** `spikes/014e-external-project-live-canary/spike.md`
(`sha256:949579299e7068fb3f1f25f90326a49c54f09749585706a5e783a899e302a54d`),
reviewed against `feat/spike-014` at
`e20253b15bc5c3b2db57004d3922d808672471fa`.

**Verdict:** **Not ready to freeze** (`NOT_READY`)

## Summary

The brief correctly finds the real coupling in the current host.
`src/kernel/trust.ts` resolves `trustedHistory`, the policy and the validator
sources relative to `project.root`, using that root's own Git top-level.
`src/kernel/resolver.ts` checks committed inputs with
`git show <commit>:<path>` in `project.root`. `src/kernel/configuration.ts`
has only one `root`. The dependency identities also match the repository.
`methodologies/harness/trusted.jsonl` record 5 is methodology
`sha256:47296d5c…effb` at revision `9169ccf7…`, and host maintenance 003 is
commit `f6d1456`.

The Track A scope is otherwise well bounded. It has explicit fail-closed
rules, non-goals and a stop rule for isolation it cannot enforce.

One lifecycle and ownership decision is still missing. The brief does not say
who runs Track B, or where it falls in the 014e Harness workflow. Because of
that, it also does not say which exact Harness commit the 014e evaluator
verifies. That choice decides authority, what the evaluator gets as input, and
whether AC06–AC09 can be judged fairly. It cannot be left to the Design Map or
the evaluator.

## Blocker

### B1 — Track B has no owner or lifecycle position in the 014e workflow, and the 014e verification candidate is undefined

**Brief evidence.**

- §4 Track A step 3 creates a local checkpoint **H1**. Step 5 treats H1 as the
  immutable Track B runtime.
- Track B steps 1–4 need things no current role has:
  - a separate Stockdif host instance;
  - real Stockdif human freeze and acceptance;
  - up to 10 provider allocations.
- Track B step 5 says the evidence is "cross-referenced" in Harness's
  `014e/evidence/`.
- "The final independent 014e verification … must include the actual Track B
  evidence" (§4). AC09 then has the 014e evaluator verify "H1's generic
  behavior and the predetermined public-safe canary evidence".

**Repository evidence.**

- `skills/implementation/SKILL.md` (Completion and worker protocol): "The host
  binds the handoff to the committed `HEAD`". The evaluator resolves "the exact
  committed implementation revision" (`skills/evaluator/SKILL.md`, around line
  300).
- An evidence commit made after H1 is therefore a different commit from the
  implementation handoff. The brief does not say whether the evaluator verifies
  H1, a later H1+evidence commit, or both.
- `AGENTS.md`, "Supervisor identity": the supervisor "must not edit role
  artifacts, submit role results, or claim a worker's executor/model identity"
  without a separately granted inline Role Grant.
- The brief also says a worker must not acquire host privilege. A Harness 014e
  Implementation worker that is confined to the Harness repository cannot run
  a Stockdif host either (§2, "Track A uses its existing Harness-only
  project…").
- So as written, no permitted actor can run Track B and commit its Harness-side
  evidence.
- Precedent: the 014d As-Built
  (`spikes/014d-real-methodology-integration-extensible-skill-evolution/as-built.md`,
  "Missing" items 1–3) recorded observed-run evidence that could not be tied to
  exact identities.

**Consequence.** A later role would have to decide all of these:

- whether Track B runs inside the 014e Implementation attempt, or between
  `implementation-handoff` and Evaluator Verify;
- which authority lets it run (supervisor, root/human authority, or a role);
- who commits `014e/evidence/`;
- which candidate commit the 014e evaluator binds;
- how an H2 correction re-enters the attempt and allocation history.

Different answers lead to different evidence commits, grants and verification
inputs. The Evaluator Prepare step also cannot "predeclare" what it will check
without knowing where the evidence sits in the lifecycle.

**Smallest clarification requested.** Add a short paragraph to §4 that states:

1. Who executes Track B, and under what authority. For example: the operator
   or supervisor, under an explicit human authorization recorded in the 014e
   ledger. It should not be a Harness role worker.
2. Where Track B sits in the 014e workflow. For example: after 014e
   `implementation-handoff` of H1 and before 014e Evaluator Verify.
3. Who commits the public-safe `014e/evidence/` summary to Harness, in which
   commit, and how that commit relates to H1.
4. What exactly the 014e Evaluator Verify binds. For example: candidate = H1
   for generic behaviour, plus a named evidence commit or artifact identity for
   AC06–AC09.
5. How an H2 affects the 014e attempt and handoff. For example: H2 is a new
   implementation correction attempt with its own handoff, and the Track B
   evidence is rerun or re-bound.

## Material clarifications (non-blocking once B1 is resolved)

### M1 — "Freeze … only after … the Design Map makes an explicit … isolation choice" inverts the lifecycle

The completion section makes brief freeze depend on a Design Map. But
`methodologies/harness/policy.json` (the `design-map` role, around line 39)
requires `brief-frozen` before Design Map. That condition cannot be met in the
canonical workflow.

**Request:** reword it along these lines: "Freeze after Brief Readiness; the
Design Map must make an explicit, enforceable isolation choice, and
implementation may not start until it does."

### M2 — Public-worker read denial vs. the preferred Codex public roles

`src/executors/adapters.ts` marks Codex as `privateWorkspace: false`, with the
comment "The Codex sandbox restricts writes, not reads". §2 requires denying
public workers "unintended access to `spikedif-hidden`". The stop rule already
covers this, so it is not a blocker.

**Request:** state plainly that read denial of `spikedif-hidden` applies to
every public role whatever the provider. Also state that if the Design Map
cannot confine Codex reads, using Claude for public roles is a pre-authorized
substitution rather than a new human decision (or say explicitly that it is
not). Otherwise §5's "substitution is a human decision" and §2's stop rule can
be applied differently by different roles.

### M3 — Model/effort "preference" vs. exact grant constraint

`src/executors/adapters.ts` (around lines 515–527) refuses an *exact*
`executorConstraints` model or reasoning setting when the adapter cannot attest
it. Codex attests neither.

**Request:** state that Codex "Luna/Medium" is a profile preference recorded as
*requested, not attested*, not an exact grant constraint. Otherwise the
preferred setup is refused at allocation.

### M4 — What the 10-allocation Stockdif bound counts

"Seven normal roles" matches the seven non-orchestrator skills. It is unclear
whether orchestrator executions count toward the bound. It is also unclear
whether a Stockdif readiness re-review counts; one is likely, because §4 Track
B step 2 expects material findings and a material edit needs another readiness
pass.

**Request:** say which allocations count toward the 10.

## Editorial

- **E1.** The header lists local directories `vk-code/spikedif` and
  `vk-code/spikedif-hidden`, but §1 and the table say "public `spikedif`
  repository". Pick one name for the Stockdif checkout, or explicitly give the
  local directory name next to the GitHub name.
- **E2.** "Track B … pinned to H1" (§4 Track B step 1) would be easier to check
  if it named the recorded evidence, for example "host commit recorded in the
  Stockdif grant or ledger".

## Review limitations

- The Stockdif repository, its local directories and its draft Spike 001 brief
  are outside this execution's granted workspace and were not inspected. Their
  identities are taken as the brief states them. The brief itself defers them
  to preflight re-resolution.
- The installed Codex and Claude CLI versions and their sandbox behaviour were
  not exercised.
- An attempt to inspect `methodologies/harness/policy.json` with a Python
  one-liner was denied by the session permission policy. The policy was
  inspected with a content search instead.
- No evaluator-private material (`eval-spec.md`, `.hidden-test/**`,
  `.eval/**`) was inspected.

## Files changed and checks

- Written:
  - `spikes/014e-external-project-live-canary/feedback.md`;
  - `spikes/014e-external-project-live-canary/preliminary/001/{spike.md,feedback.md}`;
  - `spikes/014e-external-project-live-canary/manifest.md`.
- Checks: SHA-256 of the reviewed `spike.md` compared with the host-bound
  identity (match).

**Not ready to freeze**
