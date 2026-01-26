import { vi } from "vitest";

export function createMockInviteCode(
  overrides: Partial<MockInviteCode> = {}
): MockInviteCode {
  return {
    id: "test-invite-id",
    code: "TESTCODE",
    createdById: "admin-user-id",
    isActive: true,
    expiresAt: null,
    createdAt: new Date("2024-01-01"),
    deletedAt: null,
    ...overrides,
  };
}

export interface MockInviteCode {
  id: string;
  code: string;
  createdById: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export function createMockDb() {
  return {
    query: {
      inviteCodes: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn(),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
  };
}

export function mockInviteCodeQuery(
  mockDb: ReturnType<typeof createMockDb>,
  inviteCode: MockInviteCode | null
) {
  mockDb.query.inviteCodes.findFirst.mockResolvedValue(inviteCode);
}

export function mockInviteCodeList(
  mockDb: ReturnType<typeof createMockDb>,
  inviteCodes: MockInviteCode[]
) {
  mockDb.query.inviteCodes.findMany.mockResolvedValue(inviteCodes);
}

export function mockInviteCodeInsert(
  mockDb: ReturnType<typeof createMockDb>,
  returnValue: MockInviteCode
) {
  mockDb.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([returnValue]),
    }),
  });
}
