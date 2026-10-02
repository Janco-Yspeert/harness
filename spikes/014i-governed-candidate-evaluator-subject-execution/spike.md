# Spike 014i - Governed Candidate Evaluator Subject Execution

**Status:** Draft for Brief Readiness and human review; not frozen  
**Depends on:** accepted Spike 014h host-owned filesystem isolation  
**Unblocks:** Spike 014g verifier-containment composition  
**Primary use case:** trusted evaluator N observing the actual proposed evaluator composition of candidate methodology N+1 without allowing N+1 to evaluate itself

## Context

Spike 014g exposed a methodology-evolution problem.

Trusted methodology N must independently evaluate candidate methodology N+1.

However, part of the 014g candidate changes the evaluator itself. In particular, candidate `651352329cca473fb920139e1496f9f508eeabbb` proposes a reduced evaluator composition using narrower repository authority and host-mediated evidence publication.

Trusted evaluator N cannot simply launch itself under that candidate composition, because doing so would allow candidate N+1 authority to participate in deciding whether N+1 should become trusted.

Nor can trusted N fairly evaluate candidate behavior solely by running the relevant containment regression under N's own broader evaluator authority. That changes the environmental premise of the test.

014g therefore requires two distinct things:

1. **trusted N remains the sole authoritative evaluator**;
2. **candidate N+1's proposed evaluator composition is exercised as behavior under test**.

Previous 014g attempts established this distinction but could not obtain admissible evidence from the candidate subject.

Attempt 005 demonstrated the remaining gap clearly:

- the candidate subject was exercised;
- one containment observation reported `write-harness: yes`;
- the retained evidence contained only summarized output rather than the complete raw runner/boundary-probe transcript;
- trusted N therefore correctly refused to attribute the observation to the candidate;
- trusted N also could not create the necessary disposable checkout itself from inside its protected execution environment.

Spike 014h has since supplied the missing filesystem substrate:

- every spawned registered provider runs inside host-owned `bubblewrap`;
- Role Grant workspace visibility and read/write modes are enforced by Harness;
- protected mixed workspace compositions work;
- synthetic provider homes work;
- evaluator identity can be supplied directly by the host;
- protected Claude execution can run unattended;
- bounded host-mediated evidence publication exists.

014i must reuse those primitives.

It must not build a second sandbox or redesign evaluator execution generally.

## Question

Can Harness execute the **exact evaluator role proposed by candidate methodology N+1** as a non-authoritative subject, inside host-owned containment, capture complete host-owned raw evidence of its behavior, and make that evidence available read-only to trusted evaluator N for authoritative adjudication?

## Authority model

The authority relationship is:

```text id="9g8d66"
candidate methodology N+1
        |
        | defines exact evaluator composition
        v
non-authoritative candidate evaluator subject
        |
        | behavior observed by host
        v
host-owned immutable subject evidence
        |
        | read-only evidence
        v
trusted evaluator N
        |
        v
authoritative PASS / FAIL / BLOCKED
```

Candidate N+1 never becomes evaluator authority during this process.

Only trusted N may decide whether the candidate satisfies the frozen 014g criteria.

The candidate subject may behave exactly as its proposed evaluator would behave, including:

- reading its granted repository;
- writing its granted private workspace;
- calling granted host actions;
- invoking tests and tools;
- submitting a semantic result.

Those actions are observations of candidate behavior.

They must not:

- finalize the real 014g verification;
- write the authoritative 014g `verification-result.json`;
- promote evidence into trusted evaluator history;
- mutate trusted methodology history;
- establish N+1 trust;
- perform human acceptance;
- advance the real 014g workflow.

## Scope

014i implements one bounded host-owned operation for **candidate evaluator subject execution**.

The production authorization is evaluator-specific:

> execute the exact `evaluator-verify` composition proposed by a committed candidate methodology as a non-authoritative subject.

Internal code should avoid unnecessary evaluator-specific coupling where a small role-oriented abstraction is natural, but 014i does not expose arbitrary candidate-role execution.

---

# 1. Exact candidate reconstruction

The host must reconstruct the subject from committed candidate methodology bytes.

Bind at minimum:

- exact candidate Git commit;
- exact candidate methodology identity;
- role name `evaluator-verify`;
- exact skill identity and bytes;
- exact contract identity and bytes;
- declared capabilities;
- workspaces and exposure classes;
- read/write modes;
- host actions;
- executor constraints;
- frozen subject inputs.

Do not resolve the subject from mutable working-tree methodology files.

Reject:

- uncommitted candidate methodology;
- methodology identity mismatch;
- missing candidate role;
- skill or contract mismatch;
- unsupported workspace composition;
- authority that cannot be represented by the current host.

The subject must exercise what N+1 actually proposes, not a hand-written approximation of it.

---

# 2. Non-authoritative subject execution

Candidate evaluator execution must be structurally separate from ordinary authoritative workflow execution.

The subject may use the normal governed provider adapter, worker protocol and 014h containment where applicable.

However, subject operations must be mediated through a subject execution boundary.

## `submitResult`

A candidate subject may call `submitResult`.

Harness must:

- validate it against the candidate role's own contract;
- record the complete request and host response;
- retain it as subject evidence.

It must **not** convert that result into an authoritative workflow transition.

A candidate subject saying `PASS` proves only that the candidate subject said `PASS`.

## `requestAction`

A candidate subject may exercise host actions granted by candidate N+1.

Those actions must operate only on disposable subject fixtures created for this execution.

For example, candidate host-mediated evidence publication may write and commit into the disposable subject repository.

It must never publish into the real 014g workflow merely because the candidate contract grants an evidence action.

Record:

- complete action request;
- host validation result;
- complete response;
- resulting disposable-fixture state.

## Human/root actions

The subject receives no independent human/root authority merely because its proposed role could normally participate in a workflow that later reaches such a gate.

014i subject execution is observational.

---

# 3. Host-created disposable environment

Trusted evaluator N must not be responsible for constructing the candidate subject environment.

The host creates it before the subject launches.

At minimum provide:

- disposable repository/fixture root;
- exact frozen public test inputs required by the subject;
- subject-private writable workspace where required;
- disposable scratch;
- bounded subject host-action destination;
- sacrificial forbidden roots needed by containment probes.

Reuse 014h's host-owned filesystem isolation.

The real Harness repository must never be used as the destructive target for a containment escape test.

If a probe needs to determine whether the subject can write "Harness", create a sacrificial fixture representing that forbidden boundary.

The host must retain enough before/after state to determine externally whether an attempted mutation actually occurred.

Trusted N should consume the resulting observations, not create the checkout itself.

---

# 4. Raw subject evidence

The primary defect exposed by 014g attempt 005 was insufficient evidence.

014i therefore requires complete raw evidence for the bounded candidate-subject procedure.

The host owns the evidence capture.

The evidence root must be outside every subject-writable workspace.

Capture at minimum:

- subject execution identity;
- exact candidate commit;
- candidate methodology identity;
- role, skill and contract identities;
- resolved capabilities and host actions;
- exact workspace IDs, exposure and modes;
- filesystem-isolation metadata;
- provider and configured execution profile;
- provider attestation separately where available;
- exact fixture/input identities;
- exact runner/probe identities;
- complete ordered worker-tool requests and host responses relevant to the subject procedure;
- complete raw runner/probe stdout and stderr;
- exit status;
- candidate subject `submitResult`, if any;
- every candidate subject host-action request and result;
- before/after observations for required containment targets;
- identities of retained evidence files.

A human-readable summary may also be produced.

The summary is not a substitute for the raw evidence.

Do not capture provider hidden reasoning or unrelated credentials.

The subject fixture must contain no real secrets that would make the required transcript unsafe to retain.

---

# 5. Evidence integrity

After subject execution completes, create a manifest binding the retained evidence.

The manifest must bind at minimum:

- candidate;
- candidate methodology identity;
- candidate evaluator composition;
- runtime commit;
- subject execution;
- fixture/input identities;
- runner/probe identities;
- retained artifact identities.

Once sealed:

- the candidate subject cannot modify the evidence;
- trusted N receives it read-only;
- missing or modified required evidence invalidates the bundle;
- path escape or substitution invalidates the bundle;
- truncated raw runner/probe output must be distinguishable from a genuine complete failure result.

Do not create a general forensic logging framework.

The evidence requirement is limited to what trusted N needs to attribute the specific candidate-subject behavior being evaluated.

---

# 6. Subject lifecycle and failure classification

Keep candidate-subject status separate from authoritative evaluator status.

A minimal lifecycle is sufficient:

```text id="tymo86"
prepared
running
completed
infrastructure-failed
evidence-incomplete
evidence-sealed
```

Candidate semantic PASS/FAIL/BLOCKED remains data inside the subject evidence.

It is not the lifecycle result of trusted verification.

Distinguish at least:

- candidate subject behavior completed;
- provider/runtime infrastructure failed;
- subject itself failed/crashed;
- evidence capture was incomplete;
- sealed evidence integrity failed.

Do not blindly rerun a subject merely because the observed behavior is unfavorable.

A genuine candidate failure is evidence, not infrastructure noise.

---

# 7. Trusted N consumption

Trusted evaluator N must be able to consume the sealed subject evidence read-only using its existing authority.

N must not require:

- candidate N+1 evaluator authority;
- repository-write authority solely to inspect the subject;
- Git commit authority solely to inspect the subject;
- authority to construct another disposable checkout;
- modification of N's frozen evaluation criteria.

The bundle should be exposed through the smallest already-supported evidence surface that revision `002` can legitimately inspect.

014i must not reinterpret 014g criteria.

Its job is to produce admissible observations.

Trusted N decides what they mean.

---

# 8. Bootstrap and current runtime

014i builds on accepted 014h.

Do not reimplement:

- `bubblewrap` containment;
- Role Grant workspace enforcement;
- synthetic homes;
- mixed read/write workspace handling;
- provider model/configuration provenance;
- unattended protected Claude execution where the current runtime already provides it;
- host-issued execution identity;
- terminal-outcome guidance;
- ordinary bounded evidence publication.

Current branch history also contains bootstrap/runtime repairs created while completing 014h.

014i may reuse a specific existing primitive when its Design Map establishes that the primitive is required for candidate-subject execution.

Its mere presence in current HEAD does not make unrelated bootstrap recovery behavior part of 014i's product.

In particular, loss-aware evaluator promotion is not part of this spike.

---

# 9. Deterministic evaluation

014i itself must be independently evaluable without depending on successful completion of 014g.

Use Harness-owned synthetic candidate methodology fixtures.

At minimum prove:

1. the host reconstructs an exact committed candidate evaluator composition;
2. working-tree drift does not change the subject;
3. the subject runs with the candidate-defined workspace modes and capabilities;
4. subject `submitResult` is captured but cannot advance the real workflow;
5. subject host actions affect only disposable fixture state;
6. a contained subject produces externally confirmed denied/unchanged observations;
7. a deliberately escaping or over-authorized fixture produces externally confirmed changed observations;
8. complete raw runner/probe output is retained for both;
9. the subject cannot alter its retained evidence;
10. tampered, missing or truncated evidence is refused;
11. trusted-side inspection requires read-only evidence access only;
12. no subject execution creates methodology trust, verification-finalized, promotion or human-acceptance authority;
13. existing 014h containment and governed execution regressions remain green.

Prefer deterministic placeholder-provider fixtures for most evaluation.

Do not consume repeated live provider calls where the new property can be established without them.

---

# Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01** | Harness can reconstruct the exact committed `evaluator-verify` role proposed by candidate methodology N+1, including its skill, contract, capabilities, workspace modes and host actions; working-tree drift or identity mismatch is rejected. |
| **AC02** | The candidate evaluator executes as a structurally non-authoritative subject. Its `submitResult` and host actions are exercised and recorded but cannot finalize verification, establish trust, promote methodology or advance the real workflow. |
| **AC03** | Subject workspaces are created by the host and enforced using the accepted 014h containment primitive. Trusted N is not responsible for creating the disposable subject checkout. |
| **AC04** | Subject host actions operate only on disposable fixture state. The real Harness/014g workflow cannot be mutated by candidate-subject authority. |
| **AC05** | The host retains complete raw evidence required for attribution, including runner/probe output, relevant worker-tool requests/responses, host-action results, exit status and externally verified containment observations. Summary-only evidence is insufficient. |
| **AC06** | Retained subject evidence is sealed outside every subject-writable workspace and bound to the exact candidate, methodology composition, runtime, fixtures and runner/probe identities. Tampering, omission, truncation or path substitution fails closed. |
| **AC07** | Controlled fixtures demonstrate both a correctly contained subject and a deliberately escaping/over-authorized subject, and trusted inspection can attribute the different outcomes from the sealed raw evidence without trusting the subject's own prose. |
| **AC08** | Trusted evaluator N can consume the sealed subject evidence read-only without receiving candidate N+1 authority, constructing its own disposable checkout or changing the frozen evaluation criteria. |
| **AC09** | Existing 014h filesystem isolation, evaluator-private, governed execution, evidence-action, trust and promotion regressions remain green. |
| **AC10** | Internal implementation may use a small role-oriented subject abstraction, but production authorization in 014i is restricted to candidate `evaluator-verify` execution. No arbitrary candidate-role execution API is exposed. |

---

# Out of scope

014i does not:

- change candidate `651352329cca473fb920139e1496f9f508eeabbb`;
- change the recovered 014g brief or Design Map;
- modify frozen 014g evaluator revision `002`;
- reinterpret 014g attempts 001-005;
- make N+1 authoritative before promotion;
- redesign evaluator PASS/FAIL/BLOCKED semantics;
- build another filesystem sandbox;
- implement arbitrary methodology-role simulation;
- implement historical N→N+k replay;
- implement cross-project agent simulation;
- build a generic tracing platform;
- redesign loss-aware promotion;
- resume Stockdif;
- complete 014f.

---

# Execution sequence

1. Run Brief Readiness on this draft.
2. Freeze the clarified 014i brief.
3. Produce a small Design Map focused on:
   - candidate reconstruction;
   - non-authoritative worker-tool mediation;
   - disposable fixtures;
   - raw evidence capture;
   - sealing and trusted-N consumption.
4. Prepare/freeze independent deterministic evaluation before implementation.
5. Implement by reusing 014h and existing runtime primitives.
6. Independently verify the exact 014i candidate.
7. Promote eligible evaluator evidence and run As-Built normally.
8. Stop for human acceptance.

Do **not** use an unaccepted 014i candidate to manufacture the evidence that unblocks 014g.

---

# Post-acceptance real use

After 014i is independently PASSed and human-accepted, use its accepted runtime exactly once for the preserved 014g recovery.

The host must:

1. bind candidate `651352329cca473fb920139e1496f9f508eeabbb`;
2. reconstruct its exact proposed `evaluator-verify` composition;
3. create the disposable subject environment;
4. bind the frozen 014e regression identity required by 014g, including the preserved test blob `4b361f81e307e129be6d106c9df9a4910e674be9`;
5. launch the candidate evaluator as a non-authoritative subject;
6. exercise the smallest frozen procedure required by 014g AC03;
7. retain and seal complete raw subject evidence;
8. publish that evidence through the accepted host-owned evidence path;
9. give unchanged trusted evaluator revision `002` read-only access to it;
10. allocate the next 014g verification attempt under trusted N.

Preserve 014g attempts 001-005 unchanged.

Do not create evaluator revision `003` merely to lower the evidence bar.

If the candidate subject genuinely demonstrates a containment failure, preserve it and allow trusted N to adjudicate it normally.

If infrastructure or evidence capture fails, keep 014g blocked and diagnose that failure rather than reinterpreting the candidate.

---

# Handoff

014i answers one question:

> How can trusted evaluator N observe the real behavior and authority envelope of candidate evaluator N+1 without letting N+1 become the judge of its own trust transition?

The answer is:

> execute the exact candidate evaluator composition as a non-authoritative subject, capture complete host-owned evidence outside its authority, and give that evidence read-only to trusted N.

Once 014i is accepted and the resulting evidence has been adjudicated by trusted N, return to 014g and finish the existing methodology-evolution chain.
