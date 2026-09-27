# Spike 014d — Human Acceptance

**Date:** 2026-09-27  
**Decision:** ACCEPTED  
**Methodology decision:** AUTHORIZE N → N+1 PROMOTION

## 1. Accepted candidate

I accept Spike 014d's implementation at the exact independently verified commit:

`9169ccf7d4543c214e7b7890ee29e428a5f8c01a`

The corresponding candidate methodology identity is:

`sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`

This decision applies to that candidate and its separately authorized public evidence. Subsequent evidence, archival and maintenance commits do not silently become part of the evaluated implementation.

## 2. Independent evaluation and archival

The existing trusted methodology N independently verified the candidate using evaluator revision `002`, attempt `007`.

- **Result:** PASS
- **Acceptance criteria:** 13/13 satisfied
- **Executable evaluator cases:** 11/11 passed
- **Clean-clone regression:** `npm run check`, 175/175 tests passed
- **Verification-result identity:** `sha256:7c30dd1f9d0ce8f135601aadeae4087688748faa789cf11f9da17a4e4c2e55bc`

The evaluation used the exact candidate commit and the separately authorized, documentation-only public evidence through commit `41726f75b9a0260dd606613aadcf78fd21d1e937`.

The host successfully promoted the eligible evaluator evidence. The canonical promotion identity is:

`sha256:9af265620b31924d1a5cb2be13e235c40c4b49e90eb814a165d6841899862d8c`

The promoted archive, including the retained failed-attempt history and evaluator revision, has subsequently been committed and pushed.

The earlier failed evaluations and infrastructure interruptions remain valid historical evidence. This acceptance does not reinterpret or erase them.

## 3. As-Built review and known limitations

I have reviewed the completed As-Built reconstruction and its forward-only retry.

I accept the implementation with the following qualifications.

**Evidence recorded after the original As-Built snapshot.** The original reconstruction identified missing observed-orchestrator and provider-provenance evidence. Later public evidence imports addressed those evaluation gaps, and trusted-N verification attempt `007` adjudicated them successfully. The original As-Built findings remain historical observations rather than being retroactively rewritten.

**Evaluator-version differences.** This spike's independent PASS was produced under trusted evaluator N, whose contract predates the candidate's new promotion-plan mechanism. Consequently, this spike's own verification result and archive do not demonstrate that newer format. The candidate evaluator's promotion-plan and host-action behaviour were instead exercised in a separate governed fixture and independently evaluated by N.

**Archive limits.** The current 64-artifact request bound is retained. Representative archives fit within it, and oversized requests are rejected without partial promotion. Larger future evaluation histories may require a separately governed change to that bound or archival mechanism.

**External orchestration.** The candidate orchestrator was observed through Codex CLI, including ordinary-request workflow selection, governed continuation, human-gate handling, read-only behaviour, explicit stopping and truthful blocker reporting. These observations do not establish that every Codex App environment or future provider configuration works without additional setup.

These qualifications do not prevent acceptance of the verified 014d scope. They should remain visible in Outcome and relevant future work.

## 4. Separately committed host maintenance

Host maintenance 003 repairs the inconsistent authority-basis calculation following pre-implementation recovery.

It was developed and committed separately, after the exact candidate revision. It is not part of the implementation evaluated at `9169ccf7…`, and this acceptance does not retrospectively extend the independent PASS to that maintenance commit.

Its own provenance and regression evidence remain separately attributable. Any further verification or integration obligations for that maintenance work remain independent of the 014d methodology identity.

## 5. Methodology promotion authority

I explicitly authorize promotion of the exact accepted candidate methodology:

`sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`

from candidate commit:

`9169ccf7d4543c214e7b7890ee29e428a5f8c01a`

Its predecessor must be trusted record `4`, revision:

`0a3dafe8e103cc7376bdd7fae32493710613d0c0`

with methodology identity:

`sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`

Promotion must use the existing methodology tooling, reconstruct the candidate from its committed bytes, confirm the valid candidate/check/diff evidence and bind the independent N-authored PASS to this exact revision and identity.

Only then may the new trusted-history record be appended. Prior trusted records remain immutable.

I also approve adoption of the candidate orchestrator contract v3, with exact skill identity:

`sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`

The orchestrator remains an external supervisor, not an additional trusted methodology role.

Future workflow grants may use N+1 once promotion is durably recorded. Existing grants retain their original pinned authority.

## 6. Completion and next work

After canonical human acceptance and successful methodology promotion, I authorize the existing 014d workflow to run Outcome under its pinned trusted-N authority.

Outcome should preserve the material failure and recovery history, distinguish independently demonstrated capabilities from remaining operational limitations, and record the actual methodology-promotion result.

The next intended step is a small external-project canary under N+1. Usage and quota telemetry, reliable restart-after-quota behaviour, problem decomposition, reduced context costs and further simplification remain subsequent work.

This acceptance closes the product and methodology decision for the verified scope of Spike 014d. It does not constitute a general production-readiness certification for Harness.