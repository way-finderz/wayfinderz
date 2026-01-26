import Link from "next/link";

import type { Journey } from "../model/types";

interface SimpleCity {
  id: string;
  name: string;
}

export interface GamePlayingLayoutProps {
  journey?: Journey | null;
  currentCity?: SimpleCity | null;
  targetCity?: SimpleCity | null;
  visitedCitiesCount: number;
  totalCities?: number;
  children: React.ReactNode;
}

export function GamePlayingLayout({
  journey,
  currentCity,
  targetCity,
  visitedCitiesCount,
  totalCities = 5,
  children,
}: GamePlayingLayoutProps) {
  return (
    <div data-testid="game-playing-layout" className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">
            {journey?.name || "Way Finderz"}
          </h1>
          <div data-testid="game-progress" className="flex items-center gap-1 text-sm">
            <span className="text-gray-400">Progress:</span>
            <span className="font-semibold text-[#6F2AEC]">
              {visitedCitiesCount}/{totalCities}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-[#6F2AEC]">
              {currentCity?.name}
            </span>
            <span className="text-gray-400">&rarr;</span>
            <span className="font-medium text-amber-600">
              {targetCity?.name} {journey?.emoji}
            </span>
          </div>
          <Link
            href="/dashboard"
            data-testid="game-exit-link"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Exit
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
}
