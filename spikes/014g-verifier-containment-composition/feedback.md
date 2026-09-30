# Brief Readiness — Spike 014g Verifier Containment Composition (recovery revision 2)

Reviewed: `spikes/014g-verifier-containment-composition/spike.md`
(`sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`).
Skill: `brief-readiness`, contract version 5. This supersedes the earlier review of
`sha256:a29c32f4b8ddd7be5fa22bd4bd46e1d0309eb2dad3e19f9d734181f3252f0c5a`, preserved at
`spikes/014g-verifier-containment-composition/preliminary/001/`.

## Disposition of prior findings

- **B1 (resolved)**: Required behavior 6 and AC05 now say the frozen 014e group is adjudicated only
  through the candidate-subject evidence under AC03. Trusted N adjudicates the rest of the suite. If
  trusted N encounters 014e under its broader parent authority, it records the group as not
  adjudicated, binds the subject result, and counts it as neither a pass nor a failure.
- **M1 (resolved)**: The Handoff limits reuse of the `27af3a8` evidence to launch composition and
  host-mediated evidence observations. It requires a new bounded subject run of the unchanged 014e group.
- **M2 (resolved)**: Requirement 8 carries forward the SC1 identity, blob
  `4b361f81e307e129be6d106c9df9a4910e674be9` at `a36fd6e`. I confirmed that
  `a36fd6e:test/external-project.test.ts` resolves to this blob. The candidate must not alter those bytes.
- **M3 (resolved)**: Requirement 7, AC07 and AC08 mark the 014f rerun and post-promotion cutover as
  non-gating handoff conditions.
- **E1 (resolved)**: The status line names the prior frozen revision identity.

## Findings

### C1 — Material clarification (non-blocking): the record of "not adjudicated"

Brief: requirement 6, AC05. Requirement 6 requires a trusted-N 014e result to be recorded as "not
adjudicated". The brief does not say where it is recorded. The likely answer is the evaluator's
verification record, next to the bound subject evidence. The evaluator preparation role should confirm
that the existing verification-result vocabulary can carry this. If it cannot, the evaluator must state
its representation in the evaluator requirements. This is ordinary evaluator-design work, not a product
decision.

### C2 — Material clarification (non-blocking): fixture scope for the subject run

Brief: Handoff ("rerun only the smallest fixture needed"). The fixture may be chosen by the Design Map
or evaluator preparation. It must run the unchanged 014e blob bytes under the candidate-defined
composition, must not modify the candidate, and must not become an authoritative result. The brief
already implies these constraints.

### E1 — Editorial

The brief mixes `Status`/`Depends on` prose with the recovery narrative. This is not blocking.

## Review notes

- Feasibility: `spikes/014g-verifier-containment-composition/evidence/candidate-evaluator-subject-001.md`
  shows that a bounded candidate-subject launch is viable.
- Scope, authority, ownership, failure behavior and lifecycle decisions are stated. The authority model
  is explicit that N+1 cannot govern its own verification.
- Limitations: I did not run tests and did not inspect evaluator-private material. I did not
  independently resolve the commit ids `a5819dc`, `27af3a8` or `651352329cca` because command
  approval was denied. I relied on the manifest and the prior evidence for those.
- Files changed: `feedback.md` and `manifest.md`. No preliminary snapshot, because the verdict passes.
- Checks run: read the brief, prior feedback, manifest and subject evidence; confirmed the SC1 blob
  identity; confirmed the brief bytes match the bound identity.

**Verdict: Ready after minor clarification**
