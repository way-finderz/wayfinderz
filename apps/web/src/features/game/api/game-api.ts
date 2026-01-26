import { trpcClient } from "@/trpc";

export async function listJourneys() {
  return trpcClient.game.listJourneys.query();
}

export async function fetchGameData(journeySlug: string) {
  return trpcClient.game.start.query({ journeySlug });
}

export async function saveProgress(input: {
  journeyId: string;
  timeMs: number;
  correctAttempts: number;
  wrongAttempts: number;
}) {
  return trpcClient.game.saveProgress.mutate(input);
}

export async function getUserProgress() {
  return trpcClient.game.getUserProgress.query();
}

export async function getJourneyRecord(journeyId: string) {
  return trpcClient.game.getJourneyRecord.query({ journeyId });
}
