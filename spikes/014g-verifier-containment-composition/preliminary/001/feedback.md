# Brief Readiness — Spike 014g Verifier Containment Composition (recovery revision)

Reviewed: `spikes/014g-verifier-containment-composition/spike.md`
(`sha256:a29c32f4b8ddd7be5fa22bd4bd46e1d0309eb2dad3e19f9d734181f3252f0c5a`).
Skill: `brief-readiness`, contract version 5. This supersedes the earlier review of
revision `sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`, which
is still preserved in git history at `a36fd6e`.

## Findings

### B1 — Blocker: no stated way to adjudicate AC05 (and the 014e group) under trusted N

Brief: Authority model clarification (authoritative verification runs under the exact
trusted N role, skill and contract); requirement 4; AC03, AC05 and AC08.
Repository: `spikes/014g-verifier-containment-composition/manifest.md` records that
attempts 002 and 003 launched under the pinned methodology *with repository write*, so
the candidate composition was not the launch authority and no frozen case could be
re-run fairly. `spikes/014g-verifier-containment-composition/design-map.md` SC1 and SC2
freeze the whole `014e` group in `test/external-project.test.ts` and require it to run as
a verifier command under the verifier's effective sandbox.
Consequence: the brief now puts authoritative verification under N, which is the exact
context that cannot observe the 014e boundary (the original defect). AC03 moves the 014e
run to the candidate-subject, but AC05 still requires existing containment and
nested-sandbox regressions to stay green, and the brief does not say where that
full-suite run happens or how the 014e group is treated in the N-run. Left open, the
evaluator would have to decide whether an N-run 014e failure blocks, is excepted, or is
satisfied by subject evidence. That is a fair-evaluation decision this brief must make,
not a later role. The same ambiguity already produced three blocked attempts.
Smallest clarification: state that (a) the 014e group is adjudicated through the
candidate-subject run under AC03, and trusted N adjudicates AC05 for the remaining
suite; or (b) name the alternative. Also state what trusted N records for the 014e group
in its own run (for example not adjudicated there, with subject evidence bound instead)
so that it is neither counted as a pass nor as an environmental failure by itself.

### M1 — Material clarification: existing subject evidence cannot satisfy AC03

Brief: Handoff ("may be reused only if ... required observations").
Repository: `spikes/014g-verifier-containment-composition/evidence/candidate-evaluator-subject-001.md`
says the subject ended `BLOCKED / INFRASTRUCTURE_FAILURE` and "does not itself establish
AC03's frozen 014e regression result".
Consequence: the handoff implies reuse may suffice. It cannot for AC03, because no
frozen 014e run occurred in that subject. Implementations and the evaluator could diverge
on how much to rerun.
Smallest clarification: say that the `27af3a8` evidence is reusable only for launch
composition and host-mediated evidence observations, and that a subject run of the frozen
014e group is required for AC03.

### M2 — Material clarification: frozen regression identity on re-freeze

Brief: requirement 8 ("At freeze, record ...").
Repository: `spikes/014g-verifier-containment-composition/design-map.md` SC1 already
records blob `4b361f81e307e129be6d106c9df9a4910e674be9` at `a36fd6e`.
Consequence: it is unclear whether re-freeze keeps that identity or re-records it after
the candidate commits.
Smallest clarification: say the SC1 identity carries over unchanged unless the freeze
record re-derives it, and that the candidate must not alter those bytes.

### M3 — Material clarification: AC08 and requirement 7 include post-acceptance conditions

Brief: requirement 7, AC07, AC08 (last sentence).
Consequence: "a later ordinary grant uses the reduced composition only after human
acceptance and methodology promotion" and the 014f rerun cannot be observed before this
verification ends, so they cannot gate the verdict. Double-counting with AC07 is likely.
Smallest clarification: mark these as non-gating handoff conditions, with AC07 checked
only as "no modification to frozen 014f authority or prior attempts". AC08 gates only the
observable separation of trusted-N and subject evidence and the absence of subject
authority.

### E1 — Editorial

- AC02 row lacks a trailing space before the closing `|`.
- Status line says "prior frozen revision preserved"; name its identity (`52f1c9fc...`).

## Review notes

- Feasibility: a fixture-isolated subject is shown viable by the `27af3a8` evidence.
- Limitations: did not run tests, and did not inspect evaluator-private material.
- Files changed: `feedback.md`, `preliminary/001/spike.md`, `preliminary/001/feedback.md`, `manifest.md`.
- Checks run: read brief, prior feedback, Design Map, evaluation requirements, manifest, subject evidence.

**Verdict: Not ready to freeze**
