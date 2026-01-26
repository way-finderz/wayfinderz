import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { CreateInviteCard } from "./CreateInviteCard";

const meta: Meta<typeof CreateInviteCard> = {
  title: "Features/InviteCodes/CreateInviteCard",
  component: CreateInviteCard,
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
    onCreateCode: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isCreating: false,
  },
};

export const Creating: Story = {
  args: {
    isCreating: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-96">
      <CreateInviteCard isCreating={false} onCreateCode={() => {}} />
      <CreateInviteCard isCreating onCreateCode={() => {}} />
    </div>
  ),
};
