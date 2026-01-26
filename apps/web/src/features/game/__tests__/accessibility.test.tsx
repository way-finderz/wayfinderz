import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { GameErrorScreen } from "../ui/GameErrorScreen";
import { GameLoadingScreen } from "../ui/GameLoadingScreen";
import { GameStartScreen } from "../ui/GameStartScreen";

describe("Game Accessibility", () => {
  describe("GameErrorScreen", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <GameErrorScreen error="Test error" onRetry={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have role=alert for error content", () => {
      const { getByRole } = render(
        <GameErrorScreen error="Test error" onRetry={() => {}} />
      );
      expect(getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("GameLoadingScreen", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<GameLoadingScreen />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("GameStartScreen", () => {
    it("should not have accessibility violations when loading", async () => {
      const { container } = render(
        <GameStartScreen
          journey={null}
          userProgress={null}
          journeyRecord={null}
          onStartGame={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have accessibility violations with journey data", async () => {
      const journey = {
        id: "1",
        slug: "test-journey",
        name: "Test Journey",
        description: "A test journey",
        language: "Italian",
        startCityName: "Milan",
        targetCityName: "Rome",
        emoji: null,
        winMessage: "Congratulations!",
      };

      const { container } = render(
        <GameStartScreen
          journey={journey}
          userProgress={null}
          journeyRecord={null}
          onStartGame={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
