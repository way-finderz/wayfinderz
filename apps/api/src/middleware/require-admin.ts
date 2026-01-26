import type { Context, Next } from "koa";

/**
 * Middleware that requires admin role.
 * Must be used after requireAuth middleware.
 * Returns 403 if user is not an admin.
 */
export function requireAdmin() {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      };

      return;
    }

    if (user.role !== "admin") {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
      };

      return;
    }

    await next();
  };
}
