"use client";

import { cn } from "@/shared/lib";

interface BrandHeaderProps {
  className?: string;
}

export function BrandHeader({ className }: BrandHeaderProps) {
  return (
    <header
      className={cn(
        "w-full bg-primary py-6 px-4",
        className
      )}
    >
      <div className="max-w-md mx-auto flex justify-center">
        <h1 className="font-display text-4xl font-black text-background-cream tracking-wide">
          Way Finderz
        </h1>
      </div>
    </header>
  );
}
