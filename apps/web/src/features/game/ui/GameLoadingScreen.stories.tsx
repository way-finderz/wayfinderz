import type { Meta, StoryObj } from "@storybook/react";

import { GameLoadingScreen } from "./GameLoadingScreen";

const meta: Meta<typeof GameLoadingScreen> = {
  title: "Features/Game/GameLoadingScreen",
  component: GameLoadingScreen,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
