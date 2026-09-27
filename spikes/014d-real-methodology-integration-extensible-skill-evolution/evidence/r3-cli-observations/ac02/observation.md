# AC02 Codex CLI observation — ordinary request selects Harness

**Record type:** public administrative observation; not a methodology-role result.

## Subject and runtime

- Fixture baseline: `85b1552557dc17b4be137382c12af005360ca709`.
- Candidate supervisor instructions: `skills/orchestrator/SKILL.md`, contract
  version 3, `sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`.
- Supervisor: Codex CLI `0.155.1`; requested model `gpt-5.6-terra`; actual
  served model was not exposed by the CLI and is therefore recorded as
  unavailable.
- Supervisor transcript identity: `01a0e1f8-5234-7522-9c17-e00e93470715`.

## Isolated configuration and preflight

The CLI used a separate temporary, mode-600 profile. Its environment policy
inherited only `core` values and injected this fixture's Harness URL and root
credential privately; neither value appeared in a prompt, source file, command
argument, or this record. Its managed network proxy allowed only
`127.0.0.1`, while the filesystem profile admitted the fixture, the Codex
runtime executable, and the existing primary Node dependency directory required
by the fixture's authorized dependency symlink. An authenticated,
Codex-supervised read-only `GET r3-ac02-default-selection/grants` returned an
empty list before the observation.

## Exact ordinary request and observed selection

The initiating user request was exactly:

> Please add fixture-marker.txt with the requested ready content and run the appropriate check.

It contains no special Harness incantation. The candidate read its v3
instructions, recognized the configured Harness project, inspected its empty
canonical state, created bounded grant
`f9e14161-c324-40d9-8a44-77c805eec18d`, and requested governed continuation.
The host allocated the registered `claude-governed-r3-ac02` profile; the
candidate did not select or launch the provider itself.

## Resulting governed work

The governed host recorded real, sequential spawned executions:

1. Brief Readiness execution `af6cf170-f2e4-43e0-a626-0fb310384d15` completed
   with semantic disposition `succeeded` and verdict `READY`. The host
   confirmed provider model `claude-opus-5-5`, provider version `2.1.280`, and
   recorded `brief-frozen` event `801ab984-dc2b-4859-a894-e8776d2b7f0e`.
2. Design Map execution `07e385b5-bc6b-4081-8dc5-ba05b8a4153f` completed with
   semantic disposition `succeeded`; the host recorded `design-map-frozen`
   event `8da4ea97-a71f-452e-9992-693204a59eb9`.

This is an authentic observed default selection followed by multi-phase
governed execution. It is not evidence that the whole fixture completed.
Automatic continuation then reached Evaluator Prepare and the host exited
because this fixture's project configuration has no `evaluation` workspace.
The candidate diagnosed the interruption and stopped; it did not bypass the
host or create `fixture-marker.txt` itself.

## Canonical evidence binding

- Canonical fixture ledger: `fixture-spikes/r3-ac02-default-selection/workflow.jsonl`
  with pre-evidence-import SHA-256
  `3e24e94704888df92f1e5d4f1af6127f05d2c5d54973b8c8abcacb110eef4a16`.
- The frozen public artifacts and commits are bound by the events above:
  Brief Readiness `cdcb31fd4eacac2ff8ca68e033a9653bcd0b3c5a` and Design Map
  `317dd99f3b5595feeef2aeb70e34e462642ff93f`.

This record establishes the observed selection and governed work only. It does
not claim a final acceptance decision.
