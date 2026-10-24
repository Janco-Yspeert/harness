# Brief Readiness — Spike 014l

## Review basis

Reviewed the exact revised draft
`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md` at
`sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`
against `AGENTS.md`, `GOALS.md`, the current kernel allocation and continuation
paths, governed provider launch path, bundled methodology policy, visible tests,
the prior preliminary review, and the public Outcomes for 014f, 014j, and 014k.
No evaluator-private material or workflow ledger was inspected.

## Material findings

None.

The revised draft resolves the prior blockers with one coherent public
contract:

- `kernel.allocation` is now the irrevocable semantic-attempt commit, with
  explicit ordering for Role Grant binding, role `onAllocate`, exposure
  provenance, and governed delivery
  (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:106`;
  current ordering to be changed is visible in `src/kernel/execution.ts:1289`).
- Spawned execution uses a separate material-free, single-use readiness probe
  before semantic allocation, matching the current one-shot launch constraint
  without introducing persistent sessions
  (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:248`;
  current assignment-first launch is visible in
  `src/executors/governed.ts:370`).
- Attached execution is explicitly in scope and has a canonical compatibility
  path before the same semantic boundary
  (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:323`;
  the current attached/spawned split is visible in `src/kernel/host.ts:777`).
- Operational retry has an exact host-owned budget and canonical launch-intent
  reset key, independently of existing semantic allocation and automatic-work
  limits
  (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:354`;
  current semantic continuation is visible in `src/kernel/host.ts:1370`).
- Semantic no-progress now has an exact normalized identity, ignored-field
  rules, and a one-repeat stop rule
  (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:441`).
- The minimum status fields are normative on the existing root-only `resolve`
  GET observation rather than a new authority surface
  (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:486`;
  the current observation endpoint is `src/kernel/host.ts:655`).

These decisions are consistent with `GOALS.md` requirements for one canonical
authority history, explicit bounded human authority, exposure-aware execution
provenance, both attached and spawned execution, and reconstructable
observation. The remaining representation, factoring, and transaction choices
are ordinary implementation decisions under the stated contract.

## Editorial findings

None.

## Review limitations

This was a static contract-readiness review. I did not run product tests because
no implementation behavior was changed, did not exercise a live provider, and
did not inspect evaluator-private material or workflow ledgers. The historical
allocation counts in the draft were treated as author-supplied context rather
than independently reconstructed.

## Files changed

- `spikes/014l-launch-readiness-retry-orchestration-semantics/feedback.md`
- `spikes/014l-launch-readiness-retry-orchestration-semantics/manifest.md`

## Checks run

- Verified the bound revised `spike.md` SHA-256 identity.
- Compared the revised draft with the preserved preliminary draft and findings.
- Inspected relevant public source, policy, visible tests, goals, and selected
  public Outcomes.
- Confirmed the passing review creates no additional `preliminary/` snapshot.
- Ran scoped `git diff --check` over the produced artifacts before
  checkpointing.

**Ready to freeze**

---

# Verification feedback — attempt 4 (candidate 212e12e4)

Result: FAIL, classification IMPLEMENTATION_FAILURE, evaluator revision 001.

- Violated public requirement: AC25 / AC24 (existing normal attached and spawned workflows and the repository regression remain intact; brief required tests 32-33).
- Expected: `npm run typecheck`, `lint`, `format:check` and `npm test` all pass at the candidate commit.
- Observed: typecheck, lint and format pass. `npm test`: 331 tests, 311 pass, 20 fail.
  - Existing real-role spawned workflow tests (011 skill-fidelity family) are refused at start with operational-retry-exhaustion, because the shared provider fixture never produces the positive readiness confirmation the probe now requires.
  - Existing containment-refusal tests (014h AC11, 014j AC10/AC11, AC04/AC13, 014e D4) observe operational-retry-exhaustion where they asserted permission-denied or similar pre-allocation refusals.
  - The 014k trusted-history test asserts 6 entries; the repository holds 7.
- Safe diagnostics: deterministic and identical at the candidate's parent; the pre-014l baseline fails only one environment-sensitive containment test; bubblewrap works in the evaluation session; new 014l suites pass.
- Retry guidance: keep the existing visible suite green with the readiness probe, preserving existing refusal categories unless the brief states otherwise, then re-verify against the same frozen evaluator.
