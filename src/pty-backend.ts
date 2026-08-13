import * as pty from "node-pty";

import type { SessionBackend } from "./session-backend.ts";

function signalProcessGroup(pid: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-pid, signal);
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== "ESRCH"
    ) {
      throw error;
    }
  }
}

export class PtyBackend implements SessionBackend {
  readonly #terminal: pty.IPty;
  readonly #exited: Promise<void>;
  #dataListener: ((output: string) => void) | undefined;
  #exitListener: (() => void) | undefined;
  #hasExited = false;
  #stopping: Promise<void> | undefined;

  constructor() {
    let resolveExited!: () => void;
    this.#exited = new Promise<void>((resolve) => {
      resolveExited = resolve;
    });
    this.#terminal = pty.spawn("/bin/bash", ["--noprofile", "--norc", "-i"], {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: { ...process.env, TERM: "xterm-256color" },
    });
    this.#terminal.onData((data) => this.#dataListener?.(data));
    this.#terminal.onExit(() => {
      this.#hasExited = true;
      resolveExited();
      this.#exitListener?.();
    });
  }

  write(input: string): void {
    this.#terminal.write(input);
  }

  onData(listener: (output: string) => void): void {
    this.#dataListener = listener;
  }

  onExit(listener: () => void): void {
    this.#exitListener = listener;
    if (this.#hasExited) {
      queueMicrotask(listener);
    }
  }

  stop(): Promise<void> {
    this.#stopping ??= this.#stop();
    return this.#stopping;
  }

  async #stop(): Promise<void> {
    if (!this.#hasExited) {
      signalProcessGroup(this.#terminal.pid, "SIGTERM");
      this.#terminal.kill("SIGTERM");

      const exitedPromptly = await Promise.race([
        this.#exited.then(() => true),
        new Promise<false>((resolve) => {
          setTimeout(() => {
            resolve(false);
          }, 1_000);
        }),
      ]);

      if (!exitedPromptly) {
        signalProcessGroup(this.#terminal.pid, "SIGKILL");
        this.#terminal.kill("SIGKILL");
        await this.#exited;
      }
    }

    // Kill anything still in the PTY leader's process group before declaring
    // finalization complete. ESRCH is the expected clean result.
    signalProcessGroup(this.#terminal.pid, "SIGKILL");
  }
}
