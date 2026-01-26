import type { Meta, StoryObj } from "@storybook/react";

import type { Journey, JourneyProgress } from "../model/types";

import { JourneyTile } from "./JourneyTile";

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

const sampleProgress: JourneyProgress = {
  id: "p1",
  userId: "u1",
  journeyId: "1",
  completed: true,
  bestTimeMs: 125000,
  lastCompletedAt: new Date(),
  completionCount: 3,
};

const meta: Meta<typeof JourneyTile> = {
  title: "Features/Game/JourneyTile",
  component: JourneyTile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    journey: sampleJourney,
  },
};

export const WithProgress: Story = {
  args: {
    journey: sampleJourney,
    progress: sampleProgress,
  },
};

export const NotCompleted: Story = {
  args: {
    journey: sampleJourney,
    progress: {
      ...sampleProgress,
      completed: false,
      bestTimeMs: null,
    },
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
      startCityName: "Lyon",
      targetCityName: "Paris",
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <JourneyTile journey={sampleJourney} />
      <JourneyTile journey={sampleJourney} progress={sampleProgress} />
      <JourneyTile
        journey={{
          ...sampleJourney,
          id: "2",
          slug: "spanish-journey",
          name: "Spanish Journey",
          description: "Learn Spanish on your adventure!",
          language: "Spanish",
          emoji: "🇪🇸",
        }}
      />
    </div>
  ),
};
