# Design Map — 014h Host-Owned Executor Filesystem Isolation

Frozen brief: `spike.md` (`sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`), verified against the bound identity and committed at `a40d8c6`.

## Shared contracts

1. **The one production launcher is `containedLaunch(ContainmentInput)` in `src/executors/containment.ts`.**
   - Its `workspaces: [{path, mode: "read" | "write"}]` list, `scratch` and `masked` inputs are the Role-Grant-to-filesystem mapping.
   - Stage A and Stage B extend it additively. The existing call shape stays stable, so deterministic tests, the real-provider preflights and 014i can all call it.
   - Tests and the evaluator may import `containedLaunch`, `probeContainment`, `probeNestedSandbox` and `locateContainment` from that module. They run the returned `{program, args, env}` against sacrificial fixture roots and observe the outcome externally, from the host side.
   - No second sandbox path or module may be added.

2. **Containment is selected by launch kind, not by project location.** Every host launch of a registered production adapter (a profile with no `command`) is contained, for Harness and external projects alike.
   - `src/kernel/host.ts` currently derives this from `#external`. That gate is replaced by "registered adapter, spawned".
   - Programmatic `command` profiles (test-only) and attached supervisor sessions are unchanged.
   - Rollout by stage is staged sequencing, not a separate contract:
     - The Stage A gate requires containment for spawned public roles.
     - The final candidate (AC01) requires it for all spawned registered-adapter launches, including protected Claude.
     - The Stage A checkpoint therefore does not claim AC01.

3. **Refusal contract.** Every failure to construct containment is a refusal before `kernel.register` and `kernel.allocate`, so no session or execution exists.
   - This covers: a missing or unusable bubblewrap, an unresolvable workspace, an unrepresentable mode or overlap, a runtime binding that would expose a protected root, and a failed nested-sandbox probe.
   - Unsafe or unrepresentable construction is reported as `provider-config-invalid`.
   - Denied namespaces are reported as `permission-denied`.
   - These reuse the existing `AdapterRefusal` → `HostRefusal` path. No unwrapped fallback exists, and no role result is fabricated.

4. **Public isolation evidence record.** Each contained execution carries these fields on its public execution record maintained by Harness (the record the host returns and persists for the execution):
   - `filesystemIsolation: "bwrap"`;
   - `workspaces: [{id, mode}]`, using Role Grant workspace IDs and modes;
   - `syntheticHome: true`.

   A refused launch has no execution, so "applied" is expressed by the field's presence on an allocated execution. Uncontained launches (command profiles, attached sessions) omit the fields. The record contains no paths, credentials or provider configuration contents.

5. **Preflight artifacts.** The host-owned real-provider preflights write public-safe JSON at:
   - `spikes/014h-host-owned-fs-isolation/preflight/stage-a.json`
   - `spikes/014h-host-owned-fs-isolation/preflight/stage-b.json`

   Each artifact binds:
   - the runtime commit;
   - Role Grant workspace IDs and modes;
   - the executor profile;
   - the provider-confirmed model/profile identity, where the adapter can attest it;
   - the containment mechanism and result;
   - the checks performed.

   Each artifact omits credentials, provider configuration contents, private paths and private transcripts. The Stage A artifact is the public evidence half of the Stage A isolation checkpoint. A material later change to `containment.ts` or the launch path in `host.ts` or `governed.ts` invalidates it. The evaluator checks provenance and consistency against the candidate and reruns deterministic containment itself. It does not repeat live provider calls.

6. **Eligibility metadata.** `privateWorkspace` in `src/executors/adapters.ts` stops being a decision input for filesystem visibility. It no longer gates profile `isolation` validation or the protected/`forbiddenExposure` launch check in `planLaunch`. It may remain as informational metadata.
   - Non-filesystem capability checks are untouched.
   - Protected evaluator routing stays Claude-only through executor-policy configuration, not through that flag.

## Design decisions

- Settled by 014e and reused as-is:
  - the bubblewrap namespace;
  - the scratch-backed synthetic home holding only bounded provider auth/configuration;
  - the read-only runtime/tool closure;
  - ledger masking;
  - `protectedRoots` exclusion for runtime bindings;
  - the nested-sandbox preflight for providers with `nestedSandbox`.
- Stage B generalizes the `workspaces` list to several roots.
  - Roots are `realpath`-resolved before launch.
  - Duplicate roots, and a root nested inside another root with a conflicting mode, are refused as `provider-config-invalid`. The remaining nesting rules are left to the implementation.
  - No mount-policy language is added.
- The synthetic home is always used for contained launches, so the evidence field `syntheticHome` is `true` whenever containment applies.
- The Codex public-role cutover is an executor-policy edit (for example the Codex profile in `harness.executors.json`). The Stage A evidence records it before routing changes.

## Invariants

- A contained process's visible filesystem is exactly: the granted workspaces at their granted modes, writable scratch, a private tmpfs `/tmp`, the read-only runtime/tool closure, and the synthetic home.
- Ungranted workspaces, sibling repositories, an ungranted Harness checkout and the real home do not exist in the process view, even by known host path.
- A `read` workspace rejects create, edit, delete and mutating Git operations at the OS boundary.
- `..` and symlink traversal cannot reach outside the bound roots. Symlinks are resolved before binding.
- Codex's inner sandbox stays enabled. Its failure to start is a refusal, never a fallback.
- Credentials and provider configuration never reach workflow artifacts, execution records or preflight artifacts.
- Stage A and Stage B remain distinct gates. The Stage A checkpoint is not final acceptance, does not authorize Codex for protected work, and is invalidated by a material launcher change.

## Implementation freedom

- Internal structure of `containment.ts` and `host.ts`: how mixed modes and overlap are validated, and how the mount order is built.
- Which existing execution-record object carries the isolation fields, provided the field names and content above hold.
- The exact JSON schema of the preflight artifacts beyond the required bindings, and the CLI or script that produces them.
- Fixture design for deterministic tests, including how the real-home file is simulated with a sacrificial `HOME`.
- How `privateWorkspace` is demoted (removal or an informational-only field).
- The exact executor-policy edit for the Codex cutover.
