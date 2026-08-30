import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  appendFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, normalize, relative, resolve } from "node:path";
import { kill } from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const phases = [
  "brief-readiness",
  "design-map",
  "evaluator-prepare",
  "implementation",
  "evaluator-verify",
  "as-built",
  "outcome",
] as const;
type Phase = (typeof phases)[number];
type Outcome = "complete" | "blocked" | "failed";
type Executor = "codex" | "claude";
interface Job {
  readonly pid: number;
  readonly command: string[];
  readonly logPath: string;
  readonly launchedAt: string;
}
interface Record {
  readonly event: "init" | "dispatch" | "job" | "outcome";
  readonly phase: Phase;
  readonly attempt: number;
  readonly at: string;
  readonly implementationAttempt?: number;
  readonly job?: Job;
  readonly outcome?: Outcome;
}
interface WorkflowState {
  readonly version: 2;
  readonly records: Record[];
}
interface Target {
  readonly path: string;
  readonly statePath: string;
  readonly workflowPath: string;
}
type AuthorityTransition =
  | "brief-frozen"
  | "design-map-frozen"
  | "evaluation-prepared"
  | "implementation-handoff"
  | "verification-allocated"
  | "verification-finalized"
  | "promotion-recorded"
  | "as-built-recorded"
  | "human-accepted"
  | "human-rejected"
  | "successor-linked"
  | "outcome-recorded";
interface AuthorityEvent {
  readonly transition: AuthorityTransition;
  readonly at: string;
  readonly evidence: Evidence;
}
interface Evidence {
  readonly [key: string]: unknown;
}

function fail(message: string): never {
  throw new Error(message);
}
function phaseFrom(value: string | undefined): Phase {
  if (value === undefined || !phases.includes(value as Phase)) {
    return fail(`Unknown phase: ${value ?? ""}`);
  }
  return value as Phase;
}
function targetFrom(value: string | undefined): Target {
  if (
    value === undefined ||
    isAbsolute(value) ||
    normalize(value) !== value ||
    !/^spikes\/\d{3}[a-z]*-[^/]+$/.test(value)
  ) {
    return fail("Spike path must be a normalized spikes/NNN-*/ path");
  }
  const path = resolve(repositoryRoot, value);
  if (
    relative(repositoryRoot, path).startsWith("..") ||
    !statSync(path).isDirectory()
  ) {
    return fail("Spike path must resolve to an existing spike directory");
  }
  const workflowPath = resolve(path, ".workflow");
  return { path, workflowPath, statePath: resolve(workflowPath, "state.json") };
}
function readState(target: Target): WorkflowState {
  try {
    const state: unknown = JSON.parse(readFileSync(target.statePath, "utf8"));
    if (
      typeof state === "object" &&
      state !== null &&
      "version" in state &&
      state.version === 2 &&
      "records" in state &&
      Array.isArray(state.records)
    ) {
      return state as WorkflowState;
    }
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fail("Workflow is not initialized; run init first");
    }
    throw error;
  }
  return fail("Workflow state is invalid");
}
function writeState(target: Target, state: WorkflowState): void {
  writeFileSync(target.statePath, `${JSON.stringify(state, null, 2)}\n`, {
    mode: 0o600,
  });
}
function append(state: WorkflowState, record: Record): WorkflowState {
  return { ...state, records: [...state.records, record] };
}
function recordsFor(state: WorkflowState, phase: Phase, attempt: number) {
  return state.records.filter(
    (record) => record.phase === phase && record.attempt === attempt,
  );
}
function hasOutcome(
  state: WorkflowState,
  phase: Phase,
  attempt: number,
  outcome?: Outcome,
): boolean {
  return recordsFor(state, phase, attempt).some(
    (record) =>
      record.outcome !== undefined &&
      (outcome === undefined || record.outcome === outcome),
  );
}
function maximumAttempt(state: WorkflowState, phase: Phase): number {
  const attempts = state.records
    .filter((record) => record.phase === phase)
    .map((record) => record.attempt);
  return attempts.length === 0 ? 0 : Math.max(...attempts);
}
function completedImplementation(state: WorkflowState): number {
  const attempts = state.records
    .filter(
      (record) =>
        record.phase === "implementation" && record.outcome === "complete",
    )
    .map((record) => record.attempt);
  return attempts.length === 0 ? 0 : Math.max(...attempts);
}
function failedVerificationFor(
  state: WorkflowState,
  implementationAttempt: number,
): boolean {
  return state.records.some(
    (record) =>
      record.phase === "evaluator-verify" &&
      record.outcome === "failed" &&
      record.implementationAttempt === implementationAttempt,
  );
}
function attemptForDispatch(state: WorkflowState, phase: Phase): number {
  if (phase === "implementation") return maximumAttempt(state, phase) + 1;
  if (phase === "evaluator-verify") return maximumAttempt(state, phase) + 1;
  return 1;
}
function canDispatch(
  state: WorkflowState,
  phase: Phase,
  attempt: number,
): void {
  if (
    recordsFor(state, phase, attempt).some(
      (record) => record.event === "dispatch",
    )
  ) {
    fail(
      `Phase ${phase} attempt ${String(attempt)} has already been dispatched`,
    );
  }
  if (phase === "brief-readiness") return;
  if (phase === "implementation") {
    if (attempt > 1 && !failedVerificationFor(state, attempt - 1)) {
      fail("Implementation retry requires a failed evaluator verify");
    }
    if (
      attempt === 1 &&
      !hasOutcome(state, "evaluator-prepare", 1, "complete")
    ) {
      fail("Implementation requires the prior phase to be complete");
    }
    return;
  }
  if (phase === "evaluator-verify") {
    if (completedImplementation(state) === 0) {
      fail("Evaluator verify requires a completed implementation");
    }
    return;
  }
  if (phase === "as-built") {
    const implementationAttempt = completedImplementation(state);
    if (
      implementationAttempt === 0 ||
      !state.records.some(
        (record) =>
          record.phase === "evaluator-verify" &&
          record.outcome === "complete" &&
          record.implementationAttempt === implementationAttempt,
      )
    ) {
      fail("As-Built requires a completed evaluator verify");
    }
    return;
  }
  const prior = phases[phases.indexOf(phase) - 1];
  if (prior === undefined || !hasOutcome(state, prior, 1, "complete")) {
    fail(`Phase ${phase} requires the prior phase to be complete`);
  }
}
function executorFor(phase: Phase): Executor {
  const evaluator = phase.startsWith("evaluator-");
  const selected = evaluator
    ? (process.env.HARNESS_WORKFLOW_EVALUATOR_EXECUTOR ?? "claude")
    : (process.env.HARNESS_WORKFLOW_PUBLIC_EXECUTOR ?? "codex");
  if (selected !== "codex" && selected !== "claude") {
    return fail(`Unsupported workflow executor: ${selected}`);
  }
  return selected;
}
function promptFor(phase: Phase, spike: string): string {
  const skill = phase.startsWith("evaluator-") ? "evaluator" : phase;
  const mode =
    phase === "evaluator-prepare"
      ? " in prepare mode"
      : phase === "evaluator-verify"
        ? " in verify mode"
        : "";
  return `Use the ${skill} repository skill${mode} for ${spike}. This is the ${phase} role in the canonical Harness workflow.`;
}
function commandFor(phase: Phase, spike: string): string[] {
  const prompt = promptFor(phase, spike);
  return executorFor(phase) === "codex"
    ? ["codex", "exec", "--cd", repositoryRoot, prompt]
    : ["claude", "-p", "--permission-mode", "manual", prompt];
}
function isLive(pid: number): boolean {
  try {
    kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function init(target: Target): void {
  try {
    statSync(target.statePath);
    fail("Workflow is already initialized");
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  mkdirSync(target.workflowPath, { recursive: true, mode: 0o700 });
  writeState(target, {
    version: 2,
    records: [
      {
        event: "init",
        phase: "brief-readiness",
        attempt: 1,
        at: new Date().toISOString(),
      },
    ],
  });
}
async function launch(command: string[], logPath: string): Promise<number> {
  const [program, ...arguments_] = command;
  if (program === undefined) fail("Executor command is empty");
  const log = openSync(logPath, "a", 0o600);
  const child = spawn(program, arguments_, {
    detached: true,
    stdio: ["ignore", log, log],
  });
  try {
    await new Promise<void>((resolveLaunch, rejectLaunch) => {
      child.once("spawn", resolveLaunch);
      child.once("error", rejectLaunch);
    });
  } finally {
    closeSync(log);
  }
  if (child.pid === undefined) fail("Failed to launch executor");
  child.unref();
  return child.pid;
}
async function dispatch(
  target: Target,
  spike: string,
  phase: Phase,
  execute: boolean,
): Promise<void> {
  const state = readState(target);
  const attempt = attemptForDispatch(state, phase);
  canDispatch(state, phase, attempt);
  const implementationAttempt =
    phase === "evaluator-verify" ? completedImplementation(state) : undefined;
  const implementationReference =
    implementationAttempt === undefined ? {} : { implementationAttempt };
  const command = commandFor(phase, spike);
  if (!execute) {
    writeState(
      target,
      append(state, {
        event: "dispatch",
        phase,
        attempt,
        at: new Date().toISOString(),
        ...implementationReference,
      }),
    );
    process.stdout.write(`${JSON.stringify(command)}\n`);
    return;
  }
  const logPath = resolve(
    target.workflowPath,
    `${phase}-${String(attempt)}.log`,
  );
  const pid = await launch(command, logPath);
  const launchedAt = new Date().toISOString();
  const dispatched = append(state, {
    event: "dispatch",
    phase,
    attempt,
    at: launchedAt,
    ...implementationReference,
  });
  writeState(
    target,
    append(dispatched, {
      event: "job",
      phase,
      attempt,
      at: launchedAt,
      ...implementationReference,
      job: { pid, command, logPath, launchedAt },
    }),
  );
}
function record(
  target: Target,
  phase: Phase,
  outcome: string | undefined,
): void {
  if (outcome !== "complete" && outcome !== "blocked" && outcome !== "failed")
    fail("Outcome must be complete, blocked, or failed");
  const state = readState(target);
  const attempt = maximumAttempt(state, phase);
  if (
    attempt === 0 ||
    !recordsFor(state, phase, attempt).some((item) => item.event === "dispatch")
  )
    fail(`Phase ${phase} has not been dispatched`);
  if (hasOutcome(state, phase, attempt))
    fail(`Phase ${phase} attempt ${String(attempt)} already has an outcome`);
  const implementationAttempt = recordsFor(state, phase, attempt).find(
    (item) => item.implementationAttempt !== undefined,
  )?.implementationAttempt;
  const implementationReference =
    implementationAttempt === undefined ? {} : { implementationAttempt };
  writeState(
    target,
    append(state, {
      event: "outcome",
      phase,
      attempt,
      at: new Date().toISOString(),
      outcome,
      ...implementationReference,
    }),
  );
}
function status(target: Target): void {
  const state = readState(target);
  const records = state.records.map((record) =>
    record.job === undefined
      ? record
      : { ...record, job: { ...record.job, live: isLive(record.job.pid) } },
  );
  process.stdout.write(`${JSON.stringify({ records })}\n`);
}
function cancel(target: Target, phase: Phase): void {
  const jobRecord = [...readState(target).records]
    .reverse()
    .find((record) => record.phase === phase && record.job !== undefined);
  if (jobRecord?.job === undefined || !isLive(jobRecord.job.pid))
    fail(`No live job for ${phase}`);
  kill(jobRecord.job.pid, "SIGTERM");
}
const authorityTransitions: AuthorityTransition[] = [
  "brief-frozen",
  "design-map-frozen",
  "evaluation-prepared",
  "implementation-handoff",
  "verification-allocated",
  "verification-finalized",
  "promotion-recorded",
  "as-built-recorded",
  "human-accepted",
  "human-rejected",
  "successor-linked",
  "outcome-recorded",
];
function authorityPath(target: Target): string {
  return resolve(target.path, "workflow.jsonl");
}
function authorityEvents(target: Target): AuthorityEvent[] {
  const path = authorityPath(target);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AuthorityEvent);
}
function value(evidence: Evidence, name: string): string {
  const result = evidence[name];
  if (typeof result !== "string" || result.length === 0)
    fail(`Evidence requires ${name}`);
  return result;
}
function identity(contents: string | Buffer): string {
  return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
}
function verifyPublicEvidence(target: Target, evidence: Evidence): void {
  if (!("path" in evidence)) return;
  const path = value(evidence, "path");
  const commit = value(evidence, "commit");
  const claimed = value(evidence, "identity");
  if (path.startsWith("/") || path.includes(".."))
    fail("Evidence path must be repository-relative");
  const current = resolve(target.path, path);
  if (!existsSync(current) || identity(readFileSync(current)) !== claimed)
    fail("Public artifact identity does not match working tree");
  let committed: Buffer;
  try {
    committed = execFileSync(
      "git",
      ["show", `${commit}:${relative(repositoryRoot, current)}`],
      { cwd: repositoryRoot },
    );
  } catch (error: unknown) {
    const processError = error as NodeJS.ErrnoException & {
      status?: number;
      stdout?: Buffer;
    };
    if (processError.status === 0 && processError.stdout !== undefined) {
      committed = processError.stdout;
    } else {
      fail("Claimed Git provenance is invalid");
    }
  }
  if (identity(committed) !== claimed)
    fail("Public artifact identity does not match claimed commit");
}
function latest(
  events: AuthorityEvent[],
  transition: AuthorityTransition,
): AuthorityEvent | undefined {
  return [...events].reverse().find((event) => event.transition === transition);
}
interface CoverageEntry {
  readonly id: string;
  readonly mode: string;
  readonly required: boolean;
}
function preparedCoverage(
  target: Target,
  events: AuthorityEvent[],
): CoverageEntry[] {
  const prepared = latest(events, "evaluation-prepared");
  if (!prepared) return [];
  const path = prepared.evidence.path;
  if (typeof path !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(
      readFileSync(resolve(target.path, path), "utf8"),
    );
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "criteria" in parsed &&
      Array.isArray(parsed.criteria)
    ) {
      return parsed.criteria.filter(
        (item): item is CoverageEntry =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as CoverageEntry).id === "string" &&
          typeof (item as CoverageEntry).mode === "string" &&
          typeof (item as CoverageEntry).required === "boolean",
      );
    }
  } catch {
    return [];
  }
  return [];
}
function authorityState(target: Target) {
  const events = authorityEvents(target);
  const finalized = events.filter(
    (event) => event.transition === "verification-finalized",
  );
  const lastVerification = finalized.at(-1);
  const passed = lastVerification?.evidence.result === "PASS";
  const promoted = latest(events, "promotion-recorded") !== undefined;
  const asBuilt = latest(events, "as-built-recorded") !== undefined;
  const accepted = latest(events, "human-accepted") !== undefined;
  const rejectedEvent = latest(events, "human-rejected");
  const rejected = rejectedEvent !== undefined;
  const outcome = latest(events, "outcome-recorded") !== undefined;
  const successor = latest(events, "successor-linked");
  return {
    events,
    passed,
    promoted,
    asBuilt,
    accepted,
    rejected,
    rejectedEvent,
    successor,
    outcome,
    coverage: preparedCoverage(target, events),
  };
}
function validateAuthority(
  target: Target,
  transition: AuthorityTransition,
  evidence: Evidence,
): void {
  if (!authorityTransitions.includes(transition))
    fail(`Unknown authority transition: ${transition}`);
  const state = authorityState(target);
  const events = state.events;
  if (transition !== "human-accepted") verifyPublicEvidence(target, evidence);
  const requireEvent = (name: AuthorityTransition) => {
    if (!latest(events, name)) fail(`${transition} requires ${name}`);
  };
  if (transition === "brief-frozen") return;
  if (transition === "design-map-frozen") {
    requireEvent("brief-frozen");
    return;
  }
  if (transition === "evaluation-prepared") {
    requireEvent("design-map-frozen");
    const coverage = preparedCoverage(target, [
      ...events,
      { transition, at: "", evidence },
    ]);
    if (
      coverage.length === 0 ||
      new Set(coverage.map((item) => item.id)).size !== coverage.length
    )
      fail("evaluation-prepared requires a complete unique coverage map");
    if (coverage.some((item) => item.mode === "BLOCKED"))
      fail("evaluation-prepared cannot complete with blocked coverage");
    return;
  }
  if (transition === "implementation-handoff") {
    requireEvent("evaluation-prepared");
    const commit = value(evidence, "commit");
    try {
      execFileSync("git", ["cat-file", "-e", `${commit}^{commit}`], {
        cwd: repositoryRoot,
      });
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException & { status?: number }).status !== 0)
        fail("Implementation commit is invalid");
    }
    const prior = events.filter(
      (event) => event.transition === transition,
    ).length;
    if (Number(evidence.attempt) !== prior + 1)
      fail("Implementation attempt is not next");
    return;
  }
  if (transition === "verification-allocated") {
    const handoff = latest(events, "implementation-handoff");
    if (!handoff)
      fail("verification-allocated requires implementation-handoff");
    if (
      value(evidence, "commit") !== value(handoff.evidence, "commit") ||
      Number(evidence.implementationAttempt) !==
        Number(handoff.evidence.attempt)
    )
      fail("Verification must bind current implementation handoff");
    if (
      Number(evidence.attempt) !==
      events.filter((event) => event.transition === transition).length + 1
    )
      fail("Verification attempt is not next");
    return;
  }
  if (transition === "verification-finalized") {
    const allocation = latest(events, "verification-allocated");
    if (
      !allocation ||
      Number(evidence.attempt) !== Number(allocation.evidence.attempt)
    )
      fail("Verification result requires matching allocation");
    if (
      events.some(
        (event) =>
          event.transition === "verification-finalized" &&
          Number(event.evidence.attempt) === Number(evidence.attempt),
      )
    )
      fail("Verification attempt is already finalized");
    const result = value(evidence, "result");
    const classification = evidence.classification;
    if (!["PASS", "FAIL", "BLOCKED"].includes(result))
      fail("Invalid verification result");
    if (result === "PASS" && classification !== undefined)
      fail("PASS cannot carry a failure classification");
    if (
      result !== "PASS" &&
      ![
        "IMPLEMENTATION_FAILURE",
        "EVALUATOR_DEFECT",
        "SPECIFICATION_AMBIGUITY",
        "INFRASTRUCTURE_FAILURE",
        "SPECIFICATION_DRIFT",
      ].includes(String(classification))
    )
      fail("Invalid verification classification");
    const coverage = state.coverage;
    const results = evidence.coverageResults;
    if (
      typeof results !== "object" ||
      results === null ||
      Array.isArray(results)
    )
      fail("verification-finalized requires coverageResults");
    const keys = Object.keys(results);
    if (
      keys.length !== coverage.length ||
      !coverage.every((item) => keys.includes(item.id))
    )
      fail("Verification coverage results do not match prepared map");
    if (
      result === "PASS" &&
      coverage.some(
        (item) =>
          item.required &&
          (results as { readonly [key: string]: unknown })[item.id] !==
            "SATISFIED",
      )
    )
      fail("PASS requires every required criterion to be SATISFIED");
    return;
  }
  if (transition === "promotion-recorded") {
    if (!state.passed) fail("promotion-recorded requires PASS");
    return;
  }
  if (transition === "as-built-recorded") {
    if (!state.promoted) fail("as-built-recorded requires promotion-recorded");
    return;
  }
  if (transition === "human-accepted") {
    if (!state.asBuilt) fail("human-accepted requires as-built-recorded");
    if (state.rejected) fail("human decision is already rejected");
    return;
  }
  if (transition === "human-rejected") {
    if (!state.asBuilt) fail("human-rejected requires as-built-recorded");
    if (state.accepted || state.rejected)
      fail("human decision is already recorded");
    if (
      ![
        "IMPLEMENTATION_GAP",
        "EVALUATOR_COVERAGE_DEFECT",
        "SPECIFICATION_CHANGE",
        "OTHER_HUMAN_REJECTION",
      ].includes(value(evidence, "classification"))
    )
      fail("Invalid human rejection classification");
    return;
  }
  if (transition === "successor-linked") {
    if (!value(evidence, "predecessor").startsWith("spikes/"))
      fail("successor-linked requires predecessor spike path");
    return;
  }
  if (!state.accepted || state.rejected)
    fail("outcome-recorded requires human-accepted");
}
function authority(
  target: Target,
  mode: string | undefined,
  transition?: string,
  json?: string,
): void {
  if (mode === "status") {
    const state = authorityState(target);
    const legal = authorityTransitions.filter((item) => {
      try {
        validateAuthority(target, item, {});
        return true;
      } catch {
        return false;
      }
    });
    process.stdout.write(
      `${JSON.stringify({ history: state.events, legalTransitions: legal, technicalVerification: state.passed ? "PASS" : "NOT_PASSED", promotionComplete: state.promoted, asBuiltComplete: state.asBuilt, humanDecision: state.rejected ? "REJECTED" : state.accepted ? "ACCEPTED" : state.asBuilt ? "PENDING" : "NOT_READY", rejectionClassification: state.rejectedEvent?.evidence.classification ?? null, predecessor: state.successor?.evidence.predecessor ?? null, successorPermitted: state.rejected, outcomeComplete: state.outcome })}\n`,
    );
    return;
  }
  if (
    (mode !== "validate" && mode !== "record") ||
    transition === undefined ||
    json === undefined
  )
    fail(
      "Usage: workflow authority <status|validate|record> <spike> [transition evidence-json]",
    );
  const parsed: unknown = JSON.parse(json);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
    fail("Evidence must be a JSON object");
  validateAuthority(
    target,
    transition as AuthorityTransition,
    parsed as Evidence,
  );
  if (mode === "record")
    appendFileSync(
      authorityPath(target),
      `${JSON.stringify({ transition, at: new Date().toISOString(), evidence: parsed })}\n`,
      { mode: 0o600 },
    );
  process.stdout.write(
    `${JSON.stringify({ allowed: true, recorded: mode === "record" })}\n`,
  );
}
async function main(args: string[]): Promise<void> {
  const [command, ...rest] = args;
  if (command === "authority") {
    const [mode, spike, transition, json] = rest;
    if (spike === undefined)
      fail(
        "Usage: workflow authority <status|validate|record> <spike> [transition evidence-json]",
      );
    authority(targetFrom(spike), mode, transition, json);
    return;
  }
  if (command === "init" && rest.length === 1) {
    init(targetFrom(rest[0]));
    return;
  }
  if (command === "status" && rest.length === 1) {
    status(targetFrom(rest[0]));
    return;
  }
  if (command === "dispatch") {
    const [phaseValue, spike, option] = rest;
    if (
      spike === undefined ||
      (option !== undefined && option !== "--execute") ||
      rest.length < 2 ||
      rest.length > 3
    )
      fail("Usage: workflow dispatch <phase> <spike> [--execute]");
    return dispatch(
      targetFrom(spike),
      spike,
      phaseFrom(phaseValue),
      option === "--execute",
    );
  }
  if (command === "record" && rest.length === 3) {
    record(targetFrom(rest[1]), phaseFrom(rest[0]), rest[2]);
    return;
  }
  if (command === "cancel" && rest.length === 2) {
    cancel(targetFrom(rest[1]), phaseFrom(rest[0]));
    return;
  }
  fail("Usage: workflow <init|status|dispatch|record|cancel> ...");
}
void main(process.argv.slice(2)).catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
