import { spawn } from "node:child_process";
import {
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
  readonly job?: Job;
  readonly outcome?: Outcome;
}
interface WorkflowState {
  readonly version: 1;
  readonly records: Record[];
}
interface Target {
  readonly path: string;
  readonly statePath: string;
  readonly workflowPath: string;
}

function fail(message: string): never {
  throw new Error(message);
}
function phaseFrom(value: string | undefined): Phase {
  if (value === undefined || !phases.includes(value as Phase))
    return fail(`Unknown phase: ${value ?? ""}`);
  return value as Phase;
}
function targetFrom(value: string | undefined): Target {
  if (
    value === undefined ||
    isAbsolute(value) ||
    normalize(value) !== value ||
    !/^spikes\/\d{3}-[^/]+$/.test(value)
  )
    return fail("Spike path must be a normalized spikes/NNN-*/ path");
  const path = resolve(repositoryRoot, value);
  if (
    relative(repositoryRoot, path).startsWith("..") ||
    !statSync(path).isDirectory()
  )
    return fail("Spike path must resolve to an existing spike directory");
  const workflowPath = resolve(path, ".workflow");
  return { path, workflowPath, statePath: resolve(workflowPath, "state.json") };
}
function readState(target: Target): WorkflowState {
  try {
    const parsed: unknown = JSON.parse(readFileSync(target.statePath, "utf8"));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      parsed.version === 1 &&
      "records" in parsed &&
      Array.isArray(parsed.records)
    )
      return parsed as WorkflowState;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return fail("Workflow is not initialized; run init first");
    throw error;
  }
  return fail("Workflow state is invalid");
}
function writeState(target: Target, state: WorkflowState): void {
  writeFileSync(target.statePath, `${JSON.stringify(state, null, 2)}\n`);
}
function append(state: WorkflowState, record: Record): WorkflowState {
  return { ...state, records: [...state.records, record] };
}
function recordsFor(
  state: WorkflowState,
  phase: Phase,
  attempt: number,
): Record[] {
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
function implementationAttempt(state: WorkflowState): number {
  const attempts = state.records
    .filter((record) => record.phase === "implementation")
    .map((record) => record.attempt);
  return attempts.length === 0 ? 1 : Math.max(...attempts);
}

function attemptForDispatch(state: WorkflowState, phase: Phase): number {
  if (phase === "implementation") {
    const current = implementationAttempt(state);
    return state.records.some(
      (record) =>
        record.phase === phase &&
        record.attempt === current &&
        record.event === "dispatch",
    )
      ? current + 1
      : current;
  }
  if (phase === "evaluator-verify") {
    const attempts = state.records
      .filter((record) => record.phase === "implementation")
      .map((record) => record.attempt);
    return attempts.length === 0 ? 1 : Math.max(...attempts);
  }
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
  )
    fail(
      `Phase ${phase} attempt ${String(attempt)} has already been dispatched`,
    );
  if (phase === "brief-readiness") return;
  if (phase === "implementation" && attempt > 1) {
    if (!hasOutcome(state, "evaluator-verify", attempt - 1, "failed"))
      fail("Implementation retry requires a failed evaluator verify");
    return;
  }
  if (phase === "evaluator-verify") {
    if (!hasOutcome(state, "implementation", attempt, "complete"))
      fail("Evaluator verify requires a completed implementation");
    return;
  }
  if (phase === "as-built") {
    if (
      !hasOutcome(
        state,
        "evaluator-verify",
        implementationAttempt(state),
        "complete",
      )
    )
      fail("As-Built requires a completed evaluator verify");
    return;
  }
  const prior = phases[phases.indexOf(phase) - 1];
  if (prior === undefined || !hasOutcome(state, prior, 1, "complete"))
    fail(`Phase ${phase} requires the prior phase to be complete`);
}
function promptFor(phase: Phase, spike: string): string {
  const owner =
    phase === "evaluator-prepare" || phase === "evaluator-verify"
      ? "Claude"
      : "Codex";
  const skill = phase.startsWith("evaluator-") ? "evaluator" : phase;
  const mode =
    phase === "evaluator-prepare"
      ? " in prepare mode"
      : phase === "evaluator-verify"
        ? " in verify mode"
        : "";
  return `Use the ${skill} repository skill${mode} for ${spike}. You are the ${owner}-owned ${phase} phase of the canonical Harness workflow.`;
}
function commandFor(phase: Phase, spike: string): string[] {
  const prompt = promptFor(phase, spike);
  return phase.startsWith("evaluator-")
    ? ["claude", "-p", "--permission-mode", "manual", prompt]
    : ["codex", "exec", "--cd", repositoryRoot, prompt];
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
  mkdirSync(target.workflowPath, { recursive: true });
  writeState(target, {
    version: 1,
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
function dispatch(
  target: Target,
  spike: string,
  phase: Phase,
  execute: boolean,
): void {
  const state = readState(target);
  const attempt = attemptForDispatch(state, phase);
  canDispatch(state, phase, attempt);
  writeState(
    target,
    append(state, {
      event: "dispatch",
      phase,
      attempt,
      at: new Date().toISOString(),
    }),
  );
  const command = commandFor(phase, spike);
  if (!execute) {
    process.stdout.write(`${JSON.stringify(command)}\n`);
    return;
  }
  const logPath = resolve(
    target.workflowPath,
    `${phase}-${String(attempt)}.log`,
  );
  const log = openSync(logPath, "a");
  const [program, ...arguments_] = command;
  if (program === undefined) fail("Executor command is empty");
  const child = spawn(program, arguments_, {
    detached: true,
    stdio: ["ignore", log, log],
  });
  child.on("error", () => undefined);
  child.unref();
  if (child.pid === undefined) fail("Failed to launch executor");
  const job: Job = {
    pid: child.pid,
    command,
    logPath,
    launchedAt: new Date().toISOString(),
  };
  writeState(
    target,
    append(readState(target), {
      event: "job",
      phase,
      attempt,
      at: job.launchedAt,
      job,
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
  const attempts = state.records
    .filter((item) => item.phase === phase)
    .map((item) => item.attempt);
  const attempt = attempts.length === 0 ? 1 : Math.max(...attempts);
  if (
    !recordsFor(state, phase, attempt).some((item) => item.event === "dispatch")
  )
    fail(`Phase ${phase} has not been dispatched`);
  if (hasOutcome(state, phase, attempt))
    fail(`Phase ${phase} attempt ${String(attempt)} already has an outcome`);
  writeState(
    target,
    append(state, {
      event: "outcome",
      phase,
      attempt,
      at: new Date().toISOString(),
      outcome,
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
  const state = readState(target);
  const jobRecord = [...state.records]
    .reverse()
    .find((record) => record.phase === phase && record.job !== undefined);
  if (jobRecord?.job === undefined || !isLive(jobRecord.job.pid))
    fail(`No live job for ${phase}`);
  kill(jobRecord.job.pid, "SIGTERM");
}
function main(args: string[]): void {
  const [command, ...rest] = args;
  if (command === "init") {
    if (rest.length !== 1) fail("Usage: workflow init <spike>");
    init(targetFrom(rest[0]));
    return;
  }
  if (command === "status") {
    if (rest.length !== 1) fail("Usage: workflow status <spike>");
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
    dispatch(
      targetFrom(spike),
      spike,
      phaseFrom(phaseValue),
      option === "--execute",
    );
    return;
  }
  if (command === "record") {
    const [phaseValue, spike, outcome] = rest;
    if (rest.length !== 3)
      fail("Usage: workflow record <phase> <spike> <complete|blocked|failed>");
    record(targetFrom(spike), phaseFrom(phaseValue), outcome);
    return;
  }
  if (command === "cancel") {
    const [phaseValue, spike] = rest;
    if (rest.length !== 2) fail("Usage: workflow cancel <phase> <spike>");
    cancel(targetFrom(spike), phaseFrom(phaseValue));
    return;
  }
  fail("Usage: workflow <init|status|dispatch|record|cancel> ...");
}
try {
  main(process.argv.slice(2));
} catch (error: unknown) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
