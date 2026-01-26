import type { Meta, StoryObj } from "@storybook/react";

import { InviteStatus } from "./InviteStatus";

const meta: Meta<typeof InviteStatus> = {
  title: "Features/InviteCodes/InviteStatus",
  component: InviteStatus,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Valid: Story = {
  args: {
    isValid: true,
  },
};

export const Invalid: Story = {
  args: {
    isValid: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <InviteStatus isValid />
      <InviteStatus isValid={false} />
    </div>
  ),
};
