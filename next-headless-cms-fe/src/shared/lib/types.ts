export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface LoggerLogArgs {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export interface LoggerMessageArgs {
  message: string;
  context?: Record<string, unknown>;
}
