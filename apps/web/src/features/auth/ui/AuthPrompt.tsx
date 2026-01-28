"use client";

import Link from "next/link";

import { Divider } from "@/shared/ui";
import { LoginForm } from "@/widgets/auth-form";

interface AuthPromptProps {
  redirectTo?: string;
}

export function AuthPrompt({ redirectTo }: AuthPromptProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm overflow-hidden">
        <header className="bg-[#6F2AEC] py-6 px-4">
          <h1 className="font-display text-2xl font-black text-white tracking-wide text-center">
            Sign in to continue
          </h1>
        </header>

        <div className="p-6 space-y-6">
          <LoginForm redirectTo={redirectTo} />

          <Divider text="OR" className="my-6" />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-primary-secondary font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
