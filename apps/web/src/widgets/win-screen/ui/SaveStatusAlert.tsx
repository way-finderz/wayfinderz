import { motion } from "framer-motion";
import { match } from "ts-pattern";

import type { SaveStatus } from "@/features/game";

function Status({ className, children }: React.PropsWithChildren<{ className: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const statusVariants = {
  saving: {
    className: "px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/70 text-sm",
    text: "Saving...",
  },
  saved: {
    className: "px-3 py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full text-green-200 text-sm",
    text: "✓ Saved",
  },
  error: {
    className: "px-3 py-1.5 bg-amber-500/20 backdrop-blur-sm rounded-full text-amber-200 text-sm flex items-center gap-2",
    text: "⚠️ Not saved",
  },
  retrying: {
    className: "px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-200 text-sm",
    text: "Retrying...",
  },
} as const;

interface SaveStatusProps {
  saveStatus: SaveStatus;
  handleRetry: () => void;
}

export function SaveStatusAlert({ saveStatus, handleRetry }: SaveStatusProps) {
  const { className, text } = statusVariants[saveStatus];

  const statusElement = match(saveStatus)
    .with("saving", "retrying", "saved", () => (
      <Status className={className}>
        {text}
      </Status>
    ))
    .with("error", () => (
      <Status className={className}>
        <span>⚠️ Not saved</span>
        <button
          data-testid="win-retry-save"
          onClick={handleRetry}
          className="underline hover:text-white font-medium"
        >
          Retry
        </button>
      </Status>
    ))
    .exhaustive();

  return (
    <div className="absolute top-4 right-4 z-10">
      {statusElement}
    </div>
  );
}
