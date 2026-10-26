# Evaluation Requirements

Prepared for brief `sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`
and Design Map `sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`.

## Testability Requirements

- **TR1 — The existing launcher seam stays callable.** `containedLaunch`,
  `locateContainment`, `probeContainment` and `probeNestedSandbox` remain
  exported from `src/executors/containment.ts`. `containedLaunch` keeps its
  existing input shape (`bwrap`, `provider`, `program`, `args`, `cwd`,
  `workspaces: [{path, mode: "read" | "write"}]`, `scratch`, `nodePath`,
  `toolFiles`, `masked`, `protectedRoots`, `env`, `sourceEnv`) and returns
  `{program, args, env}` for the caller to spawn. A workspace that cannot be
  resolved, or a runtime binding that would expose a protected root, makes it
  throw instead of returning a launch.
  - Reason: the evaluator runs fixture processes through the one production
    launcher and observes the result from the host side.
  - Source: design-map.md shared contract 1; brief A4, B1, B2.
  - Impact: additive extension only; existing callers keep working.
- **TR2 — Preflight artifacts at the named paths.** The two host-owned
  preflights leave committed public-safe JSON at
  `spikes/014h-host-owned-fs-isolation/preflight/stage-a.json` and
  `.../stage-b.json`. Field names are implementation freedom, but each must
  state: the exact runtime commit (a full 40-hex commit reachable from the
  candidate); the executor profile and provider (`codex` for Stage A, `claude`
  for Stage B); the containment mechanism (`bwrap`) and its result; the Role
  Grant workspace IDs with their modes (`write` for Stage A; both `read` and
  `write` for Stage B); and the checks performed. Neither may contain
  credentials, token-shaped strings, provider configuration contents, absolute
  paths under a user home directory, or paths of private evaluator workspaces.
  - Source: design-map.md shared contract 5; brief Evidence and AC14.
- **TR3 — Implementer-owned regression tests for host-level behavior.** The
  ordinary test suite must include deterministic tests for the behavior the
  evaluator cannot fairly reach through a stable public seam: (a) a spawned
  registered-adapter launch of the Harness project itself is contained, and the
  allocated execution carries the public isolation evidence fields
  (`filesystemIsolation`, `workspaces` with `id`/`mode`, `syntheticHome`) with
  no paths or credentials; (b) uncontained kinds (programmatic command
  profiles, attached sessions) omit those fields; (c) unavailable containment,
  a failing nested-sandbox probe, an unresolvable workspace and an
  unrepresentable overlap are each refused before any session or allocation
  exists, with `provider-config-invalid` or `permission-denied` as the design
  states and no unwrapped fallback; (d) `privateWorkspace` no longer decides
  filesystem visibility or the protected launch check.
  - Reason: the host wiring and record shape are deliberate implementation
    freedom, so these behaviors are evidenced by the implementer's tests plus
    review, and by a passing full regression run.
  - Source: design-map.md shared contracts 2, 3, 4, 6.
- **TR4 — Inspectable Stage A checkpoint.** The Stage A evidence must let a
  reviewer bind, from committed public artifacts and the workflow ledger alone,
  the exact runtime commit, the deterministic containment results, the single
  Codex smoke and the recorded satisfied conditional authority, and see that
  the executor-routing change follows that record.
  - Source: brief Stage A interim enablement gate, AC06.

## Evaluator Assumptions

- **EA1 — Pre-implementation baseline.** The frozen launcher at the Design Map
  commit is the baseline; changes are measured against it.
- **EA2 — Live provider calls are not repeated.** The evaluator needs no
  provider credentials. It reruns deterministic containment itself and checks
  provenance and consistency of the committed preflight artifacts.
- **EA3 — Private `/tmp`.** Inside a contained process `/tmp` is a private
  tmpfs, as the Design Map's invariants state. Writes there are not evidence of
  a host-visible escape; the evaluator judges effects from the host side and
  places its fixture roots so that each ungranted root is checked on the host.
- **EA4 — Sacrificial fixtures.** Real home files are simulated with a
  sacrificial `HOME`; no ambient host file is relied on.
- **EA5 — Protected routing.** Protected evaluator work stays on Claude by
  executor-policy configuration for the whole spike.

## Blocking Questions

None

## Environment Requirements

- Linux with unprivileged user namespaces and `bubblewrap` (`bwrap`) on the
  host `PATH`, as the existing 014e tests already require.
- Node.js (>= 24.12) with the repository's installed dependencies, and `git`.
- The candidate as an exact committed revision of this repository, with its
  history available for ancestry checks.
