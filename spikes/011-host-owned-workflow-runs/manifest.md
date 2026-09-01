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
