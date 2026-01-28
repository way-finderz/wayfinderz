import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGate } from "../ui/AuthGate";

const mockUseSession = vi.hoisted(() => vi.fn());
vi.mock("../api/auth-client", () => ({
  useSession: mockUseSession,
}));

vi.mock("@/widgets/app-layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

vi.mock("@/shared/ui", () => ({
  PageLoadingSkeleton: ({ withHeader }: { withHeader?: boolean }) => (
    <div data-testid="loading-skeleton" data-with-header={withHeader}>
      Loading...
    </div>
  ),
}));

vi.mock("../ui/AuthPrompt", () => ({
  AuthPrompt: ({ redirectTo }: { redirectTo?: string }) => (
    <div data-testid="auth-prompt" data-redirect-to={redirectTo}>
      Sign in to continue
    </div>
  ),
}));

describe("AuthGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loading skeleton before effects run and session resolves", async () => {
    // Start with pending session
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    // Should show loading skeleton
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders loading skeleton when session is pending", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    // Run effects
    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders loading skeleton with withHeader=false", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    const skeleton = screen.getByTestId("loading-skeleton");
    expect(skeleton).toHaveAttribute("data-with-header", "false");
  });

  it("renders children when user is authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "1", name: "Test User", email: "test@example.com" } },
      isPending: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("renders AuthPrompt when user is not authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("auth-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders AuthPrompt when session user is null", async () => {
    mockUseSession.mockReturnValue({
      data: { user: null },
      isPending: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("auth-prompt")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("passes current pathname as redirectTo to AuthPrompt", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    const authPrompt = screen.getByTestId("auth-prompt");
    expect(authPrompt).toHaveAttribute("data-redirect-to", "/dashboard");
  });

  it("does not show AuthPrompt while loading", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.queryByTestId("auth-prompt")).not.toBeInTheDocument();
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("does not render children when not authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
