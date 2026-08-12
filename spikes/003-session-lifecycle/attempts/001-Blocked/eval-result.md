# Evaluation Result

## Overall Result

BLOCKED

No confirmed contract violation (`IMPLEMENTATION_FAILURE`) was found anywhere in
this run. However, a fair `PASS` cannot be issued because:

- Several mandatory evaluation cases could not be reliably executed due to
  defects in the frozen hidden-test harness itself (`EVALUATOR_DEFECT`).
- One mandatory requirement (the descendant-cleanup portion of R17) is blocked
  by a genuine, previously-unsurfaced `SPECIFICATION_AMBIGUITY` in `spike.md`'s
  own wording, discovered and confirmed empirically during this run.

Both issues require deliberate, recorded action (evaluator-harness revision; a
human decision on the ambiguity) before verification can be completed. Per the
workflow, `BLOCKED`/`FAIL` results are not promoted; the private artifacts below
are left unchanged.

## Evaluation Source

- Project commit evaluated: `839c5114a01bb2014ef0c3da7765c6560f33c9df` (branch
  `feat/spike-003-session-lifecycle`)
- Frozen `eval-spec.md`: status `Frozen`, hashes recorded at freeze time
  verified against the current `spike.md` / `eval-requirements.md` — **no spec
  drift detected** (both blob hashes match exactly: `spike.md` =
  `68e65a91d4034cfa387f2d21bfd0ad5343d0fd69`, `eval-requirements.md` =
  `3d01b0c07c3d9929d18bcd4c06853615eabcf8e8`).
- Evaluation timestamp: 2026-08-12T16:51:48Z

## Summary

- Mandatory evaluation cases: 22 (23 executable tests; E21 has two runs, one per
  signal)
- Passed with solid, reliable evidence: **14** (E1, E2, E3, E4, E5, E10, E13,
  E14, E16, E17, E18, E21×2, E22)
- Passed partially / reliable-for-part-only: **1** (E11 — the `$PWD` assertion
  passed; the environment-variable assertion is invalidated by an evaluator
  defect, see below)
- `IMPLEMENTATION_FAILURE`: **0**
- `EVALUATOR_DEFECT`: **7** case-executions affected — E6, E7, E8, E9, E19 (one
  shared root cause), E11 (env-var assertion only), E12 (test design
  fundamentally unfalsifiable)
- `SPECIFICATION_AMBIGUITY`: **1** distinct issue, affecting **2** mandatory
  cases — E15, E20 (the descendant-process-group scope of R17)
- `INFRASTRUCTURE_FAILURE`: 0
- `SPEC_DRIFT`: 0 (none detected)

## Findings

### Finding 1 — `EVALUATOR_DEFECT`: `attemptAttach` helper crashes on

rejected WebSocket upgrades

- Affected cases: E6, E7, E8, E9, E19 (all mandatory; cover R6, R7, R14, R16,
  I1, I3, I6, N4 on the attach path).
- Observed behaviour: each test threw
  `Error: WebSocket was closed before the connection was established`,
  originating from `WebSocket.terminate()` inside `.hidden-test/helpers.ts`'s
  `attemptAttach`. The handler calls `cleanup()` (which removes the `'error'`
  listener) _before_ calling `socket.terminate()` on a socket that is still in
  the `CONNECTING` state (it only just received a non-101 HTTP response).
  `terminate()` in that state schedules an asynchronous `'error'` emission;
  because the listener was already removed, Node treats it as unhandled and
  throws, crashing the test after (in at least one path) the correct status code
  had already been observed.
- This is a bug in the hidden-test support code, not in the implementation: the
  server-side behaviour that triggered `'unexpected-response'` in the first
  place (a real HTTP-level rejection, never reaching `101`) is exactly what
  R6/I6 require.
- Independent diagnostic evidence (see below) confirms the implementation's
  actual behaviour is correct for all five cases.
- Required action: revise `attemptAttach` (e.g. don't remove the `'error'`
  listener before `terminate()`, or replace `terminate()` with a safe no-op
  guard) and re-run. Frozen artifacts left unchanged per the "do not repair
  during verification" rule.

### Finding 2 — `EVALUATOR_DEFECT`: E11 environment-variable assertion

matches the terminal's echoed input, not real command output

- Affected case: E11 (mandatory; covers R9).
- Observed behaviour: `actual: '$HARNESS_TEST_VAR'` — the captured group is the
  literal, unexpanded variable reference, not its value.
- Root cause: the test sends `echo __HARNESS_ENV__:$HARNESS_TEST_VAR` as raw PTY
  input and matches output against `/__HARNESS_ENV__:(\S*)\r?\n/`. Because the
  PTY echoes typed input back before Bash executes it, and the _typed_ command
  text itself contains the contiguous substring
  `__HARNESS_ENV__:$HARNESS_TEST_VAR`, the regex matches the echoed input line
  before Bash's real output line ever arrives. The `$PWD` assertion earlier in
  the same test avoids this (it uses `printf '%s:%s\n' __HARNESS_PWD__ "$PWD"`,
  where the format string's colon is not adjacent to the marker in the raw typed
  text) and passed correctly — that portion is solid evidence for R9.
- This mirrors a technique already used correctly in the project's own
  `test/spike.integration.test.ts`
  (`marker=__HARNESS_; echo "${marker}HELLO__"`, constructed so the marker never
  appears contiguously in the raw typed text). The hidden test should have
  followed the same established convention for the environment-variable check
  and did not.
- Required action: rewrite the assertion using a non-contiguous marker
  construction (e.g.
  `marker=__HARNESS_ENV__; echo "${marker}:$HARNESS_TEST_VAR"`) before this
  portion of R9 can be reliably judged.

### Finding 3 — `EVALUATOR_DEFECT`: E12 is unfalsifiable as designed

- Affected case: E12 (mandatory; covers N3).
- Observed behaviour: the reattached client's collected output contained
  `[1]+  Done                    ( sleep 0.5; echo __HARNESS_STALE_MARKER__ )` —
  this is interactive Bash's own job-control "Done" notification, which always
  echoes the _source command line_ of a completed background job the next time
  the shell is interacted with. Because the test's own marker string was chosen
  to also appear in the backgrounded command's source text, this notification
  alone satisfies the test's "was the marker replayed" substring check —
  regardless of whether real PTY output replay ever occurred. No evidence in
  this run indicates actual output retention/replay; the test simply cannot
  distinguish "replayed output" from "Bash announcing a job finished" using this
  design.
- This is independent of the implementation and would fail identically against a
  fully correct implementation, so it cannot be used to judge N3 either way in
  its current form.
- Required action: redesign the case (e.g. use a background job whose command
  text does not contain the marker, or disable job-control notifications for the
  test session) before N3 can be judged.

### Finding 4 — `SPECIFICATION_AMBIGUITY`: process-group scope for

backgrounded jobs (R17)

- Affected cases: E15, E20 (both mandatory).
- Observed behaviour: E15 timed out waiting for a backgrounded `sleep 60` child
  to exit after `DELETE /sessions/:id`; E20 reported the same background PID
  still alive after programmatic shutdown (the _primary_ shell-PID assertion in
  E20 passed in both cases — Bash itself is correctly terminated in every case).
- Root cause, confirmed empirically (not theorized): a `node-pty`-spawned
  interactive Bash (`--noprofile --norc -i`) enables job control, and job
  control gives every backgrounded job **its own process group**, distinct from
  Bash's own. A direct check (`ps -o pgid=`) showed Bash's pgid equal to its own
  pid, and the backgrounded `sleep`'s pgid equal to _its own_ pid — confirmed
  different groups. The implementation's cleanup
  (`process.kill(-session.terminal.pid, signal)`) therefore can never reach a
  backgrounded job under normal interactive job control, regardless of how it's
  invoked.
- `spike.md`'s own text says cleanup "must terminate Bash and processes still
  belonging to the PTY's managed process group." Given the above, this clause is
  genuinely ambiguous: read literally/narrowly (Bash's own single process-group
  id), the current implementation already satisfies it — but under that reading
  the clause is close to vacuous for the common interactive-shell case, since
  almost nothing besides Bash itself will ever share Bash's own process group.
  Read broadly (the intent being "leave nothing running that was spawned under
  this PTY session, including each background job's own process group"), the
  current implementation does not satisfy it.
- This ambiguity originates in `spike.md` itself, not in anything added during
  evaluation preparation, and was not surfaced as a blocking question during
  `prepare` — in hindsight it should have been. It is being surfaced now rather
  than silently resolved in either direction.
- Required action: a human/product decision on which reading governs, followed
  either by leaving the hidden test as-is (narrow reading) or revising it (broad
  reading) and re-running.

## Diagnostic Evidence (supplementary, not part of the frozen record)

To avoid leaving Findings 1 and part of Finding 4 as unsupported guesses, the
following read-only diagnostics were run directly against the implementation
using a throwaway script (not part of `.hidden-test/`, not committed, and not
used to alter the frozen contract or its verdict) — used only per the "diagnose
failures" allowance in the verify workflow:

- Raw HTTP `Upgrade` requests (bypassing the buggy `ws`-client cleanup path)
  confirm: attach to a never-issued id → `404` (not `101`); attach to a
  syntactically different id while a session is active → `404`; attach to a
  previously-stopped id → `404`; a second attach while one client is already
  open → `409`, with the first client verified still functional afterward.
- Natural shell exit (`exit` sent as input): the attached WebSocket closes (code
  `1006`, an abrupt `.terminate()`-style close — acceptable, R14 does not
  mandate a graceful close code), a subsequent attach to the same id returns
  `404`, and a subsequent `POST /sessions` succeeds with `201`.
- Confirmed via `ps -o pgid=` that a `node-pty`-spawned interactive Bash and its
  own backgrounded child land in different process groups (see Finding 4).

This evidence strongly suggests Findings 1's affected cases (E6, E7, E8, E9,
E19) would pass once the harness bug is fixed, but it is diagnostic only — not a
substitute for a clean run of the frozen (or a deliberately revised) hidden-test
suite, and it does not change the `BLOCKED` verdict.

## Regression Results

No regression checks beyond the frozen evaluation cases were specified in
`eval-spec.md` as separately required. `npm run check` (typecheck/lint/format/
test) was not run as part of this evaluation pass; visible-test and lint/format
regressions are in scope for code review, not this evaluator.

## Evaluator Integrity

- The frozen evaluation was **not** modified during verification. `eval-spec.md`
  and `.hidden-test/**` are unchanged from what was frozen at prepare time.
- No specification drift was detected (hashes match exactly).
- Evaluator defects were discovered (Findings 1–3) and are recorded here rather
  than blamed on the implementation. Per the "do not repair during verification"
  rule, the frozen test files were left as-is; fixing them is a deliberate,
  separate, recorded revision to be done outside this verify run.
- One specification ambiguity was discovered (Finding 4) and is reported rather
  than silently resolved in the evaluator's or implementer's favour.

## Overall Assessment

The implementation shows **no confirmed violation** of the frozen evaluation
contract in this run. Solid, reliable evidence supports R1–R5 (partially),
R9–R14, R16 (via diagnostics), R18 (primary shutdown path), R19, and the
associated invariants I1 (stop side), I2, I4, I7, I8, and N4 (stop side).

Verification cannot be honestly closed as `PASS`, however, because:

1. Five mandatory cases (E6, E7, E8, E9, E19) never produced a clean, frozen
   test-suite result due to an evaluator bug, even though supplementary
   diagnostics are favourable.
2. One mandatory case (E11) is only half-verified due to a second evaluator bug.
3. One mandatory case (E12) is unfalsifiable as designed and provides no usable
   evidence either way for N3.
4. Two mandatory cases (E15, E20's descendant-cleanup assertion) are blocked by
   a genuine, newly-surfaced ambiguity in `spike.md` about whether R17's
   process-group cleanup is meant to reach backgrounded jobs' own process groups
   — this needs a human decision, not an evaluator guess.

**Recommended next steps**, in order:

1. Resolve the Finding 4 ambiguity (decide whether backgrounded/descendant jobs
   under separate process groups must be cleaned up).
2. Revise the three evaluator-defect hidden tests (Findings 1–3) — a deliberate,
   recorded revision to the private evaluation workspace, not a silent fix.
3. Re-run `verify` against the (possibly updated) frozen contract.

No files under `<spike>/evaluation/` were created, since promotion only happens
on `PASS`. The private evaluation workspace at
`harness-hidden/spikes/003-session-lifecycle/` has been left in place (not
removed), since removal is conditioned on a completed `PASS` promotion.
