import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  queueEmail,
  queuePasswordResetEmail,
  queueVerificationEmail,
} from "../email.service";

// Use vi.hoisted for mocks referenced in vi.mock factories
const mockSendToEmailQueue = vi.hoisted(() => vi.fn());
const mockGetVerificationEmailTemplate = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    subject: "Verify your email for Way Finderz",
    html: "<p>Mock verification HTML</p>",
    text: "Mock verification text",
  })
);
const mockGetPasswordResetEmailTemplate = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    subject: "Reset your password for Way Finderz",
    html: "<p>Mock reset HTML</p>",
    text: "Mock reset text",
  })
);
const mockEnv = vi.hoisted(() => ({
  MOCK_EMAILS: false,
}));

vi.mock("../sqs.service", () => ({
  sendToEmailQueue: mockSendToEmailQueue,
}));

vi.mock("../email-templates", () => ({
  getVerificationEmailTemplate: mockGetVerificationEmailTemplate,
  getPasswordResetEmailTemplate: mockGetPasswordResetEmailTemplate,
}));

vi.mock("@/env", () => ({
  env: mockEnv,
}));

describe("email.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.MOCK_EMAILS = false;
  });

  describe("queueEmail", () => {
    const validParams = {
      type: "verification" as const,
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
      text: "Test text",
    };

    it("sends email to queue when MOCK_EMAILS is false", async () => {
      mockSendToEmailQueue.mockResolvedValue("msg-123");

      await queueEmail(validParams);

      expect(mockSendToEmailQueue).toHaveBeenCalledWith({
        type: "verification",
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      });
    });

    it("logs email to console when MOCK_EMAILS is true", async () => {
      mockEnv.MOCK_EMAILS = true;
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await queueEmail(validParams);

      expect(mockSendToEmailQueue).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      // Verify log contains email details
      const logCalls = consoleSpy.mock.calls.map((call) => call[0]);
      expect(logCalls.some((log) => String(log).includes("MOCK EMAIL"))).toBe(true);
      expect(logCalls.some((log) => String(log).includes("test@example.com"))).toBe(true);

      consoleSpy.mockRestore();
    });

    it("supports password-reset type", async () => {
      mockSendToEmailQueue.mockResolvedValue("msg-123");

      await queueEmail({
        ...validParams,
        type: "password-reset",
      });

      expect(mockSendToEmailQueue).toHaveBeenCalledWith(
        expect.objectContaining({ type: "password-reset" })
      );
    });

    it("propagates queue errors", async () => {
      mockSendToEmailQueue.mockRejectedValue(new Error("Queue error"));

      await expect(queueEmail(validParams)).rejects.toThrow("Queue error");
    });
  });

  describe("queueVerificationEmail", () => {
    it("generates template and queues email", async () => {
      mockSendToEmailQueue.mockResolvedValue("msg-123");

      await queueVerificationEmail({
        to: "user@example.com",
        userName: "John",
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(mockGetVerificationEmailTemplate).toHaveBeenCalledWith({
        userName: "John",
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(mockSendToEmailQueue).toHaveBeenCalledWith({
        type: "verification",
        to: "user@example.com",
        subject: "Verify your email for Way Finderz",
        html: "<p>Mock verification HTML</p>",
        text: "Mock verification text",
      });
    });

    it("works without userName", async () => {
      mockSendToEmailQueue.mockResolvedValue("msg-123");

      await queueVerificationEmail({
        to: "user@example.com",
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(mockGetVerificationEmailTemplate).toHaveBeenCalledWith({
        userName: undefined,
        verifyUrl: "https://example.com/verify?token=abc",
      });
    });

    it("propagates queue errors", async () => {
      mockSendToEmailQueue.mockRejectedValue(new Error("Queue failed"));

      await expect(
        queueVerificationEmail({
          to: "user@example.com",
          verifyUrl: "https://example.com/verify",
        })
      ).rejects.toThrow("Queue failed");
    });
  });

  describe("queuePasswordResetEmail", () => {
    it("generates template and queues email", async () => {
      mockSendToEmailQueue.mockResolvedValue("msg-123");

      await queuePasswordResetEmail({
        to: "user@example.com",
        userName: "Jane",
        resetUrl: "https://example.com/reset?token=xyz",
      });

      expect(mockGetPasswordResetEmailTemplate).toHaveBeenCalledWith({
        userName: "Jane",
        resetUrl: "https://example.com/reset?token=xyz",
      });

      expect(mockSendToEmailQueue).toHaveBeenCalledWith({
        type: "password-reset",
        to: "user@example.com",
        subject: "Reset your password for Way Finderz",
        html: "<p>Mock reset HTML</p>",
        text: "Mock reset text",
      });
    });

    it("works without userName", async () => {
      mockSendToEmailQueue.mockResolvedValue("msg-123");

      await queuePasswordResetEmail({
        to: "user@example.com",
        resetUrl: "https://example.com/reset?token=xyz",
      });

      expect(mockGetPasswordResetEmailTemplate).toHaveBeenCalledWith({
        userName: undefined,
        resetUrl: "https://example.com/reset?token=xyz",
      });
    });

    it("propagates queue errors", async () => {
      mockSendToEmailQueue.mockRejectedValue(new Error("Queue failed"));

      await expect(
        queuePasswordResetEmail({
          to: "user@example.com",
          resetUrl: "https://example.com/reset",
        })
      ).rejects.toThrow("Queue failed");
    });
  });
});
