import { Input } from "@/shared/ui";

export interface SignupFormFieldsProps {
  name: string;
  onNameChange: (name: string) => void;
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (confirmPassword: string) => void;
}

export function SignupFormFields({
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
}: SignupFormFieldsProps) {
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <>
      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        placeholder="Your name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
        placeholder="you@example.com"
      />

      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          placeholder="••••••••"
        />
        <p className="mt-1 text-sm text-gray-500">At least 8 characters</p>
      </div>

      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        required
        placeholder="••••••••"
        error={passwordMismatch ? "Passwords do not match" : undefined}
      />
    </>
  );
}
