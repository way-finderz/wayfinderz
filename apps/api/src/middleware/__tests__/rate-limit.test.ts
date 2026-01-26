import Router from "@koa/router";
import Koa from "koa";
import ratelimit from "koa-ratelimit";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("Rate Limiting Middleware", () => {
  let app: Koa;
  let db: Map<string, unknown>;

  beforeEach(() => {
    db = new Map();
    app = new Koa();
  });

  afterEach(() => {
    db.clear();
  });

  describe("API Rate Limit", () => {
    beforeEach(() => {
      // Error handler must come BEFORE rate limiter to catch thrown errors
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err: any) {
          if (err.status === 429) {
            ctx.status = 429;
            ctx.body = {
              success: false,
              error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: "Too many requests",
              },
            };
          } else {
            throw err;
          }
        }
      });

      app.use(
        ratelimit({
          driver: "memory",
          db,
          duration: 60000,
          max: 5, // Low limit for testing
          errorMessage: "Too many requests",
          id: (ctx) => ctx.ip,
          throw: true,
        })
      );

      app.use(async (ctx) => {
        ctx.body = { ok: true };
      });
    });

    it("allows requests under the limit", async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app.callback()).get("/");
        expect(response.status).toBe(200);
      }
    });

    it("returns 429 when rate limit exceeded", async () => {
      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        await request(app.callback()).get("/");
      }

      // This request should be rate limited
      const response = await request(app.callback()).get("/");
      expect(response.status).toBe(429);
      // koa-ratelimit sets body to errorMessage string when throw: true
      expect(response.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("includes rate limit headers", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["x-ratelimit-limit"]).toBeDefined();
      expect(response.headers["x-ratelimit-remaining"]).toBeDefined();
      expect(response.headers["x-ratelimit-reset"]).toBeDefined();
    });

    it("decrements remaining count with each request", async () => {
      const response1 = await request(app.callback()).get("/");
      const remaining1 = parseInt(response1.headers["x-ratelimit-remaining"], 10);

      const response2 = await request(app.callback()).get("/");
      const remaining2 = parseInt(response2.headers["x-ratelimit-remaining"], 10);

      expect(remaining2).toBe(remaining1 - 1);
    });
  });

  describe("Route-specific Rate Limits", () => {
    it("applies stricter limits to sensitive endpoints", async () => {
      const router = new Router();

      // Strict rate limit for invite validation
      const inviteRateLimit = ratelimit({
        driver: "memory",
        db,
        duration: 60000,
        max: 3, // Very strict for testing
        errorMessage: "Too many invite attempts",
        id: (ctx) => `invite:${ctx.ip}`,
        throw: true,
      });

      // General rate limit
      const generalRateLimit = ratelimit({
        driver: "memory",
        db,
        duration: 60000,
        max: 10,
        errorMessage: "Too many requests",
        id: (ctx) => ctx.ip,
        throw: true,
      });

      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err: any) {
          if (err.status === 429) {
            ctx.status = 429;
            ctx.body = {
              success: false,
              error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: err.message || "Too many requests",
              },
            };
          } else {
            throw err;
          }
        }
      });

      router.post("/invites/validate", inviteRateLimit, async (ctx) => {
        ctx.body = { valid: true };
      });

      router.get("/health", generalRateLimit, async (ctx) => {
        ctx.body = { ok: true };
      });

      app.use(router.routes());

      // Exhaust invite rate limit (3 requests)
      for (let i = 0; i < 3; i++) {
        const response = await request(app.callback()).post("/invites/validate");
        expect(response.status).toBe(200);
      }

      // 4th invite request should be rate limited
      const inviteResponse = await request(app.callback()).post("/invites/validate");
      expect(inviteResponse.status).toBe(429);

      // Health endpoint should still work (different rate limit)
      const healthResponse = await request(app.callback()).get("/health");
      expect(healthResponse.status).toBe(200);
    });
  });

  describe("Rate Limit by IP", () => {
    it("tracks rate limits separately per IP", async () => {
      const strictLimit = ratelimit({
        driver: "memory",
        db,
        duration: 60000,
        max: 2,
        errorMessage: "Too many requests",
        id: (ctx) => ctx.request.header["x-forwarded-for"] as string || ctx.ip,
        throw: true,
      });

      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err: any) {
          if (err.status === 429) {
            ctx.status = 429;
            ctx.body = { error: "rate limited" };
          } else {
            throw err;
          }
        }
      });

      app.use(strictLimit);
      app.use(async (ctx) => {
        ctx.body = { ok: true };
      });

      // IP1 makes 2 requests (at limit)
      await request(app.callback()).get("/").set("X-Forwarded-For", "1.1.1.1");
      await request(app.callback()).get("/").set("X-Forwarded-For", "1.1.1.1");

      // IP1 should be rate limited
      const ip1Response = await request(app.callback())
        .get("/")
        .set("X-Forwarded-For", "1.1.1.1");
      expect(ip1Response.status).toBe(429);

      // IP2 should still be able to make requests
      const ip2Response = await request(app.callback())
        .get("/")
        .set("X-Forwarded-For", "2.2.2.2");
      expect(ip2Response.status).toBe(200);
    });
  });
});
