import { spawn, type ChildProcess } from "node:child_process";
import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { ExecutionKernel, type KernelOptions } from "./execution.ts";
import { object, required, text } from "./ledger.ts";
import type {
  Data,
  Execution,
  HumanRequest,
  PromotionArtifact,
} from "./model.ts";

export interface GovernedHostOptions extends KernelOptions {
  rootToken: string;
}
export class GovernedHost {
  readonly kernel: ExecutionKernel;
  readonly #rootToken: string;
  readonly #children = new Map<string, ChildProcess>();
  #closed = false;
  constructor(options: GovernedHostOptions) {
    if (options.rootToken.length < 32)
      throw new Error(
        "governed host requires a root credential of at least 32 characters",
      );
    this.#rootToken = options.rootToken;
    this.kernel = new ExecutionKernel(options);
    this.kernel.recover();
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
          if (bytes.length > 65536) throw new Error("request too large");
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
          ...(body.executor ? { executor: object(body.executor) } : {}),
        });
        if (grant.supersedes)
          this.#children.get(grant.supersedes)?.kill("SIGTERM");
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
        const profile = this.kernel.select(resolution.grant, "spawned");
        if (!profile?.command?.length)
          throw new Error("no eligible spawned executor");
        const registration = this.kernel.register(workflow, profile.id);
        const allocation = this.kernel.allocate(workflow, grantId, {
          session: registration.session.id,
          mode: "spawned",
          ...(role ? { role } : {}),
          ...(predecessor ? { predecessor } : {}),
        });
        if (!allocation.duplicate) {
          const [program, ...args] = profile.command;
          const address = request.socket.localPort;
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
          this.#children.set(allocation.execution.id, child);
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
              );
            this.#continue(workflow, grantId, required(address));
          });
        }
        send(201, allocation);
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
        if (sub === "promote") {
          const artifacts = body.artifacts;
          if (!Array.isArray(artifacts))
            throw new Error("promotion artifacts are required");
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
        if (sub === "cancel") {
          needRoot();
          this.#children.get(execution.id)?.kill("SIGTERM");
          send(
            200,
            this.kernel.process(
              workflow,
              execution.id,
              "cancelled",
              null,
              "explicit human cancellation",
            ),
          );
          return;
        }
      }
      send(404, { error: "unknown governed host operation" });
    } catch (error) {
      send(409, {
        error:
          error instanceof Error ? error.message : "governed request failed",
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
        if (!response.ok)
          this.kernel.continuationStopped(
            workflow,
            grantId,
            `automatic continuation rejected: ${await response.text()}`,
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
    for (const child of this.#children.values()) child.kill("SIGTERM");
    this.kernel.recover();
  }
}
