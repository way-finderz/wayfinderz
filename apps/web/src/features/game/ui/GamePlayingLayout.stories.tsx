import type { Meta, StoryObj } from "@storybook/react";

import type { Journey } from "../model/types";

import { GamePlayingLayout } from "./GamePlayingLayout";

const sampleJourney: Journey = {
  id: "1",
  slug: "rome-adventure",
  name: "Rome Adventure",
  description: "Learn Italian on your way to Rome!",
  language: "Italian",
  startCityName: "Milan",
  targetCityName: "Rome",
  emoji: "🇮🇹",
  winMessage: "Congratulations!",
};

const currentCity = {
  id: "c1",
  name: "Florence",
};

const targetCity = {
  id: "c5",
  name: "Rome",
};

const meta: Meta<typeof GamePlayingLayout> = {
  title: "Features/Game/GamePlayingLayout",
  component: GamePlayingLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    journey: sampleJourney,
    currentCity,
    targetCity,
    visitedCitiesCount: 2,
    totalCities: 5,
    children: (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border">
          Game content goes here
        </div>
      </div>
    ),
  },
};

export const NearCompletion: Story = {
  args: {
    journey: sampleJourney,
    currentCity: { ...currentCity, name: "Naples", position: 4 },
    targetCity,
    visitedCitiesCount: 4,
    totalCities: 5,
    children: (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border">
          Almost there!
        </div>
      </div>
    ),
  },
};

export const JustStarted: Story = {
  args: {
    journey: sampleJourney,
    currentCity: { ...currentCity, name: "Milan", position: 0 },
    targetCity,
    visitedCitiesCount: 0,
    totalCities: 5,
    children: (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border">
          Let's begin!
        </div>
      </div>
    ),
  },
};
