import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  queuePasswordResetEmail,
  queueVerificationEmail,
} from "../email.service";

const mockInngestSend = vi.hoisted(() => vi.fn());
const mockEnv = vi.hoisted(() => ({
  MOCK_EMAILS: false,
}));

vi.mock("@/lib/inngest", () => ({
  inngest: {
    send: mockInngestSend,
  },
  VERIFICATION_EMAIL_EVENT: "email/verification",
  PASSWORD_RESET_EMAIL_EVENT: "email/password-reset",
}));

vi.mock("@/env", () => ({
  env: mockEnv,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("email.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.MOCK_EMAILS = false;
  });

  describe("queueVerificationEmail", () => {
    it("sends event to Inngest when MOCK_EMAILS is false", async () => {
      mockInngestSend.mockResolvedValue({ ids: ["event-123"] });

      await queueVerificationEmail({
        to: "user@example.com",
        userName: "John",
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(mockInngestSend).toHaveBeenCalledWith({
        name: "email/verification",
        data: {
          to: "user@example.com",
          userName: "John",
          verifyUrl: "https://example.com/verify?token=abc",
        },
      });
    });

    it("does not send event when MOCK_EMAILS is true", async () => {
      mockEnv.MOCK_EMAILS = true;

      await queueVerificationEmail({
        to: "user@example.com",
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(mockInngestSend).not.toHaveBeenCalled();
    });

    it("works without userName", async () => {
      mockInngestSend.mockResolvedValue({ ids: ["event-123"] });

      await queueVerificationEmail({
        to: "user@example.com",
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(mockInngestSend).toHaveBeenCalledWith({
        name: "email/verification",
        data: {
          to: "user@example.com",
          userName: undefined,
          verifyUrl: "https://example.com/verify?token=abc",
        },
      });
    });

    it("propagates Inngest errors", async () => {
      mockInngestSend.mockRejectedValue(new Error("Inngest error"));

      await expect(
        queueVerificationEmail({
          to: "user@example.com",
          verifyUrl: "https://example.com/verify",
        })
      ).rejects.toThrow("Inngest error");
    });
  });

  describe("queuePasswordResetEmail", () => {
    it("sends event to Inngest when MOCK_EMAILS is false", async () => {
      mockInngestSend.mockResolvedValue({ ids: ["event-123"] });

      await queuePasswordResetEmail({
        to: "user@example.com",
        userName: "Jane",
        resetUrl: "https://example.com/reset?token=xyz",
      });

      expect(mockInngestSend).toHaveBeenCalledWith({
        name: "email/password-reset",
        data: {
          to: "user@example.com",
          userName: "Jane",
          resetUrl: "https://example.com/reset?token=xyz",
        },
      });
    });

    it("does not send event when MOCK_EMAILS is true", async () => {
      mockEnv.MOCK_EMAILS = true;

      await queuePasswordResetEmail({
        to: "user@example.com",
        resetUrl: "https://example.com/reset?token=xyz",
      });

      expect(mockInngestSend).not.toHaveBeenCalled();
    });

    it("works without userName", async () => {
      mockInngestSend.mockResolvedValue({ ids: ["event-123"] });

      await queuePasswordResetEmail({
        to: "user@example.com",
        resetUrl: "https://example.com/reset?token=xyz",
      });

      expect(mockInngestSend).toHaveBeenCalledWith({
        name: "email/password-reset",
        data: {
          to: "user@example.com",
          userName: undefined,
          resetUrl: "https://example.com/reset?token=xyz",
        },
      });
    });

    it("propagates Inngest errors", async () => {
      mockInngestSend.mockRejectedValue(new Error("Inngest error"));

      await expect(
        queuePasswordResetEmail({
          to: "user@example.com",
          resetUrl: "https://example.com/reset",
        })
      ).rejects.toThrow("Inngest error");
    });
  });
});
