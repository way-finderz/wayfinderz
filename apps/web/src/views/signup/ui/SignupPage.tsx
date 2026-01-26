"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { signUp, SignupFormFields } from "@/features/auth";
import {
  InviteCodeInput,
  markInviteUsed,
  validateInviteCode,
} from "@/features/invite-codes";
import { Button, FormError, PageContainer } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteValidated, setInviteValidated] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setInviteCode(code.toUpperCase());
      validateInviteCode(code)
        .then((result) => {
          if (result.valid) {
            setInviteValidated(true);
          } else {
            setError(result.message || "Invalid invite code from link");
          }
        })
        .catch((err) => {
          console.error("Failed to validate invite code from URL:", err);
          setError("Failed to validate invite code. Please try again.");
        });
    }
  }, [searchParams]);

  const handleCodeChange = (code: string) => {
    setInviteCode(code);
    setInviteValidated(false);
  };

  const handleValidateInvite = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await validateInviteCode(inviteCode);

      if (!result.valid) {
        setError(result.message || "Invalid invite code");

        return;
      }

      setInviteValidated(true);
    } catch (err) {
      console.error("Failed to validate invite code:", err);
      setError("Failed to validate invite code. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    setIsLoading(true);

    if (!inviteValidated) {
      const result = await validateInviteCode(inviteCode);
      if (!result.valid) {
        setError(result.message || "Invalid invite code");
        setIsLoading(false);

        return;
      }
    }

    try {
      const { error: signUpError } = await signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account");
        setIsLoading(false);

        return;
      }

      // Account created successfully - mark invite as used
      // If this fails, we still redirect since the account was created
      try {
        await markInviteUsed(inviteCode);
      } catch (inviteErr) {
        console.error("Failed to mark invite as used:", inviteErr);
        // Continue to dashboard - account is created, invite issue is non-blocking
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageContainer>
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormError message={error} />}

          <InviteCodeInput
            code={inviteCode}
            onCodeChange={handleCodeChange}
            isValidated={inviteValidated}
            isLoading={isLoading}
            onValidate={handleValidateInvite}
          />

          {inviteValidated && (
            <>
              <SignupFormFields
                name={name}
                onNameChange={setName}
                email={email}
                onEmailChange={setEmail}
                password={password}
                onPasswordChange={setPassword}
                confirmPassword={confirmPassword}
                onConfirmPasswordChange={setConfirmPassword}
              />

              <Button type="submit" isLoading={isLoading} className="w-full">
                Create Account
              </Button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
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

export function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupForm />
    </Suspense>
  );
}
