# Design Map — 014j Bootstrap-Closed Evaluation Substrate

Frozen brief: `spike.md` (`sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`), verified against the bound identity and committed at `96c218f`.

## Shared contracts

1. **One root-authorized preparation operation.** `prepareCandidateObservation` is a host operation, exposed to an authenticated human/root caller and never as a worker `requestAction`. Its closed request shape is `{ workflow, candidate, evaluatorRevision, evaluatorRevisionIdentity, privateInventoryIdentity, procedure }`; the operation kind fixes the purpose as a candidate `evaluator-verify` observation and the host assigns the observation identity. The host accepts only the workflow's active implementation handoff and active prepared evaluator inventory. Candidate code, provider output, a candidate result, a caller path, and caller-supplied private bytes confer no authority.

2. **Host resolution and accepted execution reuse.** The host resolves the configured evaluator-private workspace, verifies the revision, inventory, procedure and every selected material identity, and reconstructs the exact committed candidate methodology, `evaluator-verify` skill, contract and effective role composition. It then invokes the accepted 014i candidate-subject path through the accepted 014h `containedLaunch` boundary. Preparation adds orchestration, input resolution and durable recording around that path; it does not add another methodology loader, subject relay, execution engine or containment implementation.

3. **Bounded observation inputs.** The selected procedure's tests and declared support files are the only evaluator-private procedure material mounted for the subject. The host also creates canonical read-only topology and before-state inputs; the after-state is captured externally by the host. Procedure material and host inputs occupy host-created roots distinct from the reconstructed repository/evaluation workspaces and subject scratch. The bundle records their identities and records host-created, subject-visible, subject-writable and host-observed sets separately. Host creation alone never implies subject visibility or writability.

4. **Private sealed bundle and canonical record.** A successful preparation seals the existing 014i raw subject bundle beneath the configured evaluator-private workspace at `.eval/prepared-observations/<observation>/bundle/`, outside every subject-visible or subject-writable root. The bundle manifest additionally binds the workflow, candidate composition, Harness runtime commit, evaluator revision and inventory, selected procedure and material identities, host-input identities, containment topology, process outcome and complete worker-tool capture. Existing 014i completeness and integrity validation remains the sealing gate.

   The host then appends one immutable `kernel.prepared-observation` record. Its deterministic `observation` identity is the SHA-256 identity of the canonical record facts excluding the identity field itself. The record binds the workflow, authority origin `human-root`, operation purpose, candidate and composition identities, runtime, evaluator revision/inventory/procedure identities, terminal preparation state, private bundle-manifest identity and private relative location. It contains no private procedure/input bytes, subject output, private absolute paths or other private mechanics. A non-sealed run records an explicit terminal failure state but is not resolvable as prepared evidence.

5. **Trusted-N resolution.** Given an exact `kernel.prepared-observation` identity, the predecessor trusted evaluator reads the safe canonical record and resolves its relative bundle location inside its already-granted evaluator-private workspace. It recomputes the bundle manifest and artifact identities before use. This requires only its existing evaluator-private workspace, repository-read, local-computation and Git-inspect authority. Preparation never copies the bundle to the public repository; only the existing successful-result promotion boundary of a later consuming evaluator attempt may publish eligible bytes.

6. **Distinct model meanings.** The existing `ExecutorProfile.model` and `WorkflowGrant.executor.model` fields are provider launch selectors; the grant value continues to override the profile value. The separate optional exact-concrete constraint is named `exactModel` on `WorkflowGrant.executor` and is propagated as `RoleGrant.executorConstraints.exactModel`. It is never inferred from either selector field.

   Observable execution provenance distinguishes `executor.profile` (the selected profile ID), `executor.requested.model` (the effective launch selector, if any), `executor.required.exactModel` (the explicit concrete constraint, if any), and `executor.confirmed.model` plus `executor.attestation.model` (the provider-reported concrete identity and its availability). When `exactModel` is present it supplies the provider launch model in preference to the selector, requires adapter launch enforcement and required provider attestation, and is compared literally with `executor.confirmed.model`. Without it, selector and attested-model strings are never compared and no family-membership inference is performed.

## Design decisions

- Preparation is a host lifecycle operation, not a new candidate or trusted-evaluator permission. Its root-authenticated entry point and canonical host record are the authority seam; subject results and relay activity remain observational data.
- The canonical public-safe record is the lookup index, while the bundle manifest is the evidence integrity root. The observation identity names their exact binding rather than a mutable directory or latest record.
- Prepared bundles remain evaluator-private through every preparation outcome and later PASS, FAIL or BLOCKED result. A later successful evaluator promotion may copy eligible evidence without rewriting the preparation record or source bundle.
- `exactModel` constrains only concrete provider model identity. Existing `reasoning` behavior is unchanged, and no provider-specific alias table or Claude exception is introduced.
- Bootstrap closure is demonstrated against candidate code as software under test: deterministic repository tests may call the host operation and generic adapter logic directly, construct synthetic committed candidates/private inventories, and inspect committed public authority boundaries. No acceptance procedure may depend on invoking a 014j-added worker permission, adopting candidate methodology authority or completing a live methodology cutover.

## Invariants

- Every accepted preparation request is identity-bound before subject launch; mutable working-tree bytes, arbitrary caller paths and replacement private content cannot select or alter candidate or procedure material.
- The candidate subject cannot read, write, seal, index, publish or authorize its observation bundle. Its semantic result is evidence and never a verification verdict, trust transition, promotion, acceptance or workflow transition.
- Missing, extra-required, altered, substituted, truncated, unclosed or inconsistently bound evidence prevents a sealed preparation state and later trusted consumption.
- Public workflow history contains only the safe preparation record. Evaluator-private procedure/input bytes, derived raw output and private path mechanics remain in evaluator-private storage until an independently authorized successful-result promotion.
- Executor profile selection, launch selection, exact concrete-model enforcement and provider attestation remain separate facts across every registered provider. Unavailable attestation never confirms an exact constraint.
- Existing governed execution, 014h containment and ordinary 014i candidate-subject behavior remain unchanged outside prepared observations and the corrected generic model semantics. No 014g result, evaluator revision, acceptance state or history is changed.

## Implementation freedom

- Internal module, type and helper names beneath the stable `prepareCandidateObservation`, prepared-observation record and executor-provenance contracts.
- The deterministic observation-ID encoding and private on-disk serialization, provided the stated facts are canonical, identity-bound and independently recomputable.
- Host-input document schemas, snapshot implementation and capture limits, provided the required distinctions and identities are preserved and any loss prevents sealing.
- Adapter plumbing used to pass an effective selector or exact constraint, provided the generic precedence, attestation and fail-closed rules hold for all registered providers.
- Synthetic fixtures and test organization used by evaluator preparation, provided every mandatory procedure remains bootstrap-closed under predecessor trusted N.
