import { Skeleton, SkeletonText } from "@/shared/ui";

export function GameLoadingScreen() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton variant="text" width={180} height={36} />
        <Skeleton variant="text" width={140} height={20} />
      </div>

      <div className="bg-white border rounded-lg p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Translation input skeleton */}
          <div className="lg:w-96 space-y-4">
            <Skeleton variant="rectangular" height={80} className="rounded-t-lg" />
            <div className="space-y-3 p-4">
              <Skeleton variant="rectangular" height={44} />
              <SkeletonText lines={2} />
            </div>
          </div>

          {/* Right side - Map skeleton */}
          <div className="flex-1 min-h-[300px]">
            <Skeleton variant="rectangular" height={300} className="w-full" />
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 mt-4">Preparing your journey...</p>
    </div>
  );
}
