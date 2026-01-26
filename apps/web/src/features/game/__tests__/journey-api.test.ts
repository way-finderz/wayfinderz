import { describe, expect, it } from "vitest";

import { listJourneys } from "../api/game-api";

describe("journey-api", () => {
  describe("listJourneys", () => {
    it("returns list of available journeys", async () => {
      const journeys = await listJourneys();

      expect(journeys).toHaveLength(1);
      expect(journeys[0].slug).toBe("road-to-rome");
      expect(journeys[0].name).toBe("Road to Rome");
      expect(journeys[0].language).toBe("italian");
    });

    it("includes all journey fields", async () => {
      const journeys = await listJourneys();
      const journey = journeys[0];

      expect(journey).toHaveProperty("id");
      expect(journey).toHaveProperty("slug");
      expect(journey).toHaveProperty("name");
      expect(journey).toHaveProperty("description");
      expect(journey).toHaveProperty("language");
      expect(journey).toHaveProperty("startCityName");
      expect(journey).toHaveProperty("targetCityName");
      expect(journey).toHaveProperty("emoji");
      expect(journey).toHaveProperty("winMessage");
    });

    it("returns journey with correct emoji", async () => {
      const journeys = await listJourneys();

      expect(journeys[0].emoji).toBe("🇮🇹");
    });

    it("returns journey with correct win message", async () => {
      const journeys = await listJourneys();

      expect(journeys[0].winMessage).toBe("You Made It to Rome!");
    });
  });
});
