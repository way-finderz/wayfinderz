import { describe, expect, it } from "vitest";

import { fetchGameData } from "../api/game-api";

describe("game-api", () => {
  describe("fetchGameData", () => {
    it("returns all game data for offline play", async () => {
      const result = await fetchGameData("road-to-rome");

      expect(result.journey.slug).toBe("road-to-rome");
      expect(result.startCity.id).toBe("venice-id");
      expect(result.startCity.name).toBe("Venice");
      expect(result.targetCity.id).toBe("rome-id");
      expect(result.targetCity.name).toBe("Rome");
      expect(result.allCities.length).toBeGreaterThan(0);
      expect(result.allEdges.length).toBeGreaterThan(0);
      expect(result.allTranslations.length).toBeGreaterThan(0);
    });

    it("includes all cities with position data", async () => {
      const result = await fetchGameData("road-to-rome");

      const venice = result.allCities.find(c => c.id === "venice-id");
      expect(venice).toBeDefined();
      expect(venice?.displayName).toBe("Venice");
      expect(venice?.position).toBe(0);
    });

    it("includes translations with source and target words", async () => {
      const result = await fetchGameData("road-to-rome");

      expect(result.allTranslations[0]).toHaveProperty("id");
      expect(result.allTranslations[0]).toHaveProperty("sourceWord");
      expect(result.allTranslations[0]).toHaveProperty("targetWord");
    });

    it("includes edges connecting cities", async () => {
      const result = await fetchGameData("road-to-rome");

      expect(result.allEdges[0]).toHaveProperty("id");
      expect(result.allEdges[0]).toHaveProperty("fromCityId");
      expect(result.allEdges[0]).toHaveProperty("toCityId");
    });
  });
});
