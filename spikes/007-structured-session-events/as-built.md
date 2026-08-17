# As-Built — Spike 007 Structured Session Events

## Inspected implementation

- Final implementation revision: `20f88674409e9e2a2f3fca83869206c8b2b67943`
  (`feat(spike-007): add structured session events`).
- Frozen brief identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`.
- Frozen Design Map identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`.
- Public evaluation requirements identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`.
- Final verification: attempt `001`, `PASS`, against evaluator revision `1`.

## Implemented shape

Harness adds `GET /events/ws` as a host-level WebSocket upgrade path alongside,
but independent from, the existing session-specific WebSocket. The host owns an
in-memory `Set<WebSocket>` of connected event observers. A successful event
connection joins that set; its close removes it. Event connection and
disconnection do not create, attach, detach, stop, or otherwise alter a session.

The host constructs two private Harness event types: `session.started` and
`session.ended`. Each event is serialized once and sent as one text message to
every event socket that is open when the lifecycle transition is published.
Events have a closed root containing `meta` and empty `data`. `meta` contains a
fresh UUID event ID, `kind: "event"`, the lifecycle type, `version: "1.0.0"`,
the Harness session ID as `streamId`, the event ID repeated as `correlationId`,
an ISO UTC timestamp, and `source: "harness"`. There is no causation ID,
extensions object, provider identity, or backend-native payload.

Publication is owned by the existing host session coordinator rather than by a
backend. Once backend creation succeeds and the session becomes the active
public session, the host publishes exactly one `session.started`. Failed or
discarded startup attempts never reach that publication point.

All permanent ending paths continue through the existing coalesced
`endSession` transition. `removeSession` publishes `session.ended` only when it
actually clears that session from `activeSession`; repeated or racing ending
triggers therefore cannot publish another end event. Explicit deletion,
backend exit, and host shutdown use this path. Removal and end publication also
occur when backend finalization rejects, while the existing caller-visible
finalization error remains intact.

Lifecycle order follows ownership of the active-session identity:
`session.started` is published when that identity is installed, and
`session.ended` only when the same identity is removed. Host shutdown ends an
active session before closing event sockets, so live observers can receive the
final end fact before the event channel is dismantled.

The channel is memory-only and live-only. Events emitted without an open
observer are discarded, and a later connection receives neither replay nor a
state snapshot. There are no offsets, cursors, acknowledgements, persistence,
broker, event bus, schema runtime, or Conduit dependency.

The existing `/sessions/:id/ws` path retains ownership of backend input, output,
errors, and its single optional client attachment. Structured events are not
sent over that path. PTY and Codex backends remain unaware of the event envelope
and continue to expose lifecycle through the shared `SessionBackend` callbacks,
so both are projected through the same host-owned lifecycle transitions.

Visible integration coverage added with the implementation exercises identical
broadcast envelopes for two observers, no replay for a late observer, failed
startup suppression, natural backend exit, explicit deletion, and end
publication despite backend stop failure. The frozen evaluator additionally
verified the full public lifecycle, isolation, concurrency, shutdown, and
backend-neutral boundaries against the exact implementation revision above.

## Post-verification repository additions

The checkpoint containing this As-Built also includes a repository-wide
evaluator contract correction from version 6 to version 7. This work does not
change the Spike 007 runtime implementation or its evaluated behavior. It makes
future evaluator promotion occur immediately after `PASS` and before human
acceptance, defines canonical private and public artifact layouts, derives an
evaluator-revision identity from freeze metadata, treats revision eligibility as
all-or-nothing, separates byte-identical historical evidence from newly created
`promotion.json` bookkeeping, and specifies copied, referenced, and
not-promoted dispositions plus integrity checks. The prior v6 contract is
archived, new freeze and promotion templates are added, existing evaluator
templates are aligned, and the repository workflow documentation is updated.

The checkpoint also publishes five informal Spike 007 retrospective artifacts:

- the original evaluator-prepare self-retrospective, including deliberately
  disclosed test names and evaluator mechanics;
- an independent churn analysis of that prepare run;
- the prompt that requested the prepare-run retrospective;
- the prompt that specified the evaluator promotion correction; and
- a retrospective on implementing the evaluator v7 correction.

These documents record methodology analysis, prompts, observed evaluator
scaffolding churn, and the provenance defect discovered in Spike 007's promoted
attempt ledger. They are not frozen requirements, implementation, evaluator
revision contents, verification results, or promotion evidence. Existing
promoted Spike 007 evaluation artifacts remain unchanged.

## Frozen-contract comparison

- **Missing** — none.
- **Contradictory** — none.
- **Extra** — the post-verification evaluator v7 contract revision and five
  informal retrospective/prompt artifacts described above are material
  repository and methodology structure beyond the frozen Spike 007 brief and
  Design Map. They do not alter the verified product implementation or its
  observable runtime behavior.
