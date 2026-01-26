import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ResetSuccessScreen } from "./ResetSuccessScreen";

const meta: Meta<typeof ResetSuccessScreen> = {
  title: "Features/Auth/ResetSuccessScreen",
  component: ResetSuccessScreen,
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
    onSignIn: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
