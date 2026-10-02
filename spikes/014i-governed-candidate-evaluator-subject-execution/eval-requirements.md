# Evaluation Requirements

Prepared for brief
`sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e` and
Design Map
`sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`.

## Testability Requirements

- **TR1 — Bound fixture package.** The deterministic Harness-owned fixture
  package is committed at
  `spikes/014i-governed-candidate-evaluator-subject-execution/fixture-package/`
  in commit `21e037c71e7b2617fadb89f4a3edeb86cc985d3a`; its tree identity is
  `315593c0e9278f3df5b62e1806f5ea068144eac6` and the runner blob is
  `4319b31ac7f22376d5180010228e42036573bb46`. Its README states the layout. The
  implementation must use it byte-for-byte, must not edit it, and must keep that
  tree unchanged in the candidate. Its two synthetic candidates (`contained`,
  `over-authorized`) are committed as separate candidate commits by the test or
  host; the runner prints one `PROBE <name> <wrote|denied>` line per probe and a
  final `PROBE-END` line, and `expected-observations.json` lists the expected
  lines and external observations.
  - Reason: Design Map shared contract 3 requires a bound fixture package.
  - Impact: none beyond using the package; evaluator-owned content is added to
    it only through a new evaluator revision.
- **TR2 — Committed sealed bundles at the Design-Map path.** The candidate
  commit must contain, beneath
  `spikes/014i-governed-candidate-evaluator-subject-execution/evidence/candidate-subject/<subject-execution>/`,
  at least one published sealed bundle from a real run of the `contained`
  fixture candidate and at least one from the `over-authorized` fixture
  candidate, produced by the delivered operation with a deterministic
  placeholder provider and published unchanged. Each bundle directory holds
  `manifest.json` plus the retained files. Field names, file names and
  serialization are implementation freedom; the evaluator reads content only.
  Each bundle must show, in content:
  - a manifest binding every other retained file by relative path, byte length
    and SHA-256, with no absolute or `..` paths and no symlinks;
  - an explicit `non-authoritative` label;
  - stdout and stderr stream entries each carrying length, SHA-256, configured
    maximum, `closed: true` and `truncated: false`;
  - the runner's raw stdout, byte-preserved, as one retained file;
  - one retained ordered worker-tool exchange of JSON lines, each with a
    monotonic sequence number, the complete request and the complete response,
    including the `assignment` and the subject's `submitResult` calls;
  - the candidate commit (40-hex), methodology identity (`sha256:`), the
    candidate's contract and skill identities as Git blob ids or SHA-256 of the
    fixture bytes (as in the fixture package), and the fixture tree or runner
    blob identity;
  - an external before/after observation file that names the sacrificial
    `forbidden/harness-sentinel.txt`, `repository/probe-repository-write.txt`
    and `evaluation/probe-evaluation-write.txt` targets and records the
    sentinel's SHA-256 both before and after; and
  - no credential-shaped content.
  - Reason: the `evidence/candidate-subject/<subject-execution>/` layout and
    manifest binding are fixed by Design Map shared contract 7; without
    committed bundles from the bound fixtures a trusted reader cannot attribute
    outcomes.
  - Impact: the implementer runs the two fixtures once through the operation and
    commits the published bundles; evaluator checks never need access to the
    operation's internal interfaces.
- **TR3 — Implementer-owned regression tests.** The ordinary test suite must
  contain deterministic tests (placeholder provider, no live call) for behavior
  whose host wiring is implementation freedom: (a) reconstruction from the exact
  candidate commit, with rejection of uncommitted methodology, identity
  mismatch, missing role, skill/contract mismatch and unrepresentable authority,
  and working-tree drift not changing the subject; (b) the subject running with
  the candidate-defined capabilities and workspace modes under the 014h
  containment primitive in the fixed four-root layout; (c) `submitResult`
  captured and validated against the candidate contract without any call into
  `ExecutionKernel.submit`, verification finalization, promotion, trust or
  acceptance, and `requestHuman` returned unavailable without creating a
  request; (d) `requestAction` affecting only disposable fixture state, with
  promotion/publication to real workflow targets denied; (e) the lifecycle
  states `prepared`, `running`, `completed`, `infrastructure-failed`,
  `evidence-incomplete`, `evidence-sealed`, with a non-zero subject exit still
  `completed`; (f) sealing refusing tampered, missing, extra, substituted,
  truncated, unclosed or path-escaping evidence; (g) the subject being unable to
  write the evidence root; (h) production authorization restricted to
  `evaluator-verify`; and (i) existing 014h containment and governed-execution
  regressions staying green.
  - Reason: these behaviors have no stable public seam fixed by the Design Map,
    which leaves internal types, modules and function names to the
    implementation.

## Evaluator Assumptions

- **EA1 — No live provider.** The evaluator needs no provider credentials and
  repeats no live call; fixture runs use the placeholder provider.
- **EA2 — Content-based checks.** Evidence checks are content-based and
  field-name-free, so serialization choices are not constrained beyond TR2.
- **EA3 — Host-side judgement.** Containment outcomes are judged from the host's
  external before/after observation and the runner's raw output, never from the
  subject's prose or its `submitResult`.
- **EA4 — Pre-implementation baseline.** The Design Map commit is the baseline;
  fixture-package identity is checked against it.
- **EA5 — Review procedures.** Wiring, boundary and consumption properties are
  reviewed from the committed candidate and public history using only frozen
  authority; reviewers judge against the Design Map text, not candidate-specific
  interpretations.

## Blocking Questions

None

## Environment Requirements

- Linux with unprivileged user namespaces and `bubblewrap` (`bwrap`) on `PATH`,
  as the existing 014e/014h tests require.
- Node 22 with the repository's installed dependencies; evaluation runs from the
  exact committed candidate checkout.
- Measurements: provider calls 0 expected.
