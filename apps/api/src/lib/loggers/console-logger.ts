import type { Logger, LoggerOptions, LogLevel, LogMeta } from "../logger";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
} as const;

const LOG_LEVELS: Record<LogLevel, { priority: number; color: string; label: string }> = {
  trace: { priority: 10, color: colors.gray, label: "TRACE" },
  debug: { priority: 20, color: colors.cyan, label: "DEBUG" },
  info: { priority: 30, color: colors.green, label: "INFO " },
  warn: { priority: 40, color: colors.yellow, label: "WARN " },
  error: { priority: 50, color: colors.red, label: "ERROR" },
  fatal: { priority: 60, color: `${colors.bright}${colors.red}`, label: "FATAL" },
};

export class ConsoleLogger implements Logger {
  private level: LogLevel;
  private context: LogMeta;
  private levelPriority: number;

  constructor(options: LoggerOptions) {
    this.level = options.level || "info";
    this.context = options.context || {};
    this.levelPriority = LOG_LEVELS[this.level].priority;
  }

  trace(message: string, meta?: LogMeta): void {
    this.log("trace", message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log("warn", message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorMeta = this.serializeError(error);
    this.log("error", message, { ...errorMeta, ...meta });
  }

  fatal(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorMeta = this.serializeError(error);
    this.log("fatal", message, { ...errorMeta, ...meta });
  }

  child(bindings: LogMeta): Logger {
    return new ConsoleLogger({
      level: this.level,
      context: { ...this.context, ...bindings },
    });
  }

  isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVELS[level].priority >= this.levelPriority;
  }

  private log(level: LogLevel, message: string, meta?: LogMeta): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const config = LOG_LEVELS[level];
    const timestamp = new Date().toISOString();
    const combinedMeta = { ...this.context, ...meta };

    const parts: string[] = [
      `${colors.gray}[${timestamp}]${colors.reset}`,
      `${config.color}[${config.label}]${colors.reset}`,
    ];

    if (combinedMeta.requestId) {
      parts.push(`${colors.magenta}[${combinedMeta.requestId}]${colors.reset}`);
    }

    parts.push(message);

    const metaToLog = { ...combinedMeta };
    delete metaToLog.requestId;

    if (Object.keys(metaToLog).length > 0) {
      const metaStr = this.formatMeta(metaToLog);
      if (metaStr) {
        parts.push(`\n${  metaStr}`);
      }
    }

    const logMessage = parts.join(" ");
    switch (level) {
      case "trace":
      case "debug":
        console.debug(logMessage);
        break;
      case "info":
        console.log(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      case "error":
      case "fatal":
        console.error(logMessage);
        break;
    }
  }

  private formatMeta(meta: LogMeta): string {
    try {
      const cleaned = Object.entries(meta).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && typeof value !== "function") {
          acc[key] = value;
        }

        return acc;
      }, {} as LogMeta);

      if (Object.keys(cleaned).length === 0) {
        return "";
      }

      return JSON.stringify(cleaned, null, 2)
        .split("\n")
        .map((line) => `  ${colors.dim}${line}${colors.reset}`)
        .join("\n");
    } catch {
      return `  ${colors.dim}[Metadata formatting error]${colors.reset}`;
    }
  }

  private serializeError(error: Error | unknown): LogMeta {
    if (!error) {
      return {};
    }

    if (error instanceof Error) {
      return {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error as unknown as Record<string, unknown>),
        },
      };
    }

    return {
      error: {
        message: String(error),
        type: typeof error,
      },
    };
  }
}

export function createConsoleLogger(options: LoggerOptions): Logger {
  return new ConsoleLogger(options);
}