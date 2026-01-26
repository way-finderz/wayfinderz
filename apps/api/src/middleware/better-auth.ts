import { toNodeHandler } from "better-auth/node";
import type { Context, Next } from "koa";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";

const authHandler = toNodeHandler(auth);

export function betterAuthMiddleware() {
  return async (ctx: Context, next: Next) => {
    if (!ctx.path.startsWith("/api/auth")) {
      return next();
    }

    const requestLogger = logger.child({
      requestId: ctx.state.requestId,
      path: ctx.path,
      method: ctx.method
    });

    requestLogger.info("Processing auth request", {
      headers: {
        cookie: ctx.headers.cookie ? "present" : "absent",
        authorization: ctx.headers.authorization ? "present" : "absent",
        origin: ctx.headers.origin,
      },
    });

    await new Promise<void>((resolve, reject) => {
      authHandler(ctx.req, ctx.res)
        .then(() => {
          requestLogger.info("Auth request completed successfully");
          resolve();
        })
        .catch((error) => {
          requestLogger.error("Auth request failed", error);
          reject(error);
        });
    });

    ctx.respond = false;
  };
}
