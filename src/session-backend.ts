export interface HarnessErrorMessage {
  readonly type: "error";
  readonly code: "turn_active" | "turn_start_failed";
  readonly data: string;
}

export type BackendInputResult =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly error: HarnessErrorMessage };

export interface SessionBackend {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- `void` preserves compatibility with Spike 004 backends while allowing acceptance results.
  write(input: string): BackendInputResult | void;
  onData(listener: (output: string) => void): void;
  onError(listener: (error: HarnessErrorMessage) => void): void;
  onExit(listener: () => void): void;
  stop(): void | Promise<void>;
}

export type SessionBackendFactory = () =>
  SessionBackend | Promise<SessionBackend>;
