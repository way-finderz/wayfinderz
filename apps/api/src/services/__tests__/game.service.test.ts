import { beforeEach, describe, expect, it, vi } from "vitest";

// Import after mocking
import {
  getAllCities,
  getAllEdges,
  getAllTranslations,
  getCityById,
  getGameData,
  getStartingCity,
  getTargetCity,
  getUserProgress,
  saveJourneyProgress,
} from "../game.service";

// Use vi.hoisted to define mock before vi.mock hoisting
const mockDb = vi.hoisted(() => {
  const mockTx = {
    query: {
      journeyProgress: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  };

  return {
    query: {
      journeys: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      cities: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      journeyProgress: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn().mockImplementation(async (fn) => fn(mockTx)),
    _mockTx: mockTx, // Expose for test configuration
  };
});

vi.mock("@/db", () => ({
  db: mockDb,
}));

// Test fixtures
const mockJourney = {
  id: "journey-1",
  slug: "road-to-rome",
  name: "Road to Rome",
  description: "Travel from Venice to Rome!",
  language: "italian",
  startCityName: "venice",
  targetCityName: "rome",
  emoji: "🇮🇹",
  winMessage: "You Made It to Rome!",
};

const mockVenice = {
  id: "venice-id",
  journeyId: "journey-1",
  name: "venice",
  displayName: "Venice",
  position: 0,
  createdAt: new Date(),
};

const mockRome = {
  id: "rome-id",
  journeyId: "journey-1",
  name: "rome",
  displayName: "Rome",
  position: 5,
  createdAt: new Date(),
};

const mockPadua = {
  id: "padua-id",
  journeyId: "journey-1",
  name: "padua",
  displayName: "Padua",
  position: 1,
  createdAt: new Date(),
};

describe("game.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStartingCity", () => {
    it("returns the city at position 0", async () => {
      mockDb.query.cities.findFirst.mockResolvedValue(mockVenice);

      const result = await getStartingCity("journey-1");

      expect(result).toEqual(mockVenice);
      expect(mockDb.query.cities.findFirst).toHaveBeenCalled();
    });

    it("returns undefined when no starting city exists", async () => {
      mockDb.query.cities.findFirst.mockResolvedValue(undefined);

      const result = await getStartingCity("journey-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getTargetCity", () => {
    it("returns the target city for a journey", async () => {
      mockDb.query.journeys.findFirst.mockResolvedValue(mockJourney);
      mockDb.query.cities.findFirst.mockResolvedValue(mockRome);

      const result = await getTargetCity("journey-1");

      expect(result).toEqual(mockRome);
    });

    it("returns undefined when journey not found", async () => {
      mockDb.query.journeys.findFirst.mockResolvedValue(undefined);

      const result = await getTargetCity("non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("getCityById", () => {
    it("returns a city by its ID", async () => {
      mockDb.query.cities.findFirst.mockResolvedValue(mockPadua);

      const result = await getCityById("padua-id");

      expect(result).toEqual(mockPadua);
    });

    it("returns undefined for non-existent city", async () => {
      mockDb.query.cities.findFirst.mockResolvedValue(undefined);

      const result = await getCityById("non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("getAllCities", () => {
    it("returns all cities for a journey ordered by position", async () => {
      const allCities = [mockVenice, mockPadua, mockRome];
      mockDb.query.cities.findMany.mockResolvedValue(allCities);

      const result = await getAllCities("journey-1");

      expect(result).toEqual(allCities);
      expect(mockDb.query.cities.findMany).toHaveBeenCalled();
    });
  });

  describe("getAllEdges", () => {
    it("returns all edges for a journey", async () => {
      const mockCities = [{ id: "venice-id" }, { id: "padua-id" }];
      const mockEdges = [
        { id: "edge-1", fromCityId: "venice-id", toCityId: "padua-id" },
      ];

      const mockFromCities = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockCities),
      });
      const mockFromEdges = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockEdges),
      });
      mockDb.select
        .mockReturnValueOnce({ from: mockFromCities })
        .mockReturnValueOnce({ from: mockFromEdges });

      const result = await getAllEdges("journey-1");

      expect(result).toEqual(mockEdges);
    });

    it("returns empty array when no cities exist", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await getAllEdges("journey-1");

      expect(result).toEqual([]);
    });
  });

  describe("getAllTranslations", () => {
    it("returns all translations for a journey", async () => {
      const mockTranslations = [
        { id: "trans-1", sourceWord: "ciao", targetWord: "hello" },
        { id: "trans-2", sourceWord: "grazie", targetWord: "thank you" },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockTranslations),
      });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await getAllTranslations("journey-1");

      expect(result).toEqual(mockTranslations);
    });
  });

  describe("getGameData", () => {
    it("returns complete game data for offline play", async () => {
      const allCities = [mockVenice, mockPadua, mockRome];
      const mockEdges = [
        { id: "edge-1", fromCityId: "venice-id", toCityId: "padua-id" },
      ];
      const mockTranslations = [
        { id: "trans-1", sourceWord: "ciao", targetWord: "hello" },
      ];

      // Mock journey lookup
      mockDb.query.journeys.findFirst.mockResolvedValue(mockJourney);

      // Mock cities lookup
      mockDb.query.cities.findFirst
        .mockResolvedValueOnce(mockVenice) // getStartingCity
        .mockResolvedValueOnce(mockRome); // getTargetCity

      mockDb.query.cities.findMany.mockResolvedValue(allCities);

      // Mock edges and translations
      const mockCityIds = [{ id: "venice-id" }, { id: "padua-id" }, { id: "rome-id" }];
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockCityIds),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockEdges),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockTranslations),
          }),
        });

      const result = await getGameData("road-to-rome");

      expect(result.journey.slug).toBe("road-to-rome");
      expect(result.startCity.id).toBe("venice-id");
      expect(result.targetCity.id).toBe("rome-id");
      expect(result.allCities).toEqual(allCities);
      expect(result.allEdges).toEqual(mockEdges);
      expect(result.allTranslations).toEqual(mockTranslations);
    });

    it("throws error when journey not found", async () => {
      mockDb.query.journeys.findFirst.mockResolvedValue(undefined);

      await expect(getGameData("non-existent")).rejects.toThrow(
        "Journey not found: non-existent"
      );
    });

    it("throws error when game data not initialized", async () => {
      mockDb.query.journeys.findFirst.mockResolvedValue(mockJourney);
      mockDb.query.cities.findFirst.mockResolvedValue(undefined);

      await expect(getGameData("road-to-rome")).rejects.toThrow(
        "Game data not initialized"
      );
    });
  });

  describe("saveJourneyProgress", () => {
    const mockProgressInput = {
      journeyId: "journey-1",
      timeMs: 120000,
      correctAttempts: 10,
      wrongAttempts: 3,
    };

    it("creates new progress record when none exists", async () => {
      const newProgress = {
        id: "progress-1",
        userId: "user-1",
        journeyId: "journey-1",
        completed: true,
        bestTimeMs: 120000,
        lastCompletedAt: new Date(),
        completionCount: 1,
      };

      mockDb._mockTx.query.journeyProgress.findFirst.mockResolvedValue(null);
      mockDb._mockTx.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newProgress]),
        }),
      });

      const result = await saveJourneyProgress("user-1", mockProgressInput);

      expect(result).toEqual(newProgress);
      expect(mockDb._mockTx.insert).toHaveBeenCalled();
    });

    it("updates existing progress and best time when new time is faster", async () => {
      const existingProgress = {
        id: "progress-1",
        userId: "user-1",
        journeyId: "journey-1",
        completed: true,
        bestTimeMs: 150000, // slower than new time
        lastCompletedAt: new Date(),
        completionCount: 1,
      };

      const updatedProgress = {
        ...existingProgress,
        bestTimeMs: 120000, // updated to faster time
        completionCount: 2,
      };

      mockDb._mockTx.query.journeyProgress.findFirst.mockResolvedValue(existingProgress);
      mockDb._mockTx.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProgress]),
          }),
        }),
      });

      const result = await saveJourneyProgress("user-1", mockProgressInput);

      expect(result.bestTimeMs).toBe(120000);
      expect(result.completionCount).toBe(2);
    });

    it("keeps existing best time when new time is slower", async () => {
      const existingProgress = {
        id: "progress-1",
        userId: "user-1",
        journeyId: "journey-1",
        completed: true,
        bestTimeMs: 100000, // faster than new time
        lastCompletedAt: new Date(),
        completionCount: 1,
      };

      const updatedProgress = {
        ...existingProgress,
        bestTimeMs: 100000, // kept the faster time
        completionCount: 2,
      };

      mockDb._mockTx.query.journeyProgress.findFirst.mockResolvedValue(existingProgress);
      mockDb._mockTx.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedProgress]),
          }),
        }),
      });

      const result = await saveJourneyProgress("user-1", mockProgressInput);

      expect(result.bestTimeMs).toBe(100000); // kept original
      expect(result.completionCount).toBe(2);
    });
  });

  describe("getUserProgress", () => {
    it("returns all progress records for a user", async () => {
      const mockProgressList = [
        {
          id: "progress-1",
          userId: "user-1",
          journeyId: "journey-1",
          completed: true,
          bestTimeMs: 120000,
          lastCompletedAt: new Date(),
          completionCount: 3,
        },
        {
          id: "progress-2",
          userId: "user-1",
          journeyId: "journey-2",
          completed: true,
          bestTimeMs: 90000,
          lastCompletedAt: new Date(),
          completionCount: 1,
        },
      ];

      mockDb.query.journeyProgress.findMany.mockResolvedValue(mockProgressList);

      const result = await getUserProgress("user-1");

      expect(result).toEqual(mockProgressList);
      expect(result).toHaveLength(2);
    });

    it("returns empty array when user has no progress", async () => {
      mockDb.query.journeyProgress.findMany.mockResolvedValue([]);

      const result = await getUserProgress("user-1");

      expect(result).toEqual([]);
    });
  });
});
