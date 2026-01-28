import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGate } from "../ui/AdminGate";

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

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

describe("AdminGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(window, "location", {
      value: { pathname: "/admin/invites" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders loading skeleton when session is pending", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders children when user is admin", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
      },
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("renders AuthPrompt when user is not authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("auth-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders Access Denied when user is not admin", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Regular User", email: "user@example.com", role: "user" },
      },
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders Access Denied when user has no role", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "User", email: "user@example.com" },
      },
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders Access Denied with link to dashboard", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "User", email: "user@example.com", role: "user" },
      },
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    const dashboardLink = screen.getByRole("link", { name: /go to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("does not treat moderator role as admin", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Mod", email: "mod@example.com", role: "moderator" },
      },
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("correctly identifies admin role", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Admin", email: "admin@example.com", role: "admin" },
      },
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("does not show AuthPrompt while loading", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.queryByTestId("auth-prompt")).not.toBeInTheDocument();
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("passes current pathname as redirectTo to AuthPrompt", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <AdminGate>
        <div>Admin content</div>
      </AdminGate>
    );

    await act(async () => {
      vi.runAllTimers();
    });

    const authPrompt = screen.getByTestId("auth-prompt");
    expect(authPrompt).toHaveAttribute("data-redirect-to", "/admin/invites");
  });
});
