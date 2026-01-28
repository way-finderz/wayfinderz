"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { logger } from "@/shared/lib";

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
    logger.debug("ErrorBoundary", "Constructed");
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    logger.error("ErrorBoundary", "getDerivedStateFromError", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("ErrorBoundary", "componentDidCatch", {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidMount(): void {
    logger.debug("ErrorBoundary", "Mounted");
  }

  componentWillUnmount(): void {
    logger.debug("ErrorBoundary", "Will unmount");
  }

  handleReset = (): void => {
    logger.info("ErrorBoundary", "Reset triggered");
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      logger.warn("ErrorBoundary", "Rendering error fallback", {
        errorMessage: this.state.error?.message,
      });

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

    logger.debug("ErrorBoundary", "Rendering children");

    return this.props.children;
  }
}
