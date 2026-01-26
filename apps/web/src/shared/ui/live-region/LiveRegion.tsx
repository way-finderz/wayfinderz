"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

export interface LiveRegionProps {
  children: ReactNode;
  mode?: "polite" | "assertive";
  atomic?: boolean;
  visuallyHidden?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  mode = "polite",
  atomic = true,
  visuallyHidden = false,
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic={atomic}
      className={cn(
        visuallyHidden &&
          "sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className
      )}
    >
      {children}
    </div>
  );
}
