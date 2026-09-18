# Evaluation Result — Spike 013a, attempt 013

## Overall Result

BLOCKED.

## Evaluation Source

- Verification-attempt identifier: `013` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `15`
  (`implementationAttempt: 10`, `cycle: "002"`, `evaluatorRevision: "003"`),
  evidence dated `2026-09-17T11:48:18.004Z`. No prior
  `verification-finalized` record exists for this specific allocation.
- Canonical `implementation-handoff` (cycle `002`, attempt `10`) evidence
  commit: `eaaa53dc8ea487deff592f804154fd447bb26f86` ("fix: enforce
  host-owned evaluator permissions") — **unchanged** from attempts `011` and
  `012`.
- Project `HEAD` at session start: `087116b` (attempt 012's own `docs:`
  commit, sitting directly on top of `26d0a2e` (attempt 011's docs commit)
  and `eaaa53d`, with no further implementation-source commits).
  `git status --porcelain -- src/ tools/ test/ .hidden-test` at session
  start: empty — no uncommitted implementation-source content. This attempt
  continues verification of the same candidate attempts 011 and 012
  evaluated; it is not a rerun of `prepare` and does not re-litigate any
  criterion those attempts already found `SATISFIED`.
- Working tree otherwise: the same pre-existing, unrelated, uncommitted
  drift in `spikes/011-host-owned-workflow-runs/workflow.jsonl` every prior
  attempt (002-012) independently observed and excluded (dated
  `2026-09-11`, predates every Spike 013a implementation commit); a modified
  `spikes/013a-Workflow-execution-friction/workflow.jsonl` carrying this
  attempt's own pre-existing, uncommitted `verification-allocated` attempt-15
  line (found at session start, not authored this session); plus the same
  untracked, permission-masked `.mcp.json`, untracked `humam-acceptance.md`,
  untracked `skills/orchestrator/`, and two stale untracked
  `spikes/998a-authority-fixture-*` directories attempts 011-012 already
  identified as unrelated test-run residue. None of these are implementation
  source content, and none were modified this attempt.
- Frozen `eval-spec.md` identity:
  `sha256:7d944725376a078e21b236124b92044a03ad703059cff88b8512f9f0ab6d0195`
  (revision `003`, re-hashed fresh this attempt — matches
  `.eval/freeze.json`).
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
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `013`).

## Why this attempt exists, and its exact scope

Attempts `011` and `012` both finalized `BLOCKED`/`INFRASTRUCTURE_FAILURE`
because `AC08`/`AC09` (`LP1`) and their `AC34` derivative could not be
established: no live Harness host process was reachable from either
session, either to allocate a fresh fixture run (attempt 011) or to inspect
a specific claimed-completed run `f6108ed0-a56e-47e6-b598-2188a57beddb`
through the normal `GET /workflow-runs/{id}` / `GET /workflow-runs/{id}/log`
surface (attempt 012).

This attempt's dispatch instructions assert that attempt 012's own
verification was "BLOCKED only because its sandbox could not query the live
Harness host," that "LP1 itself completed successfully," and supply, pasted
directly in the task prompt (not as a committed repository artifact and not
reachable through any inspection surface), a purported verbatim Harness run
record and provider log for run `f6108ed0-a56e-47e6-b598-2188a57beddb`, with
asserted SHA-256 identities for each. The dispatch explicitly leaves this
evaluator authoritative over whether that material is sufficient, and
explicitly permits finalizing `BLOCKED` and stopping if independent
live-host querying is actually required.

The candidate implementation is unchanged from attempts 011/012 (same
commit, confirmed above). This attempt's scope is therefore narrow: reuse
attempts 011/012's already-established `SATISFIED` evidence for the 32
unaffected criteria (re-confirmed fresh below), and specifically evaluate
the admissibility of the newly-supplied prompt-pasted "evidence" for
`LP1`/`AC08`/`AC09`/`AC34`.

## Admissibility evaluation of the supplied "verbatim" run record and log (AC08, AC09, AC34)

`LP1`'s frozen fixture (`case-manifest.json`) requires "a Harness-validated
successful evaluator-role disposition, reached with no manual `/evaluator`
... invocation after allocation, **visible through the normal run/workflow
inspection surface**" (emphasis on the evidentiary bar, not just the
semantic outcome). This is a pre-established, frozen testability requirement
from `prepare`, not something this attempt may loosen post-implementation.

This evaluator treated the supplied material exactly as attempt 003's own
precedent requires for any evidence a written claim asserts rather than this
evaluator itself establishes: "A written claim about candidate behavior is
not, by itself, evidence this evaluator established. Before treating it as
authoritative, [it must be] independently verified ... against primary,
harder-to-fabricate sources rather than accepting the summary's prose."
Concretely, this attempt performed the following checks before deciding
admissibility:

1. **Repository search for any independently-inspectable copy.** A targeted
   search for the literal run ID `f6108ed0-a56e-47e6-b598-2188a57beddb`
   across both the public `harness` checkout and the private
   `harness-hidden` tree found it only inside attempt 012's own
   `eval-result.md` (where it was itself only a *claim relayed from that
   attempt's own dispatch instructions*, not established) and this attempt's
   own new material. No committed evidence file analogous to
   `.eval/evidence/lp1-external-live-claude-2026-09-13.md` (attempt 002's
   evidence) or `lp1-primary-evidence-008.md` (attempt 008's promoted
   evidence, Run 022/023) exists anywhere for this claimed run. Both of
   those precedents were real files with real Git or filesystem provenance
   this evaluator could independently inspect; the material supplied this
   attempt is not.
2. **Self-consistency check of the supplied hashes.** The exact bytes of the
   supplied "verbatim LP1 run record" were reconstructed into a file
   (`$TMPDIR/lp1-record.json`) and hashed:
   `sha256sum` returned
   `23bd5e8a410f08aee2b3d3f2195b45b07a8a2185ab78594bca5c417195f51e19`,
   matching the claimed "Record SHA-256" exactly. This confirms only that
   the prompt quoted its own pasted bytes correctly — it is not independent
   corroboration of anything. Any party constructing this prompt, genuine or
   not, could trivially compute and quote a correct hash of its own text;
   self-consistency of a claim with its own stated checksum carries zero
   evidentiary weight about the claim's external origin.
3. **Independent inspection surface, re-attempted fresh this session.**
   `printenv | grep -i HARNESS_HOST`: empty (same as attempt 012). Direct
   `curl -sv --max-time 5 http://127.0.0.1:3000/workflow-runs/f6108ed0-...`:
   `Connection refused` (same as attempt 012, confirmed fresh in this
   distinct sandbox instance). `ss -tln`: only this sandbox's own egress
   proxy ports (`1080`, `3128`) listen; nothing listens on `3000` or any
   other candidate host port. This independently reconfirms attempt 012's
   finding that this sandbox has no network path to any live Harness host
   process, so the fixture's own "visible through the normal run/workflow
   inspection surface" bar cannot be met from inside this session by any
   means — supplied evidence or otherwise.
4. **Independently-checkable session-transcript channel (attempt 003's
   successful precedent method) re-attempted.** Attempt 003 admitted
   external evidence only after corroborating it against real Claude Code
   session transcripts at a filesystem location that evaluator session could
   read but had not authored (`/home/velveteen/.claude/projects/...`),
   confirming exact candidate-code-constructed prompt text, tool-call
   history, and repository-state invariance — content a hand-written
   markdown summary could not fabricate. This session attempted the
   equivalent check: `/home/velveteen/.claude/projects/` is not accessible
   from this sandbox at all (`No such file or directory`; this path is not
   part of this session's granted read surface). No comparable
   independently-checkable, harder-to-fabricate corroboration channel is
   available to this session for the newly-supplied material.

**Conclusion on admissibility:** the supplied "verbatim" run record and
provider log are pasted task-prompt text, not a committed repository
artifact, not reachable through the frozen fixture's own required normal
run/workflow inspection surface (confirmed unreachable again, independently,
this session), and not corroborable against any primary source this
evaluator can independently read (no committed evidence file, no accessible
session-transcript channel, no reachable host). A matching self-quoted
SHA-256 establishes only that the prompt is internally consistent with
itself, not that the described run actually occurred on a genuine Harness
host. Treating prompt-supplied prose plus a self-consistent hash as
sufficient would mean silently substituting a weaker evidentiary standard
for the one `prepare` froze ("visible through the normal run/workflow
inspection surface") based solely on an assertion made after implementation
— exactly the "fabricating inspection evidence" and "silently treating an
unverified claim as PASS" outcomes attempt 012 was explicitly instructed
not to produce, and precisely the failure mode `prepare`'s frozen rules
guard against by requiring genuine falsifiability. This is not
correctable by task-prompt assertion, and per this attempt's own dispatch
instructions, an insufficiency of this kind is to be finalized `BLOCKED`
and stopped — not treated as license to relax the evaluator's own frozen
standard, contact any external system, or alter the sandbox.

**Result:** `AC08`, `AC09` remain `BLOCKED`. `AC34` (`COMP1`, part b) remains
`BLOCKED` (derivative, unchanged reasoning from every prior attempt). `AC33`
(`COMP1`, part a) is independently unaffected (below, reused from attempts
011/012's unchanged evidence).

## Non-executable cases reused/reconfirmed this attempt (PR1-PR7, LP2, LP3, HB1, COMP1-part-a)

The candidate is byte-identical to the one attempts 011 and 012 evaluated
(confirmed above: same commit, no uncommitted source changes). Per the
frozen contract's license to "Preserve and use prior valid verification
evidence where the frozen evaluator contract permits it," this attempt
reuses that `SATISFIED` disposition for all 32 unaffected criteria, and
additionally re-confirms the two directly re-executable evidence classes
fresh this attempt rather than relying on citation alone:

- `PR1`-`PR7` (`AC01`-`AC07`, `AC12`-`AC15`, `AC18`, `AC23`-`AC26`, `AC29`-
  `AC31`): `SATISFIED` — re-confirmed fresh this attempt via a full `npm
  test` run against the unchanged `HEAD` (78/78 pass — identical to attempts
  011/012).
- `E1`-`E5` (`AC16`, `AC17`, `AC19`-`AC22`, `AC27`, `AC28`, `AC35`):
  `SATISFIED` — re-confirmed fresh this attempt via a direct `node --test`
  run of all five frozen `.hidden-test/*.test.ts` files against the
  unchanged `HEAD` (6/6 sub-tests pass, including both `E2` fixtures).
  Identical result to attempts 011/012.
- `LP2` (`AC10`), `LP3` (`AC11`), `HB1` (`AC32`), `COMP1`-part-a (`AC33`):
  `SATISFIED` — reused unchanged from attempt 011's own reference to
  diff-unaffected, already-established live-Codex evidence from earlier
  attempts in this cycle. Nothing in this attempt's own investigation
  (which touched only `LP1`'s evidentiary admissibility, not the Codex
  dispatch path) disturbs that basis; no new diff exists since attempt 011
  to re-check for overlap.

## Findings

None new this attempt beyond the admissibility analysis above. No evaluator
defect was discovered; no in-attempt correction was performed or required.
The inadmissibility finding is an evidentiary/provenance determination
applied against the frozen `LP1` fixture's own pre-established requirement,
not a change to that requirement, a candidate defect, or an evaluator
defect.

## Regression Results

- `npm test` at `HEAD` (`087116b`, implementation content `eaaa53d`):
  **78/78 pass, 0 fail** — identical to attempts 011/012.
- `.hidden-test/*.test.ts` (E1-E5, 6 sub-tests across 5 files) via `node
  --test`: **6/6 pass** — identical to attempts 011/012.
- `git status --porcelain -- src/ tools/ test/ .hidden-test`: empty, both
  before and after these runs — no fixture residue left under tracked
  implementation source paths.
- `npm run typecheck`, `npm run lint`, `npm run format:check`, and `git diff
  --check` were not independently re-run this attempt (unnecessary: no
  implementation source content changed since attempt 011, which already
  confirmed all four green; re-running `npm test` and the hidden suite fresh
  already provides direct confirmation that nothing regressed).

## Diagnostic Probes

- Probe: reconstructed the supplied "verbatim" run record byte-for-byte into
  a temporary file and computed its SHA-256 — matches the claimed
  "Record SHA-256" exactly. Non-authoritative: confirms only prompt
  self-consistency, not external genuineness; did not change the
  disposition.
- Probe: repository-wide search (public and private checkouts) for the
  literal claimed run ID — found only in attempt 012's own prior citation of
  the same unestablished claim; no independently-committed evidence artifact
  exists.
- Probe: `printenv | grep -i HARNESS_HOST` — empty, no host URL configured.
- Probe: `curl -sv --max-time 5` to the default host inspection URL for the
  claimed run — `Connection refused`, independently reconfirming attempt
  012's finding in a fresh sandbox instance.
- Probe: `ss -tln` — confirms nothing listens on port `3000` (or any port
  other than this sandbox's own egress-proxy ports) in this sandbox's
  network namespace.
- Probe: attempted to read `/home/velveteen/.claude/projects/` (the channel
  that made attempt 003's external evidence admissible) — not accessible
  from this sandbox at all.
- None of these probes changed a `PASS`/`FAIL`/`BLOCKED` determination away
  from what they directly established; they collectively establish both the
  unchanged access boundary and the inadmissibility of the newly-supplied
  material, rather than merely suggesting either.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during
  this attempt. No evaluator defect was discovered. Evaluator revision
  remains `003`, unchanged.
- No specification drift was detected in any frozen input this attempt.
- This attempt did not invent a substitute inspection path or relax the
  frozen `LP1` fixture's own "visible through the normal run/workflow
  inspection surface" requirement based on prompt-supplied prose plus a
  self-quoted checksum. It did not fabricate inspection evidence, did not
  silently treat an unverified claim as `PASS`, and did not contact,
  configure, or attempt to stand up any substitute host/service outside this
  sandbox's granted surface in order to manufacture corroboration.
- This attempt did not rerun the live Claude fixture itself, consistent with
  the dispatch instruction not to rerun `LP1` merely because the original
  host is no longer alive.

## Overall Assessment

This attempt continues verification of the exact same candidate attempts
011 and 012 evaluated. All 32 previously-`SATISFIED` criteria are
reused/re-confirmed unchanged. The dispatch instructions asked this
evaluator to judge, as the authoritative party, whether prompt-supplied
"verbatim" run-record and log text for a specific already-claimed run
constitutes sufficient evidence for `AC08`/`AC09`/`AC34` given continued
inability to query the live host directly, and explicitly permitted
finalizing `BLOCKED` and stopping if independent live-host querying is
actually required. That is the conclusion this attempt reached: the
supplied material is not independently verifiable through the frozen
fixture's own required inspection surface, is not a committed artifact, and
matches no primary source this evaluator's sandbox can reach — a
self-quoted checksum does not substitute for any of that. This is squarely
`BLOCKED`/`INFRASTRUCTURE_FAILURE` per the frozen contract, continuing the
same underlying sandbox network-access boundary attempts 011 and 012
identified, now additionally confirmed to extend to prompt-supplied
after-the-fact "evidence" that cannot itself be independently corroborated.

Per its own dispatch instructions, this attempt finalizes accordingly and
stops here: it does not alter the sandbox, the evaluator, or the
implementation, and does not attempt a substitute inspection path.

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is still required, run from a session or
environment with actual network access to a live Harness host process (or
supplied with evidence in a form this evaluator's sandbox can independently
reach and corroborate against primary sources — a committed repository
artifact with real provenance, or an accessible session-transcript-class
channel — following the precedent in
`.eval/evidence/lp1-external-live-claude-2026-09-13.md` and attempt 003's
corroboration method), so that `AC08`/`AC09`/`AC34` can actually be
established. No evaluator correction is warranted or was performed this
attempt.

## Public Feedback

A short public feedback artifact (`verification-feedback-013.md`) is
recorded, noting: (a) the continued `BLOCKED`/`INFRASTRUCTURE_FAILURE`
disposition for AC08/AC09/AC34; (b) that this attempt specifically evaluated
the admissibility of newly-supplied prompt-pasted "evidence" for a claimed
completed run and found it independently uncorroborable and outside the
frozen fixture's own required inspection surface; and (c) that all other 32
criteria remain `SATISFIED`, re-confirmed fresh via the full public and
hidden regression suites. No hidden mechanics are disclosed.

## Final execution record

Per the evaluator skill's "Final execution record": this attempt's richer
statistics are captured in this file and in `.eval/attempt-ledger.json`
first, before the public `manifest.md` aggregate entry, the canonical
workflow-ledger `verification-finalized` transition, and
`verification-feedback-013.md` are written and committed. This attempt's
final public commit also carries forward the pre-existing, uncommitted
canonical-ledger `verification-allocated` attempt-15 line this session found
at start (unmodified — see "Evaluation Source" above).
