import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import type { SessionCore, User } from "@way-finderz/shared";

import { auth } from "../auth";
import { logger } from "../lib/logger";

export type { SessionCore, User } from "@way-finderz/shared";

type Session = SessionCore;

export interface Context {
  user: User | null;
  session: Session | null;
}

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<Context> {
  const headers = Object.fromEntries(opts.req.headers);

  logger.debug("Creating tRPC context", {
    url: opts.req.url,
    headers: {
      cookie: headers.cookie ? "present" : "absent",
      authorization: headers.authorization ? "present" : "absent",
    },
  });

  const sessionResult = await auth.api.getSession({
    headers,
  });

  if (!sessionResult) {
    logger.debug("No session found in tRPC context");

    return { user: null, session: null };
  }

  logger.debug("Session found in tRPC context", {
    userId: sessionResult.user.id,
    userRole: sessionResult.user.role,
    sessionId: sessionResult.session.id,
  });

  return {
    user: sessionResult.user as User,
    session: sessionResult.session as Session,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    logger.warn("Protected procedure called without authentication", {
      hasUser: !!ctx.user,
      hasSession: !!ctx.session,
    });
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  logger.debug("Protected procedure authenticated", {
    userId: ctx.user.id,
    userRole: ctx.user.role,
  });

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});
