import type { Middleware, Next, ParameterizedContext } from "koa";

import { createRequestLogger } from "@/lib/logger";
import { getRequestId } from "@/middleware/request-id";

const SENSITIVE_PATHS = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
  "/api/auth/change-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
];

function isSensitivePath(path: string): boolean {
  return SENSITIVE_PATHS.some((sensitivePath) => path.startsWith(sensitivePath));
}

export function httpLoggerMiddleware(): Middleware {
  return async (ctx: ParameterizedContext, next: Next) => {
    const startTime = Date.now();
    const requestId = getRequestId(ctx);

    const logger = createRequestLogger(requestId, ctx.state.user?.id);
    ctx.state.logger = logger;

    const requestMeta = {
      method: ctx.method,
      path: ctx.path,
      query: ctx.query,
      ip: ctx.ip,
      userAgent: ctx.headers["user-agent"],
      ...(ctx.state.user && { userId: ctx.state.user.id }),
    };

    if (!isSensitivePath(ctx.path) && ctx.request.body) {
      requestMeta["body"] = ctx.request.body;
    }

    logger.info(`→ ${ctx.method} ${ctx.path}`, requestMeta);

    try {
      await next();

      const duration = Date.now() - startTime;
      const level = ctx.status >= 400 ? "warn" : "info";

      const responseMeta = {
        status: ctx.status,
        duration,
        ...(ctx.state.user && { userId: ctx.state.user.id }),
      };

      if (ctx.status >= 400 && !isSensitivePath(ctx.path) && ctx.body) {
        responseMeta["response"] = ctx.body;
      }

      logger[level](
        `← ${ctx.method} ${ctx.path} ${ctx.status} ${duration}ms`,
        responseMeta
      );
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        `← ${ctx.method} ${ctx.path} ERROR ${duration}ms`,
        error,
        {
          duration,
          status: ctx.status || 500,
        }
      );

      throw error;
    }
  };
}

export function getLogger(ctx: ParameterizedContext) {
  return ctx.state.logger || createRequestLogger(getRequestId(ctx));
}