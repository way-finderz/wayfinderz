import type { Server } from "node:http";

import { afterAll, beforeAll, beforeEach, vi } from "vitest";

// Set test environment variables before any imports
process.env.NODE_ENV = "test";
process.env.MOCK_EMAILS = "true";
process.env.EMAIL_FROM = "Way Finderz <noreply@test.com>";
process.env.RESEND_API_KEY = "re_test_integration_key";
process.env.INNGEST_EVENT_KEY = "test-inngest-event-key";
process.env.INNGEST_SIGNING_KEY = "test-inngest-signing-key";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = "test-secret-key-for-integration-testing";
process.env.FRONTEND_URL = "http://localhost:3001";
process.env.ALLOWED_ORIGINS = "http://localhost:3001,http://localhost:3000";

// Mock Resend to avoid needing a real API key
vi.mock("@/lib/resend", () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test-email-id" }, error: null }),
    },
  },
}));

// Mock the database for integration tests that don't need real DB
vi.mock("@/db", () => ({
  db: {
    delete: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

// Mock the logger to reduce noise
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

// Mock auth to avoid database access
vi.mock("@/auth", () => ({
  auth: {
    handler: async () => new Response(null, { status: 404 }),
  },
}));

// Mock http logger middleware
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

// Store server instance for tests
let server: Server | null = null;
let serverPort: number | null = null;

/**
 * Get the test server URL
 */
export function getTestServerUrl(): string {
  if (!serverPort) {
    throw new Error("Test server not started");
  }

  return `http://localhost:${serverPort}`;
}

/**
 * Get the test server instance
 */
export function getTestServer(): Server {
  if (!server) {
    throw new Error("Test server not started");
  }

  return server;
}

// Start the API server before all tests
beforeAll(async () => {
  // Dynamic import to avoid issues with mocking
  const http = await import("node:http");
  const { app } = await import("@/app");

  server = http.createServer(app.callback());

  // Listen on random port
  await new Promise<void>((resolve) => {
    server!.listen(0, () => {
      const address = server!.address();
      if (address && typeof address === "object") {
        serverPort = address.port;
        console.log(`Integration test server started on port ${serverPort}`);
      }
      resolve();
    });
  });
});

// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Final cleanup after all tests
afterAll(async () => {
  // Stop test server
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    server = null;
    serverPort = null;
  }
});
