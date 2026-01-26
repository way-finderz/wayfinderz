import { env } from "@/env";

import { createConsoleLogger } from "./loggers/console-logger";
import { createPinoLogger } from "./loggers/pino-logger";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export type LogMeta = Record<string, unknown>;

export interface Logger {
  trace(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, error?: Error | unknown, meta?: LogMeta): void;
  fatal(message: string, error?: Error | unknown, meta?: LogMeta): void;

  child(bindings: LogMeta): Logger;

  isLevelEnabled(level: LogLevel): boolean;
}

export interface LoggerOptions {
  level?: LogLevel;
  context?: LogMeta;
  pretty?: boolean;
}

function getDefaultLogLevel(): LogLevel {
  if (env.LOG_LEVEL) {
    return env.LOG_LEVEL as LogLevel;
  }

  return env.NODE_ENV === "production" ? "info" : "debug";
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const config: LoggerOptions = {
    level: options.level || getDefaultLogLevel(),
    context: options.context || {},
    pretty: options.pretty ?? (env.NODE_ENV !== "production"),
  };

  if (env.NODE_ENV === "production" && !config.pretty) {
    return createPinoLogger(config);
  }

  return createConsoleLogger(config);
}

export const logger = createLogger({
  context: {
    service: "api",
    environment: env.NODE_ENV,
  },
});

export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({
    requestId,
    ...(userId && { userId }),
  });
}