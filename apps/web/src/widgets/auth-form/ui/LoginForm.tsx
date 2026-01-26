"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { signIn } from "@/features/auth";
import { cn } from "@/shared/lib";
import { Button, Input } from "@/shared/ui";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");

        return;
      }

      queryClient.clear();
      router.push("/dashboard");
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-sm font-bold text-gray-600 tracking-wider mb-4">
        ENTER YOUR ACCOUNT DETAILS
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div data-testid="login-error" className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Input
          data-testid="login-email"
          label="Email / Username"
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          data-testid="login-password"
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-secondary transition-colors"
          >
            Forgot password?
          </Link>
          <Button data-testid="login-submit" type="submit" isLoading={isLoading} className="flex-1">
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}
