# As-Built — Spike 009 Workflow Tightening

## Inspected implementation

- Final implementation revision: `f5a657dc11e77ed7fc8d46c06280daa9df41c56e`
  (`Tighten workflow runner recovery`).
- Frozen brief: `sha256:eadf808bcc083c2810c119d916f58f906ca2930e5ac5bc04eca62851b674ce89`.
- Frozen Design Map: `sha256:46d2822e9a8498b9bd470a73afd151fd907b594f3c652f8fa064d131780c726a`.
- Final evaluator verification: attempt `001`, `PASS`, evaluator revision
  `002` (`sha256:e486eafc8bd49f3fed5c3965f75b590106550cbb7f5e8f9f3edcab66b7cd0e0b`).

## Implemented shape

The repository-local workflow CLI now lives at `tools/workflow.ts`; the public
`npm run workflow -- ...` command is unchanged. Its state format is version 2
and keeps implementation attempts and evaluator-verification attempts in
separate sequences. Verification records carry the completed implementation
attempt they evaluate, so a blocked verification can be retried against the
same implementation while a failed verification permits the next implementation
attempt.

The runner selects Codex or Claude independently for public and evaluator roles
through the two bounded environment settings established by the Design Map. The
phase-to-skill mapping and command profiles remain fixed; there is no provider
registry lurking in a trench coat.

Execution dispatch commits its phase record only after spawn succeeds. A missing
or unlaunchable executable therefore returns an error without consuming the
attempt. State, workflow directory, and combined-output logs are created with
owner-restricted POSIX modes. Detached execution, dry runs, liveness reporting,
cancellation, ignored local state, explicit `record` outcomes, and the absence
of evaluator-private/Git behavior remain intact.

Visible tests cover independent verification numbering and blocked-verification
recovery; the promoted evaluator suite additionally covers executor selection,
launch recovery, permissions, and the tooling/runtime boundary.

## Frozen-contract comparison

- **Missing** — none.
- **Contradictory** — none.
- **Extra** — none.
