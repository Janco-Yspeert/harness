# Evaluation Requirements

## Testability Requirements

No additional implementation-specific test seam is required. Evaluation uses
the existing supported Harness host, process, filesystem, configured-methodology,
and test-command surfaces. The candidate must preserve the frozen observable
contracts and the repository's `npm test` entry point sufficiently for the
required regression and real-boundary evidence to run.

## Evaluator Assumptions

- **EA-01** — The repository continues to run under the declared Node runtime
  and its checked-in dependencies are available. This is necessary to run the
  public regression command and bounded local host/process proofs; it does not
  constrain a candidate's internal design.
- **EA-02** — The candidate exposes the frozen behaviours through supported
  Harness paths rather than an evaluator-only API. This follows from the frozen
  real-boundary requirements and prevents evaluator instrumentation becoming a
  second product contract.

## Blocking Questions

None.

## Environment Requirements

- Ubuntu host with the repository's declared Node runtime and installed npm
  dependencies.
- Local loopback networking, process spawning/termination, temporary
  directories, filesystem access, and Git available to the repository test
  environment.
- No external provider account, network service, secret, or production
  publication destination is required; bounded local fixtures are sufficient.
