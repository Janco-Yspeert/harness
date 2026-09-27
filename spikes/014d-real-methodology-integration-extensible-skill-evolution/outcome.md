# Outcome — Spike 014d Real Skill Execution and Host Contract Integration

## Result and exact provenance

**COMPLETE — independently evaluated PASS, accepted by the human, with
methodology promoted N → N+1.** Completion mode `STANDARD`. This is not a
process exception.

| Item | Identity |
| --- | --- |
| Accepted candidate | `9169ccf7d4543c214e7b7890ee29e428a5f8c01a` (tree `9cab20f7…`) |
| Frozen brief | `spike.md` `sha256:8d4302b2…ac710d` (`brief-frozen` at `047daac`) |
| Frozen Design Map | `design-map.md` `sha256:50780fa3…1200e` (replacement map, committed at `a429ecd`) |
| Independent evaluation | trusted N, evaluator v13, revision `002` (`sha256:386ed11b…171319`), attempt `007`, **PASS**: 13/13 criteria, 11/11 executable cases, clean-clone `npm run check` 175/175 |
| Verification result | `sha256:7c30dd1f…2e55bc` (committed at `6f6b7bb`) |
| Evaluator archive promotion | `evaluation/promotion.json` `sha256:9af26562…862d8c`, integrity `sha256:21227871…27ec`, 17 artifacts (`promotion-recorded` `4115a86a…`). `promotion.json` committed at `d221862`, the full archive at `06a01cd` |
| As-Built | `as-built.md` `sha256:21505610…34216` (Run 014 at `45f3ce4`, forward-only retry Run 015 at `c3d503e`) |
| Human acceptance | `human-acceptance.md` at `ab5a388`, ledger `human-accepted` `dc31ad1a…`, bound to candidate `9169ccf7…` and promotion `sha256:9af26562…` |
| Methodology promotion | `methodologies/harness/trusted.jsonl` record `5` at `426a561`: methodology `sha256:47296d5c…4effb`, revision `9169ccf7…`, previous record `4` `sha256:5fc66acd…42ac48`. Evaluation kind `trusted-methodology`, bound to the N-authored attempt-007 PASS, the exact `candidate` and `candidateMethodology` |

The PASS used a clean clone of the candidate. Its public-evidence review also
read documentation-only spike evidence committed after the candidate, up to
`41726f7`. `evidence/accepted-candidate-identity.md` confirms that every
post-candidate path lies under this spike directory. Host maintenance 003
(`f6d1456`, `src/kernel/{execution,resolver}.ts`, `test/kernel.test.ts`) was
committed separately after the candidate. It is **not** part of the evaluated
or accepted implementation.

## What Was Established

Proven by independent N evaluation and accepted:

- **All eight real skills run through the governed host.** A fidelity matrix
  covers skill ↔ contract ↔ MCP ↔ artifact ↔ policy. Deterministic tests
  drive the real pinned skill bytes through the real host for all eight
  roles in one bounded grant, with negative paths included (AC01).
- **Real-provider execution works through the production adapter.** An
  isolated fixture ran Brief Readiness, Design Map, Evaluator Prepare and
  Implementation (R1) on the registered Claude adapter (`claude-opus-5-5`,
  CLI `2.1.280`, effort unavailable) (AC02, AC13).
- **The candidate evaluator archives its own evidence end to end.** In the
  same fixture, candidate evaluator v14 persisted `.eval/promotion-plan.json`,
  submitted PASS, called `requestAction(promotion)`, received host success
  and produced `promotion-recorded` (R2). N evaluated this; the candidate did
  not certify itself (AC04, AC05).
- **Orchestrator v3 uses Harness by default and continues without
  ceremony.** Observed under Codex CLI `0.155.1`:
  - an ordinary request with no Harness wording selected the governed
    workflow (AC02 observation);
  - one grant carried multiple phases;
  - it stopped at the human-acceptance gate;
  - read-only requests stayed read-only;
  - an explicit stop halted work;
  - a missing adapter surfaced as a host `no-adapter` blocker, with no
    direct-provider workaround (AC03).
- **Archival negatives fail closed.** Missing, tampered, ineligible and
  oversized plans, wrong identities, omitted, denied or duplicated actions,
  and premature exit cannot fabricate archival. A genuine PASS survives a
  failed action (AC06).
- **Trusted N is resolved from Git objects.** New grants bind N regardless of
  working-tree bytes. `promoteMethodology()` rejects cross-candidate,
  self-evaluated, stale-authority and drifted promotions (AC09, AC10).
- **The fixed eight-role list is gone.** A disposable ninth optional role
  checks and diffs without becoming authoritative (AC11).
- **Worker context is split.** A byte-stable context prefix is separated
  from volatile execution data, and assignment identity checks are kept
  (AC12).
- **N → N+1 ran through the ordinary path for the first time.** Earlier
  trusted records 1–4 relied on human bootstrap. Record 5 is the first
  trusted-history record bound to an independent `trusted-methodology` PASS.

Observed but limited (see Deferred Concerns): R1/R3 identity and
initiating-request gaps recorded by As-Built, and the AC02 fixture that stopped
before evaluator preparation.

## Implementation Summary

The candidate changes 50 files (+6441/−360) against baseline `0b55064`
(As-Built):

- **Promotion plan.** `tools/archive-manifest.ts` owns the v2 plan schema at
  `.eval/promotion-plan.json`. It builds identity-checked manifests from the
  persisted file only. The contract model gains an optional `promotion.plan`
  that the host enforces, and `promotion-recorded` carries `planIdentity`.
- **Bound B.** `MAX_ACTION_ARTIFACTS = 64` is the single definition of the
  artifact bound, and its value is unchanged.
- **Trust.** `trustedDefinition()` builds N from `git show`, and
  `GovernedHost` installs it as the methodology source. `promoteMethodology`
  binds `candidate` and `candidateMethodology`.
- **Optional roles.** `ACTIVE_ROLES` is removed. The role set comes from the
  manifest, with generic `ROLE_COHERENCE` and `HOST_ACTION` diagnostics.
- **Context.** `workerContext()` returns stable and volatile parts.
- **Skills.** Every role skill gained a worker-protocol section. New
  versions:
  - brief-readiness v5, design-map v4, implementation v5, evaluator v14,
    as-built v4, outcome v5;
  - orchestrator v3 (default Harness selection, one grant then `/continue`,
    bounded human-ask conditions, blockers, provenance).
- **Legacy bridges.** They are classified and statically guarded against
  governed-path use, not deleted.
- **Host changes folded in via host maintenance 001/002:**
  - semantic BLOCKED stops continuation;
  - an outstanding human request is a gate;
  - late human responses bind to requests of terminated workers;
  - root-only pre-implementation recovery was added;
  - `artifactCommit` provenance is used for committed inputs;
  - new `readiness-blocked` and archival-incomplete policy gates.

## Evaluation Evidence

Seven canonical verification attempts under N, evaluator revision `002`
throughout (revision `001` was invalidated by recovery before any use):

| Attempt | Candidate | Result |
| --- | --- | --- |
| 001 | `0e2789c` | FAIL `IMPLEMENTATION_FAILURE`; public checkpoint lost to a provider rate limit |
| 002, 003 | — | no result; rate limit before evaluation began |
| 004 | `0e2789c` | FAIL: real-provider, AC05 fixture and orchestrator evidence absent (6 not satisfied, 7 not adjudicated) |
| 005 | `9169ccf` | FAIL: four declared proof gaps (AC03 blocker, AC02 default selection, AC05 trust root, `promotionPlan` binding) |
| 006 | `9169ccf` | FAIL: 11/13; AC09 candidate/check/diff evidence missing, AC13 consequential |
| 007 | `9169ccf` | **PASS** 13/13 |

Attempts 005–007 used the same unchanged candidate. The gaps were closed by
human-authorized, public-only evidence imports (`01875f3`, `f62e4ed`,
`41726f7`), not by code changes. In attempt 007 the first promotion request
was denied ("promotion outside role grant"). The second succeeded. The
evaluator archive (ledger, attempts 001 and 004–007, freeze and revision
`002` bundle) is committed under `evaluation/`.

## Material History

- **Readiness and design.** Readiness returned READY with clarifications
  M1–M3. The brief auto-froze without resolving them. An early execution
  submitted `blocked`, and Design Map asked the human to rule on M1. The
  candidate policy later made NOT_READY a human gate.
- **Pre-implementation recovery.** A late qualified human response then
  invalidated the first Design Map and evaluator revision `001`. The new
  root-only recovery `d86c645e` handled this. The map and revision `002` were
  re-prepared under a successor grant (Runs 004–005). The two root
  authorities issued against the unscoped basis became unusable. Host
  maintenance 003 later fixed that basis calculation.
- **No provider access in Implementation.** The Implementation role had no
  provider CLI or credentials. On human instruction the real-provider proofs
  were recorded as outstanding, not fabricated (Run 006). They were later run
  in isolated governed fixtures and imported as public evidence under
  explicit human authority.
- **As-Built repair.** Candidate As-Built v4 blocked because the host's
  promotion writes `evaluation/promotion.json` but does not commit it. Two
  bounded, root-authorized implementation repairs taught As-Built to validate
  and commit that file alone (Runs 008–009).
- **Blocked Codex CLI observation.** The first observation was blocked by
  sandboxed localhost networking. Preflight 004 isolated the cause. The final
  profile allowlisted only `127.0.0.1`, without widening the sandbox.
- **Recovery authority.** 11 root authorities were issued. Most were
  one-use continuations after retry bounds were exhausted or after provider
  quota exhaustion.
- **As-Built under N.** Trusted As-Built v3 left `promotion.json`
  uncommitted, as its pinned contract required (Run 014). A forward-only
  retry committed it separately (Run 015). Run 014 was preserved.

## Decisions

- Keep B = 64. The largest committed archive has 38 files, and oversized
  requests are refused without partial promotion (C4).
- The orchestrator stays an external supervisor outside trusted methodology.
  Its v3 identity `sha256:4ca4d899…e60d` was approved alongside N+1.
- Deterministic checks support AC01 but never replace the real-provider
  proofs (C7).
- Legacy components are classified and guarded rather than deleted.
- Host maintenance 003 stays outside the 014d candidate and acceptance.
- Human acceptance authorized N+1 promotion, which was then recorded.
  Existing grants, including this workflow, keep N.

## Discoveries

- **Old-N archives lack the new plan.** N (evaluator v13) could fairly
  evaluate N+1, but its contract has no `promotion.plan`. This spike's own
  archive therefore has no `promotion-plan.json` and no `planIdentity`
  (As-Built Contradictory 2). The new format is shown only in the fixture.
  Every future N → N+1 transition will have the same one-generation lag.
- **The host–As-Built handoff had a gap.** Host promotion leaves the
  archive untracked. That gap, not any evaluator defect, blocked As-Built,
  and the fix was needed on both N (a retry) and N+1 (a skill change).
- **Fixed attempt budgets fit badly.** Evidence-gap FAILs on an unchanged
  candidate consumed verification attempts. Retry bounds sized for code
  defects then forced repeated human root authorities.
- **External orchestration depends on the CLI environment.** Sandbox
  networking and environment policy, not Harness, were the main blockers.

## Deferred Concerns

- As-Built Missing items remain historical:
  - R1 executed skill identities not recorded;
  - R3 initiating request and blocker reporting absent in the first extract.
  The AC02/AC03 CLI imports addressed these later, and attempt 007
  adjudicated them.
- The AC05 fixture archive had 3 mappings and no revision bundle, so B
  retention rests on the deterministic 38-mapping archive. Larger future
  histories may need a separately governed change to the bound.
- The AC02 fixture host exited before evaluator preparation because its
  configuration lacked an `evaluation` workspace. That run was not a
  complete fixture workflow.
- Codex observations do not establish every Codex App or provider
  configuration. Model and effort were unavailable from the CLIs.
- Host maintenance 003 needs its own verification and integration.
- The shared-public-context and regression-recommendation seams are
  documented only.
- Legacy bridge modules still exist.
- Deferred to 015:
  - usage, quota and cache telemetry;
  - restart after a quota interruption.

## Skill Versions and Workflow Cost

All runs executed under trusted N (`sha256:f03608ba…391b92`), and all manifest
entries are contemporaneous:

- Brief Readiness v4 (Run 001);
- Design Map v3 (Runs 002 and 004);
- Evaluator v13 (Prepare in Runs 003 and 005, Verify in Runs 007 and
  011–013);
- Implementation v4 (Runs 006 and 008–010);
- As-Built v3 (Runs 014–015);
- this Outcome v4.

Candidate N+1 skills were exercised only as fixture subjects.

Workflow cost, from `workflow.jsonl` up to the acceptance event:

- elapsed time: 2026-09-24 21:54Z to 2026-09-27 14:56Z;
- 28 executor allocations, 3 Workflow Grants (one revoked by recovery);
- 7 verification allocations, with 4 finalized results;
- 4 implementation handoffs;
- 5 canonical human requests;
- 11 root authorities;
- 12 continuation stops.

There are 15 manifest runs before this entry. No token, cost or quota
figures were reliably available, so none are reported.

## Next Step

As the human acceptance directs: run a small external-project canary (014e)
under N+1. Then resume the remaining 014a historical recovery under its own
authority, and take usage/quota telemetry, restart after a quota
interruption, lower context cost and simplification into 015.
