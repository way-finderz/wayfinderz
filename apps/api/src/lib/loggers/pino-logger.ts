import type { Logger, LoggerOptions, LogLevel, LogMeta } from "../logger";

interface PinoLogger {
  trace(msg: string, obj?: unknown): void;
  debug(msg: string, obj?: unknown): void;
  info(msg: string, obj?: unknown): void;
  warn(msg: string, obj?: unknown): void;
  error(obj: unknown, msg?: string): void;
  fatal(obj: unknown, msg?: string): void;
  child(bindings: Record<string, unknown>): PinoLogger;
  isLevelEnabled(level: string): boolean;
}

type PinoModule = {
  default: (config: unknown) => PinoLogger;
  stdTimeFunctions: { isoTime: () => unknown };
  stdSerializers: { err: unknown };
} & { (config: unknown): PinoLogger };

export class PinoLoggerWrapper implements Logger {
  private pino: PinoLogger | null = null;
  private context: LogMeta;
  private level: LogLevel;

  constructor(options: LoggerOptions) {
    this.level = options.level || "info";
    this.context = options.context || {};
    this.initializePino();
  }

  private async initializePino(): Promise<void> {
    try {
      const pinoModule = await import("pino") as unknown as PinoModule;
      const pino = pinoModule.default || pinoModule;

      this.pino = pino({
        level: this.level,
        base: this.context as Record<string, unknown>,
        timestamp: pinoModule.stdTimeFunctions.isoTime,
        formatters: {
          level: (label: string) => {
            return { level: label };
          },
        },
        serializers: {
          error: pinoModule.stdSerializers.err,
          err: pinoModule.stdSerializers.err,
        },
        redact: {
          paths: [
            "password",
            "token",
            "authorization",
            "cookie",
            "*.password",
            "*.token",
            "*.authorization",
            "*.cookie",
          ],
          censor: "[REDACTED]",
        },
      });
    } catch (error) {
      console.error("Failed to initialize Pino logger, falling back to console:", error);
    }
  }

  trace(message: string, meta?: LogMeta): void {
    if (this.pino) {
      this.pino.trace(message, meta);
    } else {
      console.log(JSON.stringify({ level: "trace", msg: message, ...this.context, ...meta }));
    }
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.pino) {
      this.pino.debug(message, meta);
    } else {
      console.log(JSON.stringify({ level: "debug", msg: message, ...this.context, ...meta }));
    }
  }

  info(message: string, meta?: LogMeta): void {
    if (this.pino) {
      this.pino.info(message, meta);
    } else {
      console.log(JSON.stringify({ level: "info", msg: message, ...this.context, ...meta }));
    }
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.pino) {
      this.pino.warn(message, meta);
    } else {
      console.warn(JSON.stringify({ level: "warn", msg: message, ...this.context, ...meta }));
    }
  }

  error(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorObj = this.serializeError(error);
    if (this.pino) {
      this.pino.error({ ...errorObj, ...meta }, message);
    } else {
      console.error(JSON.stringify({ level: "error", msg: message, ...this.context, ...errorObj, ...meta }));
    }
  }

  fatal(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorObj = this.serializeError(error);
    if (this.pino) {
      this.pino.fatal({ ...errorObj, ...meta }, message);
    } else {
      console.error(JSON.stringify({ level: "fatal", msg: message, ...this.context, ...errorObj, ...meta }));
    }
  }

  child(bindings: LogMeta): Logger {
    if (this.pino) {
      const childPino = this.pino.child(bindings as Record<string, unknown>);
      const childLogger = new PinoLoggerWrapper({
        level: this.level,
        context: { ...this.context, ...bindings },
      });
      childLogger.pino = childPino;

      return childLogger;
    }

    return new PinoLoggerWrapper({
      level: this.level,
      context: { ...this.context, ...bindings },
    });
  }

  isLevelEnabled(level: LogLevel): boolean {
    if (this.pino) {
      return this.pino.isLevelEnabled(level);
    }
    const levels = ["trace", "debug", "info", "warn", "error", "fatal"];
    const currentIndex = levels.indexOf(this.level);
    const checkIndex = levels.indexOf(level);

    return checkIndex >= currentIndex;
  }

  private serializeError(error: Error | unknown): LogMeta {
    if (!error) {
      return {};
    }

    if (error instanceof Error) {
      return {
        err: {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
          ...this.extractErrorProperties(error),
        },
      };
    }

    return {
      err: {
        message: String(error),
        type: typeof error,
        value: error,
      },
    };
  }

  private extractErrorProperties(error: Error): Record<string, unknown> {
    const props: Record<string, unknown> = {};
    const standardProps = ["name", "message", "stack"];

    for (const key in error) {
      if (!standardProps.includes(key)) {
        const value = (error as unknown as Record<string, unknown>)[key];
        if (value !== undefined) {
          props[key] = value;
        }
      }
    }

    return props;
  }
}

export function createPinoLogger(options: LoggerOptions): Logger {
  return new PinoLoggerWrapper(options);
}