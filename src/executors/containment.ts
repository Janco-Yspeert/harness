// Host-owned operating-system containment for every spawned governed provider
// process, for the Harness repository and external projects alike (Spike 014e
// design-map D4, generalized by Spike 014h).
//
// Every provider subprocess, and therefore every shell, `git`, test runner and
// the worker tool server it starts, runs inside a bubblewrap mount, PID and
// user namespace whose visible filesystem is built only from:
// - the granted workspaces at their grant mode;
// - the execution scratch directory (which holds a scratch HOME);
// - read-only system runtime paths, the located provider program and Node;
// - the read-only Harness worker-tools module closure.
// Nothing else of the operator's home, the Harness checkout, other workspaces,
// the host private data root or ledgers is visible. The launch environment is
// an allowlist without Git or forge credentials. There is no unwrapped
// fallback: when bubblewrap or unprivileged namespaces are unavailable, or a
// provider's own nested sandbox cannot start inside the wrap, the launch is
// refused before any session exists.
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

import { AdapterRefusal, locateProvider, type ProviderId } from "./adapters.ts";

const NAMESPACES = [
  "--unshare-user",
  "--unshare-pid",
  "--unshare-ipc",
  "--unshare-uts",
  "--unshare-cgroup-try",
  "--die-with-parent",
];
const SYSTEM_DIRECTORIES = ["/usr", "/etc"];
const SYSTEM_LINKS = ["/bin", "/sbin", "/lib", "/lib32", "/lib64", "/libx32"];

function contains(a: string, b: string): boolean {
  const delta = relative(a, b);
  return (
    delta === "" ||
    (!delta.startsWith("../") && delta !== ".." && !isAbsolute(delta))
  );
}

// Locates bubblewrap like a provider: on the host PATH, never in temporary
// directories or workspaces.
export function locateContainment(
  excluded: readonly string[],
): { ok: true; path: string } | { ok: false; reason: string } {
  const located = locateProvider("bwrap", process.env.PATH, excluded);
  return located.ok
    ? located
    : { ok: false, reason: "bubblewrap (bwrap) is not installed" };
}

// Proves that this host can actually create the namespaces before any
// session or allocation exists.
export function probeContainment(bwrap: string): void {
  try {
    execFileSync(bwrap, [...NAMESPACES, "--ro-bind", "/", "/", "true"], {
      stdio: "pipe",
      timeout: 10_000,
    });
  } catch {
    throw new AdapterRefusal(
      "permission-denied",
      "operating-system containment is unavailable (unprivileged namespaces denied)",
    );
  }
}

function packageRoot(program: string): string {
  const marker = "/node_modules/";
  const index = program.lastIndexOf(marker);
  if (index < 0) return dirname(program);
  const rest = program.slice(index + marker.length).split("/");
  const name =
    rest[0]?.startsWith("@") === true
      ? `${rest[0]}/${rest[1] ?? ""}`
      : (rest[0] ?? "");
  return join(program.slice(0, index + marker.length), name);
}

export interface ContainmentInput {
  readonly bwrap: string;
  readonly provider: ProviderId;
  readonly program: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly workspaces: ReadonlyArray<{ path: string; mode: "read" | "write" }>;
  readonly scratch: string;
  readonly nodePath: string;
  // Read-only files of the Harness worker-tools closure.
  readonly toolFiles: readonly string[];
  // Existing files inside visible workspaces hidden from the worker (ledgers).
  readonly masked: readonly string[];
  // Roots that must never become visible through a runtime binding.
  readonly protectedRoots: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly sourceEnv?: NodeJS.ProcessEnv;
}

// Resolves every granted root before launch and refuses what cannot be
// represented safely: an unresolvable root, a duplicate, a root nested inside
// another with a different mode, or a root overlapping the writable scratch.
function resolveWorkspaces(
  granted: ContainmentInput["workspaces"],
  scratchPath?: string,
): Array<{ path: string; mode: "read" | "write" }> {
  const refuse = (message: string): never => {
    throw new AdapterRefusal("provider-config-invalid", message);
  };
  const real = (path: string, what: string): string => {
    try {
      return realpathSync(path);
    } catch {
      return refuse(`${what} cannot be resolved`);
    }
  };
  const scratch =
    scratchPath === undefined ? undefined : real(scratchPath, "scratch");
  const resolved = granted.map((workspace) => ({
    ...workspace,
    path: real(workspace.path, "granted workspace"),
  }));
  for (const [index, a] of resolved.entries()) {
    if (a.path === "/") refuse("a granted workspace cannot be the root");
    if (
      scratch !== undefined &&
      (contains(a.path, scratch) || contains(scratch, a.path))
    )
      refuse("a granted workspace overlaps the execution scratch");
    for (const b of resolved.slice(index + 1))
      if (
        contains(a.path, b.path) || contains(b.path, a.path)
          ? a.path === b.path || a.mode !== b.mode
          : false
      )
        refuse("granted workspaces overlap unsafely");
  }
  return resolved.sort((a, b) => a.path.length - b.path.length);
}

// Pre-launch validation of a grant's workspaces (host refusal before any
// session exists); the launcher applies the same checks when it builds mounts.
export function assertWorkspaces(
  workspaces: ContainmentInput["workspaces"],
): void {
  resolveWorkspaces(workspaces);
}

function runtimeBinding(
  path: string,
  what: string,
  protectedRoots: readonly string[],
): string {
  const root = realpathSync(path);
  if (root === "/" || protectedRoots.some((item) => contains(root, item)))
    throw new AdapterRefusal(
      "provider-config-invalid",
      `${what} location would expose a protected path inside containment`,
    );
  return root;
}

// The Node runtime outside /usr: the executable itself, its global module
// directory and the launcher links in its bin directory that point into those
// modules (npm, npx, corepack). Binding the whole installation prefix instead
// would expose unrelated siblings, for example all of ~/.local when Node lives
// in ~/.local/bin.
function nodeRuntime(
  nodePath: string,
  protectedRoots: readonly string[],
): string[] {
  const node = runtimeBinding(nodePath, "Node runtime", protectedRoots);
  if (contains("/usr", node)) return [];
  const args = ["--ro-bind", node, node];
  const bin = dirname(node);
  const modules = join(dirname(bin), "lib", "node_modules");
  let moduleRoot: string;
  try {
    if (!lstatSync(modules).isDirectory()) return args;
    moduleRoot = runtimeBinding(modules, "Node runtime", protectedRoots);
  } catch (error) {
    if (error instanceof AdapterRefusal) throw error;
    return args;
  }
  args.push("--ro-bind", moduleRoot, moduleRoot);
  for (const entry of readdirSync(bin)) {
    const link = join(bin, entry);
    try {
      if (!lstatSync(link).isSymbolicLink()) continue;
      if (contains(moduleRoot, realpathSync(link)))
        args.push("--symlink", readlinkSync(link), link);
    } catch {
      /* dangling launcher link */
    }
  }
  return args;
}

function copyPrivate(source: string, target: string): boolean {
  try {
    if (!lstatSync(source).isFile()) return false;
  } catch {
    return false;
  }
  mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
  copyFileSync(source, target);
  return true;
}

// Builds the scratch HOME with only the launched provider's own
// authentication material and a credential-free Git identity.
function scratchHome(input: ContainmentInput): {
  home: string;
  env: Record<string, string>;
} {
  const source = input.sourceEnv ?? process.env;
  const home = join(input.scratch, "home");
  mkdirSync(home, { recursive: true, mode: 0o700 });
  const env: Record<string, string> = {};
  const realHome = source.HOME ?? homedir();
  if (input.provider === "claude") {
    const config = source.CLAUDE_CONFIG_DIR ?? join(realHome, ".claude");
    const target = join(home, ".claude");
    copyPrivate(
      join(config, ".credentials.json"),
      join(target, ".credentials.json"),
    );
    const state = source.CLAUDE_CONFIG_DIR
      ? join(config, ".claude.json")
      : join(realHome, ".claude.json");
    try {
      const parsed = JSON.parse(readFileSync(state, "utf8")) as Record<
        string,
        unknown
      >;
      // Other projects' histories are not provider authentication material.
      delete parsed.projects;
      delete parsed.githubRepoPaths;
      writeFileSync(
        source.CLAUDE_CONFIG_DIR
          ? join(target, ".claude.json")
          : join(home, ".claude.json"),
        JSON.stringify(parsed),
        { mode: 0o600 },
      );
    } catch {
      /* no provider state to carry */
    }
    if (source.CLAUDE_CONFIG_DIR) env.CLAUDE_CONFIG_DIR = target;
  } else {
    const config = source.CODEX_HOME ?? join(realHome, ".codex");
    const target = join(home, ".codex");
    mkdirSync(target, { recursive: true, mode: 0o700 });
    copyPrivate(join(config, "auth.json"), join(target, "auth.json"));
    if (source.CODEX_HOME) env.CODEX_HOME = target;
  }
  const identity = (key: string): string | undefined => {
    try {
      const value = execFileSync("git", ["config", "--global", "--get", key], {
        encoding: "utf8",
        stdio: "pipe",
        env: { PATH: source.PATH ?? "", HOME: realHome },
      }).trim();
      return /^[^\n\r"\\]{1,200}$/.test(value) ? value : undefined;
    } catch {
      return undefined;
    }
  };
  const name = identity("user.name");
  const email = identity("user.email");
  writeFileSync(
    join(home, ".gitconfig"),
    `[user]\n${name ? `\tname = ${name}\n` : ""}${email ? `\temail = ${email}\n` : ""}`,
    { mode: 0o600 },
  );
  return { home, env };
}

// The contained command and its environment. Pure argument construction plus
// scratch-HOME preparation; the caller spawns it.
export function containedLaunch(input: ContainmentInput): {
  program: string;
  args: string[];
  env: Record<string, string>;
} {
  const { home, env: homeEnv } = scratchHome(input);
  const args: string[] = [...NAMESPACES, "--proc", "/proc", "--dev", "/dev"];
  for (const directory of SYSTEM_DIRECTORIES)
    if (existsSync(directory)) args.push("--ro-bind", directory, directory);
  for (const link of SYSTEM_LINKS) {
    let stat;
    try {
      stat = lstatSync(link);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) args.push("--symlink", readlinkSync(link), link);
    else args.push("--ro-bind", link, link);
  }
  // DNS configuration commonly links into /run; expose only that file.
  try {
    const resolver = realpathSync("/etc/resolv.conf");
    if (!resolver.startsWith("/etc/") && !resolver.startsWith("/usr/"))
      args.push("--ro-bind", resolver, resolver);
  } catch {
    /* no resolver configuration */
  }
  args.push("--tmpfs", "/tmp");
  args.push(...nodeRuntime(input.nodePath, input.protectedRoots));
  const program = realpathSync(input.program);
  const programRoot = runtimeBinding(
    packageRoot(program),
    "provider program",
    input.protectedRoots,
  );
  if (!contains("/usr", programRoot))
    args.push("--ro-bind", programRoot, programRoot);
  for (const file of input.toolFiles) {
    const real = realpathSync(file);
    args.push("--ro-bind", real, real);
  }
  const workspaces = resolveWorkspaces(input.workspaces, input.scratch);
  for (const workspace of workspaces)
    args.push(
      workspace.mode === "write" ? "--bind" : "--ro-bind",
      workspace.path,
      workspace.path,
    );
  for (const file of input.masked)
    if (existsSync(file))
      args.push("--ro-bind", "/dev/null", realpathSync(file));
  const scratch = realpathSync(input.scratch);
  // The namespace root (and the parent directories bubblewrap created on it)
  // is read-only; only the explicit bind mounts above and the private /tmp
  // are writable. /tmp is a tmpfs that exists only inside this namespace: it
  // exposes and persists no host path, and a provider's own nested sandbox
  // needs it writable to create its mount points (Codex protects /tmp/.git as
  // a writable root). TMPDIR still points into the scratch bind.
  args.push("--bind", scratch, scratch);
  args.push("--remount-ro", "/");
  args.push("--chdir", realpathSync(input.cwd));
  args.push("--", program, ...input.args);
  const env: Record<string, string> = { ...input.env, ...homeEnv, HOME: home };
  delete env.XDG_CONFIG_HOME;
  if (!homeEnv.CODEX_HOME) delete env.CODEX_HOME;
  if (!homeEnv.CLAUDE_CONFIG_DIR) delete env.CLAUDE_CONFIG_DIR;
  env.GIT_TERMINAL_PROMPT = "0";
  env.GIT_CONFIG_NOSYSTEM = "1";
  return { program: input.bwrap, args, env };
}

// Proves, before any session or allocation exists, that a provider's own
// nested namespace sandbox can start inside the exact containment this launch
// would use. The nested bubblewrap has the shape such sandboxes use: new user,
// PID and network namespaces, the contained filesystem read-only, the
// writable roots (granted write workspaces, scratch and /tmp) re-bound
// writable, and a new mount point created on a writable root for a protected
// path. A failure refuses the launch; there is no unwrapped fallback.
export function probeNestedSandbox(input: {
  readonly bwrap: string;
  readonly provider: ProviderId;
  readonly cwd: string;
  readonly workspaces: ReadonlyArray<{ path: string; mode: "read" | "write" }>;
  readonly nodePath: string;
  readonly masked: readonly string[];
  readonly protectedRoots: readonly string[];
}): void {
  const scratch = realpathSync(
    mkdtempSync(join(tmpdir(), "harness-nested-probe-")),
  );
  try {
    const nested = [
      "--unshare-user",
      "--unshare-pid",
      "--unshare-net",
      "--die-with-parent",
      "--ro-bind",
      "/",
      "/",
      "--dev",
      "/dev",
      "--proc",
      "/proc",
      "--bind",
      "/tmp",
      "/tmp",
    ];
    for (const workspace of input.workspaces)
      if (workspace.mode === "write") {
        const path = realpathSync(workspace.path);
        nested.push("--bind", path, path);
      }
    nested.push("--bind", scratch, scratch);
    nested.push("--ro-bind", "/dev/null", "/tmp/.harness-nested-probe");
    nested.push("--", "/bin/sh", "-c", "exit 0");
    const launch = containedLaunch({
      bwrap: input.bwrap,
      provider: input.provider,
      program: input.bwrap,
      args: nested,
      cwd: input.cwd,
      workspaces: input.workspaces,
      scratch,
      nodePath: input.nodePath,
      toolFiles: [],
      masked: input.masked,
      protectedRoots: input.protectedRoots,
      env: { PATH: process.env.PATH ?? "/usr/bin:/bin", TMPDIR: scratch },
    });
    execFileSync(launch.program, launch.args, {
      env: launch.env,
      stdio: "pipe",
      timeout: 10_000,
    });
  } catch (error) {
    if (error instanceof AdapterRefusal) throw error;
    throw new AdapterRefusal(
      "provider-config-invalid",
      `${input.provider} nested sandbox cannot start inside host containment`,
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export function workerToolFiles(workerToolsPath: string): string[] {
  const directory = dirname(workerToolsPath);
  const files = [workerToolsPath, resolve(directory, "protocol.ts")];
  // Nearest package.json keeps the module type of the tool server.
  let current = directory;
  while (current !== dirname(current)) {
    const manifest = join(current, "package.json");
    if (existsSync(manifest)) {
      files.push(manifest);
      break;
    }
    current = dirname(current);
  }
  return files;
}
