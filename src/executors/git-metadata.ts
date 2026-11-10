// Git metadata that must accompany a workspace into containment. Linked
// worktrees use a .git *file* that points to a per-worktree directory, whose
// commondir in turn points at the repository object/ref store. Treating that
// pointer as a directory is both incorrect and (for provider sandboxes) an
// invalid mount profile.
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

export interface WorkspaceGitMetadata {
  readonly workspace: string;
  readonly pointer: string;
  readonly gitDir: string;
  readonly commonDir: string;
  readonly linked: boolean;
  readonly readOnlyPaths: readonly string[];
}

function contains(parent: string, child: string): boolean {
  const delta = relative(parent, child);
  return delta === "" || (!delta.startsWith("../") && delta !== "..");
}

function requiredDirectory(path: string, label: string): string {
  try {
    if (!lstatSync(path).isDirectory())
      throw new Error(`${label} is not a directory`);
    return realpathSync(path);
  } catch (error) {
    throw new Error(
      `${label} cannot be resolved: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

function gitPath(base: string, value: string): string {
  return isAbsolute(value) ? value : resolve(base, value);
}

function linkValue(path: string, prefix?: string): string {
  let value: string;
  try {
    value = readFileSync(path, "utf8").trim();
  } catch (error) {
    throw new Error(
      `Git metadata link ${path} cannot be read: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
  const target =
    prefix === undefined
      ? value
      : value.startsWith(prefix)
        ? value.slice(prefix.length)
        : "";
  if (target.length === 0 || target.includes("\0"))
    throw new Error(`Git metadata link ${path} is invalid`);
  return target;
}

// Resolve only standard Git worktree metadata. A linked worktree must point
// back at its workspace and keep its per-worktree directory below the common
// Git directory, preventing a crafted .git file from turning containment into
// a general host-path mount mechanism.
export function resolveWorkspaceGitMetadata(
  workspace: string,
): WorkspaceGitMetadata | undefined {
  let root: string;
  try {
    root = realpathSync(workspace);
  } catch {
    // Command construction is intentionally pure enough for profile tests;
    // the containment launcher remains responsible for rejecting a missing
    // granted workspace before any provider is spawned.
    return undefined;
  }
  const pointer = join(root, ".git");
  let stat;
  try {
    stat = lstatSync(pointer);
  } catch {
    return undefined;
  }

  if (stat.isDirectory()) {
    const gitDir = realpathSync(pointer);
    return {
      workspace: root,
      pointer,
      gitDir,
      commonDir: gitDir,
      linked: false,
      readOnlyPaths: [join(gitDir, "hooks"), join(gitDir, "config")].filter(
        existsSync,
      ),
    };
  }
  if (!stat.isFile())
    throw new Error("workspace .git is neither a file nor a directory");

  const gitDir = requiredDirectory(
    gitPath(dirname(pointer), linkValue(pointer, "gitdir: ")),
    "linked worktree Git directory",
  );
  const backPointer = join(gitDir, "gitdir");
  const expectedPointer = realpathSync(pointer);
  const actualPointer = realpathSync(
    gitPath(dirname(backPointer), linkValue(backPointer)),
  );
  if (actualPointer !== expectedPointer)
    throw new Error(
      "linked worktree Git directory does not point back to its workspace",
    );

  const commonLink = join(gitDir, "commondir");
  const commonDir = existsSync(commonLink)
    ? requiredDirectory(
        gitPath(dirname(commonLink), linkValue(commonLink)),
        "linked worktree common Git directory",
      )
    : gitDir;
  if (!contains(commonDir, gitDir))
    throw new Error(
      "linked worktree Git directory escapes its common Git directory",
    );

  return {
    workspace: root,
    pointer,
    gitDir,
    commonDir,
    linked: true,
    readOnlyPaths: [
      join(commonDir, "hooks"),
      join(commonDir, "config"),
      join(gitDir, "hooks"),
      join(gitDir, "config"),
      join(gitDir, "config.worktree"),
    ].filter(existsSync),
  };
}
