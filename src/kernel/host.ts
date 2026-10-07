import { execFileSync, spawn } from "node:child_process";
import { timingSafeEqual } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  AdapterRefusal,
  locateProvider,
  planLaunch,
  registeredAdapter,
  type ProviderAdapter,
} from "../executors/adapters.ts";
import {
  inspectCandidateMethodology,
  publishSubjectEvidence,
  resolveFrozenEvaluatorProcedure,
  runCandidateEvaluatorSubject,
  type RunSubjectInput,
  type SubjectManifest,
  type SubjectPaths,
  type SubjectRecord,
} from "../candidate-subject.ts";
import {
  createPreparedObservationRecord,
  resolvePreparedObservation,
  sealPreparedObservationBundle,
  type PreparedObservationBindings,
  type PreparedObservationRecord,
} from "../candidate-observation.ts";
import {
  assertWorkspaces,
  locateContainment,
  probeContainment,
  probeNestedSandbox,
} from "../executors/containment.ts";
import {
  GovernedProviderRun,
  launchWorkspaces,
} from "../executors/governed.ts";
import { ExecutionKernel, type KernelOptions } from "./execution.ts";
import { identity, object, required, text } from "./ledger.ts";
import type {
  Data,
  DiagnosticCategory,
  Execution,
  HumanRequest,
  PromotionArtifact,
} from "./model.ts";
import {
  assertExternalProject,
  external,
  installedRuntimeRoot,
  runtimeCommit,
} from "./roots.ts";
import {
  assertTrustedMethodology,
  trustedBinding,
  trustedDefinition,
  type TrustOptions,
} from "./trust.ts";

// Programmatic-only seams for deterministic adapter tests (mocked provider
// discovery and event streams). The production entrypoint never sets them.
export interface ProviderRuntime {
  locate?: (
    program: string,
  ) => { ok: true; path: string } | { ok: false; reason: string };
  spawnProvider?: typeof spawn;
  humanWaitMs?: number;
  // The Harness checkout whose exact commit an external-project host binds as
  // its runtime. Defaults to the installed checkout this code runs from.
  runtimeRoot?: string;
  // Containment program override (deterministic refusal tests only).
  bwrap?: string;
}
export interface GovernedHostOptions extends Omit<
  KernelOptions,
  "methodologyGate" | "methodologySource"
> {
  rootToken: string;
  providerRuntime?: ProviderRuntime;
}
class HostRefusal extends Error {
  readonly category: DiagnosticCategory;
  constructor(category: DiagnosticCategory, message: string) {
    super(message);
    this.category = category;
  }
}
function gitBytes(root: string, args: readonly string[]): Buffer {
  try {
    return execFileSync("git", [...args], {
      cwd: root,
      encoding: null,
      stdio: "pipe",
    });
  } catch (error) {
    const completed = error as { status?: unknown; stdout?: unknown };
    if (completed.status === 0 && Buffer.isBuffer(completed.stdout))
      return completed.stdout;
    throw error;
  }
}
export class GovernedHost {
  readonly kernel: ExecutionKernel;
  readonly #rootToken: string;
  readonly #runtime: ProviderRuntime;
  readonly #children = new Map<string, () => void>();
  #external:
    | {
        projectRepository: string;
        methodologyRepository: string;
        runtimeRoot: string;
        runtime: { repository: string; commit: string };
      }
    | undefined;
  #closed = false;
  constructor(options: GovernedHostOptions) {
    if (options.rootToken.length < 32)
      throw new Error(
        "governed host requires a root credential of at least 32 characters",
      );
    this.#rootToken = options.rootToken;
    this.#runtime = options.providerRuntime ?? {};
    const project = options.project;
    // An external project (distinct methodology root) is checked fail-closed
    // at host start: real roots, workspaces, remotes, origin identity, a
    // clean committed Harness runtime, and the methodology commit whose
    // committed trusted history this host binds for its whole lifetime.
    let trust: TrustOptions = {};
    if (external(project)) {
      const roots = assertExternalProject(
        project,
        options.privateDataRoot
          ? { privateDataRoot: options.privateDataRoot }
          : {},
      );
      const runtimeRoot = this.#runtime.runtimeRoot ?? installedRuntimeRoot();
      const runtime = runtimeCommit(runtimeRoot);
      const pin = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: roots.methodologyRepository,
        encoding: "utf8",
        stdio: "pipe",
      }).trim();
      trust = { pin, runtimeRoot: runtime.repository };
      this.#external = { ...roots, runtimeRoot, runtime };
    }
    // Trust resolution is not configurable: every new grant, for every
    // project, binds the latest trusted record's exact committed methodology,
    // independent of candidate working-tree bytes, and passes the
    // trust-equivalence gate.
    this.kernel = new ExecutionKernel({
      ...options,
      methodologySource: () =>
        trustedDefinition(project, options.validators ?? {}, trust),
      methodologyGate: (definition) => {
        assertTrustedMethodology(project, definition, trust);
      },
      methodologyBinding: () => {
        this.#assertRuntime();
        return {
          ...trustedBinding(project, trust),
          ...(this.#external ? { runtime: this.#external.runtime } : {}),
        };
      },
    });
    this.kernel.recover();
  }
  // Root-authorized callers may exercise only the exact candidate
  // evaluator-verify composition. The host, not the caller, supplies the
  // installed runtime identity and the probed containment executable. The
  // returned semantic result remains subject evidence; it never enters the
  // authoritative kernel.
  candidateEvaluatorSubject(
    input: Omit<RunSubjectInput, "bwrap" | "runtimeCommit">,
  ): {
    readonly record: SubjectRecord;
    readonly paths: SubjectPaths;
    readonly manifest?: SubjectManifest;
  } {
    this.#assertRuntime();
    const runtimeRoot =
      this.#runtime.runtimeRoot ??
      this.#external?.runtimeRoot ??
      installedRuntimeRoot();
    const runtime = runtimeCommit(runtimeRoot);
    const excluded = [
      ...this.#excludedProviderRoots(),
      input.candidateRepository,
      ...(input.fixtureRoot ? [input.fixtureRoot] : []),
      ...(input.outputRoot ? [input.outputRoot] : []),
    ];
    const located = this.#runtime.bwrap
      ? { ok: true as const, path: this.#runtime.bwrap }
      : locateContainment(excluded);
    if (!located.ok)
      throw new HostRefusal("provider-config-invalid", located.reason);
    probeContainment(located.path);
    return runCandidateEvaluatorSubject({
      ...input,
      bwrap: located.path,
      runtimeCommit: runtime.commit,
    });
  }
  candidateEvaluatorFrozenSubject(input: {
    readonly workflow: string;
    readonly candidate: string;
    readonly evaluatorRevision: string;
    readonly evaluatorRevisionIdentity: string;
    readonly privateInventoryIdentity: string;
    readonly procedure: string;
    readonly execution: string;
  }): {
    readonly record: SubjectRecord;
    readonly paths: SubjectPaths;
    readonly manifest?: SubjectManifest;
  } {
    const allowed = [
      "workflow",
      "candidate",
      "evaluatorRevision",
      "evaluatorRevisionIdentity",
      "privateInventoryIdentity",
      "procedure",
      "execution",
    ];
    const extra = Object.keys(input).find((key) => !allowed.includes(key));
    if (extra)
      throw new Error(
        `frozen subject request contains unsupported field ${extra}`,
      );
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(input.execution))
      throw new Error("invalid frozen subject execution id");
    this.kernel.path(input.workflow);
    const handoff = this.kernel
      .events(input.workflow)
      .findLast((event) => event.transition === "implementation-handoff");
    if (handoff?.evidence.commit !== input.candidate)
      throw new Error(
        "frozen subject candidate is not the active implementation handoff",
      );
    const workflow = required(this.kernel.project.workflows[input.workflow]);
    const coveragePath = resolve(
      this.kernel.project.root,
      workflow.directory,
      "coverage-map.json",
    );
    const coverage = object(JSON.parse(readFileSync(coveragePath, "utf8")));
    const readiness = object(coverage.readiness);
    if (
      readiness.evaluatorRevision !== input.evaluatorRevision ||
      readiness.evaluatorRevisionIdentity !== input.evaluatorRevisionIdentity ||
      readiness.privateInventoryIdentity !== input.privateInventoryIdentity
    )
      throw new Error(
        "frozen subject request does not match active evaluator readiness",
      );
    const privateWorkspace =
      workflow.workspaces?.evaluation ??
      this.kernel.project.workspaces.evaluation;
    if (!privateWorkspace || privateWorkspace.exposure !== "evaluator-private")
      throw new Error("active evaluator-private workspace is unavailable");
    const configuredRoot = realpathSync(privateWorkspace.path);
    const frozenProcedure = resolveFrozenEvaluatorProcedure(configuredRoot, {
      evaluatorRevision: input.evaluatorRevision,
      evaluatorRevisionIdentity: input.evaluatorRevisionIdentity,
      privateInventoryIdentity: input.privateInventoryIdentity,
      procedure: input.procedure,
    });
    const inspected = inspectCandidateMethodology({
      repository: this.kernel.project.root,
      commit: input.candidate,
    });
    const role = required(inspected.roles["evaluator-verify"]);
    const temporary = realpathSync(
      mkdtempSync(join(tmpdir(), "harness-frozen-subject-evidence-")),
    );
    const result = this.candidateEvaluatorSubject({
      candidateRepository: this.kernel.project.root,
      candidateCommit: input.candidate,
      candidateMethodology: inspected.methodology,
      expectedSkillIdentity: role.skill.identity,
      expectedContractIdentity: role.contractIdentity,
      frozenProcedure,
      outputRoot: temporary,
      execution: input.execution,
    });
    if (!result.manifest) return result;
    const destination = resolve(
      this.kernel.project.root,
      workflow.directory,
      "evidence",
      "candidate-subject",
      input.execution,
    );
    publishSubjectEvidence(result.paths.evidence, destination);
    rmSync(temporary, { recursive: true, force: true });
    return { ...result, paths: { ...result.paths, evidence: destination } };
  }
  // Root-authenticated lifecycle operation. Its deliberately closed request
  // contains identities and selectors only; private paths and bytes are
  // resolved by the host from the active prepared evaluator inventory.
  prepareCandidateObservation(input: {
    readonly workflow: string;
    readonly candidate: string;
    readonly evaluatorRevision: string;
    readonly evaluatorRevisionIdentity: string;
    readonly privateInventoryIdentity: string;
    readonly procedure: string;
  }): PreparedObservationRecord {
    const allowed = [
      "workflow",
      "candidate",
      "evaluatorRevision",
      "evaluatorRevisionIdentity",
      "privateInventoryIdentity",
      "procedure",
    ];
    const extra = Object.keys(input).find((key) => !allowed.includes(key));
    if (extra)
      throw new Error(
        `prepared observation request contains unsupported field ${extra}`,
      );
    this.#assertRuntime();
    this.kernel.path(input.workflow);
    const handoff = this.kernel
      .events(input.workflow)
      .findLast((event) => event.transition === "implementation-handoff");
    if (handoff?.evidence.commit !== input.candidate)
      throw new Error(
        "prepared observation candidate is not the active implementation handoff",
      );
    const workflow = required(this.kernel.project.workflows[input.workflow]);
    const preparation = this.kernel
      .events(input.workflow)
      .filter((event) =>
        ["evaluation-prepared", "evaluator-repair-recorded"].includes(
          event.transition,
        ),
      )
      .at(-1);
    if (
      preparation?.evidence.path !== "coverage-map.json" ||
      typeof preparation.evidence.commit !== "string" ||
      typeof preparation.evidence.identity !== "string"
    )
      throw new Error("active evaluator readiness has no committed provenance");
    const coverageBytes = gitBytes(this.kernel.project.root, [
      "show",
      `${preparation.evidence.commit}:${workflow.directory}/coverage-map.json`,
    ]);
    if (identity(coverageBytes) !== preparation.evidence.identity)
      throw new Error("active evaluator readiness identity mismatch");
    const coverage = object(JSON.parse(coverageBytes.toString("utf8")));
    const readiness = object(coverage.readiness);
    if (
      readiness.evaluatorRevision !== input.evaluatorRevision ||
      readiness.evaluatorRevisionIdentity !== input.evaluatorRevisionIdentity ||
      readiness.privateInventoryIdentity !== input.privateInventoryIdentity
    )
      throw new Error(
        "prepared observation request does not match active evaluator readiness",
      );
    const privateWorkspace =
      workflow.workspaces?.evaluation ??
      this.kernel.project.workspaces.evaluation;
    if (!privateWorkspace || privateWorkspace.exposure !== "evaluator-private")
      throw new Error("active evaluator-private workspace is unavailable");
    const privateRoot = realpathSync(privateWorkspace.path);
    const frozenProcedure = resolveFrozenEvaluatorProcedure(privateRoot, {
      evaluatorRevision: input.evaluatorRevision,
      evaluatorRevisionIdentity: input.evaluatorRevisionIdentity,
      privateInventoryIdentity: input.privateInventoryIdentity,
      procedure: input.procedure,
    });
    const inspected = inspectCandidateMethodology({
      repository: this.kernel.project.root,
      commit: input.candidate,
    });
    const role = required(inspected.roles["evaluator-verify"]);
    const runtimeRoot =
      this.#runtime.runtimeRoot ??
      this.#external?.runtimeRoot ??
      installedRuntimeRoot();
    const runtime = runtimeCommit(runtimeRoot);
    const bindings: PreparedObservationBindings = {
      workflow: input.workflow,
      candidate: {
        commit: input.candidate,
        methodology: inspected.methodology,
        skill: role.skill.identity,
        contract: role.contractIdentity,
        contractSource: role.contractSourceIdentity,
      },
      runtime: runtime.commit,
      evaluator: {
        revision: input.evaluatorRevision,
        revisionIdentity: input.evaluatorRevisionIdentity,
        privateInventoryIdentity: input.privateInventoryIdentity,
        procedure: input.procedure,
        procedureIdentity: frozenProcedure.procedureIdentity,
      },
    };
    const preparedRoot = resolve(privateRoot, ".eval", "prepared-observations");
    mkdirSync(preparedRoot, { recursive: true, mode: 0o700 });
    const staging = realpathSync(mkdtempSync(join(preparedRoot, ".staging-")));
    try {
      const result = this.candidateEvaluatorSubject({
        candidateRepository: this.kernel.project.root,
        candidateCommit: input.candidate,
        candidateMethodology: inspected.methodology,
        expectedSkillIdentity: role.skill.identity,
        expectedContractIdentity: role.contractIdentity,
        frozenProcedure,
        outputRoot: staging,
      });
      if (!result.manifest) {
        const record = createPreparedObservationRecord({
          bindings,
          failure: `candidate observation ended ${result.record.status}`,
        });
        return this.kernel.recordPreparedObservation(input.workflow, record);
      }
      const prepared = sealPreparedObservationBundle(
        result.paths.evidence,
        join(staging, "prepared-bundle"),
        bindings,
      );
      const record = createPreparedObservationRecord({
        bindings,
        bundleManifestIdentity: prepared.identity,
      });
      const destinationRoot = join(preparedRoot, record.observation);
      const destination = join(destinationRoot, "bundle");
      if (!existsSync(destination)) {
        mkdirSync(destinationRoot, { recursive: true, mode: 0o700 });
        renameSync(join(staging, "prepared-bundle"), destination);
      }
      resolvePreparedObservation(privateRoot, record);
      return this.kernel.recordPreparedObservation(input.workflow, record);
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  }
  // An external-project host never runs a Stockdif workflow on an uncommitted
  // or subsequently changed Harness runtime.
  #assertRuntime(): void {
    const bound = this.#external;
    if (!bound) return;
    let current: { commit: string };
    try {
      current = runtimeCommit(bound.runtimeRoot);
    } catch (error) {
      throw new HostRefusal(
        "provider-config-invalid",
        (error as Error).message,
      );
    }
    if (current.commit !== bound.runtime.commit)
      throw new HostRefusal(
        "provider-config-invalid",
        "Harness runtime commit changed since host start",
      );
  }
  // Roots that a containment runtime binding must never expose.
  #protectedRoots(): string[] {
    const project = this.kernel.project;
    const bound = this.#external;
    return [
      homedir(),
      project.root,
      ...Object.values(project.workspaces).map((w) => w.path),
      ...Object.values(project.workflows).flatMap((w) =>
        Object.values(w.workspaces ?? {}).map((item) => item.path),
      ),
      ...(bound ? [bound.methodologyRepository, bound.runtime.repository] : []),
      ...(this.kernel.options.privateDataRoot
        ? [this.kernel.options.privateDataRoot]
        : []),
    ]
      .filter((path) => existsSync(path))
      .map((path) => realpathSync(path));
  }
  #excludedProviderRoots(): string[] {
    const project = this.kernel.project;
    return [
      project.root,
      ...Object.values(project.workspaces).map((w) => w.path),
      ...Object.values(project.workflows).flatMap((w) => [
        ...Object.values(w.workspaces ?? {}).map((item) => item.path),
      ]),
    ];
  }
  #stop(id: string): void {
    this.#children.get(id)?.();
  }
  #root(token: string): boolean {
    const actual = Buffer.from(token);
    const expected = Buffer.from(this.#rootToken);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }
  async handle(
    request: IncomingMessage,
    response: ServerResponse,
    pathname: string,
  ): Promise<void> {
    const send = (status: number, value: unknown): void => {
      response.writeHead(status, { "content-type": "application/json" });
      response.end(JSON.stringify(value));
    };
    try {
      const token = (request.headers.authorization ?? "").replace(
        /^Bearer /,
        "",
      );
      const root = this.#root(token);
      const sessionId =
        typeof request.headers["x-harness-session"] === "string"
          ? request.headers["x-harness-session"]
          : undefined;
      if (!root && !sessionId) {
        send(403, {
          error: "authenticated root or registered executor required",
        });
        return;
      }
      if (!root) this.kernel.authenticate(required(sessionId), token);
      const segments = pathname.split("/").filter(Boolean);
      const workflow = text(segments[1]);
      this.kernel.path(workflow);
      const operation = segments[2];
      const id = segments[3];
      const sub = segments[4];
      const get = request.method === "GET";
      let body: Data = {};
      if (!get) {
        if (request.method !== "POST")
          throw new Error("only GET/POST supported");
        let bytes = "";
        for await (const chunk of request) {
          bytes += String(chunk);
          if (bytes.length > (sub === "evidence" ? 262_144 : 65536))
            throw new Error("request too large");
        }
        body = object(JSON.parse(bytes || "{}"));
      }
      const needRoot = (): void => {
        if (!root) throw new Error("human/root authority required");
      };
      const owns = (execution: Execution): void => {
        if (!root && execution.session !== sessionId)
          throw new Error("execution belongs to another session");
      };
      if (operation === "prepared-observations") {
        needRoot();
        if (get) {
          send(200, {
            observation: this.kernel.preparedObservation(workflow, text(id)),
          });
          return;
        }
        const allowed = new Set([
          "candidate",
          "evaluatorRevision",
          "evaluatorRevisionIdentity",
          "privateInventoryIdentity",
          "procedure",
        ]);
        const extra = Object.keys(body).find((key) => !allowed.has(key));
        if (extra)
          throw new Error(
            `prepared observation request contains unsupported field ${extra}`,
          );
        send(201, {
          observation: this.prepareCandidateObservation({
            workflow,
            candidate: text(body.candidate),
            evaluatorRevision: text(body.evaluatorRevision),
            evaluatorRevisionIdentity: text(body.evaluatorRevisionIdentity),
            privateInventoryIdentity: text(body.privateInventoryIdentity),
            procedure: text(body.procedure),
          }),
        });
        return;
      }
      if (operation === "grants") {
        needRoot();
        if (get && id) {
          send(200, { grant: this.kernel.grant(workflow, id) });
          return;
        }
        if (get) {
          send(200, {
            grants: this.kernel
              .events(workflow)
              .filter((e) => e.transition === "kernel.workflow-grant")
              .map((e) => e.evidence),
          });
          return;
        }
        const delegation = body.delegation;
        if (
          !Array.isArray(delegation) ||
          !delegation.every((m) => m === "attached" || m === "spawned") ||
          typeof body.continuation !== "boolean" ||
          typeof body.maxAllocations !== "number" ||
          (body.maxAutomaticWork !== undefined &&
            typeof body.maxAutomaticWork !== "number") ||
          (body.supersedes !== undefined &&
            typeof body.supersedes !== "string") ||
          (body.inline !== undefined && typeof body.inline !== "boolean") ||
          (body.executor !== undefined &&
            (body.executor === null ||
              typeof body.executor !== "object" ||
              Array.isArray(body.executor)))
        )
          throw new Error("invalid workflow grant request");
        const strings = (v: unknown): string[] => {
          if (!Array.isArray(v) || !v.every((s) => typeof s === "string"))
            throw new Error("expected string array");
          return v;
        };
        const grant = this.kernel.authorize(workflow, {
          continuation: body.continuation,
          delegation: delegation as Array<"attached" | "spawned">,
          maxAllocations: body.maxAllocations,
          ...(body.roles ? { roles: strings(body.roles) } : {}),
          ...(body.stopAfter ? { stopAfter: strings(body.stopAfter) } : {}),
          ...(body.maxAutomaticWork !== undefined
            ? { maxAutomaticWork: body.maxAutomaticWork }
            : {}),
          ...(body.supersedes ? { supersedes: body.supersedes } : {}),
          ...(body.inline ? { inline: true } : {}),
          ...(body.executor
            ? {
                executor: object(body.executor),
              }
            : {}),
        });
        if (grant.supersedes) this.#stop(grant.supersedes);
        send(201, { grant });
        return;
      }
      if (operation === "resolve") {
        needRoot();
        if (!get) throw new Error("resolution is observation; use GET");
        const url = new URL(required(request.url), "http://localhost");
        send(
          200,
          this.kernel.inspect(
            workflow,
            text(id),
            url.searchParams.get("role") ?? undefined,
            url.searchParams.get("session") ?? undefined,
          ),
        );
        return;
      }
      if (operation === "evaluator-corrections") {
        needRoot();
        if (get)
          throw new Error("evaluator correction authority requires POST");
        if (typeof body.attempt !== "number")
          throw new Error("evaluator correction attempt is required");
        send(201, {
          authority: this.kernel.authorizeEvaluatorCorrection(workflow, {
            classification: text(body.classification),
            sourceEvaluatorRevision: text(body.sourceEvaluatorRevision),
            attempt: body.attempt,
            execution: text(body.execution),
            rejectionEvent: text(body.rejectionEvent),
            evidenceCommit: text(body.evidenceCommit),
            evidencePath: text(body.evidencePath),
            evidenceIdentity: text(body.evidenceIdentity),
            reason: text(body.reason),
          }),
        });
        return;
      }
      if (operation === "correction-cycles") {
        needRoot();
        if (get) throw new Error("correction-cycle authority requires POST");
        const defects = body.defects;
        if (
          !Array.isArray(defects) ||
          !defects.every((v) => typeof v === "string")
        )
          throw new Error("correction-cycle defects are required");
        send(201, {
          authority: this.kernel.authorizeCorrectionCycle(workflow, {
            cycle: text(body.cycle),
            classification: text(body.classification),
            execution: text(body.execution),
            roleGrant: text(body.roleGrant),
            semanticResult: text(body.semanticResult),
            commit: text(body.commit),
            evaluatorRevision: text(body.evaluatorRevision),
            attempt: Number(body.attempt),
            artifactCommit: text(body.artifactCommit),
            artifactPath: text(body.artifactPath),
            artifactIdentity: text(body.artifactIdentity),
            defects,
            reason: text(body.reason),
          }),
        });
        return;
      }
      if (operation === "decisions") {
        needRoot();
        if (get) throw new Error("human decision requires POST");
        send(
          201,
          this.kernel.decide(
            workflow,
            text(body.workflowGrant),
            text(body.decision),
            object(body.evidence),
          ),
        );
        return;
      }
      if (operation === "sessions") {
        if (!get) {
          needRoot();
          send(201, this.kernel.register(workflow, text(body.profile)));
          return;
        }
        if (!root && id !== sessionId) throw new Error("session access denied");
        const session = this.kernel.session(text(id));
        // Delivery exposes only this executor's exact assignments, never other roles' prompts or private requests.
        const executions = this.kernel
          .executions(workflow)
          .filter((e) => e.session === id);
        send(200, {
          session: { ...session, tokenHash: undefined },
          assignments: executions.map((execution) => {
            const grant = this.kernel.roleGrant(workflow, execution.roleGrant);
            const definition = this.kernel.definition(
              workflow,
              grant.methodology,
            );
            return {
              execution: this.kernel.humanView(workflow, execution.id),
              executionContext: this.kernel.workerExecutionContext(
                workflow,
                execution.id,
              ),
              grant,
              skill: required(definition.roles[grant.role]).skill,
              contract: required(definition.roles[grant.role]).contract,
            };
          }),
        });
        return;
      }
      if (operation === "continue") {
        needRoot();
        if (get) throw new Error("continuation requires POST");
        const grantId = text(body.workflowGrant);
        const role = typeof body.role === "string" ? body.role : undefined;
        const predecessor =
          typeof body.predecessor === "string" ? body.predecessor : undefined;
        const inline = body.inline === true;
        if (inline && body.mode !== "attached")
          throw new Error("inline adoption requires attached execution");
        if (body.mode === "attached") {
          const result = this.kernel.allocate(workflow, grantId, {
            session: text(body.session),
            mode: "attached",
            ...(role ? { role } : {}),
            ...(predecessor ? { predecessor } : {}),
            ...(inline ? { inline: true } : {}),
          });
          send(result.duplicate ? 200 : 201, result);
          return;
        }
        if (body.mode !== "spawned") throw new Error("execution mode required");
        const resolution = this.kernel.inspect(workflow, grantId, role);
        if (resolution.kind !== "grant") {
          send(409, resolution);
          return;
        }
        // Do not create a session or process when an allocation already exists.
        const existing = this.kernel
          .executions(workflow)
          .find((e) => e.roleGrant === resolution.grant.id && !predecessor);
        if (existing) {
          send(200, {
            execution: existing,
            grant: resolution.grant,
            duplicate: true,
          });
          return;
        }
        if (this.#external) this.#assertRuntime();
        const profile = this.kernel.select(resolution.grant, "spawned");
        if (!profile)
          throw new HostRefusal("no-adapter", "no eligible spawned executor");
        // Every spawned registered-adapter launch, for the Harness repository
        // and external projects alike, runs inside host containment; there is
        // no unwrapped fallback. Programmatic command profiles (test fixtures)
        // are the only uncontained spawned kind.
        if (this.#external && profile.command?.length)
          throw new HostRefusal(
            "provider-config-invalid",
            "external projects launch only contained registered adapters",
          );
        const contained = !profile.command?.length;
        let containment:
          | { bwrap: string; masked: string[]; protectedRoots: string[] }
          | undefined;
        if (contained) {
          const bwrap = this.#runtime.bwrap
            ? { ok: true as const, path: this.#runtime.bwrap }
            : locateContainment(this.#excludedProviderRoots());
          if (!bwrap.ok)
            throw new HostRefusal("provider-config-invalid", bwrap.reason);
          try {
            probeContainment(bwrap.path);
          } catch (error) {
            if (error instanceof AdapterRefusal)
              throw new HostRefusal(error.category, error.message);
            throw error;
          }
          containment = {
            bwrap: bwrap.path,
            masked: Object.keys(this.kernel.project.workflows).map((name) =>
              this.kernel.path(name),
            ),
            protectedRoots: this.#protectedRoots(),
          };
        }
        // Production profiles launch only a registered adapter's installed
        // provider. A command profile exists only when passed programmatically.
        let provider:
          | {
              adapter: ProviderAdapter;
              program: string;
              plan: { model?: string; reasoning?: string };
            }
          | undefined;
        if (!profile.command?.length) {
          const adapter = registeredAdapter(profile.provider);
          if (!adapter)
            throw new HostRefusal(
              "no-adapter",
              `executor profile ${profile.id} names no registered provider adapter`,
            );
          const located = this.#runtime.locate
            ? this.#runtime.locate(adapter.program)
            : locateProvider(
                adapter.program,
                process.env.PATH,
                this.#excludedProviderRoots(),
              );
          if (!located.ok)
            throw new HostRefusal("provider-not-installed", located.reason);
          try {
            provider = {
              adapter,
              program: located.path,
              plan: planLaunch(adapter, resolution.grant, profile),
            };
            if (containment)
              assertWorkspaces(launchWorkspaces(resolution.grant));
            // A provider that builds its own nested sandbox is launched
            // inside containment only when that sandbox can start there.
            if (containment && adapter.nestedSandbox) {
              const workspaces = launchWorkspaces(resolution.grant);
              probeNestedSandbox({
                bwrap: containment.bwrap,
                provider: adapter.id,
                cwd: required(workspaces[0]).path,
                workspaces,
                nodePath: process.execPath,
                masked: containment.masked,
                protectedRoots: containment.protectedRoots,
              });
            }
          } catch (error) {
            if (error instanceof AdapterRefusal)
              throw new HostRefusal(error.category, error.message);
            throw error;
          }
        }
        const registration = this.kernel.register(workflow, profile.id);
        const allocation = this.kernel.allocate(workflow, grantId, {
          session: registration.session.id,
          mode: "spawned",
          ...(role ? { role } : {}),
          ...(predecessor ? { predecessor } : {}),
          ...(containment ? { contained: true } : {}),
          ...(provider ? { executorPlan: provider.plan } : {}),
        });
        const address = request.socket.localPort;
        if (!allocation.duplicate && provider) {
          const run = new GovernedProviderRun({
            kernel: this.kernel,
            workflow,
            hostUrl: `http://127.0.0.1:${String(address)}`,
            session: {
              id: registration.session.id,
              token: registration.token,
            },
            execution: allocation.execution,
            profile,
            adapter: provider.adapter,
            program: provider.program,
            plan: provider.plan,
            ...(containment ? { containment } : {}),
            ...(this.kernel.options.privateDataRoot
              ? { privateDataRoot: this.kernel.options.privateDataRoot }
              : {}),
            ...(this.#runtime.humanWaitMs === undefined
              ? {}
              : { humanWaitMs: this.#runtime.humanWaitMs }),
            ...(this.#runtime.spawnProvider
              ? { spawnProvider: this.#runtime.spawnProvider }
              : {}),
            onExit: () => {
              this.#children.delete(allocation.execution.id);
              if (!this.#closed)
                this.#continue(workflow, grantId, required(address));
            },
          });
          this.#children.set(allocation.execution.id, () => {
            void run.cancel();
          });
        } else if (!allocation.duplicate && profile.command?.length) {
          // Test-only fixture executor (programmatic construction only).
          const [program, ...args] = profile.command;
          const child = spawn(required(program), args, {
            cwd:
              allocation.grant.workspaces[0]?.path ?? this.kernel.project.root,
            stdio: "ignore",
            env: {
              PATH: process.env.PATH ?? "",
              HARNESS_URL: `http://127.0.0.1:${String(address)}`,
              HARNESS_WORKFLOW: workflow,
              HARNESS_SESSION: registration.session.id,
              HARNESS_SESSION_TOKEN: registration.token,
            },
          });
          this.#children.set(allocation.execution.id, () =>
            child.kill("SIGTERM"),
          );
          child.once("spawn", () =>
            this.kernel.process(
              workflow,
              allocation.execution.id,
              "running",
              child.pid ?? null,
            ),
          );
          child.once("error", () => {
            if (this.#closed) return;
            const e = this.kernel.execution(workflow, allocation.execution.id);
            if (e.process === "allocated")
              this.kernel.process(
                workflow,
                e.id,
                "failed",
                null,
                "executor launch failed",
                "provider-crashed",
              );
          });
          child.once("exit", (code) => {
            this.#children.delete(allocation.execution.id);
            if (this.#closed) return;
            const execution = this.kernel.execution(
              workflow,
              allocation.execution.id,
            );
            if (["allocated", "running"].includes(execution.process))
              this.kernel.process(
                workflow,
                execution.id,
                code === 0 && execution.result ? "exited" : "failed",
                null,
                code === 0 && execution.result
                  ? null
                  : code === 0
                    ? "missing semantic result handshake"
                    : "provider process failed",
                code === 0 && execution.result
                  ? null
                  : code === 0
                    ? "missing-result"
                    : "provider-crashed",
              );
            this.#continue(workflow, grantId, required(address));
          });
        }
        send(201, allocation);
        return;
      }
      if (operation === "preimplementation-recovery") {
        needRoot();
        if (get)
          throw new Error(
            "pre-implementation recovery authority requires POST",
          );
        send(
          201,
          this.kernel.recoverPreimplementation(workflow, {
            workflowGrant: text(body.workflowGrant),
            designMapEvent: text(body.designMapEvent),
            evaluationPreparedEvent: text(body.evaluationPreparedEvent),
            reason: text(body.reason),
          }),
        );
        return;
      }
      if (operation === "transition-recovery") {
        needRoot();
        if (get) throw new Error("transition recovery requires POST");
        if (typeof body.attempt !== "number")
          throw new Error("transition recovery attempt is required");
        send(201, {
          transition: this.kernel.recoverTransition(workflow, {
            execution: text(body.execution),
            roleGrant: text(body.roleGrant),
            allocationEvent: text(body.allocationEvent),
            semanticResult: text(body.semanticResult),
            transition: text(body.transition),
            candidate: text(body.candidate),
            evaluatorRevision: text(body.evaluatorRevision),
            attempt: body.attempt,
            result: text(body.result),
            artifactCommit: text(body.artifactCommit),
            artifactPath: text(body.artifactPath),
            artifactIdentity: text(body.artifactIdentity),
          }),
        });
        return;
      }
      if (operation === "grant-retirements") {
        needRoot();
        if (get) {
          send(200, {
            retirements: this.kernel
              .events(workflow)
              .filter((e) => e.transition === "kernel.workflow-grant-retired")
              .map((e) => e.evidence),
          });
          return;
        }
        send(
          201,
          this.kernel.retireWorkflowGrant(workflow, {
            workflowGrant: text(body.workflowGrant),
            reason: text(body.reason),
          }),
        );
        return;
      }
      if (operation === "root") {
        needRoot();
        if (get) throw new Error("root decision requires POST");
        send(
          201,
          this.kernel.root(
            workflow,
            text(body.workflowGrant),
            text(body.role),
            text(body.reason),
            typeof body.uses === "number" ? body.uses : 1,
          ),
        );
        return;
      }
      if (operation === "executions") {
        if (get && !id) {
          send(200, {
            executions: this.kernel
              .executions(workflow)
              .filter((e) => root || e.session === sessionId),
          });
          return;
        }
        const execution = this.kernel.execution(workflow, text(id));
        owns(execution);
        if (get) {
          send(200, {
            execution: this.kernel.humanView(workflow, execution.id),
            grant: this.kernel.roleGrant(workflow, execution.roleGrant),
          });
          return;
        }
        if (sub === "result") {
          send(
            200,
            this.kernel.result(
              workflow,
              execution.id,
              text(body.disposition),
              object(body.methodology ?? {}),
            ),
          );
          return;
        }
        if (sub === "started") {
          send(
            200,
            this.kernel.process(
              workflow,
              execution.id,
              "running",
              typeof body.pid === "number" ? body.pid : null,
            ),
          );
          return;
        }
        if (sub === "exited") {
          send(200, this.kernel.process(workflow, execution.id, "exited"));
          if (!this.#closed)
            this.#continue(
              workflow,
              execution.workflowGrant,
              required(request.socket.localPort),
            );
          return;
        }
        if (sub === "human") {
          send(
            201,
            this.kernel.ask(
              workflow,
              execution.id,
              text(body.kind) as HumanRequest["kind"],
              text(body.question),
              typeof body.permission === "string" ? body.permission : null,
            ),
          );
          return;
        }
        if (sub === "respond") {
          needRoot();
          send(
            200,
            this.kernel.respond(
              workflow,
              execution.id,
              text(body.request),
              text(body.value),
            ),
          );
          return;
        }
        if (sub === "publish") {
          send(
            200,
            this.kernel.publish(
              workflow,
              execution.id,
              text(body.workspace),
              text(body.commit),
              text(body.ref),
            ),
          );
          return;
        }
        if (sub === "evidence") {
          const files = body.files;
          if (!Array.isArray(files))
            throw new Error("evidence files are required");
          send(
            200,
            this.kernel.recordEvidence(
              workflow,
              execution.id,
              files.map((entry) => {
                const file = object(entry);
                if (typeof file.content !== "string")
                  throw new Error("evidence content must be a string");
                return {
                  destination: text(file.destination),
                  content: file.content,
                };
              }),
            ),
          );
          return;
        }
        if (sub === "promote") {
          const artifacts = body.artifacts ?? [];
          if (!Array.isArray(artifacts))
            throw new Error("promotion artifacts must be a list");
          const parsed = artifacts.map((entry): PromotionArtifact => {
            const artifact = object(entry);
            return {
              source: text(artifact.source),
              destination: text(artifact.destination),
              identity: text(artifact.identity),
            };
          });
          send(
            200,
            this.kernel.promote(
              workflow,
              execution.id,
              text(body.candidate),
              text(body.evaluatorRevision),
              Number(body.attempt),
              parsed,
            ),
          );
          return;
        }
        if (sub === "promote-known-loss") {
          needRoot();
          const recovery = this.kernel.authorizeKnownLossPromotion(workflow, {
            execution: execution.id,
            declarationPath: text(body.declarationPath),
            declarationIdentity: text(body.declarationIdentity),
          });
          send(
            200,
            this.kernel.promote(
              workflow,
              execution.id,
              recovery.declaration.candidate,
              recovery.declaration.evaluatorRevision,
              recovery.declaration.successfulAttempt.attempt,
              recovery.artifacts,
              {
                archiveCompleteness: "incomplete-known-loss",
                authority: recovery.authority,
                declarationPath: text(body.declarationPath),
                declarationIdentity: text(body.declarationIdentity),
                normalValidation: "INELIGIBLE",
                normalValidationReason:
                  recovery.declaration.promotionPlan.reason,
              },
            ),
          );
          return;
        }
        if (sub === "promote-complete-recovery") {
          needRoot();
          this.#assertRuntime();
          const runtimeRoot =
            this.#external?.runtimeRoot ?? installedRuntimeRoot();
          const runtime = runtimeCommit(runtimeRoot);
          const recovery = this.kernel.authorizeCompleteArchiveRecovery(
            workflow,
            {
              execution: execution.id,
              declarationPath: text(body.declarationPath),
              declarationIdentity: text(body.declarationIdentity),
              hostRuntimeRepository: runtime.repository,
              hostRuntimeCommit: runtime.commit,
            },
          );
          send(
            200,
            this.kernel.promote(
              workflow,
              execution.id,
              recovery.declaration.candidate,
              recovery.declaration.evaluatorRevision,
              recovery.declaration.successfulAttempt,
              recovery.artifacts,
              undefined,
              {
                archiveCompleteness: "complete",
                classification: "PROMOTION_POLICY_DEFECT",
                authority: recovery.authority,
                declarationPath: text(body.declarationPath),
                declarationIdentity: text(body.declarationIdentity),
                runtimeCommit: recovery.declaration.runtimeCommit,
                hostRuntimeCommit: runtime.commit,
                normalValidation: "INELIGIBLE",
                planIdentity: recovery.declaration.promotionPlan.identity,
                evidenceReconstructed: false,
                evidenceOmitted: false,
              },
            ),
          );
          return;
        }
        if (sub === "cancel") {
          needRoot();
          // Record the terminal status first, then terminate the actual child.
          const cancelled = this.kernel.process(
            workflow,
            execution.id,
            "cancelled",
            null,
            "explicit human cancellation",
            "cancelled",
          );
          this.#stop(execution.id);
          send(200, cancelled);
          return;
        }
      }
      send(404, { error: "unknown governed host operation" });
    } catch (error) {
      send(409, {
        error:
          error instanceof Error ? error.message : "governed request failed",
        ...(error instanceof HostRefusal ? { category: error.category } : {}),
      });
    }
  }
  #continue(workflow: string, grantId: string, port: number): void {
    const grant = this.kernel.grant(workflow, grantId);
    if (!grant.continuation || !grant.delegation.includes("spawned")) return;
    const resolution = this.kernel.inspect(workflow, grantId);
    if (resolution.kind !== "grant") {
      this.kernel.continuationStopped(workflow, grantId, resolution.reason);
      return;
    }
    const existing = this.kernel
      .executions(workflow)
      .find((e) => e.roleGrant === resolution.grant.id);
    if (existing) {
      if (existing.result?.disposition === "blocked") {
        const reason = `automatic continuation stopped after semantic BLOCKED result from execution ${existing.id}`;
        if (
          !this.kernel
            .events(workflow)
            .some(
              (event) =>
                event.transition === "kernel.continuation-stopped" &&
                event.evidence.workflowGrant === grantId &&
                event.evidence.reason === reason,
            )
        )
          this.kernel.continuationStopped(workflow, grantId, reason);
        return;
      }
      const retry = required(
        this.kernel.definition(workflow, grant.methodology).roles[
          resolution.grant.role
        ],
      ).policy.retry;
      if (
        ["allocated", "running"].includes(existing.process) ||
        !retry.dispositions.includes(
          existing.result?.disposition ?? existing.process,
        )
      )
        return;
    }
    // Reuse precisely the supported allocation operation; a caller disconnect is irrelevant.
    void fetch(
      `http://127.0.0.1:${String(port)}/governed/${encodeURIComponent(workflow)}/continue`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.#rootToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          workflowGrant: grantId,
          mode: "spawned",
          role: resolution.grant.role,
          ...(existing ? { predecessor: existing.id } : {}),
        }),
      },
    )
      .then(async (response) => {
        if (response.ok) return;
        const body = await response.text();
        let category: DiagnosticCategory | undefined;
        try {
          const parsed = JSON.parse(body) as { category?: DiagnosticCategory };
          category = parsed.category;
        } catch {
          category = undefined;
        }
        this.kernel.continuationStopped(
          workflow,
          grantId,
          `automatic continuation rejected: ${body}`,
          category,
        );
      })
      .catch((error: unknown) => {
        this.kernel.continuationStopped(
          workflow,
          grantId,
          `automatic continuation transport failure: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      });
  }
  close(): void {
    this.#closed = true;
    for (const stop of this.#children.values()) stop();
    this.kernel.recover();
  }
}
