import type { Meta, StoryObj } from "@storybook/react";

import { FormError } from "./FormError";

const meta: Meta<typeof FormError> = {
  title: "Shared/UI/FormError",
  component: FormError,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Something went wrong. Please try again.",
  },
};

export const ValidationError: Story = {
  args: {
    message: "Passwords do not match",
  },
};

export const AuthError: Story = {
  args: {
    message: "Invalid email or password",
  },
};

export const LongMessage: Story = {
  args: {
    message:
      "Please verify your email before resetting your password. Check your inbox for a verification email.",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <FormError message="Short error message" />
      <FormError message="Passwords do not match" />
      <FormError message="Please verify your email before resetting your password. Check your inbox for a verification email." />
    </div>
  ),
};
