'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption =
  | 'name'
  | 'name-desc'
  | 'snow'
  | 'base'
  | 'terrain'
  | 'acres'
  | 'vertical'
  | 'rating'
  | 'distance';

export type PassFilter = 'all' | 'epic' | 'ikon' | 'indy' | 'local';
export type StatusFilter = 'all' | 'open' | 'closed';

interface DirectoryFiltersProps {
  sortBy: SortOption;
  passFilter: PassFilter;
  statusFilter: StatusFilter;
  onSortChange: (sort: SortOption) => void;
  onPassFilterChange: (pass: PassFilter) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  totalResorts: number;
  filteredCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'snow', label: 'Most Snow (24h)' },
  { value: 'base', label: 'Deepest Base' },
  { value: 'terrain', label: 'Most Terrain Open' },
  { value: 'acres', label: 'Largest Resort' },
  { value: 'vertical', label: 'Most Vertical' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest to Denver' },
];

const passOptions: { value: PassFilter; label: string }[] = [
  { value: 'all', label: 'All Passes' },
  { value: 'epic', label: 'Epic Pass' },
  { value: 'ikon', label: 'Ikon Pass' },
  { value: 'indy', label: 'Indy Pass' },
  { value: 'local', label: 'Local/Independent' },
];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open Only' },
  { value: 'closed', label: 'Closed Only' },
];

export function DirectoryFilters({
  sortBy,
  passFilter,
  statusFilter,
  onSortChange,
  onPassFilterChange,
  onStatusFilterChange,
  totalResorts,
  filteredCount,
}: DirectoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <label htmlFor="sort-select" className="sr-only">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={cn(
              'appearance-none bg-white border border-gray-300 rounded-lg',
              'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
              'cursor-pointer hover:border-gray-400 transition-colors'
            )}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Pass Filter Dropdown */}
        <div className="relative">
          <label htmlFor="pass-select" className="sr-only">
            Filter by pass
          </label>
          <select
            id="pass-select"
            value={passFilter}
            onChange={(e) => onPassFilterChange(e.target.value as PassFilter)}
            className={cn(
              'appearance-none bg-white border border-gray-300 rounded-lg',
              'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
              'cursor-pointer hover:border-gray-400 transition-colors',
              passFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
            )}
          >
            {passOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <label htmlFor="status-select" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className={cn(
              'appearance-none bg-white border border-gray-300 rounded-lg',
              'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
              'cursor-pointer hover:border-gray-400 transition-colors',
              statusFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
            )}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Resort count */}
      <div className="text-sm text-gray-500">
        {filteredCount === totalResorts ? (
          <span>Showing all {totalResorts} resorts</span>
        ) : (
          <span>
            Showing {filteredCount} of {totalResorts} resorts
          </span>
        )}
      </div>
    </div>
  );
}
