import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

import { server } from "./mocks/server";

import "@testing-library/jest-dom/vitest";

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock environment
vi.mock("@/shared/config", () => ({
  env: {
    API_URL: "http://localhost:3000",
  },
}));

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Clean up after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => server.close());
