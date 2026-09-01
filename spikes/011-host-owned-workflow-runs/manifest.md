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

## Run 005 - Implementation

- Skill: `implementation` v3
- Result: clean candidate on `feat/spike-011`; not independently verified
- Frozen inputs: `spike.md`
  `sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
  (`9af63ce`), `design-map.md`
  `sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`
  (`3689964`), public `eval-requirements.md`
  `sha256:16766fafeba18217e5a97b90de97079ab0447878b919705381a6f397fa9f9af7`
  and `coverage-map.json`
  `sha256:3dd7ef05391c28880896bffe7fa4ab8b4b3ed17443f05146d3e9a776f8345ec3`
- Change: the existing `startHarnessHost` runtime now owns a host-lifetime
  workflow-run registry (`src/workflow-run.ts`) beside its session state, with an
  HTTP surface (`POST/GET /workflow-runs`, `GET /workflow-runs/:id`,
  `GET /workflow-runs/:id/log`, `POST /workflow-runs/:id/cancel`,
  `POST /workflow-runs/:id/replace`), a test-substitutable workflow
  backend/factory seam (`createWorkflowBackend`), a bounded non-bypass local
  adapter (`src/workflow-backend.ts`), normalized lifecycle events on the
  existing `/events/ws` envelope, per-run diagnostic-log retention, host-derived
  accounting, and named `repo-local-worker` / `evaluator` permission profiles.
  `tools/workflow.ts` `--execute` is now an HTTP client of that surface: it
  spawns no detached worker, fails explicitly when no host is reachable, and
  binds a phase `complete` record to the terminal `completed` state of the
  canonical run allocated for that phase/attempt.
- Visible tests: new `test/workflow-run.integration.test.ts` (11 cases:
  client-detachment/inspection, run-record fields, duplicate/concurrent-start
  prevention, replacement ordering and provenance, lifecycle-event envelope
  reuse, diagnostic-log/non-canonical separation, bounded/named permission
  profiles, accounting, host co-location, and `tools/workflow.ts`
  completion-binding); `test/workflow.test.ts` gains an absent-host dispatch
  case and drops the superseded detached-job case
- Checks: `npm test` 53/53 pass; `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` clean
- Decisions within Design Map freedom: route names and JSON field spellings as
  above; duplicate allocation returns `200` with the existing run and
  `duplicate: true`; `randomUUID` run ids; in-memory per-run log buffer exposed
  at `/workflow-runs/:id/log`; replacement of an active run is one host
  operation that terminalizes the prior execution `replaced` before allocating
  the next attempt
- Known limitations: the real provider adapter is not exercised by the visible
  suite (per A3); AC14's routine-operation coverage is demonstrated as the
  bounded, non-interactive, non-bypass executor invocation the adapter builds
  plus the capability/workspace profile recorded on the run, not a live agent
  performing shell work; daemon-restart persistence is not implemented (not
  required)
- Restricted evaluator material inspected: none
- Measurement cutoff: immediately before this manifest update

## Run 006 - Evaluator Verify and Promotion

- Skill: `evaluator` v10 (verify mode)
- Result: PASS; technical verification complete, pending separate human product
  acceptance
- Immutable inputs: implementation
  `git:22c9d96db4eb2603494bb611a7ea02c5aaafc458`; evaluator revision `001`
  `sha256:dc34df32ab53996dd0cc965720359454928824035ca273986fa9068a6f474bbc`;
  frozen brief, Design Map, and public requirements identities matched their
  committed provenance
- Verification attempt: `001`, finalized PASS. All 18 frozen procedures passed:
  12 visible executable regression procedures, 4 static procedures, and 2
  provenance procedures; all 21 required acceptance criteria were satisfied
- Checks: `npm test` (53 passed), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `git diff --check`, and the protected-spike provenance
  diff all passed
- Promotion: complete. The passing attempt ledger/result and the complete safe
  evaluator revision `001` were archived byte-for-byte under `evaluation/`;
  `evaluation/promotion.json` records identities and the copied disposition
- Restricted evaluator material inspected: this cycle's frozen private bundle
  only; eligible frozen artifacts were promoted after PASS
- Measurement cutoff: immediately before this manifest update
