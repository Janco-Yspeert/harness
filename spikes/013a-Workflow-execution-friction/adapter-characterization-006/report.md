# Production Claude command-permission characterization

Implementation evidence only. This did not invoke LP1, evaluator verification,
or the real evaluator Skill.

## Result

The final synthetic production-adapter run succeeded on Claude Code 2.1.270.
Harness run `12f9570f-fae9-4137-95e3-47e6d5b03622` completed with the
host-validated semantic role result `succeeded` in 25,848 ms.

The evaluator profile exposed repository reads, workspace writes, local
computation, child processes, test/build/lint/format, Git inspection/commit and
workflow bookkeeping. The Claude adapter derived Read/Glob/Grep/Edit/Write/Bash
plus bounded `git`, `npm`, `npx`, `node` and `python3` Bash allow rules from
those capabilities. It did not grant bare `Bash` or use a permission-bypass
mode.

The real production backend created three runtime workspaces:

1. synthetic candidate repository;
2. synthetic private evaluator workspace; and
3. unique host-created run scratch
   `/tmp/harness-workflow-12f9570f-fae9-4137-95e3-47e6d5b03622-tbkaMy`.

`TMP` and `TEMP` named run scratch. Claude created its normal session-temp child
below it and exposed that as `TMPDIR`; XDG and npm caches were also descendants
of run scratch. The contract successfully wrote transient evidence there and
durable bookkeeping in the evaluator workspace. The backend deleted run scratch
at process exit while the evaluator bookkeeping file remained.

Inside the declared boundary, `git status`, `git diff`, `git show`, `npm test`
(one passing test), `npm run typecheck`, evaluator bookkeeping and scratch writes
all ran unattended. A single `git -C` attempt against an undeclared sibling in
`/tmp` failed because bubblewrap masked the path. The candidate remained clean
on the host after exit.

The exact command retained `--safe-mode`, `--restricted`,
`--permission-prompts none`, `acceptEdits`, `claude-system-contract`, strict MCP
and setting-source isolation, and no session persistence. Host-supplied sandbox
settings required sandbox availability, auto-approved sandboxed Bash, disabled
unsandboxed retry, denied workspace-parent reads, and re-opened only the three
exact runtime workspaces. Candidate CLAUDE.md/settings could not disable the
sandbox or broaden permissions.

## Discovery sequence

- Existing `acceptEdits` plus Bash availability denied the first `git status`
  because Bash still required a prompt and `--permission-prompts none`
  correctly had nobody to answer it.
- `--allowedTools` alone ran git/npm but also allowed `git -C` to inspect an
  undeclared host repository. Command patterns are authorization, not a
  filesystem boundary.
- `--permission-mode auto` alone behaved the same way for the explicit outside
  probe.
- Claude's strict OS sandbox supplied the missing filesystem boundary, but
  `failIfUnavailable` exposed that this host lacks system `socat`. The live
  probe used an Ubuntu `socat` package extracted under `/tmp` and supplied only
  through the probe process PATH; no host package was installed.
- A root-wide read deny prevented bubblewrap itself from assembling its runtime.
  Denying the parents of the three granted workspaces instead preserved system
  toolchain reads while hiding undeclared sibling data.
- Sandbox auto-allow was not deterministic for every npm invocation. Adding
  capability-derived command-family allow rules inside the strict sandbox
  removed the prompt path without weakening the OS boundary.
- Claude rewrites `TMPDIR` to a provider session-temp child and presents a
  virtual `.mcp.json` in restricted mode. Final assertions therefore check
  durable host state and containment within run scratch, not an imaginary
  byte-for-byte environment view.

`evidence.json` retains the final resolved binding, exact production command,
three runtime workspaces, provider output, host result and post-run durable
state. `run.mjs` is reproducible and bounded to 120 seconds. Earlier discovery
runs were not evaluator attempts and consumed no LP1 allocation.

## Host prerequisite

Strict Claude sandboxing on Ubuntu requires `bubblewrap` and `socat`. This host
has `bubblewrap` but not a system-installed `socat`; production execution will
therefore fail closed until the host dependency is installed. The
characterization deliberately did not set `failIfUnavailable: false` or permit
an unsandboxed fallback.
