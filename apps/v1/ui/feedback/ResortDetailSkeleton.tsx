'use client';

import { Skeleton } from '@ui/primitives';

export function ResortDetailSkeleton() {
  return (
    <div className="container-custom py-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-10 w-64" />

      {/* Tagline */}
      <Skeleton className="h-6 w-96 max-w-full" />

      {/* Pass chips and quick stats */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-24 rounded" />
      </div>

      {/* Terrain distribution */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Elevation */}
      <Skeleton className="h-4 w-48" />

      {/* Photo gallery */}
      <Skeleton className="h-64 sm:h-80 w-full rounded-xl" />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
