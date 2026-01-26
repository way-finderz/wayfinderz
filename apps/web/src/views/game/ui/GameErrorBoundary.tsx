"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/shared/ui";

interface GameErrorBoundaryProps {
  children: ReactNode;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GameErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("GameErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Way Finderz</h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              &larr; Back to Dashboard
            </Link>
          </div>

          <div
            role="alert"
            className="bg-white border rounded-lg p-12 text-center"
          >
            <div className="text-6xl mb-6">Something went wrong</div>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">
              Game Error
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message ||
                "An unexpected error occurred while playing the game."}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Don&apos;t worry, your progress has been saved.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={this.handleReset} variant="secondary">
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
