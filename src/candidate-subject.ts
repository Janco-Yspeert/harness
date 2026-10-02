// Non-authoritative execution of an exact committed candidate evaluator.
//
// This boundary deliberately does not depend on ExecutionKernel. Candidate
// results, actions and human requests are observations captured by the relay;
// none can become workflow authority.
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

import { containedLaunch } from "./executors/containment.ts";
import {
  parseWorkerRequest,
  WORKER_PROTOCOL_VERSION,
  type WorkerRequest,
} from "./executors/protocol.ts";
import {
  canonical,
  contentId,
  identity,
  matches,
  object,
  text,
} from "./kernel/ledger.ts";
import type {
  RoleContract,
  RolePolicy,
  WorkflowPolicy,
} from "./kernel/model.ts";

export const SUBJECT_ROLE = "evaluator-verify" as const;
const STREAM_MAXIMUM = 1_048_576;
const ALLOWED_CAPABILITIES = new Set([
  "repository-read",
  "repository-write",
  "local-computation",
  "git-inspect",
  "git-commit",
]);

export type SubjectStatus =
  | "prepared"
  | "running"
  | "completed"
  | "infrastructure-failed"
  | "evidence-incomplete"
  | "evidence-sealed";

export interface CandidateComposition {
  readonly candidate: string;
  readonly projectPrefix: string;
  readonly methodology: string;
  readonly role: typeof SUBJECT_ROLE;
  readonly policy: RolePolicy;
  readonly contract: RoleContract;
  readonly contractIdentity: string;
  readonly skill: {
    readonly path: string;
    readonly identity: string;
    readonly content: string;
  };
  readonly capabilities: readonly string[];
  readonly hostActions: readonly string[];
  readonly workspaces: ReadonlyArray<{
    readonly id: "repository" | "evaluation";
    readonly mode: "read" | "write";
    readonly exposure: "public" | "evaluator-private";
  }>;
  readonly executorConstraints: { readonly protected: boolean };
}

export interface SubjectRecord {
  readonly schemaVersion: 1;
  readonly authority: "non-authoritative";
  readonly execution: string;
  readonly candidate: string;
  readonly methodology: string;
  status: SubjectStatus;
  subjectOutcome?: "succeeded" | "failed";
  process?: {
    readonly exitCode: number | null;
    readonly signal: string | null;
  };
  semanticResult?: {
    readonly disposition: string;
    readonly methodology: Record<string, string>;
  };
  bundleIdentity?: string;
  failure?: string;
}

export interface SubjectPaths {
  readonly parent: string;
  readonly repository: string;
  readonly evaluation: string;
  readonly scratch: string;
  readonly forbidden: string;
  readonly evidence: string;
}

export interface RunSubjectInput {
  readonly candidateRepository: string;
  readonly candidateCommit: string;
  readonly candidateProjectPrefix?: string;
  readonly candidateMethodology: string;
  readonly expectedSkillIdentity: string;
  readonly expectedContractIdentity: string;
  readonly fixtureRoot: string;
  readonly fixtureTreeIdentity: string;
  readonly runnerBlobIdentity: string;
  readonly runtimeCommit: string;
  readonly bwrap: string;
  readonly outputRoot?: string;
  readonly execution?: string;
  readonly captureMaximum?: number;
  readonly placeholderExitCode?: number;
}

interface EvidenceArtifact {
  readonly path: string;
  readonly type: string;
  readonly bytes: number;
  readonly identity: string;
}

export interface SubjectManifest {
  readonly schemaVersion: 1;
  readonly authority: "non-authoritative";
  readonly subjectExecution: string;
  readonly candidate: string;
  readonly candidateMethodology: string;
  readonly composition: {
    readonly role: typeof SUBJECT_ROLE;
    readonly skill: string;
    readonly contract: string;
    readonly capabilities: readonly string[];
    readonly hostActions: readonly string[];
    readonly workspaces: CandidateComposition["workspaces"];
  };
  readonly runtimeCommit: string;
  readonly fixture: { readonly tree: string; readonly runner: string };
  readonly provider: {
    readonly id: "placeholder";
    readonly profile: "deterministic";
  };
  readonly providerAttestation: { readonly status: "unavailable" };
  readonly streams: {
    readonly stdout: StreamEvidence;
    readonly stderr: StreamEvidence;
  };
  readonly artifacts: readonly EvidenceArtifact[];
}

interface StreamEvidence extends EvidenceArtifact {
  readonly maximum: number;
  readonly closed: boolean;
  readonly truncated: boolean;
}

function git(
  repository: string,
  args: readonly string[],
  encoding: BufferEncoding | "buffer" = "utf8",
): string | Buffer {
  try {
    return execFileSync("git", [...args], {
      cwd: repository,
      encoding: encoding === "buffer" ? null : encoding,
      stdio: "pipe",
    });
  } catch (error) {
    // Some confined hosts report EPERM after a successful, fully captured Git
    // child. Treat only an explicit zero status with captured stdout as the
    // completed operation; every real Git failure still propagates.
    const completed = error as { status?: unknown; stdout?: unknown };
    if (completed.status === 0) {
      if (encoding === "buffer" && Buffer.isBuffer(completed.stdout))
        return completed.stdout;
      if (typeof completed.stdout === "string") return completed.stdout;
    }
    throw error;
  }
}

function exactCommit(repository: string, requested: string): string {
  if (!/^[a-f0-9]{40}$/.test(requested))
    throw new Error("candidate must be an exact 40-hex committed revision");
  const resolved = String(
    git(repository, ["rev-parse", "--verify", `${requested}^{commit}`]),
  ).trim();
  if (resolved !== requested) throw new Error("candidate revision mismatch");
  return resolved;
}

function safeRelative(path: string): string {
  if (
    !path ||
    isAbsolute(path) ||
    path.split("/").some((part) => part === "" || part === "..")
  )
    throw new Error(`unsafe relative path: ${path}`);
  return path;
}

function committedText(
  repository: string,
  commit: string,
  path: string,
): string {
  return String(git(repository, ["show", `${commit}:${safeRelative(path)}`]));
}

function hostActions(contract: RoleContract): string[] {
  return [
    ...(contract.evidence ? ["evidence"] : []),
    ...(contract.promotion ? ["promotion"] : []),
    ...(contract.publication ? ["publication"] : []),
  ];
}

export function inspectCandidateMethodology(input: {
  readonly repository: string;
  readonly commit: string;
  readonly projectPrefix?: string;
}): {
  readonly candidate: string;
  readonly projectPrefix: string;
  readonly methodology: string;
  readonly policy: WorkflowPolicy;
  readonly roles: Record<
    string,
    {
      readonly policy: RolePolicy;
      readonly contract: RoleContract;
      readonly contractIdentity: string;
      readonly skill: {
        readonly path: string;
        readonly identity: string;
        readonly content: string;
      };
    }
  >;
} {
  const candidate = exactCommit(input.repository, input.commit);
  const projectPrefix = input.projectPrefix
    ? safeRelative(input.projectPrefix)
    : "";
  const located = (path: string): string =>
    projectPrefix ? `${projectPrefix}/${safeRelative(path)}` : path;
  const project = object(
    JSON.parse(
      committedText(
        input.repository,
        candidate,
        located("harness.project.json"),
      ),
    ),
  );
  const policyPath = text(project.policy);
  const policy = JSON.parse(
    committedText(input.repository, candidate, located(policyPath)),
  ) as WorkflowPolicy;
  const roles: ReturnType<typeof inspectCandidateMethodology>["roles"] = {};
  const manifestRoles: Record<string, unknown> = {};
  for (const [name, role] of Object.entries(policy.roles)) {
    const contractBytes = committedText(
      input.repository,
      candidate,
      located(role.contract),
    );
    const contract = JSON.parse(contractBytes) as RoleContract;
    const skillContent = committedText(
      input.repository,
      candidate,
      located(role.skill),
    );
    const contractIdentity = contentId(contract);
    const skill = {
      path: role.skill,
      identity: identity(skillContent),
      content: skillContent,
    };
    roles[name] = { policy: role, contract, contractIdentity, skill };
    manifestRoles[name] = {
      contract: {
        path: role.contract,
        identity: contractIdentity,
        content: contract,
      },
      skill,
    };
  }
  const manifestCore = {
    schemaVersion: 1,
    capabilityVocabulary: {
      schemaVersion: 1,
      values: [
        "repository-read",
        "repository-write",
        "local-computation",
        "git-inspect",
        "git-commit",
      ],
    },
    policy: { path: policyPath, identity: contentId(policy), content: policy },
    roles: manifestRoles,
    validators: {},
  };
  return {
    candidate,
    projectPrefix,
    methodology: contentId(manifestCore),
    policy,
    roles,
  };
}

export function reconstructCandidateEvaluator(input: {
  readonly repository: string;
  readonly commit: string;
  readonly methodology: string;
  readonly skillIdentity: string;
  readonly contractIdentity: string;
  readonly projectPrefix?: string;
  readonly role?: string;
}): CandidateComposition {
  if ((input.role ?? SUBJECT_ROLE) !== SUBJECT_ROLE)
    throw new Error(
      "candidate subject authorization is restricted to evaluator-verify",
    );
  const inspected = inspectCandidateMethodology({
    repository: input.repository,
    commit: input.commit,
    ...(input.projectPrefix ? { projectPrefix: input.projectPrefix } : {}),
  });
  if (inspected.methodology !== input.methodology)
    throw new Error("candidate methodology identity mismatch");
  const role = inspected.policy.roles[SUBJECT_ROLE];
  if (!role) throw new Error("candidate evaluator-verify role is missing");
  const exactRole = inspected.roles[SUBJECT_ROLE];
  if (!exactRole) throw new Error("candidate evaluator composition is missing");
  if (exactRole.skill.identity !== input.skillIdentity)
    throw new Error("candidate skill identity mismatch");
  if (exactRole.contractIdentity !== input.contractIdentity)
    throw new Error("candidate contract identity mismatch");
  const contract = exactRole.contract;
  if (
    !contract.workspaces.includes("repository") ||
    !contract.workspaces.includes("evaluation")
  )
    throw new Error("candidate workspace composition is unsupported");
  if (
    contract.workspaces.some(
      (workspace) => workspace !== "repository" && workspace !== "evaluation",
    )
  )
    throw new Error("candidate workspace composition is unsupported");
  if (
    contract.capabilities.some(
      (capability) => !ALLOWED_CAPABILITIES.has(capability),
    )
  )
    throw new Error("candidate authority cannot be represented by this host");
  return {
    candidate: inspected.candidate,
    projectPrefix: inspected.projectPrefix,
    methodology: inspected.methodology,
    role: SUBJECT_ROLE,
    policy: role,
    contract,
    contractIdentity: exactRole.contractIdentity,
    skill: exactRole.skill,
    capabilities: [...contract.capabilities],
    hostActions: hostActions(contract),
    workspaces: [
      {
        id: "repository",
        mode: contract.capabilities.includes("repository-write")
          ? "write"
          : "read",
        exposure: "public",
      },
      { id: "evaluation", mode: "write", exposure: "evaluator-private" },
    ],
    executorConstraints: { protected: contract.protected },
  };
}

function legalResult(
  composition: CandidateComposition,
  request: Extract<WorkerRequest, { operation: "submitResult" }>,
): void {
  const { contract, policy } = composition;
  if (!contract.results.includes(request.disposition))
    throw new Error("result violates candidate contract");
  if (
    !Object.entries(request.methodology).every(([key, value]) =>
      contract.methodology[key]?.includes(value),
    )
  )
    throw new Error("result violates candidate contract");
  for (const constraint of contract.resultConstraints ?? [])
    if (
      matches(request.methodology, constraint.when) &&
      (!(constraint.required ?? []).every(
        (field) => field in request.methodology,
      ) ||
        (constraint.absent ?? []).some((field) => field in request.methodology))
    )
      throw new Error("result violates candidate constraints");
  if (
    !policy.outcomes.some(
      (outcome) =>
        outcome.disposition === request.disposition &&
        matches(request.methodology, outcome.methodology ?? {}),
    )
  )
    throw new Error("result is not a candidate terminal outcome");
}

function inside(root: string, path: string): string {
  const target = resolve(root, path);
  const delta = relative(root, target);
  if (
    delta === "" ||
    delta === ".." ||
    delta.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
    isAbsolute(delta)
  )
    throw new Error("path escapes disposable subject root");
  return target;
}

export class CandidateSubjectRelay {
  readonly exchanges: Array<{
    sequence: number;
    request: WorkerRequest;
    response: unknown;
  }> = [];
  readonly execution: string;
  readonly composition: CandidateComposition;
  readonly paths: Pick<SubjectPaths, "repository" | "evaluation">;
  readonly inputs: Readonly<Record<string, string>>;
  semanticResult?: { disposition: string; methodology: Record<string, string> };
  #sequence = 0;

  constructor(
    execution: string,
    composition: CandidateComposition,
    paths: Pick<SubjectPaths, "repository" | "evaluation">,
    inputs: Readonly<Record<string, string>>,
  ) {
    this.execution = execution;
    this.composition = composition;
    this.paths = paths;
    this.inputs = inputs;
  }

  handle(operation: string, value: unknown): unknown {
    const request = parseWorkerRequest(operation, value);
    try {
      const response = this.#respond(request);
      this.exchanges.push({ sequence: ++this.#sequence, request, response });
      return response;
    } catch (error) {
      const response = {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        status: "rejected",
        error: (error as Error).message,
      };
      this.exchanges.push({ sequence: ++this.#sequence, request, response });
      throw error;
    }
  }

  #respond(request: WorkerRequest): unknown {
    if (request.operation === "assignment")
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        execution: this.execution,
        authority: "non-authoritative",
        role: SUBJECT_ROLE,
        candidate: this.composition.candidate,
        methodology: this.composition.methodology,
        skill: this.composition.skill,
        contract: this.composition.contract,
        contractIdentity: this.composition.contractIdentity,
        capabilities: this.composition.capabilities,
        hostActions: this.composition.hostActions,
        workspaces: this.composition.workspaces,
        inputs: this.inputs,
      };
    if (request.operation === "submitResult") {
      legalResult(this.composition, request);
      this.semanticResult = {
        disposition: request.disposition,
        methodology: { ...request.methodology },
      };
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        observation: { status: "recorded", authoritative: false },
      };
    }
    if (request.operation === "requestHuman")
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        request: { status: "unavailable", authoritative: false },
        response: null,
      };
    if (request.kind !== "evidence")
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        action: {
          status: "denied",
          reason: "authoritative host action unavailable to candidate subject",
        },
      };
    if (!this.composition.hostActions.includes("evidence"))
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        action: { status: "denied", reason: "action not granted" },
      };
    const evidence = this.composition.contract.evidence;
    if (!evidence)
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        action: { status: "denied", reason: "action not granted" },
      };
    const root =
      evidence.workspace === "repository"
        ? this.paths.repository
        : evidence.workspace === "evaluation"
          ? this.paths.evaluation
          : undefined;
    if (!root)
      return {
        protocolVersion: WORKER_PROTOCOL_VERSION,
        action: { status: "denied", reason: "workspace unavailable" },
      };
    for (const file of request.files) {
      const destination = safeRelative(file.destination);
      const allowed = evidence.destinations.some((entry) =>
        entry.endsWith("/")
          ? destination.startsWith(entry)
          : destination === entry,
      );
      if (!allowed)
        return {
          protocolVersion: WORKER_PROTOCOL_VERSION,
          action: { status: "denied", reason: "destination unavailable" },
        };
    }
    for (const file of request.files) {
      const target = inside(root, file.destination);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, file.content);
    }
    return {
      protocolVersion: WORKER_PROTOCOL_VERSION,
      action: { status: "succeeded", scope: "disposable-subject" },
    };
  }
}

export class SubjectLifecycle {
  readonly record: SubjectRecord;
  constructor(execution: string, composition: CandidateComposition) {
    this.record = {
      schemaVersion: 1,
      authority: "non-authoritative",
      execution,
      candidate: composition.candidate,
      methodology: composition.methodology,
      status: "prepared",
    };
  }
  running(): void {
    if (this.record.status !== "prepared")
      throw new Error("invalid subject lifecycle transition");
    this.record.status = "running";
  }
  completed(
    exitCode: number | null,
    signal: string | null,
    semanticResult?: SubjectRecord["semanticResult"],
  ): void {
    if (this.record.status !== "running")
      throw new Error("invalid subject lifecycle transition");
    this.record.status = "completed";
    this.record.process = { exitCode, signal };
    this.record.subjectOutcome =
      exitCode === 0 && semanticResult ? "succeeded" : "failed";
    if (semanticResult) this.record.semanticResult = semanticResult;
  }
  infrastructureFailed(message: string): void {
    if (this.record.status !== "prepared" && this.record.status !== "running")
      throw new Error("invalid subject lifecycle transition");
    this.record.status = "infrastructure-failed";
    this.record.failure = message;
  }
  evidenceIncomplete(message: string): void {
    if (this.record.status !== "completed")
      throw new Error("invalid subject lifecycle transition");
    this.record.status = "evidence-incomplete";
    this.record.failure = message;
  }
  sealed(bundleIdentity: string): void {
    if (this.record.status !== "completed")
      throw new Error("invalid subject lifecycle transition");
    this.record.status = "evidence-sealed";
    this.record.bundleIdentity = bundleIdentity;
  }
}

function exportCommit(
  repository: string,
  commit: string,
  destination: string,
  prefix: string,
): void {
  mkdirSync(destination, { recursive: true });
  const args = [
    "ls-tree",
    "-r",
    "--name-only",
    commit,
    ...(prefix ? ["--", prefix] : []),
  ];
  const files = String(git(repository, args))
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const source of files) {
    const file = prefix
      ? relative(prefix, source).split("\\").join("/")
      : source;
    const target = inside(destination, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(
      target,
      git(repository, ["show", `${commit}:${source}`], "buffer"),
    );
    const mode = String(git(repository, ["ls-tree", commit, source])).split(
      " ",
    )[0];
    if (mode === "100755") chmodSync(target, 0o755);
  }
}

function byteArtifact(
  root: string,
  path: string,
  type: string,
): EvidenceArtifact {
  const bytes = readFileSync(join(root, path));
  return { path, type, bytes: bytes.length, identity: identity(bytes) };
}

function writeEvidence(
  root: string,
  path: string,
  content: string | Buffer,
): EvidenceArtifact {
  const target = inside(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return byteArtifact(
    root,
    path,
    path.endsWith(".json")
      ? "application/json"
      : path.endsWith(".jsonl")
        ? "application/jsonl"
        : "application/octet-stream",
  );
}

function capped(
  bytes: Buffer,
  maximum: number,
): { bytes: Buffer; truncated: boolean } {
  return bytes.length > maximum
    ? { bytes: bytes.subarray(0, maximum), truncated: true }
    : { bytes, truncated: false };
}

function snapshot(paths: SubjectPaths): Record<string, unknown> {
  const targets = [
    "forbidden/harness-sentinel.txt",
    "repository/probe-repository-write.txt",
    "evaluation/probe-evaluation-write.txt",
  ];
  return Object.fromEntries(
    targets.map((target) => {
      const root = target.startsWith("forbidden/")
        ? paths.forbidden
        : target.startsWith("repository/")
          ? paths.repository
          : paths.evaluation;
      const local = target.slice(target.indexOf("/") + 1);
      const file = join(root, local);
      return [
        target,
        existsSync(file)
          ? { state: "present", identity: identity(readFileSync(file)) }
          : { state: "absent" },
      ];
    }),
  );
}

function createPaths(outputRoot?: string): SubjectPaths {
  const parent = realpathSync(mkdtempSync(join(tmpdir(), "harness-subject-")));
  const repository = join(parent, "repository");
  const evaluation = join(parent, "evaluation");
  const scratch = join(parent, "scratch");
  const forbidden = join(parent, "forbidden");
  for (const path of [repository, evaluation, scratch, forbidden])
    mkdirSync(path);
  const evidenceParent = outputRoot
    ? resolve(outputRoot)
    : realpathSync(mkdtempSync(join(tmpdir(), "harness-subject-evidence-")));
  mkdirSync(evidenceParent, { recursive: true });
  const evidence = join(evidenceParent, "bundle");
  if (
    relative(parent, evidence) === "" ||
    !relative(parent, evidence).startsWith("..")
  )
    throw new Error("evidence root overlaps disposable subject roots");
  mkdirSync(evidence);
  return { parent, repository, evaluation, scratch, forbidden, evidence };
}

export function validateSubjectBundle(root: string): SubjectManifest {
  const manifestPath = join(root, "manifest.json");
  if (!lstatSync(manifestPath).isFile())
    throw new Error("subject manifest is missing");
  const raw: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
  const shape = object(raw);
  if (shape.schemaVersion !== 1 || shape.authority !== "non-authoritative")
    throw new Error("invalid subject manifest");
  const manifest = raw as SubjectManifest;
  const bound = new Set(["manifest.json"]);
  for (const artifact of manifest.artifacts) {
    const path = safeRelative(artifact.path);
    if (bound.has(path)) throw new Error("duplicate subject artifact");
    bound.add(path);
    const target = inside(root, path);
    if (!existsSync(target) || !lstatSync(target).isFile())
      throw new Error(`subject artifact missing: ${path}`);
    const actual = byteArtifact(root, path, artifact.type);
    if (
      actual.bytes !== artifact.bytes ||
      actual.identity !== artifact.identity
    )
      throw new Error(`subject artifact changed: ${path}`);
  }
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink())
        throw new Error("subject bundle contains a symlink");
      if (stat.isDirectory()) visit(path);
      else {
        const local = relative(root, path).split("\\").join("/");
        if (!bound.has(local))
          throw new Error(`unbound subject artifact: ${local}`);
      }
    }
  };
  visit(root);
  for (const stream of [manifest.streams.stdout, manifest.streams.stderr]) {
    if (!stream.closed || stream.truncated || stream.bytes > stream.maximum)
      throw new Error("subject stream is incomplete");
    const artifact = manifest.artifacts.find(
      (item) => item.path === stream.path,
    );
    if (
      !artifact ||
      artifact.identity !== stream.identity ||
      artifact.bytes !== stream.bytes
    )
      throw new Error("subject stream binding mismatch");
  }
  return manifest;
}

export function publishSubjectEvidence(
  bundleRoot: string,
  destination: string,
): SubjectManifest {
  const manifest = validateSubjectBundle(bundleRoot);
  if (existsSync(destination))
    throw new Error("subject evidence destination already exists");
  cpSync(bundleRoot, destination, {
    recursive: true,
    dereference: false,
    errorOnExist: true,
  });
  validateSubjectBundle(destination);
  return manifest;
}

export function runCandidateEvaluatorSubject(input: RunSubjectInput): {
  readonly record: SubjectRecord;
  readonly paths: SubjectPaths;
  readonly manifest?: SubjectManifest;
} {
  const composition = reconstructCandidateEvaluator({
    repository: input.candidateRepository,
    commit: input.candidateCommit,
    methodology: input.candidateMethodology,
    skillIdentity: input.expectedSkillIdentity,
    contractIdentity: input.expectedContractIdentity,
    ...(input.candidateProjectPrefix
      ? { projectPrefix: input.candidateProjectPrefix }
      : {}),
  });
  const execution = input.execution ?? randomUUID();
  const lifecycle = new SubjectLifecycle(execution, composition);
  const paths = createPaths(input.outputRoot);
  try {
    exportCommit(
      input.candidateRepository,
      composition.candidate,
      paths.repository,
      composition.projectPrefix,
    );
    mkdirSync(join(paths.repository, "runner"), { recursive: true });
    mkdirSync(join(paths.repository, "inputs"), { recursive: true });
    copyFileSync(
      join(input.fixtureRoot, "runner", "run-probes.sh"),
      join(paths.repository, "runner", "run-probes.sh"),
    );
    copyFileSync(
      join(input.fixtureRoot, "inputs", "subject-input.txt"),
      join(paths.repository, "inputs", "subject-input.txt"),
    );
    copyFileSync(
      join(input.fixtureRoot, "forbidden", "harness-sentinel.txt"),
      join(paths.forbidden, "harness-sentinel.txt"),
    );
  } catch (error) {
    lifecycle.infrastructureFailed((error as Error).message);
    return { record: lifecycle.record, paths };
  }
  const before = snapshot(paths);
  const relay = new CandidateSubjectRelay(
    execution,
    composition,
    { repository: paths.repository, evaluation: paths.evaluation },
    {
      fixtureTree: input.fixtureTreeIdentity,
      runner: input.runnerBlobIdentity,
    },
  );
  relay.handle("assignment", {});
  let run;
  try {
    const launch = containedLaunch({
      bwrap: input.bwrap,
      provider: "codex",
      program: "/bin/sh",
      args: [join(paths.repository, "runner", "run-probes.sh"), paths.parent],
      cwd: paths.repository,
      workspaces: composition.workspaces.map((workspace) => ({
        path:
          workspace.id === "repository" ? paths.repository : paths.evaluation,
        mode: workspace.mode,
      })),
      scratch: paths.scratch,
      nodePath: process.execPath,
      toolFiles: [],
      masked: [],
      protectedRoots: [paths.evidence],
      env: { PATH: "/usr/bin:/bin", SUBJECT_PARENT: paths.parent },
      sourceEnv: { HOME: paths.scratch, PATH: process.env.PATH ?? "" },
    });
    lifecycle.running();
    run = spawnSync(launch.program, launch.args, {
      env: launch.env,
      encoding: null,
    });
  } catch (error) {
    lifecycle.infrastructureFailed((error as Error).message);
    return { record: lifecycle.record, paths };
  }
  const exitCode = input.placeholderExitCode ?? run.status;
  if (exitCode === 0)
    relay.handle("submitResult", {
      disposition: "succeeded",
      methodology: { result: "PASS" },
    });
  lifecycle.completed(exitCode, run.signal, relay.semanticResult);
  const maximum = input.captureMaximum ?? STREAM_MAXIMUM;
  const stdout = capped(run.stdout, maximum);
  const stderr = capped(run.stderr, maximum);
  const after = snapshot(paths);
  const artifacts: EvidenceArtifact[] = [];
  artifacts.push(writeEvidence(paths.evidence, "stdout.bin", stdout.bytes));
  artifacts.push(writeEvidence(paths.evidence, "stderr.bin", stderr.bytes));
  artifacts.push(
    writeEvidence(
      paths.evidence,
      "worker-tools.jsonl",
      `${relay.exchanges.map((entry) => canonical(entry)).join("\n")}\n`,
    ),
  );
  artifacts.push(
    writeEvidence(
      paths.evidence,
      "observations.json",
      `${canonical({ before, after })}\n`,
    ),
  );
  artifacts.push(
    writeEvidence(
      paths.evidence,
      "process.json",
      `${canonical({ exitCode, signal: run.signal, subjectOutcome: lifecycle.record.subjectOutcome })}\n`,
    ),
  );
  artifacts.push(
    writeEvidence(
      paths.evidence,
      "reconstruction.json",
      `${canonical(composition)}\n`,
    ),
  );
  artifacts.push(
    writeEvidence(
      paths.evidence,
      "containment.json",
      `${canonical({ filesystemIsolation: "bwrap", parent: "disposable", evidenceVisible: false })}\n`,
    ),
  );
  const stdoutArtifact = artifacts[0];
  const stderrArtifact = artifacts[1];
  if (!stdoutArtifact || !stderrArtifact)
    throw new Error("stream evidence missing");
  const manifest: SubjectManifest = {
    schemaVersion: 1,
    authority: "non-authoritative",
    subjectExecution: execution,
    candidate: composition.candidate,
    candidateMethodology: composition.methodology,
    composition: {
      role: composition.role,
      skill: composition.skill.identity,
      contract: composition.contractIdentity,
      capabilities: composition.capabilities,
      hostActions: composition.hostActions,
      workspaces: composition.workspaces,
    },
    runtimeCommit: input.runtimeCommit,
    fixture: {
      tree: input.fixtureTreeIdentity,
      runner: input.runnerBlobIdentity,
    },
    provider: { id: "placeholder", profile: "deterministic" },
    providerAttestation: { status: "unavailable" },
    streams: {
      stdout: {
        ...stdoutArtifact,
        maximum,
        closed: true,
        truncated: stdout.truncated,
      },
      stderr: {
        ...stderrArtifact,
        maximum,
        closed: true,
        truncated: stderr.truncated,
      },
    },
    artifacts,
  };
  writeFileSync(
    join(paths.evidence, "manifest.json"),
    `${canonical(manifest)}\n`,
  );
  try {
    validateSubjectBundle(paths.evidence);
  } catch (error) {
    lifecycle.evidenceIncomplete((error as Error).message);
    return { record: lifecycle.record, paths };
  }
  for (const artifact of artifacts)
    chmodSync(join(paths.evidence, artifact.path), 0o444);
  chmodSync(join(paths.evidence, "manifest.json"), 0o444);
  lifecycle.sealed(
    identity(readFileSync(join(paths.evidence, "manifest.json"))),
  );
  return { record: lifecycle.record, paths, manifest };
}

export function removeDisposableSubject(paths: SubjectPaths): void {
  rmSync(paths.parent, { recursive: true, force: true });
}
