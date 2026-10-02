# Brief Readiness Feedback — Spike 014i Governed Candidate Evaluator Subject Execution

Reviewed: `spikes/014i-governed-candidate-evaluator-subject-execution/spike.md`
(`sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`).
Skill: `brief-readiness`, contract version 5.

## Findings

### C1 — Material clarification (non-blocking): subject lifecycle and sealed-bundle state

Brief: section 6 and section 5. The lifecycle names `prepared`, `running`,
`completed`, `infrastructure-failed`, `evidence-incomplete`, and
`evidence-sealed`, but does not define which host-owned record carries those
states or the exact terminal conditions for moving from execution completion to
an admissible sealed bundle. The brief also distinguishes candidate semantic
results from infrastructure and evidence failures without specifying their
machine-readable relationship.

Consequence: an implementation and evaluator could disagree about whether a
completed candidate result with incomplete evidence is a completed subject,
an evidence failure, or an inadmissible bundle. The Design Map should define a
small subject record/evidence-manifest shape and the terminal transition rules,
including that sealing is possible only after all required streams and
before/after observations are complete.

Smallest clarification: make the host-owned subject record and sealed evidence
manifest the authoritative lifecycle surface for this operation, and state the
required terminal fields/status mapping. Do not add a second workflow ledger.

### C2 — Material clarification (non-blocking): frozen subject fixture and input identity

Brief: section 3, section 4, AC03, AC07, and the post-acceptance procedure.
The brief requires exact frozen public inputs and runner/probe identities, but
does not identify the concrete fixture package, paths, or input identity that
the subject receives for the independent 014i proof. It also leaves the
"smallest already-supported evidence surface" for trusted-N consumption to a
later role.

Consequence: evaluator preparation could select different fixtures or expose
different input surfaces while still claiming AC03/AC08, weakening
reproducibility and the read-only attribution boundary.

Smallest clarification: have the Design Map/evaluator preparation bind a
deterministic Harness-owned fixture/input identity, exact subject-visible paths,
and the read-only trusted-N evidence path. The later 014g handoff may bind its
separately frozen 014e input identity as already stated.

### C3 — Material clarification (non-blocking): raw-stream completeness and truncation

Brief: section 4, section 5, and AC05–AC07. "Complete raw" stdout/stderr and
ordered worker-tool records are required, and truncated output must be
distinguishable, but the brief does not define the completion/truncation marker,
stream framing, or bounded capture policy. The provider attestation is also
described as separate "where available" evidence without saying whether its
absence is admissible or makes the bundle incomplete.

Consequence: a capture that reaches a byte limit or loses a stream close could
be mistaken for a genuine subject failure, while different evaluators could
apply different rules to missing provider attestation.

Smallest clarification: define in the Design Map/evaluator requirements an
explicit per-stream completion record and fail-closed truncation marker, plus
whether provider attestation is optional metadata or a required field for each
execution profile. Keep the capture bounded and exclude secrets as required by
the brief.

### C4 — Material clarification (non-blocking): suppression of human/root actions

Brief: section 2, "Human/root actions". The current public evaluator contract
declares human permissions (`methodologies/harness/contracts/evaluator-verify.json`),
while the brief requires that the candidate subject receive no independent
human/root authority. The intended subject boundary is clear, but the exact
precedence is not stated.

Consequence: a literal reconstruction of the contract could expose
`requestHuman` during subject execution, allowing an observational subject to
wait for or obtain authority that is explicitly out of scope.

Smallest clarification: state that subject execution always denies or records
`requestHuman` as unavailable, regardless of candidate-declared human
permissions; exact reconstruction applies to role bytes and declared
composition, while the non-authoritative subject boundary removes human/root
authority.

## Repository trace and feasibility

- `src/methodology-evolution.ts` already reconstructs methodology manifests from
  an exact Git revision and validates role contracts, identities, capabilities,
  workspaces, postconditions, and host-action coherence. The proposed exact
  candidate reconstruction can build on that path, but must add the
  `evaluator-verify` subject boundary rather than treating the existing
  methodology exercise as evaluator execution.
- `src/executors/protocol.ts` defines the four worker operations and typed
  result/action vocabularies. `src/executors/governed.ts` currently relays
  `submitResult`, `requestAction`, and human requests into the ordinary
  authoritative execution path; 014i therefore needs a structurally separate
  subject relay/recording boundary as the brief requires.
- `src/claude-workflow.ts` and the 014h implementation provide Role-Grant-derived
  mixed workspace modes and host-owned containment. The brief correctly scopes
  014i to reuse this primitive rather than adding another sandbox.
- The current `evaluator-verify` contract grants repository/evaluation
  workspaces and declares human permissions, which is the basis for C4. Its
  evidence action and read-only repository shape also show that host-mediated
  subject actions need an explicit disposable-fixture destination.
- Public 014g feedback and manifest record the prior subject-evidence gap
  (summary-only output and inability of trusted N to construct the disposable
  checkout), matching the problem statement here.

## Limitations, files, and checks

I read the bound brief completely and inspected `GOALS.md`, the public
methodology contracts, the methodology reconstruction and worker protocol,
the governed relay, the 014h/014g public briefs and feedback, and relevant
visible tests by targeted search. I did not inspect evaluator-private
`eval-spec.md`, `.hidden-test/**`, or `.eval/**` material. I did not run the
test suite because this is a contract review and no implementation change was
requested. The bound brief identity was confirmed with `sha256sum`.

Files changed by this review: `feedback.md` and `manifest.md`. No preliminary
snapshot is required because the review passes. No implementation, Design Map,
or evaluation artifact was created.

**Verdict: Ready after minor clarification**
