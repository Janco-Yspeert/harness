// Test-only helper: records a disposable human-bootstrap trust root for a
// temporary fixture project's *current* methodology, so tests exercise the
// production trust-equivalence gate instead of bypassing it. It never touches
// Harness's own trusted history or any committed fixture trust root.
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildMethodologyManifest,
  readTrustedHistory,
} from "../../src/methodology-evolution.ts";

const env = {
  ...process.env,
  GIT_AUTHOR_NAME: "Trust fixture",
  GIT_AUTHOR_EMAIL: "trust-fixture@example.invalid",
  GIT_COMMITTER_NAME: "Trust fixture",
  GIT_COMMITTER_EMAIL: "trust-fixture@example.invalid",
};
function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env,
  }).trim();
}

export function trustFixtureMethodology(
  root: string,
  options: {
    policy: string;
    methodologyPaths: string[];
    validatorSources?: Record<string, string>;
    history?: string;
  },
): { revision: string; methodology: string } {
  const history = join(root, options.history ?? "trusted.jsonl");
  if (!existsSync(join(root, ".git"))) git(root, ["init", "-q", "-b", "trust"]);
  const exclude = join(root, ".git", "info", "exclude");
  mkdirSync(dirname(exclude), { recursive: true });
  const name = options.history ?? "trusted.jsonl";
  if (!existsSync(exclude) || !readFileSync(exclude, "utf8").includes(name))
    appendFileSync(exclude, `\n/${name}\n`);
  const paths = [
    options.policy,
    ...options.methodologyPaths,
    ...Object.values(options.validatorSources ?? {}),
  ].filter((path) => existsSync(join(root, path)));
  if (git(root, ["status", "--porcelain", "--", ...paths])) {
    git(root, ["add", "--", ...paths]);
    git(root, [
      "commit",
      "-q",
      "-m",
      "trust fixture methodology",
      "--",
      ...paths,
    ]);
  }
  const built = buildMethodologyManifest(root, "HEAD", options.policy, {
    validatorSources: options.validatorSources ?? {},
  });
  const prior = readTrustedHistory(history);
  const previous = prior.at(-1)?.methodology ?? null;
  if (previous !== built.manifest.id)
    appendFileSync(
      history,
      `${JSON.stringify({
        schemaVersion: 1,
        sequence: prior.length + 1,
        methodology: built.manifest.id,
        revision: built.revision,
        previous,
        authority: {
          kind: "human",
          evidence: "test fixture bootstrap",
          evaluation: {
            kind: "human-bootstrap",
            evidence: "test fixture bootstrap",
          },
        },
      })}\n`,
    );
  return { revision: built.revision, methodology: built.manifest.id };
}
