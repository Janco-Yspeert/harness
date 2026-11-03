import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import {
  containedNodeTestLaunch,
  locateContainment,
  probeContainment,
} from "./executors/containment.ts";
import { contentId, identity, object } from "./kernel/ledger.ts";
import type {
  Data,
  LedgerEvent,
  Project,
  WorkflowGrant,
} from "./kernel/model.ts";

export const COMPLETION_DECLARATION = "completion-obligation.json";
export const COMPLETION_ARTIFACT = "completion-smoke.json";
export const COMPLETION_EVIDENCE_DESTINATION = "manifest.md";

export interface CompletionObligation {
  readonly schemaVersion: 1;
  readonly kind: "split-coding-smoke";
  readonly sourceWorkspace: string;
  readonly workflowWorkspace: string;
  readonly testTarget: string;
  readonly workingDirectory?: string;
  readonly evidenceDestination: "manifest.md";
}

export interface CompletionCheckFacts {
  readonly commit: string;
  readonly outcome:
    | "exited"
    | "spawn-error"
    | "timeout"
    | "signal"
    | "overflow";
  readonly exitCode: number | null;
  readonly signal: string | null;
  readonly timedOut: boolean;
  readonly outputOverflow: boolean;
  readonly outputIdentity: string;
}

export interface CompletionCheckResult {
  readonly satisfying: boolean;
  readonly reason: string | null;
  readonly baseline?: CompletionCheckFacts;
  readonly final?: CompletionCheckFacts;
}

export interface CompletionDeclarationRecord {
  readonly schemaVersion: 1;
  readonly workflow: string;
  readonly declaration: CompletionObligation;
  readonly path: "completion-obligation.json";
  readonly identity: string;
  readonly commit: string;
  readonly methodology: string;
  readonly trustedSequence: 8;
  readonly trustedRevision: string;
  readonly sourceOrigin: string;
  readonly workflowOrigin: string;
  readonly runtimeCommit?: string;
}

export interface CompletionAttemptRecord {
  readonly schemaVersion: 1;
  readonly key: string;
  readonly workflow: string;
  readonly declaration: string;
  readonly handoff: string;
  readonly execution: string;
  readonly candidate: string;
  readonly workflowCheckpoint: string;
  readonly satisfying: boolean;
  readonly reason: string | null;
  readonly checks?: CompletionCheckResult;
}

export interface CompletionSuccessRecord {
  readonly schemaVersion: 1;
  readonly kind: "split-coding-smoke";
  readonly workflow: string;
  readonly declaration: string;
  readonly handoff: string;
  readonly execution: string;
  readonly candidate: string;
  readonly baseline: string;
  readonly workflowEvidenceCommit: string;
  readonly methodology: string;
  readonly trustedSequence: 8;
  readonly trustedRevision: string;
  readonly runtimeCommit?: string;
  readonly roleGrant: string;
  readonly workflowGrant: string;
  readonly evidenceAction: string;
  readonly providerProvenance: "production" | "adapter-double";
  readonly checks: CompletionCheckResult;
}

export type CompletionRunner = (input: {
  readonly repository: string;
  readonly baseline: string;
  readonly candidate: string;
  readonly declaration: CompletionObligation;
  readonly excludedRoots: readonly string[];
}) => CompletionCheckResult;

function repositoryPath(value: unknown, field: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    isAbsolute(value) ||
    value
      .split("/")
      .some((part) => ["", ".", "..", ".git"].includes(part.toLowerCase()))
  )
    throw new Error(`completion obligation has unsafe ${field}`);
  return value;
}

export function parseCompletionObligation(
  bytes: Buffer | string,
  project: Project,
): CompletionObligation {
  if (!project.workflowWorkspace || project.workflowWorkspace === "repository")
    throw new Error("completion obligation requires a split workflow project");
  let raw: Data;
  try {
    raw = object(
      JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString("utf8") : bytes),
    );
  } catch {
    throw new Error("completion obligation is malformed JSON");
  }
  const allowed = new Set([
    "schemaVersion",
    "kind",
    "sourceWorkspace",
    "workflowWorkspace",
    "testTarget",
    "workingDirectory",
    "evidenceDestination",
  ]);
  if (Object.keys(raw).some((key) => !allowed.has(key)))
    throw new Error("completion obligation contains an unknown field");
  const source = project.workspaces.repository;
  const workflow = project.workspaces[project.workflowWorkspace];
  if (
    !source ||
    !workflow ||
    raw.schemaVersion !== 1 ||
    raw.kind !== "split-coding-smoke" ||
    raw.sourceWorkspace !== source?.id ||
    raw.workflowWorkspace !== workflow?.id ||
    raw.evidenceDestination !== COMPLETION_EVIDENCE_DESTINATION
  )
    throw new Error(
      "completion obligation does not match the configured workflow",
    );
  const testTarget = repositoryPath(raw.testTarget, "testTarget");
  if (!/\.(?:c|m)?js$/i.test(testTarget))
    throw new Error("completion obligation testTarget is not a Node test file");
  const workingDirectory =
    raw.workingDirectory === undefined
      ? undefined
      : repositoryPath(raw.workingDirectory, "workingDirectory");
  return {
    schemaVersion: 1,
    kind: "split-coding-smoke",
    sourceWorkspace: source.id,
    workflowWorkspace: workflow.id,
    testTarget,
    ...(workingDirectory ? { workingDirectory } : {}),
    evidenceDestination: COMPLETION_EVIDENCE_DESTINATION,
  };
}

export function assertCommittedTestTarget(
  repository: string,
  commit: string,
  declaration: CompletionObligation,
): void {
  const path = declaration.testTarget;
  const mode = spawnSync("git", ["ls-tree", commit, "--", path], {
    cwd: repository,
    encoding: "utf8",
  });
  if (mode.status !== 0 || !/^100644 blob [a-f0-9]+\t/m.test(mode.stdout ?? ""))
    throw new Error(
      "completion obligation testTarget is not a committed regular file",
    );
}

function digestOutput(
  stdout: Buffer | string | null,
  stderr: Buffer | string | null,
): string {
  const hash = createHash("sha256");
  hash.update(Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout ?? ""));
  hash.update(Buffer.from([0]));
  hash.update(Buffer.isBuffer(stderr) ? stderr : Buffer.from(stderr ?? ""));
  return `sha256:${hash.digest("hex")}`;
}

function runOne(
  repository: string,
  commit: string,
  declaration: CompletionObligation,
  bwrap: string,
): CompletionCheckFacts {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "harness-completion-smoke-")),
  );
  const checkout = join(root, "source");
  try {
    const added = spawnSync(
      "git",
      ["worktree", "add", "--detach", "--quiet", checkout, commit],
      {
        cwd: repository,
        encoding: "utf8",
      },
    );
    if (added.status !== 0) throw new Error("completion checkout failed");
    const cwd = declaration.workingDirectory
      ? resolve(checkout, declaration.workingDirectory)
      : checkout;
    const target = resolve(checkout, declaration.testTarget);
    const delta = relative(checkout, target);
    if (
      delta === "" ||
      delta === ".." ||
      delta.startsWith("../") ||
      isAbsolute(delta) ||
      !existsSync(target) ||
      !lstatSync(target).isFile()
    )
      throw new Error("completion check target escaped its checkout");
    mkdirSync(join(root, "scratch"));
    const launch = containedNodeTestLaunch({
      bwrap,
      checkout,
      scratch: join(root, "scratch"),
      cwd,
      target,
      nodePath: process.execPath,
    });
    const result = spawnSync(launch.program, launch.args, {
      env: launch.env,
      encoding: null,
      timeout: 15_000,
      maxBuffer: 64 * 1024,
      stdio: "pipe",
    });
    const code = (result.error as NodeJS.ErrnoException | undefined)?.code;
    const timedOut = code === "ETIMEDOUT";
    const outputOverflow = code === "ENOBUFS";
    return {
      commit,
      outcome: timedOut
        ? "timeout"
        : outputOverflow
          ? "overflow"
          : result.signal
            ? "signal"
            : result.error
              ? "spawn-error"
              : "exited",
      exitCode: result.status,
      signal: result.signal,
      timedOut,
      outputOverflow,
      outputIdentity: digestOutput(result.stdout, result.stderr),
    };
  } finally {
    spawnSync("git", ["worktree", "remove", "--force", checkout], {
      cwd: repository,
      stdio: "ignore",
    });
    rmSync(root, { recursive: true, force: true });
  }
}

export function evaluateCompletionFacts(
  baseline: CompletionCheckFacts,
  final: CompletionCheckFacts,
): CompletionCheckResult {
  if (
    baseline.outcome !== "exited" ||
    baseline.exitCode !== 1 ||
    baseline.signal !== null ||
    baseline.timedOut ||
    baseline.outputOverflow
  )
    return {
      satisfying: false,
      reason:
        baseline.outcome === "exited"
          ? "baseline check did not exit 1"
          : `baseline check ended ${baseline.outcome}`,
      baseline,
    };
  if (
    final.outcome !== "exited" ||
    final.exitCode !== 0 ||
    final.signal !== null ||
    final.timedOut ||
    final.outputOverflow
  )
    return {
      satisfying: false,
      reason:
        final.outcome === "exited"
          ? "final check did not exit 0"
          : `final check ended ${final.outcome}`,
      baseline,
      final,
    };
  return { satisfying: true, reason: null, baseline, final };
}

export const runCompletionChecks: CompletionRunner = (input) => {
  try {
    assertCommittedTestTarget(
      input.repository,
      input.baseline,
      input.declaration,
    );
    assertCommittedTestTarget(
      input.repository,
      input.candidate,
      input.declaration,
    );
    const located = locateContainment([
      input.repository,
      ...input.excludedRoots,
    ]);
    if (!located.ok) return { satisfying: false, reason: located.reason };
    probeContainment(located.path);
    const baseline = runOne(
      input.repository,
      input.baseline,
      input.declaration,
      located.path,
    );
    const final = runOne(
      input.repository,
      input.candidate,
      input.declaration,
      located.path,
    );
    return evaluateCompletionFacts(baseline, final);
  } catch (error) {
    return { satisfying: false, reason: (error as Error).message };
  }
};

export function sequenceEight(grant: WorkflowGrant): boolean {
  return grant.source?.trusted.sequence === 8;
}

export function declarationRecord(
  events: readonly LedgerEvent[],
): CompletionDeclarationRecord | undefined {
  return events.findLast(
    (event) => event.transition === "completion-obligation-declared",
  )?.evidence as unknown as CompletionDeclarationRecord | undefined;
}

export function currentCompletionRecord(
  events: readonly LedgerEvent[],
): LedgerEvent | undefined {
  const declaration = declarationRecord(events);
  const handoff = events.findLast(
    (event) => event.transition === "implementation-handoff",
  );
  if (!declaration || !handoff) return undefined;
  return events.findLast(
    (event) =>
      event.transition === "completion-smoke-recorded" &&
      event.evidence.declaration === declaration.identity &&
      event.evidence.handoff === handoff.id &&
      event.evidence.candidate === handoff.evidence.commit &&
      event.evidence.workflowEvidenceCommit ===
        (
          handoff.evidence.repositories as
            | { workflow?: { commit?: string } }
            | undefined
        )
          ?.workflow?.commit,
  );
}

export function validatedCurrentCompletionRecord(
  project: Project,
  workflow: string,
  events: readonly LedgerEvent[],
  expected?: {
    sourceCommit: string;
    workflowCommit: string;
    methodology: string;
    trustedRevision?: string;
    runtimeCommit?: string;
  },
): LedgerEvent | undefined {
  const declaration = declarationRecord(events);
  const handoff = events.findLast(
    (candidate) => candidate.transition === "implementation-handoff",
  );
  const event = currentCompletionRecord(events);
  if (
    !declaration ||
    !handoff ||
    !event ||
    event.evidence.schemaVersion !== 1 ||
    declaration.sourceOrigin !== project.origin ||
    declaration.workflowOrigin !== project.workflowOrigin
  )
    return undefined;
  const config = project.workflows[workflow];
  const docsKey = project.workflowWorkspace;
  const docs = docsKey ? project.workspaces[docsKey] : undefined;
  const binding = event.evidence.artifactBinding as
    | {
        workspace?: string;
        repository?: string;
        origin?: string;
        commit?: string;
        path?: string;
        sha256?: string;
      }
    | undefined;
  if (
    !config ||
    !docs ||
    binding?.workspace !== "workflow" ||
    binding.repository !== docs.id ||
    binding.origin !== project.workflowOrigin ||
    binding.commit !== event.evidence.artifactCommit ||
    binding.path !== `${config.directory}/${COMPLETION_ARTIFACT}` ||
    binding.sha256 !== event.evidence.identity ||
    event.evidence.path !== COMPLETION_ARTIFACT ||
    typeof binding.commit !== "string" ||
    typeof binding.sha256 !== "string"
  )
    return undefined;
  const shown = spawnSync(
    "git",
    ["show", `${binding.commit}:${binding.path}`],
    { cwd: docs.path, encoding: null },
  );
  const bytes = shown.stdout;
  if (shown.status !== 0) return undefined;
  if (!Buffer.isBuffer(bytes) || identity(bytes) !== binding.sha256)
    return undefined;
  let document: Data;
  try {
    document = object(JSON.parse(bytes.toString("utf8")));
  } catch {
    return undefined;
  }
  const recordIdentity = event.evidence.recordIdentity;
  if (
    typeof recordIdentity !== "string" ||
    contentId(document) !== recordIdentity ||
    document.workflow !== workflow ||
    document.declaration !== event.evidence.declaration ||
    document.handoff !== event.evidence.handoff ||
    document.candidate !== event.evidence.candidate ||
    document.workflowEvidenceCommit !== event.evidence.workflowEvidenceCommit ||
    document.trustedSequence !== 8 ||
    document.methodology !== declaration.methodology ||
    document.trustedRevision !== declaration.trustedRevision ||
    document.runtimeCommit !== declaration.runtimeCommit
  )
    return undefined;
  const declarationShown = spawnSync(
    "git",
    [
      "show",
      `${declaration.commit}:${config.directory}/${COMPLETION_DECLARATION}`,
    ],
    { cwd: docs.path, encoding: null },
  );
  if (
    declarationShown.status !== 0 ||
    !Buffer.isBuffer(declarationShown.stdout) ||
    identity(declarationShown.stdout) !== declaration.identity
  )
    return undefined;
  try {
    parseCompletionObligation(declarationShown.stdout, project);
  } catch {
    return undefined;
  }
  const repositories = handoff.evidence.repositories as
    | {
        source?: {
          workspace?: string;
          repository?: string;
          origin?: string;
          commit?: string;
        };
        workflow?: {
          workspace?: string;
          repository?: string;
          origin?: string;
          commit?: string;
        };
      }
    | undefined;
  const source = repositories?.source;
  const workflowBinding = repositories?.workflow;
  if (
    source?.workspace !== "repository" ||
    source.repository !== project.workspaces.repository?.id ||
    source.origin !== project.origin ||
    typeof source.commit !== "string" ||
    typeof document.candidate !== "string" ||
    source.commit !== document.candidate ||
    workflowBinding?.workspace !== "workflow" ||
    workflowBinding.repository !== docs.id ||
    workflowBinding.origin !== project.workflowOrigin ||
    typeof workflowBinding.commit !== "string" ||
    workflowBinding.commit !== document.workflowEvidenceCommit ||
    typeof document.baseline !== "string" ||
    document.baseline === source.commit
  )
    return undefined;
  const sourceAncestry = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", document.baseline, source.commit],
    { cwd: project.root, stdio: "pipe" },
  );
  const workflowAncestry = spawnSync(
    "git",
    [
      "merge-base",
      "--is-ancestor",
      workflowBinding.commit,
      binding.commit,
    ],
    { cwd: docs.path, stdio: "pipe" },
  );
  if (sourceAncestry.status !== 0 || workflowAncestry.status !== 0)
    return undefined;
  const sourceHead = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: project.root,
    encoding: "utf8",
  });
  if (sourceHead.status !== 0 || sourceHead.stdout.trim() !== source.commit)
    return undefined;
  if (
    expected &&
    (expected.sourceCommit !== source.commit ||
      expected.workflowCommit !== binding.commit ||
      expected.methodology !== document.methodology ||
      expected.trustedRevision !== document.trustedRevision ||
      expected.runtimeCommit !== document.runtimeCommit)
  )
    return undefined;
  if (!expected) {
    const workflowHead = spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: docs.path,
      encoding: "utf8",
    });
    if (
      workflowHead.status !== 0 ||
      workflowHead.stdout.trim() !== binding.commit
    )
      return undefined;
  }
  return event;
}

export function outcomeAllocationPermitted(
  events: readonly LedgerEvent[],
  project?: Project,
  workflow?: string,
  expected?: Parameters<typeof validatedCurrentCompletionRecord>[3],
): boolean {
  if (!declarationRecord(events)) return true;
  if (
    project &&
    workflow
      ? validatedCurrentCompletionRecord(project, workflow, events, expected)
      : currentCompletionRecord(events)
  )
    return true;
  return (
    events.some(
      (event) => event.transition === "process-exception-authorized",
    ) &&
    events.some(
      (event) => event.transition === "process-exception-evidence-recorded",
    )
  );
}
