import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import {
  appendLedger,
  contentId,
  identity,
  matches,
  object,
  readLedger,
  required,
  scopedEvents,
} from "./ledger.ts";
import { inside, loadDefinition } from "./methodology.ts";
import {
  authorityBasis,
  resolveAuthority,
  type Resolution,
} from "./resolver.ts";
import type {
  Data,
  Execution,
  ExecutorProfile,
  ExecutorSelector,
  HostActionRequest,
  HostActionResult,
  HumanEvaluatorCorrectionAuthority,
  HumanRequest,
  LedgerEvent,
  MethodologyDefinition,
  Project,
  RoleGrant,
  RoleResult,
  RootAuthority,
  Session,
  TelemetrySink,
  WorkflowGrant,
  ArtifactValidators,
} from "./model.ts";

export interface KernelOptions {
  project: Project;
  executors: ExecutorProfile[];
  telemetry?: TelemetrySink;
  selectExecutor?: ExecutorSelector;
  privateDataRoot?: string;
  validators?: ArtifactValidators;
}
// One host owns a project's executions. Synchronous ledger transactions serialize
// request races; the on-disk lock also rejects competing host/CLI writers.
export class ExecutionKernel {
  readonly project: Project;
  readonly options: KernelOptions;
  constructor(options: KernelOptions) {
    this.project = structuredClone(options.project);
    this.options = options;
  }
  path(workflow: string): string {
    const config = this.project.workflows[workflow];
    if (!config) throw new Error("unknown configured workflow");
    return resolve(this.project.root, config.directory, config.ledger);
  }
  events(workflow: string): LedgerEvent[] {
    return readLedger(this.path(workflow));
  }
  #append(workflow: string, type: string, evidence: object): void {
    appendLedger(this.path(workflow), type, evidence);
  }
  #transaction<T>(workflow: string, operation: () => T): T {
    const lock = `${this.path(workflow)}.lock`;
    mkdirSync(dirname(lock), { recursive: true });
    try {
      mkdirSync(lock);
    } catch {
      throw new Error("authority writer busy; retry the same request");
    }
    try {
      writeFileSync(resolve(lock, "owner"), String(process.pid), {
        mode: 0o600,
      });
      return operation();
    } finally {
      rmSync(lock, { recursive: true });
    }
  }
  definition(workflow: string, id: string): MethodologyDefinition {
    const definition = this.events(workflow).find(
      (e) => e.transition === "kernel.definition" && e.evidence.id === id,
    )?.evidence as unknown as MethodologyDefinition | undefined;
    if (!definition) throw new Error("unknown pinned methodology");
    const { id: actual, ...body } = definition;
    if (contentId(body) !== actual)
      throw new Error("methodology content identity mismatch");
    return definition;
  }
  grant(workflow: string, id: string): WorkflowGrant {
    const value = this.events(workflow).find(
      (e) => e.transition === "kernel.workflow-grant" && e.evidence.id === id,
    )?.evidence;
    if (!value) throw new Error("unknown workflow grant");
    return value as unknown as WorkflowGrant;
  }
  authorize(
    workflow: string,
    request: {
      continuation: boolean;
      delegation: Array<"attached" | "spawned">;
      roles?: string[];
      stopAfter?: string[];
      maxAllocations: number;
      maxAutomaticWork?: number;
      supersedes?: string;
      inline?: boolean;
      executor?: { model?: string; reasoning?: string };
    },
  ): WorkflowGrant {
    return this.#transaction(workflow, () => {
      const definition = loadDefinition(this.project, this.options.validators);
      const roles = request.roles ?? Object.keys(definition.roles);
      if (
        !roles.length ||
        roles.some((r) => !definition.roles[r]) ||
        !request.delegation.length ||
        request.delegation.some((m) => !["attached", "spawned"].includes(m)) ||
        !Number.isSafeInteger(request.maxAllocations) ||
        request.maxAllocations < 1 ||
        (request.maxAutomaticWork !== undefined &&
          (!Number.isSafeInteger(request.maxAutomaticWork) ||
            request.maxAutomaticWork < 1)) ||
        (request.executor !== undefined &&
          (!Object.values(request.executor).every(
            (value) => typeof value === "string" && value.length > 0,
          ) ||
            Object.keys(request.executor).some(
              (key) => key !== "model" && key !== "reasoning",
            )))
      )
        throw new Error("invalid execution authorization");
      const events = this.events(workflow);
      if (
        !events.some(
          (e) =>
            e.transition === "kernel.definition" &&
            e.evidence.id === definition.id,
        )
      )
        this.#append(workflow, "kernel.definition", definition);
      const value: WorkflowGrant = {
        schemaVersion: 1,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        methodology: definition.id,
        authorityBasis: authorityBasis(events),
        origin: "human",
        continuation: request.continuation,
        delegation: request.delegation,
        roles,
        stopAfter: request.stopAfter ?? [],
        maxAllocations: Math.min(
          request.maxAllocations,
          definition.policy.maxAllocations,
        ),
        maxAutomaticWork: Math.min(
          request.maxAutomaticWork ?? request.maxAllocations,
          definition.policy.maxAllocations,
        ),
        ...(request.inline ? { inline: true } : {}),
        ...(request.executor ? { executor: request.executor } : {}),
      };
      if (request.supersedes) {
        const old = this.execution(workflow, request.supersedes);
        if (!["allocated", "running"].includes(old.process))
          throw new Error("supersession requires an active governed execution");
        value.supersedes = old.id;
        // The new authority is durable before old authority becomes invalid.
        this.#append(workflow, "kernel.workflow-grant", value);
        this.#append(workflow, "kernel.supersession", {
          execution: old.id,
          workflowGrant: value.id,
        });
        this.#append(workflow, "kernel.process", {
          execution: old.id,
          update: {
            process: "cancelled",
            failure: "superseded by new workflow authority",
            attention: "terminal",
          },
        });
        return value;
      }
      this.#append(workflow, "kernel.workflow-grant", value);
      return value;
    });
  }
  authorizeEvaluatorCorrection(
    workflow: string,
    request: {
      classification: string;
      sourceEvaluatorRevision: string;
      attempt: number;
      execution: string;
      rejectionEvent: string;
      evidenceCommit: string;
      evidencePath: string;
      evidenceIdentity: string;
      reason: string;
    },
  ): HumanEvaluatorCorrectionAuthority {
    return this.#transaction(workflow, () => {
      if (
        request.classification !== "EVALUATOR_COVERAGE_DEFECT" ||
        !/^\d{3}$/.test(request.sourceEvaluatorRevision) ||
        !Number.isSafeInteger(request.attempt) ||
        request.attempt < 1 ||
        !request.execution ||
        !request.rejectionEvent ||
        !request.evidenceCommit ||
        !request.evidencePath ||
        !/^sha256:[a-f0-9]{64}$/.test(request.evidenceIdentity) ||
        !request.reason
      )
        throw new Error("invalid evaluator correction authority");
      const events = this.events(workflow);
      if (
        events.some(
          (event) =>
            event.transition === "human-evaluator-correction-authorized" &&
            event.evidence.execution === request.execution &&
            event.evidence.attempt === request.attempt,
        )
      )
        throw new Error("evaluator correction authority already recorded");
      const allocation = events.find(
        (event) =>
          event.transition === "verification-allocated" &&
          event.evidence.execution === request.execution &&
          event.evidence.attempt === request.attempt &&
          event.evidence.evaluatorRevision === request.sourceEvaluatorRevision,
      );
      const rejection = events.find(
        (event) =>
          event.id === request.rejectionEvent &&
          event.transition === "kernel.process" &&
          event.evidence.execution === request.execution,
      );
      const update = rejection ? object(rejection.evidence.update) : {};
      if (!allocation || update.process !== "failed")
        throw new Error(
          "evaluator correction authority lacks exact rejected verification evidence",
        );
      const roleGrant = allocation.evidence.roleGrant;
      const allocatedGrant = events
        .filter((event) => event.transition === "kernel.allocation")
        .map((event) => object(event.evidence.grant))
        .find((grant) => grant.id === roleGrant);
      const allocationKey =
        typeof allocation.evidence.allocationKey === "string"
          ? allocation.evidence.allocationKey
          : allocatedGrant?.allocationKey;
      if (typeof allocationKey !== "string")
        throw new Error("verification allocation identity is unavailable");
      const directory = required(this.project.workflows[workflow]).directory;
      const artifact = inside(
        resolve(this.project.root, directory),
        request.evidencePath,
      );
      let bytes: Buffer;
      try {
        bytes = execFileSync(
          "git",
          [
            "show",
            `${request.evidenceCommit}:${relative(this.project.root, artifact)}`,
          ],
          { cwd: this.project.root },
        );
      } catch {
        throw new Error("evaluator correction evidence commit is unavailable");
      }
      if (identity(bytes) !== request.evidenceIdentity)
        throw new Error("evaluator correction evidence identity mismatch");
      const result = object(JSON.parse(bytes.toString("utf8")));
      if (
        result.attempt !== String(request.attempt).padStart(3, "0") ||
        result.allocationKey !== allocationKey ||
        result.commit !== allocation.evidence.commit ||
        result.evaluatorRevision !== request.sourceEvaluatorRevision
      )
        throw new Error(
          "evaluator correction artifact does not bind the rejected allocation",
        );
      const decision = {
        schemaVersion: 1 as const,
        id: randomUUID(),
        project: this.project.id,
        workflow,
        origin: "human" as const,
        classification: "EVALUATOR_COVERAGE_DEFECT" as const,
        sourceEvaluatorRevision: request.sourceEvaluatorRevision,
        attempt: request.attempt,
        execution: request.execution,
        rejectionEvent: request.rejectionEvent,
        evidenceCommit: request.evidenceCommit,
        evidencePath: request.evidencePath,
        evidenceIdentity: request.evidenceIdentity,
        reason: request.reason,
      };
      const authority: HumanEvaluatorCorrectionAuthority = {
        ...decision,
        semanticResult: contentId(decision),
      };
      this.#append(
        workflow,
        "human-evaluator-correction-authorized",
        authority,
      );
      return authority;
    });
  }
  inspect(
    workflow: string,
    grantId: string,
    role?: string,
    sessionId?: string,
  ): Resolution {
    const grant = this.grant(workflow, grantId);
    return resolveAuthority(
      this.project,
      this.events(workflow),
      this.definition(workflow, grant.methodology),
      grant,
      role,
      sessionId ? this.session(sessionId) : undefined,
      null,
      this.options.validators,
    );
  }
  session(id: string): Session {
    let session: Session | undefined;
    const exposures = new Set<string>();
    for (const workflow of Object.keys(this.project.workflows)) {
      for (const event of this.events(workflow)) {
        if (event.transition === "kernel.session" && event.evidence.id === id)
          session = event.evidence as unknown as Session;
        if (
          event.transition === "kernel.exposure" &&
          event.evidence.session === id
        )
          exposures.add(String(event.evidence.exposure));
      }
    }
    if (!session) throw new Error("unknown registered session");
    return { ...session, exposures: [...exposures] };
  }
  register(
    workflow: string,
    profileId: string,
  ): { session: Session; token: string } {
    const profile = this.options.executors.find(
      (p) => p.id === profileId && p.available,
    );
    if (!profile) throw new Error("executor unavailable");
    const token = randomBytes(32).toString("hex");
    const session: Session = {
      schemaVersion: 1,
      id: randomUUID(),
      profile,
      tokenHash: identity(token),
      exposures: [],
      workspaces: [],
      registeredAt: new Date().toISOString(),
    };
    this.#transaction(workflow, () => {
      this.#append(workflow, "kernel.session", session);
    });
    return { session, token };
  }
  authenticate(id: string, token: string): Session {
    const session = this.session(id);
    if (session.tokenHash !== identity(token))
      throw new Error("session authentication denied");
    return session;
  }
  #privatePath(id: string): string {
    if (!/^[a-f0-9-]{36}$/.test(id))
      throw new Error("invalid private payload identity");
    const root = required(
      this.options.privateDataRoot,
      "protected human input requires host-owned private data storage",
    );
    mkdirSync(root, { recursive: true, mode: 0o700 });
    const actual = realpathSync(root);
    const workspaces = [
      ...Object.values(this.project.workspaces),
      ...Object.values(this.project.workflows).flatMap((w) =>
        Object.values(w.workspaces ?? {}),
      ),
    ];
    if (
      workspaces.some((w) => {
        const delta = relative(realpathSync(w.path), actual);
        return (
          delta === "" ||
          (!delta.startsWith("../") && delta !== ".." && !delta.startsWith("/"))
        );
      })
    )
      throw new Error(
        "private human payload store must be outside executor workspaces",
      );
    return resolve(actual, `${id}.json`);
  }
  humanView(workflow: string, id: string): Execution {
    const execution = this.execution(workflow, id);
    const grant = this.roleGrant(workflow, execution.roleGrant);
    if (!grant.executorConstraints.protected) return execution;
    for (const request of execution.requests) {
      const payload = object(
        JSON.parse(readFileSync(this.#privatePath(request.id), "utf8")),
      );
      request.question = String(payload.question);
      request.permission =
        typeof payload.permission === "string" ? payload.permission : null;
      if (request.response)
        request.response.value = String(
          object(
            JSON.parse(
              readFileSync(this.#privatePath(request.response.id), "utf8"),
            ),
          ).value,
        );
    }
    return execution;
  }
  executions(workflow: string): Execution[] {
    const runs = new Map<string, Execution>();
    for (const event of this.events(workflow)) {
      if (event.transition === "kernel.allocation") {
        const execution = structuredClone(
          event.evidence.execution,
        ) as Execution;
        runs.set(execution.id, execution);
      }
      const run = runs.get(String(event.evidence.execution));
      if (!run) continue;
      if (event.transition === "kernel.process")
        Object.assign(run, event.evidence.update);
      if (event.transition === "kernel.transition")
        run.transition = { status: "recorded", reason: null };
      if (event.transition === "kernel.transition-blocked")
        run.transition = {
          status: "blocked",
          reason: String(event.evidence.reason),
        };
      if (event.transition === "kernel.result")
        run.result = event.evidence as unknown as RoleResult;
      if (event.transition === "kernel.action-result")
        run.actions.push(event.evidence as unknown as HostActionResult);
      if (event.transition === "kernel.human-request") {
        run.requests.push(event.evidence as unknown as HumanRequest);
        run.attention = "WAITING_FOR_HUMAN";
      }
      if (event.transition === "kernel.supersession") run.superseded = true;
      if (event.transition === "kernel.human-response") {
        const request = run.requests.find(
          (r) => r.id === event.evidence.request,
        );
        if (request)
          request.response = event.evidence
            .response as HumanRequest["response"];
        run.attention = "working";
      }
    }
    return [...runs.values()];
  }
  execution(workflow: string, id: string): Execution {
    const execution = this.executions(workflow).find((r) => r.id === id);
    if (!execution) throw new Error("unknown execution");
    return execution;
  }
  roleGrant(workflow: string, id: string): RoleGrant {
    const allocation = this.events(workflow).find(
      (e) =>
        e.transition === "kernel.allocation" &&
        (e.evidence.grant as RoleGrant).id === id,
    );
    if (!allocation) throw new Error("unknown role grant");
    return allocation.evidence.grant as RoleGrant;
  }
  select(
    grant: RoleGrant,
    mode: "attached" | "spawned",
  ): ExecutorProfile | undefined {
    const eligible = this.options.executors.filter(
      (p) =>
        p.available &&
        p.modes.includes(mode) &&
        grant.capabilities.every((c) => p.capabilities.includes(c)) &&
        (!grant.executorConstraints.protected ||
          p.isolation.includes("private-workspace")) &&
        (!grant.executorConstraints.model ||
          p.model === grant.executorConstraints.model) &&
        (!grant.executorConstraints.reasoning ||
          p.reasoning === grant.executorConstraints.reasoning),
    );
    const chosen = this.options.selectExecutor
      ? this.options.selectExecutor(grant, structuredClone(eligible))
      : eligible[0];
    return chosen && eligible.find((p) => p.id === chosen.id);
  }
  allocate(
    workflow: string,
    workflowGrant: string,
    request: {
      role?: string;
      session: string;
      mode: "attached" | "spawned";
      predecessor?: string;
      inline?: boolean;
    },
  ): { execution: Execution; grant: RoleGrant; duplicate: boolean } {
    return this.#transaction(workflow, () => {
      const parent = this.grant(workflow, workflowGrant);
      if (!parent.delegation.includes(request.mode))
        throw new Error("delegation mode denied");
      if (
        (request.mode === "attached" && !parent.inline) ||
        (request.inline && request.mode !== "attached")
      )
        throw new Error(
          "inline role adoption lacks explicit workflow authority",
        );
      const session = this.session(request.session);
      if (
        !session.profile.available ||
        !session.profile.modes.includes(request.mode)
      )
        throw new Error("executor mode unavailable");
      const definition = this.definition(workflow, parent.methodology);
      const previous = request.predecessor
        ? this.execution(workflow, request.predecessor)
        : undefined;
      if (previous) {
        const old = this.roleGrant(workflow, previous.roleGrant);
        const policy = definition.roles[old.role]?.policy;
        const child = this.executions(workflow).find(
          (e) => e.predecessor === previous.id && e.workflowGrant === parent.id,
        );
        if (child && (!request.role || request.role === old.role)) {
          const childGrant = this.roleGrant(workflow, child.roleGrant);
          if (
            childGrant.executorConstraints.forbiddenExposure.some((exposure) =>
              session.exposures.includes(exposure),
            )
          )
            throw new Error("session provenance prohibits role");
          return { execution: child, grant: childGrant, duplicate: true };
        }
        const replacements = this.executions(workflow).filter(
          (e) =>
            e.workflowGrant === parent.id &&
            this.roleGrant(workflow, e.roleGrant).role === old.role &&
            e.predecessor !== null,
        );
        if (
          previous.workflowGrant !== parent.id ||
          (request.role && request.role !== old.role) ||
          !policy ||
          replacements.length >= policy.retry.limit ||
          !policy.retry.dispositions.includes(
            previous.result?.disposition ?? previous.process,
          ) ||
          !["exited", "failed", "cancelled", "interrupted"].includes(
            previous.process,
          )
        )
          throw new Error("retry policy denied");
      }
      const resolution = resolveAuthority(
        this.project,
        this.events(workflow),
        definition,
        parent,
        request.role,
        session,
        previous?.id ?? null,
        this.options.validators,
      );
      if (resolution.kind !== "grant")
        throw new Error(`${resolution.kind}: ${resolution.reason}`);
      const grant = resolution.grant;
      const inFlight = this.executions(workflow).find((e) =>
        ["allocated", "running"].includes(e.process),
      );
      if (inFlight) {
        const activeGrant = this.roleGrant(workflow, inFlight.roleGrant);
        if (activeGrant.id === grant.id)
          return { execution: inFlight, grant: activeGrant, duplicate: true };
        throw new Error(
          "active governed execution conflicts with non-equivalent authority; explicit supersession required",
        );
      }
      const prior = this.executions(workflow).find(
        (e) => e.roleGrant === grant.id,
      );
      if (prior) return { execution: prior, grant, duplicate: true };
      const operationalRetry =
        previous &&
        this.roleGrant(workflow, previous.roleGrant).role === grant.role;
      const automaticUsed = this.events(workflow).filter(
        (e) =>
          e.transition === "kernel.automatic-work" &&
          e.evidence.workflowGrant === parent.id,
      ).length;
      if (
        !operationalRetry &&
        automaticUsed >= (parent.maxAutomaticWork ?? parent.maxAllocations)
      )
        throw new Error("gate: workflow automatic-work budget exhausted");
      const active = Object.keys(this.project.workflows)
        .flatMap((w) => this.executions(w))
        .some(
          (e) =>
            e.session === session.id &&
            ["allocated", "running"].includes(e.process),
        );
      if (active) throw new Error("session already executing a role");
      if (
        !grant.capabilities.every((c) =>
          session.profile.capabilities.includes(c),
        ) ||
        (grant.executorConstraints.protected &&
          !session.profile.isolation.includes("private-workspace")) ||
        (grant.executorConstraints.model !== undefined &&
          session.profile.model !== grant.executorConstraints.model) ||
        (grant.executorConstraints.reasoning !== undefined &&
          session.profile.reasoning !== grant.executorConstraints.reasoning)
      )
        throw new Error("executor capabilities/isolation denied");
      const execution: Execution = {
        schemaVersion: 1,
        id: randomUUID(),
        workflowGrant: parent.id,
        roleGrant: grant.id,
        session: session.id,
        mode: request.mode,
        process: "allocated",
        attention: "working",
        failure: null,
        pid: null,
        predecessor: grant.predecessor,
        result: null,
        actions: [],
        requests: [],
        executor: {
          requested: {
            ...(grant.executorConstraints.model
              ? { model: grant.executorConstraints.model }
              : {}),
            ...(grant.executorConstraints.reasoning
              ? { reasoning: grant.executorConstraints.reasoning }
              : {}),
          },
          confirmed: {
            model: session.profile.model ?? null,
            reasoning: session.profile.reasoning ?? null,
          },
        },
      };
      // Record exposure before delivering any workspace or contract to an executor.
      for (const workspace of grant.workspaces)
        if (workspace.exposure !== "public")
          this.#append(workflow, "kernel.exposure", {
            schemaVersion: 1,
            session: session.id,
            execution: execution.id,
            exposure: workspace.exposure,
            workspace: workspace.id,
            roleGrant: grant.id,
          });
      this.#append(workflow, "kernel.session", {
        ...session,
        workspaces: grant.workspaces,
      });
      this.#append(workflow, "kernel.allocation", {
        workflowGrant: parent.id,
        grant,
        execution,
      });
      if (!operationalRetry)
        this.#append(workflow, "kernel.automatic-work", {
          workflowGrant: parent.id,
          execution: execution.id,
          roleGrant: grant.id,
          used: automaticUsed + 1,
        });
      const allocation = required(definition.roles[grant.role]).policy
        .onAllocate;
      if (allocation) {
        const evidence: Data = {
          authorityOrigin: "allocation",
          execution: execution.id,
          roleGrant: grant.id,
        };
        for (const [field, input] of Object.entries(allocation.fromInputs))
          evidence[field] = required(grant.inputs[input]);
        if (allocation.counterField)
          evidence[allocation.counterField] =
            scopedEvents(this.events(workflow), definition.policy).filter(
              (e) => e.transition === allocation.transition,
            ).length + 1;
        const scope = definition.policy.scopeEvent;
        if (scope)
          evidence[scope.field] =
            this.events(workflow).findLast(
              (e) => e.transition === scope.transition,
            )?.evidence[scope.field] ?? scope.initial;
        this.#append(workflow, allocation.transition, evidence);
      }
      this.#telemetry("allocated", execution);
      return { execution, grant, duplicate: false };
    });
  }
  revokeWorkspaces(workflow: string, sessionId: string): void {
    this.#transaction(workflow, () => {
      this.#append(workflow, "kernel.session", {
        ...this.session(sessionId),
        workspaces: [],
      });
    });
  }
  process(
    workflow: string,
    id: string,
    state: Execution["process"],
    pid: number | null = null,
    failure: string | null = null,
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      if (!["allocated", "running"].includes(execution.process))
        throw new Error("process already terminal");
      this.#append(workflow, "kernel.process", {
        execution: id,
        update: {
          process: state,
          pid: pid ?? execution.pid,
          failure,
          attention: ["allocated", "running"].includes(state)
            ? execution.attention
            : "terminal",
        },
      });
      const next = this.execution(workflow, id);
      this.#telemetry(state, next);
      return next;
    });
  }
  recover(): void {
    for (const workflow of Object.keys(this.project.workflows)) {
      const lock = `${this.path(workflow)}.lock`;
      try {
        const owner = Number(readFileSync(resolve(lock, "owner"), "utf8"));
        if (!Number.isSafeInteger(owner) || owner < 1)
          throw new Error("invalid authority lock owner");
        try {
          process.kill(owner, 0);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ESRCH")
            rmSync(lock, { recursive: true });
          else throw error;
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      for (const run of this.executions(workflow))
        if (["allocated", "running"].includes(run.process))
          this.process(
            workflow,
            run.id,
            "interrupted",
            null,
            "host recovery could not reattach executor",
          );
    }
  }
  continuationStopped(
    workflow: string,
    workflowGrant: string,
    reason: string,
  ): void {
    this.#transaction(workflow, () => {
      this.#append(workflow, "kernel.continuation-stopped", {
        workflowGrant,
        reason,
      });
    });
  }
  result(
    workflow: string,
    id: string,
    disposition: string,
    methodology: Data,
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      if (
        execution.result ||
        execution.superseded ||
        execution.attention === "WAITING_FOR_HUMAN" ||
        !["allocated", "running", "exited"].includes(execution.process)
      )
        throw new Error("result not permitted in this execution state");
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const role = required(
        this.definition(workflow, grant.methodology).roles[grant.role],
      );
      const resultConstraints = role.contract.resultConstraints ?? [];
      if (
        !role.contract.results.includes(disposition) ||
        !Object.entries(methodology).every(
          ([key, value]) =>
            typeof value === "string" &&
            role.contract.methodology[key]?.includes(value),
        )
      )
        throw new Error("result violates pinned contract");
      if (
        resultConstraints.some(
          (constraint) =>
            matches(methodology, constraint.when) &&
            (!constraint.required?.every((field) => field in methodology) ||
              constraint.absent?.some((field) => field in methodology)),
        )
      )
        throw new Error("result violates pinned cross-field contract");
      const matchingOutcomes = role.policy.outcomes.filter(
        (rule) =>
          rule.disposition === disposition &&
          matches(methodology, rule.methodology ?? {}),
      );
      if (resultConstraints.length && matchingOutcomes.length !== 1)
        throw new Error("result lacks an explicit configured outcome");
      for (const path of disposition === "succeeded"
        ? role.contract.postconditions
        : [])
        inside(
          resolve(
            this.project.root,
            required(this.project.workflows[workflow]).directory,
          ),
          path,
        );
      const result: RoleResult = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        roleGrant: grant.id,
        disposition,
        methodology,
      };
      this.#append(workflow, "kernel.result", result);
      this.#transition(workflow, id);
      const next = this.execution(workflow, id);
      this.#telemetry("semantic-result", next);
      return next;
    });
  }
  #transition(workflow: string, id: string): void {
    const execution = this.execution(workflow, id);
    if (!execution.result) return;
    const events = this.events(workflow);
    if (
      events.some(
        (e) =>
          e.transition === "kernel.transition" && e.evidence.execution === id,
      )
    )
      return;
    const grant = this.roleGrant(workflow, execution.roleGrant);
    const policy = required(
      this.definition(workflow, grant.methodology).roles[grant.role],
    ).policy;
    const result = execution.result;
    const rules = policy.outcomes.filter(
      (r) =>
        r.disposition === result.disposition &&
        matches(result.methodology, r.methodology ?? {}) &&
        (r.requiredActions ?? []).every((kind) =>
          execution.actions.some(
            (a) => a.request.kind === kind && a.status === "succeeded",
          ),
        ),
    );
    if (rules.length !== 1) return;
    const rule = required(rules[0]);
    if (
      events.some(
        (e) =>
          e.transition === rule.transition &&
          e.evidence.semanticResult === result.id,
      )
    )
      return;
    const evidence: Data = { ...rule.evidence?.fields };
    try {
      const pinned = this.definition(workflow, grant.methodology);
      if (
        Object.entries(pinned.validators).some(
          ([name, identity]) =>
            this.options.validators?.[name]?.identity !== identity,
        )
      )
        throw new Error("pinned validator implementation unavailable");
      if (rule.evidence?.allocation)
        Object.assign(
          evidence,
          required(
            events.findLast(
              (e) =>
                e.transition === rule.evidence?.allocation &&
                e.evidence.execution === id,
            ),
            "transition requires its exact allocation",
          ).evidence,
        );
      delete evidence.authorityOrigin;
      if (rule.evidence?.counterField)
        evidence[rule.evidence.counterField] =
          scopedEvents(
            events,
            this.definition(workflow, grant.methodology).policy,
          ).filter((e) => e.transition === rule.transition).length + 1;
      let artifactCommit: string | undefined;
      if (rule.evidence?.artifact || rule.evidence?.commitHead) {
        artifactCommit = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: this.project.root,
          encoding: "utf8",
        }).trim();
        if (evidence.commit === undefined) evidence.commit = artifactCommit;
        else evidence.artifactCommit = artifactCommit;
      }
      if (rule.evidence?.artifact) {
        const path = inside(
          resolve(
            this.project.root,
            required(this.project.workflows[workflow]).directory,
          ),
          rule.evidence.artifact,
        );
        const bytes = readFileSync(path);
        if (rule.evidence.validator)
          required(
            this.options.validators?.[rule.evidence.validator],
            "pinned validator unavailable",
          ).validate(JSON.parse(bytes.toString("utf8")), {
            projectRoot: this.project.root,
            workflowDirectory: required(this.project.workflows[workflow])
              .directory,
            inputs: grant.inputs,
            result: result.methodology,
          });
        if (
          identity(
            execFileSync(
              "git",
              [
                "show",
                `${required(artifactCommit)}:${relative(this.project.root, path)}`,
              ],
              { cwd: this.project.root },
            ),
          ) !== identity(bytes)
        )
          throw new Error(
            "transition artifact lacks exact committed provenance",
          );
        for (const [field, value] of Object.entries(
          rule.evidence.jsonChecks ?? {},
        )) {
          const parsed: unknown = JSON.parse(bytes.toString("utf8"));
          const actual = field
            .split(".")
            .reduce<unknown>((current, key) => object(current)[key], parsed);
          if (contentId(actual) !== contentId(value))
            throw new Error(`transition artifact check failed: ${field}`);
        }
        evidence.path = rule.evidence.artifact;
        evidence.identity = identity(bytes);
      }
    } catch (error) {
      this.#append(workflow, "kernel.transition-blocked", {
        execution: id,
        reason: (error as Error).message,
      });
      return;
    }
    const definition = this.definition(workflow, grant.methodology);
    const scope = definition.policy.scopeEvent;
    if (scope)
      evidence[scope.field] =
        events.findLast((e) => e.transition === scope.transition)?.evidence[
          scope.field
        ] ?? scope.initial;
    this.#append(workflow, rule.transition, {
      ...execution.result.methodology,
      ...evidence,
      execution: id,
      roleGrant: grant.id,
      semanticResult: execution.result.id,
      inputs: grant.inputs,
    });
    this.#append(workflow, "kernel.transition", {
      execution: id,
      result: execution.result.id,
    });
  }
  root(
    workflow: string,
    workflowGrant: string,
    role: string,
    reason: string,
    uses = 1,
  ): RootAuthority {
    return this.#transaction(workflow, () => {
      const parent = this.grant(workflow, workflowGrant);
      if (
        !parent.roles.includes(role) ||
        !reason ||
        !Number.isSafeInteger(uses) ||
        uses < 1 ||
        uses > parent.maxAllocations
      )
        throw new Error("invalid bounded root authority");
      const root: RootAuthority = {
        schemaVersion: 1,
        id: randomUUID(),
        workflowGrant,
        project: this.project.id,
        workflow,
        basis: authorityBasis(this.events(workflow)),
        role,
        reason,
        origin: "human",
        uses,
        change: "permit-role",
      };
      this.#append(workflow, "kernel.root", root);
      return root;
    });
  }
  ask(
    workflow: string,
    id: string,
    kind: HumanRequest["kind"],
    question: string,
    permission: string | null,
  ): HumanRequest {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const contract = required(
        this.definition(workflow, grant.methodology).roles[grant.role],
      ).contract;
      if (
        execution.process !== "running" ||
        execution.result ||
        execution.attention === "WAITING_FOR_HUMAN" ||
        !contract.human.includes(kind) ||
        !question ||
        (kind !== "input" && !permission)
      )
        throw new Error("human interaction denied");
      const request: HumanRequest = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        kind,
        question,
        permission,
        response: null,
      };
      if (kind === "input" && permission !== null)
        throw new Error(
          "permission changes require an approval or root request",
        );
      if (grant.executorConstraints.protected) {
        writeFileSync(
          this.#privatePath(request.id),
          JSON.stringify({ schemaVersion: 1, question, permission }),
          { mode: 0o600, flag: "wx" },
        );
        request.question = "[private human request]";
        request.permission = permission === null ? null : identity(permission);
      }
      this.#append(workflow, "kernel.human-request", request);
      this.#telemetry("waiting-for-human", execution);
      return request;
    });
  }
  respond(
    workflow: string,
    id: string,
    requestId: string,
    value: string,
  ): Execution {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const request = execution.requests.find((r) => r.id === requestId);
      if (
        !request ||
        request.response ||
        execution.attention !== "WAITING_FOR_HUMAN" ||
        execution.process !== "running"
      )
        throw new Error("human response does not bind an outstanding request");
      const responseId = randomUUID();
      const protectedRequest = this.roleGrant(workflow, execution.roleGrant)
        .executorConstraints.protected;
      let authority: string | null = null;
      if (request.kind !== "input") {
        const grant = this.roleGrant(workflow, execution.roleGrant);
        const root: RootAuthority = {
          schemaVersion: 1,
          id: randomUUID(),
          workflowGrant: execution.workflowGrant,
          project: this.project.id,
          workflow,
          basis: authorityBasis(this.events(workflow)),
          role: grant.role,
          reason: `human response to ${requestId}`,
          origin: "human",
          uses: 1,
          change: "human-response",
          execution: id,
          request: requestId,
          permission: required(request.permission),
          decision: {
            response: responseId,
            value: protectedRequest ? identity(value) : value,
          },
        };
        authority = root.id;
        this.#append(workflow, "kernel.root", root);
      }
      if (protectedRequest)
        writeFileSync(
          this.#privatePath(responseId),
          JSON.stringify({ schemaVersion: 1, value }),
          { mode: 0o600, flag: "wx" },
        );
      this.#append(workflow, "kernel.human-response", {
        execution: id,
        request: requestId,
        response: {
          schemaVersion: 1,
          id: responseId,
          value: protectedRequest ? "[private human response]" : value,
          authority,
        },
      });
      const next = this.execution(workflow, id);
      this.#telemetry("resumed", next);
      return next;
    });
  }
  publish(
    workflow: string,
    id: string,
    workspace: string,
    commit: string,
    ref: string,
  ): HostActionResult {
    return this.#transaction(workflow, () => {
      const execution = this.execution(workflow, id);
      const grant = this.roleGrant(workflow, execution.roleGrant);
      const request: HostActionRequest = {
        schemaVersion: 1,
        id: randomUUID(),
        execution: id,
        roleGrant: grant.id,
        kind: "publication",
        workspace,
        commit,
        ref,
      };
      this.#append(workflow, "kernel.action-request", { ...request });
      const action: HostActionResult = {
        schemaVersion: 1,
        id: randomUUID(),
        request,
        status: "denied",
        before: null,
        after: null,
        reason: null,
        directPublication: false,
      };
      try {
        const allowed = grant.hostActions.publication;
        if (
          !allowed ||
          execution.superseded ||
          allowed.workspace !== workspace ||
          allowed.commit !== commit ||
          allowed.ref !== ref ||
          execution.attention === "WAITING_FOR_HUMAN" ||
          ["interrupted", "cancelled", "failed"].includes(execution.process)
        )
          throw new Error("publication outside role grant");
        if (!/^refs\/heads\/[A-Za-z0-9._/-]+$/.test(ref) || ref.includes(".."))
          throw new Error("invalid publication ref");
        const repo =
          this.project.workflows[workflow]?.workspaces?.[workspace] ??
          this.project.workspaces[workspace];
        const remote = this.project.remotes[allowed.remote];
        if (
          !repo ||
          !remote ||
          !grant.workspaces.some(
            (w) => w.id === repo.id && w.path === repo.path,
          )
        )
          throw new Error("publication repository/remote mismatch");
        // Resolve symlinks and check every declared executor workspace, not only
        // the requesting role's view. A remote must remain host-owned.
        action.status = "failed";
        const remotePath = realpathSync(remote);
        const workspaces = [
          ...Object.values(this.project.workspaces),
          ...Object.values(this.project.workflows).flatMap((w) =>
            Object.values(w.workspaces ?? {}),
          ),
        ];
        if (
          workspaces.some((w) => {
            const delta = relative(realpathSync(w.path), remotePath);
            return (
              delta === "" ||
              (!delta.startsWith("../") &&
                delta !== ".." &&
                !delta.startsWith("/"))
            );
          })
        ) {
          action.status = "denied";
          throw new Error(
            "host publication remote overlaps an executor workspace",
          );
        }
        const git = (args: string[]): string =>
          execFileSync("git", args, {
            cwd: repo.path,
            encoding: "utf8",
            stdio: "pipe",
          }).trim();
        if (git(["rev-parse", `${commit}^{commit}`]) !== commit)
          throw new Error("not an exact commit identity");
        git(["merge-base", "--is-ancestor", allowed.base, commit]);
        action.status = "failed";
        const remoteTip = (): string | null =>
          git(["ls-remote", "--refs", remotePath, ref]).split(/\s/)[0] || null;
        action.before = remoteTip();
        if (action.before !== null) {
          // Obtain the actual remote object; a stale tracking ref is not authority.
          git(["fetch", "--no-tags", remotePath, ref]);
          git(["merge-base", "--is-ancestor", action.before, commit]);
        }
        git([
          "push",
          `--force-with-lease=${ref}:${action.before ?? ""}`,
          remotePath,
          `${commit}:${ref}`,
        ]);
        action.after = remoteTip();
        if (action.after !== commit)
          throw new Error("remote did not retain the requested ref");
        action.status = "succeeded";
      } catch (error) {
        action.reason =
          (error as Error).message.split("\n")[0] ?? "publication failed";
      }
      this.#append(workflow, "kernel.action-result", {
        ...action,
        execution: id,
      });
      this.#transition(workflow, id);
      this.#telemetry("host-action", execution, action.id);
      return action;
    });
  }
  #telemetry(type: string, execution: Execution, action?: string): void {
    try {
      const emitted = this.options.telemetry?.({
        schemaVersion: 1,
        source: "host",
        type,
        at: new Date().toISOString(),
        workflowGrant: execution.workflowGrant,
        roleGrant: execution.roleGrant,
        execution: execution.id,
        session: execution.session,
        ...(action ? { action } : {}),
      });
      if (emitted) void emitted.catch(() => {});
    } catch {
      /* Observability cannot decide authority. */
    }
  }
}
