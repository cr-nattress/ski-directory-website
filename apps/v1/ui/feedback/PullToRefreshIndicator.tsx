'use client';

import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@shared/utils';

interface PullToRefreshIndicatorProps {
  pullProgress: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

export function PullToRefreshIndicator({
  pullProgress,
  isRefreshing,
  isPulling,
}: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center py-4 transition-transform"
      style={{
        transform: `translateY(${Math.min(pullProgress * 60, 60)}px)`,
      }}
    >
      {isRefreshing ? (
        <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
      ) : (
        <div
          className={cn(
            'transition-transform duration-200',
            pullProgress >= 1 && 'rotate-180'
          )}
        >
          <ArrowDown
            className="w-6 h-6 text-gray-400"
            style={{ opacity: pullProgress }}
          />
        </div>
      )}
    </div>
  );
}
