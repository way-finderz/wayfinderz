import { trpc } from "@/trpc";

import type { JourneyProgress } from "../model/types";

export function useUserProgress() {
  return trpc.game.getUserProgress.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

export function useJourneyProgress(journeyId: string | undefined) {
  const { data: progressList, ...rest } = useUserProgress();
  const progress = journeyId
    ? progressList?.find((p: JourneyProgress) => p.journeyId === journeyId) ?? null
    : null;

  return {
    data: progress,
    ...rest,
  };
}

export function useSaveProgress() {
  const utils = trpc.useUtils();

  return trpc.game.saveProgress.useMutation({
    onSuccess: () => {
      utils.game.getUserProgress.invalidate();
    },
  });
}
