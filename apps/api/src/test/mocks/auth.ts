import { vi } from "vitest";

import type { AuthState } from "@/middleware/require-auth";

export function createMockUser(overrides: Partial<AuthState["user"]> = {}): AuthState["user"] {
  return {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    image: null,
    emailVerified: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function createMockAdminUser(overrides: Partial<AuthState["user"]> = {}): AuthState["user"] {
  return createMockUser({
    id: "admin-user-id",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    ...overrides,
  });
}

export function createMockSession(overrides: Partial<AuthState["session"]> = {}): AuthState["session"] {
  return {
    id: "test-session-id",
    userId: "test-user-id",
    token: "test-session-token",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    ...overrides,
  };
}

export function createMockAuth() {
  return {
    api: {
      getSession: vi.fn(),
    },
  };
}

export function mockAuthSession(
  mockAuth: ReturnType<typeof createMockAuth>,
  user: AuthState["user"] | null,
  session: AuthState["session"] | null = null
) {
  if (user && !session) {
    session = createMockSession({ userId: user.id });
  }

  mockAuth.api.getSession.mockResolvedValue(
    user ? { user, session } : null
  );
}
