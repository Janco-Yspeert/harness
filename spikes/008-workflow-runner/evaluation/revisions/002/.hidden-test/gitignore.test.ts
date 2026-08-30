// Case E13 — `.workflow/state.json` and job log files are excluded from
// Git tracking by a repository ignore rule (TR5), verified against the real
// `git` CLI and the real repository.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

import { runWorkflow, jobFor, parseStatusJson, REPO_ROOT } from "./support/cli.ts";
import { createSpikeFixture } from "./support/spike-fixture.ts";
import { createFixtureBin, pathWithFixtureBin } from "./support/fixture-bin.ts";

const execFileAsync = promisify(execFile);

async function isGitIgnored(absPath: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["check-ignore", "-q", absPath], { cwd: REPO_ROOT });
    return true;
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 1) return false; // not ignored
    throw error;
  }
}

await test(".workflow/state.json is Git-ignored", async () => {
  const fixture = await createSpikeFixture("gitignore-state");
  try {
    const init = await runWorkflow(["init", fixture.relPath]);
    assert.equal(init.exitCode, 0, init.stderr);

    const statePath = `${fixture.absPath}/.workflow/state.json`;
    assert.ok(
      await isGitIgnored(statePath),
      "`.workflow/state.json` must be excluded from Git tracking by a repository ignore rule",
    );

    const { stdout: porcelain } = await execFileAsync("git", ["status", "--porcelain", fixture.relPath], {
      cwd: REPO_ROOT,
    });
    assert.equal(
      porcelain.trim(),
      "",
      "an ignored .workflow/ directory must not appear as untracked in git status",
    );
  } finally {
    await fixture.cleanup();
  }
});

await test("a job's log file is Git-ignored", async () => {
  const fixture = await createSpikeFixture("gitignore-log");
  const fixtureBin = await createFixtureBin([{ name: "codex", sleepMs: 50, marker: "LOG-FOR-IGNORE-CHECK" }]);
  try {
    await runWorkflow(["init", fixture.relPath]);
    const env = { ...process.env, PATH: pathWithFixtureBin(fixtureBin) };
    const dispatch = await runWorkflow(
      ["dispatch", "brief-readiness", fixture.relPath, "--execute"],
      { env },
    );
    assert.equal(dispatch.exitCode, 0, dispatch.stderr);

    const status = await runWorkflow(["status", fixture.relPath]);
    const { records } = parseStatusJson(status.stdout);
    const job = jobFor(records, "brief-readiness", 1);
    assert.ok(job, "expected job metadata after --execute");

    assert.ok(
      await isGitIgnored(job.logPath),
      "the job's log file must be excluded from Git tracking by a repository ignore rule",
    );
  } finally {
    await fixture.cleanup();
    await fixtureBin.cleanup();
  }
});
