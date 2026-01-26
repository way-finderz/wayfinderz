import { beforeEach,describe, expect, it, vi } from "vitest";

import { createMockSession,createMockUser } from "@/test/mocks/auth";

// Import after mocking
import { requireAuth } from "../require-auth";

// Use vi.hoisted to define mock before vi.mock hoisting
const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

describe("requireAuth middleware", () => {
  let mockCtx: any;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCtx = {
      request: {
        headers: {
          cookie: "session=test-token",
        },
      },
      state: {},
      status: 0,
      body: null,
    };

    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  it("calls next() and attaches user/session when authenticated", async () => {
    const mockUser = createMockUser();
    const mockSession = createMockSession({ userId: mockUser.id });
    mockAuth.api.getSession.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    const middleware = requireAuth();
    await middleware(mockCtx, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockCtx.state.user).toEqual(mockUser);
    expect(mockCtx.state.session).toEqual(mockSession);
  });

  it("returns 401 when no session is found", async () => {
    mockAuth.api.getSession.mockResolvedValue(null);

    const middleware = requireAuth();
    await middleware(mockCtx, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(401);
    expect(mockCtx.body).toEqual({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  });

  it("returns 401 when session exists but user is null", async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: null,
      session: createMockSession(),
    });

    const middleware = requireAuth();
    await middleware(mockCtx, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(401);
  });

  it("passes request headers to getSession", async () => {
    const customHeaders = { cookie: "custom-cookie", authorization: "Bearer token" };
    mockCtx.request.headers = customHeaders;
    mockAuth.api.getSession.mockResolvedValue(null);

    const middleware = requireAuth();
    await middleware(mockCtx, mockNext);

    expect(mockAuth.api.getSession).toHaveBeenCalledWith({
      headers: customHeaders,
    });
  });

  it("attaches admin user to state when admin is authenticated", async () => {
    const adminUser = createMockUser({ role: "admin" });
    const mockSession = createMockSession({ userId: adminUser.id });
    mockAuth.api.getSession.mockResolvedValue({
      user: adminUser,
      session: mockSession,
    });

    const middleware = requireAuth();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.state.user.role).toBe("admin");
  });
});
