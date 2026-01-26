import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignupFormFields } from "../ui/SignupFormFields";

describe("SignupFormFields", () => {
  const defaultProps = {
    name: "",
    onNameChange: vi.fn(),
    email: "",
    onEmailChange: vi.fn(),
    password: "",
    onPasswordChange: vi.fn(),
    confirmPassword: "",
    onConfirmPasswordChange: vi.fn(),
  };

  // Helper to get inputs by their placeholder text
  const getNameInput = () => screen.getByPlaceholderText(/your name/i);
  const getEmailInput = () => screen.getByPlaceholderText(/you@example.com/i);
  const getPasswordInputs = () =>
    screen.getAllByPlaceholderText(/••••••••/);

  it("renders all form fields", () => {
    render(<SignupFormFields {...defaultProps} />);

    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm password/i)).toBeInTheDocument();

    expect(getNameInput()).toBeInTheDocument();
    expect(getEmailInput()).toBeInTheDocument();
    expect(getPasswordInputs()).toHaveLength(2);
  });

  it("displays current values", () => {
    render(
      <SignupFormFields
        {...defaultProps}
        name="John"
        email="john@example.com"
        password="password123"
        confirmPassword="password123"
      />
    );

    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("password123")).toHaveLength(2);
  });

  it("calls onNameChange when name input changes", () => {
    const onNameChange = vi.fn();
    render(<SignupFormFields {...defaultProps} onNameChange={onNameChange} />);

    fireEvent.change(getNameInput(), {
      target: { value: "Jane" },
    });

    expect(onNameChange).toHaveBeenCalledWith("Jane");
  });

  it("calls onEmailChange when email input changes", () => {
    const onEmailChange = vi.fn();
    render(<SignupFormFields {...defaultProps} onEmailChange={onEmailChange} />);

    fireEvent.change(getEmailInput(), {
      target: { value: "jane@example.com" },
    });

    expect(onEmailChange).toHaveBeenCalledWith("jane@example.com");
  });

  it("calls onPasswordChange when password input changes", () => {
    const onPasswordChange = vi.fn();
    render(<SignupFormFields {...defaultProps} onPasswordChange={onPasswordChange} />);

    // First password input (Password)
    const [passwordInput] = getPasswordInputs();
    fireEvent.change(passwordInput, {
      target: { value: "newpassword" },
    });

    expect(onPasswordChange).toHaveBeenCalledWith("newpassword");
  });

  it("calls onConfirmPasswordChange when confirm password input changes", () => {
    const onConfirmPasswordChange = vi.fn();
    render(
      <SignupFormFields
        {...defaultProps}
        onConfirmPasswordChange={onConfirmPasswordChange}
      />
    );

    // Second password input (Confirm Password)
    const [, confirmPasswordInput] = getPasswordInputs();
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newpassword" },
    });

    expect(onConfirmPasswordChange).toHaveBeenCalledWith("newpassword");
  });

  it("shows password mismatch error when passwords do not match", () => {
    render(
      <SignupFormFields
        {...defaultProps}
        password="password123"
        confirmPassword="different"
      />
    );

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("does not show password mismatch error when passwords match", () => {
    render(
      <SignupFormFields
        {...defaultProps}
        password="password123"
        confirmPassword="password123"
      />
    );

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });

  it("does not show password mismatch error when confirm password is empty", () => {
    render(
      <SignupFormFields
        {...defaultProps}
        password="password123"
        confirmPassword=""
      />
    );

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });

  it("shows password requirements hint", () => {
    render(<SignupFormFields {...defaultProps} />);

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it("all fields are required", () => {
    render(<SignupFormFields {...defaultProps} />);

    expect(getNameInput()).toBeRequired();
    expect(getEmailInput()).toBeRequired();
    const [passwordInput, confirmInput] = getPasswordInputs();
    expect(passwordInput).toBeRequired();
    expect(confirmInput).toBeRequired();
  });

  it("email field has correct type", () => {
    render(<SignupFormFields {...defaultProps} />);

    expect(getEmailInput()).toHaveAttribute("type", "email");
  });

  it("password fields have correct type", () => {
    render(<SignupFormFields {...defaultProps} />);

    const [passwordInput, confirmInput] = getPasswordInputs();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");
  });
});
