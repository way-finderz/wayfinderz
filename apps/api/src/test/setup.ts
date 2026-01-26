import { beforeEach, vi } from "vitest";

vi.mock("../env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_URL: "http://localhost:3000",
    BETTER_AUTH_SECRET: "test-secret-key-for-testing",
    FRONTEND_URL: "http://localhost:3001",
    ALLOWED_ORIGINS: "http://localhost:3001,http://localhost:3000",
    API_PORT: 3000,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});
