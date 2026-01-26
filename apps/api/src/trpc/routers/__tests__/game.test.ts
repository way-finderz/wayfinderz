import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import router after mocking
import { gameRouter } from "../game";

// Mock the game service
const mockGameService = vi.hoisted(() => ({
  getAllJourneys: vi.fn(),
  getGameData: vi.fn(),
  saveJourneyProgress: vi.fn(),
  getUserProgress: vi.fn(),
  getJourneyRecord: vi.fn(),
}));

vi.mock("../../../services/game.service", () => mockGameService);

// Test fixtures
const mockJourney = {
  id: "journey-123",
  slug: "road-to-rome",
  name: "Road to Rome",
  description: "Learn Italian on your journey",
  language: "italian",
  startCityName: "Venice",
  targetCityName: "Rome",
  emoji: "🇮🇹",
  winMessage: "Congratulations!",
};

const mockGameData = {
  journey: mockJourney,
  startCity: { id: "city-1", name: "Venice" },
  targetCity: { id: "city-2", name: "Rome" },
  allCities: [
    { id: "city-1", name: "Venice", displayName: "Venice", position: 0 },
    { id: "city-2", name: "Rome", displayName: "Rome", position: 1 },
  ],
  allEdges: [{ id: "edge-1", fromCityId: "city-1", toCityId: "city-2" }],
  allTranslations: [{ id: "trans-1", sourceWord: "ciao", targetWord: "hello" }],
};

const mockProgress = {
  id: "progress-123",
  userId: "user-123",
  journeyId: "journey-123",
  completed: true,
  bestTimeMs: 30000,
  lastCompletedAt: new Date(),
  completionCount: 1,
};

// Helper to create a mock caller with context
function createCaller(user: { id: string; role: string } | null = null) {
  const ctx = {
    user,
    session: user ? { id: "session-123", userId: user.id } : null,
  };

  return gameRouter.createCaller(ctx as any);
}

describe("gameRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listJourneys", () => {
    it("returns all journeys (public endpoint)", async () => {
      mockGameService.getAllJourneys.mockResolvedValue([mockJourney]);

      const caller = createCaller(); // No auth needed
      const result = await caller.listJourneys();

      expect(result).toEqual([mockJourney]);
      expect(mockGameService.getAllJourneys).toHaveBeenCalled();
    });

    it("works for authenticated users too", async () => {
      mockGameService.getAllJourneys.mockResolvedValue([mockJourney]);

      const caller = createCaller({ id: "user-123", role: "user" });
      const result = await caller.listJourneys();

      expect(result).toEqual([mockJourney]);
    });
  });

  describe("start", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);

      await expect(
        caller.start({ journeySlug: "road-to-rome" })
      ).rejects.toThrow("Authentication required");
    });

    it("returns game data for authenticated user", async () => {
      mockGameService.getGameData.mockResolvedValue(mockGameData);

      const caller = createCaller({ id: "user-123", role: "user" });
      const result = await caller.start({ journeySlug: "road-to-rome" });

      expect(result).toEqual(mockGameData);
      expect(mockGameService.getGameData).toHaveBeenCalledWith("road-to-rome");
    });

    it("propagates service errors", async () => {
      mockGameService.getGameData.mockRejectedValue(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Journey not found",
        })
      );

      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(
        caller.start({ journeySlug: "nonexistent" })
      ).rejects.toThrow("Journey not found");
    });

    it("validates input schema", async () => {
      const caller = createCaller({ id: "user-123", role: "user" });

      // Empty slug should fail validation
      await expect(caller.start({ journeySlug: "" })).rejects.toThrow();
    });
  });

  describe("saveProgress", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);

      await expect(
        caller.saveProgress({
          journeyId: "550e8400-e29b-41d4-a716-446655440000",
          timeMs: 30000,
          correctAttempts: 5,
          wrongAttempts: 2,
        })
      ).rejects.toThrow("Authentication required");
    });

    it("saves progress for authenticated user", async () => {
      mockGameService.saveJourneyProgress.mockResolvedValue(mockProgress);

      const caller = createCaller({ id: "user-123", role: "user" });
      const input = {
        journeyId: "550e8400-e29b-41d4-a716-446655440000",
        timeMs: 30000,
        correctAttempts: 5,
        wrongAttempts: 2,
      };
      const result = await caller.saveProgress(input);

      expect(result).toEqual(mockProgress);
      expect(mockGameService.saveJourneyProgress).toHaveBeenCalledWith(
        "user-123",
        input
      );
    });

    it("validates input schema - rejects negative time", async () => {
      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(
        caller.saveProgress({
          journeyId: "550e8400-e29b-41d4-a716-446655440000",
          timeMs: -1,
          correctAttempts: 5,
          wrongAttempts: 2,
        })
      ).rejects.toThrow();
    });

    it("validates input schema - rejects invalid UUID", async () => {
      const caller = createCaller({ id: "user-123", role: "user" });

      await expect(
        caller.saveProgress({
          journeyId: "not-a-uuid",
          timeMs: 30000,
          correctAttempts: 5,
          wrongAttempts: 2,
        })
      ).rejects.toThrow();
    });
  });

  describe("getUserProgress", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);

      await expect(caller.getUserProgress()).rejects.toThrow(
        "Authentication required"
      );
    });

    it("returns user progress for authenticated user", async () => {
      const progressList = [mockProgress];
      mockGameService.getUserProgress.mockResolvedValue(progressList);

      const caller = createCaller({ id: "user-123", role: "user" });
      const result = await caller.getUserProgress();

      expect(result).toEqual(progressList);
      expect(mockGameService.getUserProgress).toHaveBeenCalledWith("user-123");
    });
  });

  describe("getJourneyRecord", () => {
    it("returns journey record (public endpoint)", async () => {
      const record = { bestTimeMs: 25000, holderName: "Champion" };
      mockGameService.getJourneyRecord.mockResolvedValue(record);

      const caller = createCaller(); // No auth needed
      const result = await caller.getJourneyRecord({
        journeyId: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result).toEqual(record);
      expect(mockGameService.getJourneyRecord).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000"
      );
    });

    it("validates input schema - rejects invalid UUID", async () => {
      const caller = createCaller();

      await expect(
        caller.getJourneyRecord({ journeyId: "not-a-uuid" })
      ).rejects.toThrow();
    });
  });
});
