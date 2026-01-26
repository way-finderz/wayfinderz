"use client";

import { useCallback, useEffect } from "react";
import { match, P } from "ts-pattern";

import { ProtectedRoute } from "@/features/auth";
import {
  GameErrorScreen,
  GameLoadingScreen,
  GamePlayingLayout,
  GameStartScreen,
  useGameData,
  useGameStore,
  useJourney,
  useJourneyProgress,
  useJourneyRecord,
} from "@/features/game";
import { GameGraph } from "@/widgets/game-graph";
import { TranslationInput } from "@/widgets/translation-input";
import { WinScreen } from "@/widgets/win-screen";

import { GameErrorBoundary } from "./GameErrorBoundary";

export interface GamePageProps {
  journeySlug: string;
}

function GameContent({ journeySlug }: { journeySlug: string }) {
  const {
    status,
    journey: gameJourney,
    currentCity,
    targetCity,
    selectedEdge,
    visitedCities,
    error,
    initializeGame,
    setLoading,
    setError,
    resetGame,
  } = useGameStore();

  const {
    data: journeyInfo,
    isLoading: isJourneyLoading,
    error: journeyError,
  } = useJourney(journeySlug);

  const {
    data: userProgress,
  } = useJourneyProgress(journeyInfo?.id);

  const {
    data: journeyRecord,
  } = useJourneyRecord(journeyInfo?.id);

  const {
    data: gameData,
    isLoading: isGameLoading,
    error: gameError,
    refetch: refetchGameData,
  } = useGameData(journeySlug, status === "loading");

  useEffect(() => {
    resetGame();
  }, [resetGame, journeySlug]);

  useEffect(() => {
    if (gameData && status === "loading") {
      initializeGame(gameData);
    }
  }, [gameData, status, initializeGame]);

  useEffect(() => {
    if (gameError && status === "loading") {
      setError(gameError instanceof Error ? gameError.message : "Failed to start game");
    }
  }, [gameError, status, setError]);

  const handleStartGame = useCallback(() => {
    setLoading();
    refetchGameData();
  }, [setLoading, refetchGameData]);

  const handleRetry = useCallback(() => {
    resetGame();
    handleStartGame();
  }, [resetGame, handleStartGame]);

  return match({ status, isJourneyLoading, journeyInfo, journeyError, isGameLoading })
    .with({
      isJourneyLoading: false,
      journeyInfo: P.nullish,
      journeyError: P.nullish,
    }, () => (
      <GameErrorScreen
        error="Journey not found"
        errorType="not_found"
        onRetry={() => window.location.reload()}
      />
    ))
    .with({ journeyError: P.not(P.nullish) }, ({ journeyError }) => (
      <GameErrorScreen
        error={journeyError instanceof Error ? journeyError.message : "Failed to load journey data"}
        onRetry={() => window.location.reload()}
      />
    ))
    .with({ status: "idle" }, () => (
      <GameStartScreen
        journey={journeyInfo}
        userProgress={userProgress}
        journeyRecord={journeyRecord}
        onStartGame={handleStartGame}
      />
    ))
    .with(P.union({ status: "loading" }, { isGameLoading: true }), () => (
      <GameLoadingScreen />
    ))
    .with({ status: "error" }, () => (
      <GameErrorScreen error={error} onRetry={handleRetry} />
    ))
    .with({ status: "won" }, () => (
      <WinScreen onPlayAgain={handleStartGame} />
    ))
    .otherwise(() => (
      <GamePlayingLayout
        journey={gameJourney}
        currentCity={currentCity}
        targetCity={targetCity}
        visitedCitiesCount={visitedCities.length - 1}
      >
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
          <div className="shrink-0 lg:shrink lg:w-96 lg:mx-0 max-w-2xl mx-auto w-full">
            <TranslationInput />
          </div>

          <div className="flex-1 min-h-0 lg:min-w-0">
            <GameGraph selectedEdgeId={selectedEdge?.edgeId} />
          </div>
        </div>
      </GamePlayingLayout>
    ));
}

export function GamePage({ journeySlug }: GamePageProps) {
  return (
    <ProtectedRoute>
      <GameErrorBoundary>
        <GameContent journeySlug={journeySlug} />
      </GameErrorBoundary>
    </ProtectedRoute>
  );
}
