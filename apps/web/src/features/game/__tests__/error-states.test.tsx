import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GameErrorScreen } from "../ui/GameErrorScreen";

describe("GameErrorScreen", () => {
  it("renders with default error message", () => {
    render(<GameErrorScreen onRetry={vi.fn()} />);

    // The h2 title contains "Something went wrong"
    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/Failed to start the game/)).toBeInTheDocument();
  });

  it("renders with custom error message", () => {
    render(<GameErrorScreen error="Custom error message" onRetry={vi.fn()} />);

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("detects network errors", () => {
    render(<GameErrorScreen error="Network connection failed" onRetry={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Connection Problem" })).toBeInTheDocument();
    expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
  });

  it("detects not found errors", () => {
    render(<GameErrorScreen error="Journey not found" onRetry={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Journey Not Found" })).toBeInTheDocument();
    expect(screen.getByText(/doesn't exist or has been removed/)).toBeInTheDocument();
  });

  it("detects unauthorized errors", () => {
    render(<GameErrorScreen error="Unauthorized - session expired" onRetry={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Session Expired" })).toBeInTheDocument();
    expect(screen.getByText(/sign in again/)).toBeInTheDocument();
  });

  it("allows explicit error type override", () => {
    render(
      <GameErrorScreen
        error="Some generic error"
        errorType="network"
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Connection Problem" })).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<GameErrorScreen error="Error" onRetry={onRetry} />);

    await user.click(screen.getByTestId("game-error-retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has link to dashboard", () => {
    render(<GameErrorScreen onRetry={vi.fn()} />);

    const btn = screen.getByRole("button", { name: "Go to Dashboard" });
    expect(btn).toBeInTheDocument();
    // Multiple links to dashboard exist, check at least one has correct href
    const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
    expect(dashboardLinks.some(link => link.getAttribute("href") === "/dashboard")).toBe(true);
  });

  it("has accessible alert role", () => {
    render(<GameErrorScreen error="Error" onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
