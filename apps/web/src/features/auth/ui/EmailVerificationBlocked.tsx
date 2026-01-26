"use client";

import { useState } from "react";

import { Button } from "@/shared/ui";

interface EmailVerificationBlockedProps {
  userEmail: string;
  onResendEmail: () => Promise<void>;
}

export function EmailVerificationBlocked({
  userEmail,
  onResendEmail,
}: EmailVerificationBlockedProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      await onResendEmail();
      setResendSuccess(true);
    } catch (err) {
      setError("Failed to send verification email. Please try again.");
      console.error("Failed to resend verification email:", err);
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = userEmail.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, start, middle, domain) => start + "*".repeat(Math.min(middle.length, 5)) + domain
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Email Verification Required
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been suspended because your email address hasn&apos;t
          been verified. Please verify your email to continue using Way Finderz.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Verification email sent to:</p>
          <p className="font-medium text-gray-900">{maskedEmail}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {resendSuccess ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mb-6">
            <p className="font-medium">Verification email sent!</p>
            <p className="text-sm mt-1">
              Check your inbox and spam folder for an email from Way Finderz.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleResend}
            isLoading={isResending}
            className="w-full mb-4"
          >
            Resend Verification Email
          </Button>
        )}

        <div className="text-sm text-gray-500 space-y-2">
          <p>
            <strong>Can&apos;t find the email?</strong>
          </p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure {maskedEmail} is correct</li>
            <li>Wait a few minutes and check again</li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@wayfinderz.com"
              className="text-primary hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
