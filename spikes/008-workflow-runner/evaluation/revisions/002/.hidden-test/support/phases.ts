// Canonical phase order and ownership per TR4 / Design Map "fixed phase
// order" and "fixed ownership."

export const PHASE_ORDER = [
  "brief-readiness",
  "design-map",
  "evaluator-prepare",
  "implementation",
  "evaluator-verify",
  "as-built",
  "outcome",
] as const;

export type Phase = (typeof PHASE_ORDER)[number];

export const CODEX_PHASES: readonly Phase[] = [
  "brief-readiness",
  "design-map",
  "implementation",
  "as-built",
  "outcome",
];

export const CLAUDE_PHASES: readonly Phase[] = [
  "evaluator-prepare",
  "evaluator-verify",
];

export const PHASE_SKILL: Record<Phase, string> = {
  "brief-readiness": "brief-readiness",
  "design-map": "design-map",
  "evaluator-prepare": "evaluator",
  implementation: "implementation",
  "evaluator-verify": "evaluator",
  "as-built": "as-built",
  outcome: "outcome",
};
