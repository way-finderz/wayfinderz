import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";

import { SuccessScreen } from "./SuccessScreen";

const meta: Meta<typeof SuccessScreen> = {
  title: "Shared/UI/SuccessScreen",
  component: SuccessScreen,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Success!",
    description: "Your action was completed successfully.",
  },
};

export const EmailVerified: Story = {
  args: {
    emoji: "🎉",
    title: "Email Verified!",
    description:
      "Your email has been successfully verified. You now have full access to Way Finderz.",
    children: <Button>Go to Dashboard</Button>,
  },
};

export const PasswordReset: Story = {
  args: {
    emoji: "🎉",
    title: "Password Reset!",
    description:
      "Your password has been successfully reset. You can now sign in with your new password.",
    children: <Button>Sign In</Button>,
  },
};

export const EmailSent: Story = {
  args: {
    emoji: "📧",
    title: "Check Your Email",
    description:
      "If an account with that email exists and is verified, we've sent you a link to reset your password. The link will expire in 1 hour.",
    children: (
      <p className="text-sm text-gray-500">
        Don't see the email? Check your spam folder.
      </p>
    ),
  },
};

export const VerificationFailed: Story = {
  args: {
    emoji: "😕",
    title: "Verification Failed",
    description:
      "This verification link has expired. Please request a new one.",
    children: <Button>Go to Dashboard</Button>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-12 w-96">
      <SuccessScreen
        emoji="🎉"
        title="Email Verified!"
        description="Your email has been successfully verified."
      >
        <Button>Continue</Button>
      </SuccessScreen>

      <hr />

      <SuccessScreen
        emoji="📧"
        title="Check Your Email"
        description="We've sent you a password reset link."
      />

      <hr />

      <SuccessScreen
        emoji="😕"
        title="Something Went Wrong"
        description="Please try again later."
      >
        <Button variant="ghost">Try Again</Button>
      </SuccessScreen>
    </div>
  ),
};
