import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { validInviteCode } from "@/test/fixtures";

// Import router after mocking
import { invitesRouter } from "../invites";

// Test UUIDs
const TEST_INVITE_ID = "550e8400-e29b-41d4-a716-446655440000";

// Valid 8-char test codes (uses only allowed chars: ABCDEFGHJKLMNPQRSTUVWXYZ23456789)
const VALID_CODE = "ABCD2345"; // 8 chars, all valid
const INVALID_CODE = "XYZW6789"; // 8 chars, all valid
const NOTFOUND_CODE = "NQRS5678"; // 8 chars, all valid

// Mock the invite service
const mockInviteService = vi.hoisted(() => ({
  validateInviteCode: vi.fn(),
  markInviteUsed: vi.fn(),
  createInviteCode: vi.fn(),
  listInviteCodes: vi.fn(),
  deactivateInviteCode: vi.fn(),
}));

vi.mock("../../../services/invite.service", () => mockInviteService);

// Helper to create a mock caller with context
function createCaller(user: { id: string; role: string } | null = null) {
  const ctx = {
    user,
    session: user ? { id: "session-123", userId: user.id } : null,
  };

  return invitesRouter.createCaller(ctx as any);
}

describe("invitesRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validate", () => {
    it("returns valid=true for a valid code", async () => {
      mockInviteService.validateInviteCode.mockResolvedValue({
        valid: true,
      });

      const caller = createCaller(); // Public procedure - no auth needed
      const result = await caller.validate({ code: VALID_CODE });

      expect(result.valid).toBe(true);
      expect(result.message).toBe("Invite code is valid");
      expect(mockInviteService.validateInviteCode).toHaveBeenCalledWith(VALID_CODE);
    });

    it("returns valid=false with message for invalid code", async () => {
      mockInviteService.validateInviteCode.mockResolvedValue({
        valid: false,
        message: "Invite code not found",
        errorCode: "INVITE_NOT_FOUND",
      });

      const caller = createCaller();
      const result = await caller.validate({ code: INVALID_CODE });

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Invite code not found");
      expect(result.errorCode).toBe("INVITE_NOT_FOUND");
    });

    it("rejects invalid input format", async () => {
      const caller = createCaller();

      // Code too short (less than 8 chars)
      await expect(caller.validate({ code: "SHORT" })).rejects.toThrow();
    });
  });

  describe("use", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null); // No user

      await expect(caller.use({ code: VALID_CODE })).rejects.toThrow(
        "Authentication required"
      );
    });

    it("marks code as used for authenticated user", async () => {
      mockInviteService.markInviteUsed.mockResolvedValue(undefined);

      const caller = createCaller({ id: "user-123", role: "user" });
      const result = await caller.use({ code: VALID_CODE });

      expect(result.message).toBe("Invite code marked as used");
      expect(mockInviteService.markInviteUsed).toHaveBeenCalledWith(VALID_CODE, "user-123");
    });

    it("propagates service errors", async () => {
      mockInviteService.markInviteUsed.mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Invite code not found",
        })
      );

      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(caller.use({ code: NOTFOUND_CODE })).rejects.toThrow(
        "Invite code not found"
      );
    });
  });

  describe("create", () => {
    it("requires admin role", async () => {
      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(caller.create({})).rejects.toThrow("Admin access required");
    });

    it("requires authentication", async () => {
      const caller = createCaller(null);

      await expect(caller.create({})).rejects.toThrow("Authentication required");
    });

    it("creates invite code for admin", async () => {
      mockInviteService.createInviteCode.mockResolvedValue(validInviteCode);

      const caller = createCaller({ id: "admin-123", role: "admin" });
      const result = await caller.create({});

      expect(result).toEqual(validInviteCode);
      expect(mockInviteService.createInviteCode).toHaveBeenCalledWith(
        "admin-123",
        undefined
      );
    });

    it("passes expiration date when provided", async () => {
      mockInviteService.createInviteCode.mockResolvedValue(validInviteCode);
      // Use a future date (1 year from now)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const expiresAt = futureDate.toISOString();

      const caller = createCaller({ id: "admin-123", role: "admin" });
      await caller.create({ expiresAt });

      expect(mockInviteService.createInviteCode).toHaveBeenCalledWith(
        "admin-123",
        new Date(expiresAt)
      );
    });
  });

  describe("list", () => {
    it("requires admin role", async () => {
      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(caller.list()).rejects.toThrow("Admin access required");
    });

    it("returns invite codes for admin", async () => {
      const codes = [validInviteCode];
      mockInviteService.listInviteCodes.mockResolvedValue(codes);

      const caller = createCaller({ id: "admin-123", role: "admin" });
      const result = await caller.list();

      expect(result).toEqual(codes);
      expect(mockInviteService.listInviteCodes).toHaveBeenCalled();
    });
  });

  describe("deactivate", () => {
    it("requires admin role", async () => {
      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(
        caller.deactivate({ id: TEST_INVITE_ID })
      ).rejects.toThrow("Admin access required");
    });

    it("deactivates invite code for admin", async () => {
      mockInviteService.deactivateInviteCode.mockResolvedValue(undefined);

      const caller = createCaller({ id: "admin-123", role: "admin" });
      const result = await caller.deactivate({ id: TEST_INVITE_ID });

      expect(result.message).toBe("Invite code deactivated");
      expect(mockInviteService.deactivateInviteCode).toHaveBeenCalledWith(TEST_INVITE_ID);
    });
  });
});
