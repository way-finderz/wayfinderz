"use client";

import { Skeleton } from "../skeleton";

export interface PageLoadingSkeletonProps {
  withHeader?: boolean;
}

function ContentSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md space-y-4 p-4">
        <Skeleton variant="rectangular" height={48} className="w-full" />
        <div className="space-y-3">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-5/6" />
        </div>
        <Skeleton variant="rectangular" height={100} className="w-full" />
      </div>
    </div>
  );
}

export function PageLoadingSkeleton({ withHeader = true }: PageLoadingSkeletonProps) {
  if (!withHeader) {
    return <ContentSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-[#6F2AEC]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-display text-xl font-black text-white">Way Finderz</span>
          <div className="flex items-center gap-4">
            <Skeleton variant="text" className="w-20 bg-white/20" />
            <Skeleton variant="text" className="w-20 bg-white/20" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <ContentSkeleton />
      </main>
    </div>
  );
}
