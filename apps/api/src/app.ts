import cors from "@koa/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { serve } from "inngest/koa";
import Koa from "koa";
import bodyParser from "koa-bodyparser";

import { env } from "@/env";
import { inngestFunctions } from "@/inngest-functions";
import { getErrorCode } from "@/lib/error-codes";
import { inngest } from "@/lib/inngest";
import { betterAuthMiddleware } from "@/middleware/better-auth";
import { getLogger, httpLoggerMiddleware } from "@/middleware/http-logger";
import { apiRateLimit } from "@/middleware/rate-limit";
import { requestIdMiddleware } from "@/middleware/request-id";
import { testEmailsRouter } from "@/routes/test-emails";
import { createContext } from "@/trpc";
import { appRouter } from "@/trpc/router";

export const app = new Koa();

app.use(requestIdMiddleware());
app.use(httpLoggerMiddleware());

app.use(async (ctx, next) => {
  ctx.set("X-Content-Type-Options", "nosniff");
  ctx.set("X-Frame-Options", "DENY");
  ctx.set("X-XSS-Protection", "1; mode=block");
  ctx.set("Referrer-Policy", "strict-origin-when-cross-origin");
  ctx.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (env.NODE_ENV === "production") {
    ctx.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const requestId = (ctx.state.requestId as string) || "unknown";
    const errorCode = getErrorCode(err);
    const reqLogger = getLogger(ctx);
    reqLogger.error("Server error", err, { errorCode });
    ctx.status = err instanceof Error && "status" in err ? (err as { status: number }).status : 500;
    ctx.body = {
      success: false,
      error: {
        code: errorCode,
        message: env.NODE_ENV === "production" ? "Internal server error" : (err instanceof Error ? err.message : "Unknown error"),
        requestId,
      },
    };
  }
});

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [env.FRONTEND_URL];

app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.request.header.origin;
      if (origin && allowedOrigins.includes(origin)) {
        return origin;
      }
      // For non-browser requests (no origin header), allow with first allowed origin
      // For browser requests with non-matching origin, return empty to trigger CORS error
      if (!origin) {
        return allowedOrigins[0] ?? "";
      }

      // Non-matching origin - return empty string which will cause browser CORS error
      return "";
    },
    credentials: true,
  })
);

// BetterAuth middleware (before body parser to handle raw auth requests)
app.use(betterAuthMiddleware());

// Body parser (for our API routes) with size limits to prevent DoS
app.use(bodyParser({
  jsonLimit: "1mb",
  formLimit: "1mb",
  textLimit: "1mb",
}));

// Health check (before rate limiting)
app.use(async (ctx, next) => {
  if (ctx.path === "/health") {
    ctx.body = { status: "ok" };

    return;
  }
  await next();
});

app.use(testEmailsRouter.routes());
app.use(testEmailsRouter.allowedMethods());

const inngestHandler = serve({ client: inngest, functions: inngestFunctions });
app.use(async (ctx, next) => {
  if (ctx.path === "/api/inngest") {
    return inngestHandler(ctx);
  }
  await next();
});

// General API rate limiting
app.use(apiRateLimit);

// tRPC handler
app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/api/trpc")) {
    const url = new URL(ctx.request.url, `http://${ctx.request.header.host}`);
    const request = new Request(url.toString(), {
      method: ctx.request.method,
      headers: new Headers(ctx.request.headers as Record<string, string>),
      body:
        ctx.request.method !== "GET" && ctx.request.method !== "HEAD"
          ? JSON.stringify(ctx.request.body)
          : undefined,
    });

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext,
    });

    ctx.status = response.status;
    response.headers.forEach((value, key) => {
      ctx.set(key, value);
    });
    ctx.body = response.body;

    return;
  }
  await next();
});
