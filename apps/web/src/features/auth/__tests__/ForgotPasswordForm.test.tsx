import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "../ui/ForgotPasswordForm";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("ForgotPasswordForm", () => {
  const defaultProps = {
    email: "",
    onEmailChange: vi.fn(),
    error: null,
    isLoading: false,
    onSubmit: vi.fn(),
  };

  // Helper to get email input
  const getEmailInput = () => screen.getByPlaceholderText(/you@example.com/i);

  it("renders the form with title and description", () => {
    render(<ForgotPasswordForm {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /forgot password/i })).toBeInTheDocument();
    expect(
      screen.getByText(/enter your email address and we'll send you a link/i)
    ).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<ForgotPasswordForm {...defaultProps} />);

    expect(getEmailInput()).toBeInTheDocument();
    expect(getEmailInput()).toHaveAttribute("type", "email");
  });

  it("displays current email value", () => {
    render(
      <ForgotPasswordForm {...defaultProps} email="test@example.com" />
    );

    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  it("calls onEmailChange when email input changes", () => {
    const onEmailChange = vi.fn();
    render(
      <ForgotPasswordForm {...defaultProps} onEmailChange={onEmailChange} />
    );

    fireEvent.change(getEmailInput(), {
      target: { value: "new@example.com" },
    });

    expect(onEmailChange).toHaveBeenCalledWith("new@example.com");
  });

  it("renders submit button", () => {
    render(<ForgotPasswordForm {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<ForgotPasswordForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows loading state when isLoading is true", () => {
    render(<ForgotPasswordForm {...defaultProps} isLoading />);

    const button = screen.getByRole("button", { name: /send reset link/i });
    expect(button).toBeDisabled();
  });

  it("displays error message when error is provided", () => {
    render(
      <ForgotPasswordForm {...defaultProps} error="Invalid email address" />
    );

    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it("does not display error when error is null", () => {
    render(<ForgotPasswordForm {...defaultProps} error={null} />);

    // Check that no error message element exists
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it("renders link to sign in page", () => {
    render(<ForgotPasswordForm {...defaultProps} />);

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toHaveAttribute("href", "/");
  });

  it("email field is required", () => {
    render(<ForgotPasswordForm {...defaultProps} />);

    expect(getEmailInput()).toBeRequired();
  });

  it("has correct autocomplete attribute", () => {
    render(<ForgotPasswordForm {...defaultProps} />);

    expect(getEmailInput()).toHaveAttribute("autocomplete", "email");
  });
});
