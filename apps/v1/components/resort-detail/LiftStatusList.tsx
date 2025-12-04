'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getLiftStatusStyle } from '@/lib/types/liftie';
import type { LiftStatus } from '@/lib/types/liftie';

interface LiftStatusListProps {
  liftsStatus: Record<string, LiftStatus>;
  className?: string;
  defaultExpanded?: boolean;
  maxVisibleWhenCollapsed?: number;
}

type SortMode = 'status' | 'name';

export function LiftStatusList({
  liftsStatus,
  className,
  defaultExpanded = false,
  maxVisibleWhenCollapsed = 6,
}: LiftStatusListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [sortMode, setSortMode] = useState<SortMode>('status');

  // Convert to array and sort
  const sortedLifts = useMemo(() => {
    const lifts = Object.entries(liftsStatus).map(([name, status]) => ({
      name,
      status,
    }));

    if (sortMode === 'status') {
      // Sort by status: open first, then hold, scheduled, closed
      const statusOrder: Record<LiftStatus, number> = {
        open: 0,
        hold: 1,
        scheduled: 2,
        closed: 3,
      };
      return lifts.sort((a, b) => {
        const orderDiff = statusOrder[a.status] - statusOrder[b.status];
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });
    }

    // Sort alphabetically
    return lifts.sort((a, b) => a.name.localeCompare(b.name));
  }, [liftsStatus, sortMode]);

  const totalLifts = sortedLifts.length;
  const shouldShowExpand = totalLifts > maxVisibleWhenCollapsed;
  const visibleLifts = isExpanded ? sortedLifts : sortedLifts.slice(0, maxVisibleWhenCollapsed);

  if (totalLifts === 0) {
    return null;
  }

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Lift Status</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortMode(sortMode === 'status' ? 'name' : 'status')}
            className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
            aria-label={`Sort lifts ${sortMode === 'status' ? 'alphabetically' : 'by status'}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {sortMode === 'status' ? 'By status' : 'A-Z'}
          </button>
        </div>
      </div>

      {/* Lift list */}
      <div className="divide-y divide-neutral-100">
        {visibleLifts.map(({ name, status }) => {
          const style = getLiftStatusStyle(status);
          return (
            <div
              key={name}
              className="px-4 py-2 flex items-center justify-between hover:bg-neutral-50"
            >
              <span className="text-sm text-neutral-700 truncate pr-2">{name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn(
                  'text-xs font-medium capitalize px-2 py-0.5 rounded',
                  status === 'open' && 'bg-green-100 text-green-800',
                  status === 'hold' && 'bg-yellow-100 text-yellow-800',
                  status === 'scheduled' && 'bg-blue-100 text-blue-800',
                  status === 'closed' && 'bg-red-100 text-red-800'
                )}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/collapse button */}
      {shouldShowExpand && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-sm text-blue-600 hover:text-blue-800 hover:bg-neutral-100 flex items-center justify-center gap-1"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse lift list' : `Expand to show all ${totalLifts} lifts`}
        >
          <span>
            {isExpanded
              ? 'Show less'
              : `Show all ${totalLifts} lifts`
            }
          </span>
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
