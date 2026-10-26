# As-Built — Spike 014i

## Implemented shape

The final implementation at candidate commit `bb8d138d59c69e5af3f5b09b1a2fc5c6a4049f14` adds a bounded `evaluator-verify` candidate-subject operation in `src/candidate-subject.ts`, with methodology reconstruction in `src/methodology-evolution.ts` and visible regression coverage in `test/candidate-subject.test.ts`.

The operation reconstructs the candidate from an exact 40-hex Git commit. It uses the committed-revision methodology builder to read the project policy, role contract, skill, validators, capabilities and identities. It accepts only the `evaluator-verify` role, checks the bound methodology, skill and contract identities, requires the repository/evaluation workspace composition, and rejects capabilities outside the representable host vocabulary. The resulting composition records the candidate, role, policy, contract, source identities, capabilities, host actions, workspace modes/exposures and protected-executor constraint.

Execution creates a disposable parent containing separate `repository`, `evaluation`, `scratch` and `forbidden` roots. The candidate tree and fixed runner/input fixtures are copied into the disposable repository; the sacrificial forbidden target is kept outside subject authority. The subject is launched through the existing `bubblewrap` containment path with the reconstructed workspace modes, scratch, masked environment and the evidence root protected from subject access. The production project and workflow history are not used as the subject's destructive target.

`CandidateSubjectRelay` terminates worker protocol calls locally. Assignment reports non-authoritative subject context. `submitResult` is checked against the candidate contract and retained as an observation. `requestHuman` is unavailable. Candidate evidence actions are checked against the candidate grant and allowlisted disposable destinations; promotion, publication and other authoritative actions are denied. No relay result or action enters the authoritative workflow kernel.

`SubjectLifecycle` records `prepared`, `running`, `completed`, `infrastructure-failed`, `evidence-incomplete` and `evidence-sealed`. A process exit or semantic result determines the observed subject outcome, while infrastructure and evidence failures remain explicit. Host capture writes byte-preserving stdout/stderr, ordered worker-tool exchanges, before/after observations, process termination, reconstruction and containment metadata. A final manifest binds every artifact, stream limit and hash. Validation rejects missing, changed, duplicate, unbound, symlinked or truncated content; only a validated bundle is sealed read-only. `publishSubjectEvidence` copies and revalidates a sealed bundle without changing its contents.

The retained public fixture bundles demonstrate both a read-only contained composition and an over-authorized composition. Both are labelled `non-authoritative`, use the deterministic placeholder provider profile, record unavailable provider attestation, and retain the raw capture artifacts and identity-bound manifest.

## Comparison with the frozen contract

The built behavior satisfies the frozen brief and Design Map as verified by accepted attempt 004: all ten criteria are `SATISFIED`, and the regression reported 234/234 tests passing in the clean candidate environment. There are no Missing, Contradictory, or Extra discrepancies to report.

The final verification input was `sha256:6a4c4d725b437b9419ebda05e56c15452b82c1b43732ce623271d5605844fafb`; the frozen brief was `sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`; the Design Map was `sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`; and the validated promotion record was `sha256:124ce984f7477aaff7be60ccee6cc74288c97dad7f16594ce80b388ef19d81a7`.
