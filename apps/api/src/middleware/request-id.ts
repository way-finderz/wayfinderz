import crypto from "node:crypto";

import type { Middleware, Next, ParameterizedContext } from "koa";

/**
 * Request ID middleware
 *
 * Generates a unique request ID for each request, which is:
 * - Stored on ctx.state.requestId for use in logging
 * - Returned in the X-Request-ID response header
 * - Included in error responses for debugging
 *
 * If the client sends an X-Request-ID header, it will be used instead.
 */
export function requestIdMiddleware(): Middleware {
  return async (ctx: ParameterizedContext, next: Next) => {
    const requestId =
      (ctx.request.headers["x-request-id"] as string) ||
      crypto.randomUUID();

    ctx.state.requestId = requestId;
    ctx.set("X-Request-ID", requestId);

    await next();
  };
}

/**
 * Helper to get request ID from context for logging
 */
export function getRequestId(ctx: ParameterizedContext): string {
  return (ctx.state.requestId as string) || "unknown";
}
