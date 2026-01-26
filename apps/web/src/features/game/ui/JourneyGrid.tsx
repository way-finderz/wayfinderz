import type { Journey, JourneyProgress } from "../model/types";

import { JourneyTile } from "./JourneyTile";

export interface JourneyGridProps {
  journeys: Journey[];
  progressMap: Map<string, JourneyProgress>;
}

export function JourneyGrid({ journeys, progressMap }: JourneyGridProps) {
  return (
    <div data-testid="journey-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {journeys.map((journey) => (
        <JourneyTile
          key={journey.id}
          journey={journey}
          progress={progressMap.get(journey.id)}
        />
      ))}
    </div>
  );
}
