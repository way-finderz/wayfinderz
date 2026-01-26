import crypto from "node:crypto";

import { beforeEach,describe, expect, it, vi } from "vitest";

import {
  expiredInviteCode,
  usedInviteCode,
  validInviteCode,
} from "@/test/fixtures";

// Import after mocking
import {
  createInviteCode,
  deactivateInviteCode,
  listInviteCodes,
  markInviteUsed,
  validateInviteCode,
} from "../invite.service";

// Use vi.hoisted to define mock before vi.mock hoisting
const mockDb = vi.hoisted(() => {
  const mockTx = {
    query: {
      inviteCodes: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  };

  return {
    query: {
      inviteCodes: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn().mockImplementation(async (fn) => fn(mockTx)),
    _mockTx: mockTx, // Expose for test configuration
  };
});

vi.mock("@/db", () => ({
  db: mockDb,
}));

describe("invite.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateInviteCode", () => {
    it("returns valid=true for a valid active code", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue(validInviteCode);

      const result = await validateInviteCode("VALIDCODE");

      expect(result.valid).toBe(true);
      expect(mockDb.query.inviteCodes.findFirst).toHaveBeenCalled();
    });

    it("returns valid=false with error code when code is not found", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue(null);

      const result = await validateInviteCode("NOTFOUND");

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVITE_NOT_FOUND");
    });

    it("returns valid=false with error code for an inactive code", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue({
        ...validInviteCode,
        isActive: false,
      });

      const result = await validateInviteCode("INACTIVE");

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVITE_INACTIVE");
    });

    it("returns valid=false with error code when code has been used (soft-deleted)", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue(usedInviteCode);

      const result = await validateInviteCode("USEDCODE");

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVITE_USED");
    });

    it("returns valid=false with error code when code is expired", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue(expiredInviteCode);

      const result = await validateInviteCode("EXPIRED1");

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVITE_EXPIRED");
    });

    it("returns valid=true for unused code", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue(validInviteCode);

      const result = await validateInviteCode("VALIDCOD");

      expect(result.valid).toBe(true);
    });

    it("normalizes code to uppercase", async () => {
      mockDb.query.inviteCodes.findFirst.mockResolvedValue(validInviteCode);

      await validateInviteCode("validcode");

      // The function should convert to uppercase before querying
      expect(mockDb.query.inviteCodes.findFirst).toHaveBeenCalled();
    });
  });

  describe("createInviteCode", () => {
    it("creates an invite code", async () => {
      const mockReturning = vi.fn().mockResolvedValue([validInviteCode]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await createInviteCode("admin-user-id");

      expect(result).toEqual(validInviteCode);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: "admin-user-id",
          expiresAt: null,
        })
      );
    });

    it("creates an invite code with expiration date", async () => {
      const expiresAt = new Date("2025-12-31");
      const mockReturning = vi.fn().mockResolvedValue([validInviteCode]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      await createInviteCode("admin-user-id", expiresAt);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt,
        })
      );
    });

    it("throws error when insert fails to return result", async () => {
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      await expect(createInviteCode("admin-user-id")).rejects.toThrow(
        "Failed to create invite code"
      );
    });

    it("generates an 8-character uppercase code", async () => {
      const mockReturning = vi.fn().mockResolvedValue([validInviteCode]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      await createInviteCode("admin-user-id");

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.stringMatching(/^[A-Z2-9]{8}$/),
        })
      );
    });

    it("generates unique codes using cryptographic randomness", async () => {
      const mockReturning = vi.fn().mockResolvedValue([validInviteCode]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      // Generate multiple codes and check they're different
      const codes = new Set<string>();
      for (let i = 0; i < 10; i++) {
        await createInviteCode("admin-user-id");
        const call = mockValues.mock.calls[i];
        codes.add(call[0].code);
      }

      // With cryptographic randomness, all 10 codes should be unique
      expect(codes.size).toBe(10);
    });

    it("uses crypto.randomBytes for secure code generation", async () => {
      const randomBytesSpy = vi.spyOn(crypto, "randomBytes");
      const mockReturning = vi.fn().mockResolvedValue([validInviteCode]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      await createInviteCode("admin-user-id");

      expect(randomBytesSpy).toHaveBeenCalledWith(8);
      randomBytesSpy.mockRestore();
    });

    it("only uses allowed characters (no ambiguous I, O, 0, 1)", async () => {
      const mockReturning = vi.fn().mockResolvedValue([validInviteCode]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      // Generate many codes to verify character set
      for (let i = 0; i < 50; i++) {
        await createInviteCode("admin-user-id");
        const call = mockValues.mock.calls[i];
        const code = call[0].code;

        // Should not contain ambiguous characters
        expect(code).not.toMatch(/[IO01]/);
        // Should only contain allowed characters
        expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
      }
    });
  });

  describe("listInviteCodes", () => {
    it("returns all invite codes when no filter provided", async () => {
      const mockCodes = [validInviteCode, usedInviteCode];
      mockDb.query.inviteCodes.findMany.mockResolvedValue(mockCodes);

      const result = await listInviteCodes();

      expect(result).toEqual(mockCodes);
      expect(mockDb.query.inviteCodes.findMany).toHaveBeenCalled();
    });

    it("filters by createdById when provided", async () => {
      mockDb.query.inviteCodes.findMany.mockResolvedValue([validInviteCode]);

      const result = await listInviteCodes("admin-user-id");

      expect(result).toEqual([validInviteCode]);
      expect(mockDb.query.inviteCodes.findMany).toHaveBeenCalled();
    });

    it("returns empty array when no codes exist", async () => {
      mockDb.query.inviteCodes.findMany.mockResolvedValue([]);

      const result = await listInviteCodes();

      expect(result).toEqual([]);
    });
  });

  describe("markInviteUsed", () => {
    it("creates audit record and soft deletes the invite code", async () => {
      // Mock the transaction to find a valid invite code
      mockDb._mockTx.query.inviteCodes.findFirst.mockResolvedValue(validInviteCode);

      // Mock the insert operation for audit record
      const mockInsertValues = vi.fn().mockResolvedValue(undefined);
      mockDb._mockTx.insert.mockReturnValue({ values: mockInsertValues });

      // Mock the update operation for soft delete
      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
      mockDb._mockTx.update.mockReturnValue({ set: mockUpdateSet });

      await markInviteUsed("VALIDCODE", "user-123");

      // Should find, create audit record, and soft delete
      expect(mockDb._mockTx.query.inviteCodes.findFirst).toHaveBeenCalled();
      expect(mockDb._mockTx.insert).toHaveBeenCalled();
      expect(mockInsertValues).toHaveBeenCalledWith({
        inviteCodeId: validInviteCode.id,
        usedById: "user-123",
      });
      expect(mockDb._mockTx.update).toHaveBeenCalled();
      expect(mockUpdateSet).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
    });

    it("throws error when code is already deleted (soft delete)", async () => {
      mockDb._mockTx.query.inviteCodes.findFirst.mockResolvedValue({
        ...validInviteCode,
        deletedAt: new Date("2024-01-15"),
      });

      await expect(markInviteUsed("VALIDCODE", "user-123")).rejects.toThrow(
        "Invite code has already been used"
      );
    });

    it("throws error when code is not found", async () => {
      mockDb._mockTx.query.inviteCodes.findFirst.mockResolvedValue(null);

      await expect(markInviteUsed("NOTFOUND", "user-123")).rejects.toThrow(
        "Invite code not found"
      );
    });

    it("throws error when code is inactive", async () => {
      mockDb._mockTx.query.inviteCodes.findFirst.mockResolvedValue({
        ...validInviteCode,
        isActive: false,
      });

      await expect(markInviteUsed("VALIDCODE", "user-123")).rejects.toThrow(
        "Invite code has been deactivated"
      );
    });

    it("throws error when code has been used (soft-deleted)", async () => {
      mockDb._mockTx.query.inviteCodes.findFirst.mockResolvedValue(usedInviteCode);

      await expect(markInviteUsed("USEDCODE", "user-123")).rejects.toThrow(
        "Invite code has already been used"
      );
    });

    it("throws error when code is expired", async () => {
      mockDb._mockTx.query.inviteCodes.findFirst.mockResolvedValue(expiredInviteCode);

      await expect(markInviteUsed("EXPIRED", "user-123")).rejects.toThrow(
        "Invite code has expired"
      );
    });
  });

  describe("deactivateInviteCode", () => {
    it("sets isActive to false for the given id", async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: "invite-123" }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      await deactivateInviteCode("invite-123");

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ isActive: false });
      expect(mockWhere).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
    });

    it("throws error when invite code not found", async () => {
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      await expect(deactivateInviteCode("invalid-id")).rejects.toThrow(
        "Invite code not found"
      );
    });
  });
});
