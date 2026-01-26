import type { Meta, StoryObj } from "@storybook/react";

import { VerificationFailedScreen } from "./VerificationFailedScreen";

const meta: Meta<typeof VerificationFailedScreen> = {
  title: "Features/Auth/VerificationFailedScreen",
  component: VerificationFailedScreen,
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
    errorMessage: "Failed to verify email",
  },
};

export const Expired: Story = {
  args: {
    errorMessage: "Token has expired",
  },
};

export const Invalid: Story = {
  args: {
    errorMessage: "Token is invalid",
  },
};

export const CustomError: Story = {
  args: {
    errorMessage: "The verification link you used is no longer valid.",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-12 w-96">
      <VerificationFailedScreen errorMessage="Token has expired" />
      <hr />
      <VerificationFailedScreen errorMessage="Token is invalid" />
      <hr />
      <VerificationFailedScreen errorMessage="Failed to verify email" />
    </div>
  ),
};
