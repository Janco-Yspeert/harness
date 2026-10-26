# Spike 014k - Trusted Methodology Successor Evaluation and Adoption

**Status:** Draft for Brief Readiness and human review; not frozen

**Trusted predecessor methodology N:** sequence `5`, methodology `sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`, revision `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`

**Depends on:** accepted Spike 014j bootstrap-closed evaluation substrate and its completed governed closeout

**Accepted 014j implementation:** `93ade31b1dcb6487798b27e812dc443fce30af43`

**014j human acceptance:** `spikes/014j-bootstrap-closed-evaluation-substrate/human-acceptance.md`

**Purpose:** establish, independently evaluate and explicitly adopt one methodology successor N+1 under trusted methodology N

## Context

Spike 014j established the missing bootstrap substrate required for safe methodology evolution.

Trusted methodology N can now rely on an accepted host/root-owned operation that reconstructs an exact committed candidate `evaluator-verify` composition, supplies bounded host-owned evaluator inputs, executes the candidate composition as a contained non-authoritative subject, seals the resulting evaluator-private evidence, and exposes only identity-bound lifecycle/provenance facts publicly.

014j also separated provider launch selection from concrete provider attestation, removing a recurring failure in protected evaluator execution.

014j deliberately stopped before changing methodology trust.

Trusted methodology remains sequence `5`.

The next problem is now tractable without circular authority.

Candidate methodology N+1 may introduce new evaluator contracts, archival semantics and future evaluator-facing prepared-observation authority. Trusted N can inspect those proposed behaviors using the already accepted 014j substrate without first making N+1 authoritative.

Spike 014k performs that transition.

It must solve the defects exposed across 014g through 014j while preserving one strict rule:

> Candidate N+1 must never supply the authority by which trusted N decides that N+1 should become trusted.

The accepted 014j substrate is the bootstrap boundary.

014k must not replace that boundary with a new candidate-owned one during its own evaluation.

## Question

Can Harness use trusted methodology N plus the already accepted 014j observation substrate to:

1. independently evaluate the exact proposed methodology N+1;
2. make prepared candidate observations an ordinary governed evaluation concept for future methodology generations;
3. separate evaluator verdicts from evidence archival state;
4. represent nonterminal evaluator executions without fabricating missing terminal evidence;
5. archive exact evaluator revisions without requiring redundant historical copies;
6. obtain explicit human trust authority for the exact independently evaluated candidate methodology;
7. append one forward-only trusted N+1 record; and
8. prove that a fresh ordinary Workflow Grant resolves under N+1?

## Core bootstrap invariant

014k is allowed to depend on:

- trusted methodology N;
- the accepted repository/runtime state preceding 014k;
- accepted 014h containment;
- accepted 014i candidate-subject execution;
- accepted 014j prepared candidate-observation substrate;
- explicit human/root authority already available before N+1 adoption.

014k must not require any authority introduced only by candidate N+1 in order to establish the authoritative trusted-N verdict on N+1.

This applies to every mandatory acceptance criterion.

Candidate N+1 may introduce and demonstrate new evaluator-facing operations, contracts or workflow semantics.

Those candidate capabilities may be:

- inspected statically;
- exercised through ordinary deterministic tests;
- executed as bounded non-authoritative candidate behavior;
- observed through the accepted 014j substrate.

They may not become authoritative merely because trusted N needs to inspect them.

If Evaluator Prepare discovers that a mandatory K criterion can only be established by first granting authority introduced by K, preparation must stop before freeze.

Do not freeze a recursively impossible procedure and defer discovery until verification.

## Preserve the accepted observation ladder

The accepted 014j prepared-observation security and authority boundary is part of the substrate used to evaluate K.

014k may add future methodology-facing integration around that substrate, but must not materially change the accepted containment, reconstruction, sealing or authority semantics of the substrate on which K's own trusted evaluation depends.

In particular, K must not weaken or replace:

- exact committed candidate reconstruction;
- host-owned resolution of evaluator-private material;
- bounded host-created observation inputs;
- candidate-subject non-authority;
- evidence sealing outside subject write authority;
- identity-bound prepared-observation records;
- trusted resolution of sealed evidence.

If satisfying K requires materially changing those accepted invariants, stop and split the prerequisite change into a separately evaluated predecessor rather than modifying the ladder while standing on it.

## Authority model

The required K authority chain is:

```text id="2n8uux"
trusted methodology N
        |
        | owns evaluator preparation and authoritative verdict
        |
        +-----------------------------+
        |                             |
        | ordinary N evidence         | accepted 014j observation authority
        |                             |
        v                             v
candidate N+1 source          bounded execution of exact
and deterministic tests       candidate N+1 evaluator behavior
                                      |
                                      v
                              host-owned sealed evidence
                                      |
        +-----------------------------+
        |
        v
trusted-N evaluator
        |
        v
authoritative PASS / FAIL / BLOCKED
        |
        | PASS does not itself change trust
        v
evidence archival / closeout
        |
        v
As-Built
        |
        v
explicit human acceptance
and methodology-adoption authority
        |
        v
append exact N+1 trusted-history record
        |
        v
fresh ordinary Workflow Grant
must resolve N+1
```

Candidate N+1 never authors the trusted-N verdict.

Prepared candidate observations are evidence only.

Human acceptance is not inferred from evaluator PASS.

Methodology adoption is not inferred from ordinary evidence archival.

No authority is backdated.

## Scope

### 1. Candidate N+1 methodology

014k must produce one coherent candidate successor methodology N+1.

The candidate may change the methodology policy, evaluator skill/contracts, host-action declarations and supporting generic runtime behavior necessary to implement the frozen K design.

The exact candidate methodology identity must be reconstructible from its exact committed repository revision.

Trusted N must independently bind:

- exact candidate Git commit;
- exact candidate methodology identity;
- exact predecessor methodology identity;
- exact trusted-N evaluator revision;
- exact authoritative verification result;
- exact admitted prepared-observation evidence where used.

The candidate methodology must not contain a route by which it can approve, promote or establish trust in itself.

### 2. First-class prepared-observation semantics for future trusted evaluators

Candidate N+1 must make required prepared candidate observations an explicit governed evaluation concept rather than an out-of-band convention.

The exact contract/API representation is a Design Map decision.

The future N+1 evaluator path must be able to describe, before authoritative verification depends on the evidence:

- that a prepared observation is required;
- the observation purpose or procedure identity;
- the candidate and evaluator revision to which it applies;
- required host-owned input classes;
- the resulting sealed observation identity;
- which evaluator criterion/procedure consumes the observation.

The evaluator-facing authority must not expose arbitrary evaluator-private paths or bytes.

The host remains responsible for:

- resolving exact frozen private material;
- constructing host-owned observation inputs;
- launching the bounded candidate subject;
- sealing evidence;
- recording lifecycle/provenance;
- rejecting identity mismatches.

The new future evaluator interface may request or declare such work through governed authority, but K's own trusted-N evaluation must use the already accepted J/root path when actual prepared evidence is needed.

K must therefore prove both:

1. the new N+1 evaluator-facing interface behaves correctly as candidate software; and
2. N can independently judge that behavior without granting that new interface authority during K.

### 3. Evaluator verdict is separate from archival state

Candidate N+1 must establish a clear separation between:

**Evaluation fact**

- PASS
- FAIL
- BLOCKED
- exact evidence identities
- exact candidate/revision provenance

and:

**Archival/closeout state**

- evidence retained;
- evidence archive complete/incomplete;
- archive operation succeeded/failed;
- promotion/adoption still permitted or blocked.

The evaluator owns the semantic verdict.

It must not decide an ordinary `ELIGIBLE` / `INELIGIBLE` archival policy outcome that can transform or obstruct the meaning of its own PASS.

A valid semantic PASS remains PASS if later evidence archival fails.

An archival failure may block As-Built, human trust adoption or methodology promotion.

It must not require rerunning semantic evaluation solely to recreate the same PASS.

The exact replacement artifact names and schemas are Design Map decisions.

### 4. Correct verification-attempt lifecycle semantics

Candidate N+1 must distinguish at least:

#### NONTERMINAL

A verification attempt was allocated, but no semantic evaluator result was finalized.

Examples include:

- provider launch failure;
- provider process failure;
- missing semantic-result handshake;
- infrastructure termination before the evaluator could produce PASS/FAIL/BLOCKED.

A NONTERMINAL attempt has durable execution/provenance history but no terminal evaluator artifact.

It must not require a fictional `eval-result` file.

It must not be classified as lost terminal evidence.

#### TERMINAL

A semantic evaluator result was finalized:

- PASS;
- FAIL;
- BLOCKED.

A terminal attempt must bind its terminal evaluator artifact and result identity.

#### LOST

Evidence that authoritative history proves previously existed but is no longer available.

LOST is exceptional.

It must not be inferred merely because a path expected by an archival layout was never created.

Ordinary future archival must preserve the complete attempt sequence, including NONTERMINAL entries, without requiring terminal artifacts for them.

### 5. Correct evaluator-revision archival semantics

A complete, identity-valid active frozen evaluator revision is authoritative evidence.

It may be archived directly from its canonical active location.

The archive mechanism must not require the active revision to have already been redundantly copied into a historical-revision directory merely to count as existing evidence.

When an evaluator revision is superseded, the prior exact revision must remain reconstructible and durably retained according to the methodology's archival rules.

The archive must preserve:

- revision identity;
- freeze metadata;
- complete inventory;
- exact bytes for archived evaluator material;
- revision lineage.

Do not label an intact active revision as lost merely because a historical copy does not yet exist.

### 6. Host-owned deterministic post-PASS archival

After an authoritative PASS, Harness must be able to derive and perform the required evaluator evidence archival deterministically from trusted policy and exact evidence identities.

The host, not a second evaluator/model decision, owns the byte movement and identity verification.

The archive operation must:

- preserve exact PASS provenance;
- preserve terminal prior attempts;
- preserve nonterminal attempt provenance without inventing terminal artifacts;
- preserve all evaluator revisions required by the successful cycle;
- fail closed on changed/missing required bytes;
- never silently produce a partial archive while claiming complete closeout;
- record archive completeness separately from semantic evaluator result.

Archive failure must be recoverable as archive failure.

It must not rewrite the verification result.

### 7. Trusted-N evaluation of candidate N+1

014k's candidate methodology must be independently evaluated by trusted methodology N.

Trusted N may use prepared observations created through accepted 014j authority where direct observation of candidate N+1 evaluator behavior is required.

Those observations must be:

- prepared against the exact active candidate;
- bound to exact evaluator/procedure identities;
- sealed before trusted evaluation consumes them;
- non-authoritative;
- admitted or rejected by trusted N.

Candidate N+1 does not decide whether its own prepared evidence is sufficient.

Trusted N remains solely responsible for the final K verification result.

### 8. Explicit human methodology adoption

An authoritative trusted-N PASS is necessary but insufficient to change trusted methodology.

After:

- exact trusted-N PASS;
- required evidence archival/closeout;
- As-Built;
- human review of the exact candidate;

there must be an explicit human methodology-adoption authority bound to:

- exact candidate commit;
- exact candidate methodology identity;
- exact trusted predecessor methodology identity/sequence;
- exact trusted-N PASS;
- exact archive/closeout provenance required by policy.

Only then may the trusted methodology history advance.

The adoption operation must reconstruct the candidate methodology from the exact candidate commit and refuse:

- candidate drift;
- predecessor drift;
- mismatched methodology identity;
- mismatched evaluation candidate;
- mismatched trusted predecessor;
- replay of stale adoption authority.

Trusted history remains append-only.

### 9. Real forward cutover

A successful methodology promotion is not proven merely by appending a trusted-history line.

After N+1 is durably recorded, 014k must perform a fresh ordinary governed allocation that is created after the trust transition.

That allocation must demonstrate that:

- the latest trusted record is N+1;
- the methodology is reconstructed from the exact adopted revision;
- the resulting Workflow Grant binds N+1;
- the active roles/contracts/skills pass the ordinary trust-equivalence gate.

This observation must be recorded as post-adoption cutover evidence.

It must not be backdated into the trusted-N PASS that justified adoption.

Existing pre-cutover workflow grants remain bound to their original methodology.

## Legacy trusted-N closeout during 014k

014k itself is evaluated under the current trusted methodology N and its evaluator-v14 archival rules.

Those rules contain known archival defects.

If K obtains a genuine trusted-N PASS but old-N archival again becomes `INELIGIBLE` solely because of a previously demonstrated legacy promotion-policy defect, the existing bounded legacy complete-archive or loss-aware recovery may be used to close **the K trusted-N evaluation cycle only**, provided its existing authority and evidence requirements are truthfully satisfied.

Such recovery:

- must not alter the PASS;
- must not fabricate evaluator evidence;
- must not be counted as evidence that N+1 archival semantics work;
- must remain identifiable as old-N compatibility closeout;
- must not be copied into N+1 as ordinary architecture.

The N+1 archival behavior must be independently established by K's frozen evaluation procedures.

## Required behavior

1. K evaluation is bootstrap-closed under trusted N plus accepted pre-K substrate.
2. Candidate N+1 can express required prepared observations through explicit governed evaluation semantics.
3. K itself does not depend on those candidate semantics becoming authoritative.
4. Trusted N can independently obtain and consume exact J-prepared evidence of candidate N+1 behavior.
5. Candidate N+1 cannot finalize, alter or promote its own trusted-N verdict.
6. Semantic evaluator PASS/FAIL/BLOCKED is independent of later archival success.
7. NONTERMINAL attempts are durable first-class history without fictional terminal artifacts.
8. TERMINAL attempts retain exact result evidence.
9. LOST means evidence known to have existed and actually unavailable, not merely an absent expected path.
10. The active frozen evaluator revision can be archived directly from identity-valid canonical bytes.
11. Post-PASS archive operation is deterministic and host-owned.
12. Archive failure does not mutate the semantic verification result.
13. Trusted N independently PASSes the exact K candidate before N+1 adoption.
14. Explicit human authority binds the exact candidate, methodology, predecessor and PASS before trusted history changes.
15. Trusted history advances exactly once and forward-only.
16. A fresh post-cutover ordinary Workflow Grant binds N+1 and passes trust equivalence.

## Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01 - Bootstrap closure** | Every mandatory 014k evaluation procedure is executable under trusted N plus accepted pre-K substrate. No mandatory criterion requires a K-introduced authority to become authoritative before K PASS. Evaluator Prepare must stop before freeze if this cannot be demonstrated. |
| **AC02 - J substrate preservation** | K does not materially weaken or replace the accepted 014j candidate reconstruction, containment, private-material resolution, evidence sealing or prepared-observation authority boundary used for K's own evaluation. Any future evaluator-facing integration is additive around that substrate. |
| **AC03 - Future observation declaration** | Candidate N+1 provides an explicit governed way for a trusted evaluator to declare/request required prepared candidate observations with exact candidate, evaluator/procedure and evidence bindings, without accepting arbitrary private paths or bytes. |
| **AC04 - Non-authoritative candidate observation** | Candidate N+1 evaluator behavior exercised through prepared observation remains structurally non-authoritative. Subject results/actions cannot finalize verification, mutate trusted workflow state, alter methodology trust or perform adoption. |
| **AC05 - Trusted-N admission** | Trusted N can consume exact sealed prepared-observation evidence created through accepted J authority, independently validate its bindings, and decide whether to admit it. Candidate N+1 has no authority over that admission decision. |
| **AC06 - Verdict/archive separation** | Candidate N+1 represents semantic verification result independently from evidence archive status. A controlled post-PASS archive failure leaves the exact PASS unchanged while preventing closeout/adoption as policy requires. |
| **AC07 - Nonterminal attempts** | An allocated evaluator execution that ends before semantic PASS/FAIL/BLOCKED is recorded as NONTERMINAL history and requires no terminal evaluator artifact. Subsequent verification and successful archival remain possible without declaring that nonexistent artifact lost. |
| **AC08 - Terminal and lost evidence semantics** | Terminal attempts require exact result evidence. LOST state is used only when durable authority establishes that evidence previously existed and is unavailable. Missing paths for never-produced terminal artifacts are not LOST. |
| **AC09 - Active revision archival** | A complete identity-valid active evaluator revision can be archived directly from its canonical active bytes. Absence of a pre-existing historical snapshot does not make the revision ineligible or lost. |
| **AC10 - Deterministic host archival** | After PASS, trusted policy plus exact evidence identities are sufficient for the host to construct and execute the ordinary archive operation without a second evaluator eligibility decision. Changed/missing required bytes fail closed; successful archival records exact provenance. |
| **AC11 - Trusted-N sole verdict authority** | The authoritative K PASS/FAIL/BLOCKED is produced only by trusted methodology N and binds the exact candidate commit, exact candidate methodology identity, trusted predecessor and admitted observation evidence. |
| **AC12 - Explicit adoption authority** | Trusted-N PASS alone cannot append N+1. Human methodology-adoption authority must bind exact candidate commit, N+1 methodology identity, predecessor N identity/sequence, trusted-N PASS and required closeout evidence. Drift or replay is refused. |
| **AC13 - Append-only trust transition** | Trusted methodology history advances exactly once from sequence 5 N to the exact independently evaluated N+1. Earlier trusted records remain unchanged and pre-adoption executions are not retroactively classified as N+1 authority. |
| **AC14 - Fresh cutover proof** | After adoption, a newly created ordinary governed workflow/allocation reconstructs and binds N+1 through the standard trust-equivalence path. The proof is generated after cutover and remains distinct from the N-authored PASS. |
| **AC15 - Regression preservation** | Existing accepted 014h containment, 014i candidate-subject, 014j prepared-observation and model-attestation guarantees remain green, except where a frozen K requirement explicitly supersedes old evaluator/archive semantics. |

## Required deterministic evidence

Evaluator preparation must establish before implementation that every mandatory evidence procedure is bootstrap-closed.

At minimum K evaluation must be able to establish:

1. exact candidate N+1 methodology reconstruction from a committed fixture;
2. candidate N+1 cannot mutate trusted history during evaluation;
3. candidate future observation request/declaration accepts only bounded identity-bearing inputs;
4. arbitrary private path/content injection is refused;
5. candidate evaluator behavior can be run through the accepted J observation path without granting N+1 authority;
6. prepared evidence is sealed and exact before trusted N consumes it;
7. trusted N can independently reject mismatched/tampered prepared evidence;
8. semantic PASS persists across a deliberately failed archive operation;
9. failed archive prevents closeout/adoption without mutating PASS;
10. an allocated provider/executor failure produces NONTERMINAL history with no required terminal evaluator artifact;
11. a later terminal attempt can PASS and archive successfully despite earlier NONTERMINAL history;
12. a genuine terminal result missing after previously being recorded is treated differently from a never-produced result;
13. an identity-valid active evaluator revision archives without requiring an existing `.eval/revisions/<id>/` copy;
14. changed active revision bytes fail archival;
15. host-owned archive construction uses exact evidence identities and performs no evaluator eligibility judgment;
16. stale or mismatched human adoption authority is refused;
17. candidate methodology differing from the independently evaluated candidate is refused;
18. predecessor trust drift is refused;
19. the trusted-history append is forward-only;
20. a fresh post-adoption ordinary allocation resolves the adopted methodology;
21. accepted 014h, 014i and 014j regressions remain intact;
22. the full repository regression suite remains green apart from explicitly documented unchanged environmental baseline failures.

## Execution sequence

1. Run Brief Readiness on this draft.
2. Brief Readiness must explicitly assess bootstrap closure and the accepted-J preservation boundary.
3. Freeze the clarified 014k brief.
4. Produce a Design Map covering only the shared contracts needed for:
   - future evaluator prepared-observation declaration/request semantics;
   - trusted-N use of accepted J prepared evidence;
   - evaluator result versus archive state;
   - NONTERMINAL / TERMINAL / LOST attempt lifecycle;
   - active evaluator-revision archival;
   - deterministic host-owned post-PASS archival;
   - exact human methodology adoption and cutover observation.
5. Prepare independent evaluation under trusted methodology N.
6. Before evaluator freeze, map every mandatory criterion to an evidence path that uses only trusted N plus accepted pre-K substrate.
7. If any mandatory procedure recursively depends on K authority, stop before implementation.
8. Implement the smallest coherent candidate methodology N+1 and supporting runtime changes required by the frozen design.
9. Where candidate N+1 behavior itself must be observed, prepare exact evidence through the accepted 014j host/root observation substrate.
10. Run independent trusted-N verification of the exact K candidate.
11. On genuine PASS, complete K's N-side evidence archive. If and only if old-N's already-known archival defect obstructs that closeout, use the existing bounded legacy recovery truthfully.
12. Run governed As-Built.
13. Stop for explicit human acceptance and methodology-adoption authority.
14. Reconstruct the exact candidate methodology from the accepted candidate commit and append the forward trusted N+1 record using the existing trusted-history promotion boundary.
15. Create one fresh ordinary governed workflow/allocation after adoption and record that it resolves N+1 through standard trust equivalence.
16. Run governed Outcome under K's pinned workflow authority.
17. Only then treat N+1 as the methodology baseline for subsequent work.

## Non-goals

014k does not:

- materially redesign or replace the accepted 014j prepared-observation/containment substrate that K relies on for its own evaluation;
- perform broad cleanup or deletion of legacy observation/archive-recovery machinery merely because N+1 makes some of it obsolete;
- reopen or reinterpret Spike 014g;
- complete Spike 014f or the external-project canary as part of the methodology transition;
- broaden the accepted 014j model-selector/exact-attestation semantics unless a concrete K requirement demonstrates they are insufficient for trusted successor evaluation.

## Handoff

A successful 014k establishes the ordinary methodology-evolution path that Spike 014 has been working toward:

```text id="iswuvm"
trusted N
    |
    | independently evaluates
    v
exact candidate N+1
    |
    | candidate behavior may be observed
    | only through accepted non-authoritative substrate
    v
trusted-N PASS
    |
    | evidence archived independently of verdict
    v
human adoption authority
    |
    v
trusted N+1
    |
    v
fresh ordinary N+1 Workflow Grant
```

After that transition, candidate methodology evolution no longer requires a bespoke bootstrap bridge merely because the candidate changes evaluator behavior.

The repository may still contain legacy recovery and overlapping observation machinery required to cross the transition safely.

Removing that machinery is subsequent consolidation work, not a condition of 014k success.

**This is a draft brief. It does not establish N+1 trust, alter trusted history, or authorize methodology promotion before independent trusted-N PASS and explicit human adoption.**
