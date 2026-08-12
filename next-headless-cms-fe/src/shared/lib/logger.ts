import type { LogEntry, LoggerLogArgs } from "./types";

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private log({ level, message, context }: LoggerLogArgs) {
    if (!this.isDev && level === "debug") return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[consoleMethod](`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, context || "");
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log({ level: "debug", message, context });
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log({ level: "info", message, context });
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log({ level: "warn", message, context });
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log({ level: "error", message, context });
  }
}

export const logger = new Logger();
