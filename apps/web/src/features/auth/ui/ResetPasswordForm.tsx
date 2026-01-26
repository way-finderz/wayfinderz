import Link from "next/link";

import { Button, FormError, Input } from "@/shared/ui";

export interface ResetPasswordFormProps {
  password: string;
  onPasswordChange: (password: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordForm({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  error,
  isLoading,
  onSubmit,
}: ResetPasswordFormProps) {
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-gray-600 text-center mb-8">
        Enter your new password below.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && <FormError message={error} />}

        <div>
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <p className="mt-1 text-sm text-gray-500">At least 8 characters</p>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          required
          placeholder="••••••••"
          autoComplete="new-password"
          error={passwordMismatch ? "Passwords do not match" : undefined}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Request a new reset link
        </Link>
      </p>
    </div>
  );
}
