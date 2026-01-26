"use client";

import { useState } from "react";

import { authClient } from "../api/auth-client";


interface EmailVerificationWarningProps {
  userCreatedAt: string | Date;
  onResendEmail: () => Promise<void>;
}

const WARNING_DAYS = 5;

function getDaysRemaining(createdAt: string | Date): number {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + WARNING_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const remaining = Math.ceil((deadline.getTime() - now.getTime()) / msPerDay);

  return Math.max(0, remaining);
}

export function EmailVerificationWarning({
  userCreatedAt,
  onResendEmail,
}: EmailVerificationWarningProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(false);

  const daysRemaining = getDaysRemaining(userCreatedAt);
  const isLastDay = daysRemaining <= 1;

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setResendError(false);
    try {
      await onResendEmail();
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setResendError(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className={`${isLastDay
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
        } border-b px-4 py-3`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xl">{isLastDay ? "⚠️" : "📧"}</span>
          <div>
            <p className="font-medium">
              {isLastDay
                ? "Last chance to verify your email!"
                : `Verify your email within ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`}
            </p>
            <p className="text-sm opacity-80">
              {isLastDay
                ? "Your account access will be limited tomorrow if you don't verify."
                : "Verify your email to keep full access to Way Finderz."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resendSuccess ? (
            <span className="text-sm text-green-600 font-medium">
              Email sent! Check your inbox.
            </span>
          ) : resendError ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 font-medium">
                Failed to send email.
              </span>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="px-2 py-1 text-xs font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isLastDay
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
                } disabled:opacity-50`}
            >
              {isResending ? "Sending..." : "Resend Email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function useEmailVerification() {
  const sendVerificationEmail = async (email: string) => {
    await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/verify-email`,
    });
  };

  return {
    sendVerificationEmail,
  };
}
