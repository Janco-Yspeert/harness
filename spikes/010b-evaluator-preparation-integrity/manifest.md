# Spike 010b — Workflow Manifest

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
