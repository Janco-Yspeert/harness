# Design Map — 014i Governed Candidate Evaluator Subject Execution

Frozen brief: `spike.md` (`sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`), verified against the bound identity and committed at `78c683c`.

## Shared contracts

1. **One candidate-subject operation.** Harness exposes one host operation whose production authorization is `evaluator-verify` from an exact committed candidate methodology. Its inputs bind the candidate commit and methodology identity, frozen subject inputs, execution profile, disposable workspace roots, runner/probe identities and capture bounds. Its output is a host-owned subject record plus either a sealed evidence bundle or an explicit non-sealed terminal state. It is not an ordinary workflow-role allocation and cannot call the authoritative result or transition path.

2. **Exact reconstruction precedes fixture creation or launch.** The operation rebuilds the methodology from the candidate commit using the existing committed-revision methodology loader, checks the requested methodology identity, and selects the candidate's exact `evaluator-verify` skill, contract and effective composition. The subject assignment preserves those bytes and declared capabilities, workspaces, modes, exposure classes, host actions and executor constraints. The subject boundary only overrides authority-bearing effects described below; it does not rewrite the candidate contract.

3. **Deterministic disposable layout.** Each execution has four disjoint host-created roots under one disposable parent: `repository/`, `evaluation/`, `scratch/` and `forbidden/`. The candidate role's logical repository and evaluation workspaces resolve to the first two roots with the modes and exposure classes reconstructed from the candidate. Runner and probe inputs are committed under `repository/` at paths fixed by the frozen subject-input package. `forbidden/` contains sacrificial boundary targets and is never granted. The assignment and evidence record the canonical concrete paths, workspace IDs, modes and exposures. The host-owned evidence root is outside this disposable parent and every subject-visible or subject-writable root.

   Evaluator preparation binds one deterministic Harness-owned fixture package for 014i by Git commit plus tree/blob identities. That package contains a synthetic candidate methodology, runner, contained and deliberately over-authorized probe cases, input files and expected sacrificial targets. It also fixes every subject-visible repository-relative runner/input path. A test may copy the package beneath a fresh disposable prefix; it must preserve the bound bytes and relative layout. The later 014g use binds its separately frozen 014e input and runner identities instead.

4. **Subject worker-tool boundary.** The subject uses worker protocol v1, but all four operations terminate at a subject relay rather than the ordinary governed workflow endpoints.
   - `assignment` returns the reconstructed candidate assignment and is recorded.
   - `submitResult` is validated against the candidate contract, recorded with the complete host response, and retained only as an observation.
   - `requestAction` is validated against the candidate grant, recorded, and may affect only allowlisted destinations in `repository/` or other disposable subject fixtures. Promotion and publication to real workflow, methodology or evaluator-history targets are denied.
   - `requestHuman` is always recorded and returned as unavailable without creating or waiting on a human/root request, regardless of the candidate contract's declared human permissions.

   No subject relay response or process outcome is passed to `ExecutionKernel.submit`, authoritative host-action handlers, trust mutation, verification finalization, promotion, acceptance or workflow continuation.

5. **Host-owned subject record and lifecycle.** One mutable host record outside the bundle is the authoritative lifecycle surface; no subject workflow ledger is created. It binds the reconstruction, fixture and execution identities and carries `status`, process termination, optional candidate semantic result, capture outcome and, when sealed, bundle identity.
   - `prepared`: reconstruction and all roots/inputs have been validated, before launch.
   - `running`: the contained provider process has started.
   - `completed`: the process ended and all capture sources closed. A non-zero exit, signal, missing result or rejected semantic result is candidate behavior recorded as `subjectOutcome: "failed"`, not automatically an infrastructure failure.
   - `infrastructure-failed`: host/provider launch or relay infrastructure prevented the subject procedure from running to an attributable process outcome.
   - `evidence-incomplete`: execution occurred but any required artifact, close marker, before/after observation or identity is missing, truncated or inconsistent.
   - `evidence-sealed`: completeness and integrity validation passed and the immutable bundle manifest was created.

   Only `completed` may advance to `evidence-sealed`; failed validation advances to `evidence-incomplete`. Neither unfavorable candidate behavior nor a candidate `FAIL`/`BLOCKED` result causes an automatic rerun.

6. **Raw capture and completeness.** The evidence bundle contains byte-preserving stdout and stderr files, an ordered JSONL worker-tool exchange file, external before/after observations, process termination data, reconstruction and containment metadata, and the fixture/runner/probe identities. Each stream entry in the manifest records its byte length, SHA-256 identity, configured maximum, `closed` and `truncated`. Worker-tool records use a host-assigned monotonic sequence and contain the complete parsed request and complete returned response for every call. The capture bound may vary by execution, but reaching it sets `truncated: true`; a stream that is truncated, not closed, unparsable or missing can never be sealed. Provider attestation is optional only when the selected execution profile cannot provide it; the manifest records `providerAttestation: {status: "unavailable"}` in that case, while an attesting profile requires the complete attestation.

7. **Sealing and trusted consumption.** `manifest.json` is written last and binds every retained file by repository-relative path, media/type label, byte length and SHA-256 identity, together with the exact candidate composition, runtime commit, subject execution, fixtures, runner/probes and capture-completeness fields. The host validates paths beneath the evidence root, recomputes every identity, then makes the bundle immutable and records the manifest identity in the subject record. Missing, extra-required, substituted or changed bytes invalidate it.

   For trusted-N consumption, the host publishes the sealed bundle unchanged at `evidence/candidate-subject/<subject-execution>/` beneath the target workflow directory and commits it through the existing host-owned evidence path. Trusted N receives the publication commit and manifest identity as frozen inputs and reads those exact bytes through its existing repository workspace; it needs only repository-read and git-inspect. The candidate subject has no access to this destination or publication action. Publication records evidence availability only and creates no verification, promotion, trust, acceptance or workflow-advance event.

## Design decisions

- The existing committed-revision methodology builder and 014h `containedLaunch` path are reused. Candidate-subject execution adds a mediation/capture boundary around the governed adapter; it does not add a second methodology loader, provider adapter or filesystem sandbox.
- Subject execution identities are a separate namespace from authoritative workflow execution identities. The evidence and subject record explicitly label the run `non-authoritative`; an ordinary `Execution` or Role Grant must not be synthesized in the real workflow to model it.
- External containment observations come from host snapshots of the sacrificial targets before and after the process. Subject prose and subject-created files are not accepted as proof of containment.
- The immutable bundle manifest, not the human-readable summary, is the trusted-N evidence interface. A summary may be included only as another identity-bound artifact.

## Invariants

- The candidate commit and methodology, role, skill, contract, inputs, runner/probes, runtime and workspace composition are identity-bound before launch; mutable working-tree bytes never select or alter them.
- All subject writes and candidate-granted host actions terminate inside the disposable subject roots. The real project, workflow ledger, trusted history, evaluator archive and public evidence destination remain outside subject authority.
- Evidence capture and lifecycle state are host observations outside every subject-visible root. The subject cannot edit, delete, seal or publish its own evidence.
- Candidate semantic results remain evidence data. They never become an authoritative evaluator verdict or a workflow transition.
- An incomplete or integrity-invalid bundle is unavailable to trusted N as admissible sealed evidence. Failure is explicit; no partial bundle is presented as complete.
- Existing governed execution and 014h containment behavior is unchanged for non-subject launches.

## Implementation freedom

- Internal types, module boundaries and function names for the subject operation, relay, capture writer and manifest validator.
- Serialization details beyond the required subject-record states and manifest bindings, including timestamps and optional human-readable summaries.
- The concrete disposable-parent and evidence-root paths, provided the fixed relative layout, recorded canonical paths and separation invariants hold.
- Capture limits and chunking, provided raw bytes are preserved up to the recorded bound and any loss prevents sealing.
- How immutability is enforced after sealing and how the unchanged bundle is committed, provided trusted N binds the publication commit and manifest identity.
- Deterministic fixture content and test organization chosen during evaluator preparation, within the package, path and identity contract above.
