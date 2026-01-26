"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { saveProgress, useGameStore } from "@/features/game";
import { formatTime } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { trpc } from "@/trpc";

import { SaveStatusAlert } from "./SaveStatusAlert";

/**
 * Calculate accuracy percentage
 */
function calculateAccuracy(correct: number, wrong: number): number {
  const total = correct + wrong;
  if (total === 0) return 100;

  return Math.round((correct / total) * 100);
}

interface WinScreenProps {
  onPlayAgain: () => void;
}

// Get journey-specific decorative emojis
type EmojiTuple = [string, string, string];
function getJourneyDecorations(emoji: string | null | undefined): EmojiTuple {
  switch (emoji) {
    case "🇮🇹": return ["🏛️", "⛲", "🏛️"];
    case "🐚": return ["🐚", "⛪", "🐚"];
    case "⛷️": return ["🏔️", "⛷️", "🏔️"];
    default: return ["🎉", "🏆", "🎉"];
  }
}

interface WinScreenStatsProps {
  completionTimeMs: number;
  accuracy: number;
  totalCorrectAttempts: number;
  totalWrongAttempts: number;
}

function WinScreenStats({
  completionTimeMs,
  accuracy,
  totalCorrectAttempts,
  totalWrongAttempts,
}: WinScreenStatsProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-white">{formatTime(completionTimeMs)}</p>
          <p className="text-xs md:text-sm text-white/70">Time</p>
        </div>
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-white">{accuracy}%</p>
          <p className="text-xs md:text-sm text-white/70">Accuracy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-green-300">{totalCorrectAttempts}</p>
          <p className="text-xs md:text-sm text-white/70">Correct</p>
        </div>
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-red-300">{totalWrongAttempts}</p>
          <p className="text-xs md:text-sm text-white/70">Wrong</p>
        </div>
      </div>
    </motion.div>
  );
}

// Confetti particle component
function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ["#6F2AEC", "#FFD700", "#22C55E", "#EF4444", "#3B82F6"][
        Math.floor(Math.random() * 5)
      ],
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "100vh",
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "linear",
          }}
          className="absolute w-3 h-3"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}

export function WinScreen({ onPlayAgain }: WinScreenProps) {
  const {
    journey,
    resetGame,
    gameStartedAt,
    totalCorrectAttempts,
    totalWrongAttempts,
  } = useGameStore();
  const utils = trpc.useUtils();
  const hasSavedProgress = useRef(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error" | "retrying">("saving");

  // Calculate stats - use ref to capture time at mount
  const completionTimeRef = useRef<number>(0);
  if (completionTimeRef.current === 0 && gameStartedAt) {
    completionTimeRef.current = Date.now() - gameStartedAt;
  }
  const completionTimeMs = completionTimeRef.current;
  const accuracy = calculateAccuracy(totalCorrectAttempts, totalWrongAttempts);

  useEffect(() => {
    if (hasSavedProgress.current || !journey?.id || !gameStartedAt) return;
    hasSavedProgress.current = true;

    saveProgress({
      journeyId: journey.id,
      timeMs: completionTimeMs,
      correctAttempts: totalCorrectAttempts,
      wrongAttempts: totalWrongAttempts,
    })
      .then(() => {
        utils.game.getUserProgress.invalidate();
        setSaveStatus("saved");
      })
      .catch((error) => {
        console.error("Failed to save progress:", error);
        setSaveStatus("error");
      });
  }, [
    journey?.id,
    gameStartedAt,
    completionTimeMs,
    totalCorrectAttempts,
    totalWrongAttempts,
    utils.game.getUserProgress,
  ]);

  const handleRetry = async () => {
    if (!journey?.id) return;

    setSaveStatus("retrying");
    try {
      await saveProgress({
        journeyId: journey.id,
        timeMs: completionTimeMs,
        correctAttempts: totalCorrectAttempts,
        wrongAttempts: totalWrongAttempts,
      });
      utils.game.getUserProgress.invalidate();
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save progress on retry:", error);
      setSaveStatus("error");
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    onPlayAgain();
  };

  return (
    <div data-testid="win-screen" className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#6F2AEC]/90 to-[#4A1B9D]/90 overflow-y-auto">
      <Confetti />

      {/* Save status - top right */}
      <SaveStatusAlert saveStatus={saveStatus} handleRetry={handleRetry} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
        className="relative text-center px-6 py-8 mx-auto my-auto max-w-lg w-full"
      >
        {/* Trophy animation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", damping: 12 }}
          className="mb-4"
        >
          <motion.span
            className="text-6xl md:text-8xl inline-block"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            🏆
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          data-testid="win-title"
          className="text-3xl md:text-5xl font-bold text-white mb-2"
        >
          {journey?.winMessage || "You Made It!"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-white/80 mb-6"
        >
          Congratulations on your journey!
        </motion.p>

        {/* Stats */}
        <WinScreenStats
          completionTimeMs={completionTimeMs}
          accuracy={accuracy}
          totalCorrectAttempts={totalCorrectAttempts}
          totalWrongAttempts={totalWrongAttempts}
        />

        {/* Journey-specific decoration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="flex justify-center gap-4 mb-6 text-3xl md:text-4xl"
        >
          {(() => {
            const [left, center, right] = getJourneyDecorations(journey?.emoji);

            return (
              <>
                <span>{left}</span>
                <span>{center}</span>
                <span>{right}</span>
              </>
            );
          })()}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            data-testid="win-play-again"
            onClick={handlePlayAgain}
            size="lg"
            className="bg-white text-[#6F2AEC] hover:bg-gray-100 font-bold px-8 py-3 text-lg w-full sm:w-auto"
          >
            Play Again
          </Button>
          <Link
            href="/dashboard"
            data-testid="win-exit-link"
            className="px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
