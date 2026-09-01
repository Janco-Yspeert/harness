# Spike 012 Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Input: `spike.md` at `git:b7f442aed5d5cfe2722aec40f2fab0eb059e2884`
- Result: `Ready to freeze`
- Output: `feedback.md`
- Repository evidence inspected: public workflow authority/runner and
  evaluator-integrity implementation, visible workflow/evaluator tests, and
  public Spike 011 recovery history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; relevant public-source and test inspection.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Design Map

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`
- Result: shared contract established
- Output: `design-map.md`
- Key decision: `correction-cycle-opened` and
  `evaluator-repair-recorded` are forward-only authority bindings; Spike 012's
  evaluator uses an exact committed pre-implementation skill snapshot as its
  operative instruction source.
- Checks: frozen brief provenance and relevant public workflow/evaluator
  contracts inspected; `git diff --check` passed.
- Measurement cutoff: immediately before this manifest update.

## Bootstrap Exception — Runner-State Adoption Gap

- Public authority already contained valid `brief-frozen` and
  `design-map-frozen` checkpoints before any local `.workflow/state.json`
  existed. The local runner cannot adopt them without fabricating history or
  repeating completed semantic roles.
- Authorized handling: remaining Spike 012 roles are allocated directly through
  the Harness host-owned workflow-run surface. `workflow.jsonl` remains the
  only methodology authority; no `.workflow` history was created.
- Evaluator-preparation execution `2662cb4a-dc2f-4192-919d-6c2f031f9f78`
  (Codex, bootstrap evaluator v10
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`)
  terminally failed before work when the installed Codex CLI rejected the
  obsolete bounded approval flag.
- Its host-owned replacement
  `86938621-621e-4479-af79-e35ae704cb13` (Claude, same evaluator authority)
  also terminally failed before work because the backend passed the prompt as
  an argument to Claude's variadic `--add-dir` option. Both run identities,
  terminal dispositions, and replacement provenance remain host records.
- The narrow workflow-backend compatibility repair is necessary before another
  host-owned evaluator execution can exist; it does not reconstruct runner
  state or change frozen methodology authority.
