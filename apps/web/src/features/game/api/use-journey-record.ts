import { trpc } from "@/trpc";

export function useJourneyRecord(journeyId: string | undefined) {
  return trpc.game.getJourneyRecord.useQuery(
    { journeyId: journeyId! },
    {
      enabled: !!journeyId,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    }
  );
}
