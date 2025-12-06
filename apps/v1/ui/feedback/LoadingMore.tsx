'use client';

import { cn } from '@shared/utils';

interface LoadingMoreProps {
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Total items loaded so far */
  loadedCount: number;
  /** Total items available */
  totalCount: number;
  /** Optional class name */
  className?: string;
}

/**
 * Loading indicator for infinite scroll
 *
 * Shows:
 * - Spinner when loading more items
 * - "All loaded" message when no more items
 * - Nothing when idle and more items available
 */
export function LoadingMore({
  isLoading,
  hasMore,
  loadedCount,
  totalCount,
  className,
}: LoadingMoreProps) {
  // Loading more spinner
  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <div className="flex items-center gap-3 text-gray-600">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading more resorts...</span>
        </div>
      </div>
    );
  }

  // All items loaded
  if (!hasMore && loadedCount > 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500 text-sm">
          You&apos;ve viewed all {totalCount} resort{totalCount !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  // Idle state - render nothing (sentinel will be below)
  return null;
}
