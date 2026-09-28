# Design Map — 014e External-Project Live Canary and Repository Isolation

- Frozen brief: `spike.md`
  `sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`,
  committed at `ec42cef7820d3274b3dffaf907798a6db2c43e22`. It has a Brief
  Readiness `READY` verdict (run 002, `feedback.md`).
- The brief's clarifications C1 and C2 and editorial note E1 are not written
  into the frozen text. Contracts D5–D7 settle them as a shared evaluation seam
  and a lifecycle responsibility. They do not change any product behaviour,
  scope or failure meaning.
- In this map, `<spike>` means `spikes/014e-external-project-live-canary`.
  "External project" means a project configuration whose methodology root
  differs from its project root.

## Shared contracts

### D1 — Trusted authority for both tracks

- Both tracks bind the same trusted N+1: record `sequence: 5` in Harness
  `methodologies/harness/trusted.jsonl`. Its manifest is
  `sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`
  and its revision is `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`.
- Every Track A role, and every role of the Stockdif workflow, runs under that
  record.
- 014e appends no trusted record. It does not edit the trusted policy,
  contracts, role skills or orchestrator v3 (brief §4 A3).

### D2 — Project configuration: methodology root seam (AC01, AC02)

- The project configuration keeps `schemaVersion: 1`. It gains one optional
  field, `methodologyRoot`, a path relative to the configuration file or
  absolute.
  - **Absent:** the methodology root is the project root. The existing
    `harness.project.json` and every historical fixture load unchanged.
  - **Present:** `policy`, `trustedHistory` and `validatorSources` resolve
    inside the methodology root and its own Git repository (`git rev-parse
    --show-toplevel` from that root).
- `root`, `workflowDirectory`, `ledgerName`, `workspaces` and `remotes` always
  resolve against the project root.
- The trusted record is read only from the methodology repository. The
  manifest is rebuilt from that record's exact revision, as `trust.ts` does
  today. Working-tree files in the methodology repository, and any file in
  the project repository, never count as methodology authority.
- Committed workflow-input provenance uses only the project repository. This
  covers `spike.md`, the Design Map, the coverage map, the implementation
  handoff, verification artifacts and the evaluator-promotion destination. A
  commit or path that exists only in the methodology repository fails this
  check, and so does the reverse case.
- Tests and the live run build external projects through this one field. No
  second configuration file, registry or environment variable selects the
  methodology source.

### D3 — Workflow Execution Grant binds source and runtime

- For every project, a new Workflow Execution Grant records:
  - the methodology repository top-level;
  - the trusted record's sequence, manifest identity and revision.
- For an external project it also records the Harness **runtime commit**: the
  exact committed Harness `HEAD` the host is running from.
- The host refuses to start an external-project workflow when its own
  checkout has uncommitted changes to tracked files (such as `src/`, `tools/`
  or `methodologies/`).
- An active grant keeps its bound identities. A later Harness commit, a
  trusted-record append or a Stockdif edit does not change it.
- These fields are host-written and canonical. They are the AC08 source for
  "H1 runtime" and for the Stockdif methodology identity.

### D4 — Host-owned OS containment at the provider launch seam (AC03, AC04)

This contract is the brief's required enforceable runtime and workspace
isolation choice.

- **Mechanism.** The host launches every governed provider subprocess of an
  external project inside a host-built **bubblewrap (`bwrap`) mount, PID and
  user namespace**. The wrap is applied once, at the single provider spawn
  seam (`GovernedProviderRun`), so it covers every adapter. Its scope is the
  provider CLI and all of its children: shells, `git`, the worker-tools
  server and test runners.
- **Visible filesystem.** The namespace sees only:
  - each granted workspace, bound at its grant mode (write or read-only);
  - the execution's scratch directory, read-write;
  - read-only system runtime paths, the located provider program and the Node
    runtime;
  - the Harness worker-tools module closure, read-only;
  - the provider's own authentication and configuration material. This can be
    a copy placed into a scratch `HOME`.
- **Not visible.**
  - The Harness checkout, except the worker-tools closure, which is
    read-only. The Harness checkout is never mounted writable.
  - Any workspace not in the grant, including `stockdif-hidden` for every
    public grant.
  - The host's private data root and ledgers.
  - The rest of the operator's home directory.
- **No Git credentials.** The launch environment is built from an allowlist.
  The following are absent: `SSH_AUTH_SOCK`, the `GIT_*` credential and askpass
  variables, `GH_TOKEN`/`GITHUB_TOKEN`, the operator's `~/.gitconfig`
  credential helpers and `~/.ssh`. A worker-side `git push` therefore has no
  usable credential.
- **Network.** Network access stays available only as far as the provider
  needs it to reach its own API.
- **Fail closed.** The external project has no fallback to an unwrapped
  launch. If `bwrap` is missing, unprivileged namespaces are denied (for
  example by AppArmor), or a nested provider sandbox cannot start inside the
  wrap, the allocation is refused before any session exists. The refusal has
  a public diagnostic (`provider-config-invalid` or `permission-denied`), and
  the run stops at preflight as the brief requires.
- **Adapter eligibility.**
  - For an external-project grant, the read-isolation requirement for
    protected or `forbiddenExposure` grants is met by D4 containment.
    `privateWorkspace` permission rules alone do not meet it, for any adapter.
  - Codex public roles therefore become eligible only under enforced
    containment.
  - If Codex cannot run inside the wrap, the brief's pre-authorized Claude
    substitution applies.
- **Adapter sandboxes.** Native sandboxes (Codex `workspace-write`/`read-only`,
  Claude permission rules) stay in place as defence in depth. They never
  replace containment.
- **Testability seam.** The containment is tested black-box through the host
  launch path. A spawned probe under a public grant must fail to read an
  evaluation-workspace file and must fail to write any Harness path. The same
  probe under a protected grant must succeed on the evaluation workspace. The
  probe can be a fixture command routed through the same wrapper, or a real
  adapter. A test that inspects only the argv of a command it never runs is
  not evidence of containment.

### D5 — Repository identity and publication configuration (AC04, AC10)

- An external project configuration may declare `origin`, the expected
  repository identity in the form `github.com/<owner>/<repo>`. The Stockdif
  configuration declares `github.com/Janco-Yspeert/stockdif`.
- At host start, the host reads the project repository's actual
  `remote.origin.url`. It normalizes these recognized spellings:
  - `https://github.com/O/R[.git]`;
  - `git@github.com:O/R[.git]`;
  - `ssh://git@github.com/O/R[.git]`.

  Any other spelling or any mismatch refuses the host start. The value is
  never taken from a worker.
- The Stockdif configuration has `remotes: {}`. No trusted contract declares
  `publication`, so no Stockdif grant carries a publication action. Any
  publication request is refused as "outside role grant".
- The configured remote set of either project must never name the other
  project's repository. The host refuses such a configuration.
- Negative tests use local bare repositories or unreachable URLs only. Nothing
  in tests or preflight pushes to GitHub.

### D6 — Canary evidence location and index (brief E1; AC06–AC09)

- The brief's `014e/evidence/` means `<spike>/evidence/`. "Outside the
  evidence area" means any path not under that directory.
- H1E contains `<spike>/evidence/index.json`. That file includes at least:
  - `schemaVersion: 1`;
  - `harness.candidate`: H1, the 40-hex commit;
  - `harness.methodology`: `{sequence, manifest, revision}` from D1;
  - `stockdif.origin`: the D5 identity;
  - `stockdif.baseline`: the `main` commit at branch creation;
  - `stockdif.branch`: `feat/spike-001`;
  - `stockdif.commits`: the ordered S1… commits, each with its role;
  - `stockdif.identities`: the frozen brief, Design Map, Evaluator Prepare
    revision, verification result, promotion, As-Built and Outcome. Each is
    `sha256:` or `null` when not reached;
  - `canary.status`: one of `completed`, `failed` or `blocked`, plus the
    exact terminal Stockdif ledger state and, if not completed, the blocker;
  - `artifacts`: `[{path, identity}]` for every other file in
    `<spike>/evidence/`. Each path is relative to `<spike>/evidence/` and each
    identity is the `sha256:` of the committed bytes.
- Any other content of the evidence area is implementation freedom. So is the
  public-safe form of provider, usage and intervention observations. Unknown
  measurements are written as `"unknown"`.
- Stockdif evaluator-private files are never copied into the evidence area.

### D7 — H1E binding for Evaluator Verify (brief C1)

The evaluator identifies the evidence commit H1E structurally:

1. H1E is the unique commit whose **sole parent** is the grant's `candidate`
   (H1).
2. Its diff from H1 touches only paths under `<spike>/evidence/`.
3. It contains `index.json` with `harness.candidate` equal to H1.
4. Every `artifacts[].identity` matches the committed bytes at H1E.

Any of the following makes the binding fail. The evaluator reports it as a
binding blocker and never guesses:

- no such commit exists;
- more than one such commit exists;
- the diff touches anything outside the evidence area;
- any identity differs;
- the H1E commit named in the supervisor's recorded human authorization
  disagrees with the commit found by rules 1–4.

The evaluator never uses `HEAD`, branch tips or file modification times to
choose H1E. The Evaluator Verify grant still binds only H1. No trusted
contract changes for this binding. For a correction, "H1" and "H1E" become H2
and H2E.

### D8 — Holding Track A between handoff and Verify (brief C2)

- The recorded human authorization for this 014e run includes a stop request
  after the 014e `implementation-handoff` for H1. The orchestrator does not
  allocate Evaluator Verify until H1E exists.
- H1E exists for every truthful terminal state of Track B. For a blocked or
  failed canary, H1E carries `canary.status` `blocked` or `failed`, and
  Verify still runs against H1. This follows the brief §6 rule that
  deterministic evidence is preserved and the canary is reported as blocked.
- The supervisor makes the H1E commit. It is operator evidence, not a role
  result.

## Design decisions

- **Settled by the repository.**
  - `trustedDefinition` and `assertTrustedMethodology` already rebuild the
    manifest from Git objects at the record's revision.
  - `planLaunch` already refuses protected and `forbiddenExposure` grants on
    adapters without read confinement.
  - The Codex adapter declares `privateWorkspace: false`.
  - `ExecutionKernel.promote` already checks the destination workspace and
    the source identities.

  014e generalizes the first item across two roots (D2). It extends the
  second item with host containment (D4). It keeps promotion as it is:
  promotion copies only into Stockdif's own public evaluation directory.
- **Self-development default.** For the existing Harness configuration (no
  `methodologyRoot`), whether D4 containment is enabled is implementation
  freedom, on one condition: the unchanged self-development regression still
  passes (AC05). For every external project, containment is mandatory.
- **Where the external configuration lives.** The Stockdif project
  configuration must not be placed in the Harness repository for the live run.
  It must not be placed in `stockdif-hidden`. It must not contain any policy,
  contract, skill or trusted-history bytes, only paths and identities.
- **Host maintenance 003.** Host maintenance 003 is neither covered by 014d's
  PASS nor part of 014e's accepted scope. Its recovery-authority regressions
  run as part of the H1 check suite (AC05). The 014e evaluator judges them as
  observed results only.

## Invariants

- One installed Harness runtime commit per Stockdif workflow run. The runtime
  is replaced only through a recorded H2, never silently.
- The methodology repository and the project repository are resolved from
  their real paths. Invalid roots and cross-repository provenance fail closed:
  - missing, overlapping, symlink-escaping or identical project and evaluation
    roots;
  - a project root inside the methodology repository, or the reverse;
  - a private data root inside any workspace;
  - cross-repository commit provenance.

  The existing self-development configuration, where the project and
  methodology roots are the same, is the only permitted identity case.
- Public Stockdif roles see only the Stockdif repository workspace. The
  evaluation workspace is visible only to grants whose contract grants it.
- No Stockdif worker process has a writable Harness path, Harness publication
  authority or any Git credential.
- Nothing pushes to GitHub automatically. The final Stockdif push is a manual
  operator act after human acceptance, and no governed transition depends on
  it.
- Stockdif's trusted methodology identity equals Harness trusted record 5.
  Stockdif contains no copied skills, contracts, policy, trusted history or
  validators.
- Harness and Stockdif commits never mix: no shared commits, submodules or
  cross-repository checkpoints.
- Every allocation counted against Stockdif's bound of 10 is visible in the
  Stockdif ledger. A refusal before allocation, such as a containment or
  preflight refusal, is not an allocation.

## Implementation freedom

- The internal resolver API and data model for the two roots, and where the
  runtime commit sits within the host-written grant record.
- The exact `bwrap` argument construction, the scratch `HOME` layout, how
  provider credentials are copied or bound, the environment allowlist
  contents, and any additional network restriction beyond D4.
- How preflight checks are packaged: an extended `tools/` command, tests or a
  host start check. They must still reject invalid roots, provenance, access
  and remote configurations before any provider cost.
- Test structure and fixture repositories. Live-provider checks stay outside
  `npm test`, following `test/live/`.
- The public-safe evidence prose and any extra D6 fields.
