# Evaluation Requirements

## Testability Requirements

- **TR1** — `status` must expose append-ordered runner records as parseable JSON.
  Every evaluator-verification record must identify both its own positive
  verification attempt and the positive implementation attempt it evaluates.
  Reason: independent verification needs a black-box way to establish that the
  two identity spaces are not coupled. Source: brief Scope 1 and Design Map
  Shared contracts. Implementation impact: retain this relation in the public
  status surface; state-file representation otherwise remains free.

- **TR2** — `HARNESS_WORKFLOW_PUBLIC_EXECUTOR` and
  `HARNESS_WORKFLOW_EVALUATOR_EXECUTOR` select the supported executor profile
  for their respective roles; absent settings use the practical Codex/Claude
  defaults. Reason: these names are the Design Map's small fixed seam for
  independently exercising executor neutrality. Implementation impact: tests
  may set either variable and supply a matching fixture executable on `PATH`.

- **TR3** — a failed `dispatch --execute` must return non-zero and leave the
  same phase attempt dispatchable with `--execute` once the executable becomes
  available. Reason: this is the required observable recovery boundary. Source:
  brief Scope 3 and Design Map Shared contracts. Implementation impact: no
  particular launch-failure event or storage shape is required.

- **TR4** — newly created `<spike>/.workflow/` is owner-only; newly created
  `state.json` and runner-created combined-output log files are owner
  read/write only on the POSIX host. Reason: the brief makes these concrete
  local-state permission requirements. Source: brief Scope 4. Implementation
  impact: evaluation reads POSIX mode bits; the exact filesystem calls are free.

- **TR5** — `npm run workflow -- ...` remains the command surface, but the
  module it executes must reside outside `src/`. Reason: this is the bounded
  tooling/runtime separation required by the brief. Source: brief Scope 5.
  Implementation impact: package-script target is observable; the destination
  directory is otherwise free.

## Evaluator Assumptions

- **A1** — fixture executables named `codex` and `claude` can be placed first
  on `PATH`; executor profiles use normal bare-command resolution. Evaluation
  impact: no real coding agent is invoked.

- **A2** — POSIX permissions are tested by masking mode bits with `0o777`.
  Evaluation impact: host ACLs and ownership are not judged.

- **A3** — a launch error can be deterministically induced by choosing an
  unsupported or unavailable executable profile. Evaluation impact: the suite
  checks recovery, not a specific OS error message.

## Blocking Questions

None.

## Environment Requirements

- Node.js and the repository's existing dependencies/tooling.
- Ubuntu/POSIX process and filesystem permission facilities.
- Git is used only to confirm the pre-existing `.workflow/` ignore behavior.
- No external service or real coding-agent installation is required.
