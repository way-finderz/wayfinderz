import { z } from "zod";

/**
 * Branded ID schemas for type-safe ID validation.
 *
 * These schemas validate UUID format at runtime. The .brand() creates nominal types
 * that prevent accidentally mixing different ID types at compile time.
 *
 * For new code, prefer using these branded schemas at API boundaries (input validation).
 * The exported entity types use plain strings for backwards compatibility
 * with existing database code.
 */
export const journeyIdSchema = z.string().uuid().brand<"JourneyId">();
export const cityIdSchema = z.string().uuid().brand<"CityId">();
export const edgeIdSchema = z.string().uuid().brand<"EdgeId">();
export const translationIdSchema = z.string().uuid().brand<"TranslationId">();
export const journeyProgressIdSchema = z.string().uuid().brand<"JourneyProgressId">();
export const userIdSchema = z.string().uuid().brand<"UserId">();

// Branded ID type exports - use these for strict type checking at API boundaries
export type JourneyId = z.infer<typeof journeyIdSchema>;
export type CityId = z.infer<typeof cityIdSchema>;
export type EdgeId = z.infer<typeof edgeIdSchema>;
export type TranslationId = z.infer<typeof translationIdSchema>;
export type JourneyProgressId = z.infer<typeof journeyProgressIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;

// Journey schema - uses plain uuid() for backwards compatibility with database types
export const journeySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  language: z.string(),
  startCityName: z.string(),
  targetCityName: z.string(),
  emoji: z.string().nullable(),
  winMessage: z.string(),
});

export const journeySlugSchema = z
  .string()
  .min(1, "Journey slug is required")
  .max(100, "Journey slug too long");

// Input schemas - use branded types for validation
export const startGameInputSchema = z.object({
  journeySlug: journeySlugSchema,
});

// Response types - use plain uuid() for backwards compatibility
export const citySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  position: z.number(),
});

export const edgeSchema = z.object({
  id: z.string().uuid(),
  fromCityId: z.string().uuid(),
  toCityId: z.string().uuid(),
});

export const translationSchema = z.object({
  id: z.string().uuid(),
  sourceWord: z.string(),
  targetWord: z.string(),
});

export const gameDataResponseSchema = z.object({
  journey: journeySchema,
  startCity: z.object({ id: z.string().uuid(), name: z.string() }),
  targetCity: z.object({ id: z.string().uuid(), name: z.string() }),
  allCities: z.array(citySchema),
  allEdges: z.array(edgeSchema),
  allTranslations: z.array(translationSchema),
});

// Progress tracking schemas - use branded types for input validation
export const saveProgressInputSchema = z.object({
  journeyId: journeyIdSchema,
  timeMs: z.number().int().positive("Time must be positive"),
  correctAttempts: z.number().int().min(0),
  wrongAttempts: z.number().int().min(0),
});

export const journeyProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  journeyId: z.string().uuid(),
  completed: z.boolean(),
  bestTimeMs: z.number().nullable(),
  lastCompletedAt: z.coerce.date().nullable(),
  completionCount: z.number().int(),
});

// Journey record schema (best time across all users) - branded input
export const getJourneyRecordInputSchema = z.object({
  journeyId: journeyIdSchema,
});

export const journeyRecordSchema = z.object({
  bestTimeMs: z.number().nullable(),
  holderName: z.string().nullable(),
});

// Entity type exports - use plain strings for backwards compatibility
export type Journey = z.infer<typeof journeySchema>;
export type City = z.infer<typeof citySchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type Translation = z.infer<typeof translationSchema>;
export type GameDataResponse = z.infer<typeof gameDataResponseSchema>;
export type StartGameInput = z.infer<typeof startGameInputSchema>;
export type SaveProgressInput = z.infer<typeof saveProgressInputSchema>;
export type JourneyProgress = z.infer<typeof journeyProgressSchema>;
export type GetJourneyRecordInput = z.infer<typeof getJourneyRecordInputSchema>;
export type JourneyRecord = z.infer<typeof journeyRecordSchema>;
