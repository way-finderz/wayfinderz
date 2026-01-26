"use client";

import { useState } from "react";

import {
  authClient,
  EmailSentScreen,
  ForgotPasswordForm,
} from "@/features/auth";
import { PageContainer } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use $fetch directly since the client method names don't match server endpoints
      const result = await authClient.$fetch("/request-password-reset", {
        method: "POST",
        body: {
          email,
          redirectTo: "/reset-password",
        },
      });

      if (result.error) {
        // Check if this is the unverified email error
        if (result.error.message?.includes("verify your email")) {
          setError(
            "Please verify your email before resetting your password. Check your inbox for a verification email."
          );
        } else {
          // Show generic success message to prevent email enumeration
          setIsSuccess(true);
        }
        setIsLoading(false);

        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("[ForgotPassword] Exception:", err);
      // Show generic success message to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageContainer>
        {isSuccess ? (
          <EmailSentScreen />
        ) : (
          <ForgotPasswordForm
            email={email}
            onEmailChange={setEmail}
            error={error}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
