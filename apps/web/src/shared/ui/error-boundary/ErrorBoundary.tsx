"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "../button";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
        >
          <div className="text-4xl mb-4">Something went wrong</div>
          <p className="text-gray-600 mb-6 max-w-md">
            {this.state.error?.message ||
              "An unexpected error occurred. Please try again."}
          </p>
          <Button onClick={this.handleReset} variant="secondary">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
