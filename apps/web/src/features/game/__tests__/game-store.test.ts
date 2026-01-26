import { beforeEach, describe, expect, it } from "vitest";

import { useGameStore } from "../model/game-store";

describe("game-store", () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().resetGame();
  });

  describe("initGame", () => {
    it("sets status to loading then playing on success", async () => {
      const store = useGameStore.getState();

      const initPromise = store.initGame("road-to-rome");

      // Check loading state
      expect(useGameStore.getState().status).toBe("loading");

      await initPromise;

      // Check playing state
      const state = useGameStore.getState();
      expect(state.status).toBe("playing");
      expect(state.journey?.slug).toBe("road-to-rome");
      expect(state.currentCity?.id).toBe("venice-id");
      expect(state.targetCity?.id).toBe("rome-id");
      expect(state.availableEdges.length).toBeGreaterThan(0);
      expect(state.visitedCities).toContain("venice-id");
    });

    it("auto-selects first edge and sets city arrival time on init", async () => {
      await useGameStore.getState().initGame("road-to-rome");

      const state = useGameStore.getState();
      expect(state.selectedEdge).not.toBeNull();
      expect(state.cityArrivedAt).not.toBeNull();
    });

    it("loads all translations for client-side game logic", async () => {
      await useGameStore.getState().initGame("road-to-rome");

      const state = useGameStore.getState();
      expect(state.allTranslations.length).toBeGreaterThan(0);
      expect(state.remainingTranslations.length).toBeGreaterThan(0);
    });

    it("clears answer state on init", async () => {
      // Set some initial state
      useGameStore.setState({
        lastAnswerCorrect: true,
        correctAnswer: "test",
        isAnswerRevealed: true,
        wrongAttempts: 5,
      });

      await useGameStore.getState().initGame("road-to-rome");

      const state = useGameStore.getState();
      expect(state.lastAnswerCorrect).toBeNull();
      expect(state.correctAnswer).toBeNull();
      expect(state.isAnswerRevealed).toBe(false);
      expect(state.wrongAttempts).toBe(0);
    });
  });

  describe("selectEdge", () => {
    it("sets the selected edge without resetting city timer", async () => {
      await useGameStore.getState().initGame("road-to-rome");
      const originalCityArrivedAt = useGameStore.getState().cityArrivedAt;
      const edges = useGameStore.getState().availableEdges;

      // Select a different edge
      if (edges.length >= 2) {
        useGameStore.getState().selectEdge(edges[1]);
      }

      const state = useGameStore.getState();
      expect(state.selectedEdge).toEqual(edges.length >= 2 ? edges[1] : edges[0]);
      // Timer should NOT reset when switching edges
      expect(state.cityArrivedAt).toBe(originalCityArrivedAt);
    });

    it("clears answer state when selecting an edge", async () => {
      await useGameStore.getState().initGame("road-to-rome");

      useGameStore.setState({
        lastAnswerCorrect: false,
        correctAnswer: "hello",
        isAnswerRevealed: true,
        wrongAttempts: 3,
      });

      const edges = useGameStore.getState().availableEdges;
      useGameStore.getState().selectEdge(edges[0]);

      const state = useGameStore.getState();
      expect(state.lastAnswerCorrect).toBeNull();
      expect(state.correctAnswer).toBeNull();
      expect(state.isAnswerRevealed).toBe(false);
      expect(state.wrongAttempts).toBe(0);
    });

    it("can clear selected edge with null", async () => {
      await useGameStore.getState().initGame("road-to-rome");

      useGameStore.getState().selectEdge(null);

      const state = useGameStore.getState();
      expect(state.selectedEdge).toBeNull();
    });
  });

  describe("selectEdgeByNumber", () => {
    beforeEach(async () => {
      await useGameStore.getState().initGame("road-to-rome");
    });

    it("selects edge by 1-based number without resetting timer", () => {
      const originalCityArrivedAt = useGameStore.getState().cityArrivedAt;
      const edges = useGameStore.getState().availableEdges;

      if (edges.length >= 2) {
        useGameStore.getState().selectEdgeByNumber(2);
        const state = useGameStore.getState();
        expect(state.selectedEdge?.edgeId).toBe(edges[1].edgeId);
        // Timer should NOT reset when switching edges
        expect(state.cityArrivedAt).toBe(originalCityArrivedAt);
      }
    });

    it("does nothing for invalid number", () => {
      const edgeBefore = useGameStore.getState().selectedEdge;

      useGameStore.getState().selectEdgeByNumber(99);

      expect(useGameStore.getState().selectedEdge).toEqual(edgeBefore);
    });

    it("resets answer state when selecting by number", () => {
      useGameStore.setState({
        lastAnswerCorrect: false,
        wrongAttempts: 2,
      });

      useGameStore.getState().selectEdgeByNumber(1);

      const state = useGameStore.getState();
      expect(state.lastAnswerCorrect).toBeNull();
      expect(state.wrongAttempts).toBe(0);
    });
  });

  describe("submitTranslation", () => {
    beforeEach(async () => {
      await useGameStore.getState().initGame("road-to-rome");
    });

    it("updates state on correct answer and sets new city arrival time", () => {
      const correctAnswer = useGameStore.getState().selectedEdge?.translation.targetWord;

      useGameStore.getState().submitTranslation(correctAnswer!);

      const newState = useGameStore.getState();
      expect(newState.lastAnswerCorrect).toBe(true);
      expect(newState.visitedCities.length).toBeGreaterThan(1);
      // Timer is set for the new city
      expect(newState.cityArrivedAt).not.toBeNull();
    });

    it("updates state on incorrect answer", () => {
      useGameStore.getState().submitTranslation("wrong-answer-xyz");

      const state = useGameStore.getState();
      expect(state.lastAnswerCorrect).toBe(false);
      expect(state.correctAnswer).not.toBeNull();
      expect(state.wrongAttempts).toBe(1);
      // Should stay on current city
      expect(state.currentCity?.id).toBe("venice-id");
    });

    it("increments wrong attempts on repeated wrong answers", () => {
      useGameStore.getState().submitTranslation("wrong1");
      useGameStore.getState().submitTranslation("wrong2");
      useGameStore.getState().submitTranslation("wrong3");

      expect(useGameStore.getState().wrongAttempts).toBe(3);
    });

    it("does nothing without selected edge", () => {
      useGameStore.getState().selectEdge(null);
      const stateBefore = useGameStore.getState();

      useGameStore.getState().submitTranslation("hello");

      const stateAfter = useGameStore.getState();
      expect(stateAfter.currentCity).toEqual(stateBefore.currentCity);
    });

    it("tracks used translations to avoid repeats", () => {
      const initialUsed = useGameStore.getState().usedTranslationIds.size;
      const correctAnswer = useGameStore.getState().selectedEdge?.translation.targetWord;

      useGameStore.getState().submitTranslation(correctAnswer!);

      const newUsed = useGameStore.getState().usedTranslationIds.size;
      expect(newUsed).toBeGreaterThanOrEqual(initialUsed);
    });
  });

  describe("switchTranslation", () => {
    beforeEach(async () => {
      await useGameStore.getState().initGame("road-to-rome");
    });

    it("replaces current word with a new one from the pool", () => {
      const originalWord = useGameStore.getState().selectedEdge?.translation.sourceWord;
      const originalRemaining = useGameStore.getState().remainingTranslations.length;

      useGameStore.getState().switchTranslation();

      const newState = useGameStore.getState();
      // Word should change
      expect(newState.selectedEdge?.translation.sourceWord).not.toBe(originalWord);
      // Remaining count should stay the same (old word goes back to pool)
      expect(newState.remainingTranslations.length).toBe(originalRemaining);
    });

    it("clears answer state when switching", () => {
      useGameStore.setState({
        wrongAttempts: 3,
        lastAnswerCorrect: false,
        correctAnswer: "test",
        isAnswerRevealed: true,
      });

      useGameStore.getState().switchTranslation();

      const state = useGameStore.getState();
      expect(state.wrongAttempts).toBe(0);
      expect(state.lastAnswerCorrect).toBeNull();
      expect(state.correctAnswer).toBeNull();
      expect(state.isAnswerRevealed).toBe(false);
    });

    it("updates the edge in availableEdges array", () => {
      const originalEdgeId = useGameStore.getState().selectedEdge?.edgeId;

      useGameStore.getState().switchTranslation();

      const state = useGameStore.getState();
      const updatedEdge = state.availableEdges.find(e => e.edgeId === originalEdgeId);
      expect(updatedEdge?.translation).toEqual(state.selectedEdge?.translation);
    });

    it("does nothing when no remaining translations", () => {
      useGameStore.setState({ remainingTranslations: [] });
      const originalWord = useGameStore.getState().selectedEdge?.translation.sourceWord;

      useGameStore.getState().switchTranslation();

      const sourceWord = useGameStore.getState().selectedEdge?.translation.sourceWord;
      expect(sourceWord).toBe(originalWord);
    });

    it("does not use translations already assigned to other edges", () => {
      const state = useGameStore.getState();
      const otherEdgeTranslationIds = state.availableEdges
        .filter(e => e.edgeId !== state.selectedEdge?.edgeId)
        .map(e => e.translation.id);

      useGameStore.getState().switchTranslation();

      const newTranslationId = useGameStore.getState().selectedEdge?.translation.id;
      expect(otherEdgeTranslationIds).not.toContain(newTranslationId);
    });

    it("does not use previously used translations", () => {
      const usedIdsBefore = new Set(useGameStore.getState().usedTranslationIds);

      useGameStore.getState().switchTranslation();

      const newTranslationId = useGameStore.getState().selectedEdge?.translation.id;
      expect(usedIdsBefore.has(newTranslationId!)).toBe(false);
    });
  });

  describe("revealAnswer", () => {
    it("sets isAnswerRevealed to true", () => {
      useGameStore.setState({ correctAnswer: "hello", isAnswerRevealed: false });

      useGameStore.getState().revealAnswer();

      expect(useGameStore.getState().isAnswerRevealed).toBe(true);
    });
  });

  describe("resetGame", () => {
    it("resets all state to initial values", async () => {
      // Set up some game state
      await useGameStore.getState().initGame("road-to-rome");
      useGameStore.setState({
        status: "won",
        lastAnswerCorrect: true,
        wrongAttempts: 5,
        isAnswerRevealed: true,
      });

      useGameStore.getState().resetGame();

      const state = useGameStore.getState();
      expect(state.status).toBe("idle");
      expect(state.journey).toBeNull();
      expect(state.currentCity).toBeNull();
      expect(state.targetCity).toBeNull();
      expect(state.availableEdges).toHaveLength(0);
      expect(state.visitedCities).toHaveLength(0);
      expect(state.selectedEdge).toBeNull();
      expect(state.cityArrivedAt).toBeNull();
      expect(state.lastAnswerCorrect).toBeNull();
      expect(state.wrongAttempts).toBe(0);
      expect(state.isAnswerRevealed).toBe(false);
    });
  });

  describe("clearAnswerState", () => {
    it("clears the last answer correct state", () => {
      useGameStore.setState({ lastAnswerCorrect: false });

      useGameStore.getState().clearAnswerState();

      expect(useGameStore.getState().lastAnswerCorrect).toBeNull();
    });
  });
});
