"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import {
  authClient,
  InvalidTokenScreen,
  ResetPasswordForm,
  ResetSuccessScreen,
} from "@/features/auth";
import { PageContainer } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");

      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (resetError) {
        if (
          resetError.message?.includes("expired") ||
          resetError.message?.includes("invalid")
        ) {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setError(resetError.message || "Failed to reset password");
        }
        setIsLoading(false);

        return;
      }

      setIsSuccess(true);
    } catch (_err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push("/");
  };

  if (!token) {
    return (
      <AppLayout>
        <PageContainer>
          <InvalidTokenScreen />
        </PageContainer>
      </AppLayout>
    );
  }

  if (isSuccess) {
    return (
      <AppLayout>
        <PageContainer>
          <ResetSuccessScreen onSignIn={handleSignIn} />
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer>
        <ResetPasswordForm
          password={password}
          onPasswordChange={setPassword}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          error={error}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </PageContainer>
    </AppLayout>
  );
}

function LoadingFallback() {
  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    </AppLayout>
  );
}

export function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
