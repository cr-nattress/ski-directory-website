'use client';

import { ResortCardSkeleton } from './ResortCardSkeleton';

interface ResortGridSkeletonProps {
  count?: number;
}

export function ResortGridSkeleton({ count = 6 }: ResortGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ResortCardSkeleton key={i} />
      ))}
    </div>
  );
}
