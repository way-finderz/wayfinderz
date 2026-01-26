import Link from "next/link";

import { Button } from "@/shared/ui";

export interface VerificationFailedScreenProps {
  errorMessage: string;
}

function getDisplayMessage(errorMessage: string): string {
  if (errorMessage.includes("expired")) {
    return "This verification link has expired. Please request a new one.";
  }
  if (errorMessage.includes("invalid")) {
    return "This verification link is invalid. Please request a new one.";
  }

  return errorMessage || "Failed to verify email";
}

export function VerificationFailedScreen({
  errorMessage,
}: VerificationFailedScreenProps) {
  const displayMessage = getDisplayMessage(errorMessage);

  return (
    <div className="text-center">
      <div className="text-6xl mb-6">😕</div>
      <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
      <p className="text-gray-600 mb-6">{displayMessage}</p>
      <div className="space-y-3">
        <Link href="/dashboard">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
        <p className="text-sm text-gray-500">
          You can request a new verification email from your dashboard.
        </p>
      </div>
    </div>
  );
}
