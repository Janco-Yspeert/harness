export interface SessionBackend {
  write(input: string): void;
  onData(listener: (output: string) => void): void;
  onExit(listener: () => void): void;
  stop(): void | Promise<void>;
}

export type SessionBackendFactory = () =>
  SessionBackend | Promise<SessionBackend>;
