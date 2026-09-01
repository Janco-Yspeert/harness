# Spike 011 Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Result: `Ready to freeze`
- Input: `spike.md`
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
  at committed provenance `9af63ce91780468b1626e258ac35edfaede88e4b`
- Output: `feedback.md`
- Restricted evaluator material inspected: none
- Findings: none
- Checks: `node --test test/session-lifecycle.integration.test.ts` (4 passed),
  `node --test test/workflow.test.ts` (12 passed), and `git diff --check`
  passed; the full parallel `npm test` did not complete within the execution
  window and is deferred to implementation verification
- Measurement cutoff: immediately before this manifest update

## Run 002 — Design Map

- Skill: `design-map` v2
- Result: frozen-map checkpoint ready
- Input: frozen `spike.md`
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
  at committed provenance `9af63ce91780468b1626e258ac35edfaede88e4b`
- Output: `design-map.md`
  `sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`
- Restricted evaluator material inspected: none
- Checks: `node --test test/session-lifecycle.integration.test.ts` (4 passed),
  `node --test test/workflow.test.ts` (12 passed), and `git diff --check --
  spikes/011-host-owned-workflow-runs` passed before this manifest update
- Measurement cutoff: immediately before this manifest update

## Run 003 — Evaluator Prepare (bootstrap executor failure)

- Skill: `evaluator` v10 (prepare mode)
- Result: no evaluator revision created or frozen; preparation did not begin
- Frozen inputs: `spike.md`
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
  and `design-map.md`
  `sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`
- Bootstrap execution: the existing workflow runner allocated one Claude
  evaluator-preparation process (PID 22) and recorded it in its local state;
  the process became non-live with a zero-byte diagnostic log and produced no
  public evaluator artifacts. Its runner phase was finalized `failed` solely to
  preserve that terminal operational fact; it is not an evaluator revision,
  evaluation result, or methodology finding.
- Fallback: after confirming the original process was non-live, one direct
  Claude fallback was launched using `acceptEdits` and the declared sibling
  private evaluator workspace. It used no unrestricted permission bypass, then
  exited without output or evaluator artifacts. A preceding command-line
  argument parse error launched no worker and was corrected before this one
  fallback attempt.
- Classification: executor/infrastructure failure. The current bootstrap runner
  cannot represent an execution-attempt replacement independently of the phase
  outcome; that limitation is preserved as motivation for this spike, not
  repaired retroactively and not converted into a fabricated host-owned receipt.
- Restricted evaluator material inspected: none
- Measurement cutoff: immediately before this manifest update

## Run 004 - Evaluator Prepare

- Skill: `evaluator` v10 (prepare mode; no process exception for evaluator
  preparation - the frozen brief bootstrap exception covers only the Spike 011
  workflow runner dispatch path)
- Result: evaluator revision `001` frozen; pre-freeze integrity validation
  passed
- Frozen inputs: `spike.md`
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
  (`9af63ce`) and `design-map.md`
  `sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`
  (`3689964`)
- Public outputs: `eval-requirements.md`
  `sha256:16766fafeba18217e5a97b90de97079ab0447878b919705381a6f397fa9f9af7`;
  `coverage-map.json`
  `sha256:3dd7ef05391c28880896bffe7fa4ab8b4b3ed17443f05146d3e9a776f8345ec3`
  (21 criterion records AC01-AC21 + readiness attestation)
- Evaluation shape: 18 evaluator procedures (12 public executable regression
  materialized by the implementation's own visible suite per AC20, 4 static
  inspection, 2 provenance inspection); 0 evaluator-authored executable hidden
  tests - the frozen Design Map leaves the run surface as implementation
  freedom and the brief mandates visible coverage
- Pre-freeze integrity validation: PASS. Mechanical
  `tools/evaluator-integrity.ts` over the prepared coverage bundle returned
  `status: PASS` with empty diagnostics; a supplementary deterministic checklist
  covered physical file existence, content-hash recomputation, public/private
  consistency, and confirmed no verification attempt was allocated during
  `prepare`
- Controlled pre-implementation baseline: `npm test` 42/42; `npm run typecheck`,
  `npm run lint`, `npm run format:check`, `git diff --check` clean; no
  host-owned workflow-run mechanism exists at `52dc78e`
- Restricted evaluator material inspected: this cycle's own private bundle only
- Blocking questions: none
- Measurement cutoff: immediately before this manifest update
