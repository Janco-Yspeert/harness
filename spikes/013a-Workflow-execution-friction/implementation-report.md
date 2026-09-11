# Implementation Report — Spike 013a

status: IMPLEMENTED

## Changed behavior

- Host-owned workflow runs now retain a semantic role disposition and a
  host-validated, run-bound role result separately from provider process state.
  A clean process exit remains insufficient for a workflow phase to complete.
- The host accepts role-result reports only when role, methodology attempt,
  contract identity/version, and pinned verification authority agree with the
  allocation binding. Run inspection exposes both process status and role
  disposition.
- Protected evaluator roles reject prompt-shaped authority. Pinned canonical
  evaluator allocations cover Spike 013a evaluator preparation and verification
  as well as the existing Spike 012 verification path; explicit direct human
  authorization remains a distinct route.
- Workflow planning records a `plan` fact rather than a dispatch, so previewing
  a command does not consume an execution attempt. Canonical frozen checkpoints
  can be explicitly adopted by a fresh runner and are exposed with their next
  phase.

## Consequential decisions

- Role success is deliberately submitted as an explicit host-validated result,
  not inferred from a provider exit code. This keeps provider lifecycle
  diagnostic and prevents a polite refusal with exit code zero from advancing
  methodology.
- The protected-role boundary is at allocation: only a pinned canonical
  evaluator allocation or explicit direct human authorization reaches an
  evaluator adapter. Prompt contents are not authority.

## Rejected complexity

- No universal provider skill API was introduced. The binding records the
  repository contract and authority before adapter launch, leaving provider
  delivery as the existing adapter concern.

## Tests and checks

- Added host integration coverage for 013a pinned evaluator authority, prompt
  authority refusal, process/role separation, and successful bound role result.
- Updated workflow tests to distinguish repeatable planning from execution
  dispatch.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check` were run.

## Limitations

- Mandatory live Claude/Codex fixture evidence is evaluator-owned and has not
  been claimed here. This candidate reports implementation and visible tests,
  not independent evaluation.
