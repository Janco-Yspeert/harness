# Brief Readiness — Spike 014g Verifier Containment Composition (forward specification recovery)

Reviewed: `spikes/014g-verifier-containment-composition/spike.md`
(`sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`).
Skill: `brief-readiness`, contract version 5.

## Findings

No blockers or material clarifications.

The forward revision states the authority, scope, ownership, lifecycle, failure,
and evaluation boundaries needed by downstream roles:

- `spikes/014g-verifier-containment-composition/specification-revision-authority.md`
  authorizes replacement of only the obsolete mechanism-specific 014e D4
  assertion while preserving the containment invariant and all historical
  results.
- Required behavior 8 and AC03 identify the exact frozen 014e blob, the exact
  accepted 014h replacement blobs, the excluded assertion, and the rule that no
  other frozen 014e assertion may change. Git inspection confirmed that
  `a36fd6:test/external-project.test.ts` is blob
  `4b361f81e307e129be6d106c9df9a4910e674be9`; accepted 014h candidate
  `dee86d2314bffa7cc2da0d8ac72004250a06debb` contains external-project blob
  `74a51d545681532ac4c49ac9034712ee3217974d` and host-isolation blob
  `b9c135790860a87e76afdfb458a7b0758d129704`. The external-project blobs differ
  only in the named D4 test block.
- Exact candidate C2 `e8428205a58a1c12d6f17d9a80a160b78c754cb9` contains those same two accepted
  014h blobs, so the forward requirement does not itself require a candidate
  change. Accepted 014h and 014i candidates are ancestors of C2.
- `spikes/014h-host-owned-fs-isolation/outcome.md` establishes mandatory
  host-owned containment, preserved workspace modes, fail-closed launch, and
  denial of ungranted host paths. `spikes/014i-governed-candidate-evaluator-subject-execution/outcome.md`
  establishes the bounded, evidence-only candidate-subject mechanism and its
  non-authoritative lifecycle. These public accepted outcomes make the proposed
  composition feasible without granting N+1 authority to certify itself.
- The Handoff keeps evaluator revisions 001 and 002 and all attempts immutable,
  identifies the two forward evaluator corrections, constrains evidence reuse,
  preserves C2 absent an independently established implementation defect, and
  stops at the human-acceptance gate after a trusted-N PASS.

## Review notes

- Limitations: this was a contract-readiness review, not implementation or
  evaluation. I did not run the product test suite and did not inspect
  evaluator-private material or workflow ledgers.
- Files changed: `spikes/014g-verifier-containment-composition/feedback.md` and
  `spikes/014g-verifier-containment-composition/manifest.md`. No preliminary
  snapshot was created because the verdict passes.
- Checks run: verified the bound brief SHA-256; inspected `AGENTS.md`, `GOALS.md`,
  the human specification authority, the public 014h/014i Outcomes, current
  containment and candidate-subject implementation surfaces, the candidate
  evaluator contract, referenced commits and blob identities, candidate
  ancestry, and the exact 014e-to-014h external-project test diff.
- Existing unrelated working-tree changes were left untouched.

Ready to freeze
