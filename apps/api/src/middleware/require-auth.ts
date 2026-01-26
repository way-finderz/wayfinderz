import type { Context, Next } from "koa";

import type { SessionCore, User } from "@way-finderz/shared";

import { auth } from "@/auth";

export interface AuthState {
  user: User;
  session: SessionCore;
}

/**
 * Middleware that requires authentication.
 * Attaches user and session to ctx.state if authenticated.
 * Returns 401 if not authenticated.
 */
export function requireAuth() {
  return async (ctx: Context, next: Next) => {
    const session = await auth.api.getSession({
      headers: ctx.request.headers as Record<string, string>,
    });

    if (!session || !session.user) {
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

    ctx.state.user = session.user;
    ctx.state.session = session.session;

    await next();
  };
}
