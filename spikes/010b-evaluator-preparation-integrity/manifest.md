# Spike 010b — Workflow Manifest

## Run 005 — As-Built

- Skill: `as-built` v2
- Result: implementation `fd956874da6805ad202af4a2bdee185d28b64823`
  matches the frozen public contract; no material discrepancies observed
- Inputs: frozen brief, Design Map, promoted evaluation, and implementation
  handoff
- Output: `as-built.md`
- Measurement cutoff: immediately before this manifest update

## Run 005 — Evaluator Verify

- Skill: `evaluator` v10 (verify mode); frozen evaluator revision prepared
  under `evaluator` v9 plus the Spike 010b bootstrap evaluator exception
- Mode: `verify`
- Result: verification attempt `001` — `PASS`. `technicalVerification` is
  `PASS`; human product acceptance remains a separate later gate
- Implementation evaluated: `fd956874da6805ad202af4a2bdee185d28b64823` (clean
  commit; no working-tree changes)
- Inputs (frozen identities, all matched — no specification drift): brief
  `sha256:299504652c890dbfe2624f0319603c4797ace9707979c8595d7b080df0482d98`;
  Design Map
  `sha256:7ee841df27b8a0ec5a2f3050a2a1b3597eeb6bfb74a1a7c5004ef9dbe228302a`;
  public `eval-requirements.md`
  `sha256:533f1f3abd36e1a7fc52af0d6607e9c3e72fbc267df1f485c654c415595253a5`;
  `coverage-map.json`
  `sha256:fb8295fb156a92aa16901a7ffee03a3ad510ce53020718744a5e4cac0d5c4d55`;
  evaluator revision `001` identity
  `sha256:998700a3dfa889f2b1f67a2b627ee785e590b8a1ed8d6dbeea3a91de8289dc09`
- Aggregate coverage: 30 of 30 frozen acceptance criteria (AC01–AC30)
  `SATISFIED`; every frozen mandatory case established its criteria; 0 findings,
  0 evaluator defects, 0 specification ambiguities, 0 infrastructure failures
- Repository validation at the evaluated commit: `npm test` (36 tests, 36
  pass), `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check` each exit 0
- Promotion: `evaluation/attempt-ledger.json` and
  `evaluation/attempts/001/eval-result.md` copied byte-for-byte from the
  private evidence chain; `evaluation/promotion.json` records overall `PASS`
  and evaluator revision `001` with a `not-promoted` disposition (no
  evaluator-authored executable hidden tests exist; durable regression coverage
  is the already-public `test/workflow.test.ts`); promoted-file identities
  recomputed equal to source
- Measurement cutoff: immediately before this manifest update

## Run 004 — Implementation

- Skill: `implementation` v3
- Result: implementation attempt `001` candidate prepared; `implementation-handoff`
  pending the committed and pushed public checkpoint
- Inputs: frozen brief
  `sha256:299504652c890dbfe2624f0319603c4797ace9707979c8595d7b080df0482d98`
  at `20e35fb`; frozen Design Map
  `sha256:7ee841df27b8a0ec5a2f3050a2a1b3597eeb6bfb74a1a7c5004ef9dbe228302a`
  at `7a37c08`; public `eval-requirements.md`
  `sha256:533f1f3abd36e1a7fc52af0d6607e9c3e72fbc267df1f485c654c415595253a5`
  at `55e8aae`; `AGENTS.md`; no evaluator-private material inspected
- Outputs (content identities immediately before this manifest update):
  - `tools/workflow.ts`
    `sha256:27ef0020c099e8a0231f1f202e049f4a9e37df8fa512a31d1c542b5e20cfd656`
    — the `evaluation-prepared` authority validation now parses the
    `coverage-map.json` criterion-evidence records (criterion identity,
    frozen-authority source, evidence mode, required disposition, procedure
    identifiers, criterion-specific sufficiency) and the public-safe readiness
    attestation, rejecting a map with an absent, duplicate, or under-specified
    record or without a passing attestation and leaving `workflow.jsonl`
    unchanged on rejection; `verification-allocated` now binds the attested
    evaluator revision and is refused without a passing attestation
  - `skills/evaluator/SKILL.md`
    `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`
    — contract version 9 → 10: explicit deterministic pre-freeze
    preparation-integrity validation step upstream of freeze, criterion-evidence
    record and readiness-attestation obligations, freeze-inventory completeness,
    forward-only post-allocation `BLOCKED` / `EVALUATOR_DEFECT` handling, and a
    hard stop on evaluator-revision churn once the repeated-correction threshold
    is reached
  - `AGENTS.md`
    `sha256:7fb5556317bcd97c1f85050e53d9272a7402fab35d94d7cb1f3fc767e1827b3e`
    — autonomous-orchestration guidance states the pre-freeze integrity
    obligations, the `evaluation-prepared` meaning, the allocation precondition,
    and the threshold-reached stop as binding contract language
  - `test/workflow.test.ts`
    `sha256:24408b698a99bb54d5de8bdf28fe585aca87727e3f2bbaff84cc2c8e83d36cba`
    — visible regression coverage against the `workflow authority` CLI for
    AC22–AC26 (missing-attestation draft cannot prepare; structurally
    incomplete evidence reference rejected before allocation; shared evidence
    with retained per-criterion traceability accepted; non-executable evidence
    procedure accepted; forward-only post-allocation evaluator-integrity
    failure), plus the existing PASS-through-rejection fixture updated to the
    richer map
  - `skills/evaluator/history/v9/SKILL.md`
    `sha256:c68b39a8675d8af3a0cedfdf418172ecd41610de21d7ecab71d4c0f2a5cabd5f`
    — replaced evaluator v9 contract archived outside the active skill path
- Decisions: `coverage-map.json` remains the single public authority artifact;
  the deterministic preparation-integrity validator stays evaluator-owned and
  the public authority validates only attestation and map shape; `preparedCoverage`
  retained for `verification-finalized` coverage matching
- Non-goals honored: Spike 010a untouched (no path under
  `spikes/010a-*/` changed); no synthetic `human-rejected`,
  `verification-finalized`, or `successor-linked` event; no hidden tests added;
  no semantic evaluator-quality judgement in Harness
- Checks: `npm run check` (`tsc --noEmit`, `eslint .`, `prettier --check .`,
  `node --test test/*.test.ts`) exit 0; 36/36 tests pass; `git diff --check`
  clean
- Measurement cutoff: immediately before this manifest update

## Run 003 — Evaluator Prepare

- Skill: `evaluator` v9 (prepare mode) + Spike 010b bootstrap evaluator exception
- Result: evaluator revision `001` frozen; `evaluation-prepared` pending
  committed public checkpoint
- Inputs: frozen brief
  `sha256:299504652c890dbfe2624f0319603c4797ace9707979c8595d7b080df0482d98`
  at `20e35fb`; frozen Design Map
  `sha256:7ee841df27b8a0ec5a2f3050a2a1b3597eeb6bfb74a1a7c5004ef9dbe228302a`
  at `7a37c08`
- Outputs: `eval-requirements.md`
  (`sha256:533f1f3abd36e1a7fc52af0d6607e9c3e72fbc267df1f485c654c415595253a5`),
  `coverage-map.json` (30 criterion records `AC01`–`AC30` plus a passing
  pre-freeze readiness attestation)
- Evaluation shape: 11 evaluator cases; no executable hidden tests (justified —
  the preparation-integrity validator is deliberately implementation-free and
  the visible authority CLI plus its regression suite are the fair seam);
  coverage by static inspection, git provenance inspection, and public
  regression
- Pre-freeze integrity: bootstrap substitute checklist completed before freeze —
  criterion completeness, procedure materialization, bidirectional traceability,
  freeze inventory, public/private identity consistency, controlled
  pre-implementation baseline (31/31 visible tests pass, typecheck/lint/format
  clean), no candidate implementation inspected
- Checks: `node --test test/*.test.ts`, `npm run typecheck`, `npm run lint`,
  `npm run format:check` all clean; `git diff --check` passed; Spike 010a public
  and mirrored `-hidden` trees confirmed unchanged since baseline `16ee4ed`
- Measurement cutoff: immediately before this manifest update

## Run 002 — Design Map

- Skill: `design-map` v2
- Result: frozen shared contract pending committed checkpoint
- Inputs: frozen brief `sha256:299504652c890dbfe2624f0319603c4797ace9707979c8595d7b080df0482d98`
  at `20e35fb`
- Output: `design-map.md`
- Decisions: public-safe readiness attestation and criterion evidence projection;
  private evaluator-owned validator and inventory; forward-only `BLOCKED`
  evaluator-defect outcome after allocation
- Checks: public authority implementation and visible workflow tests inspected;
  `git diff --check` passed
- Measurement cutoff: immediately before this manifest update

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Result: `Ready to freeze`
- Input: `spike.md` at committed provenance `4f782a1`
- Output: `feedback.md`
- Restricted evaluator material inspected: none
- Findings: none
- Checks: repository contracts, public workflow authority implementation, and
  visible workflow tests inspected; `git diff --check` passed
- Measurement cutoff: immediately before this manifest update
