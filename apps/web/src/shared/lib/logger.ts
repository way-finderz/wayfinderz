/* eslint-disable no-console */
/**
 * Client-side logger with log levels
 *
 * Usage:
 *   import { logger } from '@/shared/lib/logger';
 *   logger.debug('AuthGate', 'Session state changed', { session, isPending });
 *   logger.info('AuthGate', 'User authenticated');
 *   logger.warn('AuthGate', 'Session expired');
 *   logger.error('AuthGate', 'Failed to fetch session', error);
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "none";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

const LOG_COLORS: Record<Exclude<LogLevel, "none">, string> = {
  debug: "#9CA3AF", // gray
  info: "#3B82F6", // blue
  warn: "#F59E0B", // amber
  error: "#EF4444", // red
};

const COMPONENT_COLORS: Record<string, string> = {
  AuthGate: "#8B5CF6", // purple
  AdminGate: "#EC4899", // pink
  AuthPrompt: "#10B981", // green
  LoginForm: "#06B6D4", // cyan
  DashboardPage: "#F97316", // orange
  ProfilePage: "#14B8A6", // teal
  GamePage: "#6366F1", // indigo
  LandingPage: "#84CC16", // lime
  useSession: "#A855F7", // violet
  TRPCProvider: "#0EA5E9", // sky
};

// Default to debug in development, warn in production
const DEFAULT_LEVEL: LogLevel =
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
    ? "debug"
    : "warn";

class Logger {
  private level: LogLevel = DEFAULT_LEVEL;
  private enabled: boolean = true;

  constructor() {
    // Allow override via localStorage
    if (typeof window !== "undefined") {
      const storedLevel = localStorage.getItem("logLevel") as LogLevel | null;
      if (storedLevel && LOG_LEVELS[storedLevel] !== undefined) {
        this.level = storedLevel;
      }
      const storedEnabled = localStorage.getItem("loggingEnabled");
      if (storedEnabled !== null) {
        this.enabled = storedEnabled === "true";
      }
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
    if (typeof window !== "undefined") {
      localStorage.setItem("logLevel", level);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("loggingEnabled", String(enabled));
    }
  }

  getLevel(): LogLevel {
    return this.level;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatMessage(
    level: Exclude<LogLevel, "none">,
    component: string,
    message: string,
    data?: unknown
  ): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
    const componentColor = COMPONENT_COLORS[component] || "#6B7280";
    const levelColor = LOG_COLORS[level];

    const prefix = `%c${timestamp} %c[${component}] %c${level.toUpperCase()}%c`;
    const styles = [
      "color: #6B7280", // timestamp - gray
      `color: ${componentColor}; font-weight: bold`, // component
      `color: ${levelColor}; font-weight: bold`, // level
      "color: inherit", // reset
    ];

    if (data !== undefined) {
      console[level === "debug" ? "log" : level](
        `${prefix} ${message}`,
        ...styles,
        data
      );
    } else {
      console[level === "debug" ? "log" : level](
        `${prefix} ${message}`,
        ...styles
      );
    }
  }

  debug(component: string, message: string, data?: unknown): void {
    this.formatMessage("debug", component, message, data);
  }

  info(component: string, message: string, data?: unknown): void {
    this.formatMessage("info", component, message, data);
  }

  warn(component: string, message: string, data?: unknown): void {
    this.formatMessage("warn", component, message, data);
  }

  error(component: string, message: string, data?: unknown): void {
    this.formatMessage("error", component, message, data);
  }

  // Group related logs together
  group(label: string): void {
    if (this.shouldLog("debug")) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog("debug")) {
      console.groupEnd();
    }
  }

  // Log component lifecycle
  mount(component: string, props?: Record<string, unknown>): void {
    this.debug(component, "Mounted", props);
  }

  unmount(component: string): void {
    this.debug(component, "Unmounted");
  }

  render(component: string, state: Record<string, unknown>): void {
    this.debug(component, "Rendering", state);
  }
}

export const logger = new Logger();

if (typeof window !== "undefined") {
  (window as unknown as { __logger: Logger }).__logger = logger;
}
