"use client";

import { cn } from "@/shared/lib";

export type SkeletonVariant = "text" | "circular" | "rectangular";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className,
  animation = "pulse",
}: SkeletonProps) {
  const baseStyles = "bg-gray-200";

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
    none: "",
  };

  const variantStyles = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={cn(
        baseStyles,
        animationStyles[animation],
        variantStyles[variant],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 ? "w-3/4" : "w-full",
            lineClassName
          )}
        />
      ))}
    </div>
  );
}
