import { create } from "zustand";

import { fetchGameData } from "../api/game-api";

import type {
  AvailableEdge,
  City,
  GameDataResponse,
  GameEdge,
  GameStatus,
  Journey,
  Translation,
} from "./types";

interface GameState {
  // Static data (loaded once from server)
  journey: Journey | null;
  allCities: City[];
  allEdges: GameEdge[];
  allTranslations: Translation[];

  // Dynamic game state (managed client-side)
  status: GameStatus;
  currentCity: { id: string; name: string } | null;
  targetCity: { id: string; name: string } | null;
  availableEdges: AvailableEdge[];
  visitedCities: string[];
  selectedEdge: AvailableEdge | null;
  cityArrivedAt: number | null;
  wrongAttempts: number;
  lastAnswerCorrect: boolean | null;
  correctAnswer: string | null;
  isAnswerRevealed: boolean;
  usedTranslationIds: Set<string>;
  remainingTranslations: Translation[];
  error: string | null;
  gameStartedAt: number | null;
  totalCorrectAttempts: number;
  totalWrongAttempts: number;

  // Actions
  initGame: (journeySlug: string) => Promise<void>;
  initializeGame: (data: GameDataResponse) => void;
  setLoading: () => void;
  setError: (error: string) => void;
  selectEdge: (edge: AvailableEdge | null) => void;
  selectEdgeByNumber: (num: number) => void;
  submitTranslation: (answer: string) => void;
  switchTranslation: () => void;
  revealAnswer: () => void;
  resetGame: () => void;
  clearAnswerState: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled;
}

const initialState = {
  // Static data
  journey: null,
  allCities: [],
  allEdges: [],
  allTranslations: [],

  // Dynamic state
  status: "idle" as GameStatus,
  currentCity: null,
  targetCity: null,
  availableEdges: [],
  visitedCities: [],
  selectedEdge: null,
  cityArrivedAt: null,
  wrongAttempts: 0,
  lastAnswerCorrect: null,
  correctAnswer: null,
  isAnswerRevealed: false,
  usedTranslationIds: new Set<string>(),
  remainingTranslations: [],
  error: null,

  // Progress tracking
  gameStartedAt: null,
  totalCorrectAttempts: 0,
  totalWrongAttempts: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  initGame: async (journeySlug: string) => {
    set({ status: "loading", error: null });

    try {
      const data = await fetchGameData(journeySlug);
      get().initializeGame(data);
    } catch (error) {
      console.error("[GameStore] Failed to initialize game:", error);

      let errorMessage = "Failed to start game";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      const cause = (error as { cause?: { errorCode?: string } })?.cause;
      if (cause?.errorCode) {
        console.error("[GameStore] Error code:", cause.errorCode);
      }

      set({
        status: "error",
        error: errorMessage,
      });
    }
  },

  initializeGame: (data: GameDataResponse) => {
    const { journey, startCity, targetCity, allCities, allEdges, allTranslations } = data;

    const shuffledTranslations = shuffleArray(allTranslations);

    const startEdges = allEdges.filter(e => e.fromCityId === startCity.id);
    const { availableEdges, remaining, usedIds } = assignTranslationsToEdges(
      startEdges,
      allCities,
      shuffledTranslations,
      new Set()
    );

    const firstEdge = availableEdges.length > 0 ? availableEdges[0] : null;

    set({
      status: "playing",
      journey,
      allCities,
      allEdges,
      allTranslations,
      currentCity: startCity,
      targetCity,
      availableEdges,
      visitedCities: [startCity.id],
      selectedEdge: firstEdge,
      cityArrivedAt: Date.now(),
      wrongAttempts: 0,
      lastAnswerCorrect: null,
      correctAnswer: null,
      isAnswerRevealed: false,
      usedTranslationIds: usedIds,
      remainingTranslations: remaining,
      gameStartedAt: Date.now(),
      totalCorrectAttempts: 0,
      totalWrongAttempts: 0,
    });
  },

  setLoading: () => {
    set({ status: "loading", error: null });
  },

  setError: (error: string) => {
    set({ status: "error", error });
  },

  selectEdge: (edge) => {
    set({
      selectedEdge: edge,
      wrongAttempts: 0,
      lastAnswerCorrect: null,
      correctAnswer: null,
      isAnswerRevealed: false,
    });
  },

  selectEdgeByNumber: (num) => {
    const { availableEdges, selectEdge } = get();
    const edge = availableEdges[num - 1];
    if (edge) {
      selectEdge(edge);
    }
  },

  submitTranslation: (answer: string) => {
    const {
      selectedEdge,
      visitedCities,
      wrongAttempts,
      totalWrongAttempts,
      totalCorrectAttempts,
      targetCity,
      allEdges,
      allCities,
      remainingTranslations,
      usedTranslationIds,
    } = get();

    if (!selectedEdge) {
      return;
    }

    const correct =
      answer.toLowerCase().trim() ===
      selectedEdge.translation.targetWord.toLowerCase();

    if (!correct) {
      set({
        lastAnswerCorrect: false,
        wrongAttempts: wrongAttempts + 1,
        totalWrongAttempts: totalWrongAttempts + 1,
        correctAnswer: selectedEdge.translation.targetWord,
      });

      return;
    }

    const newTotalCorrect = totalCorrectAttempts + 1;

    const newCityId = selectedEdge.toCityId;
    const newCity = allCities.find(c => c.id === newCityId);

    if (!newCity) {
      return;
    }

    const isWin = newCityId === targetCity?.id;

    if (isWin) {
      set({
        status: "won",
        currentCity: { id: newCity.id, name: newCity.displayName },
        visitedCities: [...visitedCities, newCityId],
        availableEdges: [],
        selectedEdge: null,
        cityArrivedAt: null,
        wrongAttempts: 0,
        lastAnswerCorrect: true,
        correctAnswer: null,
        isAnswerRevealed: false,
        totalCorrectAttempts: newTotalCorrect,
      });

      return;
    }

    const newEdgesFromCity = allEdges.filter(e => e.fromCityId === newCityId);
    const edgeResult = assignTranslationsToEdges(
      newEdgesFromCity,
      allCities,
      remainingTranslations,
      usedTranslationIds
    );

    const firstEdge = edgeResult.availableEdges[0] ?? null;

    set({
      currentCity: { id: newCity.id, name: newCity.displayName },
      availableEdges: edgeResult.availableEdges,
      visitedCities: [...visitedCities, newCityId],
      selectedEdge: firstEdge,
      cityArrivedAt: Date.now(),
      wrongAttempts: 0,
      lastAnswerCorrect: true,
      correctAnswer: null,
      isAnswerRevealed: false,
      remainingTranslations: edgeResult.remaining,
      usedTranslationIds: edgeResult.usedIds,
      totalCorrectAttempts: newTotalCorrect,
    });
  },

  switchTranslation: () => {
    const {
      selectedEdge,
      availableEdges,
      remainingTranslations,
      usedTranslationIds,
    } = get();

    if (!selectedEdge) {
      return;
    }

    const currentEdgeTranslationIds = new Set(
      availableEdges
        .filter(e => e.edgeId !== selectedEdge.edgeId)
        .map(e => e.translation.id)
    );

    const availableForSwitch = remainingTranslations.filter(
      t => !usedTranslationIds.has(t.id) && !currentEdgeTranslationIds.has(t.id)
    );

    if (availableForSwitch.length === 0) {
      return;
    }

    const newTranslation = availableForSwitch[0]!;

    const newRemaining = remainingTranslations.filter(t => t.id !== newTranslation.id);
    newRemaining.push(selectedEdge.translation);

    const updatedEdge: AvailableEdge = {
      ...selectedEdge,
      translation: newTranslation,
    };

    const updatedAvailableEdges = availableEdges.map(edge =>
      edge.edgeId === selectedEdge.edgeId ? updatedEdge : edge
    );

    set({
      selectedEdge: updatedEdge,
      availableEdges: updatedAvailableEdges,
      remainingTranslations: newRemaining,
      wrongAttempts: 0,
      lastAnswerCorrect: null,
      correctAnswer: null,
      isAnswerRevealed: false,
    });
  },

  revealAnswer: () => {
    set({ isAnswerRevealed: true });
  },

  resetGame: () => {
    set(initialState);
  },

  clearAnswerState: () => {
    set({ lastAnswerCorrect: null });
  },
}));

function assignTranslationsToEdges(
  edges: GameEdge[],
  allCities: City[],
  remainingTranslations: Translation[],
  usedIds: Set<string>
): {
  availableEdges: AvailableEdge[];
  remaining: Translation[];
  usedIds: Set<string>;
} {
  const newUsedIds = new Set(usedIds);
  const available: AvailableEdge[] = [];
  let remaining = [...remainingTranslations];

  for (const edge of edges) {
    if (remaining.length === 0) {
      console.warn("Ran out of translations");
      break;
    }

    const translation = remaining[0]!;
    remaining = remaining.slice(1);
    newUsedIds.add(translation.id);

    const toCity = allCities.find(c => c.id === edge.toCityId);

    available.push({
      edgeId: edge.id,
      toCityId: edge.toCityId,
      toCityName: toCity?.displayName ?? "Unknown",
      translation,
    });
  }

  return {
    availableEdges: available,
    remaining,
    usedIds: newUsedIds,
  };
}
