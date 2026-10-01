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

## Re-established Stage A and corrected Stage B preflights — runtime `e132221`

- Runtime: `e132221b7c96e70ff7e83d4f794184e125f28c07`; the later fixture-assertion-only change does not alter `containment.ts`, `host.ts` or `governed.ts`
- Stage A: one Codex Sol/medium execution passed under `bwrap` with a write-granted repository and synthetic home; requested model/reasoning were launch-enforced and separately recorded as not provider-attested
- Stage A public ledger identity: `sha256:52190465d1d63a542192485c2cb3102e80c948d44b2bad63daca57e34f95384d`
- Stage B: one protected Claude Sonnet execution returned semantic PASS under the same `bwrap` path with repository read-only plus private write and synthetic home
- Stage B public ledger identity: `sha256:a84a38ae25d571f6e3f1786111e6efd262fb4197676d8b7be6d98245472a2b1d`
- Expected host action: promotion into the read-only repository was denied; this confirms rather than weakens the granted mode and does not negate the protected execution's typed PASS
- Outputs updated: `preflight/stage-a.json`, `preflight/stage-b.json`
- Provider calls: one Codex and one Claude; neither was retried
- Measurements: Codex preflight completed in 28.45 s; Claude preflight completed in 12.40 s; token usage unavailable.

## Result-handshake diagnostic repair and Stage A checkpoint refresh

- Trigger: protected verification executions `d95215c3-d5c0-44cf-a777-5afba8b3256f` and `af0abaa0-04c3-4ade-8d83-3753219c98cf` each had their semantic result rejected by the host, but the public diagnostic discarded the validation reason
- Repair: governed result rejection diagnostics retain the host's bounded validation error; no evaluator-private content or provider output is exposed
- Verification: typecheck and lint passed; focused AC11 regression passed
- Checkpoint refresh: one Codex Sol/medium execution passed under `bwrap` at runtime `adc3eb0d86c98b8022b05c4c00d011d403609423`; requested settings were enforced and provider attestation remained unavailable
- Refreshed Stage A public ledger identity: `sha256:9650627aa58f24779c773b89a207da0a0f860d19babd1573f79aceea3d52d818`
- Provider calls: one Codex; no retry
- Measurements: checkpoint preflight completed in 25.42 s; token usage unavailable.

## Worker submission-boundary repair and Stage A checkpoint refresh

- Trigger: protected verification execution `ffe693c4-3251-4512-a191-db4a9cdb99ca` proved the rejected payload lacked the evaluator contract's required `methodology.result`
- Repair: the generic worker prompt now places the pinned methodology vocabulary and result constraints directly at the `submitResult` boundary; evaluator bytes and acceptance criteria are unchanged
- Verification: typecheck and lint passed; focused worker-instruction regression passed
- Checkpoint refresh: one Codex Sol/medium execution passed under `bwrap` at runtime `bd08a3ed26bbb31746a421c506f9b18ec64c2336`
- Refreshed Stage A public ledger identity: `sha256:5e95110ec05fd9f2cf63bf2952e609011e076782b2de564d2d1f5f9181014cdf`
- Provider calls: one Codex; no retry
- Measurements: checkpoint preflight completed in 29.44 s; token usage unavailable.

## Implementation — execution 9a1fd057-7d0a-420e-a0cf-2e6de61b7773

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`; design `sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`; coverage `sha256:e932bc07decfc8df7142c1dac1afe1583b2c82844daabdeb6be0b859324d1ccd`; requirements `sha256:e865df63af3cb5d0a371a25cad370679f145ce13f7623e6311bcc1b9f339a6a1`. Working bytes matched every binding and each input had committed provenance; no retry feedback was bound.
- Base/output inspected: commit `1ad07455afedad37e4ea86ed5871bcd9da651dae`, candidate tree `1fdf863c3ecbffbd13ab37c67aaa91cf0576de29`. The committed containment implementation, executor policy and refreshed Stage A/Stage B preflight artifacts were preserved; this execution changes only this manifest.
- Status: succeeded. The committed candidate supplies one Role-Grant-derived `bwrap` launcher for spawned production adapters, mixed read/write workspace enforcement, fail-closed host refusals, public isolation records, provider-policy cleanup and public-safe real-provider preflight provenance. Independent evaluation was not performed or claimed.
- Visible verification: `npm run typecheck`, `npm run lint`, targeted Prettier check and `git diff --check 17de0b2..HEAD` passed. A fresh `npm test` did not complete in this worker sandbox: multiple files failed immediately and the run hung; the focused `node --test-isolation=none --test test/host-fs-isolation.test.ts` diagnostic showed all six cases stop during fixture setup at `spawnSync git EPERM`, before containment assertions. The committed runtime evidence records the earlier unrestricted full run as 218 passed / 0 failed.
- Scope review: the candidate diff contains only executor configuration, containment/launch and execution-record code, visible tests, the two required preflight artifacts and this spike's manifest. Existing unrelated workflow-ledger and fixture residue remained unstaged and unmodified.
- Measurements: token usage and wall-clock time unavailable.

## Implementation — execution 0301e960-ff1a-4df5-8543-ffc87dfb04a3

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`; design `sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`; coverage `sha256:e932bc07decfc8df7142c1dac1afe1583b2c82844daabdeb6be0b859324d1ccd`; requirements `sha256:e865df63af3cb5d0a371a25cad370679f145ce13f7623e6311bcc1b9f339a6a1`. Working bytes matched every binding and each input had committed provenance; no retry feedback was bound.
- Base/output inspected: commit `4e5fac18193b68762c6983e4d40f1b98aa943850`, candidate tree `0e2686e8449eca1e5d7c67d82a905c9efbc8b0a2`. The complete committed containment candidate, result-handshake diagnostic repair and refreshed Stage A/Stage B preflight artifacts were preserved; this execution changes only this manifest.
- Status: succeeded. The candidate supplies the single Role-Grant-derived `bwrap` launcher for spawned production adapters, mixed read/write workspace enforcement, fail-closed host refusals, public isolation records, provider-policy cleanup and public-safe real-provider preflight provenance. Both artifact runtime commits are reachable from the candidate. Independent evaluation was not performed or claimed.
- Visible verification: `npm run typecheck`, `npm run lint`, targeted Prettier check and `git diff --check 17de0b2..HEAD` passed. A fresh `npm test` did not complete in this worker sandbox: multiple test files failed immediately and the runner hung. Diagnostic runs with `--test-isolation=none` showed `test/host-fs-isolation.test.ts` stopping all six cases during fixture setup at `spawnSync git EPERM`; `test/governed-executors.test.ts` passed 7 of 30 cases, with the other 23 blocked by the same subprocess restriction or unreadable host-owned workflow ledgers before their relevant assertions. The committed runtime evidence records the earlier unrestricted full run as 218 passed / 0 failed.
- Scope review: the candidate diff from the evaluator-prepared revision remains limited to executor configuration, containment/launch and execution-record code, visible tests, the two required preflight artifacts and this spike's manifest. Existing unrelated workflow-ledger and fixture residue remained unstaged and unmodified.
- Measurements: token usage and wall-clock time unavailable.

## Implementation — execution 3b78221b-5901-4c39-9d98-90be81144ab0

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`; design `sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`; coverage `sha256:e932bc07decfc8df7142c1dac1afe1583b2c82844daabdeb6be0b859324d1ccd`; requirements `sha256:e865df63af3cb5d0a371a25cad370679f145ce13f7623e6311bcc1b9f339a6a1`. Working bytes matched every binding and each input had committed provenance; no retry feedback was bound.
- Base/output inspected: commit `9cf0f5321f5c823fa4e5e7b9444b06999c3ff804`, candidate tree `6d28b8241fb0e0e45fb0a4f609ffabf8c9338775`. The complete committed containment candidate, worker submission-boundary repair and refreshed Stage A/Stage B preflight artifacts were preserved; this execution changes only this manifest.
- Status: succeeded. The candidate supplies the single Role-Grant-derived `bwrap` launcher for spawned production adapters, mixed read/write workspace enforcement, fail-closed host refusals, public isolation records, provider-policy cleanup and public-safe real-provider preflight provenance. Both artifact runtime commits are reachable from the candidate. Independent evaluation was not performed or claimed.
- Visible verification: `npm run typecheck`, `npm run lint`, targeted Prettier check and `git diff --check 17de0b2..HEAD` passed. The focused process-based tests could not reach their containment assertions in this governed worker: fixture setup was denied at `spawnSync git EPERM`, and one unrelated host-owned workflow ledger was unreadable. A fresh full suite was therefore skipped; the committed runtime evidence records the earlier unrestricted full run as 218 passed / 0 failed.
- Scope review: the candidate diff from the evaluator-prepared revision remains limited to executor configuration, containment/launch and execution-record code, visible tests, the two required preflight artifacts and this spike's manifest. Existing unrelated workflow-ledger and fixture residue remained unstaged and unmodified.
- Measurements: token usage and wall-clock time unavailable.

## Supervisor-authorized legacy evaluator publication bridge

- Authority and scope: explicit human bootstrap authority for one fresh protected `evaluator-verify` allocation against trusted methodology commit `9169ccf`, unchanged evaluator revision `001`, and unchanged candidate `dee86d2314bffa7cc2da0d8ac72004250a06debb`. This is publication transport compatibility, not new evaluation authority or a candidate handoff.
- Compatibility predicate: a one-use root authority must name `9169ccf` and the exact runtime commit; the pinned role must be protected `evaluator-verify`, lack a native evidence action, already hold `repository-write` and `git-commit`, expose the public repository as writable, and declare `verification-result.json` as a postcondition.
- Effect: the resulting Role Grant adds only the existing host-mediated `evidence` action, allowlisted solely to `verification-result.json`, while preserving the legacy workspace modes, capabilities, evaluator inputs, result vocabulary, promotion action and frozen skill/contract bytes.
- Provenance: the allocation records the root authority, trusted methodology commit, exact runtime commit, existing equivalent capabilities, destination and unchanged bound inputs. Existing action request/result records capture validation status, requested artifact identity and resulting evidence commit. The four prior failed attempts remain unchanged.
- Worker instruction: the compatibility execution is explicitly told to author the complete required JSON and publish those exact bytes through the granted evidence action; frozen evaluation criteria and result semantics remain unchanged.
- Verification: `npm run lint`, `npm run typecheck`, focused evidence-action tests and the full `npm test` suite passed; full suite result 220 passed / 0 failed. `git diff --check` passed before this final manifest update.
- Measurements: full suite duration 57.85 s; token usage unavailable.
