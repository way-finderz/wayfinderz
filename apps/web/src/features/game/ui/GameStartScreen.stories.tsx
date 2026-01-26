import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import type { Journey } from "../model/types";

import { GameStartScreen } from "./GameStartScreen";

const sampleJourney: Journey = {
  id: "1",
  slug: "rome-adventure",
  name: "Rome Adventure",
  description: "Learn Italian on your way to Rome!",
  language: "Italian",
  startCityName: "Milan",
  targetCityName: "Rome",
  emoji: "🇮🇹",
  winMessage: "Congratulations! You made it to Rome!",
};

const meta: Meta<typeof GameStartScreen> = {
  title: "Features/Game/GameStartScreen",
  component: GameStartScreen,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    onStartGame: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    journey: sampleJourney,
  },
};

export const NoJourney: Story = {
  args: {
    journey: null,
  },
};

export const FrenchJourney: Story = {
  args: {
    journey: {
      ...sampleJourney,
      id: "2",
      slug: "paris-trip",
      name: "Paris Trip",
      description: "Learn French while traveling to Paris!",
      language: "French",
      emoji: "🇫🇷",
    },
  },
};
