import { trpc } from "@/trpc";

export function useGameData(journeySlug: string, enabled = true) {
  return trpc.game.start.useQuery(
    { journeySlug },
    {
      enabled,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0, // Always fetch fresh game data
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
