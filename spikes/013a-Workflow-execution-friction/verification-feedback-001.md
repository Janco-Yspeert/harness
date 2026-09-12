# Spike 013a — Verification Feedback (attempt 001)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 013a
  bootstrap evaluator contract `evaluator` v11
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  source commit `fae05912f59f8ebdb8982ab16deb26e293754647`), per the frozen
  `spike.md` "Evaluator bootstrap and self-modification exception".
  `skills/evaluator/SKILL.md` from the working tree was confirmed
  byte-identical to this pin and was not separately consulted.
- Implementation evaluated: `feat/spike-013a` @ `33fa7c44adfab2164a07d949431857f620e0a816`
  ("feat: bind workflow roles to semantic outcomes"), implementation attempt
  `1`.
- Frozen evaluator revision: `002`
  (`sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`).
  Revision `001` was corrected mid-attempt to fix an evaluator construction
  defect in one hidden case; the correction did not change any acceptance
  requirement, and both revisions reach the same conclusion for the affected
  criteria.
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`) all byte-identical to their frozen identities — no
  specification drift.

## Result

**FAIL — `IMPLEMENTATION_FAILURE`** on 13 mandatory acceptance criteria.
**BLOCKED** on 2 further mandatory criteria for a reason traceable to one of
those same failures. All other criteria pass.

## Confirmed implementation failures

### 1. Deterministic contract resolution is not implemented (AC01, AC02, AC03)

**Requirement:** every governed workflow-role allocation must
deterministically resolve to the repository-owned contract intended for that
role; where a frozen/versioned contract is required, the run record must
identify its exact identity; Harness must record how the contract was
delivered, and provider prose is not sufficient authority for that record.

**Observed:** the host performs no independent resolution or verification of
which contract governs an ordinary role. It accepts and stores whatever
string the caller supplies as the "skill" for the role, with no lookup
against any repository contract, canonical authority, or skill registry. A
request claiming a completely nonexistent contract name is accepted exactly
like a request claiming a real one, and a request omitting it entirely is
also accepted. This was confirmed both through direct inspection of the
allocation path and through a real, live workflow-run dispatched to the
Codex executor through a running Harness host.

### 2. Protected evaluator-role delegation does not generalize from canonical authority (AC05)

**Requirement:** a valid Harness evaluator-role allocation — one legally
permitted by that workflow's own canonical authority — can authorize the
protected evaluator role.

**Observed:** a freshly and genuinely canonically-authorized fixture
workflow (real frozen brief, design map, and evaluation-prepared checkpoint,
plus its own valid pinned-evaluator-authority declaration) was refused
delegated evaluator authority. The implementation authorizes exactly two
hardcoded workflow identifiers rather than validating the requesting
workflow's own canonical authority in general.

### 3. Codex contract characterization is not implemented (AC10, AC11, AC25)

**Requirement:** a real Codex execution must record which exact contract
governed the run and how it was delivered, independent of Codex's own
claims; this must be equivalent in kind to what a Claude execution records;
the run record must expose this delivery mode.

**Observed:** for the same reason as (1), a live, real, correctly-sandboxed
Codex execution's run record carried an unverified, caller-supplied contract
name and exposed no field recording how that contract was delivered,
distinct from the field recording who authorized the allocation.

### 4. A genuinely blocked execution cannot be retried (AC22, AC35)

**Requirement:** when canonical authority still requires a phase and its
prior host-owned execution ended in a non-successful disposition, a fresh
execution attempt for that same phase must be allocatable without deleting
or rewriting the earlier record.

**Observed:** a phase whose only real execution attempt ended `blocked` is
permanently refused any further real dispatch, with the error "already been
dispatched" — for every phase other than `implementation` and
`evaluator-verify`, the execution-attempt counter never advances.

### 5. Authority status still hides an available transition (AC27, AC28)

**Requirement:** authority status must distinguish a transition that is
unavailable from one that is available but requires further evidence; a
repairable human-rejection state must expose the correction-cycle transition
as available even before its evidence is supplied.

**Observed:** unchanged from before implementation — a repairable-rejection
state that permits correction (`correctionPermitted: true`) still omits the
correction-cycle transition from the set of transitions reported as
available.

### 6. Unattended progression is not achieved (AC33, AC34)

**Requirement:** once a routine governed role has been legitimately
allocated, the execution path must reach its semantic outcome without the
human translating that allocation into provider-specific invocation
instructions.

**Observed:** a real, correctly-sandboxed, successfully completed Codex
execution's semantic role result stayed unresolved (`"pending"`)
indefinitely; nothing in the implementation observes the real process
output and determines or reports the outcome. An external actor still has
to manually submit the result. This is the same class of manual bridging the
brief's central problem statement describes, moved to a different step
rather than removed, and it directly means Spike 011 Cycle 002 is not yet
retryable without manual intervention either.

## Blocked criteria

**AC08, AC09 (Claude delegated evaluator execution): BLOCKED**, not `FAIL`
and not passed via a substitute. The required live-provider fixture must be
a bounded, repository-owned target distinct from real production spikes.
Because of failure (2) above, the only workflow identifiers that can receive
delegated evaluator authority under this implementation are the two real,
already-meaningful spikes it hardcodes — there is no way to construct the
required safe, isolated fixture. Dispatching a real, broadly-writable Claude
session against either real spike was judged too risky to attempt and was
not run. This block is a direct consequence of failure (2); resolving it
should resolve this block.

## What already works

Deterministic contract resolution aside, the following hold up under direct
and, where required, live testing: dispatch inspection no longer consumes an
execution attempt; a fresh/restarted runner correctly adopts already-frozen
canonical checkpoints without fabricating local history; a host-unreachable
dispatch failure remains cleanly retryable; provider process completion is
durably kept separate from methodology-role success (a completed process
does not, by itself, ever read as a successful role); a role result is
validated against the host-owned execution binding before acceptance;
explicit human evaluator invocation remains valid; ordinary agents cannot
opportunistically claim the evaluator role by prompt wording; run dispatch
exposes identity/role/executor and is followable to a terminal state; and
the pinned pre-implementation evaluator authority now correctly generalizes
to Spike 013a's own evaluator phases (previously specific to Spike 012).

## Safe diagnostics

- `attemptForDispatch()` (governs retry eligibility) is unchanged for any
  phase other than `implementation`/`evaluator-verify`.
- The `authority status` transition-availability computation is unchanged.
- The workflow-run allocation path stores a caller-declared "skill" value
  verbatim with no independent verification step for ordinary roles.
- The protected-evaluator-role authorization path checks the requesting
  workflow identifier against exactly two literal values rather than that
  workflow's own canonical authority.
- No component was found that observes a real provider process's actual
  output and determines or reports a semantic role result on its own; the
  `/workflow-runs/:id/result` reporting endpoint exists and correctly
  validates a submitted result against the run's binding, but nothing calls
  it automatically.

## Not part of this candidate

An uncommitted working-tree modification to
`spikes/011-host-owned-workflow-runs/workflow.jsonl` was observed at verify
time, predating this spike's own workflow entirely and not part of the
evaluated commit or any commit. It is not attributed to this implementation
and did not affect this result, but is flagged for separate attention since
its content is exactly the kind of change spike.md asks this spike not to
make to Spike 011 during its own implementation or verification.

## Next steps

Implementation retries against this same frozen evaluation (revision `002`).
Do not rerun `prepare`.
