"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/shared/ui";

interface DashboardErrorBoundaryProps {
  children: ReactNode;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("DashboardErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div
            role="alert"
            className="bg-white border rounded-lg p-12 text-center"
          >
            <div className="text-6xl mb-6">Dashboard Error</div>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-8">
              {this.state.error?.message ||
                "An unexpected error occurred while loading the dashboard."}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={this.handleReset} variant="secondary">
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
