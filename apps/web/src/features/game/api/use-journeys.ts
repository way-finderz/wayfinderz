import { trpc } from "@/trpc";

import type { Journey } from "../model/types";

export function useJourneys() {
  return trpc.game.listJourneys.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useJourney(slug: string) {
  const { data: journeys, ...rest } = useJourneys();
  const journey = journeys?.find((j: Journey) => j.slug === slug) ?? null;

  return {
    data: journey,
    ...rest,
  };
}
