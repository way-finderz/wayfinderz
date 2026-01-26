import { describe, expect, it } from "vitest";

import {
  getPasswordResetEmailTemplate,
  getVerificationEmailTemplate,
} from "../email-templates";

describe("email-templates", () => {
  describe("getVerificationEmailTemplate", () => {
    it("returns correct subject line", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify?token=abc",
      });

      expect(result.subject).toBe("Verify your email for Way Finderz");
    });

    it("includes verify URL in HTML content", () => {
      const verifyUrl = "https://example.com/verify?token=abc123";
      const result = getVerificationEmailTemplate({ verifyUrl });

      expect(result.html).toContain(verifyUrl);
      expect(result.html).toContain('class="button"');
      expect(result.html).toContain("Verify Email Address");
    });

    it("includes verify URL in text content", () => {
      const verifyUrl = "https://example.com/verify?token=abc123";
      const result = getVerificationEmailTemplate({ verifyUrl });

      expect(result.text).toContain(verifyUrl);
      expect(result.text).toContain("Click this link to verify your email");
    });

    it("personalizes greeting when userName is provided", () => {
      const result = getVerificationEmailTemplate({
        userName: "John",
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).toContain("Hi John,");
      expect(result.text).toContain("Hi John,");
    });

    it("uses generic greeting when userName is not provided", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).toContain("Hi there,");
      expect(result.text).toContain("Hi there,");
    });

    it("escapes HTML special characters in userName", () => {
      const result = getVerificationEmailTemplate({
        userName: "<script>alert('xss')</script>",
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).not.toContain("<script>");
      expect(result.html).toContain("&lt;script&gt;");
    });

    it("escapes HTML special characters in verifyUrl", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify?token=abc&foo=bar",
      });

      expect(result.html).toContain("&amp;foo=bar");
    });

    it("includes Way Finderz branding", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).toContain("Way Finderz");
      expect(result.html).toContain("Learn the language, find your way");
      expect(result.text).toContain("Way Finderz");
    });

    it("includes expiration warning", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).toContain("expire in 5 days");
      expect(result.text).toContain("expire in 5 days");
    });
  });

  describe("getPasswordResetEmailTemplate", () => {
    it("returns correct subject line", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset?token=abc",
      });

      expect(result.subject).toBe("Reset your password for Way Finderz");
    });

    it("includes reset URL in HTML content", () => {
      const resetUrl = "https://example.com/reset?token=xyz789";
      const result = getPasswordResetEmailTemplate({ resetUrl });

      expect(result.html).toContain(resetUrl);
      expect(result.html).toContain('class="button"');
      expect(result.html).toContain("Reset Password");
    });

    it("includes reset URL in text content", () => {
      const resetUrl = "https://example.com/reset?token=xyz789";
      const result = getPasswordResetEmailTemplate({ resetUrl });

      expect(result.text).toContain(resetUrl);
      expect(result.text).toContain("Click this link to reset your password");
    });

    it("personalizes greeting when userName is provided", () => {
      const result = getPasswordResetEmailTemplate({
        userName: "Jane",
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).toContain("Hi Jane,");
      expect(result.text).toContain("Hi Jane,");
    });

    it("uses generic greeting when userName is not provided", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).toContain("Hi there,");
      expect(result.text).toContain("Hi there,");
    });

    it("escapes HTML special characters in userName", () => {
      const result = getPasswordResetEmailTemplate({
        userName: "John <Admin>",
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).not.toContain("<Admin>");
      expect(result.html).toContain("&lt;Admin&gt;");
    });

    it("escapes HTML special characters in resetUrl", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset?token=abc&user=test",
      });

      expect(result.html).toContain("&amp;user=test");
    });

    it("includes Way Finderz branding", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).toContain("Way Finderz");
      expect(result.html).toContain("Learn the language, find your way");
      expect(result.text).toContain("Way Finderz");
    });

    it("includes expiration warning for 1 hour", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).toContain("expire in 1 hour");
      expect(result.text).toContain("expire in 1 hour");
    });

    it("includes security notice about ignoring if not requested", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).toContain("didn't request a password reset");
      expect(result.text).toContain("didn't request a password reset");
    });
  });

  describe("HTML structure", () => {
    it("verification email has valid HTML structure", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).toContain("<!DOCTYPE html>");
      expect(result.html).toContain("<html");
      expect(result.html).toContain("</html>");
      expect(result.html).toContain('<meta charset="UTF-8">');
    });

    it("password reset email has valid HTML structure", () => {
      const result = getPasswordResetEmailTemplate({
        resetUrl: "https://example.com/reset",
      });

      expect(result.html).toContain("<!DOCTYPE html>");
      expect(result.html).toContain("<html");
      expect(result.html).toContain("</html>");
      expect(result.html).toContain('<meta charset="UTF-8">');
    });

    it("includes responsive viewport meta tag", () => {
      const result = getVerificationEmailTemplate({
        verifyUrl: "https://example.com/verify",
      });

      expect(result.html).toContain("viewport");
      expect(result.html).toContain("width=device-width");
    });
  });
});
