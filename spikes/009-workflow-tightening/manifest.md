# Spike 009 — Workflow Manifest

This append-only record preserves material workflow runs for Spike 009.

## Run 001 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: `spike.md`
- Input content identity:
  `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`
- Output: `feedback.md`
- Output content identity:
  `sha256:44e5346a40d1478f625df9766452c4409ed49f029501d8e7d5ab4a79716a6a84`
- Findings: none
- Repository evidence inspected: `AGENTS.md`, `GOALS.md`, public Spike 008
  workflow artifacts, package tooling, the existing workflow runner, and its
  visible tests
- Restricted evaluator material inspected: none
- Checks: `git diff --check -- spikes/009-workflow-tightening` passed before
  this manifest update
- Runtime tests: not run because this review made no implementation change
- Measurement cutoff: immediately before this manifest update

## Run 002 — Design Map

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief content identity:
  `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`
- Frozen brief Git provenance: `8d3b517`
- Output: `design-map.md`
- Output content identity:
  `sha256:0b099fa2e97e3e73b44d8d8abd95293b09f1747a155277afc4021690adc8ee76`
- Shared contracts established: independent verification identities with an
  explicit implementation reference; role-based executor selection; retryable
  launch failure; and owner-restricted local operational state
- Restricted evaluator material inspected: none
- Checks: `git diff --check -- spikes/009-workflow-tightening` passed before
  this manifest update
- Runtime tests: not run because no implementation changed
- Measurement cutoff: immediately before this manifest update

## Run 003 — Design Map refinement

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief content identity:
  `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`
- Supersedes Design Map identity:
  `sha256:0b099fa2e97e3e73b44d8d8abd95293b09f1747a155277afc4021690adc8ee76`
- Output: revised `design-map.md`
- Output content identity:
  `sha256:46d2822e9a8498b9bd470a73afd151fd907b594f3c652f8fa064d131780c726a`
- Correction: fixed the two environment-variable names needed for independent,
  black-box evaluation of executor selection; all other prior shared contracts
  remain unchanged
- Restricted evaluator material inspected: none
- Checks: `git diff --check -- spikes/009-workflow-tightening` passed before
  this manifest update
- Runtime tests: not run because no implementation changed
- Measurement cutoff: immediately before this manifest update

## Run 004 — Evaluator Prepare

- Recorded: contemporaneously
- Skill: `evaluator` v7
- Agent/tool: Codex (independent evaluator role)
- Mode: `prepare`
- Result: evaluator revision `001` frozen
- Frozen brief content identity:
  `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`
- Frozen brief Git provenance: `8d3b517`
- Frozen Design Map content identity:
  `sha256:46d2822e9a8498b9bd470a73afd151fd907b594f3c652f8fa064d131780c726a`
- Frozen Design Map Git provenance: `01b9f24`
- Output: `eval-requirements.md`
- Output content identity:
  `sha256:7cdff1c201e9a514348f805c9a14dc152832646eb18a89b8915c869de9cc5386`
- Evaluation revision identity:
  `sha256:a9eec04a60eeaf05c1f6c30f6e7cd6001886163c3bc593cad8cd499bbdb59fcd`
- Blocking questions: none
- Restricted evaluator material produced: private specification, case manifest,
  frozen hidden suite, integrity metadata, and attempt ledger in the mirrored
  evaluator workspace
- Checks: formatted private and public artifacts; every mandatory hidden case
  executed on the unimplemented baseline and failed for the intended absent
  behavior; `git diff --check -- spikes/009-workflow-tightening` passed before
  this manifest update
- Measurement cutoff: immediately before this manifest update

## Run 005 — Evaluator Prepare correction

- Recorded: contemporaneously
- Skill: `evaluator` v7
- Agent/tool: Codex (independent evaluator role)
- Mode: `prepare`
- Result: evaluator revision `002` frozen; revision `001` preserved unchanged
- Superseded evaluator revision identity:
  `sha256:a9eec04a60eeaf05c1f6c30f6e7cd6001886163c3bc593cad8cd499bbdb59fcd`
- Corrected evaluator revision identity:
  `sha256:e486eafc8bd49f3fed5c3965f75b590106550cbb7f5e8f9f3edcab66b7cd0e0b`
- Classification: `EVALUATOR_DEFECT` — the first revision's unavailable-
  executor fixture accidentally retained its fixture executable on `PATH`, so
  it did not exercise the claimed failure path
- Correction: archived revision `001` byte-for-byte, then refroze revision
  `002` with a PATH containing no executable; implementation contract and
  public evaluation requirements are unchanged
- Restricted evaluator material inspected/produced: private archived revision,
  corrected suite, and freeze metadata in the mirrored evaluator workspace
- Checks: corrected suite passed all 5 mandatory cases against the candidate;
  no evaluator-private detail is included here
- Measurement cutoff: immediately before this manifest update

## Run 006 — Implementation attempt 001

- Recorded: contemporaneously
- Skill: `implementation` v3
- Agent/tool: Codex
- Result: candidate complete; independent evaluator verification pending
- Inputs: frozen `spike.md`, `design-map.md`, `eval-requirements.md`, and
  `AGENTS.md`
- Input content identities:
  - brief: `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`
  - Design Map: `sha256:46d2822e9a8498b9bd470a73afd151fd907b594f3c652f8fa064d131780c726a`
  - evaluation requirements: `sha256:7cdff1c201e9a514348f805c9a14dc152832646eb18a89b8915c869de9cc5386`
- Input Git provenance: `8d3b517` (brief), `01b9f24` (Design Map), and
  `6e1f099` (evaluation requirements)
- Output: repository tooling workflow runner with independent verification
  identities, role-level executor selection, retryable launch failure, and
  owner-restricted local state/log files
- Output content identity (implementation files immediately before this
  manifest update):
  `sha256:010cbb066ddfae3cdad22116f6317b1b9fd3e8b54ed023b87fe26ed14659fa84`
- Restricted evaluator material inspected: none during implementation
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm
  test` (28 passing), and `git diff --check` passed
- Measurement cutoff: immediately before this manifest update
