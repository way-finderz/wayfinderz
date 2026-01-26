import { motion } from "framer-motion";
import Link from "next/link";

import { formatTime } from "@/shared/lib";
import { Button } from "@/shared/ui";

import type { Journey, JourneyProgress, JourneyRecord } from "../model/types";

export interface GameStartScreenProps {
  journey?: Journey | null;
  userProgress?: JourneyProgress | null;
  journeyRecord?: JourneyRecord | null;
  onStartGame: () => void;
}

export function GameStartScreen({
  journey,
  userProgress,
  journeyRecord,
  onStartGame,
}: GameStartScreenProps) {
  return (
    <div data-testid="game-start-screen" className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{journey?.name || "Way Finderz"}</h1>
        <Link
          href="/dashboard"
          data-testid="game-back-link"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-lg p-12 text-center"
      >
        <motion.div
          className="text-8xl mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {journey?.emoji || "🗺️"}
        </motion.div>
        <h2 className="text-2xl font-semibold mb-4">Start Your Journey</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {journey?.description || "Begin your language learning adventure!"}
        </p>

        {/* Stats Section */}
        <div className="flex justify-center gap-8 mb-8 text-sm">
          <div className="text-center">
            <div className="text-gray-500 mb-1">Your Status</div>
            <div className={userProgress?.completed ? "text-green-600 font-medium" : "text-gray-400"}>
              {userProgress?.completed ? "Completed" : "Not completed"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 mb-1">Your Best</div>
            <div className="font-medium">
              {userProgress?.bestTimeMs ? formatTime(userProgress.bestTimeMs) : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 mb-1">Record</div>
            <div className="font-medium text-purple-600">
              {journeyRecord?.bestTimeMs ? (
                <>
                  {formatTime(journeyRecord.bestTimeMs)}
                  {journeyRecord.holderName && (
                    <span className="text-gray-400 text-xs block">by {journeyRecord.holderName}</span>
                  )}
                </>
              ) : "—"}
            </div>
          </div>
        </div>

        <Button
          data-testid="game-begin-button"
          onClick={onStartGame}
          size="lg"
          variant="secondary"
          className="bg-[#6F2AEC] hover:bg-[#5B22C4]"
        >
          {userProgress?.completed ? "Play Again" : "Begin Journey"}
        </Button>
      </motion.div>
    </div>
  );
}
