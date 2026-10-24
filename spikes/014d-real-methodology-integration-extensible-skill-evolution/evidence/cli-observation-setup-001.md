# CLI observation setup 001 — invalid AC03 invocation

**Status:** retained administrative setup evidence; not an AC02/AC03
observation and not a candidate result.

## What occurred

On 2026-09-26, the first attempted external Codex CLI supervisor for the
isolated AC03 fixture started at the restored fixture commit
`5a6579e9bb57155ba668155ffc433393963ea493`. The CLI session was
`01a0df92-5744-7510-a51c-3b5d582baa03`.

The invocation did not establish the required candidate-supervisor context.
It loaded the user-level `implementation` skill rather than the candidate
`skills/orchestrator/SKILL.md`, then created an untracked
`fixture-marker.txt` directly. It did not contact the governed host. The
supervisor was interrupted immediately after the first failed local check.

No workflow grant, governed execution, or provider role allocation occurred.
This record preserves the setup failure rather than treating it as an
observation of the candidate orchestrator.

## Preserved identities

- Raw local CLI session record:
  `sha256:776ade1e0b7ab4fe52bc2bbd3ed2ea71444affc9dde62e27e2bbfe8d9e125583`
- Generated untracked marker bytes (`ready` plus newline):
  `sha256:ed1a545bb85e55816bbf9566b028b2a0bc456b88f49f6f266c0401048824194b`
- Intended candidate orchestrator, not loaded by this invocation: contract
  version 3, `sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`
- CLI runtime: `codex-cli 0.155.1`; requested model `gpt-5.6-terra`; actual
  model was not reported by the CLI event stream.

The untracked marker was removed only after recording its identity. The raw
session remains retained outside the fixture and primary repository.
