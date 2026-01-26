import Link from "next/link";

import { Button, FormError, Input } from "@/shared/ui";

export interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ForgotPasswordForm({
  email,
  onEmailChange,
  error,
  isLoading,
  onSubmit,
}: ForgotPasswordFormProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">Forgot Password?</h1>
      <p className="text-gray-600 text-center mb-8">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && <FormError message={error} />}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Remember your password?{" "}
        <Link href="/" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
