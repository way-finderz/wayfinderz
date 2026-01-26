import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResetPasswordForm } from "../ui/ResetPasswordForm";

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

describe("ResetPasswordForm", () => {
  const defaultProps = {
    password: "",
    onPasswordChange: vi.fn(),
    confirmPassword: "",
    onConfirmPasswordChange: vi.fn(),
    error: null,
    isLoading: false,
    onSubmit: vi.fn(),
  };

  // Helper to get password inputs (both have same placeholder)
  const getPasswordInputs = () => screen.getAllByPlaceholderText(/••••••••/);

  it("renders the form with title and description", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    expect(
      screen.getByText(/enter your new password below/i)
    ).toBeInTheDocument();
  });

  it("renders password inputs", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    // Find the label elements specifically
    expect(screen.getByText("New Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    expect(getPasswordInputs()).toHaveLength(2);
  });

  it("displays current password values", () => {
    render(
      <ResetPasswordForm
        {...defaultProps}
        password="mypassword"
        confirmPassword="mypassword"
      />
    );

    expect(screen.getAllByDisplayValue("mypassword")).toHaveLength(2);
  });

  it("calls onPasswordChange when password input changes", () => {
    const onPasswordChange = vi.fn();
    render(
      <ResetPasswordForm {...defaultProps} onPasswordChange={onPasswordChange} />
    );

    const [passwordInput] = getPasswordInputs();
    fireEvent.change(passwordInput, {
      target: { value: "newpassword123" },
    });

    expect(onPasswordChange).toHaveBeenCalledWith("newpassword123");
  });

  it("calls onConfirmPasswordChange when confirm password input changes", () => {
    const onConfirmPasswordChange = vi.fn();
    render(
      <ResetPasswordForm
        {...defaultProps}
        onConfirmPasswordChange={onConfirmPasswordChange}
      />
    );

    const [, confirmInput] = getPasswordInputs();
    fireEvent.change(confirmInput, {
      target: { value: "newpassword123" },
    });

    expect(onConfirmPasswordChange).toHaveBeenCalledWith("newpassword123");
  });

  it("renders submit button", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<ResetPasswordForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows loading state when isLoading is true", () => {
    render(<ResetPasswordForm {...defaultProps} isLoading />);

    const button = screen.getByRole("button", { name: /reset password/i });
    expect(button).toBeDisabled();
  });

  it("displays error message when error is provided", () => {
    render(
      <ResetPasswordForm
        {...defaultProps}
        error="Password reset failed"
      />
    );

    expect(screen.getByText(/password reset failed/i)).toBeInTheDocument();
  });

  it("does not display error when error is null", () => {
    render(<ResetPasswordForm {...defaultProps} error={null} />);

    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
  });

  it("shows password mismatch error when passwords do not match", () => {
    render(
      <ResetPasswordForm
        {...defaultProps}
        password="password123"
        confirmPassword="different"
      />
    );

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("does not show password mismatch error when passwords match", () => {
    render(
      <ResetPasswordForm
        {...defaultProps}
        password="password123"
        confirmPassword="password123"
      />
    );

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });

  it("does not show password mismatch error when confirm password is empty", () => {
    render(
      <ResetPasswordForm
        {...defaultProps}
        password="password123"
        confirmPassword=""
      />
    );

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });

  it("shows password requirements hint", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it("renders link to request new reset link", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    const resetLink = screen.getByRole("link", { name: /request a new reset link/i });
    expect(resetLink).toHaveAttribute("href", "/forgot-password");
  });

  it("password fields are required", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    const [passwordInput, confirmInput] = getPasswordInputs();
    expect(passwordInput).toBeRequired();
    expect(confirmInput).toBeRequired();
  });

  it("password fields have correct type", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    const [passwordInput, confirmInput] = getPasswordInputs();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");
  });

  it("has correct autocomplete attributes", () => {
    render(<ResetPasswordForm {...defaultProps} />);

    const [passwordInput, confirmInput] = getPasswordInputs();
    expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
    expect(confirmInput).toHaveAttribute("autocomplete", "new-password");
  });
});
