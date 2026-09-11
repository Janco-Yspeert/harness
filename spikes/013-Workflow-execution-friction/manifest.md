# Spike 013 Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Input: candidate brief, normalized to `spike.md`
- Result: `Ready after minor clarification`
- Output: `feedback.md`
- Repository evidence inspected: public workflow authority, host-run and
  runner implementation, visible workflow tests, and public Spike 011/012
  recovery history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; relevant public-source and visible-test
  inspection.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Design Map

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:241a68feb8421ff4257581008da687dee8656e3cdba9159acfb4453278a893c6`
- Result: shared contract established
- Output: `design-map.md`
- Key decisions: host-issued run-bound delegated capability; authenticated role
  outcome separate from provider exit; host-bound immutable bootstrap evaluator
  authority; read-only dispatch preview.
- Checks: frozen brief identity/provenance and relevant public host, runner,
  authority, and visible-test contracts inspected; `git diff --check` passed.
- Measurement cutoff: immediately before this manifest update.
