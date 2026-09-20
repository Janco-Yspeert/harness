# Spike 014a — Kernel Hardening: Bounded Continuation, Supersession, and Authority Cutover

## Status and relationship to Spike 014

Spike 014 established the intended governed-execution kernel architecture and
independently satisfied its frozen evaluation contract at implementation
candidate:

`309d87ba2e1833c0bb9dade338794ec863a3d2df`

Evaluator revision `001`, verification attempt `1`, recorded a genuine
`PASS` with all 35 frozen criteria satisfied. Promotion and As-Built completed.

Human acceptance subsequently rejected Spike 014. The rejection preserves that
technical evidence. It identified three implementation defects and an evaluator
coverage defect that were not caught by the frozen evaluator.

Spike 014a is the corrective successor. It has two responsibilities:

1. repair the material implementation defects found during Spike 014 human
   acceptance review; and
2. add a small set of authority-cutover and safety requirements that were
   discovered only after the Spike 014 architecture could be inspected and
   reasoned about as a whole.

The second category is **new Spike 014a scope**. It must not be described as
something Spike 014 failed to implement when its frozen brief did not require it.

Spike 014a must preserve the core Spike 014 architecture. This is hardening and
cutover, not another kernel redesign.

The predecessor human decision is recorded in:

`spikes/014-kernel-consolidation-authority-role-grants/acceptance.md`

---

# Question

Can Harness preserve the Spike 014 generic authority/grant/execution kernel
while closing the discovered semantic defects, bounding automatic correction
work, enforcing one active governed execution, supporting explicit
supersession and inline role adoption, and moving promotion and new human
methodology decisions onto the governed host path?

---

# Architectural baseline to preserve

The following Spike 014 boundaries remain authoritative design direction:

- one canonical Authority Ledger;
- one generic authority resolver over configured methodology;
- content-addressed Methodology Definitions;
- explicit Workflow Execution Grants;
- immutable Role Grants;
- attached and spawned execution under the same grant semantics;
- monotonic exposure provenance;
- separate process, semantic-result, methodology-result, and host-action facts;
- structured waiting for human;
- bounded forward-only root authority;
- idempotent allocation by stable authority semantics;
- durable execution identity;
- host-mediated privileged actions;
- non-authoritative telemetry and executor-selection seams;
- no Harness phase names or spike-specific branches in the generic kernel.

Spike 014a must not reintroduce local `.workflow` state as authority, recreate a
kernel `ROLE_CONTRACTS` table, or hard-code Harness role/classification names
into generic execution mechanics merely to fix the issues below.

---

# Part I — Inherited Spike 014 defects to correct

These are defects identified by human acceptance review. They are not new
acceptance semantics.

## 1. Evaluator result-contract fidelity

The configured `evaluator-verify` contract must faithfully represent the active
Harness evaluator methodology.

The active verification classifications are:

- `IMPLEMENTATION_FAILURE`
- `EVALUATOR_DEFECT`
- `SPECIFICATION_AMBIGUITY`
- `SPECIFICATION_DRIFT`
- `INFRASTRUCTURE_FAILURE`

The current configured contract must not substitute a different vocabulary such
as `SPECIFICATION_DEFECT` unless an explicit, tested normalization layer exists
outside generic kernel semantics.

Verification result validation must also preserve these cross-field invariants:

- `PASS` carries no failure classification;
- every non-`PASS` verification result carries exactly one valid
  classification;
- a result that violates the pinned role contract is rejected before it becomes
  an accepted semantic Role Result;
- every valid verification result maps to an explicit configured transition or
  explicit configured stop/gate. It must not be accepted and then silently fail
  to match any methodology outcome.

The generic kernel may support declarative cross-field result constraints, a
pinned role-specific validator, or another small generic mechanism. The fix must
not encode evaluator-specific strings directly in generic kernel conditionals.

## 2. Equivalent deduplication only

Repeated/concurrent continuation may return an existing execution as a duplicate
only when the existing execution is bound to the same resolved Role Grant /
allocation semantics.

An active execution under the same Workflow Execution Grant but a different
resolved Role Grant must never be returned as `duplicate: true`.

If Harness currently permits only one active governed execution for that
workflow, a non-equivalent allocation request must produce a clear conflict,
gate, or supersession requirement instead.

## 3. Automatic continuation failure must remain observable

Host-owned automatic continuation must not fail silently.

A follow-on continuation attempt that cannot proceed because of, for example:

- no eligible executor;
- an allocation conflict;
- exhausted retry/correction authority;
- a denied Role Grant;
- a transport/internal host error;

must leave a durable or otherwise reliably inspectable host/kernel fact that
explains why automatic continuation stopped.

A fire-and-forget HTTP request whose non-success response is ignored does not
satisfy this requirement.

A caller disconnect must remain irrelevant to host-owned continuation.

---

# Part II — New Spike 014a hardening and cutover requirements

The requirements in this section are new successor scope. They are deliberately
not part of the Spike 014 rejection classification.

## 4. Separate operational retry from semantic correction/re-entry

Harness must distinguish:

**Operational retry**

A provider/process/transport execution failed or was interrupted and policy
permits another execution of the same governed role.

**Semantic correction/re-entry**

A completed semantic result changes methodology flow back through implementation,
evaluator repair, or verification again.

These are not the same budget.

Role retry policy may continue to use explicit retry limits. For this iteration,
the configured role retry allowance is scoped to the Workflow Execution Grant
and role. Creating a new Workflow Execution Grant restores the configured retry
allowance; retry consumption must not become a project-lifetime/global counter.

## 5. A Workflow Execution Grant bounds automatic semantic work

Workflow policy answers:

> What may logically happen next?

A Workflow Execution Grant answers:

> How far may Harness follow that policy automatically without returning to the
> human?

A Workflow Execution Grant must therefore carry or bind a finite automatic-work
budget capable of preventing unbounded semantic correction loops.

The exact representation is Design Map freedom. It may be per-role,
per-correction-route, per-cycle, or another compact model, provided that it can
mechanically prevent a loop such as:

implementation → verify → implementation → verify → evaluator repair → verify
→ implementation → ...

from continuing indefinitely under one human grant.

Budget exhaustion must produce a human-visible gate/stop rather than silently
ending or automatically minting more authority.

A new Workflow Execution Grant represents new human authority and receives a
fresh automatic-work budget.

`maxAllocations` may remain as a coarse absolute fuse. It is not sufficient by
itself if it allows an unexpectedly expensive semantic correction loop.

## 6. One active governed execution lease per workflow

For the current Harness product, a workflow may have at most one non-terminal
governed execution holding Role Grant authority at a time.

This is an execution-authority rule, not a process-count rule.

Supervisory/orchestrator contexts do not consume this lease merely by existing.
A supervisor consumes the lease only while it has adopted a Role Grant and is
performing a governed role inline.

The current supported shapes therefore include:

- supervisor + one separate governed worker;
- supervisor + one attached evaluator/implementation worker;
- supervisor temporarily adopting one governed Role Grant itself.

The current product does not support two simultaneous governed role executions
for the same workflow.

## 7. Distinct Workflow Execution Grants require reconciliation, not deduplication

A running execution under Workflow Execution Grant A must never be treated as a
duplicate of authority resolved under Workflow Execution Grant B.

Creating a newer Workflow Execution Grant does not by itself terminate or
supersede an older active execution.

Without explicit supersession authority:

- the old execution remains inspectable;
- the new allocation is blocked/gated while the old governed execution remains
  active;
- Harness must expose enough execution/grant/session/process state for the human
  or supervisor to understand what is still running.

## 8. Explicit supersession

A human may explicitly create or authorize a new Workflow Execution Grant that
supersedes prior active workflow execution authority.

Supersession must be durable and ordered safely:

1. validate the exact prior Workflow Execution Grant/execution being superseded;
2. record the new superseding authority or supersession fact canonically;
3. make the old governed execution ineligible to submit further accepted
   semantic results or privileged host actions;
4. terminate or reconcile the old provider process/session as applicable;
5. record the resulting process/lifecycle fact;
6. only then allow a new non-equivalent governed execution to start.

If the old provider does not terminate promptly, its authority is still
superseded. Late result/action requests from it must be mechanically rejected.

Supersession must not rewrite the old execution's historical result, grant,
process history, or evidence.

## 9. Supervisory sessions may adopt a governed role inline

A persistent supervisory/orchestrator context may temporarily become the worker
for an eligible Role Grant without spawning another provider process.

Conceptually:

supervisor → attached Role Grant → governed execution → terminal → supervisor

The same underlying session/context may continue supervisory activity after the
governed execution becomes terminal.

Inline adoption is not a bypass. While the session holds the Role Grant:

- it occupies the single active governed-execution lease;
- it receives only the workspaces/capabilities/host actions granted to that
  role;
- normal role-result and host-action rules apply;
- monotonic exposure provenance applies;
- forbidden exposure can make the supervisor ineligible for the requested role.

A supervisor that has received evaluator-private exposure must not be able to
adopt an implementation Role Grant where the configured implementation contract
forbids that provenance.

This mechanism is the foundation for a future low-ceremony “fix inline” action.
A narrow attached-only, single-role, non-continuing Workflow Execution Grant may
be used for a small human-authorized fix without spawning another model.

There is no ungoverned “just edit it” authority mode in this spike.

## 10. Promotion becomes a host-mediated configured action

Spike 014 explicitly did not require full promotion migration. Spike 014a does.

The evaluator remains responsible for the semantic judgment that an exact
verification attempt/revision has passed and is eligible for promotion.

The evaluator must not directly gain unrestricted publication/promotion
authority merely because it reached PASS.

Instead, a Role Grant may authorize a structured host promotion action binding
the exact source evidence/revision/attempt and permitted destination/scope.

The host must mechanically validate the request and perform the promotion using
host-owned authority. It must durably expose:

- action/request identity;
- Role Grant/execution identity;
- exact source evaluator revision and passing attempt;
- relevant source identities;
- destination/scope;
- promotion result;
- resulting identities or integrity outcome.

Promotion failure is a host-action failure. It must not retroactively rewrite a
genuine semantic verification PASS.

The generic kernel must not contain a phase-specific
`if role === evaluator-verify then promote` branch. Promotion should use a
generic/configured host-action seam, with publication remaining another concrete
host action.

## 11. New human acceptance/rejection must use the governed authority path

Historical `legacy-workflow.ts` authority interpretation may remain for
historical compatibility, old-cycle diagnostics, and explicitly supported
legacy operations.

It must cease to be an independent authority oracle for new human acceptance or
rejection decisions once the Spike 014a cutover is active.

A human acceptance/rejection decision must:

- bind the relevant workflow/cycle/candidate evidence;
- be validated against the pinned configured methodology/current canonical
  authority;
- be recorded as forward canonical authority;
- remain distinct from evaluator PASS and As-Built;
- preserve rejection findings/classification where applicable.

The exact host/API representation is Design Map freedom. This requirement does
not require a polished human UI.

## 12. Predicate semantics must be explicit

The narrow declarative policy interpreter must define the semantics of its
operators, especially `after`.

For Spike 014a:

> `event A after event B` is false when no matching B exists.

Policy that requires different missing-anchor behavior must express that
explicitly with `any`, `not`, or another configured predicate rather than
depending on `findLastIndex(...) === -1` as accidental language semantics.

The visible suite must lock this behavior down.

---

# Evaluation requirements

Spike 014a evaluation should be substantially narrower than Spike 014. It should
evaluate the successor delta and protect the established kernel invariants, not
repeat a 35-criterion architectural discovery exercise.

The evaluator must include implementation-independent negative cases for the
human-review defects. Manual inspection alone is not sufficient for result
vocabulary fidelity, deduplication identity, continuation failure handling, or
supersession.

At minimum, evaluation must prove the following acceptance criteria.

## Acceptance criteria

**AC01 — Spike 014 history preserved**

The Spike 014 candidate, PASS, promotion, As-Built, and human rejection remain
immutable historical evidence. Spike 014a does not rewrite them into a failed
verification or accepted predecessor.

**AC02 — Active evaluator vocabulary is representable**

Every valid active evaluator-v11 verification classification can traverse the
configured `evaluator-verify` result contract without ad-hoc kernel knowledge.

**AC03 — Verification cross-field invariants**

PASS-with-classification and non-PASS-without-valid-classification are rejected
before becoming accepted semantic Role Results. Every valid verification result
has an explicit configured next transition or stop/gate.

**AC04 — Equivalent continuation deduplicates**

Concurrent/repeated continuation for the same Workflow Execution Grant and same
resolved Role Grant returns one allocation/execution.

**AC05 — Non-equivalent continuation does not deduplicate**

A different resolved Role Grant cannot be reported as a duplicate merely
because another execution under the same Workflow Execution Grant is active.

**AC06 — Failed automatic continuation is observable**

A host-owned automatic continuation failure produces durable/inspectable stop,
gate, attention, or failure evidence and cannot disappear as an ignored HTTP
non-success.

**AC07 — Semantic automatic work is bounded per Workflow Execution Grant**

A configured cyclic correction route cannot execute indefinitely under one
Workflow Execution Grant. Exhaustion reaches a human gate.

**AC08 — New Workflow Execution Grant receives fresh bounded authority**

A new human Workflow Execution Grant restores its configured operational retry
allowances and receives a fresh semantic automatic-work budget. Prior WEG usage
does not silently consume the new grant's budget.

**AC09 — Single active governed execution**

A workflow cannot hold two non-terminal governed Role Grant executions at once.
Supervisory sessions that hold no Role Grant do not consume this lease.

**AC10 — Explicit supersession is safe**

A new WEG without supersession cannot silently coexist with or deduplicate
against an old active execution. Explicit supersession records new authority
before invalidating the old execution; late semantic results/host actions from
the superseded execution are rejected; new governed work starts only after the
old execution has been terminated or reconciled.

**AC11 — Supervisor inline role adoption**

An eligible already-running supervisory session can adopt an attached Role Grant,
perform one governed role, reach terminal state, and then remain usable as a
supervisor without spawning a replacement provider for that role.

**AC12 — Exposure still constrains inline adoption**

A supervisor/session with evaluator-private exposure is denied inline
implementation adoption when the implementation contract forbids that
provenance.

**AC13 — Promotion is host mediated**

A genuine evaluator PASS can request only the promotion action permitted by its
Role Grant. The host validates and performs exact promotion, records the action
result and resulting identities, and the executor does not require unrestricted
direct promotion/publication authority.

**AC14 — Promotion failure does not rewrite semantic PASS**

A failed or denied promotion remains distinct from the evaluator's semantic
verification result, and configured methodology decides what may happen next.

**AC15 — New human decisions use configured authority**

Human acceptance/rejection after the cutover is validated/recorded through the
new configured authority path rather than an independent legacy state-machine
oracle.

**AC16 — Predicate language semantics are deterministic**

`after` requires its anchor to exist; visible regression coverage proves the
missing-anchor case and the affected Harness policy remains behaviorally
correct.

**AC17 — Existing kernel regressions remain green**

The full visible suite, including Spike 014's real-boundary tests, remains green.
No fix may restore duplicate local-state authority, hard-coded Harness role
logic, or weakened evaluator-private exposure.

---

# Required regression scenarios

The visible/evaluator suite should include at least these concrete scenarios.

### R1 — Verification classification fidelity

For each active evaluator classification, submit the corresponding valid
non-PASS result through the governed result path and prove it is accepted and
routed according to configured methodology. Prove PASS + classification and
non-PASS without classification are rejected.

### R2 — Changed resolved authority while active

Allocate Role Grant A. While its execution is active, change the canonical/input
basis such that resolution yields Role Grant B. A continuation request for B
must not return execution A as a duplicate.

### R3 — Automatic continuation cannot launch next role

Complete a role such that policy permits continuation, then make the next
executor unavailable or otherwise cause allocation to fail. Prove an observable
durable stop/gate/failure fact remains.

### R4 — Correction loop fuse

Configure a deterministic implementation/verification correction loop and a
small WEG semantic-work budget. Prove the loop stops at the configured boundary
and requires new human authority.

### R5 — Fresh WEG

Exhaust a WEG's retry/correction budget. Create a new WEG. Prove its configured
budgets begin fresh and do not inherit the exhausted counters.

### R6 — Active execution conflict

With one governed worker active, attempt a different Role Grant under the same
or another WEG without supersession. Prove no second governed execution starts.

### R7 — Supersession

Start a real external governed worker under WEG A. Create WEG B with explicit
supersession. Prove A is durably superseded, a late A result/action is denied,
the old provider is terminated/reconciled, and only then B can execute.

### R8 — Inline implementation adoption

Register/retain a clean supervisor-like attached session. Give it a narrow
implementation-only WEG/Role Grant. Prove the same session performs the role and
later remains usable after the execution is terminal.

### R9 — Inline adoption exposure denial

Give the same kind of session evaluator-private exposure first. Prove
implementation Role Grant resolution/allocation is denied.

### R10 — Host promotion

Use a bounded local evaluator-evidence fixture. A governed evaluator PASS requests
promotion through the host. Prove exact-source validation, host-performed
promotion, resulting identity checks, and no unrestricted direct executor
promotion authority.

### R11 — Human decision cutover

At a state ready for acceptance, record acceptance/rejection using the new
authority path. Prove legacy local state and legacy execution completion flags
cannot independently change legality.

### R12 — Missing `after` anchor

Prove `A after B` is false when B never occurred and true only for qualifying A
events after an existing B.

---

# Real-boundary evidence

At least these successor boundaries must cross supported host/process/filesystem
interfaces rather than being proved only by in-memory method calls:

1. supersession of a real running external governed worker, including denial of
   a late request from the superseded execution;
2. inline role adoption by an already-running attached session/context;
3. host-mediated promotion of exact evaluator evidence into a bounded local
   promoted destination.

Implementation-independent deterministic tests may cover budget/predicate/result
mechanics around those live proofs.

---

# Implementation and design freedom

The Design Map may choose:

- exact WEG budget schema;
- whether semantic budget is per role, correction route, or another small
  deterministic representation;
- supersession record shape;
- whether supervisor identity needs a new explicit durable type or can remain a
  session without active Role Grant;
- exact generic host-action registry/handler shape;
- exact promotion request/result schemas;
- how cross-field result constraints are represented generically;
- exact durable continuation-stop/attention record shape.

Those choices must preserve the semantics above.

Prefer small named predicates/helpers when repairing dense authority conditions,
but do not make broad readability refactoring part of acceptance unless required
to implement the semantics safely.

---

# Non-goals

Spike 014a does **not**:

- redesign the Spike 014 kernel;
- add simultaneous multi-role execution;
- build a general scheduler or worker pool;
- implement automatic model routing or full cost optimization;
- implement a polished supervisor UI;
- implement a general secrets manager;
- add full production Claude/Codex/Sol adapters merely for demonstration;
- perform a broad rewrite of `execution.ts` or `host.ts`;
- replace the evaluator skill wholesale;
- solve distributed locking;
- require arbitrary provider-process resurrection after host restart;
- solve the PID-reuse stale-lock edge case unless a trivial local hardening
  naturally falls out of the implementation;
- complete the second-project portability pilot;
- change the historical Spike 014 verification result.

---

# Execution instruction for Spike 014a

The user currently intends to use **Sol** for implementation rather than spend
additional Astra High capacity. This is a spike-specific execution choice, not
methodology policy.

Workflow preparation may use the existing supported Harness machinery through:

1. Brief Readiness;
2. Design Map;
3. evaluator preparation.

Implementation should then be explicitly initiated under the frozen Spike 014a
authority.

Independent verification should remain a protected evaluator role, currently
intended for Claude Sonnet High unless the human changes that choice.

The implementation agent should be instructed to preserve the Spike 014
architecture, make the smallest coherent correction/hardening changes, and avoid
unrelated cleanup.

---

# Bootstrap / self-hosting note

Spike 014a changes the machinery that will eventually govern these same actions.

Preparation and implementation may therefore use the currently supported Spike
014/legacy authority surfaces where necessary.

Do not fabricate 014a Workflow Execution Grants, supersession records,
host-promotion evidence, inline-adoption evidence, or human-decision cutover
before those mechanisms exist.

Bootstrap activity is how the successor is built. It is not evidence that the
successor mechanisms work.

Once a 014a candidate implements a new boundary, required acceptance evidence
for that boundary must be produced through the implemented path.

---

# Completion boundary

Spike 014a completes only after:

1. Brief Readiness passes and the 014a brief is frozen;
2. its Design Map is frozen;
3. evaluator preparation freezes implementation-independent coverage for the
   successor criteria;
4. implementation produces one exact candidate under the frozen successor
   authority;
5. independent verification evaluates that candidate and the required
   real-boundary evidence;
6. promotion is exercised through the implemented host-mediated promotion path;
7. As-Built records the actual successor delta;
8. the human makes the acceptance decision through the new governed
   acceptance/rejection authority path;
9. Outcome records the final kernel boundary, remaining scars, and deferred work.

---

# Governing tests

For every correction:

> Is this repairing a real Spike 014 semantic defect, or accidentally redesigning
> the kernel?

For every automatic transition:

> What finite human-granted budget authorizes Harness to continue spending work
> without returning to the human?

For every existing execution:

> Is this the same Role Grant and therefore idempotent reuse, different authority
> that must conflict, or explicitly superseded authority that must be revoked
> before new work starts?

For every supervisor action:

> Is the context merely supervising, or has it actually adopted a Role Grant and
> therefore become the governed worker?

For every privileged mechanical action:

> Can the semantic agent request a narrow host action while the host owns the
> credential/mechanical authority?

And for the cutover as a whole:

> Can the new configured kernel tell us what may happen next, how much may happen
> automatically, which one governed execution currently holds authority, and how
> old authority is safely ended — without falling back to a second methodology
> state machine?
