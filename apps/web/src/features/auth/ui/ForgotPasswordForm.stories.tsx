import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

const meta: Meta<typeof ForgotPasswordForm> = {
  title: "Features/Auth/ForgotPasswordForm",
  component: ForgotPasswordForm,
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
  args: {
    onEmailChange: fn(),
    onSubmit: fn((e: React.FormEvent) => e.preventDefault()),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    email: "",
    error: null,
    isLoading: false,
  },
};

export const WithEmail: Story = {
  args: {
    email: "user@example.com",
    error: null,
    isLoading: false,
  },
};

export const WithError: Story = {
  args: {
    email: "user@example.com",
    error:
      "Please verify your email before resetting your password. Check your inbox for a verification email.",
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    email: "user@example.com",
    error: null,
    isLoading: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-12 w-96">
      <ForgotPasswordForm
        email=""
        onEmailChange={() => {}}
        error={null}
        isLoading={false}
        onSubmit={(e) => e.preventDefault()}
      />
      <hr />
      <ForgotPasswordForm
        email="user@example.com"
        onEmailChange={() => {}}
        error="Please verify your email first."
        isLoading={false}
        onSubmit={(e) => e.preventDefault()}
      />
      <hr />
      <ForgotPasswordForm
        email="user@example.com"
        onEmailChange={() => {}}
        error={null}
        isLoading
        onSubmit={(e) => e.preventDefault()}
      />
    </div>
  ),
};
