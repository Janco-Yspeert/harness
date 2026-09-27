# CLI observation setup 003 — command-environment isolation blocker

**Status:** retained administrative setup evidence; not an AC02/AC03 PASS and
not a governed-role result.

## What was tested

The existing AC03 fixture received an untracked runtime-only symlink to this
repository's existing `node_modules`; fixture-local Git status was configured
to hide that link so it could not be mistaken for candidate work or staged.
The host remained the separate localhost-only AC03 host with no eligible
adapter.

The external CLI supervisor again loaded the exact candidate orchestrator
contract (version 3,
`sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`)
and received the same ordinary marker request. It identified the request as a
Harness workflow request and attempted both canonical host reads.

## Authentic outcome

The CLI sandbox did not forward the injected `HARNESS_HOST_URL` or fixture root
credential to supervisor command executions. Both governed reads therefore
fell back to the default localhost endpoint and failed with `fetch failed`.
The candidate reported that blocker and stopped. It did not write the marker,
request a grant, allocate a role, launch a provider, or bypass the host.

Direct authenticated inspection after the session confirmed the fixture host
still had zero grants and zero executions. This is a CLI command-environment
isolation limitation, not the required host-level no-eligible-adapter
observation.

## Retained local session identities

- Candidate setup session `01a0e049-602c-7103-bbe6-9e85951427eb`:
  `sha256:e07e1cdff1347e1cd7b724c29236a9db48fa1a88c274aa3b791434e76d3ba295`
- Candidate observation session `01a0e04c-1939-7931-9214-2265d9cb400b`:
  `sha256:e833d3cc18620f263da234f57db682c9dac337c55144a700860a70369ea19124`

The raw session records are retained outside the fixture and primary
repository. CLI runtime was `codex-cli 0.155.1`; requested model
`gpt-5.6-terra`; actual model unavailable from the event stream.
