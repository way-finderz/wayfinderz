"use client";

import { AnimatePresence,motion } from "framer-motion";
import { useCallback, useEffect, useRef,useState } from "react";

import { type AvailableEdge,useGameStore } from "@/features/game";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface TranslationModalProps {
  edge: AvailableEdge;
  onClose: () => void;
}

export function TranslationModal({ edge, onClose }: TranslationModalProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    submitTranslation,
    lastAnswerCorrect,
    correctAnswer,
    isAnswerRevealed,
    clearAnswerState,
  } = useGameStore();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear answer state when edge changes
  useEffect(() => {
    clearAnswerState();
    setAnswer("");
  }, [edge.edgeId, clearAnswerState]);

  // Close modal on correct answer after showing feedback
  useEffect(() => {
    if (lastAnswerCorrect === true) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [lastAnswerCorrect, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!answer.trim() || isSubmitting) return;

      setIsSubmitting(true);
      await submitTranslation(answer.trim());
      setIsSubmitting(false);
    },
    [answer, isSubmitting, submitTranslation]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
        onKeyDown={handleKeyDown}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#6F2AEC] px-6 py-4 text-white">
            <h2 className="text-lg font-semibold">Translate to Travel</h2>
            <p className="text-sm text-white/80">
              To {edge.toCityName}
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Source word display */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Translate this word:</p>
              <motion.p
                key={edge.translation.sourceWord}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-[#6F2AEC]"
              >
                {edge.translation.sourceWord}
              </motion.p>
            </div>

            {/* Answer input */}
            <div className="mb-4">
              <Input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter English translation..."
                disabled={isSubmitting || lastAnswerCorrect === true}
                className={cn(
                  lastAnswerCorrect === true && "border-green-500 bg-green-50",
                  lastAnswerCorrect === false && "border-red-500 bg-red-50"
                )}
              />
            </div>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {lastAnswerCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "mb-4 p-3 rounded-lg text-center",
                    lastAnswerCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {lastAnswerCorrect ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      <span className="text-2xl">Correct!</span>
                    </motion.div>
                  ) : (
                    <div>
                      <p className="font-semibold">Not quite!</p>
                      {isAnswerRevealed && correctAnswer && (
                        <p className="text-sm mt-1">
                          The correct answer is: <strong>{correctAnswer}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSubmitting}
                disabled={!answer.trim() || lastAnswerCorrect === true}
                className="flex-1 bg-[#6F2AEC] hover:bg-[#5B22C4]"
              >
                {lastAnswerCorrect === true ? "Moving..." : "Submit"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
