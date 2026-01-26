"use client";

import { cn } from "@/shared/lib";

export interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  if (text) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-sm font-medium text-gray-500">{text}</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>
    );
  }

  return <div className={cn("h-px w-full bg-gray-300", className)} />;
}
