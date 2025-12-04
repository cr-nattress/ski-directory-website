import { Skeleton } from '@/components/ui/Skeleton';

export function DirectoryItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          {/* Resort name */}
          <Skeleton className="h-5 w-48" />
          {/* Location */}
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Expand button */}
        <Skeleton variant="circular" className="h-8 w-8 ml-4" />
      </div>
    </div>
  );
}

export function DirectoryListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DirectoryItemSkeleton key={i} />
      ))}
    </div>
  );
}
