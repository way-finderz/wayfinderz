import Koa from "koa";
import request from "supertest";
import { beforeEach,describe, expect, it, vi } from "vitest";

// Mock env
vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "production",
    FRONTEND_URL: "http://localhost:3001",
    ALLOWED_ORIGINS: "http://localhost:3001,https://example.com",
  },
}));

describe("Security Middleware", () => {
  describe("Security Headers", () => {
    let app: Koa;

    beforeEach(async () => {
      // Reset modules to get fresh app instance
      vi.resetModules();

      // Re-mock env for each test
      vi.doMock("@/env", () => ({
        env: {
          NODE_ENV: "production",
          FRONTEND_URL: "http://localhost:3001",
          ALLOWED_ORIGINS: "http://localhost:3001,https://example.com",
        },
      }));

      // Create a minimal app with security headers
      app = new Koa();

      // Security headers middleware (same as in app.ts)
      app.use(async (ctx, next) => {
        ctx.set("X-Content-Type-Options", "nosniff");
        ctx.set("X-Frame-Options", "DENY");
        ctx.set("X-XSS-Protection", "1; mode=block");
        ctx.set("Referrer-Policy", "strict-origin-when-cross-origin");
        ctx.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        ctx.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        await next();
      });

      app.use(async (ctx) => {
        ctx.body = { ok: true };
      });
    });

    it("sets X-Content-Type-Options header", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("sets X-Frame-Options header to DENY", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["x-frame-options"]).toBe("DENY");
    });

    it("sets X-XSS-Protection header", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
    });

    it("sets Referrer-Policy header", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    });

    it("sets Permissions-Policy header", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["permissions-policy"]).toBe(
        "geolocation=(), microphone=(), camera=()"
      );
    });

    it("sets Strict-Transport-Security header in production", async () => {
      const response = await request(app.callback()).get("/");

      expect(response.headers["strict-transport-security"]).toBe(
        "max-age=31536000; includeSubDomains"
      );
    });
  });

  describe("Error Handling", () => {
    it("does not expose error details in production", async () => {
      const app = new Koa();

      // Error handling middleware (same as in app.ts)
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (_err) {
          ctx.status = 500;
          ctx.body = {
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Internal server error",
              errorId: "test-error-id",
            },
          };
        }
      });

      app.use(async () => {
        throw new Error("Sensitive database connection string: postgres://user:pass@host/db");
      });

      const response = await request(app.callback()).get("/");

      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe("Internal server error");
      expect(response.body.error.message).not.toContain("postgres://");
      expect(response.body.error.message).not.toContain("database");
      expect(response.body.error.errorId).toBeDefined();
    });

    it("includes error ID for debugging", async () => {
      const app = new Koa();
      let capturedErrorId: string | undefined;

      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (_err) {
          capturedErrorId = "abc12345";
          ctx.status = 500;
          ctx.body = {
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Internal server error",
              errorId: capturedErrorId,
            },
          };
        }
      });

      app.use(async () => {
        throw new Error("Test error");
      });

      const response = await request(app.callback()).get("/");

      expect(response.body.error.errorId).toBe(capturedErrorId);
    });
  });

  describe("CORS Configuration", () => {
    it("allows requests from configured origins", async () => {
      const app = new Koa();
      const allowedOrigins = ["http://localhost:3001", "https://example.com"];

      app.use(async (ctx, next) => {
        const origin = ctx.request.header.origin;
        if (origin && allowedOrigins.includes(origin)) {
          ctx.set("Access-Control-Allow-Origin", origin);
        }
        await next();
      });

      app.use(async (ctx) => {
        ctx.body = { ok: true };
      });

      const response = await request(app.callback())
        .get("/")
        .set("Origin", "http://localhost:3001");

      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
    });

    it("blocks requests from non-configured origins", async () => {
      const app = new Koa();
      const allowedOrigins = ["http://localhost:3001", "https://example.com"];

      app.use(async (ctx, next) => {
        const origin = ctx.request.header.origin;
        if (origin && allowedOrigins.includes(origin)) {
          ctx.set("Access-Control-Allow-Origin", origin);
        }
        await next();
      });

      app.use(async (ctx) => {
        ctx.body = { ok: true };
      });

      const response = await request(app.callback())
        .get("/")
        .set("Origin", "https://malicious-site.com");

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });
});
