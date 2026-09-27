// Evaluator-private support for 014d hidden tests (revision 001).
// Creates disposable clones of the exact committed project revision so that no
// hidden test mutates the evaluated checkout or depends on its working tree.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const PROJECT_ROOT = resolve(
  process.env.HARNESS_PROJECT_ROOT ?? process.cwd(),
);

export function git(root: string, args: readonly string[]): string {
  return execFileSync("git", [...args], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Harness evaluator fixture",
      GIT_AUTHOR_EMAIL: "evaluator-fixture@example.invalid",
      GIT_COMMITTER_NAME: "Harness evaluator fixture",
      GIT_COMMITTER_EMAIL: "evaluator-fixture@example.invalid",
    },
  }).trim();
}

export interface Clone {
  readonly directory: string;
  readonly root: string;
  readonly head: string;
  dispose(): void;
}

// Clone the committed HEAD of the evaluated project. Dependencies are shared by
// symlink with the evaluated project's installed runtime (no duplicate
// development environment).
export function cloneProject(label: string): Clone {
  const head = git(PROJECT_ROOT, ["rev-parse", "HEAD"]);
  const directory = mkdtempSync(join(tmpdir(), `harness-014d-eval-${label}-`));
  const root = join(directory, "repository");
  execFileSync(
    "git",
    ["clone", "--quiet", "--shared", "--no-checkout", PROJECT_ROOT, root],
    { stdio: "pipe" },
  );
  git(root, ["checkout", "--quiet", "--detach", head]);
  const modules = join(PROJECT_ROOT, "node_modules");
  if (existsSync(modules)) symlinkSync(modules, join(root, "node_modules"));
  return {
    directory,
    root,
    head,
    dispose: () => {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

export function commitPaths(
  root: string,
  paths: readonly string[],
  message: string,
): string {
  git(root, ["add", "--", ...paths]);
  git(root, ["commit", "--quiet", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}
