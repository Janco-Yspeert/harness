# Brief Readiness Feedback — Spike 014h

Reviewed: `spikes/014h-host-owned-fs-isolation/spike.md` (`sha256:062e16cc0c21a58b35eab7fc5830a59f01a056dbb2942e36e8c83cab68213baf`), contract version 5.

## Verdict: Not ready to freeze

The goal is sound and mostly well bounded. One blocker: the brief is written as greenfield, but the repository already has a host-owned bubblewrap boundary. Freezing would leave the central design question to later roles.

## Blocker

### B1. Relationship to the existing host containment is undefined

Brief: the "Core model", "Stage A" and AC01 describe building a host-owned Linux boundary as new work. AC13 forbids "a second filesystem sandbox".

Repository:
- `src/executors/containment.ts` already builds a bubblewrap mount/PID/user namespace from granted workspaces at grant mode, a scratch HOME, an allowlisted environment and read-only runtime paths. It has no unwrapped fallback (Spike 014e, D4).
- `src/kernel/host.ts` (~L455-530) applies it only when `this.#external !== undefined`, i.e. external projects.
- `planLaunch` in `src/executors/adapters.ts` already accepts a non-`privateWorkspace` adapter (Codex) for protected or forbidden-exposure grants when `contained` is true, and `probeNestedSandbox` handles Codex's nested bwrap.
- `harness.executors.json` gives `codex-sol-medium` `isolation: []`.

Consequence: the brief never says whether 014h extends, reuses, generalises or replaces this code. It does not say what is actually missing. The likely gap is that the Harness's own workflows, such as 014h's public roles under Codex, launch uncontained. Without that stated, Stage A scope, AC01, AC13 and the Stage A "minimum" cannot be judged or evaluated. An implementation could add a second sandbox, or claim the existing one already satisfies most of Stage A.

Smallest clarification needed:
1. Name the present gap (e.g. containment applies only to external projects).
2. State that 014h extends the existing `containment.ts` path to the Harness's own workflows, or state otherwise.
3. State which project or launch kinds must be contained after 014h. AC01 says "Governed provider processes" (all), while Stage A is public roles only.

## Material clarifications

### M1. Stage A checkpoint and human gate are not observable

"Exact Stage A isolation checkpoint" (AC06, Stage A gate) does not say what it is. It could be a commit, a tree or a runtime identity. It does not say where it is recorded, who records approval, or how approval turns into a Codex profile or selection change. Today Codex is selected through `harness.executors.json` with `isolation: []`, and eligibility is gated by `privateWorkspace`. Say whether enabling Codex is an executor-policy edit (and by whom), what identity the approval binds to, and that a later change to the sandbox code invalidates the checkpoint.

### M2. Stage A scope versus B5

Stage A allows Codex for public roles, but the adapter eligibility change (B5 / AC10) is Stage B. State that Stage A leaves the eligibility rules alone, or how Codex is admitted for public 014h roles. Also state that protected roles stay on Claude by policy rather than by the flag.

### M3. Unnumbered evaluator paragraph after AC13

The paragraph on host-owned real-provider preflight (brief L322) is outside the table and has no ID. It adds requirements. Who runs the preflight, which artifact carries it, and what "provenance/consistency" means are undefined. Please make it an AC or a bounded note, and say whether AC05 and AC08 are satisfied by that preflight evidence or by the evaluator's own run.

### M4. Evidence location and failure record

The "Evidence" section fixes fields but not where they are retained, e.g. the execution record, the ledger or a public artifact. It also does not say what an isolation-setup failure records: "an inspectable infrastructure or provider-configuration blocker" should name the existing category (`provider-config-invalid` is what `HostRefusal` uses today) and confirm that it happens before session allocation, as the current host path does.

### M5. Nested Codex sandbox

Codex runs its own bubblewrap (`nestedSandbox: true`). Nested-namespace failure inside the outer sandbox is a real feasibility risk, which `probeNestedSandbox` already addresses. State the expected behaviour: fail closed, versus disabling Codex's inner sandbox (which would change Codex's write/permission enforcement).

## Editorial

- E1. A1 and AC02 say "Harness checkout when another project is being worked on". Say plainly that a role for the Harness repo itself has the checkout as its granted repository.
- E2. State that fixtures (sibling repo, private workspace, real-home file) are created by the test rather than assumed on the host.
- E3. Implementation step 12 says Codex work continues during Stage B; note it is subject to M1's gate.

## Limitations, files, checks

- Limitations: reviewed only the brief, `src/executors/containment.ts`, `src/executors/adapters.ts`, `src/kernel/host.ts` (containment use), `harness.executors.json`, and the 014g manifest format. No evaluator-private material was read. No tests were run.
- Files changed: `feedback.md`, `preliminary/001/spike.md`, `preliminary/001/feedback.md`, `manifest.md`.
- Checks: brief bytes hash confirmed against the bound identity.

**Not ready to freeze**
