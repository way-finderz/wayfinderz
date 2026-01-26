import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ProfileCard } from "./ProfileCard";

const meta: Meta<typeof ProfileCard> = {
  title: "Features/Auth/ProfileCard",
  component: ProfileCard,
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
    onSignOut: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    createdAt: new Date("2024-01-15"),
  },
};

export const Admin: Story = {
  args: {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: new Date("2023-06-01"),
  },
};

export const NoCreatedAt: Story = {
  args: {
    name: "New User",
    email: "new@example.com",
    role: "user",
    createdAt: undefined,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-96">
      <ProfileCard
        name="John Doe"
        email="john@example.com"
        role="user"
        createdAt={new Date("2024-01-15")}
        onSignOut={() => {}}
      />
      <ProfileCard
        name="Admin User"
        email="admin@example.com"
        role="admin"
        createdAt={new Date("2023-06-01")}
        onSignOut={() => {}}
      />
    </div>
  ),
};
