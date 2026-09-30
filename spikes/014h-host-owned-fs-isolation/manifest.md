# Spike 014h Manifest

## Brief Readiness — execution ea0cbc49-7e3e-4797-9b53-cc83445eb4e6

- Skill: `brief-readiness`, contract version 5
- Input: `spike.md` (`sha256:062e16cc0c21a58b35eab7fc5830a59f01a056dbb2942e36e8c83cab68213baf`)
- Result: succeeded, verdict NOT_READY (Not ready to freeze)
- Outputs: `feedback.md`; `preliminary/001/` (`spike.md`, `feedback.md`)
- Findings: 1 blocker (B1), 5 material clarifications (M1–M5), 3 editorial
- Measurements: wall-clock time and token usage unavailable.

## Brief Readiness — execution cc28c0af-7b77-42b0-86b4-751cc11518fd

- Skill: `brief-readiness`, contract version 5
- Input: `spike.md` (`sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`)
- Result: succeeded, verdict READY (Ready after minor clarification)
- Outputs: `feedback.md`
- Findings: 0 blockers, 3 non-blocking clarifications (N1–N3), 1 editorial
- Measurements: wall-clock time and token usage unavailable.

## Design Map — execution 4b9951b6-1a48-461f-89d6-2525b1670dd1

- Skill: `design-map`, contract version 4
- Input: `spike.md` (`sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`)
- Result: succeeded
- Outputs: `design-map.md` (`sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`)
- Statistics: 956 words, 6 shared contracts
- Measurements: wall-clock time and token usage unavailable.

## Evaluator prepare — execution 98c03bca-c51e-467f-af86-a1f1cd22447e

- Skill: `evaluator`, contract version 14, mode `prepare`
- Inputs: `spike.md` (`sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`), `design-map.md` (`sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`)
- Result: succeeded; evaluator revision 001 frozen (`sha256:12c99f0a8f8d9a97ee6a5e2df07fb696d0ec3692b0ffb33506d208affaa0c731`), pre-freeze integrity validation PASS
- Outputs: `eval-requirements.md` (`sha256:e865df63af3cb5d0a371a25cad370679f145ce13f7623e6311bcc1b9f339a6a1`); `coverage-map.json`
- Statistics: 14 criterion records, 9 procedures (4 executable, 5 review/regression)
- Measurements: wall-clock time and token usage unavailable.

## Implementation — execution 5b5a2566-8bbd-4e6f-8750-30327a4f749b (attempt 1)

- Skill: `implementation`, contract version 5
- Inputs: `spike.md` (`sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`), `design-map.md` (`sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`), `eval-requirements.md` (`sha256:e865df63af3cb5d0a371a25cad370679f145ce13f7623e6311bcc1b9f339a6a1`); no implementation feedback
- Base: `17de0b2ab3e86f56fe0c435ae95ed6dc2280ff6d`
- Output: candidate diff over 9 paths (`sha256:c17cb11aa2964eb6181a845f0aaad32d38cc50ad324da05e76bde49a600748a7` of `git diff --cached` before this entry), 607 insertions, 53 deletions
- Status: candidate complete for the deterministic scope (AC01–AC04, AC07, AC09–AC13 in code and tests); NOT complete for the live-provider scope. The Stage A/Stage B real-provider preflights, `preflight/stage-a.json`, `preflight/stage-b.json` and the Codex executor-routing cutover were not produced (need live provider credentials and network unavailable to this worker); no artifact was fabricated (AC05, AC06, AC08, AC14 open)
- Visible verification: `tsc --noEmit`, `eslint .`, `prettier --check src test tools spikes/014h-*` clean; `npm test` 217 pass / 0 fail. `prettier --check .` cannot read untracked sandbox dotfiles in the repository root (EACCES), unrelated to this change
- Measurements: wall-clock time and token usage unavailable.

## Host-owned Stage A and Stage B preflight — runtime `fbaa60a`

- Runtime: `fbaa60a9eb8f3df0a562ade95c6d42ef6c27fb73`
- Deterministic prerequisite: `npm test` at the runtime commit, 217 passed / 0 failed, as recorded by implementation attempt 1
- Stage A: one Codex execution through the production registered-adapter launcher; `bwrap`, one granted write workspace, synthetic home, typed result PASS
- Stage A executor evidence: profile `codex`, Codex CLI `0.157.1`; the adapter reported no confirmed model or reasoning identity, so none is inferred
- Stage B: one protected Claude execution through the same launcher; `bwrap`, two simultaneous granted write workspaces, synthetic home, typed result PASS, promotion succeeded
- Stage B executor evidence: profile `claude`, Claude Code `2.1.284`; provider-confirmed model `claude-opus-5-5`
- Public outputs: `preflight/stage-a.json`, `preflight/stage-b.json`
- Public smoke ledger identity: `sha256:4d5eb47d4882d7471c0cfbd0b2b216dec2d6c44c68fc84feb83697b3fa69b0b1`
- Provider calls: one Codex and one Claude; neither was retried
- Measurements: smoke started at `2026-09-30T14:27:16.729Z` and completed by `2026-09-30T14:28:00.132Z`; token usage unavailable.

## Implementation — execution 343ee97b-b1a7-4821-9e34-5645bb6446c6

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`; design `sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`; coverage `sha256:e932bc07decfc8df7142c1dac1afe1583b2c82844daabdeb6be0b859324d1ccd`; requirements `sha256:e865df63af3cb5d0a371a25cad370679f145ce13f7623e6311bcc1b9f339a6a1`. Working bytes and committed HEAD bytes match each binding; no retry feedback was bound.
- Base/output inspected: commit `e78716cdd3ee0d8f6e59b688dec7ae0a14ba07e5`, tree `1a074c7c1e6bbc7704e87579b4f941404085c73a`. Existing implementation and preflight artifacts preserved; this execution changes only this manifest.
- Status: failed to produce a complete candidate. The existing Stage B artifact records two write grants; frozen requirement TR2 requires both read and write modes in the real-provider artifact. Deterministic mixed-mode evidence does not change the actual live grant. No preflight observation was rewritten or fabricated. Stage A conditional-authority/checkpoint recording and routing chronology remain unverified by this execution.
- Authority limitation: the grant permits repository/local work, grants no host actions, and forbids evaluator-private exposure. A protocol `requestHuman` root request for host-produced mixed-mode preflight evidence and the Stage A authority record returned `human interaction denied`. No provider execution or routing change was attempted.
- Visible verification: `node --test test/host-fs-isolation.test.ts` failed at test-file execution. Diagnostic rerun with `--test-isolation=none` reported all six cases failing during fixture setup with `spawnSync git EPERM`, before containment assertions. This environment therefore supplied no new passing containment evidence.
- Checks skipped: broader suite and static checks, because no implementation code changed and the required fixture subprocess execution was unavailable. Independent evaluation was not performed or claimed.
- Unrelated working-tree changes were preserved and excluded from the checkpoint.

## Supervisor-authorized Codex executor-policy repair

- Authority: the initiating human explicitly required model selection and launch enforcement to be recorded separately from provider attestation before the next public-role allocation
- Resume finding: execution `343ee97b-b1a7-4821-9e34-5645bb6446c6` used `codex exec --ephemeral`; it left no durable Codex session identity and cannot be safely resumed
- Supported model identifiers resolved from the installed Codex model cache: `gpt-5.6-sol`, `gpt-5.6-luna`, `gpt-5.6-terra` and `gpt-6-astra`
- Configuration: substantial public work uses `gpt-5.6-sol` at medium reasoning; lighter public work can select `gpt-5.6-luna` at medium reasoning; `gpt-5.6-terra` and `gpt-6-astra` are also selectable at medium reasoning; protected evaluator policy remains Claude Sonnet
- Reasoning variants: every configured Codex model has explicit `low`, `medium` and `high` profiles; the user-facing term “light” maps to the CLI's actual `low` value
- Provenance behavior: execution records now distinguish requested launch settings, whether each setting was enforced at launch, provider-confirmed values, and per-field provider-attestation availability
- Codex semantics: an exact supported launch setting is passed to the CLI and may be accepted without false provider confirmation when Codex JSONL omits effective-model evidence
- Verification: `npm test` 218 passed / 0 failed; `npm run typecheck` and `npm run lint` passed; targeted formatting passed
- Checkpoint consequence: the material launch/provenance change invalidates the earlier `fbaa60a` Stage A checkpoint for subsequent routing; the prior artifacts remain immutable historical evidence and a new exact-runtime checkpoint is required before another public-role allocation
- Measurements: token usage and wall-clock time unavailable.
