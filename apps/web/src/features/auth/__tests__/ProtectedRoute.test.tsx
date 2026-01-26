import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedRoute } from "../ui/ProtectedRoute";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth-client with vi.hoisted
const mockUseSession = vi.hoisted(() => vi.fn());
vi.mock("../api/auth-client", () => ({
  useSession: mockUseSession,
}));

// Mock AppLayout
vi.mock("@/widgets/app-layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when session is pending", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "1", name: "Test User", email: "test@example.com" } },
      isPending: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("redirects to home when user is not authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("redirects when session is null", async () => {
    mockUseSession.mockReturnValue({
      data: { user: null },
      isPending: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows loading state when not authenticated (during redirect)", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    // Shows the layout with loading skeleton while redirecting
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("does not redirect while loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
