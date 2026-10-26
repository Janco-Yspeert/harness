# CLI observation setup 002 — restored-fixture dependency blocker

**Status:** retained administrative setup evidence; not an AC02/AC03 PASS and
not a governed-role result.

## Candidate-supervisor session

The corrected AC03 CLI supervisor ran with the fixture as its actual working
directory and first loaded the exact candidate `skills/orchestrator/SKILL.md`.
It attested contract version 3 and
`sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`.
CLI runtime was `codex-cli 0.155.1`; requested model was `gpt-5.6-terra`; the
actual model was unavailable from the CLI event stream.

The ordinary request was: “Please add the small ready marker described in the
current work item and run the appropriate repository check.” It contained no
Harness instruction or acceptance-criterion reference.

The candidate recognized it as an authorized Harness development request,
inspected the fixture configuration, and attempted the required read-only
governed client operation. That command failed before contacting the host:
the restored Git worktree has no `node_modules`, so Node could not resolve the
`ws` dependency imported by the client path. It then truthfully stopped without
writing the marker, requesting a role, allocating an execution, or bypassing
the host.

Host reads immediately afterward confirmed zero grants and zero executions.
The AC02 fixture was not started.

## Retained local session identities

- Candidate setup session `01a0dff5-0494-7b22-ae03-3a192aee54e3`:
  `sha256:cd5e0e0a5cf908378403b02c894cebd71e3b9e5343bb73ba95138cfa2e01cd94`
- Earlier mis-rooted resume session `01a0dff2-ac8a-7773-b1d8-fe92fd3acd41`:
  `sha256:e9c4339fca4c4933d9924b01296dc18a0c8e86730d2ae231154fcadc4a6472c6`

Both raw session records remain outside the fixture and primary repository.
This administrative record preserves the failed setup provenance without
presenting it as evidence that the required host-level unavailable-adapter
blocker occurred.
