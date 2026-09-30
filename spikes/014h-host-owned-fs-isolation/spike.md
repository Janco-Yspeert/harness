# Spike 014h — Host-Owned Executor Filesystem Isolation

**Status:** Draft for Brief Readiness and human review; not frozen
**Purpose:** make Harness enforce governed workers' filesystem visibility and read/write modes instead of relying on provider-specific workspace guarantees
**Execution strategy:** two stages, with an interim Codex-public-role enablement gate after Stage A
**Precedes:** 014i candidate-evaluator N → N+1 subject execution and resumption of blocked 014g verification

## Context

Harness currently relies partly on provider behavior to ensure that workers cannot inspect or modify workspaces outside their Role Grant.

That has become an architectural and operational problem.

Claude can currently satisfy Harness's protected-workspace expectations, while Codex cannot provide the same strong workspace-isolation guarantee through the adapter. As a result, provider choice has started carrying part of Harness's filesystem security model.

This pushes work toward Claude even when Codex would otherwise be suitable, increasing quota pressure and coupling execution policy to provider-specific behavior.

Recent canary work has also demonstrated that instructions and workspace declarations alone are insufficient. A worker may still have ambient access to sibling directories, the Harness checkout or evaluator-private material unless the operating system actually prevents that access.

Harness should instead own this boundary consistently.

Spike 014e already introduced the mechanism to do so for governed execution of
**external projects**. `src/executors/containment.ts` builds a host-owned
bubblewrap namespace from the Role Grant's workspace roots and modes, gives the
process a scratch-backed synthetic home containing only bounded provider
authentication/configuration, exposes a small read-only runtime/tool closure,
masks workflow ledgers, and refuses launch when containment or a provider's
nested sandbox cannot start. `src/kernel/host.ts` currently activates that path
only when the governed project is external to the Harness methodology
repository. Harness's own governed workflows therefore remain the material gap:
they can still launch through the uncontained path.

014h reuses, extends and generalizes that existing 014e mechanism. It must not
create a parallel sandbox architecture. The end state is that every spawned
governed provider process using a registered production adapter, whether for an
external project or the Harness repository itself, receives the same
Role-Grant-derived host containment. Attached supervisor sessions remain a
separate execution mode and are not converted into spawned sandboxes here.

The desired rule is simple:

> A governed worker may see and modify only the filesystem resources granted to it by its Role Grant.

014h establishes that rule on the current Linux host.

It does **not** attempt to make Harness safe for arbitrary hostile code.

## Threat model and scope

014h protects against ordinary and accidental agent behavior such as:

- following an absolute path outside the granted workspace;
- shell commands running from an unexpected current directory;
- a public role inspecting evaluator-private material;
- a role accidentally modifying the Harness checkout or a sibling project;
- a provider CLI inheriting unnecessary visibility of the operator's home directory.

014h does **not** protect against:

- deliberate kernel or namespace exploitation;
- hostile native binaries intentionally escaping the sandbox;
- malicious root processes;
- untrusted multi-tenant users;
- arbitrary adversarial code execution.

The objective is:

> **Enough isolation to faithfully enforce Role Grants, not enough isolation to run hostile arbitrary code.**

## Question

Can Harness launch governed Claude and Codex workers inside a host-owned Linux filesystem environment that exposes only their granted workspaces, with the correct read/write modes, while preserving normal provider execution?

And can the implementation be staged so that Codex becomes safely usable for ordinary public roles before the complete mixed-workspace implementation is finished?

## Core model

A Role Grant remains the source of filesystem authority.

The host converts that grant into the process's actual filesystem view:

```text
Role Grant
    |
    v
Harness
    |
    v
filesystem isolation
    |
    +-- granted repository: read or write
    +-- granted private workspace: read or write
    +-- scratch: write
    +-- minimum provider config/auth
    |
    X-- ungranted evaluator-private workspace
    X-- unrelated repositories
    X-- Harness checkout unless granted
    X-- unrestricted real home directory
```

The implementation must extend the existing bubblewrap-based containment path
introduced by 014e. Replacing it with another mechanism would require new brief
authority; adding a second filesystem sandbox is out of scope.

Provider adapters may still describe provider-specific runtime needs.

They must no longer be responsible for enforcing ordinary project filesystem secrecy.

---

# Stage A — Public-role isolation and early Codex enablement

## Goal

Make the existing filesystem boundary authoritative for ordinary public
spawned roles in Harness's own governed workflows, sufficient to run them
safely with Codex.

Stage A exists partly to produce an early practical benefit: subsequent eligible public 014h work should be able to use Codex rather than consuming Claude quota.

## A1. Public worker filesystem

A normal public worker may receive:

- its granted repository workspace;
- a writable scratch directory;
- the minimum runtime files required by the provider CLI;
- the minimum provider configuration/authentication needed to run.

Everything else relevant to Harness projects should be unavailable unless explicitly granted.

In particular, a Stage A public worker must not be able to read:

- evaluator-private workspaces;
- sibling project repositories;
- the Harness checkout when it is not the granted repository (a role granted
  the Harness repository may of course see that grant);
- arbitrary files from the operator's real home directory.

## A2. Workspace mode enforcement

The granted repository must be exposed according to the Role Grant:

- `read` means the worker cannot modify it;
- `write` means normal project writes and local Git operations work.

Scratch remains writable.

These properties must be enforced by the operating system boundary rather than instructions to the model.

## A3. Minimal provider home

Codex and Claude may require configuration or authentication normally stored under the user's home directory.

Do not expose the complete real home directory merely to make the CLI work.

Provide a synthetic/minimal home or narrowly expose only the provider files actually required.

Credentials and provider configuration must not be copied into workflow artifacts or test evidence.

Codex's existing inner sandbox remains enabled. Harness must retain the 014e
nested-sandbox preflight and fail closed before allocation if that inner sandbox
cannot start inside the host boundary; disabling it or falling back to an
uncontained launch is not an acceptable recovery.

## A4. Deterministic containment tests

Most Stage A verification should use ordinary local fixture processes rather than model calls.

Through the same production sandbox launcher, using sacrificial fixture roots
created by the tests rather than relying on ambient host files, prove that a
public fixture process:

- can read its granted repository;
- can write it when granted `write`;
- cannot write it when granted `read`;
- can use scratch;
- cannot read a known evaluator-private fixture;
- cannot read or write a known sibling repository;
- cannot access a known file in the real home directory;
- cannot escape through an obvious symlink or `..` path.

Verify results externally where practical rather than relying only on the process reporting its own failure.

Do not expand this into adversarial Linux escape testing.

## A5. One real Codex smoke

After deterministic containment passes, run one bounded real Codex execution using the exact same filesystem-isolation path.

Prove that:

- Codex launches normally;
- Harness worker tools remain available;
- the granted repository is usable;
- expected local role work succeeds;
- the known forbidden fixture paths remain unavailable.

One successful bounded smoke is sufficient unless it reveals a defect.

## Stage A interim enablement gate

When Stage A deterministic tests and the real Codex smoke pass, record an exact **Stage A isolation checkpoint**.

The checkpoint is the exact committed runtime revision containing the Stage A
launcher plus a durable public Stage A evidence artifact that binds that commit
to the deterministic containment results, the single Codex smoke, the selected
executor profile and the smoke's provider-confirmed model/profile evidence.
A material later change to the containment or launch path invalidates the
checkpoint and requires the Stage A gate to be re-established.

The initiating human instruction pre-authorizes Harness to use that exact
checkpoint for subsequent eligible **public** 014h roles with Codex once all
frozen Stage A deterministic criteria pass, the real Codex smoke passes, the
runtime is committed and identified, and no containment or evaluator blocker
remains. Harness records the checkpoint and the satisfied conditional authority
in public workflow evidence before changing executor routing. No further human
approval is required for this bounded public-role cutover.

This is an execution-policy decision only.

It is not:

- final 014h acceptance;
- methodology promotion;
- permission to use Codex for protected evaluation;
- proof that Stage B is complete.

Protected evaluator work remains on Claude during this spike.

Stage A does not change the general protected-role eligibility rule or remove
provider `privateWorkspace` metadata. Its policy change is narrowly an executor
routing decision for eligible public 014h roles whose Role Grants are enforced
by the checkpointed host containment. Protected roles stay on Claude by explicit
014h policy, not because Stage A has declared a permanent provider capability
boundary.

---

# Stage B — General Role Grant workspace enforcement

## Goal

Generalize the same 014e/Stage A mechanism to the workspace combinations already represented by Harness Role Grants.

The principal target is a protected evaluator such as:

```text
repository          read-only
evaluation-private  read-write
scratch             read-write
everything else     unavailable
```

This same primitive will later be reused by 014i.

## B1. Multiple workspaces

Support multiple granted workspace roots.

For each workspace:

- resolve its real path before launch;
- enforce its declared `read` or `write` mode;
- make ungranted project workspaces unavailable.

Reject configurations that cannot be represented safely, including obvious unsafe overlap or path escape.

Do not build a general mount-policy language.

## B2. Read-only enforcement

A workspace granted as `read` must be genuinely non-writable from the provider process.

Prove this with deterministic fixture tests.

Normal attempts to create, edit, delete or perform mutating Git operations there must fail.

## B3. Private workspace exclusion

A public worker not granted an evaluator-private workspace must not be able to read it even if it knows the original host path.

The directory being "secret by convention" is insufficient.

It must be absent or inaccessible from the worker's filesystem view.

## B4. Protected evaluator execution

Run one bounded real protected Claude execution through the same host-owned filesystem-isolation architecture.

For 014h, keep the actual protected evaluator on Claude.

The goal is to prove that Harness now supplies the isolation boundary, not to change evaluator provider policy.

## B5. Provider eligibility cleanup

Review adapter metadata that currently makes provider-specific isolation part of eligibility, especially `privateWorkspace`.

Once host-owned filesystem enforcement is proven, ordinary filesystem visibility should no longer depend on such a provider flag.

Either remove that property from authority-bearing selection or demote it to compatibility/informational metadata.

Do not remove unrelated provider capability checks. Protected evaluator routing
remains explicitly Claude-only for 014h even if Codex becomes technically
eligible under the generalized filesystem rule.

---

# Failure behavior

Governed execution must fail closed if:

- the required filesystem-isolation mechanism is unavailable;
- a granted workspace cannot be resolved;
- the requested read/write mode cannot be enforced;
- required provider configuration cannot be exposed without opening substantially broader filesystem access;
- sandbox construction fails.

Do not silently fall back to an unrestricted provider launch.

Return an inspectable infrastructure or provider-configuration blocker through
the existing host diagnostic model. Invalid or unsafe construction is
`provider-config-invalid`; unavailable namespace permission may remain the
existing `permission-denied` diagnostic. The refusal must occur before session
registration or execution allocation, as in the existing external-project
containment path.

A sandbox-construction failure must not fabricate semantic role completion.

---

# Evidence

Keep evidence simple.

For each governed isolated execution, retain the following safe metadata in the
public execution evidence maintained by Harness:

- which isolation mechanism was used;
- which workspace IDs were granted;
- their read/write modes;
- whether a synthetic/minimal home was used;
- whether filesystem isolation was successfully applied.

For example:

```json
{
  "filesystemIsolation": "bwrap",
  "workspaces": [
    { "id": "repository", "mode": "read" },
    { "id": "evaluation", "mode": "write" }
  ],
  "syntheticHome": true
}
```

Stage A and Stage B real-provider observations are produced by a bounded
host-owned preflight through the production launcher. Each preflight writes one
durable public-safe artifact binding the runtime commit, Role Grant workspace
IDs/modes, executor profile, provider-confirmed identity where the adapter can
attest it, containment mechanism/result, and checks performed. It must omit
credentials, provider configuration contents, private paths and private
transcripts. The evaluator verifies artifact provenance and consistency against
the exact candidate and independently reruns deterministic containment; it is
not required to possess external provider credentials or repeat either live
provider call.

Do not turn 014h into a forensic execution-recording system. Full sealed subject transcripts belong to 014i.

---

# Acceptance criteria

| ID | Mandatory result |
| --- | --- |
| **AC01** | Every spawned governed provider process using a registered production adapter, for both Harness and external projects, runs through the reused 014e host-owned Linux filesystem boundary derived from the Role Grant; no parallel sandbox path is introduced. |
| **AC02** | Stage A deterministic tests prove a public worker can use its granted repository and scratch while evaluator-private fixtures, sibling repositories, an ungranted Harness checkout and a known real-home file are unavailable. |
| **AC03** | Repository `read` and `write` modes are enforced by the process boundary, not by worker instructions. |
| **AC04** | Simple symlink and relative-path escape attempts do not bypass the granted workspace boundary. |
| **AC05** | One real Codex public-role execution succeeds through the same production isolation path used by deterministic tests. |
| **AC06** | Stage A produces the exact committed-runtime plus public-evidence checkpoint defined above. When its stated conditions pass, the initiating human instruction already authorizes subsequent eligible public 014h roles to use Codex under that checkpoint, with no further approval; a material launcher change invalidates it. |
| **AC07** | Stage B supports the mixed workspace modes required by a protected evaluator: at minimum repository read-only plus evaluator-private read-write plus scratch. |
| **AC08** | One real Claude protected execution succeeds through the same host-owned isolation architecture. |
| **AC09** | Provider configuration/authentication works without exposing the worker to the unrestricted real home directory or leaking credentials into workflow artifacts. |
| **AC10** | Provider-specific workspace-isolation metadata is no longer the decisive security authority for ordinary project filesystem visibility. |
| **AC11** | Isolation setup failures fail closed; no unrestricted provider fallback occurs. |
| **AC12** | Existing governed workflow, evaluator-private, trusted-methodology, promotion and recovery regression suites remain green. |
| **AC13** | The resulting workspace-isolation primitive is reusable directly by 014i without introducing a second filesystem sandbox. |
| **AC14** | Each single bounded real-provider preflight produces the public-safe provenance artifact defined above. The evaluator independently verifies the exact candidate, deterministic containment and artifact consistency without requiring provider credentials or repeating the live call. |
---

# Implementation sequence

## Before Stage A

1. Run normal Brief Readiness.
2. Freeze the accepted brief.
3. Produce a Design Map that keeps Stage A and Stage B distinct.
4. Prepare independent evaluation before implementation.
5. Ensure the evaluator can independently test both the Stage A gate and final Stage B result.

## Stage A

6. Extend the existing 014e containment path to the minimum public-role boundary required for Harness's own governed workflows.
7. Run deterministic containment tests without provider calls.
8. Fix any containment failure before using Codex.
9. Run one bounded real Codex smoke.
10. Create the exact Stage A checkpoint.
11. Record the checkpoint and, once its frozen conditions pass, apply the
    initiating human instruction's pre-authorized executor-policy cutover for
    subsequent eligible public 014h roles. Do not request redundant approval.

## Stage B

12. Continue eligible public implementation work using Codex after Stage A authorization.
13. Generalize workspace handling to multiple roots and mixed read/write modes.
14. Run deterministic mixed-workspace containment tests.
15. Run one bounded real protected Claude execution.
16. Remove or demote provider-specific filesystem isolation from authority-bearing eligibility.
17. Run full repository checks and produce the final exact candidate.

## Completion

18. Independently verify the complete candidate under the frozen evaluator.
19. Preserve the Stage A interim evidence as history.
20. Only after final PASS run the normal promotion, As-Built and human-acceptance path.

The Stage A checkpoint does not substitute for final independent verification.

---

# Out of scope

014h does not implement:

- Docker or Kubernetes orchestration;
- a general container platform;
- Windows or macOS isolation;
- hostile-code containment;
- kernel-exploit protection;
- syscall/seccomp policy frameworks;
- CPU or memory resource isolation;
- network egress policy redesign;
- general secrets management;
- arbitrary process tracing;
- evaluator N → N+1 candidate-subject execution;
- sealed subject evidence bundles;
- provider fallback policy;
- automatic switching of protected evaluation from Claude to Codex;
- usage/quota telemetry.

If an implementation proposal requires several of these to make simple filesystem workspace isolation work, reconsider the design before expanding scope.

---

# Handoff to 014i

014h should leave one simple reusable primitive:

```text
launch governed worker
    repository: read
    evaluation-private: write
    scratch: write
    all other project paths: unavailable
```

014i will use that primitive to solve a different problem:

> trusted evaluator N executing candidate evaluator N+1 as a non-authoritative subject and receiving admissible host-owned evidence of that run.

014i must reuse 014h's filesystem isolation rather than invent its own.

014g remains blocked until 014i supplies the required candidate-subject evidence.

014f and Stockdif remain paused until the methodology-evolution chain is resolved.

## Completion statement

014h succeeds when filesystem authority belongs to Harness rather than to the chosen model provider.

The practical result is that Codex can safely return to ordinary public-role work after Stage A.

The architectural result is:

> Role Grants define filesystem authority; Harness enforces it; providers execute inside it.
