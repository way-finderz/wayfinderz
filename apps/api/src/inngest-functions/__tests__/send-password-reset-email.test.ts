import { beforeEach, describe, expect, it, vi } from "vitest";

// Import after mocks
import { sendPasswordResetEmail } from "../send-password-reset-email";

// Mock dependencies before importing the function
const mockResendSend = vi.hoisted(() => vi.fn());
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
}));
const mockEnv = vi.hoisted(() => ({
  EMAIL_FROM: "Way Finderz <noreply@test.com>",
}));

vi.mock("@/lib/resend", () => ({
  resend: {
    emails: {
      send: mockResendSend,
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: mockLogger,
}));

vi.mock("@/env", () => ({
  env: mockEnv,
}));

// Mock email recorder - disabled by default so Resend path is tested
vi.mock("@/lib/email-recorder", () => ({
  isEmailRecordingEnabled: () => false,
  recordEmail: vi.fn(),
}));

describe("sendPasswordResetEmail Inngest function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has correct function id", () => {
    // Inngest functions have an id method that takes a prefix
    // When called with empty string, it returns just the function id
    expect(sendPasswordResetEmail.id("")).toBe("send-password-reset-email");
  });

  it("sends email via Resend with correct parameters", async () => {
    mockResendSend.mockResolvedValue({
      data: { id: "email-123" },
      error: null,
    });

    const mockEvent = {
      data: {
        to: "user@example.com",
        userName: "John",
        resetUrl: "https://example.com/reset?token=abc",
      },
    };

    const handler = sendPasswordResetEmail["fn"];
    const result = await handler({ event: mockEvent } as never);

    expect(mockResendSend).toHaveBeenCalledTimes(1);
    const callArgs = mockResendSend.mock.calls[0]![0];

    expect(callArgs.from).toBe("Way Finderz <noreply@test.com>");
    expect(callArgs.to).toBe("user@example.com");
    expect(callArgs.subject).toBe("Reset your password for Way Finderz");
    expect(callArgs.react).toBeDefined();

    expect(result).toEqual({ emailId: "email-123" });
  });

  it("sends email without userName", async () => {
    mockResendSend.mockResolvedValue({
      data: { id: "email-456" },
      error: null,
    });

    const mockEvent = {
      data: {
        to: "user@example.com",
        resetUrl: "https://example.com/reset?token=abc",
      },
    };

    const handler = sendPasswordResetEmail["fn"];
    await handler({ event: mockEvent } as never);

    expect(mockResendSend).toHaveBeenCalledTimes(1);
    const callArgs = mockResendSend.mock.calls[0]![0];
    expect(callArgs.to).toBe("user@example.com");
  });

  it("throws error when Resend returns error", async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { name: "RateLimitError", message: "Too many requests" },
    });

    const mockEvent = {
      data: {
        to: "user@example.com",
        resetUrl: "https://example.com/reset",
      },
    };

    const handler = sendPasswordResetEmail["fn"];

    await expect(handler({ event: mockEvent } as never)).rejects.toThrow(
      "RateLimitError: Too many requests"
    );
  });

  it("logs email sending progress", async () => {
    mockResendSend.mockResolvedValue({
      data: { id: "email-789" },
      error: null,
    });

    const mockEvent = {
      data: {
        to: "user@example.com",
        userName: "Jane",
        resetUrl: "https://example.com/reset",
      },
    };

    const handler = sendPasswordResetEmail["fn"];
    await handler({ event: mockEvent } as never);

    expect(mockLogger.info).toHaveBeenCalledWith("Sending password reset email", {
      to: "user@example.com",
      userName: "Jane",
    });

    expect(mockLogger.info).toHaveBeenCalledWith("Password reset email sent", {
      to: "user@example.com",
      emailId: "email-789",
    });
  });
});
