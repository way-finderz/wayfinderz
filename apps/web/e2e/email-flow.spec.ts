import { expect, test } from "@playwright/test";

import {
  clearRecordedEmails,
  disableEmailRecording,
  enableEmailRecording,
  getInngestEvents,
  isInngestRunning,
  waitForInngestEvent,
  waitForRecordedEmail,
} from "./fixtures/inngest";

const API_URL = "http://localhost:3000";
const INNGEST_URL = "http://localhost:8288";

test.describe("Email Flow E2E Tests", () => {
  test.describe.configure({ mode: "serial" });

  test.describe("Inngest Dev Server", () => {
    test("Inngest dev server is running and accessible", async () => {
      const isRunning = await isInngestRunning();
      expect(isRunning).toBe(true);
    });

    test("can fetch events from Inngest dev server", async () => {
      const events = await getInngestEvents();
      expect(Array.isArray(events)).toBe(true);
    });
  });

  test.describe("Email Recording API", () => {
    test("can enable and disable email recording", async () => {
      await enableEmailRecording();

      const response = await fetch(`${API_URL}/api/test/emails/status`);
      const status = await response.json();
      expect(status.recording).toBe(true);

      await disableEmailRecording();

      const response2 = await fetch(`${API_URL}/api/test/emails/status`);
      const status2 = await response2.json();
      expect(status2.recording).toBe(false);
    });

    test("can clear recorded emails", async () => {
      await enableEmailRecording();
      await clearRecordedEmails();

      const response = await fetch(`${API_URL}/api/test/emails`);
      const data = await response.json();
      expect(data.emails).toHaveLength(0);

      await disableEmailRecording();
    });

    test("test email endpoints return 200 in dev mode", async () => {
      const response = await fetch(`${API_URL}/api/test/emails/status`);
      expect(response.status).toBe(200);
    });
  });

  test.describe("Verification Email via Direct API Call", () => {
    test.beforeEach(async () => {
      const inngestAvailable = await isInngestRunning();
      test.skip(!inngestAvailable, "Inngest dev server not available");

      await enableEmailRecording();
      await clearRecordedEmails();
    });

    test.afterEach(async () => {
      try {
        await disableEmailRecording();
      } catch (_) {
        void 0;
      }
    });

    test("sending verification event to Inngest triggers email function", async () => {
      const testEmail = `api-test-${Date.now()}@example.com`;
      const testTimestamp = Date.now();

      const response = await fetch(`${INNGEST_URL}/e/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "email/verification",
          data: {
            to: testEmail,
            userName: "API Test User",
            verifyUrl: "https://example.com/verify?token=test123",
          },
        }),
      });

      expect(response.status).toBeLessThan(300);

      const event = await waitForInngestEvent("email/verification", {
        timeout: 10000,
        afterTimestamp: testTimestamp,
        dataMatch: { to: testEmail },
      });

      expect(event).not.toBeNull();

      const recordedEmail = await waitForRecordedEmail({
        to: testEmail,
        subject: "Verify your email",
        timeout: 15000,
        afterTimestamp: testTimestamp,
      });

      expect(recordedEmail).not.toBeNull();
      expect(recordedEmail?.to).toBe(testEmail);
      expect(recordedEmail?.templateName).toBe("VerificationEmail");
      expect(recordedEmail?.templateProps).toMatchObject({
        userName: "API Test User",
        verifyUrl: "https://example.com/verify?token=test123",
      });
    });

    test("verification email contains correct template props", async () => {
      const testEmail = `props-test-${Date.now()}@example.com`;
      const testTimestamp = Date.now();

      await fetch(`${INNGEST_URL}/e/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "email/verification",
          data: {
            to: testEmail,
            userName: "Props Test",
            verifyUrl: "https://test.com/verify?token=abc",
          },
        }),
      });

      const recordedEmail = await waitForRecordedEmail({
        to: testEmail,
        timeout: 15000,
        afterTimestamp: testTimestamp,
      });

      expect(recordedEmail).not.toBeNull();
      expect(recordedEmail?.from).toContain("Way Finderz");
      expect(recordedEmail?.subject).toBe("Verify your email for Way Finderz");
      expect(recordedEmail?.templateProps?.userName).toBe("Props Test");
      expect(recordedEmail?.templateProps?.verifyUrl).toBe(
        "https://test.com/verify?token=abc"
      );
    });
  });

  test.describe("Password Reset Email via Direct API Call", () => {
    test.beforeEach(async () => {
      const inngestAvailable = await isInngestRunning();
      test.skip(!inngestAvailable, "Inngest dev server not available");

      await enableEmailRecording();
      await clearRecordedEmails();
    });

    test.afterEach(async () => {
      try {
        await disableEmailRecording();
      } catch (_) {
        void 0;
      }
    });

    test("sending password reset event to Inngest triggers email function", async () => {
      const testEmail = `reset-test-${Date.now()}@example.com`;
      const testTimestamp = Date.now();

      const response = await fetch(`${INNGEST_URL}/e/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "email/password-reset",
          data: {
            to: testEmail,
            userName: "Reset Test User",
            resetUrl: "https://example.com/reset?token=reset123",
          },
        }),
      });

      expect(response.status).toBeLessThan(300);

      const event = await waitForInngestEvent("email/password-reset", {
        timeout: 10000,
        afterTimestamp: testTimestamp,
        dataMatch: { to: testEmail },
      });

      expect(event).not.toBeNull();

      const recordedEmail = await waitForRecordedEmail({
        to: testEmail,
        subject: "Reset your password",
        timeout: 15000,
        afterTimestamp: testTimestamp,
      });

      expect(recordedEmail).not.toBeNull();
      expect(recordedEmail?.to).toBe(testEmail);
      expect(recordedEmail?.templateName).toBe("PasswordResetEmail");
      expect(recordedEmail?.templateProps).toMatchObject({
        userName: "Reset Test User",
        resetUrl: "https://example.com/reset?token=reset123",
      });
    });

    test("password reset email contains correct template props", async () => {
      const testEmail = `reset-props-${Date.now()}@example.com`;
      const testTimestamp = Date.now();

      await fetch(`${INNGEST_URL}/e/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "email/password-reset",
          data: {
            to: testEmail,
            userName: "Password User",
            resetUrl: "https://test.com/reset?token=xyz",
          },
        }),
      });

      const recordedEmail = await waitForRecordedEmail({
        to: testEmail,
        timeout: 15000,
        afterTimestamp: testTimestamp,
      });

      expect(recordedEmail).not.toBeNull();
      expect(recordedEmail?.from).toContain("Way Finderz");
      expect(recordedEmail?.subject).toBe(
        "Reset your password for Way Finderz"
      );
      expect(recordedEmail?.templateProps?.userName).toBe("Password User");
      expect(recordedEmail?.templateProps?.resetUrl).toBe(
        "https://test.com/reset?token=xyz"
      );
    });
  });
});
