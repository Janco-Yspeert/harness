# Verification Feedback — attempt 003 (candidate H2)

- Candidate H2: `d4b7975d1bc52ce1f029acc5aba4dd9855ae9743`.
- Evidence commit H2E: `2604e0590f513c33d7ce05398423d3dc338ad1d5`, bound by
  D7 rules 1–5.
- Evaluator revision: `001`.
- Result: **FAIL**, `IMPLEMENTATION_FAILURE`.

## Violated public requirement

- `design-map.md` D4, "Fail closed" and "Adapter eligibility".
- `spike.md` AC03 and AC06.

D4 says that if a nested provider sandbox cannot start inside the wrap, the
allocation is refused before any session exists, with a public diagnostic
(`provider-config-invalid` or `permission-denied`). If Codex cannot run inside
the wrap, the pre-authorized Claude substitution applies.

## Expected behavior

Under H2 containment, an external-project Codex public worker does one of two
things:

- It starts its own nested sandbox and proceeds with Brief Readiness.
- Or the host detects that the nested provider sandbox cannot start and
  refuses the allocation before any session exists, with a public
  diagnostic, so that the run stops at preflight.

Both paths leave D4 containment unweakened.

## Observed behavior

- The committed H2E evidence records that the real Codex public worker failed
  to build its nested bubblewrap sandbox inside Harness containment
  (`Read-only file system`). This happened before any repository access.
- Sessions were created, and two Stockdif allocations were used: Brief
  Readiness and one automatic retry. Each ended `blocked`/`NOT_READY`. The
  canary stopped with `kernel.continuation-stopped`.
- The evidence names this a Harness runtime defect.
- H2's pre-launch containment check only proves that the outer namespaces
  can be created. Nothing checks that the provider's nested sandbox can start
  inside the wrap, and the namespace root is read-only.
- A diagnostic reproduction through H2's containment seam, with a placeholder
  program and no real provider, gave these results:
  - a nested sandbox that binds only existing paths starts;
  - a nested sandbox that must create a new mount point fails with a
    read-only file system error.

## Safe diagnostics

- All frozen executable containment, root-separation, origin/publication and
  unchanged-methodology checks pass on H2.
- `npm run check` passes on a clean clone of H2: 187/187 tests.
- The earlier H1 operator preflight failure is resolved. The operator's H2
  preflight is recorded as passing.
- A correction must not weaken D4. Both remedies above are acceptable. The
  refusal path keeps the Claude substitution available.

## Evidence-record notes (operator evidence, not implementation)

These must be corrected in the next evidence commit.

- `evidence/index.json` `artifacts` must list every other file in
  `evidence/`. The inherited `preflight.md` is not listed.
- Unavailable usage must be written as `"unknown"`, not `"unavailable"`.
