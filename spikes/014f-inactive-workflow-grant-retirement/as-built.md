# As-Built — 014f Inactive Workflow Grant Retirement

Inspected implementation: `af75b14d1847af02404a591a8829751dc8df2a2e`.
Verification: attempt 009, evaluator revision 002, PASS; all 11 mandatory
executable procedures passed, both non-executable procedures were satisfied,
and AC01–AC08 were satisfied. The host promotion record matches the bound
identity `sha256:d283a7ffb58a9c9a227783148f1a7f63249443377aef1943986b4b218583c7e5`
and is already committed with those exact bytes.

## Implemented shape

- `ExecutionKernel.retireWorkflowGrant(workflow, { workflowGrant, reason })`
  runs under the existing per-workflow transaction. It validates a non-empty
  grant identifier and non-blank reason, resolves the grant in the named
  workflow, and refuses unknown, already retired, or already revoked grants.
- Eligibility is derived from the existing execution model. Retirement is
  refused while any execution owned by the grant is `allocated` or `running`,
  or while any owned execution has an unresolved human request. Refusals append
  no retirement event.
- Successful retirement appends exactly one
  `kernel.workflow-grant-retired` event with `{ workflowGrant, origin:
  "human", reason }`. It creates no execution, role allocation, session, or
  successor grant and does not modify the original grant or prior execution
  history. The event is classified as ledger mechanics, so it does not move
  the methodology authority basis.
- The existing permanent-revocation lookup is the shared grant-liveness check
  for both `kernel.workflow-grant-revoked` and
  `kernel.workflow-grant-retired`. `inspect` returns a retirement-specific
  denial and `allocate` throws the same permanent-retirement reason before
  creating work. Manual and automatic continuation, retry, and replacement
  therefore fail through the existing inspect/allocation paths. Ledger replay
  reconstructs this state after restart; there is no separate cache or
  persistence mechanism.
- `POST /governed/<workflow>/grant-retirements` is the sole host writer. It is
  protected by the existing root bearer-token boundary and returns HTTP 201
  with the retirement evidence. Invalid or ineligible requests use the host's
  existing 409 error envelope. `GET` on the same root-only operation lists the
  workflow's retirement evidence.
- Retirement is scoped to the exact grant. A repeat request is refused without
  a duplicate event, while an independently issued successor grant retains its
  ordinary allocation and execution behavior. Unused budget on the retired
  grant remains historical and is neither consumed nor transferred.
- Focused visible tests cover active-execution and unresolved-request refusal,
  invalid input, append-only/non-consuming retirement, repeat refusal,
  inspect/allocation/retry denial, restart persistence, successor operation,
  root-only host access, evidence listing, and refusal before continuation
  allocation. The promoted evaluator archive records the accepted independent
  verification of the exact candidate.

## Comparison to the frozen contract

**Missing**

None found.

**Contradictory**

None found.

**Extra**

None found.
