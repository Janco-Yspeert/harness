# As-Built — 014h Host-Owned Executor Filesystem Isolation

## Reconstructed implementation

The inspected final implementation revision is `dee86d2314bffa7cc2da0d8ac72004250a06debb`.
It uses one host-owned filesystem boundary, `containedLaunch` in
`src/executors/containment.ts`, for every spawned registered production
adapter, for both the Harness repository and external projects. Attached
sessions and programmatic command profiles remain outside this path. Registered
adapter launches have no uncontained fallback.

The launcher builds a bubblewrap user/PID/IPC/UTS/cgroup namespace with a
read-only runtime and worker-tool closure, private `/tmp`, a writable scratch
bind, and a scratch-backed synthetic home. It copies only bounded provider
authentication/configuration material, creates a credential-free Git identity,
and filters the provider environment. Granted workspace roots are realpath
resolved and mounted read-only or read-write according to the Role Grant.
Unresolvable, duplicate, root, overlapping, or scratch-conflicting bindings
are refused. Workflow ledgers are masked, and protected roots cannot be
introduced through runtime bindings.

The host checks containment before registration/allocation and checks a
provider's nested sandbox before launching providers that require one. These
failures become host refusals before a session or execution exists. The
provider process and its worker tools run inside the namespace; worker requests
continue through the governed host protocol. Scratch state is cleaned after a
run or nested probe, and credentials are not written to workflow artifacts.

Contained execution records expose `filesystemIsolation: "bwrap"`, the
Role-Grant workspace IDs and modes, and `syntheticHome: true`. Launch settings,
provider confirmations, and attestation availability remain separate facts.
The public Stage A and Stage B preflight records bind runtime, provider,
workspace-mode, containment, and check provenance without credentials or
private paths. Codex's configured launch settings are enforced without
inventing provider attestation when its output does not confirm them.

## Comparison with the frozen contract

The frozen brief and Design Map require the shared launcher, selection for all
spawned registered adapters, Role-Grant read/write enforcement, synthetic
provider homes, deterministic isolation, Codex and protected-Claude smokes,
fail-closed setup, provider-policy cleanup, reusable preflight evidence, and
preservation of the Stage A distinction. The accepted verification result
records all 14 criteria satisfied, all four executable cases passed, and
219/219 public tests passed with typecheck, lint, and format checks passing.

There are no Missing, Contradictory, or Extra discrepancies against the frozen
contract.

The completed promotion record preserves the accepted candidate and public
verification evidence. It declares `incomplete-known-loss` for unavailable
historical evaluator-attempt bytes; that is a promotion-history fact and does
not change the reconstructed implementation or accepted verification result.
