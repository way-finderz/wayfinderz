import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ResetPasswordForm } from "./ResetPasswordForm";

const meta: Meta<typeof ResetPasswordForm> = {
  title: "Features/Auth/ResetPasswordForm",
  component: ResetPasswordForm,
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
    onPasswordChange: fn(),
    onConfirmPasswordChange: fn(),
    onSubmit: fn((e: React.FormEvent) => e.preventDefault()),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    password: "",
    confirmPassword: "",
    error: null,
    isLoading: false,
  },
};

export const WithPassword: Story = {
  args: {
    password: "mypassword123",
    confirmPassword: "",
    error: null,
    isLoading: false,
  },
};

export const PasswordMismatch: Story = {
  args: {
    password: "mypassword123",
    confirmPassword: "differentpassword",
    error: null,
    isLoading: false,
  },
};

export const WithError: Story = {
  args: {
    password: "mypassword123",
    confirmPassword: "mypassword123",
    error: "This reset link has expired. Please request a new one.",
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    password: "mypassword123",
    confirmPassword: "mypassword123",
    error: null,
    isLoading: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-12 w-96">
      <ResetPasswordForm
        password=""
        onPasswordChange={() => {}}
        confirmPassword=""
        onConfirmPasswordChange={() => {}}
        error={null}
        isLoading={false}
        onSubmit={(e) => e.preventDefault()}
      />
      <hr />
      <ResetPasswordForm
        password="mypassword123"
        onPasswordChange={() => {}}
        confirmPassword="differentpassword"
        onConfirmPasswordChange={() => {}}
        error={null}
        isLoading={false}
        onSubmit={(e) => e.preventDefault()}
      />
      <hr />
      <ResetPasswordForm
        password="mypassword123"
        onPasswordChange={() => {}}
        confirmPassword="mypassword123"
        onConfirmPasswordChange={() => {}}
        error="This reset link has expired."
        isLoading={false}
        onSubmit={(e) => e.preventDefault()}
      />
    </div>
  ),
};
