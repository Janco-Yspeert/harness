# Spike 013a — Verification Feedback (attempt 006)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  source commit `fae05912f59f8ebdb8982ab16deb26e293754647`), per the frozen
  `spike.md` "Evaluator bootstrap and self-modification exception".
  `skills/evaluator/SKILL.md` from the working tree was confirmed
  byte-identical to this pin.
- Implementation evaluated: `feat/spike-013a` @ `5ff1a1bfc22a7e44bda19cf155c39903d7bd7feb`
  ("fix: bind evaluator hidden workspace explicitly"), implementation attempt
  `6`. `HEAD` (`c25f305`, "chore: allocate Spike 013a verification 8") adds
  only a `workflow.jsonl` allocation record on top of this commit.
- Frozen evaluator revision: `002` (unchanged from attempts 002-005; no
  evaluator correction was needed or performed this attempt).
- Canonical binding: `workflow.jsonl` `verification-allocated` attempt `8`
  (`implementationAttempt: 6`).
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`, bootstrap snapshot) all re-hashed and confirmed
  byte-identical to their frozen identities this attempt — no specification
  drift.

## Result

**FAIL — `IMPLEMENTATION_FAILURE`** on 3 mandatory acceptance criteria (AC08,
AC09, AC34). The other 32 criteria remain `SATISFIED`, re-confirmed fresh this
attempt.

This candidate added a new host endpoint, `POST /workflow-fixtures/lp1`, to
resolve the `spawn claude ENOENT` infrastructure limitation prior attempts
(002-005) hit while trying to construct the required live-Claude fixture. The
new mechanism does resolve that specific problem, but it introduces a new,
independently demonstrable defect that keeps AC08/AC09/AC34 unsatisfied, so
this is now a confirmed implementation failure rather than a continuation of
the earlier `BLOCKED`/infrastructure classification.

## Confirmed implementation failure

### LP1's fixture endpoint rejects every genuine canonical Spike 013a evaluator-verify parent

**Requirement:** a bounded, repository-owned, canonically-permitted
protected-evaluator-role allocation must be dispatchable through the Harness
host to the real Claude adapter, reaching a host-validated successful
evaluator-role disposition with no manual `/evaluator ...` invocation.
Required-executor unavailability is `BLOCKED`; any other failure to reach
that result is `FAIL`.

**Observed:** the new `allocateSpike013aLp1Fixture` host function requires its
parent run's `slot.workflow` field to equal the literal string `"013a"`
exactly. The repository's own committed canonical dispatcher,
`tools/workflow.ts`, can never produce that value for a real allocation: it
requires every spike argument to be the full suffixed spike path (e.g.
`spikes/013a-Workflow-execution-friction`), and derives `slot.workflow` from
that full path (`"013a-Workflow-execution-friction"`), never the bare
`"013a"` prefix. A genuine, canonically-authorized Spike 013a Claude
`evaluator-verify` parent allocation — built with the exact field values the
real dispatcher produces, and satisfying every other prerequisite the fixture
endpoint itself checks (canonical authority type, contract identity, delivery
mode, role, phase) — is rejected by `POST /workflow-fixtures/lp1` with HTTP
400 solely because of this `slot.workflow` mismatch. A parent built with the
literal short `slot.workflow: "013a"` (which no real dispatch call produces,
but which the candidate's own new test happens to use) is accepted. This was
confirmed directly, isolating `slot.workflow` as the sole variable, without
using any live Claude/Codex process.

This means the new fixture mechanism cannot be invoked by any allocation the
repository's own canonical dispatch tooling can ever produce, so the required
LP1 evidence remains unobtainable through this mechanism for AC08/AC09, and
AC34's dependent readiness demonstration remains unestablished as a
consequence.

## Safe diagnostics

- `resolveSpec` stores `slot: request.slot` verbatim (no canonicalization
  against the resolved spike directory), so the LP1 endpoint's exact-string
  check does not match the directory-prefix resolution the rest of allocation
  already relies on for the very same field.
- Separately, this candidate's other new host-only configuration value,
  `HARNESS_EVALUATOR_HIDDEN_WORKSPACE`, is read unconditionally by
  `resolvePermissionProfile` for every `evaluator` permission-profile
  allocation (not only Spike 013a's own), and `HARNESS_CLAUDE_EXECUTABLE` is
  likewise read unconditionally by `workflowProviderProgram` for every
  `executor: "claude"` backend construction. Under this evaluator's own real
  ambient environment (both variables present, as a genuine deployed
  evaluator session has), `npm test` regresses from 74/74 to 71/74; the 3
  newly-failing pre-existing tests neither reference nor guard against either
  variable. This does not by itself flip any of the 35 criteria (the frozen
  evidence each relates to remains intact via its own cited mechanism), but
  it is the same root cause as the confirmed failure above — host-only
  configuration consumed without being scoped to the one canonical allocation
  it was introduced for — and should be corrected in the same pass.

## Not part of this candidate

The same pre-existing, unrelated, uncommitted drift in
`spikes/011-host-owned-workflow-runs/workflow.jsonl` every prior attempt
(002-005) observed and excluded (a single line dated before this spike's
implementation began) was present again this attempt. It is not attributed to
this implementation.

## Next steps

Implementation retries against this same frozen evaluation (revision `002`).
Do not rerun `prepare`.
