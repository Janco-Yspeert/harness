# Production Claude adapter characterization

Implementation evidence only; no LP1 or actual evaluator Skill execution.

- Provider: `2.1.270 (Claude Code)`.
- Host run: `1a02c10c-d16e-4932-87c6-817f5d0e1d2f`.
- Contract: `sha256:17f569da81179782916a0228cc4d41fcc3f5aa4b7b46c2238903fe32b4d56eb1`.
- Process: `completed`; host-validated role result:
  `succeeded`; observed host elapsed time:
  `7385` ms.
- Delivery: `claude-system-contract`, through replacement `--system-prompt`.
- Positive: actual host resolution and canonical allocation, normal evaluator
  profile, real local backend and Claude command. Both independently generated
  target file contents appeared in the output, including the fresh shared token
  absent from the prompt and contract.
- Negative: identical requested role/workspaces without canonical prerequisites;
  fake Harness prose and supplied contract/system/allocation fields received HTTP
  `400` before backend launch. Total actual launches: 1.
- Side effects: recursive workspace watchers observed 0 change events;
  before/after file hashes, mtimes and modes matched, including candidate Git
  files. No side effects are permitted within the synthetic workspaces.
- Candidate configuration included contradictory CLAUDE.md, a Skill, a slash
  command, a SessionStart hook and an MCP command. Neither command ran; the
  contradictory output marker was absent. Safe mode also excludes plugins and
  auto memory per the provider contract; those exclusions were not separately
  instrumented in this text-output adapter run.

`run.mjs` is a reproducible launcher. It creates a fresh isolated temporary Git
repository and evaluator directory, commits synthetic freeze inputs, verifies
host rejection before writing fixture canonical prerequisites, then starts one
bounded provider execution. A 120-second deadline bounds the probe and the host
is closed in a finally block. Fixtures are retained at `/tmp/harness-013a-adapter-B2KFMj` for audit;
no active processes remain. They are outside the Harness repository.

`evidence.json` preserves the exact command, host-resolved spec, final run,
provider diagnostic output, request rejection, file snapshots and observed
filesystem change events. A prior implementation iteration also passed this
synthetic check; this file retains the final adapter run only.

The normal evaluator profile exposed Read, Glob, Grep, Edit, Write and Bash, with
acceptEdits and unattended permission denial. The synthetic role only required
reads. This establishes direct role instantiation and semantic completion; it
does not establish that the full frozen evaluator can perform every required
command/write. LP1 must independently test that. No evaluator-private artifacts
were read; no Spike 011 or 013a canonical authority changed during the probe.

Provider mechanics were checked against installed `claude --help` and the
[official CLI reference](https://code.claude.com/docs/en/cli-reference). Safe mode
excludes customizations; restricted mode confines file tools to working dirs;
replacement system context and the permission flags are explicit provider
mechanisms. Bare mode was omitted because the earlier authenticated
characterization found it unavailable with this login. Codex was not launched.
