import { router } from "./index";
import { gameRouter } from "./routers/game";
import { invitesRouter } from "./routers/invites";

export const appRouter = router({
  game: gameRouter,
  invites: invitesRouter,
});

export type AppRouter = typeof appRouter;
