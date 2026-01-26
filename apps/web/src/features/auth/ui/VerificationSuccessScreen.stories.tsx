import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { VerificationSuccessScreen } from "./VerificationSuccessScreen";

const meta: Meta<typeof VerificationSuccessScreen> = {
  title: "Features/Auth/VerificationSuccessScreen",
  component: VerificationSuccessScreen,
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
    onGoToDashboard: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
