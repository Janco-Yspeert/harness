# Spike 005 review feedback

## Findings

No blockers or material clarifications remain.

The active brief is internally consistent with the current repository and the
frozen Codex App Server protocol baseline:

- Harness session, Codex thread, Codex turn, and App Server process identity and
  lifecycle remain distinct.
- Startup readiness, reservation cleanup, fatal backend termination, detach,
  reattach, and guarded finalization preserve the Spike 004 contracts.
- The busy interval begins synchronously, so unresolved `turn/start` requests
  cannot race into overlapping turns.
- Recoverable `turn/start` failure returns the backend to idle, preserves the
  Harness session, emits exactly one `turn_start_failed` message, and permits a
  later attempt.
- `turn_active` and `turn_start_failed` are now consistent across the lifecycle
  text, browser requirements, WebSocket contract, deterministic verification,
  and success criteria.
- PTY-only carriage-return handling is explicitly excluded from Codex provider
  input without changing PTY behaviour.
- Agent-message delta and completed-item projection has a deterministic
  no-duplication rule.
- Active-turn stop defines required graceful evidence, a five-second bound,
  fallback teardown, and HTTP outcomes.
- Authentication, diagnostics, approvals, structured non-text events, replay,
  and provider-history ownership have narrow and coherent scope boundaries.
- The deterministic peer must exercise the real asynchronous framing path,
  while the separately required live smoke proves compatibility with the real
  provider.

The generated schema baseline and `protocol/README.md` are committed at
`c4827dee40a8d4108db43a38b0d44a5da5694ffd`. The README records
`codex-cli 0.147.0`, and the brief consistently prohibits opting into
`capabilities.experimentalApi`.

No requirement appears technically infeasible or disproportionately costly for
the stated spike. Evolving `SessionBackend.write(): void` and the browser
message handling is explicitly authorized by the brief and is necessary to
represent the two narrow Harness error messages; it does not require the
universal provider/event architecture excluded by the non-goals.

## Verdict

**Ready to freeze.** The brief is sufficiently clear, complete, internally
consistent, and implementable. It supplies fair observable contracts for
implementation and deterministic evaluation while preserving the intended
real-provider smoke requirement.

No root-level `eval-requirements.md` existed at review time. The review covered
the complete active brief, committed protocol provenance and generated schema
baseline, current implementation and public contracts, visible tests, project
guidance, prior public outcome context, and the current official
[Codex App Server documentation](https://developers.openai.com/codex/app-server).
Only this required `feedback.md` artifact was written; no brief,
implementation, schema, or test files were changed, and no tests were run.
