import { describe, expect, it } from "vitest";

import {
  createInviteCode,
  deactivateInviteCode,
  listInviteCodes,
  markInviteUsed,
  validateInviteCode,
} from "../api/invite-api";

describe("invite-api", () => {
  describe("validateInviteCode", () => {
    it("returns valid: true for a valid invite code", async () => {
      const result = await validateInviteCode("VALIDCODE");

      expect(result.valid).toBe(true);
      expect(result.message).toBe("Invite code is valid");
    });

    it("returns valid: false for an invalid invite code", async () => {
      const result = await validateInviteCode("INVALID1");

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Invalid or expired invite code");
    });
  });

  describe("markInviteUsed", () => {
    it("successfully marks an invite code as used", async () => {
      // Should not throw
      await expect(markInviteUsed("VALIDCODE")).resolves.toBeUndefined();
    });
  });

  describe("createInviteCode", () => {
    it("creates a single-use invite code", async () => {
      const result = await createInviteCode();

      expect(result.code).toBe("NEWCODE1");
      expect(result.isActive).toBe(true);
    });
  });

  describe("listInviteCodes", () => {
    it("returns list of invite codes", async () => {
      const result = await listInviteCodes();

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("TESTCODE");
    });
  });

  describe("deactivateInviteCode", () => {
    it("successfully deactivates an invite code", async () => {
      // Should not throw
      await expect(deactivateInviteCode("invite-1")).resolves.toBeUndefined();
    });
  });
});
