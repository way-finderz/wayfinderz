"use client";

import { useRouter } from "next/navigation";
import { type FormEvent,useState } from "react";

import { validateInviteCode } from "@/features/invite-codes";
import { cn } from "@/shared/lib";
import { Button, Input } from "@/shared/ui";

interface QuickRegisterFormProps {
  className?: string;
}

export function QuickRegisterForm({ className }: QuickRegisterFormProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteCode.trim()) {
      setError("Please enter an invite code");

      return;
    }

    setIsLoading(true);

    try {
      const result = await validateInviteCode(inviteCode.trim());

      if (!result.valid) {
        setError(result.message || "Invalid invite code");

        return;
      }

      // Code is valid, redirect to signup with the code
      router.push(`/signup?code=${encodeURIComponent(inviteCode.trim())}`);
    } catch (_err) {
      setError("Failed to validate code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-sm font-bold text-accent-yellow tracking-wider mb-4">
        QUICK STUDENT REGISTRATION
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div data-testid="quick-register-error" className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Input
          data-testid="quick-register-input"
          label="Student Registration Code"
          type="text"
          name="registrationCode"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter your code"
        />

        <Button
          data-testid="quick-register-submit"
          type="submit"
          isLoading={isLoading}
          disabled={!inviteCode.trim()}
          className="w-full"
        >
          Join
        </Button>
      </form>
    </div>
  );
}
