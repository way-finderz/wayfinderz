import type { Meta, StoryObj } from "@storybook/react";

import { EmailSentScreen } from "./EmailSentScreen";

const meta: Meta<typeof EmailSentScreen> = {
  title: "Features/Auth/EmailSentScreen",
  component: EmailSentScreen,
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

export const Default: Story = {};
