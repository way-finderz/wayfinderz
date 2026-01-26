import type { Meta, StoryObj } from "@storybook/react";

import { WelcomeHeader } from "./WelcomeHeader";

const meta: Meta<typeof WelcomeHeader> = {
  title: "Shared/UI/WelcomeHeader",
  component: WelcomeHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: "John",
  },
};

export const WithCustomSubtitle: Story = {
  args: {
    userName: "Sarah",
    subtitle: "Ready for your next adventure?",
  },
};

export const LongName: Story = {
  args: {
    userName: "Christopher Alexander",
    subtitle: "Welcome back to your learning journey",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <WelcomeHeader userName="John" />
      <WelcomeHeader
        userName="Sarah"
        subtitle="Ready for your next adventure?"
      />
      <WelcomeHeader
        userName="Alex"
        subtitle="You have 3 journeys in progress"
      />
    </div>
  ),
};
