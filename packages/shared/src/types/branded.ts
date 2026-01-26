/**
 * Branded types for type-safe ID handling.
 *
 * Branded types (also called nominal types or opaque types) prevent accidentally
 * mixing up different ID types that are all represented as strings at runtime.
 *
 * Most branded ID types are defined in the Zod schemas (schemas/game.ts,
 * schemas/invites.ts)
 * using z.string().uuid().brand<"TypeName">(). This file provides:
 * - SessionId (not covered by Zod schemas since sessions come from BetterAuth)
 * - Utility functions for creating branded IDs from validated strings
 *
 * @example
 * import { JourneyId, createJourneyId } from "@way-finderz/shared";
 *
 * function getJourney(id: JourneyId): Journey { ... }
 *
 * // At API boundary, after validation:
 * const journeyId = createJourneyId(validatedUuid);
 * getJourney(journeyId); // OK
 *
 * // Prevents mixing IDs:
 * const userId = createUserId(someUuid);
 * getJourney(userId); // TypeScript error!
 */

import { z } from "zod";

// Import the schema-defined types for the utility functions
import type {
  CityId,
  EdgeId,
  JourneyId,
  JourneyProgressId,
  TranslationId,
  UserId,
} from "../schemas/game";
import type { InviteCodeId, InviteUseId } from "../schemas/invites";

// SessionId is not covered by Zod schemas (sessions come from BetterAuth)
export const sessionIdSchema = z.string().uuid().brand<"SessionId">();
export type SessionId = z.infer<typeof sessionIdSchema>;

// Re-export branded ID types from schemas for convenience
export type {
  CityId,
  EdgeId,
  JourneyId,
  JourneyProgressId,
  TranslationId,
  UserId,
} from "../schemas/game";
export type { InviteCodeId, InviteUseId } from "../schemas/invites";

/**
 * Utility functions for creating branded IDs from validated strings.
 * Use at validation boundaries (after Zod validation or from database results).
 *
 * Note: These perform a type assertion only - they don't validate the string.
 * For validation, use the corresponding Zod schema (e.g., journeyIdSchema.parse(value)).
 */
export const createUserId = (id: string): UserId => id as unknown as UserId;
export const createSessionId = (id: string): SessionId => id as unknown as SessionId;
export const createJourneyId = (id: string): JourneyId => id as unknown as JourneyId;
export const createCityId = (id: string): CityId => id as unknown as CityId;
export const createEdgeId = (id: string): EdgeId => id as unknown as EdgeId;
export const createTranslationId = (id: string): TranslationId =>
  id as unknown as TranslationId;
export const createInviteCodeId = (id: string): InviteCodeId =>
  id as unknown as InviteCodeId;
export const createInviteUseId = (id: string): InviteUseId =>
  id as unknown as InviteUseId;
export const createJourneyProgressId = (id: string): JourneyProgressId =>
  id as unknown as JourneyProgressId;
