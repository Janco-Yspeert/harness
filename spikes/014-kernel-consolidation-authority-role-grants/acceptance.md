# Human Acceptance — Spike 014

## Decision

**REJECTED / SUCCESSOR REQUIRED**

The canonical verification attempt `1` remains a genuine `PASS`: all 35
frozen Spike 014 acceptance criteria were recorded `SATISFIED`, evaluator
revision `001` was promoted, and As-Built completed.

This human rejection does not rewrite or downgrade that technical verification.
It records defects found during acceptance review after the frozen evaluator had
completed, together with an evaluator-coverage gap that allowed those defects to
pass undetected.

## Material findings

### 1. Configured evaluator result semantics drift from the active methodology

`methodologies/harness/contracts/evaluator-verify.json` permits
`SPECIFICATION_DEFECT`, but the active evaluator/legacy authority vocabulary is
`SPECIFICATION_AMBIGUITY` and `SPECIFICATION_DRIFT`. The new governed path has
no translation layer, so a legitimate evaluator result using either active
classification can be rejected by `ExecutionKernel.result()`.

The configured result contract also does not preserve the established
cross-field invariant that `PASS` carries no failure classification and every
non-`PASS` verification result carries a valid classification. A structurally
allowed but semantically incomplete result can therefore be accepted as a Role
Result and then fail to match any configured outcome.

Classification: `IMPLEMENTATION_GAP`.

### 2. Non-equivalent in-flight authority can be misreported as a duplicate

After resolving a Role Grant, `ExecutionKernel.allocate()` currently returns an
arbitrary active execution under the same Workflow Execution Grant as
`duplicate: true` without first proving that the active execution is bound to
the same resolved Role Grant/allocation semantics.

Equivalent continuation should deduplicate. Different resolved authority must
not be silently collapsed into the existing execution.

Classification: `IMPLEMENTATION_GAP`.

### 3. Automatic continuation failure can disappear without an observable stop

`GovernedHost.#continue()` performs its internal continuation request as a
fire-and-forget `fetch(...).catch(...)`. HTTP non-success responses do not
reject `fetch`, so a failed follow-on allocation can end automatic continuation
without recording or surfacing the failure as a durable stop/gate/attention
condition.

The frozen brief required bounded automatic continuation and explicit
stop/escalation behavior. A failure to continue must remain observable.

Classification: `IMPLEMENTATION_GAP`.

### 4. The frozen evaluator did not falsify these failure modes

Verification attempt `1` correctly exercised the frozen cases it prepared, but
its coverage for configured policy/contracts and continuation/idempotency did
not include the negative cases above. The manual AC06/AC07 inspection established
that configuration replaced hard-coded phase logic, but did not verify that the
configured evaluator vocabulary faithfully represented every valid evaluator
outcome. The AC27 continuation coverage proved equivalent deduplication, but did
not test an active non-equivalent Role Grant.

The As-Built `ALIGNED` conclusion consequently missed these material defects.

Classification: `EVALUATOR_COVERAGE_DEFECT`.

## Non-blocking deferred concerns

The following were noticed during human review but are **not** reasons for this
rejection and are not retroactively added to Spike 014's frozen contract:

- `src/kernel/execution.ts` and `src/kernel/host.ts` concentrate substantial
  conditional/state-machine complexity; readability refactoring is desirable
  but not acceptance-critical.
- the on-disk writer lock identifies its owner only by PID, so PID reuse can
  theoretically make a stale lock appear live after restart;
- production provider adapters, richer executor routing, distributed locking,
  and broader transport/controller cleanup remain follow-on work.

## Disposition

Preserve the complete Spike 014 evidence chain unchanged:

- implementation candidate
  `309d87ba2e1833c0bb9dade338794ec863a3d2df`;
- evaluator revision `001`, attempt `1`, genuine `PASS`;
- promoted evaluation evidence;
- As-Built.

Do not open a normal correction cycle under the frozen Spike 014 contract.
A successor Spike 014a may repair the defects above and separately introduce
new hardening/cutover requirements discovered during human review. Those new
requirements are not classified here as Spike 014 failures.
