# Real-Provider Smoke Evidence — Spike 014c

Status: **UNPROVEN. Three real-provider governed smoke runs failed, and the
corrected adapters have not been run live yet.**

## Observed live runs (failed)

Once the fixture trust root existed (`fixture-trust-root.md`, `55d9e1e`), the
smoke ran three times against the production governed host with Claude Code
`2.1.280` and `codex-cli 0.155.1`. The public-safe records and ledger copies
are in `live-smoke/` (`bfd14a5`).

| Run (UTC)                  | `smoke-codex`                               | `smoke-claude-promotion`                                                                                |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `2026-09-24T09-41-42-874Z` | `failed` / `missing-result`; no tool call   | `failed` / `assignment-not-delivered`; the `harness` tool server was not connected; `Glob` denied        |
| `2026-09-24T10-23-31-951Z` | `failed` / `missing-result`                 | `failed` / `assignment-not-delivered`                                                                   |
| `2026-09-24T10-23-46-812Z` | `failed` / `missing-result`                 | `failed` / `assignment-not-delivered`; `Glob` denied                                                    |

In every run the host allocated through the trust gate, and each provider was
launched by its registered adapter. Claude confirmed model `claude-opus-5-5`,
with effort unavailable. No result, action, promotion or transition was
recorded, and none was inferred. No generated executable was found.

These runs are genuine real-provider diagnostic evidence for AC11. They are
**not** evidence for AC05 or AC09. The causes and the adapter corrections are
recorded under "Live smoke corrections" in `executor-decision.md`. The smoke
must be rerun with the corrected candidate, and its records committed,
before AC05, AC09 and the real-provider parts of AC06 and AC07 can be
evaluated.

## Original preparation notes

These notes were written before the trust root existed. Blocker 1 below was
resolved by `fac5c1c` and `55d9e1e`. Blocker 2 still applies to the
implementation worker's own sandbox.

These criteria remain unproven and must not be reported as passing:

- AC05 (real Codex and real Claude through governed Role Grants);
- AC09 (a real Claude synthetic promotion through the host);
- the real-provider parts of AC06, AC07 and AC11.

Two things block them:

1. **Human trust root (Design Map §4).** The fixture's trust root must be
   approved by a human after the fixture commit and before any smoke run. No
   such approval exists yet. The worker must not author it.
2. **Provider access.** This implementation execution could not reach either
   provider. The Claude binary is not visible in its sandbox, and provider
   network egress is denied. No provider call was attempted and no retries were
   made.

## Fixture prepared for human approval

| Item                   | Value                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Location               | `fixtures/governed-smoke` (project `governed-smoke-fixture`)                               |
| Revision               | `098b89934a3fbdf3ee18b02b9ac84e39365a4270`                                                 |
| Manifest identity      | `sha256:726fbff1504b533104c1230a55bfea71885c5e6c8534f0dc79c5cb1716006161`                  |
| Policy                 | `sha256:b9043ef59a23ab29b8ecd4dd9ef1f9b3939ee4d38bc1dd6143bb96635062b4a1`                  |
| `smoke-codex`          | contract `sha256:1d9ac4a45a6fde55ff9c34b15a9eb76c82ff1d36f9ccf9449b716979cd7c8118`, skill `sha256:654e7a4bd2bcd3e889747776577da1bfba01dc3b5693e76f7439b8e28d3c70d4` |
| `smoke-claude-promotion` | contract `sha256:70a7b4f0dbfb6c43dcc9daf397153cc0553fc1e575d4c13cb946f960137b1918`, skill `sha256:dc9767845d24950aee0f4142b3e0085fa852262d47ca7560edff81084d1b57e8` |
| Validators             | none (`validatorSources: {}`)                                                              |
| Trusted history        | `fixtures/governed-smoke/methodology/trusted.jsonl`: **absent**                            |
| Promotion bytes        | `fixtures/governed-smoke/private/promotion-bytes.txt`, `sha256:3a802f27f93ad203c3913d832c213dac574157966201fe2816caba4337bfeffd` |

The manifest was reconstructed with the production `buildMethodologyManifest`
at the exact revision (`projectPrefix: fixtures/governed-smoke`). This is the
same reconstruction the trust gate performs.

### Required human step

A human must review this exact revision and manifest identity. If the human
approves, they:

1. commit a human-authored decision record in this repository; and
2. append the fixture's root event to
   `fixtures/governed-smoke/methodology/trusted.jsonl` in the existing
   `promoteMethodology` record form: `sequence: 1`, `previous: null`, the
   revision and manifest identity above, and `authority.kind: "human"` with
   `evaluation.kind: "human-bootstrap"`. Both evidence fields cite the human
   record.

That root authorizes only the fixture's own synthetic executions.

## Smoke procedure (implemented, not yet run)

Run `npm run smoke:governed`. `HARNESS_SMOKE_OUTPUT=<dir>` optionally chooses
where public-safe evidence is written. Requirements: a host where `claude` and
`codex` are installed on an absolute, non-temporary `PATH` entry and logged in
with the operator's existing subscriptions.

`test/live/governed-smoke.live.ts` implements Design Map §7:

- It stops unless the fixture trust root exists.
- It builds the host programmatically from `loadProject` on the fixture. It
  uses production-validated `{provider: "claude"}` and `{provider: "codex"}`
  profiles (`maxTurns: 8`), the real `locateProvider` and real spawning. There
  is no command profile, mock or provider-runtime seam.
- It authorizes each role through `POST grants`, which passes the trust gate.
- It runs `smoke-codex` through the `codex` adapter, then
  `smoke-claude-promotion` through the `claude` adapter. The Claude role
  submits a typed result and then requests promotion of the precreated bytes.
- It makes no retries. It writes a JSON record and a copy of the workflow
  ledger. The record contains:
  - the provider paths and versions;
  - requested and confirmed model/effort;
  - lifecycle, category and diagnostics;
  - result and action events;
  - the promoted-bytes identity;
  - the ledger's SHA-256;
  - a scan asserting that no executable file was created in the disposable
    workspaces.

After a run, commit the public-safe record and ledger copy beside this file,
and replace this section with the observed results.

## Negative case (Design Map §7 step 6)

The deterministic test "AC08/AC12: unconfigured actions are denied by the host"
in `test/governed-executors.test.ts` uses the same production host
implementation. A `smoke-codex` worker requests an unconfigured promotion and
an unconfigured publication, and the host records both as `denied`. The same
test shows that a tool argument naming another execution is rejected, a
duplicate result is rejected, and a human request the contract does not permit
is refused.

## Public-safe fault and diagnostic summary (deterministic, no provider)

`test/governed-executors.test.ts` drives the real host, adapters, MCP tool
server and relay with a scripted provider stream (`tools/fixtures/fake-provider.ts`).

| Category                                                     | Observed as                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `no-adapter`                                                 | 409 on `continue`; no allocation or session                                                  |
| `provider-not-installed`                                     | 409 on `continue`; temporary or workspace candidates are never selected or executed          |
| `provider-config-invalid`                                    | 409 for unenforceable constraints; process `failed` on an unconfirmed model                  |
| `assignment-not-delivered`                                   | Harness tool server not connected                                                             |
| `permission-denied`                                          | Provider `permission_denials`                                                                 |
| `provider-crashed` / `provider-error` / `rate-limited`       | Nonzero exit / error result / `error: "rate_limit"` (kept as the failure category)           |
| `missing-result`                                             | Clean exit without `submitResult`                                                             |
| `result-rejected`                                            | Contract-violating or duplicate result                                                        |
| `action-omitted` / `action-denied` / `action-failed`         | PASS retained; no promotion transition                                                        |
| `cancelled`                                                  | Root cancel; the provider process is terminated                                               |

Public diagnostics carry a category and a short host-authored, redacted
detail. Bounded, redacted raw provider output (at most 256 KiB per execution)
is kept only under the host's private data root, and only when that root lies
outside every granted workspace.
