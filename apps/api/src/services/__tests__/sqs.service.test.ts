import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EmailJobMessage } from "../sqs.service";
import {
  deleteFromEmailQueue,
  receiveFromEmailQueue,
  sendToEmailQueue,
} from "../sqs.service";

// Use vi.hoisted for mock setup
const mockSend = vi.hoisted(() => vi.fn());

vi.mock("@aws-sdk/client-sqs", () => {
  return {
    SQSClient: class MockSQSClient {
      send = mockSend;
    },
    SendMessageCommand: class MockSendMessageCommand {
      constructor(public params: Record<string, unknown>) {}
    },
    ReceiveMessageCommand: class MockReceiveMessageCommand {
      constructor(public params: Record<string, unknown>) {}
    },
    DeleteMessageCommand: class MockDeleteMessageCommand {
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
    SQS_EMAIL_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123456789/email-queue",
  },
}));

describe("sqs.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendToEmailQueue", () => {
    const validMessage: EmailJobMessage = {
      type: "verification",
      to: "test@example.com",
      subject: "Verify your email",
      html: "<p>Click here to verify</p>",
      text: "Click here to verify",
    };

    it("sends message to SQS queue and returns MessageId", async () => {
      mockSend.mockResolvedValue({ MessageId: "msg-123" });

      const result = await sendToEmailQueue(validMessage);

      expect(result).toBe("msg-123");
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("includes message type in MessageAttributes", async () => {
      mockSend.mockResolvedValue({ MessageId: "msg-123" });

      await sendToEmailQueue(validMessage);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.MessageAttributes).toEqual({
        Type: {
          DataType: "String",
          StringValue: "verification",
        },
      });
    });

    it("serializes message body as JSON", async () => {
      mockSend.mockResolvedValue({ MessageId: "msg-123" });

      await sendToEmailQueue(validMessage);

      const command = mockSend.mock.calls[0][0];
      expect(JSON.parse(command.params.MessageBody)).toEqual(validMessage);
    });

    it("throws error when SQS returns no MessageId", async () => {
      mockSend.mockResolvedValue({});

      await expect(sendToEmailQueue(validMessage)).rejects.toThrow(
        "SQS returned success but no MessageId"
      );
    });

    it("propagates SQS errors", async () => {
      mockSend.mockRejectedValue(new Error("SQS error"));

      await expect(sendToEmailQueue(validMessage)).rejects.toThrow("SQS error");
    });

    it("supports password-reset message type", async () => {
      mockSend.mockResolvedValue({ MessageId: "msg-456" });

      const resetMessage: EmailJobMessage = {
        ...validMessage,
        type: "password-reset",
      };

      await sendToEmailQueue(resetMessage);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.MessageAttributes.Type.StringValue).toBe("password-reset");
    });
  });

  describe("receiveFromEmailQueue", () => {
    const validMessage: EmailJobMessage = {
      type: "verification",
      to: "test@example.com",
      subject: "Verify your email",
      html: "<p>Click here</p>",
      text: "Click here",
    };

    it("returns empty array when no messages", async () => {
      mockSend.mockResolvedValue({ Messages: undefined });

      const result = await receiveFromEmailQueue();

      expect(result).toEqual([]);
    });

    it("returns parsed messages from SQS", async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            MessageId: "msg-123",
            ReceiptHandle: "receipt-123",
            Body: JSON.stringify(validMessage),
          },
        ],
      });

      const result = await receiveFromEmailQueue();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        messageId: "msg-123",
        receiptHandle: "receipt-123",
        body: validMessage,
      });
    });

    it("parses multiple messages", async () => {
      const message2: EmailJobMessage = {
        type: "password-reset",
        to: "other@example.com",
        subject: "Reset password",
        html: "<p>Reset</p>",
        text: "Reset",
      };

      mockSend.mockResolvedValue({
        Messages: [
          {
            MessageId: "msg-1",
            ReceiptHandle: "receipt-1",
            Body: JSON.stringify(validMessage),
          },
          {
            MessageId: "msg-2",
            ReceiptHandle: "receipt-2",
            Body: JSON.stringify(message2),
          },
        ],
      });

      const result = await receiveFromEmailQueue();

      expect(result).toHaveLength(2);
      expect(result[0].body.type).toBe("verification");
      expect(result[1].body.type).toBe("password-reset");
    });

    it("uses default maxMessages of 10", async () => {
      mockSend.mockResolvedValue({ Messages: [] });

      await receiveFromEmailQueue();

      const command = mockSend.mock.calls[0][0];
      expect(command.params.MaxNumberOfMessages).toBe(10);
    });

    it("uses default waitTimeSeconds of 20", async () => {
      mockSend.mockResolvedValue({ Messages: [] });

      await receiveFromEmailQueue();

      const command = mockSend.mock.calls[0][0];
      expect(command.params.WaitTimeSeconds).toBe(20);
    });

    it("accepts custom maxMessages parameter", async () => {
      mockSend.mockResolvedValue({ Messages: [] });

      await receiveFromEmailQueue(5);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.MaxNumberOfMessages).toBe(5);
    });

    it("accepts custom waitTimeSeconds parameter", async () => {
      mockSend.mockResolvedValue({ Messages: [] });

      await receiveFromEmailQueue(10, 5);

      const command = mockSend.mock.calls[0][0];
      expect(command.params.WaitTimeSeconds).toBe(5);
    });

    it("throws error when message is missing MessageId", async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            ReceiptHandle: "receipt-123",
            Body: JSON.stringify(validMessage),
          },
        ],
      });

      await expect(receiveFromEmailQueue()).rejects.toThrow(
        "SQS message missing MessageId or ReceiptHandle"
      );
    });

    it("throws error when message is missing ReceiptHandle", async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            MessageId: "msg-123",
            Body: JSON.stringify(validMessage),
          },
        ],
      });

      await expect(receiveFromEmailQueue()).rejects.toThrow(
        "SQS message missing MessageId or ReceiptHandle"
      );
    });

    it("throws error when message body is invalid JSON", async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            MessageId: "msg-123",
            ReceiptHandle: "receipt-123",
            Body: "invalid json",
          },
        ],
      });

      await expect(receiveFromEmailQueue()).rejects.toThrow();
    });

    it("throws error when message body fails schema validation", async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            MessageId: "msg-123",
            ReceiptHandle: "receipt-123",
            Body: JSON.stringify({ type: "invalid-type" }),
          },
        ],
      });

      await expect(receiveFromEmailQueue()).rejects.toThrow(
        "Invalid SQS message format"
      );
    });

    it("validates email format in message body", async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            MessageId: "msg-123",
            ReceiptHandle: "receipt-123",
            Body: JSON.stringify({
              type: "verification",
              to: "not-an-email",
              subject: "Test",
              html: "<p>Test</p>",
              text: "Test",
            }),
          },
        ],
      });

      await expect(receiveFromEmailQueue()).rejects.toThrow(
        "Invalid SQS message format"
      );
    });
  });

  describe("deleteFromEmailQueue", () => {
    it("sends delete command with receipt handle", async () => {
      mockSend.mockResolvedValue({});

      await deleteFromEmailQueue("receipt-123");

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.params.ReceiptHandle).toBe("receipt-123");
    });

    it("propagates SQS errors", async () => {
      mockSend.mockRejectedValue(new Error("Delete failed"));

      await expect(deleteFromEmailQueue("receipt-123")).rejects.toThrow(
        "Delete failed"
      );
    });
  });
});
