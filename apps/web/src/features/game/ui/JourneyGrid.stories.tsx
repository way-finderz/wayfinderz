import type { Meta, StoryObj } from "@storybook/react";

import type { Journey, JourneyProgress } from "../model/types";

import { JourneyGrid } from "./JourneyGrid";

const sampleJourneys: Journey[] = [
  {
    id: "1",
    slug: "rome-adventure",
    name: "Rome Adventure",
    description: "Learn Italian on your way to Rome!",
    language: "Italian",
    startCityName: "Milan",
    targetCityName: "Rome",
    emoji: "🇮🇹",
    winMessage: "Congratulations!",
  },
  {
    id: "2",
    slug: "paris-trip",
    name: "Paris Trip",
    description: "Learn French while traveling to Paris!",
    language: "French",
    startCityName: "Lyon",
    targetCityName: "Paris",
    emoji: "🇫🇷",
    winMessage: "Congratulations!",
  },
  {
    id: "3",
    slug: "spanish-journey",
    name: "Spanish Journey",
    description: "Learn Spanish on your adventure!",
    language: "Spanish",
    startCityName: "Barcelona",
    targetCityName: "Madrid",
    emoji: "🇪🇸",
    winMessage: "Congratulations!",
  },
];

const sampleProgressMap = new Map<string, JourneyProgress>([
  [
    "1",
    {
      id: "p1",
      userId: "u1",
      journeyId: "1",
      completed: true,
      bestTimeMs: 125000,
      lastCompletedAt: new Date(),
      completionCount: 3,
    },
  ],
  [
    "3",
    {
      id: "p3",
      userId: "u1",
      journeyId: "3",
      completed: false,
      bestTimeMs: null,
      lastCompletedAt: null,
      completionCount: 0,
    },
  ],
]);

const meta: Meta<typeof JourneyGrid> = {
  title: "Features/Game/JourneyGrid",
  component: JourneyGrid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    journeys: sampleJourneys,
    progressMap: new Map(),
  },
};

export const WithProgress: Story = {
  args: {
    journeys: sampleJourneys,
    progressMap: sampleProgressMap,
  },
};

export const SingleJourney: Story = {
  args: {
    journeys: [sampleJourneys[0]],
    progressMap: new Map(),
  },
};

export const ManyJourneys: Story = {
  args: {
    journeys: [
      ...sampleJourneys,
      {
        id: "4",
        slug: "german-adventure",
        name: "German Adventure",
        description: "Learn German while exploring!",
        language: "German",
        startCityName: "Munich",
        targetCityName: "Berlin",
        emoji: "🇩🇪",
        winMessage: "Congratulations!",
      },
      {
        id: "5",
        slug: "japanese-trip",
        name: "Japanese Trip",
        description: "Learn Japanese on your journey!",
        language: "Japanese",
        startCityName: "Osaka",
        targetCityName: "Tokyo",
        emoji: "🇯🇵",
        winMessage: "Congratulations!",
      },
      {
        id: "6",
        slug: "portuguese-adventure",
        name: "Portuguese Adventure",
        description: "Learn Portuguese while traveling!",
        language: "Portuguese",
        startCityName: "Porto",
        targetCityName: "Lisbon",
        emoji: "🇵🇹",
        winMessage: "Congratulations!",
      },
    ],
    progressMap: sampleProgressMap,
  },
};
