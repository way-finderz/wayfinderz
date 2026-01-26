import type { Meta, StoryObj } from "@storybook/react";

import { InvalidTokenScreen } from "./InvalidTokenScreen";

const meta: Meta<typeof InvalidTokenScreen> = {
  title: "Features/Auth/InvalidTokenScreen",
  component: InvalidTokenScreen,
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
