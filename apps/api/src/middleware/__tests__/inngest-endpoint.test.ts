import http from "node:http";

import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "@/app";

// Mock dependencies
vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_URL: "http://localhost:3000",
    BETTER_AUTH_SECRET: "test-secret-key-for-testing",
    FRONTEND_URL: "http://localhost:3001",
    ALLOWED_ORIGINS: "http://localhost:3001,http://localhost:3000",
    API_PORT: 3000,
    MOCK_EMAILS: true,
    EMAIL_FROM: "Way Finderz <noreply@test.com>",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

vi.mock("@/middleware/http-logger", () => ({
  httpLoggerMiddleware: () => async (
    ctx: { state: Record<string, unknown> },
    next: () => Promise<void>
  ) => {
    await next();
  },
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock("@/auth", () => ({
  auth: {
    handler: async () => new Response(null, { status: 404 }),
  },
}));

vi.mock("@/db", () => ({
  db: {},
}));

// Mock Resend for Inngest functions
vi.mock("@/lib/resend", () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
    },
  },
}));

describe("/api/inngest endpoint", () => {
  let server: http.Server;

  beforeEach(() => {
    vi.clearAllMocks();
    server = http.createServer(app.callback());
  });

  afterEach(() => {
    server.close();
  });

  it("responds to GET requests with 200", async () => {
    const response = await request(server).get("/api/inngest");

    // Inngest introspection endpoint returns 200
    expect(response.status).toBe(200);
  });

  it("returns JSON content type", async () => {
    const response = await request(server).get("/api/inngest");

    expect(response.headers["content-type"]).toMatch(/json/);
  });

  it("has correct CORS headers for allowed origins", async () => {
    const response = await request(server)
      .get("/api/inngest")
      .set("Origin", "http://localhost:3001");

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
  });

  it("responds to PUT requests (used by Inngest for function execution)", async () => {
    // Inngest uses PUT for function invocations
    const response = await request(server)
      .put("/api/inngest")
      .set("Content-Type", "application/json")
      .send({});

    // Should respond (may be 400 due to missing required fields, but not 404)
    expect(response.status).not.toBe(404);
  });

  it("does not intercept other /api paths", async () => {
    const response = await request(server).get("/api/other");

    // Should fall through (404 since no handler)
    expect(response.status).toBe(404);
  });

  it("does not intercept /api/inngest subpaths", async () => {
    const response = await request(server).get("/api/inngest/something");

    // Should not match the exact path handler
    expect(response.status).toBe(404);
  });
});
