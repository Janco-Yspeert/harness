# Evaluation Specification

## Status

Frozen.

## Source

- spike: `spikes/010-workflow-authority`
- brief: `sha256:a3e81619e2bca965eac7b40789cbc7b98f5a29f5be7ef98b7c14714d85e5ddb4`
- Design Map: `sha256:8f6185794278d0b2c6fc9d725367e548bf664a662d2d7389ece6cf0fd200e800`
- public requirements: recorded in freeze metadata
- evaluator v8: recorded in freeze metadata

## Pre-Freeze Integrity Gate

The public CLI/status surface and visible Node transition tests are the stable
implementation-independent seam. Hidden coverage is deliberately absent: a
second suite would duplicate the same public state transitions without exposing
an additional fair black-box behavior. Verification will run the frozen public
evidence plan on the committed handoff and inspect provenance/status output.

## Explicit Requirements

- R1: public canonical state distinct from operational dispatch.
- R2: status, validate, and guarded record operations.
- R3: durable public reconstructible history and provenance validation.
- R4: committed implementation and allocated immutable verification binding.
- R5: deterministic recovery, promotion, and explicit acceptance gates.

## Derived Invariants

- I1: invalid transitions never mutate canonical history.
- I2: classification consequences are structural, not inferred.
- I3: PASS, promotion, acceptance, and Outcome remain distinct.
- I4: cooperative authority does not claim same-user hostile-process security.

## Negative Requirements

- N1: no scheduler, provider framework, private evaluator inspection, or
  runtime daemon dependency.

## Evaluation Cases

- E1: mandatory public-regression evidence for R1–R5/I1–I4/N1. It runs the
  visible authority transition suite and required checks against a committed
  candidate, with status/provenance output as manual public evidence.

## Coverage Matrix

R1–R5, I1–I4, and N1: E1, public-regression; no hidden test is justified.

## Out of Scope

Internal reducer representation, parser, hashing helper, and event shape.

## Limitations

The evidence relies on public tests because the frozen public CLI is itself the
only justified implementation-independent seam.

## Revision History

Revision 001 — initial frozen public-regression evaluation plan.
