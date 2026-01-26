// Re-export core types from shared package
import type { Translation } from "@way-finderz/shared";

export type {
  City,
  GameDataResponse,
  Edge as GameEdge,
  Journey,
  JourneyRecord,
  SaveProgressInput,
  Translation,
} from "@way-finderz/shared";

// Web-specific types

// Edge with an assigned translation (for display in the game)
export interface AvailableEdge {
  edgeId: string;
  toCityId: string;
  toCityName: string;
  translation: Translation;
}

export type GameStatus = "idle" | "loading" | "playing" | "won" | "error";

export type SaveStatus = "saving" | "saved" | "error" | "retrying";

// Progress tracking - uses string for lastCompletedAt because JSON serialization
// converts Date to string. This differs from the shared package type.
export interface JourneyProgress {
  id: string;
  userId: string;
  journeyId: string;
  completed: boolean;
  bestTimeMs: number | null;
  lastCompletedAt: string | null;
  completionCount: number;
}
