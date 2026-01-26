// API - Legacy functions
export { fetchGameData, getJourneyRecord, getUserProgress, listJourneys, saveProgress } from "./api/game-api";

// API - React Query hooks
export { useGameData } from "./api/use-game-data";
export { useJourneyRecord } from "./api/use-journey-record";
export { useJourney, useJourneys } from "./api/use-journeys";
export { useJourneyProgress, useSaveProgress, useUserProgress } from "./api/use-user-progress";

// Types
export type {
  AvailableEdge,
  City,
  GameDataResponse,
  GameEdge,
  GameStatus,
  Journey,
  JourneyProgress,
  JourneyRecord,
  SaveProgressInput,
  SaveStatus,
  Translation,
} from "./model/types";

// Store
export { useGameStore } from "./model/game-store";

// UI
export { GameErrorScreen, type GameErrorScreenProps, type GameErrorType } from "./ui/GameErrorScreen";
export { GameLoadingScreen } from "./ui/GameLoadingScreen";
export { GamePlayingLayout, type GamePlayingLayoutProps } from "./ui/GamePlayingLayout";
export { GameStartScreen, type GameStartScreenProps } from "./ui/GameStartScreen";
export { JourneyGrid, type JourneyGridProps } from "./ui/JourneyGrid";
export { JourneyTile, type JourneyTileProps } from "./ui/JourneyTile";
