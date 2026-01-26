import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminRoute } from "../ui/AdminRoute";

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

describe("AdminRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when session is pending", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders children when user is admin", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
      },
      isPending: false,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("redirects to home when user is not authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("redirects to dashboard when user is not admin", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Regular User", email: "user@example.com", role: "user" },
      },
      isPending: false,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to dashboard when user has no role", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "User", email: "user@example.com" },
      },
      isPending: false,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("returns null when not admin (after redirect)", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "User", email: "user@example.com", role: "user" },
      },
      isPending: false,
    });

    const { container } = render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    expect(container.innerHTML).toBe("");
  });

  it("does not redirect while loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("correctly identifies admin role", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Admin", email: "admin@example.com", role: "admin" },
      },
      isPending: false,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not treat moderator role as admin", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Mod", email: "mod@example.com", role: "moderator" },
      },
      isPending: false,
    });

    render(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
