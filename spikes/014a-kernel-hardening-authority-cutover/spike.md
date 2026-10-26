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

Spike 014 itself was built on the accepted Spike 013a state integrated by
`4b8a24235173759fb56420ba04b6c3c0df630852`. That integration is a squash of
the accepted 013a branch, so Git ancestry does not contain the branch's detailed
attempt history even though the accepted production tree and spike evidence were
carried forward. Spike 014a must preserve the 013a guarantees that survived into
014, especially deterministic contract binding, protected delegated evaluator
authority, host-validated semantic role results, canonical checkpoint adoption,
explicit execution-attempt identity, and host-mediated publication.

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
- deterministic role-contract binding and delegated authority inherited from
  accepted Spike 013a;
- process completion remaining distinct from a host-validated semantic role
  result;
- provider prose or repository skill discovery never creating methodology
  authority;
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

## 4. Configured role contracts must faithfully represent their skills

Spike 014 introduced repository-owned configured role contracts, but the active
Brief Readiness contract does not faithfully represent Brief Readiness v3:

- the skill requires writing `feedback.md`;
- the configured contract grants only `repository-read` and
  `local-computation`, so a governed worker has no `workspace-write`
  capability;
- the configured postcondition requires `brief-readiness.md`, a different
  artifact that the skill does not specify.

This is a methodology/configuration defect, not an executor defect. A worker
must not be forced to violate its Role Grant in order to satisfy its skill, and
the host must not require an artifact the skill never promises to create.

Spike 014a must ensure each configured role contract is materially compatible
with the active skill it binds for required inputs, outputs/postconditions,
capabilities, protected/private exposure, human interaction, and privileged
host actions.

The generic kernel must remain ignorant of Harness-specific filenames or skill
semantics. Fidelity belongs in repository-owned methodology configuration and
its validation/tests.

---

# Part II — New Spike 014a hardening and cutover requirements

The requirements in this section are new successor scope. They are deliberately
not part of the Spike 014 rejection classification.

## 5. Separate operational retry from semantic correction/re-entry

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

## 9. Supervisor identity and inline role adoption

A persistent supervisory/orchestrator context is a supervisor by default. Merely
discovering, reading, loading, or being able to execute a repository role skill
does not turn that context into the worker for that role.

For Codex App specifically, repository instructions must make the default
identity explicit:

> Codex App coordinating a Harness workflow is the orchestrator/supervisor unless
> it has received separate authority to adopt a governed Role Grant.

The active `skills/orchestrator/SKILL.md` already distinguishes observation
from execution and requires explicit human workflow authorization. Spike 014a
must harden the remaining boundary: workflow execution authorization permits the
orchestrator to **coordinate** eligible roles; it does not by itself authorize
the orchestrator to perform those roles inline.

A supervisor may temporarily become the worker for an eligible Role Grant
without spawning another provider process only when inline adoption has an
independent authority basis.

Inline adoption is permitted when either:

1. the human explicitly requests inline execution for the named/bounded role,
   for example “fix this inline”; or
2. the current Workflow Execution Grant/configured executor policy explicitly
   permits inline execution as a fallback and the configured fallback condition
   has mechanically become true.

The orchestrator may not choose inline execution merely because it is cheaper,
faster, already has the skill in context, or would avoid launching another
agent. A fallback must be policy/grant authority, not orchestration convenience.

Conceptually:

supervisor → explicit/fallback inline authority → attached Role Grant →
governed execution → terminal → supervisor

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

A narrow attached-only, single-role, non-continuing Workflow Execution Grant may
therefore provide the future low-ceremony “fix inline” path without inventing an
ungoverned “just edit it” mode.

The implementation must harden the repository orchestration contract at the
appropriate public instruction surfaces, including `skills/orchestrator/SKILL.md`
and, where needed to establish the Codex-App default before role-skill
discovery, `AGENTS.md`.

## 10. Runtime executor/model claims must be truthful

A requested executor, model, or reasoning-effort setting is an execution
constraint, not an identity the agent may establish by saying that it used it.

When a Workflow Execution Grant, Role Grant, executor policy, or explicit human
instruction requires a particular model/effort:

- Harness/orchestration must pass that constraint through the supported provider
  launch path where the provider supports it;
- the execution record must distinguish requested configuration from runtime-
  confirmed configuration;
- an orchestrator must distinguish its own parent model from a child executor's
  model;
- no manifest, result, or progress report may claim a model/effort level that
  the runtime did not expose or the host did not itself mechanically enforce.

If an exact model/effort is a required execution constraint and the available
provider surface cannot enforce or attest it, allocation must stop/block rather
than silently substitute or convert the requested setting into prose.

This does not require automatic model routing, model benchmarking, or cost
optimization. It requires truthful enforcement/attestation of an explicitly
chosen executor policy.

## 11. Role-derived canonical transitions require governed execution provenance

A canonical transition that represents completion/result of a governed role
must not be recordable merely because a correctly shaped artifact with valid Git
provenance exists.

For forward authority after the 014a cutover, role-derived transitions including
at least:

- `brief-frozen`;
- `design-map-frozen`;
- `evaluation-prepared`;
- `implementation-handoff`;
- `verification-finalized`;
- `as-built-recorded`;
- `outcome-recorded`;

must bind the exact authorized execution that produced the result, including the
relevant Workflow Execution Grant, Role Grant, execution identity, validated
semantic Role Result, and artifact/result identities required by the
methodology.

The host/configured authority path must reject a valid-looking role artifact
whose producing work did not hold the required governed role authority.

Human/root-authority transitions such as explicit acceptance, rejection,
supersession, or bounded exception authority may have a different provenance
shape, but their authority source must likewise be explicit.

Historical legacy events remain history. The legacy implementation may remain
capable of reading/interpreting old ledgers, but after cutover it must not be an
independent forward-authority path that can bless ungoverned role work.

## 12. Promotion becomes a host-mediated configured action

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

## 13. Legacy workflow becomes historical read-only compatibility

After the Spike 014a cutover, `legacy-workflow.ts` must not be a second
executable workflow engine or forward authority mutator for active/current
workflows.

Its remaining supported responsibility may include:

- reading and projecting historical ledgers;
- validating or explaining historical records under the methodology/version
  that created them;
- diagnostics needed to understand old spikes and preserved evidence;
- narrowly scoped compatibility helpers that do not create new canonical
  methodology authority.

For active/current workflows after cutover, legacy machinery must not:

- dispatch or complete governed roles;
- create or adopt role-completion state;
- record `brief-frozen`, `design-map-frozen`, `evaluation-prepared`,
  `implementation-handoff`, `verification-finalized`, promotion, As-Built,
  Outcome, acceptance/rejection, correction-cycle, or equivalent forward
  methodology authority;
- manufacture current authority from artifact presence, Git provenance, local
  `.workflow` state, or provider prose.

The restriction must be mechanical. A repository instruction saying “do not use
legacy for new work” is insufficient if the mutating command remains a valid
path that an orchestrator can invoke.

Spike 014a does not require deleting every historical parser or immediately
renaming the file. It requires removing or disabling legacy **forward mutation**
for the post-cutover workflow path so there is one executable authority path for
new work.

A later cleanup may rename or reduce the remaining reader to something like
`historical-workflow` or `legacy-ledger-reader` once compatibility needs are
known.

## 14. New human acceptance/rejection must use the governed authority path

Historical legacy authority interpretation may remain for read-only historical
compatibility and diagnostics.

It must not decide or record new human acceptance/rejection after the Spike 014a
cutover.

A human acceptance/rejection decision must:

- bind the relevant workflow/cycle/candidate evidence;
- be validated against the pinned configured methodology/current canonical
  authority;
- be recorded as forward canonical authority;
- remain distinct from evaluator PASS and As-Built;
- preserve rejection findings/classification where applicable.

The exact host/API representation is Design Map freedom. This requirement does
not require a polished human UI.

## 15. Predicate semantics must be explicit

The narrow declarative policy interpreter must define the semantics of its
operators, especially `after`.

For Spike 014a:

> `event A after event B` is false when no matching B exists.

Policy that requires different missing-anchor behavior must express that
explicitly with `any`, `not`, or another configured predicate rather than
depending on `findLastIndex(...) === -1` as accidental language semantics.

The visible suite must lock this behavior down.

## 16. Spawned executions require a deterministic semantic-result handshake

A governed spawned executor must not be considered operationally complete merely
because its provider process exited cleanly.

Spike 014 currently permits a spawned process to exit with `process: exited`
and no semantic Role Result when the worker never calls the result endpoint.
For a role whose retry policy does not include raw process `exited`, that can
leave the governed role in a terminal-looking but non-advancing state with no
natural retry path.

For spawned governed execution:

- the provider/adapter must have a deterministic supported mechanism for
  receiving its exact assignment/contract and returning a semantic Role Result;
- a clean provider exit without a valid Role Result is **not** role success;
- missing or invalid semantic-result delivery must become a durable, inspectable
  execution failure/attention/stop fact with an explicit reason;
- configured retry/replacement policy must be able to reason about that state;
- automatic continuation must not silently stop because the provider exited
  without the semantic handshake;
- bounded diagnostics must distinguish failure before assignment delivery,
  during provider execution, or during result submission without requiring
  unrestricted raw private-output retention.

The exact adapter/protocol is Design Map freedom. The invariant is that the host,
not provider optimism or process exit code, knows whether the governed role
completed.

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

**AC11 — Supervisor identity is non-authoritative for worker roles**

A Codex-App/orchestrator context remains a supervisor when it discovers or reads
a role skill. General workflow-execution authorization does not by itself let it
perform the next role inline.

**AC12 — Inline role adoption requires explicit authority**

An eligible supervisory session can adopt an attached Role Grant only when the
human explicitly selected inline execution or a pre-authorized WEG/executor
fallback condition is mechanically satisfied. The same session can reach
terminal state and then resume supervision.

**AC13 — Exposure still constrains inline adoption**

A supervisor/session with evaluator-private exposure is denied inline
implementation adoption when the implementation contract forbids that
provenance.

**AC14 — Runtime model/executor claims are truthful**

Requested model/effort and runtime-confirmed model/effort are distinguishable.
A required exact model/effort that cannot be enforced or attested blocks rather
than being silently claimed. Parent-orchestrator model identity is not reported
as child-executor identity or vice versa.

**AC15 — Role-derived authority is execution-bound**

A valid-looking role artifact cannot create forward canonical authority without
the required governed Role Grant/execution/semantic-result provenance. The same
artifact produced by an authorized governed execution can advance through the
configured path.

**AC16 — Promotion is host mediated**

A genuine evaluator PASS can request only the promotion action permitted by its
Role Grant. The host validates and performs exact promotion, records the action
result and resulting identities, and the executor does not require unrestricted
direct promotion/publication authority.

**AC17 — Promotion failure does not rewrite semantic PASS**

A failed or denied promotion remains distinct from the evaluator's semantic
verification result, and configured methodology decides what may happen next.

**AC18 — Legacy cannot create forward authority**

For post-cutover active workflows, legacy workflow machinery can inspect
historical state but cannot dispatch governed roles or record forward canonical
methodology transitions. Attempted legacy mutation is mechanically rejected or
the mutating surface is absent.

**AC19 — New human decisions use configured authority**

Human acceptance/rejection after the cutover is validated/recorded through the
new configured authority path rather than an independent legacy state-machine
oracle.

**AC20 — Predicate language semantics are deterministic**

`after` requires its anchor to exist; visible regression coverage proves the
missing-anchor case and the affected Harness policy remains behaviorally
correct.

**AC21 — Existing kernel regressions remain green**

The full visible suite, including Spike 014's real-boundary tests, remains green.
No fix may restore duplicate local-state authority, hard-coded Harness role
logic, or weakened evaluator-private exposure.

**AC22 — Spawned result handshake cannot disappear**

A spawned governed worker that exits without submitting a valid semantic Role
Result leaves an explicit durable missing-result failure/attention fact rather
than a successful or ambiguous terminal role. The configured retry/replacement
path can act on that state, and a valid semantic result remains distinct from
process exit.

**AC23 — Configured role contracts are skill-faithful**

For every active Harness role, the configured contract is materially compatible
with the bound skill's required inputs, outputs/postconditions, capabilities,
protected exposure, human interactions, and privileged host actions. A
deliberately contradictory fixture is rejected by validation or regression
coverage. Brief Readiness specifically can produce its declared review artifact
without exceeding its Role Grant.

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

### R8 — Native skill discovery does not self-authorize

Run a supervisor/Codex-App-like context that can discover and read a role skill.
Authorize workflow continuation but do not authorize inline adoption. Prove it
cannot convert skill discovery into the worker Role Grant or produce accepted
role-derived authority by doing the role itself.

### R9 — Human-selected inline implementation adoption

Register/retain a clean supervisor-like attached session. Explicitly authorize a
narrow implementation-only inline WEG/Role Grant. Prove the same session performs
the role and later remains usable after the execution is terminal.

### R10 — Configured inline fallback

Configure a WEG/executor policy that permits inline fallback only after a named
external-executor condition fails. Prove the supervisor cannot choose inline
before that condition and can receive the attached Role Grant after it is
mechanically satisfied.

### R11 — Inline adoption exposure denial

Give the same kind of session evaluator-private exposure first. Prove
implementation Role Grant resolution/allocation is denied.

### R12 — Model/effort attestation

Request an exact model/effort for a child execution. Prove the record separates
requested from confirmed configuration. Where the provider cannot attest/enforce
the required setting, prove the role blocks rather than reporting the requested
setting as fact.

### R13 — Ungoverned artifact cannot freeze authority

Produce a valid-looking Brief Readiness artifact and committed brief without an
authorized Brief Readiness Role Grant/execution. Prove `brief-frozen` is denied.
Then perform the same role through an authorized governed execution and prove the
configured transition can bind that execution and freeze the exact brief.

### R14 — Host promotion

Use a bounded local evaluator-evidence fixture. A governed evaluator PASS requests
promotion through the host. Prove exact-source validation, host-performed
promotion, resulting identity checks, and no unrestricted direct executor
promotion authority.

### R15 — Legacy forward mutation is unavailable

For an active post-cutover workflow, attempt to use legacy workflow machinery to
record a role-derived transition and a human/root transition. Prove neither can
create forward authority. Prove historical status/inspection of an older ledger
still works where compatibility is retained.

### R16 — Human decision cutover

At a state ready for acceptance, record acceptance/rejection using the new
authority path. Prove legacy local state and legacy execution completion flags
cannot independently change legality or record the decision.

### R17 — Missing `after` anchor

Prove `A after B` is false when B never occurred and true only for qualifying A
events after an existing B.

### R18 — Spawned worker exits without semantic result

Launch a real supported spawned executor under a governed Role Grant and make it
exit cleanly without returning the semantic-result handshake. Prove Harness
records an explicit missing-result failure/attention state, does not advance the
methodology, and permits only configured retry/replacement or a human gate.
Then prove a spawned execution returning a valid result advances normally.

### R19 — Role contract contradicts bound skill

Use a deliberately contradictory role fixture where the skill requires a named
output/write responsibility but the contract either omits the required
capability or declares a different postcondition. Prove the methodology
validation/regression boundary catches the contradiction. Prove the corrected
Brief Readiness contract permits the governed role to produce its actual
declared review artifact without capability escape.

---

# Real-boundary evidence

At least these successor boundaries must cross supported host/process/filesystem
interfaces rather than being proved only by in-memory method calls:

1. supersession of a real running external governed worker, including denial of
   a late request from the superseded execution;
2. human-selected or policy-fallback inline role adoption by an already-running
   attached supervisory session/context;
3. rejection of a real committed role artifact that lacks governed execution
   provenance, followed by acceptance of equivalent output from an authorized
   role execution;
4. host-mediated promotion of exact evaluator evidence into a bounded local
   promoted destination;
5. a real spawned governed-worker result handshake, including the missing-result
   failure boundary;
6. a governed Brief Readiness execution using a role contract that actually
   permits and requires the active skill's declared review artifact.

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
- exact representation of human-selected inline permission and configured
  fallback conditions;
- how requested versus runtime-confirmed executor/model/effort metadata is
  represented for providers that expose different levels of attestation;
- exact governed-execution provenance bound to role-derived canonical
  transitions;
- exact boundary/API retained for read-only historical legacy interpretation
  after forward mutation is disabled;
- exact generic host-action registry/handler shape;
- exact promotion request/result schemas;
- how cross-field result constraints are represented generically;
- exact durable continuation-stop/attention record shape;
- exact spawned-provider semantic-result handshake/adapter and bounded
  diagnostic evidence shape;
- exact methodology validation mechanism for material skill/contract fidelity
  without moving Harness-specific skill semantics into the generic kernel.

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
- implement automatic model routing, model benchmarking, or full cost
  optimization (truthful enforcement/attestation of an explicitly requested
  model/effort is in scope);
- implement a polished supervisor UI;
- implement a general secrets manager;
- add full production Claude/Codex/Sol adapters merely for demonstration;
- perform a broad rewrite of `execution.ts` or `host.ts`;
- replace the evaluator skill wholesale;
- delete all historical legacy parsing/compatibility code merely for neatness
  (legacy forward mutation is in scope; physical reader cleanup may follow);
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
014/legacy authority surfaces where necessary, but bootstrap evidence must not
claim semantics those surfaces do not actually enforce.

## Observed 014a bootstrap defect

The first 014a Brief Readiness attempt was dispatched by Codex App to a Codex
subagent outside a running Harness host. The child produced a plausible
`READY` review, and the legacy authority CLI subsequently recorded
`brief-frozen` at commit `c3bd7a1dad236f1a63c0780db4cfc2e1f6efbc8f`.

A later replacement attempt did use a real bounded Spike-014 WEG/root
exception/Role Grant/execution, but the orchestrator's checkout was stale: it
lacked the already-pushed bootstrap incident file and bound the old
`sha256:49d0daa4…9b80bc4d` brief rather than the materially revised 014a
brief. The spawned provider process then exited cleanly without submitting a
semantic Role Result. No replacement freeze was recorded. Those facts remain
bootstrap evidence and must not be cosmetically rewritten.

Before another replacement bootstrap allocation, orchestration must verify that
the local checkout contains the expected committed current brief and named
bootstrap artifacts. If local and remote provenance disagree, synchronize or
stop before allocating authority.

That sequence established two defects this successor now explicitly addresses:

1. provider-native subagent/skill execution is not equivalent to execution under
   a Harness Role Grant; and
2. the legacy recorder can record a role-derived canonical transition from
   artifact/provenance evidence without proving that the role execution itself
   held governed authority.

The old event must remain in the append-only ledger. It is not the final
authority basis for this materially revised brief.

A subsequent bounded semantic-result bridge exposed a further bootstrap defect.
The governed worker returned the exact structured semantic output
`HARNESS_ROLE_RESULT {"disposition":"succeeded","methodology":{"verdict":"READY"}}`,
but the host correctly rejected submission because the pinned Brief Readiness
contract requires `brief-readiness.md` as a postcondition. The active Brief
Readiness v3 skill instead requires `feedback.md`, while the contract grants no
`workspace-write` capability. This cannot be repaired by another executor
retry without violating either the skill or the Role Grant.

Because no Design Map was frozen after that event, recovery is forward-only:

1. preserve the original bootstrap review and `brief-frozen` event as
   historical evidence;
2. materially revise this brief;
3. perform one explicit, bounded **methodology bootstrap repair** that makes the
   Brief Readiness role contract faithfully executable by Brief Readiness v3
   without changing Brief Readiness semantics or product/kernel source;
4. pin/use that repaired methodology definition under explicit human bootstrap
   authority and preserve the prior contradictory definition as history;
5. rerun Brief Readiness through a real governed Spike-014 host execution using
   the repaired contract;
6. commit the revised reviewed brief/review checkpoint;
7. append a newer `brief-frozen` event binding the replacement brief and its
   governed execution evidence;
8. require all later 014a preparation to bind the latest valid freeze and the
   repaired pinned methodology.

Do not delete or rewrite `c3bd7a1`.

During bootstrap, do not fabricate 014a Workflow Execution Grants,
supersession records, host-promotion evidence, inline-adoption evidence, model
attestation, or human-decision cutover before those mechanisms exist.

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

> Is the context merely supervising, or has it actually adopted a Role Grant
> under explicit human inline authority or a pre-authorized fallback condition?

For every role-derived canonical transition:

> Which exact governed execution and validated semantic Role Result authorize
> this transition? Would the same artifact be rejected if it came from an
> ungoverned child?

For every executor/model claim:

> Is this requested configuration, host-enforced configuration, or
> runtime-confirmed configuration? Are we reporting only what can actually be
> proved?

For every privileged mechanical action:

> Can the semantic agent request a narrow host action while the host owns the
> credential/mechanical authority?

For every legacy workflow operation:

> Is this strictly historical interpretation, or can it still create current
> authority? If it can mutate forward authority after cutover, the cutover is
> incomplete.

And for the cutover as a whole:

> Can the new configured kernel tell us what may happen next, how much may happen
> automatically, which one governed execution currently holds authority, and how
> old authority is safely ended — without falling back to a second methodology
> state machine?
