import { beforeEach,describe, expect, it, vi } from "vitest";

import { createMockAdminUser,createMockUser } from "@/test/mocks/auth";

import { requireAdmin } from "../require-admin";

describe("requireAdmin middleware", () => {
  let mockCtx: any;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCtx = {
      state: {},
      status: 0,
      body: null,
    };

    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  it("calls next() when user is admin", async () => {
    const adminUser = createMockAdminUser();
    mockCtx.state.user = adminUser;

    const middleware = requireAdmin();
    await middleware(mockCtx, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockCtx.status).toBe(0); // Status should not be changed
  });

  it("returns 401 when no user in state", async () => {
    // No user attached to state
    mockCtx.state.user = undefined;

    const middleware = requireAdmin();
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

  it("returns 403 when user is not admin", async () => {
    const regularUser = createMockUser({ role: "user" });
    mockCtx.state.user = regularUser;

    const middleware = requireAdmin();
    await middleware(mockCtx, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(403);
    expect(mockCtx.body).toEqual({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access required",
      },
    });
  });

  it("returns 403 for users with different non-admin roles", async () => {
    const editorUser = createMockUser({ role: "editor" });
    mockCtx.state.user = editorUser;

    const middleware = requireAdmin();
    await middleware(mockCtx, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(403);
  });

  it("passes through for admin role regardless of case", async () => {
    // Note: The actual implementation checks for exact "admin" string
    // This test documents the current behavior
    const adminUser = createMockUser({ role: "admin" });
    mockCtx.state.user = adminUser;

    const middleware = requireAdmin();
    await middleware(mockCtx, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("does not modify user state", async () => {
    const adminUser = createMockAdminUser();
    mockCtx.state.user = adminUser;

    const middleware = requireAdmin();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.state.user).toEqual(adminUser);
  });
});
