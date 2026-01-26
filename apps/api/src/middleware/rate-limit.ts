import type { Context } from "koa";
import ratelimit from "koa-ratelimit";

import { env } from "@/env";

// In-memory store for v1
const db = new Map();

// Warn if using in-memory rate limiting in production
if (env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] WARNING: Using in-memory rate limiting in production. " +
    "This will not work correctly with multiple server instances. " +
    "Consider using Redis for production deployments."
  );
}

export const apiRateLimit = ratelimit({
  driver: "memory",
  db,
  duration: 60000,
  max: 100,
  errorMessage: "Too many requests, please try again later",
  id: (ctx: Context) => ctx.ip,
  disableHeader: false,
  throw: true,
});

export const authRateLimit = ratelimit({
  driver: "memory",
  db,
  duration: 60000,
  max: 10,
  errorMessage: "Too many attempts, please try again later",
  id: (ctx: Context) => `auth:${ctx.ip}`,
  disableHeader: false,
  throw: true,
});

export const inviteRateLimit = ratelimit({
  driver: "memory",
  db,
  duration: 60000,
  max: 10,
  errorMessage: "Too many invite attempts, please try again later",
  id: (ctx: Context) => `invite:${ctx.ip}`,
  disableHeader: false,
  throw: true,
});
