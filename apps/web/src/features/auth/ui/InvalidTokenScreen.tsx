import Link from "next/link";

import { Button } from "@/shared/ui";

export function InvalidTokenScreen() {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🔗</div>
      <h1 className="text-3xl font-bold mb-4">Invalid Reset Link</h1>
      <p className="text-gray-600 mb-6">
        This password reset link is invalid or has expired. Please request a new
        one.
      </p>
      <Link href="/forgot-password">
        <Button>Request New Link</Button>
      </Link>
    </div>
  );
}
