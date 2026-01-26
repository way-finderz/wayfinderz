import Link from "next/link";

import { formatTime } from "@/shared/lib";
import { CheckIcon } from "@/shared/ui";

import type { Journey, JourneyProgress } from "../model/types";

export interface JourneyTileProps {
  journey: Journey;
  progress?: JourneyProgress;
}

export function JourneyTile({ journey, progress }: JourneyTileProps) {
  return (
    <Link href={`/game/${journey.slug}`} data-testid={`journey-tile-${journey.slug}`}>
      <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition cursor-pointer h-full relative flex flex-col">
        {progress?.completed && (
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <CheckIcon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1">
          <span className="text-4xl mb-4 block">{journey.emoji}</span>
          <h3 className="text-xl font-semibold mb-2">{journey.name}</h3>
          <p className="text-gray-600 text-sm">{journey.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-purple-600 capitalize">
            Learn {journey.language}
          </span>
          {progress?.bestTimeMs && (
            <span className="text-sm text-gray-500">
              Best: {formatTime(progress.bestTimeMs)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
