# Outcome — 014h Host-Owned Executor Filesystem Isolation

## Result and exact provenance

**STANDARD** — the accepted product is candidate
`dee86d2314bffa7cc2da0d8ac72004250a06debb`.

The frozen brief is `sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417` and the Design Map is
`sha256:aeb1eafba99ff258859488ad4ccc77030096cbc1ee45d1ba8c75a64510d0aedf`.
The accepted verification used evaluator revision 001, attempt 006,
execution `9539f28b-5cb6-4dbc-b903-b57dbacafb05`; promotion identity is
`sha256:2333929b0798e7d150afa66a63ccc87ccfb8123c5c2bd1d93b27c5059889a2e4`.
As-Built evidence is `sha256:7a061a35616c5f346f877b3e4da2c90f7fdbc67815b8d800ab958d7c1ff2551b`.

## What Was Established

Harness can enforce Role-Grant filesystem visibility for spawned registered
provider adapters with one host-owned bubblewrap launcher, for both Harness and
external projects. Read/write workspace modes, scratch, synthetic provider
homes, masked workflow ledgers, symlink/parent-path boundaries, and fail-closed
launch refusal are enforced at the host boundary. Codex public execution and
protected Claude execution both worked through that path.

## Implementation Summary

`containedLaunch` is the single production containment construction site.
Registered adapter launches are contained before registration/allocation and
have no uncontained fallback. Execution records expose only public-safe
isolation metadata; provider configuration and credentials remain outside
workflow evidence. Provider settings and provider attestation remain separate
facts, and protected routing remains policy-controlled.

## Evaluation Evidence

Independent evaluation returned PASS: 14/14 criteria, 4/4 executable cases,
and 219/219 regression tests passed, with typecheck, lint, and format checks
passing. The exact candidate was human-accepted. The promoted evaluation
contains the successful attempt, frozen revision, evaluator artifacts, and
provenance.

Promotion used an explicitly authorized loss-aware recovery because evaluator
artifacts for attempts 001–005 were not retained. The loss is recorded as
`incomplete-known-loss`; absent artifacts were not reconstructed, and ordinary
archive validation remains INELIGIBLE. This is historical recovery evidence,
not a normal promotion rule or a change to the PASS.

## Material History

Brief Readiness first blocked the draft, then passed the clarified brief.
Implementation and verification exposed result-handshake, unattended-provider,
and legacy evidence-publication defects; each was repaired without changing
the frozen criteria or candidate acceptance. The final evaluator attempt passed.
The As-Built reconstruction found no Missing, Contradictory, or Extra
discrepancies against the frozen contract.

## Decisions and Discoveries

The existing 014e bubblewrap boundary was generalized rather than duplicated.
Filesystem authority belongs to the host and Role Grant, while provider
adapters retain only provider-specific runtime concerns. Public Codex use can
be enabled under the checkpointed boundary; protected evaluator routing remains
separate. The archive-loss incident demonstrates that attempt retention must be
durable at every termination, including failures and infrastructure errors.

## Deferred Concerns

This spike does not address deliberate kernel or namespace escapes, hostile
native binaries, malicious root processes, or multi-tenant threat models. The
known evaluator-history retention defect remains a follow-up concern. Later
bootstrap/runtime commits are not part of the independently accepted candidate.

## Skill Versions and Workflow Cost

Material runs recorded in the manifest used brief-readiness v5, design-map v4,
evaluator v14, implementation v5, as-built v4, and outcome v5. The manifest
records available durations and test counts; token usage was unavailable for
these runs. This entry records no estimates.

## Next Step

Use the accepted containment boundary as the basis for eligible public governed
work and address durable evaluator-attempt retention before relying on ordinary
complete-history promotion in a future cycle.
