import { and, eq, inArray } from "drizzle-orm";

import type { City, GameDataResponse, Journey, Translation } from "@way-finderz/shared";

import { db } from "@/db";
import { cities, edges, journeyProgress, journeys, translations, users } from "@/db/schema";
import { createTRPCError, ErrorCodes } from "@/lib/error-codes";

export type { City, GameDataResponse, Journey, Translation } from "@way-finderz/shared";

export async function getAllJourneys(): Promise<Journey[]> {
  return db.query.journeys.findMany({
    orderBy: (j, { asc }) => [asc(j.createdAt)],
  });
}

export async function getJourneyBySlug(
  slug: string
): Promise<Journey | undefined> {
  return db.query.journeys.findFirst({
    where: eq(journeys.slug, slug),
  });
}

export async function getStartingCity(
  journeyId: string
): Promise<City | undefined> {
  return db.query.cities.findFirst({
    where: and(eq(cities.journeyId, journeyId), eq(cities.position, 0)),
  });
}

export async function getTargetCity(
  journeyId: string
): Promise<City | undefined> {
  const journey = await db.query.journeys.findFirst({
    where: eq(journeys.id, journeyId),
  });

  if (!journey) {
    return undefined;
  }

  return db.query.cities.findFirst({
    where: and(
      eq(cities.journeyId, journeyId),
      eq(cities.name, journey.targetCityName)
    ),
  });
}

export async function getCityById(cityId: string): Promise<City | undefined> {
  return db.query.cities.findFirst({
    where: eq(cities.id, cityId),
  });
}

export async function getAllCities(journeyId: string): Promise<City[]> {
  return db.query.cities.findMany({
    where: eq(cities.journeyId, journeyId),
    orderBy: (c, { asc }) => [asc(c.position)],
  });
}

export async function getAllEdges(
  journeyId: string
): Promise<Array<{ id: string; fromCityId: string; toCityId: string }>> {
  const journeyCities = await db
    .select({ id: cities.id })
    .from(cities)
    .where(eq(cities.journeyId, journeyId));

  const cityIds = journeyCities.map((c) => c.id);

  if (cityIds.length === 0) {
    return [];
  }

  // Filter at database level instead of fetching all edges
  return db
    .select({
      id: edges.id,
      fromCityId: edges.fromCityId,
      toCityId: edges.toCityId,
    })
    .from(edges)
    .where(
      and(
        inArray(edges.fromCityId, cityIds),
        inArray(edges.toCityId, cityIds)
      )
    );
}

export async function getAllTranslations(journeyId: string): Promise<Translation[]> {
  const result = await db
    .select({
      id: translations.id,
      sourceWord: translations.sourceWord,
      targetWord: translations.targetWord,
    })
    .from(translations)
    .where(eq(translations.journeyId, journeyId));

  return result;
}

export async function getGameData(
  journeySlug: string
): Promise<GameDataResponse> {
  const journey = await getJourneyBySlug(journeySlug);

  if (!journey) {
    throw createTRPCError(
      "NOT_FOUND",
      `Journey not found: ${journeySlug}`,
      ErrorCodes.JOURNEY_NOT_FOUND
    );
  }

  const startCity = await getStartingCity(journey.id);
  const targetCity = await getTargetCity(journey.id);

  if (!startCity || !targetCity) {
    throw createTRPCError(
      "INTERNAL_SERVER_ERROR",
      "Game data not initialized. Run seed script first.",
      ErrorCodes.GAME_DATA_NOT_INITIALIZED
    );
  }

  const allCities = await getAllCities(journey.id);
  const allEdges = await getAllEdges(journey.id);
  const allTranslations = await getAllTranslations(journey.id);

  return {
    journey,
    startCity: { id: startCity.id, name: startCity.displayName },
    targetCity: { id: targetCity.id, name: targetCity.displayName },
    allCities,
    allEdges,
    allTranslations,
  };
}

export interface JourneyProgressRecord {
  id: string;
  userId: string;
  journeyId: string;
  completed: boolean;
  bestTimeMs: number | null;
  lastCompletedAt: Date | null;
  completionCount: number;
}

export interface SaveProgressInput {
  journeyId: string;
  timeMs: number;
  correctAttempts: number;
  wrongAttempts: number;
}

/**
 * Save or update journey progress for a user
 * Updates best time only if the new time is faster
 * Uses a transaction to prevent race conditions
 */
export async function saveJourneyProgress(
  userId: string,
  input: SaveProgressInput
): Promise<JourneyProgressRecord> {
  const { journeyId, timeMs } = input;

  return db.transaction(async (tx) => {
    const existing = await tx.query.journeyProgress.findFirst({
      where: and(
        eq(journeyProgress.userId, userId),
        eq(journeyProgress.journeyId, journeyId)
      ),
    });

    if (existing) {
      const shouldUpdateBestTime = !existing.bestTimeMs || timeMs < existing.bestTimeMs;

      const [updated] = await tx
        .update(journeyProgress)
        .set({
          completed: true,
          bestTimeMs: shouldUpdateBestTime ? timeMs : existing.bestTimeMs,
          lastCompletedAt: new Date(),
          completionCount: existing.completionCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(journeyProgress.id, existing.id))
        .returning();

      if (!updated) {
        throw createTRPCError(
          "INTERNAL_SERVER_ERROR",
          "Failed to update journey progress",
          ErrorCodes.PROGRESS_UPDATE_FAILED
        );
      }

      return updated;
    }

    const [created] = await tx
      .insert(journeyProgress)
      .values({
        userId,
        journeyId,
        completed: true,
        bestTimeMs: timeMs,
        lastCompletedAt: new Date(),
        completionCount: 1,
      })
      .returning();

    if (!created) {
      throw createTRPCError(
        "INTERNAL_SERVER_ERROR",
        "Failed to create journey progress",
        ErrorCodes.PROGRESS_UPDATE_FAILED
      );
    }

    return created;
  });
}

export async function getUserProgress(
  userId: string
): Promise<JourneyProgressRecord[]> {
  return db.query.journeyProgress.findMany({
    where: eq(journeyProgress.userId, userId),
  });
}

export interface JourneyRecord {
  bestTimeMs: number | null;
  holderName: string | null;
}

export async function getJourneyRecord(
  journeyId: string
): Promise<JourneyRecord> {
  const result = await db.query.journeyProgress.findFirst({
    where: and(
      eq(journeyProgress.journeyId, journeyId),
      eq(journeyProgress.completed, true)
    ),
    orderBy: (jp, { asc }) => [asc(jp.bestTimeMs)],
  });

  if (!result || !result.bestTimeMs) {
    return { bestTimeMs: null, holderName: null };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, result.userId),
  });

  return {
    bestTimeMs: result.bestTimeMs,
    holderName: user?.name || "Unknown",
  };
}
