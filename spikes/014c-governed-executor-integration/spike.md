# Spike 014c — Governed Executor Integration: Claude Interface and Adapter Cutover

**Status:** Draft for human review and freeze  
**Depends on:** accepted 014b methodology; 014a's existing governed kernel and authority records  
**Precedes:** 014d skill/protocol integration; 014e independent-project canary; 015 telemetry  
**Starting repository checkpoint (verify again when freezing):** `feat/spike-014` at `2c444160ecb51f5005c0f1016c67877b9f571052`

## Context

014b reconciled the eight active Harness role skills, their contracts, methodology policy, and trusted-versus-candidate evolution. It explicitly handed unresolved executor/capability and post-execution action requirements to 014a. 014a implemented the governed kernel, including pinned Role Grants, separate process and semantic results, and host-mediated promotion. It also retired legacy workflow mutation. However, its production execution path launches the arbitrary `command` on a selected `ExecutorProfile` instead of integrating the repository's existing provider adapters.

Relevant existing code, to inspect before designing replacements:

- `src/claude-workflow.ts` — Claude command construction, pinned system contract delivery, tool permissions, protected execution settings.
- `src/workflow-backend.ts` — local Claude/Codex CLI launch, process lifecycle, readiness, bounded workflow execution; currently tied to the **legacy** `ResolvedWorkflowRunSpec` and `HARNESS_ROLE_RESULT` text protocol.
- `src/codex-backend.ts` — Codex App Server interactive/session backend; reuse relevant mechanisms, but do not conflate it with governed spawned execution.
- `src/kernel/{host,execution,model,resolver}.ts` — governed profile selection, immutable grants, authenticated sessions, semantic results, action endpoints, and continuation.
- `src/index.ts` — legacy `/workflow-runs` mutation returns HTTP 410 when governed execution is active. Do not reactivate it to obtain working dispatch.
- `tools/fixtures/governed-executor.ts` and `test/kernel.test.ts` — existing controlled kernel proofs; these do **not** establish real Claude/Codex integration.
- `skills/orchestrator/SKILL.md` — already distinguishes supervisor from governed worker, but does not explicitly prohibit improvised runtime bridges.

During 014a, Codex App generated `/tmp` JavaScript bridges to operate the new kernel. The Claude bridge submitted a valid semantic PASS but never supplied an evaluator-owned promotion manifest. Subsequent recovery attempts could not obtain a recorded eligibility decision. The archive utility introduced at `2c44416` correctly refuses to invent `.eval/promotion-plan.json`; it is not an executor adapter.

The operational problem is not a missing generic kernel concept. It is an incomplete migration between two execution interfaces, compounded by an orchestrator that can silently invent a third.

## Question

Can Harness launch **real Claude and Codex workers** through stable, repository-owned provider adapters, using the governed kernel's exact Role Grants and authenticated host-action protocol, without relying on Codex App to generate executable bridges or infer missing worker output?

The Claude implementation route may be discovered experimentally. The externally observable worker/host contract and acceptance tests are fixed by this brief.

## Scope and ownership

**014c owns:** selecting a supported Claude execution interface; migrating/reusing existing Claude and Codex launch code for governed *spawned* execution; a small shared authenticated worker-to-host interface; typed semantic results and generic authorized host-action requests; runtime diagnostics; an explicit orchestrator prohibition on ad hoc bridges; real-provider integration proofs.

**014c does not own:** rewriting the eight domain skills or their result vocabularies; changing the evaluator's promotion-eligibility semantics; full real-role coverage (014d); a complete real methodology run on an independent project (014e); recovering 014a's absent historical evaluator decision; quota scheduling/cost telemetry (015); general workflow scheduling; direct Anthropic Messages API agent-loop implementation; or a broad kernel redesign.

### Immutable history / no retroactive repair

Preserve 014a's cycle-002 canonical verification PASS, candidate `0a3dafe8e103cc7376bdd7fae32493710613d0c0`, frozen evaluator revision `004`, and existing human recovery history. The absence of a recorded evaluator promotion eligibility decision and `promotion-recorded` remains a genuine outstanding fact. Do not manufacture it, retry the real 014a evaluation as part of this spike, or use 014c's synthetic integration evidence as 014a evidence. 014a resumes after 014d, subject to independently established recovery authority.

## 1. Bounded Claude interface experiment

Compare exactly two **supported** ways to run the same tiny, disposable, non-private task:

1. Anthropic's official **TypeScript Claude Agent SDK**, pinned to an explicit tested package version.
2. The installed **Claude Code CLI** in non-interactive mode with its supported structured JSON or streaming output, pinned to an observed installed version.

The SDK is a library wrapping a locally operated Claude Code agent process, **not** a direct replacement for the local agent with raw API calls. It is an option for the *provider adapter*, not a new owner of workflow authority.

Use a fixed comparison worksheet recording, for **each** route:

| Question | Required evidence |
| --- | --- |
| Authentication and billing | Supported authentication method, applicable terms, subscription/quota versus separately billed API usage, and whether the operator explicitly approved any new charges. Never extract/reuse undocumented session tokens or assume SDK subscription access. |
| Model and effort | Ability to request and, where required, confirm the exact model/effort independently of the supervisor's identity. An unsupported exact constraint must block; it cannot be optimistically attested. |
| Pinned instructions | Pass exact host-resolved skill/contract bytes and input identities; prevent ambient project/user instructions, plugins, hooks, or mutable files from silently overriding them. |
| Permissions | Enforce the role's exact read/write/command capability boundary; prohibited direct `git push`, unrestricted permissions, external network/credentials, and forbidden evaluator-private exposure remain unavailable. |
| Structured transport | Receive typed execution messages, reliable final result/error status, and a supported mechanism for a narrowly scoped Harness tool/MCP action. No parsing a prose sentence for authority. |
| Process lifecycle | Startup errors, stderr/debug events, provider exit, cancellation, and quota/rate-limit errors are observable with bounded safe diagnostics. |
| Operational compatibility | Node 24, existing local environment, version pinning, compatibility with the current Codex/Claude subscription workflow, and maintenance cost against reusing `src/claude-workflow.ts`. |

**Decision rule.** Choose the Agent SDK only if it satisfies every required boundary, uses an explicitly permitted authentication/billing arrangement, and offers a concrete integration advantage over structured CLI execution. Otherwise use the supported structured CLI route if it passes. If neither passes, stop with a precise `BLOCKED` report. A paid Anthropic API key, new spending, permission weakening, or loss of subscription-quota behavior requires **separate explicit human authorization**; it is not implied by approving this spike. Do not implement both production Claude routes as permanent alternatives merely because both were probed. Keep exactly one selected production adapter, with a documented replacement path.

Prefer a no-charge/static capability and terms inspection before live probes. Perform at most **one deliberate live probe per permitted Claude route** during selection, using a tiny deterministic task and low turn limit. Do not repeatedly consume quota to overcome failures; record failure and decide from the available evidence. If the SDK route cannot legitimately be authenticated, mark it *not executable under approved credentials* instead of experimenting with unsupported authentication.

Reference documentation to consult at implementation time (record checked date and exact versions):

- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/agent-sdk/permissions
- https://code.claude.com/docs/en/cli-reference
- https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan

These are reference material, not permission to change authentication or billing. The SDK documentation currently warns that third-party Claude-login/subscription use requires Anthropic approval; the June 2026 subscription-billing notice paused an announced change. Resolve the applicable position before choosing an integration.

## 2. One governed executor boundary

Implement or adapt **one small repository-owned executor integration** used by governed `spawned` execution. Reuse existing provider-specific code rather than create parallel implementations. Preserve the current interactive Codex App Server backend unless an actual shared component is useful to governed execution.

The following responsibilities are fixed:

**Governed host/kernel:** selects an eligible named adapter according to the exact Role Grant and executor constraints; allocates the role/session; supplies the immutable assignment; authenticates and validates result/action requests; records lifecycle, semantic result, host-action result, canonical transitions, and failures. It alone owns privilege and forward authority.

**Provider adapter (Claude or Codex):** translates host-resolved grant/workspaces/model/effort into supported provider configuration; starts and monitors the provider; captures structured provider events and safe bounded diagnostics; exposes the shared Harness worker tools; requests host actions only on the worker's typed instruction; records provider-confirmed model/effort when actually available. It does **not** infer eligibility, re-resolve mutable skills, allocate roles, fabricate missing decisions, or declare canonical completion.

**Governed worker:** receives its exact pinned skill/contract and bound inputs, performs domain work, emits its typed semantic result and any separately required typed action request. A model's final prose is not itself an authoritative result/action.

**Codex App/orchestrator:** requests execution through the governed host and inspects status; never substitutes a home-grown runner, writes a new temporary bridge, directly launches a governed role outside Harness, or self-authorizes inline work.

Target repository touchpoints: migrate the relevant functions in `src/claude-workflow.ts` and `src/workflow-backend.ts` into the governed execution path in `src/kernel/host.ts`, with a small common worker client/tool boundary. Keep `src/codex-backend.ts` focused on its existing interactive responsibility. A separate `src/executors/` module is acceptable if it **moves or factors** existing code instead of duplicating it. There must be one production way to launch each supported provider under governed execution.

Production governed profiles must select a registered repository-owned adapter, not a caller-provided arbitrary executable/script or a generated `/tmp` wrapper. Existing fixture command profiles may remain available **only to explicit tests**. Temporary workspaces for data, sockets, logs, and provider scratch are allowed; temporary *generated orchestration code* is not. If no eligible registered adapter is installed or configured, the host stops with an inspectable error instead of accepting a makeshift command.

## 3. One versioned worker-to-host protocol

Define and implement a small, provider-neutral, typed interface with the following operations and separation of authority:

| Operation | Required behavior |
| --- | --- |
| `assignment` | Read the exact host-issued execution ID, grant identity, methodology/skill/contract identities and pinned content/inputs permitted for that worker. The adapter must not reload the mutable working-tree skill in place of the grant. |
| `submitResult` | Supply an explicit generic disposition (`succeeded`, `blocked`, `refused`, `failed`) plus validated role-specific methodology fields. The host records the semantic result independently of process exit. |
| `requestAction` | Submit a typed request for a *configured* host action (test `promotion` and unauthorized/denied actions). The host checks exact execution/grant, allowed inputs and applicable semantic result, validates bytes, then records action outcome separately. |
| `requestHuman` | Preserve the existing bounded human input/approval/root mechanism where the grant permits it; do not synthesize human authority in adapter code. |
| `diagnostic` / lifecycle | Surface safe structured startup, provider, transport, result-submission and host-action failures. These are observations, not semantic results or canonical transitions. |

Use the kernel's **existing authenticated HTTP API** as the host-facing implementation rather than adding another authoritative event store. The worker-facing surface may be a small repository-owned MCP tool server backed by those endpoints; if SDK and structured CLI cannot both consume it reliably, choose one equally typed first-party interface, explain the compatibility evidence, and keep the same semantics for both providers. No `HARNESS_ROLE_RESULT` terminal-line parser for governed authority.

The adapter holds its narrowly scoped session credentials and sends authenticated host requests. Do not place root credentials, host session bearer tokens, or provider authentication secrets inside model-visible prompts, writable workspaces, worker tools' arguments, public ledgers, or diagnostics. Provider subprocess environments must not receive host session bearer tokens needlessly. All operations must be bound to the exact execution/session; superseded workers must not regain authority through the adapter.

A valid semantic result followed by a missing or failed required host action must remain explicitly **incomplete or blocked** under the configured policy, with the semantic result preserved. The host must not infer the missing action from the result, copy private files on its own initiative, or treat process exit as an action request. For tests, a deliberately simple, synthetic protected role may produce a predeclared promotion plan and synthetic bytes; **do not** interpret the real evaluator's private eligibility in 014c.

## 4. Diagnostics, lifecycle and constraint enforcement

Replace the governed host's current `stdio: "ignore"` behavior for production adapters with structured/streamed event consumption and bounded, redacted diagnostic retention. Preserve enough metadata to distinguish:

- no adapter / provider not installed / provider configuration invalid;
- assignment not delivered;
- provider rejected a tool or permission;
- process crashed or exited cleanly without submitting a semantic result;
- malformed or rejected semantic result;
- required host action omitted, denied, or failed after a valid result;
- quota/rate limit versus ordinary provider failure **when the provider exposes a reliable distinction**.

Do not persist raw protected model output, private evaluator content or credentials in public logs. Record execution-bound error category and safe details; retain richer private diagnostics only inside the correctly isolated workspace, with explicit bounds. Ensure cancellation terminates the actual child and leaves inspectable status. Startup and termination must not create additional workflow authority or hidden auto-retries. No automatic quota-wait/resume scheduler in 014c; the execution surface should be capable of supporting one later.

Translate contract capability names into real provider permissions in one reviewed mapping. A mismatch between contract capabilities and actual provider tools fails closed. Verify protected repository Git *commit* capability without granting direct push, publication credentials or broader private read access. Reject attempts to satisfy a denied capability by switching the provider to unrestricted permission mode.

## 5. Orchestrator rule and mechanical guard

Update `skills/orchestrator/SKILL.md` with the explicit rule:

> Once a Harness workflow is chosen, the supervisor must execute governed roles solely through the configured Harness host and its registered repository-owned adapters. It must not generate executable bridges, wrapper scripts, replacement dispatchers or direct provider invocations to bypass a missing adapter. If the host has no eligible adapter, the correct result is an inspectable infrastructure blocker and a proposed **separately authorized** fix.

Do not depend on this prose alone. Add host/configuration validation and an integration test demonstrating that a governed production allocation targeting an unregistered executable, generated `/tmp` bridge, or unavailable provider **cannot** start. Fixture programs remain possible only through an explicitly isolated test configuration. Validate that legacy `/workflow-runs` cannot be reactivated as an execution workaround.

Preserve the existing supervisor/worker distinction, explicit inline adoption and human-request boundaries. If the orchestrator skill is changed while 014c runs, that candidate text is **not** retroactively authoritative for the current invocation.

## 6. Required integration evidence

Two layers of tests, with no substitution between them:

**Deterministic automated tests (no provider usage):** mock the SDK/CLI event streams and HTTP transport. Cover exact assignment bytes, registered-adapter selection, contract-to-tool permission mapping, unknown capability rejection, unsupported model/effort constraint refusal, malformed/missing result, unauthorized or superseded actions, sanitized diagnostics, cancellation, duplicate completion and idempotent host reconciliation. Exercise `submitResult(PASS)` followed by successful/failed/omitted **synthetic** promotion requests to prove that the host retains PASS and records promotion only after actual successful action.

**Real-provider governed smoke tests (bounded):** one real Claude execution and one real Codex execution, each **launched through the production governed host and registered adapter** against disposable isolated workspaces. Each receives an exact pinned, trivial synthetic skill/contract and returns a typed result. The Claude run also exercises one narrow synthetic host-action request, preferably promotion of harmless precreated fixture bytes inside a controlled private workspace, with actual host validation. Record CLI/SDK versions, the confirmed or unavailable model/effort attestation, provider/process lifecycle, actual result/action events and the absence of generated bridge code. Capture only public-safe output. An unauthorized action must be rejected by the host in a negative test.

An SDK/CLI exploratory probe run directly from a terminal is **not** the real-provider governed smoke test. A mocked executor, a fabricated ledger row or an API-level kernel unit test is **not** evidence that the selected adapter works with a real provider. Use low-turn, small tasks and no unbounded retries. If live provider credentials or quota are unavailable, report the exact acceptance criterion as unproven; do not change the criterion or claim overall PASS.

## 7. Evaluation authority and controlled discovery

Freeze the brief and Design Map under the currently trusted methodology and record their exact identities. The Design Map must include the SDK-versus-CLI decision worksheet, a fixed protected-execution threat model, the chosen host/adapter/tool boundary, and the exact real-provider smoke-test procedure. Evaluator `prepare` freezes implementation-independent success/failure criteria; it **must not** encode an SDK-specific expected winner or implementation file layout.

014c must not evaluate its own new adapter under newly edited methodology authority. Use the independent evaluator's pre-014c trusted skill/contract snapshot throughout preparation and verification. Because this spike repairs the executor used to run that evaluator, establish and document a separate **existing, pinned, independent evaluator launch path before implementation**. If the current trusted mechanism cannot provide one, stop for **one explicit human bootstrap decision**; do not silently generate another bridge, make the candidate adapter the evaluator's authority, or relax isolation to keep the run moving.

Experimental provider findings may select SDK or CLI using the fixed decision rule above; they may not change the frozen acceptance semantics. If discovery reveals an unavoidable changed security/billing contract, stop with the evidence and request explicit human scope rather than redefining the target during implementation.

Before independent verification, commit the implementation, selected interface decision record, actual live-smoke evidence, and complete visible regression results. If the orchestrator skill or any policy/role contract is changed, treat it as versioned methodology evolution wherever it participates in the trusted methodology; keep the older evaluator snapshot pinned and require the normal independent check and explicit human promotion before the new definition governs future runs.

## Explicit non-goals

- No new framework, plugin system, distributed scheduling, remote agents, general worker pool or cloud execution.
- No direct Anthropic Messages API agent loop. It would recreate the agent infrastructure that Claude SDK/CLI already provides.
- No blanket `--dangerously-skip-permissions`, SDK `bypassPermissions`, global `.claude` or ambient agent settings as a solution to blocked execution.
- No newly invented local scripts outside the repository for production bootstrap or ongoing roles.
- No complete rewrite of `src/kernel/execution.ts` or policy semantics absent a specific demonstrated compatibility defect.
- No full eight-skill acceptance sweep, evaluator-repair lifecycle or semantic redesign: 014d.
- No 014a private-evidence recovery or retroactive promotion: resume 014a **after** 014d.
- No independent external project workflow or `5^32` canary: 014e.
- No quotas, reset timers, dollar cost model, automatic suspension/resumption or mobile app: 015 or later.

## Acceptance criteria

| ID | Criterion | Required evidence |
| --- | --- | --- |
| AC01 | Existing adapters inventoried and genuinely reused rather than copied into a third code path. | File-level before/after map and code review, identifying retained legacy readers versus governed production launchers. |
| AC02 | SDK and structured CLI evaluated against the fixed comparison matrix, and **one** production Claude route selected by the decision rule. | Versioned choice record, auth/billing evidence and recorded probe outcomes or explicit permitted non-execution. |
| AC03 | No newly billed API authentication, subscription workaround or permission weakening without explicit human authorization. | Configuration/negative tests and recorded operator decision if needed. |
| AC04 | A production governed role selects only a repository-owned registered adapter; unavailable/missing adapter is an explicit blocker. | Host integration negative test, including generated `/tmp` wrapper denial. |
| AC05 | Real Codex and real Claude both launch from governed Role Grants, receive exact pinned assignments and submit authenticated typed semantic results. | Two distinct real-provider smoke transcripts plus canonical execution-bound ledger evidence; no fixture-only substitution. |
| AC06 | Capability mapping is enforced by the provider and verified, including protected private-workspace boundaries and allowed local Git checkpoint operations. | Deterministic capability negative tests and a protected real or controlled-provider isolation probe; no direct push privilege. |
| AC07 | Exact required model/effort is requested and truthfully confirmed, or allocation explicitly blocks when it cannot be enforced/attested. | Provider capability report and supported/unsupported constraint tests. |
| AC08 | One provider-neutral versioned worker protocol carries exact assignments, generic methodology results, human requests and separately authorized host-action requests. | Contract schemas and both-adapter tests; no governed terminal-prose result parser. |
| AC09 | A genuine real Claude run transports one harmless synthetic promotion request through the host; the host validates actual fixture bytes and records the action and transition. | Host action log, immutable ledger, verified output bytes. This is transport proof, **not** real evaluator eligibility. |
| AC10 | Valid semantic PASS survives omitted/denied/failed promotion, but canonical promotion is never fabricated and the missing action is inspectably incomplete. | Host negative integration tests, including clean worker exit after PASS without action. |
| AC11 | Provider launch, CLI/SDK errors, missing result, tool denial, result submission failure and action failure produce correctly classified, safely redacted diagnostics. | Controlled fault-injection tests and at least one real-provider diagnostic case. |
| AC12 | Host and worker credentials cannot be obtained through prompts or diagnostic output, and workers cannot turn protected access into publication access. | Environment/permission/sandbox negative tests; code-level threat-model inspection. |
| AC13 | Orchestrator explicitly uses Harness and may not generate substitute bridges, with mechanical rejection in configured production execution. | Versioned skill edit, production profile validation and no-bridge regression test. |
| AC14 | Legacy `/workflow-runs` cannot mutate/dispatch active governed workflows, and 014a's canonical history remains unchanged. | Existing legacy rejection regression and exact ledger-history comparison. |
| AC15 | Full repository checks and independent frozen-authority verification pass, with real-provider tests separately evidenced rather than inferred from unit tests. | `npm run check`, deterministic integration results, independent evaluation and a concise as-built file change/evidence map. |

A failure of AC02's permitted-authentication gate, AC05's real provider launch or AC09's real host action is a **genuine blocker**, not permission to declare an infrastructure exception PASS. Preserve successful partial evidence without inflating it into completion.

## Deliverables

1. Frozen `spike.md` and Design Map with explicit interface selection matrix and acceptance-test plan.
2. A short `executor-decision.md` recording SDK/CLI versions, authentication/billing limits, actual experiment results, selected route and reasoning.
3. Repository-owned governed Claude and Codex adapters reusing the existing code; small shared typed worker client/tool layer; governed host integration.
4. Updated orchestrator skill and mechanical registered-adapter validation.
5. Deterministic tests, bounded real-provider smoke evidence, and a public-safe fault/diagnostic summary.
6. File-change-first As-Built and exact independent evaluation evidence, using the currently trusted evaluator authority and normal host-owned publication/acceptance semantics.

## Completion / handoff

014c is complete only when both **real provider integrations**, including a real Claude synthetic host action, work under the governed host without dynamically generated bridges and the selected authentication model has been explicitly established. The acceptance claim must distinguish observed end-to-end facts from unimplemented or separately deferred behaviors.

Then proceed to **014d**: version the evaluator skill/contract to require a typed promotion eligibility plan or explicit ineligibility record, and verify each of the eight actual skills through the now-proven worker interface. After 014d, resume 014a using separately authorized historical eligibility recovery; after 014a, run **014e's independent-project `5^32` canary**. Only then begin 015 telemetry and quota scheduling.
