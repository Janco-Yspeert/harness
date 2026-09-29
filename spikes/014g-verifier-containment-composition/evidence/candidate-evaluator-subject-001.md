# Candidate evaluator subject 001

**Status:** Non-authoritative fixture evidence. This is not a 014g verification
result, evaluator revision, promotion, methodology adoption, or acceptance.

## Subject identity and isolation

- Candidate checkout: `651352329cca473fb920139e1496f9f508eeabbb`.
- Fixture trust root: a disposable sequence-1 human-bootstrap record over the
  candidate methodology (`sha256:d296bdb9edd4b02d05e0e0ad35fbaf4150d1f6dfaaa87f233e0f1059e1861866`).
  It is separate from Harness's trusted history and cannot establish trust for
  the production candidate.
- Fixture workflow grant: `09c49ed9-a32d-49df-aadb-2dc3a3550dcd`; it allowed
  only `evaluator-verify`, stopped after that role, and had no promotion or
  real-workflow authority.
- Subject execution: `bce38c34-8c1d-47b2-b7a4-3045d16a208c`; candidate input
  `651352329cca473fb920139e1496f9f508eeabbb`, evaluator revision `001`.

## Observed candidate composition

The real spawned candidate evaluator received exactly:

- public repository workspace: `read`;
- evaluator-private workspace: `write`;
- capabilities: `repository-read`, `local-computation`, `git-inspect` only;
- bounded host action `evidence`, allowlisted to `verification-result.json`,
  `manifest.md`, and `feedback.md`.

It did **not** receive `repository-write` or `git-commit`.

## Host-mediated evidence exercise

The subject requested one `evidence` action. The host accepted it without
direct provider publication:

- action: `cdd3b52c-452a-464e-b068-04af07f2582b`;
- request: `850b794d-738f-4295-b3ef-1ece51ede828`;
- `verification-result.json`: `sha256:b6bd27260daee99f6d81a670ec3e3310e8ba3689417fb4f4d5ba35d401cd4ab6`
  (998 bytes);
- `manifest.md`: `sha256:9f90deee4247f2ffbc87172864ca22d4333cd146762fa13cec09ef050f904f19`
  (3916 bytes);
- action status: `succeeded`; fixture commit before/after:
  `651352329cca473fb920139e1496f9f508eeabbb` →
  `8d5411edfcb419ec5e45bbba4d04b100a522c5a1`.

## Limitation

The subject reported `BLOCKED / INFRASTRUCTURE_FAILURE`. Its semantic result
could not finalize because the fixture's synthetic setup did not produce the
verification-result identity expected by its own canonical transition. This
evidence establishes the candidate contract's real protected launch and
bounded evidence-write path; it does **not** itself establish AC03's frozen
014e regression result or a 014g PASS. The unchanged trusted evaluator revision
`001` must decide whether the evidence is admissible and sufficient.
