import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "../ses.service";

// Use vi.hoisted for mock setup
const mockSend = vi.hoisted(() => vi.fn());

vi.mock("@aws-sdk/client-ses", () => {
  return {
    SESClient: class MockSESClient {
      send = mockSend;
    },
    SendEmailCommand: class MockSendEmailCommand {
      constructor(public params: Record<string, unknown>) {}
    },
  };
});

// Mock env
vi.mock("@/env", () => ({
  env: {
    AWS_REGION: "us-east-1",
    AWS_ACCESS_KEY_ID: "test-key",
    AWS_SECRET_ACCESS_KEY: "test-secret",
    SES_FROM_EMAIL: "Way Finderz <noreply@wayfinderz.com>",
  },
}));

describe("ses.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendEmail", () => {
    const validParams = {
      to: "recipient@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML content</p>",
      text: "Test plain text content",
    };

    it("sends email and returns MessageId", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      const result = await sendEmail(validParams);

      expect(result).toBe("ses-msg-123");
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("uses correct recipient address", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail(validParams);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Destination.ToAddresses).toEqual(["recipient@example.com"]);
    });

    it("uses correct subject with UTF-8 charset", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail(validParams);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Message.Subject).toEqual({
        Data: "Test Subject",
        Charset: "UTF-8",
      });
    });

    it("includes HTML body with UTF-8 charset", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail(validParams);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Message.Body.Html).toEqual({
        Data: "<p>Test HTML content</p>",
        Charset: "UTF-8",
      });
    });

    it("includes text body with UTF-8 charset", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail(validParams);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Message.Body.Text).toEqual({
        Data: "Test plain text content",
        Charset: "UTF-8",
      });
    });

    it("uses configured from email address", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail(validParams);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Source).toBe("Way Finderz <noreply@wayfinderz.com>");
    });

    it("throws error when SES returns no MessageId", async () => {
      mockSend.mockResolvedValue({});

      await expect(sendEmail(validParams)).rejects.toThrow(
        "SES returned success but no MessageId"
      );
    });

    it("propagates SES errors", async () => {
      mockSend.mockRejectedValue(new Error("SES throttling error"));

      await expect(sendEmail(validParams)).rejects.toThrow("SES throttling error");
    });

    it("handles unicode characters in subject", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail({
        ...validParams,
        subject: "Test with emoji 🎉 and accent é",
      });

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Message.Subject.Data).toBe("Test with emoji 🎉 and accent é");
    });

    it("handles unicode characters in body", async () => {
      mockSend.mockResolvedValue({ MessageId: "ses-msg-123" });

      await sendEmail({
        ...validParams,
        html: "<p>Bonjour! Çava? 日本語</p>",
        text: "Bonjour! Çava? 日本語",
      });

      const command = mockSend.mock.calls[0][0];
      expect(command.params.Message.Body.Html.Data).toBe("<p>Bonjour! Çava? 日本語</p>");
      expect(command.params.Message.Body.Text.Data).toBe("Bonjour! Çava? 日本語");
    });
  });
});
