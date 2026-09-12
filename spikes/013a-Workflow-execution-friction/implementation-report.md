# Implementation Report — Spike 013a

status: IMPLEMENTED

## Changed behavior

- Every supported workflow role is now resolved by the host to a repository
  contract path, version and SHA-256 identity. Missing caller declarations are
  filled from that resolution; invented or conflicting declarations are
  rejected. Run inspection exposes the contract identity and its
  `host-directed-repository-load` or `host-directed-pinned-snapshot` delivery
  mode.
- Delegated evaluator authority is derived from the requesting workflow's own
  canonical ledger and committed artifact provenance. A workflow-owned pinned
  evaluator declaration is validated generically rather than enabled by a list
  of Spike IDs. Explicit human invocation remains a separate host-side route.
- Provider commands receive the resolved execution binding and a small
  structured result protocol. On clean process exit the local backend can turn
  a final `HARNESS_ROLE_RESULT` record into a host-bound semantic result without
  a second actor calling the result endpoint. Ordinary prose and malformed or
  extended markers remain diagnostic only.
- A terminal non-successful role run can be retried in the same host slot. The
  new run advances `executionAttempt` and links `previousExecutionId`; the old
  run remains inspectable. The runner now advances attempts after blocked or
  failed outcomes for every phase while keeping fixed-phase methodology attempt
  identity separate from execution attempts.
- Authority status includes evidence-aware transition availability. In
  particular, a repairable rejection exposes `correction-cycle-opened` as
  `available-requires-evidence` before the caller supplies that evidence.

## Consequential decisions

- Contract aliases remain accepted only as compatibility hints; the host always
  re-resolves and records the canonical repository path and content identity.
  This preserves existing callers without treating their strings as authority.
- Semantic outcomes use one provider-neutral stdout envelope appended by the
  host to both Codex and Claude prompts. The envelope carries only disposition
  and an optional reason; the host supplies and validates role, methodology
  attempt and contract authority from the immutable allocation binding.
- Canonical evaluator authorization validates committed brief, Design Map and,
  for verification, evaluator-preparation provenance before launch. This keeps
  the generalization data-driven without inventing a new authority service.

## Rejected complexity

- No provider-specific skill framework or persistent result broker was added.
  Both executors can honor the same host-directed repository load and terminal
  result envelope through their existing bounded CLI adapters.

## Tests and checks

- Added visible regression coverage for exact contract resolution and mismatch
  rejection, generic canonical evaluator delegation, explicit human evaluator
  invocation, automatic semantic-result capture, immutable linked retries, and
  provider command/result protocol behavior.
- Added runner regressions for blocked ordinary-phase retry and evidence-aware
  correction-cycle availability.
- `npm test` (69 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` pass.

## Limitations

- The provider result protocol deliberately requires a final structured stdout
  line. A provider that exits without emitting it remains `pending`; a clean
  process exit is still never semantic success.
- Mandatory live Claude/Codex fixture evidence remains evaluator-owned and has
  not been claimed here. This candidate reports implementation and visible
  tests, not independent evaluation.
