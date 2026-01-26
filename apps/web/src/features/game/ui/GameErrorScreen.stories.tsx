import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { GameErrorScreen } from "./GameErrorScreen";

const meta: Meta<typeof GameErrorScreen> = {
  title: "Features/Game/GameErrorScreen",
  component: GameErrorScreen,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    onRetry: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: null,
  },
};

export const WithCustomError: Story = {
  args: {
    error: "Network error: Unable to connect to the server.",
  },
};

export const JourneyNotFound: Story = {
  args: {
    error: "Journey not found. Please check the URL and try again.",
  },
};
