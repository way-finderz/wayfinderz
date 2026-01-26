import { getJourneyRecordInputSchema, saveProgressInputSchema, startGameInputSchema } from "@way-finderz/shared";

import * as gameService from "../../services/game.service";
import { protectedProcedure, publicProcedure, router } from "../index";

export const gameRouter = router({
  listJourneys: publicProcedure.query(async () => {
    const journeysList = await gameService.getAllJourneys();

    return journeysList;
  }),

  start: protectedProcedure
    .input(startGameInputSchema)
    .query(async ({ input }) => {
      const gameData = await gameService.getGameData(input.journeySlug);

      return gameData;
    }),

  saveProgress: protectedProcedure
    .input(saveProgressInputSchema)
    .mutation(async ({ ctx, input }) => {
      return gameService.saveJourneyProgress(ctx.user.id, input);
    }),

  getUserProgress: protectedProcedure.query(async ({ ctx }) => {
    return gameService.getUserProgress(ctx.user.id);
  }),

  getJourneyRecord: publicProcedure
    .input(getJourneyRecordInputSchema)
    .query(async ({ input }) => {
      return gameService.getJourneyRecord(input.journeyId);
    }),
});
