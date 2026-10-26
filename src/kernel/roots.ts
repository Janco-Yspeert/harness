// Project/methodology root separation checks (Spike 014e, design-map D2, D3
// and D5). An external project is one whose configuration names a
// `methodologyRoot`. Its roots, workspaces, remotes and origin are resolved
// from real paths and actual Git state, and every mismatch fails closed at
// host start, before any grant, session or provider process exists.
import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Project } from "./model.ts";

function refuse(reason: string): never {
  throw new Error(`external project refused: ${reason}`);
}

function git(root: string, args: readonly string[]): string {
  try {
    return execFileSync("git", [...args], {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (error) {
    const completed = error as { status?: unknown; stdout?: unknown };
    if (completed.status === 0 && typeof completed.stdout === "string")
      return completed.stdout;
    throw error;
  }
}

export function external(project: Project): boolean {
  return project.methodologyRoot !== undefined;
}

// The root that policy, trusted history and validator sources resolve in.
export function methodologyRoot(project: Project): string {
  return project.methodologyRoot ?? project.root;
}

export function gitTopLevel(path: string): string {
  return realpathSync(git(path, ["rev-parse", "--show-toplevel"]).trim());
}

// `a` equals or contains `b` (both real paths).
export function contains(a: string, b: string): boolean {
  const delta = relative(a, b);
  return (
    delta === "" ||
    (!delta.startsWith("../") && delta !== ".." && !isAbsolute(delta))
  );
}

function real(path: string, what: string): string {
  if (!existsSync(path)) refuse(`${what} does not exist`);
  return realpathSync(path);
}

// Recognized spellings only (D5); anything else is not an identity.
export function normalizeOrigin(url: string): string | undefined {
  const match =
    /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(
      url,
    ) ??
    /^git@github\.com:([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(
      url,
    ) ??
    /^ssh:\/\/git@github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(
      url,
    );
  return match ? `github.com/${match[1] ?? ""}/${match[2] ?? ""}` : undefined;
}

function originUrl(repository: string): string | undefined {
  try {
    return execFileSync("git", ["config", "--get", "remote.origin.url"], {
      cwd: repository,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
  } catch {
    return undefined;
  }
}

// The Harness checkout this host's code runs from.
export function installedRuntimeRoot(): string {
  return gitTopLevel(dirname(fileURLToPath(import.meta.url)));
}

// The exact committed runtime (D3). Uncommitted changes to tracked files
// mean the running host is not an identifiable commit, so it is refused.
export function runtimeCommit(root: string): {
  repository: string;
  commit: string;
} {
  let repository: string;
  let commit: string;
  let dirty: string;
  try {
    repository = gitTopLevel(root);
    commit = git(repository, ["rev-parse", "HEAD"]).trim();
    dirty = git(repository, [
      "status",
      "--porcelain",
      "--untracked-files=no",
    ]).trim();
  } catch {
    refuse("Harness runtime is not a Git checkout");
  }
  if (dirty)
    refuse("Harness runtime checkout has uncommitted changes to tracked files");
  if (!/^[a-f0-9]{40}$/.test(commit))
    refuse("Harness runtime commit is not exact");
  return { repository, commit };
}

export interface ExternalRoots {
  readonly projectRepository: string;
  readonly methodologyRepository: string;
}

// Fail-closed structural checks for an external project (D2 invariants, D5).
export function assertExternalProject(
  project: Project,
  options: { privateDataRoot?: string } = {},
): ExternalRoots {
  if (!project.methodologyRoot) refuse("no methodology root is configured");
  if (!project.trustedHistory) refuse("no trusted history is configured");
  const projectRoot = real(project.root, "project root");
  const methodology = real(project.methodologyRoot, "methodology root");
  let projectRepository: string;
  let methodologyRepository: string;
  try {
    projectRepository = gitTopLevel(projectRoot);
  } catch {
    refuse("project root is not inside a Git repository");
  }
  try {
    methodologyRepository = gitTopLevel(methodology);
  } catch {
    refuse("methodology root is not inside a Git repository");
  }
  if (projectRepository !== projectRoot)
    refuse("project root is not its Git repository top level");
  if (
    contains(methodologyRepository, projectRepository) ||
    contains(projectRepository, methodologyRepository)
  )
    refuse("project and methodology repositories overlap");
  const workspaces = [
    ...Object.entries(project.workspaces),
    ...Object.values(project.workflows).flatMap((w) =>
      Object.entries(w.workspaces ?? {}),
    ),
  ];
  const seen: Array<{ id: string; path: string }> = [];
  for (const [name, workspace] of workspaces) {
    const path = real(workspace.path, `workspace ${name}`);
    if (
      contains(methodologyRepository, path) ||
      contains(path, methodologyRepository)
    )
      refuse(`workspace ${name} overlaps the methodology repository`);
    const inProject = contains(projectRepository, path);
    if (workspace.exposure === "public" && !inProject)
      refuse(`public workspace ${name} is outside the project repository`);
    if (
      workspace.exposure !== "public" &&
      (contains(projectRepository, path) || contains(path, projectRepository))
    )
      refuse(`private workspace ${name} overlaps the project repository`);
    for (const other of seen)
      if (
        other.id !== workspace.id &&
        (contains(other.path, path) || contains(path, other.path))
      )
        refuse(`workspace ${name} overlaps workspace ${other.id}`);
    seen.push({ id: workspace.id, path });
  }
  for (const [key, workflow] of Object.entries(project.workflows)) {
    const directory = resolve(project.root, workflow.directory);
    if (!contains(projectRepository, real(directory, `workflow ${key}`)))
      refuse(`workflow ${key} ledger is outside the project repository`);
  }
  if (options.privateDataRoot) {
    const target = resolve(options.privateDataRoot);
    const privateRoot = existsSync(target) ? realpathSync(target) : target;
    if (
      [projectRepository, ...seen.map((item) => item.path)].some(
        (path) => contains(path, privateRoot) || contains(privateRoot, path),
      )
    )
      refuse("private data root overlaps a project workspace");
  }
  const methodologyOrigin = originUrl(methodologyRepository);
  const methodologyIdentity = methodologyOrigin
    ? normalizeOrigin(methodologyOrigin)
    : undefined;
  for (const [name, remote] of Object.entries(project.remotes)) {
    const target = existsSync(remote) ? realpathSync(remote) : resolve(remote);
    if (
      contains(methodologyRepository, target) ||
      contains(target, methodologyRepository)
    )
      refuse(`remote ${name} names the methodology repository`);
  }
  if (project.origin !== undefined) {
    if (methodologyIdentity === project.origin)
      refuse("project origin names the methodology repository");
    const actual = originUrl(projectRepository);
    if (actual === undefined) refuse("project repository has no origin remote");
    const normalized = normalizeOrigin(actual);
    if (normalized === undefined)
      refuse("project origin remote has an unrecognized spelling");
    if (normalized !== project.origin)
      refuse("project origin remote does not match the configured identity");
  }
  return { projectRepository, methodologyRepository };
}
