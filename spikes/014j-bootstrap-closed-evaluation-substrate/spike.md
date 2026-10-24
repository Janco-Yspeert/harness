# Spike 014j - Bootstrap-Closed Evaluation Substrate

**Status:** Revised draft after Brief Readiness; not frozen

**Trusted methodology:** sequence `5`, methodology `sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`, revision `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`

**Successor authority:** `spikes/014g-verifier-containment-composition/human-successor-authority.md`, committed at `cf1d5749b6f119fecb78285aceed32bdafa59646`

**Starting repository state:** preserved Spike 014g C4 implementation and attempt-011 history. C4 is not accepted or trusted by carry-forward.

**Depends on:** accepted Spike 014h host-owned filesystem isolation; accepted Spike 014i governed candidate-evaluator subject execution; preserved Spike 014g attempt 011 and successor authority

**Unblocks:** a later methodology-successor spike that can evaluate and adopt N+1 without depending on untrusted N+1 authority

## Context

Spike 014g is intentionally stopped at trusted-N verification attempt 011.

Attempt 011 evaluated candidate C4
`edecf012a9b97ebb915c7f31f309c4811b6e927e` under evaluator revision `003`
and finalized:

`BLOCKED / EVALUATOR_DEFECT`

The result did not establish a C4 implementation defect.

The visible repository suite passed 242/242. Fresh revised-SC1 candidate-subject
evidence was sealed successfully. The exact frozen revision-003 E5 procedure was
also launched as a candidate subject, but its required host-supplied inputs could
not be provided through an authority seam exposed to the governed evaluation
path. Trusted N therefore correctly refused to admit the result.

The immediate temptation is to fix the evaluator contract and then use the new
contract to prove that the fix works. That is circular.

The same recursion would occur if this spike required its evaluator to use a new
host-input action, a new candidate-observation contract field, or any other
capability that exists only because this spike has already been accepted.

014j therefore has a stronger requirement than merely implementing the missing
feature:

> Every mandatory 014j acceptance criterion must be provable using only the
> predecessor trusted methodology and capabilities available before 014j is
> accepted.

This is the bootstrap-closure rule.

014j establishes a small accepted runtime substrate that a later methodology
successor may use. It does not itself perform the N to N+1 methodology adoption.

A second recurring defect belongs in the same bootstrap substrate. Harness
currently conflates executor profile selection, provider launch aliases and
concrete provider model attestation. 014g attempt 007 demonstrated the failure:
the evaluator requested launch selector `sonnet`, while the provider accurately
reported concrete model `claude-sonnet-5-5`; literal equality turned valid
provenance into a launch failure.

That model-identity ambiguity affects the reliability of trusted evaluation and
can be corrected and tested without requiring a methodology transition.

## Question

Can Harness establish, under the current trusted methodology, a bootstrap-closed
runtime substrate that:

1. can prepare a bounded, exact candidate-evaluator observation with explicit
   host-owned inputs and sealed evidence;
2. makes that prepared evidence inspectable by later trusted evaluation without
   granting candidate methodology authority;
3. separates provider launch selection from concrete model attestation; and
4. can itself be completely evaluated without using either new capability as an
   authority dependency of its own evaluation?

## Bootstrap-closure invariant

Bootstrap closure is mandatory, not advisory.

Before evaluator preparation for 014j is frozen, every mandatory acceptance
criterion must have an evidence procedure executable under the predecessor
trusted methodology and the already accepted pre-014j runtime substrate.

014j evaluation may:

- execute candidate 014j code through ordinary deterministic repository tests;
- construct synthetic candidate methodologies and evaluator-private fixtures;
- exercise kernel/host APIs from deterministic tests;
- inspect exact committed code and identities;
- use existing repository-read, local-computation and git-inspect authority;
- use existing accepted 014h containment primitives;
- use existing accepted 014i candidate-subject primitives where those primitives
  already exist before 014j;
- perform manual review of public authority boundaries.

014j evaluation must not require:

- a host operation introduced by 014j to be invoked through a new governed
  evaluator permission introduced by 014j;
- private evidence that can only be produced through a new 014j authority seam;
- a candidate methodology N+1 becoming temporarily authoritative;
- a new evaluator contract field that trusted N does not yet possess;
- a live methodology cutover;
- a post-014j trusted-methodology entry;
- a provider feature or external project needed only to demonstrate the new
  capability;
- any reasoning of the form "014j is safe because 014j was already trusted
  enough to produce the evidence proving 014j safe."

If Evaluator Prepare proposes any mandatory evidence procedure that violates
this closure rule, preparation must stop as NOT READY or equivalent before
implementation begins. It must not freeze the recursive procedure and defer the
problem to verification.

## Authority model

014j separates three layers.

### 1. Existing trusted authority

Trusted methodology N remains unchanged while evaluating 014j.

Its evaluator uses only authority available before 014j acceptance.

### 2. Candidate implementation under test

The 014j implementation may add runtime/host behavior. Deterministic tests and
inspection may exercise that candidate code as software under test.

Executing candidate code in a test does not make the candidate an authority.

### 3. Post-acceptance runtime substrate

Only after independent trusted-N PASS, normal closeout and explicit human
acceptance may later successor work rely on the accepted 014j capability as
runtime infrastructure.

014j acceptance does not itself establish methodology N+1.

## Scope

014j has two tightly bounded product goals.

# 1. Host-owned prepared candidate observation

Extend the accepted 014i candidate-evaluator-subject substrate so Harness can
prepare a bounded candidate observation with explicit host-owned inputs without
requiring the trusted evaluator role to possess a new contract capability.

The production operation is host-owned and explicitly authorized through the
existing human/root host boundary.

It is not a worker action conferred by candidate methodology authority.

Its purpose is to create immutable, self-describing evidence that a later
trusted evaluator can inspect using already-existing read/inspect capabilities.

The exact API and record names are Design Map decisions.

## 1.1 Exact subject reconstruction

The operation targets one exact committed candidate evaluator composition.

Bind at minimum:

- exact candidate Git commit;
- exact candidate methodology identity;
- exact candidate `evaluator-verify` role composition;
- exact candidate skill and contract identities;
- declared capabilities, workspaces, modes and host actions;
- exact Harness runtime identity;
- exact observation/procedure identity;
- exact host-input identities.

Reuse the accepted 014i reconstruction and containment mechanisms.

Do not build a second candidate-subject engine.

## 1.2 Host-owned observation inputs

The operation may supply bounded host-owned observation inputs required by the
selected procedure.

Examples include:

- synthetic topology created by the host;
- read-only before-state snapshots;
- identities describing permitted fixture state;
- exact frozen procedure material resolved from an authorized evaluator-private
  inventory;
- other deterministic observation inputs selected by the Design Map.

The caller supplies identities and bounded selectors, not arbitrary private
bytes or arbitrary private filesystem paths.

Where evaluator-private procedure material is used, the host resolves it from
the configured evaluator-private workspace and verifies all revision, inventory
and procedure identities before use.

Fail closed on mismatch.

The candidate subject cannot choose, replace or mutate host-owned procedure
material or host-created observation inputs.

## 1.3 Prepared observation authority

The operation must use an authority available before methodology N+1 exists.

Prefer the existing explicit human/root host boundary.

The authorization must bind the exact workflow or successor context, candidate,
observation purpose and relevant identities sufficiently to prevent the
operation becoming a generic "run arbitrary private material" endpoint.

Provider prose, candidate code, a candidate role result or possession of a
candidate contract must not authorize the operation.

A later methodology may make the operation easier for trusted evaluators to
request directly. 014j does not require that future contract change.

## 1.4 Sealed evidence and canonical preparation record

The host captures the candidate subject's raw observable behavior and the
host-side facts needed to interpret it.

Evidence must distinguish at least:

- host-created topology;
- paths visible to the subject;
- paths writable to the subject;
- host-owned input identities;
- subject-authored output;
- host-side before/after observations;
- candidate composition;
- runtime identity;
- procedure/material identities;
- process outcome and relevant worker-tool activity.

Seal evidence outside every subject-writable workspace.

Tampering, omission, truncation or substitution must fail closed.

Before a successful consuming evaluator result, the sealed bundle resides only
in host-controlled evaluator-private storage available to the predecessor
trusted evaluator under its existing workspace authority. Exact private
procedure material, host-owned private inputs, raw subject output derived from
those inputs and other evaluator-private evidence must not be copied into the
public repository or public workflow ledger merely because preparation
succeeded.

The host must append one durable canonical preparation record or equivalent
inspectable lifecycle fact binding the exact evidence bundle to its authority
and identities. That record may be public only as a safe projection containing
identities, authority provenance, lifecycle state and the private bundle's
sealed identity. It must not contain evaluator-private procedure/input bytes,
raw private output or other private mechanics.

Eligible private evidence may be committed or published into the public
repository only through the existing host-owned successful-result promotion
boundary for the later consuming evaluator attempt. Preparation alone never
authorizes release. Private bundles and safe public preparation records are
retained as immutable history and are not rewritten when a later attempt
passes, fails or is blocked.

The prepared observation is evidence, not a verdict.

It must not:

- finalize verification;
- establish methodology trust;
- alter trusted methodology history;
- perform promotion;
- perform human acceptance;
- advance a real verification workflow;
- claim that its subject passed any spike.

## 1.5 Consumption by later trusted evaluation

The prepared evidence must be self-describing and identity-bound enough that a
later trusted evaluator can resolve the public-safe preparation identity to the
exact sealed private bundle and inspect that bundle using authority already
available to the current trusted evaluator: its configured evaluator-private
workspace plus repository read, local computation and Git inspection. No new
worker permission, host action or candidate-methodology authority is required.

014j does not require changing the current trusted evaluator contract merely to
consume the evidence.

A later successor brief/evaluator may bind an exact prepared-observation
identity as required historical evidence and independently decide whether it is
admissible.

This is the bootstrap bridge:

```text
current trusted host/human authority
        |
        | prepares exact bounded observation
        v
candidate behavior under test
        |
        v
host-owned evaluator-private sealed evidence
        |
        | sealed identity / public-safe canonical record
        v
current trusted evaluator can inspect it
without acquiring candidate authority
```

A future accepted methodology may replace this operational bridge with a more
ergonomic first-class evaluator request surface. That future improvement is not
required for 014j acceptance.

# 2. Executor selection and model attestation semantics

Correct the current overloaded model semantics in the generic executor/runtime
layer.

The exact field names are a Design Map decision, but Harness must distinguish:

1. **executor profile identity**  
   the configured Harness executor profile selected for the role;

2. **provider launch selector or model family**  
   the provider-facing value used to request an eligible model, for example
   `sonnet`;

3. **provider-attested concrete model identity**  
   the concrete provider-reported identity, for example
   `claude-sonnet-5-5`;

4. **exact concrete-model constraint**, only when explicitly required  
   a concrete identity for which literal provider confirmation is required.

The mandatory invariant is:

> A provider launch selector or family alias is not an exact
> provider-attested model identity.

A profile may launch with selector `sonnet` and legitimately attest
`claude-sonnet-5-5` without failing solely because the strings differ.

The existing executor-profile `model` value and workflow-grant executor
`model` value are provider launch selectors, not exact concrete-model
constraints. When both are present, the grant selector overrides the profile
selector for that launch, preserving the existing selection precedence.

In the absence of an explicit exact-model constraint, Harness does not infer
family membership or compare the selector string with the provider-attested
concrete identity. Provider acceptance of the launch selector determines
whether the requested launch is available; the concrete attestation is
recorded as provenance. This deliberately avoids a generic alias-membership
oracle that Harness cannot define without provider-specific equivalence data.

An exact concrete-model requirement is represented separately from those
selector fields. The exact field name is a Design Map decision, but it must not
overload either existing selector field.

If an exact concrete model is explicitly required:

- the exact constraint takes precedence over a non-exact selector for
  eligibility and launch planning;
- the adapter must be capable of enforcing that constraint at launch;
- required attestation must be available where policy requires confirmation;
- the provider-attested concrete identity is compared literally with the exact
  constraint and mismatch fails closed;
- unavailable required attestation is not confirmation.

Do not introduce a hard-coded alias table such as:

`sonnet == claude-sonnet-5-5`

Do not special-case Claude.

The abstraction must be generic across registered providers.

## Required behavior

1. 014j's own evaluation is bootstrap-closed under predecessor trusted N.
2. A host/root-authorized operation can prepare one exact bounded
   candidate-evaluator observation without granting candidate methodology
   authority.
3. The operation reuses accepted 014i reconstruction and accepted 014h
   containment rather than creating a second execution engine.
4. Host-owned procedure/input material is identity-bound and cannot be replaced
   by caller paths or arbitrary private bytes.
5. Prepared evidence is complete enough to distinguish host-created state,
   subject-visible state, subject-writable state, subject output and host-side
   observations.
6. Prepared evidence is sealed outside subject authority and bound to exact
   candidate, composition, runtime, procedure and input identities.
7. The preparation record is canonical, inspectable and explicitly
   non-authoritative.
8. A later trusted evaluator can inspect prepared evidence through already
   available read/inspect authority without first adopting candidate N+1.
9. Executor profile, launch selector/family, concrete attestation and exact model
   constraint have distinct semantics.
10. Compatible family/selector launch plus concrete provider attestation no
    longer fails by literal alias equality.
11. Explicit exact-model requirements retain fail-closed mismatch behavior.
12. Existing accepted containment, governed execution, evaluator-private,
    candidate-subject, evidence and executor-selection regressions remain green.

## Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01 - Bootstrap closure** | Before evaluator preparation freezes, every mandatory 014j criterion has an evidence procedure executable under predecessor trusted N and the pre-014j accepted runtime. No mandatory procedure depends on authority, a contract capability, evidence transport or trusted-methodology state introduced by 014j itself. A recursive procedure is a preparation defect and must not be frozen. |
| **AC02 - Host-owned preparation authority** | Harness exposes one bounded host-owned operation, authorized through an authority boundary available before 014j acceptance, that prepares an observation of an exact committed candidate `evaluator-verify` composition. Candidate code, provider prose and candidate methodology do not authorize the operation. |
| **AC03 - Exact reconstruction and reuse** | The operation reconstructs the exact candidate evaluator composition from committed identities and reuses the accepted 014h/014i containment and candidate-subject machinery. No second candidate-subject engine or hand-written approximation is introduced. |
| **AC04 - Host-input integrity** | Host-owned procedure/input material is selected by bounded identity-bearing references. Wrong candidate, revision, inventory, procedure, material or input identity fails closed. Caller-supplied arbitrary private paths, host paths or replacement private contents are rejected. |
| **AC05 - Evidence separation** | Sealed evidence separately records host-created topology, subject-visible paths, subject-writable paths, host-owned input identities, subject-authored output and host-side before/after observations. Host-created topology is not itself treated as subject exposure. |
| **AC06 - Evidence authority** | Prepared evidence is sealed in host-controlled evaluator-private storage outside every subject-writable workspace, bound to the exact candidate/composition/runtime/procedure/input identities and represented by a canonical inspectable preparation record. Any public record is a safe identity/provenance/lifecycle projection and contains no evaluator-private procedure/input bytes or derived raw private output. Preparation alone cannot release private evidence, finalize verification, establish trust, promote methodology or advance the real verification workflow. Eligible private evidence can become public only through the existing successful-result promotion boundary of a later consuming evaluator attempt. |
| **AC07 - Later inspectability** | Prepared observation evidence can be named by the safe record's exact identity, resolved to the exact sealed private bundle and inspected by the predecessor trusted evaluator using its already-configured evaluator-private workspace, repository read, local-computation and Git-inspect authority. Demonstrating this property must not require adding a new permission, worker action or host action to the predecessor evaluator contract. |
| **AC08 - Model semantic separation** | Executor profile identity, provider launch selector/model family, provider-attested concrete model identity and explicit exact-model constraint are distinct in the runtime model and observable execution provenance. |
| **AC09 - Alias-safe protected execution** | Existing profile/grant `model` values are launch selectors, with the grant selector retaining override precedence. When no separate exact concrete identity is required, Harness does not compare selector and attestation strings or infer family membership: a protected evaluator-style launch using `sonnet` may accept and record `claude-sonnet-5-5`. No hard-coded alias equivalence table is used. |
| **AC10 - Exact-model fail closed** | When an exact concrete model is explicitly required, mismatch fails closed. If required attestation cannot be obtained, Harness does not mark the constraint confirmed. |
| **AC11 - Provider neutrality** | Deterministic coverage exercises the model-semantics abstraction across at least two registered-provider/profile shapes or equivalent generic fixtures, proving the implementation does not encode a Claude-only exception. |
| **AC12 - Regression preservation** | Existing trusted-methodology reconstruction, 014h containment, 014i candidate-subject, evaluator-private, governed execution, evidence integrity and executor-selection regressions remain green except for assertions explicitly superseded by the corrected model semantics. |
| **AC13 - No inherited acceptance** | C4 and 014g history may be used as implementation context and regression evidence, but 014j does not mark 014g PASS, accept C4, create evaluator revision 004, perform 014g As-Built or alter any preserved 014g result. |

## Required deterministic evidence

Evaluator preparation must define all mandatory evidence before implementation
and demonstrate bootstrap closure for each procedure.

At minimum deterministic coverage must establish:

1. a synthetic committed candidate evaluator can be reconstructed and observed;
2. a valid bounded host/root authority can authorize observation preparation;
3. candidate/provider output alone cannot authorize it;
4. wrong candidate identity fails;
5. wrong evaluator/freeze revision identity fails;
6. wrong private inventory identity fails;
7. unknown or mismatched procedure identity fails;
8. caller-supplied arbitrary private path/content fields fail;
9. unrelated evaluator-private inventory material is not exposed, and neither
   private procedure/input bytes nor raw private output enter the public
   repository or public ledger before an existing successful-result promotion;
10. host-owned inputs are read-only to the subject where required;
11. sealed evidence distinguishes host-created, visible, writable and externally
    observed state;
12. omission/tampering of required evidence bindings invalidates the bundle;
13. the canonical preparation record is bound to the exact private evidence
    identity, and any public projection contains only safe identity,
    provenance and lifecycle facts;
14. preparation does not enter an authoritative verification result or trusted
    methodology transition;
15. the predecessor trusted evaluator's existing evaluator-private workspace,
    repository-read, local-computation and git-inspect authority is sufficient
    to resolve and inspect the sealed bundle and its bindings without a new
    capability; successful-result promotion is the only route by which
    eligible bundle bytes become public;
16. profile and grant selectors retain their precedence, and a non-exact
    selector launch records a different concrete attestation without comparing
    the strings when no exact concrete model was required;
17. exact-model mismatch fails;
18. required-but-unavailable exact attestation is not treated as confirmation;
19. generic model semantics are exercised beyond one Claude-specific fixture;
20. the full repository regression suite remains green.

No mandatory 014j evaluator procedure may require a live external project,
mutable operator state, or an invocation path that only becomes authorized after
014j acceptance.

## Explicit non-goals

014j does not:

- complete or reopen Spike 014g;
- create evaluator revision `004` for 014g;
- claim a 014g PASS;
- human-accept C4 or 014g;
- perform 014g As-Built or Outcome;
- promote methodology N+1;
- change the trusted methodology sequence;
- make candidate N+1 authoritative for any part of its own evaluation;
- redesign evaluator PASS/FAIL/BLOCKED semantics;
- solve evaluator archival/promotion ownership;
- resume Spike 014f;
- resume the Stockdif live canary;
- implement general prompt injection or unsolicited human input;
- redesign `WAITING_FOR_HUMAN`;
- implement provider-session persistence or resumable provider conversations;
- implement quota pause/resume;
- implement post-result transition replay;
- implement usage/cost telemetry;
- implement context caching or progressive context exposure;
- create a separate skill evaluator;
- perform broad kernel cleanup or decomposition;
- add general arbitrary candidate-role execution;
- add a general private-file or secret injection API.

## Relationship to the next spikes

A successful 014j provides accepted runtime substrate, not methodology adoption.

The next methodology-successor spike, currently planned as 014k, may then use
accepted 014j prepared-observation evidence to evaluate candidate N+1 under
trusted N.

That successor should address:

- the actual N to N+1 authority chain;
- first-class future evaluator declarations/requests built on the now-accepted
  observation substrate;
- separation of evaluator verdict from archival/promotion policy;
- explicit human methodology adoption;
- forward-only trusted-history cutover.

The previous cleanup/consolidation work planned for 014k moves after the
methodology-successor spike.

## Execution sequence

1. Run Brief Readiness on this draft.
2. Brief Readiness must explicitly check the bootstrap-closure invariant.
3. Freeze the clarified brief.
4. Produce a Design Map limited to:
   - host/root observation-preparation authority;
   - reuse of 014h/014i candidate-subject execution;
   - bounded host-owned observation inputs;
   - sealed/canonical prepared evidence;
   - later inspectability by current trusted N;
   - model selector/family/exact-attestation semantics.
5. Prepare independent evaluation under trusted methodology N.
6. Before freezing evaluation, prove that every mandatory procedure is
   executable without any 014j-introduced authority dependency.
7. If any procedure is recursive, stop and repair evaluator preparation before
   implementation.
8. Implement the smallest generic candidate.
9. Independently verify the exact 014j candidate under trusted N using only
   bootstrap-closed evidence procedures.
10. Complete normal evidence promotion, As-Built and human acceptance.
11. Record Outcome.
12. Only after acceptance may successor methodology work rely on the 014j
    runtime capability.

## Handoff

014j answers one deliberately smaller question:

> Can the current trusted system independently validate and accept the runtime
> machinery needed to observe future candidate methodology behavior, without
> requiring that machinery to prove itself?

The intended answer is an induction step rather than a circle:

```text
pre-014j trusted N
        |
        | ordinary deterministic evaluation
        v
014j candidate runtime substrate
        |
        | trusted-N PASS + human acceptance
        v
accepted observation substrate
        |
        | used only by later successor work
        v
trusted N can inspect candidate N+1
without granting N+1 authority
```

If 014j cannot be proven under that shape, it must stop before implementation
rather than introducing another recovery bridge.

**This is a draft brief. It does not alter 014g, establish N+1 trust, or
authorize methodology promotion.**
