"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGameStore } from "@/features/game";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { LiveRegion } from "@/shared/ui/live-region";

// Time thresholds in milliseconds
const SWITCH_WORD_THRESHOLD = 15000; // 15 seconds
const REVEAL_ANSWER_THRESHOLD = 30000; // 30 seconds

// Common wrong answers for multiple choice (we'll mix these with the correct answer)
const COMMON_WORDS = [
  "hello", "goodbye", "please", "thank you", "yes", "no", "water", "bread",
  "house", "car", "dog", "cat", "book", "friend", "love", "good", "bad",
  "big", "small", "happy", "sad", "food", "drink", "morning", "night",
  "today", "tomorrow", "yesterday", "always", "never", "here", "there",
];

function generateMultipleChoiceOptions(correctAnswer: string): string[] {
  const options = [correctAnswer];
  const shuffledWords = [...COMMON_WORDS]
    .filter(w => w.toLowerCase() !== correctAnswer.toLowerCase())
    .sort(() => Math.random() - 0.5);

  // Add 3 wrong options
  for (let i = 0; i < 3 && i < shuffledWords.length; i++) {
    options.push(shuffledWords[i]);
  }

  // Shuffle the options
  return options.sort(() => Math.random() - 0.5);
}

export function TranslationInput() {
  const [answer, setAnswer] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    selectedEdge,
    availableEdges,
    cityArrivedAt,
    wrongAttempts,
    lastAnswerCorrect,
    correctAnswer,
    isAnswerRevealed,
    remainingTranslations,
    usedTranslationIds,
    submitTranslation,
    switchTranslation,
    selectEdgeByNumber,
    revealAnswer,
    clearAnswerState,
  } = useGameStore();

  // Keep input focused
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Focus immediately
    focusInput();

    // Re-focus when window regains focus
    window.addEventListener("focus", focusInput);

    // Re-focus periodically to catch any blur events
    const interval = setInterval(focusInput, 100);

    return () => {
      window.removeEventListener("focus", focusInput);
      clearInterval(interval);
    };
  }, []);

  // Update elapsed time every second (timer persists across word changes within a city)
  useEffect(() => {
    if (!cityArrivedAt) {
      setElapsedTime(0);

      return;
    }

    // Set initial elapsed time immediately
    setElapsedTime(Date.now() - cityArrivedAt);

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - cityArrivedAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [cityArrivedAt]);

  // Generate multiple choice options when answer is available and threshold passed
  useEffect(() => {
    const shouldShowOptions = correctAnswer &&
      elapsedTime >= REVEAL_ANSWER_THRESHOLD &&
      multipleChoiceOptions.length === 0;
    if (shouldShowOptions) {
      setMultipleChoiceOptions(generateMultipleChoiceOptions(correctAnswer));
    }
  }, [correctAnswer, elapsedTime, multipleChoiceOptions.length]);

  // Reset state when edge changes
  useEffect(() => {
    setMultipleChoiceOptions([]);
    setAnswer("");
    clearAnswerState();
  }, [selectedEdge?.edgeId, clearAnswerState]);

  // Handle input changes - intercept number keys for edge switching
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value.slice(-1);
    const num = parseInt(lastChar);

    // If the user typed a number and it's a valid edge number, switch edges
    if (!isNaN(num) && num >= 1 && num <= availableEdges.length) {
      selectEdgeByNumber(num);

      // Don't add the number to the answer
      return;
    }

    setAnswer(value);
  }, [availableEdges.length, selectEdgeByNumber]);

  // Handle key down for Enter to submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && answer.trim() && selectedEdge) {
      e.preventDefault();
      submitTranslation(answer.trim());
      setAnswer("");
    }
  }, [answer, selectedEdge, submitTranslation]);

  const handleMultipleChoiceSelect = useCallback((selectedAnswer: string) => {
    if (!selectedEdge) return;
    submitTranslation(selectedAnswer);
    setMultipleChoiceOptions([]);
  }, [selectedEdge, submitTranslation]);

  // Check if there are translations available for switching
  const currentEdgeTranslationIds = new Set(
    availableEdges
      .filter(e => e.edgeId !== selectedEdge?.edgeId)
      .map(e => e.translation.id)
  );
  const hasAvailableSwitch = remainingTranslations.some(
    t => !usedTranslationIds.has(t.id) && !currentEdgeTranslationIds.has(t.id)
  );
  const canSwitchWord =
    elapsedTime >= SWITCH_WORD_THRESHOLD && hasAvailableSwitch;
  const canRevealAnswer =
    elapsedTime >= REVEAL_ANSWER_THRESHOLD && correctAnswer && !isAnswerRevealed;
  const showMultipleChoice =
    elapsedTime >= REVEAL_ANSWER_THRESHOLD && correctAnswer && !isAnswerRevealed;

  // Find the index of the selected edge
  const selectedEdgeIndex = selectedEdge
    ? availableEdges.findIndex(e => e.edgeId === selectedEdge.edgeId) + 1
    : 0;

  if (!selectedEdge) {
    return (
      <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
        No path selected. Press a number key to select a path.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header with source word */}
      <div className="bg-[#6F2AEC] px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">
              Translate to travel to {selectedEdge.toCityName}
            </p>
            <motion.p
              key={selectedEdge.translation.sourceWord}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              data-testid="translation-source-word"
              className="text-2xl font-bold"
            >
              {selectedEdgeIndex}. {selectedEdge.translation.sourceWord}
            </motion.p>
          </div>
          <div className="text-right">
            {wrongAttempts > 0 && (
              <p className="text-sm text-white/80">
                Attempts: {wrongAttempts}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Input section */}
      <div className="p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type English translation... (Enter to submit)"
            autoFocus
            data-testid="translation-input"
            className={cn(
              "flex-1 rounded-md border border-gray-300 px-4 py-2 text-lg transition-colors",
              "placeholder:text-gray-400",
              "focus:border-[#6F2AEC] focus:outline-none focus:ring-2 focus:ring-[#6F2AEC]/20",
              lastAnswerCorrect === false && "border-red-300 bg-red-50"
            )}
          />
          <Button
            data-testid="translation-submit"
            type="button"
            disabled={!answer.trim()}
            onClick={() => {
              if (answer.trim() && selectedEdge) {
                submitTranslation(answer.trim());
                setAnswer("");
              }
            }}
          >
            Submit
          </Button>
        </div>

        {/* Screen reader announcements */}
        <LiveRegion mode="polite" visuallyHidden>
          {lastAnswerCorrect === false && "Incorrect answer. Try again."}
          {lastAnswerCorrect === true && "Correct! Moving to next city."}
          {isAnswerRevealed && correctAnswer && `The answer is: ${correctAnswer}`}
        </LiveRegion>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {lastAnswerCorrect === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-center">
                <motion.span
                  initial={{ x: -10 }}
                  animate={{ x: [0, -5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  Not quite! Try again.
                </motion.span>
              </div>
            </motion.div>
          )}

          {isAnswerRevealed && correctAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-center">
                The answer is: <strong>{correctAnswer}</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timed hints section */}
        {wrongAttempts > 0 && !isAnswerRevealed && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>Stuck? Hints unlock over time</span>
              <span>{Math.floor(elapsedTime / 1000)}s</span>
            </div>

            <div className="flex gap-2">
              {/* Switch word button - available after 15s */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canSwitchWord}
                onClick={switchTranslation}
                className={cn(
                  "flex-1",
                  !canSwitchWord && "opacity-50"
                )}
              >
                {canSwitchWord ? (
                  "Switch to different word"
                ) : (
                  `Switch word in ${Math.ceil((SWITCH_WORD_THRESHOLD - elapsedTime) / 1000)}s`
                )}
              </Button>

              {/* Reveal answer button - available after 30s */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canRevealAnswer}
                onClick={revealAnswer}
                className={cn(
                  "flex-1",
                  !canRevealAnswer && "opacity-50"
                )}
              >
                {canRevealAnswer ? (
                  "Reveal answer"
                ) : (
                  `Reveal in ${Math.ceil((REVEAL_ANSWER_THRESHOLD - elapsedTime) / 1000)}s`
                )}
              </Button>
            </div>

            {/* Multiple choice options - available after 30s */}
            {showMultipleChoice && multipleChoiceOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p className="text-sm text-gray-500 mb-2 text-center">
                  Or choose from these options:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {multipleChoiceOptions.map((option, idx) => (
                    <Button
                      key={option}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMultipleChoiceSelect(option)}
                      className="border"
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Edge selection hint */}
        {availableEdges.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">1</kbd>-<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{availableEdges.length}</kbd> to switch paths:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableEdges.map((edge, idx) => {
                const num = idx + 1;
                const isSelected = edge.edgeId === selectedEdge?.edgeId;

                return (
                  <div
                    key={edge.edgeId}
                    data-testid={`edge-button-${num}`}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium",
                      "border-2",
                      isSelected
                        ? "bg-[#6F2AEC] border-[#6F2AEC] text-white"
                        : "bg-white border-gray-200 text-gray-700"
                    )}
                  >
                    <span className="font-bold">{num}.</span> {edge.translation.sourceWord}
                    <span className="text-xs opacity-70 ml-1">→ {edge.toCityName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
