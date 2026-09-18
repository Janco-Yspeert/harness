# Evaluation Result — Spike 013a, attempt 012

## Overall Result

BLOCKED.

## Evaluation Source

- Verification-attempt identifier: `012` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `14`
  (`implementationAttempt: 10`, `cycle: "002"`, `evaluatorRevision: "003"`),
  evidence dated `2026-09-17T09:27:33.016Z`. No prior `verification-finalized`
  record exists for this allocation.
- Canonical `implementation-handoff` (cycle `002`, attempt `10`) evidence
  commit: `eaaa53dc8ea487deff592f804154fd447bb26f86` ("fix: enforce
  host-owned evaluator permissions") — **unchanged** from attempt `011`.
- Project `HEAD` at session start: `26d0a2e944be7d8e088364f8ab89d97893e75426`
  (attempt 011's own `docs:` commit, sitting directly on top of `eaaa53d` with
  no further implementation-source commits). `git status --porcelain -- src/
  tools/ test/ .hidden-test` at session start: empty — no uncommitted
  implementation source content. This attempt continues verification of the
  same candidate attempt 011 evaluated; it is not a rerun of `prepare` and
  does not re-litigate any criterion attempt 011 already `SATISFIED`.
- Working tree otherwise: the same pre-existing, unrelated, uncommitted drift
  in `spikes/011-host-owned-workflow-runs/workflow.jsonl` every prior attempt
  (002-011) independently observed and excluded (dated `2026-09-11`, predates
  every Spike 013a implementation commit); a new uncommitted
  `verification-allocated` attempt-14 line appended to this spike's own
  `workflow.jsonl` (see below); plus the same untracked, permission-masked
  `.mcp.json`, untracked `humam-acceptance.md`, untracked
  `skills/orchestrator/`, and two stale untracked
  `spikes/998a-authority-fixture-*` directories attempt 011 already
  identified as unrelated test-run residue. None of these are implementation
  source content, and none were modified.
- Frozen `eval-spec.md` identity:
  `sha256:7d944725376a078e21b236124b92044a03ad703059cff88b8512f9f0ab6d0195`
  (revision `003`, re-hashed fresh this attempt — matches `.eval/freeze.json`).
- `case-manifest.json` identity:
  `sha256:c53b0c3de7562032676a98518e7b102487d6afd23e4af8b6ce01072cb3e3c0c3`
  (re-hashed fresh — matches).
- Spike brief (`spike.md`) identity:
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  (re-hashed fresh — matches frozen).
- Design Map identity:
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
  (re-hashed fresh — matches frozen).
- Public `eval-requirements.md` identity:
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`
  (re-hashed fresh — matches frozen).
- Public `coverage-map.json` identity:
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`
  (re-hashed fresh — matches frozen).
- All five `.hidden-test/*.test.ts` files and `.hidden-test/manifest.json`
  re-hashed fresh this attempt; all byte-identical to revision `003`'s
  `freeze.json` identities (no drift). `.eval/freeze.json` itself re-hashed:
  `sha256:b4c4aab5b162acc33eb5c5fe6665d87b5e7f04905f00aeb575864bcfe00f52ca`
  (evaluator revision `003` identity — unchanged).
- `bootstrap/evaluator-skill.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`)
  re-hashed fresh; confirmed byte-identical to working-tree
  `skills/evaluator/SKILL.md` — the pin this evaluator session itself
  executes under.
- Evaluator revision: `003` (unchanged; no evaluator correction performed or
  needed this attempt).
- No specification drift detected in any frozen input.
- Evaluation timestamp: 2026-09-17 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `012`).

## Why this attempt exists, and its exact scope

Attempt `011` finalized `BLOCKED`/`INFRASTRUCTURE_FAILURE` because `AC08`/
`AC09` (`LP1`) — and their `AC34` derivative — could not be established: no
`claude` executable, no configured executor, and no live Harness host process
were reachable from that session. This attempt's dispatch instructions state
that the previously-unavailable `LP1` live-Claude fixture has since completed
successfully as Harness run `f6108ed0-a56e-47e6-b598-2188a57beddb`, and direct
this evaluator to inspect that run and its `/workflow-runs/{id}/log` evidence
"through the normal Harness run inspection surface" — i.e. the same
`GET /workflow-runs/{id}` and `GET /workflow-runs/{id}/log` HTTP surface
`tools/workflow.ts`'s own `fetchRun`/`log`-path CLI logic uses against
`HARNESS_HOST_URL` (default `http://127.0.0.1:3000`) — rather than accepting
the claim on its own prose. The dispatch instructions also explicitly
anticipate that this sandbox may be unable to reach that surface, and direct
this evaluator to preserve the attempt as `BLOCKED` and report that specific
access boundary in that case, rather than either fabricating inspection
evidence or silently treating the unverified claim as `PASS`.

The candidate implementation is unchanged from attempt 011 (same commit,
confirmed above). This attempt's scope is therefore narrow: reuse attempt
011's already-established `SATISFIED` evidence for the 32 unaffected criteria
(re-confirmed fresh below, per the frozen contract's "Preserve and use prior
valid verification evidence where the frozen evaluator contract permits it"),
and specifically attempt to inspect run `f6108ed0-a56e-47e6-b598-2188a57beddb`
for `LP1`/`AC08`/`AC09`/`AC34` — without independently re-running the live
Claude fixture itself, per the dispatch instruction "Do not rerun LP1 merely
because it was executed outside this evaluator process."

## LP1 run-inspection attempt (AC08, AC09, AC34): access boundary confirmed — BLOCKED

This evaluator session does not have, and was not supplied, any local record
of Harness run `f6108ed0-a56e-47e6-b598-2188a57beddb` (a targeted search for
the literal run ID across both the public `harness` checkout and the private
`harness-hidden` tree returned no matches). Per `LP1`'s frozen fixture
(`case-manifest.json`), the expected result is "visible through the normal
run/workflow inspection surface" — this evaluator therefore attempted exactly
that surface, from inside its own sandbox, rather than either trusting the
claim or inventing a substitute inspection path:

- `printenv | grep -i HARNESS_HOST`: empty. No `HARNESS_HOST_URL` is
  configured in this session; `tools/workflow.ts`'s own resolution therefore
  falls back to its hardcoded `DEFAULT_HOST_URL`
  (`http://127.0.0.1:3000`) — confirmed by direct source reading
  (`tools/workflow.ts` line 14/406). No other host URL is configured or
  discoverable anywhere in this session (checked `printenv` for any
  host/port/url-shaped variable, and both repository checkouts for a `.env`
  file at their roots — none exists).
- Direct `GET http://127.0.0.1:3000/workflow-runs/f6108ed0-a56e-47e6-b598-2188a57beddb`
  and `GET http://127.0.0.1:3000/workflow-runs/f6108ed0-a56e-47e6-b598-2188a57beddb/log`,
  issued via `node`'s `fetch` (the identical HTTP client mechanism
  `tools/workflow.ts`'s own `fetchRun`/log-path logic uses): both fail
  identically with `ECONNREFUSED`, not a timeout and not a sandbox-egress
  denial. `curl -sv` to the same URL independently confirms: `Trying
  127.0.0.1:3000... connect to 127.0.0.1 port 3000 ... Connection refused`.
- `ss -tln`: only `*:3128` and `*:1080` (this sandbox's own outbound
  egress-filtering proxy ports) are listening. Nothing listens on port `3000`
  or any other port in this sandbox's network namespace that could be a
  Harness host.
- This is conclusive, not merely inconclusive: `WorkflowRunRegistry` (the
  component that would hold run `f6108ed0`'s record) is a pure in-memory
  `Map` (`src/workflow-run.ts`, `#runs = new Map<string, InternalRun>()`) with
  no disk persistence of any kind (confirmed by reading the class and
  grepping the file for `writeFile`/persistence calls — none write run
  state). Even if this session could start a *fresh* local Harness host
  process, that fresh process's registry would be empty and could not
  produce run `f6108ed0`'s record; only the original host process instance
  that actually allocated and ran it holds that data, and this sandbox has no
  network path to any live Harness host process at all — confirmed directly,
  not inferred.
- `command -v claude`: not found. `printenv | grep -i HARNESS_CLAUDE`: empty.
  These are consistent with, but secondary to, the primary blocking fact
  above: even setting aside executor availability, this session has no way to
  *observe* the claimed run's terminal result or log through the normal
  inspection surface, which is what the dispatch instructions specifically
  asked this evaluator to attempt and report on.

**Conclusion:** this evaluator sandbox cannot reach the live Harness host
that would hold run `f6108ed0-a56e-47e6-b598-2188a57beddb`'s record, through
the normal `GET /workflow-runs/{id}` / `GET /workflow-runs/{id}/log`
inspection surface or any other route available inside this sandbox. Per this
attempt's own dispatch instructions, this is preserved as `BLOCKED` and this
specific access boundary is reported, rather than either fabricating
inspection evidence for the claimed run or substituting an unverified prose
claim for the frozen fixture's own "visible through the normal run/workflow
inspection surface" requirement. This is a distinct, more specific finding
than attempt 011's "no live Harness host process reachable" (which was framed
around executor/provider availability); this attempt confirms the same
underlying sandbox network-access boundary blocks *inspection* of an
already-externally-completed run just as it blocked *allocating* one.

**Result:** `AC08`, `AC09` remain `BLOCKED`. `AC34` (`COMP1`, part b) remains
`BLOCKED` (derivative, unchanged reasoning from every prior attempt). `AC33`
(`COMP1`, part a) is independently unaffected (below, reused from attempt
011's unchanged evidence).

## Non-executable cases reused/reconfirmed this attempt (PR1-PR7, LP2, LP3, HB1, COMP1-part-a)

The candidate is byte-identical to the one attempt 011 evaluated (confirmed
above: same commit, no uncommitted source changes). Per the frozen contract's
license to "Preserve and use prior valid verification evidence where the
frozen evaluator contract permits it," this attempt reuses attempt 011's
`SATISFIED` disposition for all 32 unaffected criteria, and additionally
re-confirms the two directly re-executable evidence classes fresh this
attempt rather than relying on citation alone:

- `PR1`-`PR7` (`AC01`-`AC07`, `AC12`-`AC15`, `AC18`, `AC23`-`AC26`, `AC29`-
  `AC31`): `SATISFIED` — re-confirmed fresh this attempt via a full `npm
  test` run against the unchanged `HEAD` (see "Regression Results" below);
  identical result to attempt 011 (`78/78`).
- `E1`-`E5` (`AC16`, `AC17`, `AC19`-`AC22`, `AC27`, `AC28`, `AC35`):
  `SATISFIED` — re-confirmed fresh this attempt via a direct `node --test`
  run of all five frozen `.hidden-test/*.test.ts` files against the unchanged
  `HEAD` (6/6 sub-tests pass, including both `E2` fixtures). Identical result
  to attempt 011.
- `LP2` (`AC10`), `LP3` (`AC11`), `HB1` (`AC32`), `COMP1`-part-a (`AC33`):
  `SATISFIED` — reused unchanged from attempt 011's own reference to
  diff-unaffected, already-established live-Codex evidence from earlier
  attempts in this cycle. Nothing in this attempt's own investigation (which
  touched only `LP1`'s inspection surface, not the Codex dispatch path)
  disturbs that basis; no new diff exists since attempt 011 to re-check for
  overlap.

## Findings

None new this attempt. No evaluator defect was discovered; no in-attempt
correction was performed or required. The access-boundary finding above is a
sandbox/environment observation, not a candidate or evaluator defect.

## Regression Results

- `npm test` at `HEAD` (`26d0a2e`, implementation content `eaaa53d`):
  **78/78 pass, 0 fail** — identical to attempt 011.
- `.hidden-test/*.test.ts` (E1-E5, 6 sub-tests across 5 files) via `node
  --test`: **6/6 pass** — identical to attempt 011.
- `git status --porcelain -- src/ tools/ test/ .hidden-test`: empty, both
  before and after these runs — no fixture residue left under tracked
  implementation source paths.
- `npm run typecheck`, `npm run lint`, `npm run format:check`, and `git diff
  --check` were not independently re-run this attempt (unnecessary: no
  implementation source content changed since attempt 011, which already
  confirmed all four green; re-running `npm test` and the hidden suite fresh
  already provides direct confirmation that nothing regressed).

## Diagnostic Probes

- Probe: `printenv | grep -i HARNESS_HOST` / `HARNESS_CLAUDE` — confirms no
  host URL or executor path is configured in this session.
- Probe: direct `node fetch()` GET requests to
  `http://127.0.0.1:3000/workflow-runs/f6108ed0-a56e-47e6-b598-2188a57beddb`
  and its `/log` suffix, using the same HTTP client primitive
  `tools/workflow.ts` itself uses — both `ECONNREFUSED`.
- Probe: `curl -sv` to the same URL — independently confirms `Connection
  refused`, ruling out a `node`-specific artifact.
- Probe: `ss -tln` — confirms nothing listens on port `3000` (or any port
  other than this sandbox's own egress-proxy ports) in this sandbox's network
  namespace.
- Probe: direct reading of `src/workflow-run.ts`'s `WorkflowRunRegistry`
  class and a grep for persistence calls — confirms run records are
  in-memory only, ruling out any on-disk fallback this sandbox could read
  instead of a live host connection.
- Probe: targeted search for the literal run ID
  `f6108ed0-a56e-47e6-b598-2188a57beddb` across both the public and private
  checkouts — no matches, confirming no local record of this run exists to
  fall back on.
- `command -v claude`: not found (secondary confirmation, consistent with
  every prior blocked attempt).
- None of these probes changed a `PASS`/`FAIL`/`BLOCKED` determination away
  from what they directly established; they collectively and conclusively
  establish the access boundary rather than merely suggesting it.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during
  this attempt. No evaluator defect was discovered. Evaluator revision
  remains `003`, unchanged.
- No specification drift was detected in any frozen input this attempt.
- This attempt did not invent a substitute inspection path (e.g. treating an
  unverified prose claim about run `f6108ed0` as sufficient, or fabricating a
  plausible-looking run/log record) when the frozen fixture's own "visible
  through the normal run/workflow inspection surface" requirement could not
  be met from inside this sandbox. Per this attempt's own dispatch
  instructions, the specific access boundary is reported instead.
- This attempt did not rerun the live Claude fixture itself (no fresh
  `/workflow-fixtures` or `/workflow-runs` POST was attempted against any
  host, live or otherwise, for a Claude-executor role), consistent with the
  dispatch instruction not to rerun `LP1` merely because it executed outside
  this evaluator process.

## Overall Assessment

This attempt continues verification of the exact same candidate attempt 011
evaluated. All 32 previously-`SATISFIED` criteria are reused/re-confirmed
unchanged. The dispatch instructions asked this evaluator to independently
inspect a specific, already-completed live-Claude Harness run
(`f6108ed0-a56e-47e6-b598-2188a57beddb`) through the normal run/workflow
inspection surface for `AC08`/`AC09`/`AC34`, and explicitly anticipated that
this sandbox might be unable to do so. That is exactly what was found: this
sandbox has no network path to any live Harness host process (confirmed
directly via failed connection attempts, an empty listening-port scan, and
source-level confirmation that run records are purely in-memory with no disk
fallback), so the claimed run's terminal result and log cannot be
independently verified from inside this session. This is squarely `BLOCKED`/
`INFRASTRUCTURE_FAILURE` per the frozen contract — a sandbox network-access
boundary external to both the candidate implementation and the frozen
evaluator, not a license to either accept the unverified claim as `PASS` or
invent a substitute basis.

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is still required, run from a session or
environment with actual network access to the live Harness host process that
holds run `f6108ed0`'s record (or any subsequent equivalent run), so that the
`GET /workflow-runs/{id}` and `GET /workflow-runs/{id}/log` surface can
actually be reached and the claimed terminal disposition and log evidence
independently inspected — or supplied with fresh, independently-verifiable
external evidence in a form this evaluator's own sandbox can reach and
corroborate against primary sources, following the precedent in
`.eval/evidence/lp1-external-live-claude-2026-09-13.md` and attempt 003's
corroboration method. No evaluator correction is warranted or was performed
this attempt.

## Public Feedback

A short public feedback artifact (`verification-feedback-012.md`) is
recorded, noting: (a) the continued `BLOCKED`/`INFRASTRUCTURE_FAILURE`
disposition for AC08/AC09/AC34; (b) that this attempt specifically attempted
to inspect the claimed completed run through the normal run/workflow
inspection surface and found no network path to any live Harness host
process from inside this sandbox; and (c) that all other 32 criteria remain
`SATISFIED`, re-confirmed fresh via the full public and hidden regression
suites. No hidden mechanics are disclosed.

## Final execution record

Per the evaluator skill's "Final execution record": this attempt's richer
statistics are captured in this file and in `.eval/attempt-ledger.json`
first, before the public `manifest.md` aggregate entry, the canonical
workflow-ledger `verification-finalized` transition, and
`verification-feedback-012.md` are written and committed. This attempt's
final public commit also carries forward the pre-existing, uncommitted
canonical-ledger line this session found at start (`verification-allocated`
attempt 14, unmodified — see "Evaluation Source" above).
