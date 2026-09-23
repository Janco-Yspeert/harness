# Spike 014c Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:d52ba4451b058f715197e2c2d2046f0d9d9897841233193fbbf7994985979f83`,
  assignment `802a34cd-450c-4d47-8f1c-5e5a5a16f659`; human-authorized 014c
  bootstrap execution).
- Input: draft `spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`,
  reviewed against `feat/spike-014` at
  `fd60b07f9bac407adeb4ff4ba5eb616672d14b46`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`). One blocker
  (B1: the trust-equivalence gate does not say how it applies to the synthetic
  real-provider smoke tests or to non-Harness projects), two material
  clarifications (M1: pinned evaluator launch path and host revision; M2: how
  the production configuration is kept apart from the test configuration), and
  two editorial notes.
- Outputs: `feedback.md`
  `sha256:f0bbe01ab6b89cd3c7201709752d3280db74a233d3a932c034d2699ca4ef17be`;
  preliminary snapshot `preliminary/001/spike.md` (identical to the input) and
  `preliminary/001/feedback.md` (identical to `feedback.md`).
- Repository evidence inspected: `AGENTS.md`; the draft brief and its commit
  history; `bootstrap/authority.md`; `tools/governed-claude-bootstrap.ts`;
  `src/kernel/{host,execution,methodology,configuration,model}.ts`;
  `src/methodology-evolution.ts`; `src/index.ts`; `harness.project.json`;
  `methodologies/harness/{policy.json,trusted.jsonl}`; and the public 014a
  manifest format.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity;
  SHA-256 equality of the preliminary snapshot; Prettier check of the feedback
  files; `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:3d5bec9555558f4be33976e8869ca10479e026d52d7c9fb08480c3c64d05333c`,
  assignment `844ba158-2cf0-40a8-895a-28d40919cf89`; human-authorized 014c
  bootstrap execution).
- Input: draft `spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
  (byte-identical to the Run 001 input), reviewed against `feat/spike-014` at
  `27655009f3e915b4973eaad5b82058bec190f41e`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`). The brief is
  unrevised, so Run 001's findings persist after re-verification: blocker B1
  (trust-equivalence gate scope versus synthetic smoke tests), material
  clarifications M1 and M2, and editorial notes E1–E3.
- Outputs: `feedback.md`
  `sha256:423c535a8f6cef3008fc84157d0d1fe20ca941078ab401fd84f4150c0063a1bb`;
  preliminary snapshot `preliminary/002/spike.md` (identical to the input) and
  `preliminary/002/feedback.md` (identical to `feedback.md`). `preliminary/001`
  was left untouched.
- Repository evidence inspected: the draft brief; the Run 001 feedback and
  manifest; `bootstrap/authority.md`; `harness.project.json`; `methodologies/`;
  `src/methodology-evolution.ts`; `src/kernel/{host,methodology,execution}.ts`;
  `src/index.ts`; and `git diff fd60b07 HEAD --stat`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity and
  the preliminary snapshots; Prettier check of the feedback files.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:71ea1023f4b40c016a923e0b37f428cb9504ac9f0ed3c06bcc0c282e86dd4de3`,
  assignment `01e707aa-a305-4b6d-b7f4-36a63841fe0c`; human-authorized 014c
  bootstrap execution).
- Input: draft `spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
  (byte-identical to the Run 001 and Run 002 inputs), reviewed against
  `feat/spike-014` at `bf8bc140338427904d4305fc1c9273345fbcf8aa`.
- Result: succeeded; verdict **Not ready to freeze** (`NOT_READY`). The brief is
  unrevised and the repository evidence is unchanged, so blocker B1
  (trust-equivalence gate scope versus synthetic smoke tests), material
  clarifications M1 and M2, and editorial notes E1–E3 persist.
- Outputs: `feedback.md`
  `sha256:283874d28ef8ed3cde9bfe92258ee274bc9226faba338121be5f6c066fdfcf29`;
  preliminary snapshot `preliminary/003/spike.md` (identical to the input) and
  `preliminary/003/feedback.md` (identical to `feedback.md`).
  `preliminary/001` and `preliminary/002` were left untouched.
- Repository evidence inspected: the draft brief; the Run 002 feedback and
  manifest; `bootstrap/authority.md`; `harness.project.json`;
  `methodologies/harness/trusted.jsonl`; `src/methodology-evolution.ts`;
  `src/kernel/host.ts` and a trust search over `src/kernel/`; `src/index.ts`;
  and `git diff` stats since `2765500` and `fd60b07`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity and
  the preliminary snapshots; Prettier check of the feedback files.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Brief Readiness

- Skill: `brief-readiness` v4,
  `sha256:fd93e80b353c7cb386aae6d133ce4cc0226a20f5e1d8dea87200084f3ef210a1`
  (pinned bytes delivered by Role Grant
  `sha256:b5bc4c8da0d87f71ddc5f3ab0b4493ac9f3fe1215fe47a4b9131c8e26467587d`,
  assignment `72a50e0e-af22-468f-be95-35996ab21ca6`; human-authorized 014c
  bootstrap execution).
- Input: revised draft `spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`,
  reviewed against `feat/spike-014` at
  `fea79abb0b9085f6ce90b2c94e750b15a38e56c8`.
- Result: succeeded; verdict **Ready after minor clarification** (`READY`).
  Earlier blocker B1, clarifications M1 and M2, and editorial notes E1 and E2
  are resolved. Two non-blocking clarifications remain: C1 (who records the
  fixture's human trust-root authority, and when) and C2 (generalizing the
  Harness-specific manifest construction to per-project trust histories and
  validator sets). One editorial note remains: E1 (record the freeze
  checkpoint).
- Outputs: `feedback.md`
  `sha256:18d02ec6f81aa5e93d7bd975bee74a16d73ee56985172aeb6c44e6775f778c10`.
  The verdict passes, so no preliminary snapshot was created. `preliminary/001`
  through `preliminary/003` were left untouched.
- Repository evidence inspected: the draft brief and its diff since Run 003;
  the Run 003 feedback and manifest; `bootstrap/authority.md`; commit
  `d447e385` and its `tools/governed-claude-bootstrap.ts`;
  `harness.project.json`; `methodologies/harness/trusted.jsonl`;
  `src/methodology-evolution.ts`; `tools/methodology.ts`; and `src/index.ts`.
- Restricted evaluator material inspected: none.
- Checks: SHA-256 comparison of the input against the host-bound identity;
  `git diff ccca429 HEAD --stat`; ancestry check of `d447e385`; Prettier check
  of `feedback.md`.
- Measurement cutoff: immediately before this manifest update.
