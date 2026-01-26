import type { MockInviteCode } from "@/test/mocks/db";

/**
 * Test fixtures for common test data scenarios
 */

// Valid active invite code (single-use)
// Note: Codes must be 8 chars using only A-Z (no I, O) and 2-9 (no 0, 1)
export const validInviteCode: MockInviteCode = {
  id: "valid-invite-id",
  code: "ABCD2345",
  createdById: "admin-user-id",
  isActive: true,
  expiresAt: null,
  createdAt: new Date("2024-01-01"),
  deletedAt: null,
};

export const expiredInviteCode: MockInviteCode = {
  id: "expired-invite-id",
  code: "EXPRD234",
  createdById: "admin-user-id",
  isActive: true,
  expiresAt: new Date("2020-01-01"), // Past date
  createdAt: new Date("2019-01-01"),
  deletedAt: null,
};

export const usedInviteCode: MockInviteCode = {
  id: "used-invite-id",
  code: "USEDCODE",
  createdById: "admin-user-id",
  isActive: true,
  expiresAt: null,
  createdAt: new Date("2024-01-01"),
  deletedAt: new Date("2024-01-15"), // Soft-deleted when used
};

export const inactiveInviteCode: MockInviteCode = {
  id: "inactive-invite-id",
  code: "NACTVE23",
  createdById: "admin-user-id",
  isActive: false, // Deactivated
  expiresAt: null,
  createdAt: new Date("2024-01-01"),
  deletedAt: null,
};

export const futureExpiryInviteCode: MockInviteCode = {
  id: "future-invite-id",
  code: "FUTR2345",
  createdById: "admin-user-id",
  isActive: true,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  createdAt: new Date("2024-01-01"),
  deletedAt: null,
};
