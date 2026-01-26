import Link from "next/link";
import { match } from "ts-pattern";

import { Button } from "@/shared/ui";

export type GameErrorType = "network" | "not_found" | "unauthorized" | "generic";

export interface GameErrorScreenProps {
  error?: string | null;
  errorType?: GameErrorType;
  onRetry: () => void;
}

function getErrorDetails(error: string | null | undefined, errorType?: GameErrorType) {
  const detectedType = errorType ?? detectErrorType(error);

  return match(detectedType)
    .with("network", () => ({
      title: "Connection Problem",
      message: "Unable to connect to the server. Please check your internet connection.",
      suggestion: "Make sure you're connected to the internet and try again.",
      icon: "Connection Problem",
    }))
    .with("not_found", () => ({
      title: "Journey Not Found",
      message: "The journey you're looking for doesn't exist or has been removed.",
      suggestion: "Try selecting a different journey from the dashboard.",
      icon: "Journey Not Found",
    }))
    .with("unauthorized", () => ({
      title: "Session Expired",
      message: "Your session has expired. Please sign in again.",
      suggestion: "You'll be redirected to the login page.",
      icon: "Session Expired",
    }))
    .otherwise(() => ({
      title: "Something went wrong",
      message: error || "Failed to start the game. Please try again.",
      suggestion: "If the problem persists, try refreshing the page.",
      icon: "Something went wrong",
    }));
}

function detectErrorType(error: string | null | undefined): GameErrorType {
  if (!error) return "generic";

  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection") ||
    lowerError.includes("timeout")
  ) {
    return "network";
  }

  if (
    lowerError.includes("not found") ||
    lowerError.includes("404") ||
    lowerError.includes("doesn't exist")
  ) {
    return "not_found";
  }

  if (
    lowerError.includes("unauthorized") ||
    lowerError.includes("401") ||
    lowerError.includes("session") ||
    lowerError.includes("auth")
  ) {
    return "unauthorized";
  }

  return "generic";
}

export function GameErrorScreen({ error, errorType, onRetry }: GameErrorScreenProps) {
  const { title, message, suggestion, icon } = getErrorDetails(error, errorType);

  return (
    <div data-testid="game-error-screen" className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Way Finderz</h1>
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-12 text-center" role="alert">
        <div className="text-6xl mb-6">{icon}</div>
        <h2 className="text-2xl font-semibold mb-4 text-red-600">
          {title}
        </h2>
        <p data-testid="game-error-message" className="text-gray-600 mb-4">
          {message}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          {suggestion}
        </p>
        <div className="flex justify-center gap-4">
          <Button
            data-testid="game-error-retry"
            onClick={onRetry}
            variant="secondary"
            className="bg-[#6F2AEC] hover:bg-[#5B22C4]"
          >
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
