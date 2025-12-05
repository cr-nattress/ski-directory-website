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

export type PassFilter = 'all' | 'epic' | 'ikon' | 'indy' | 'mountain-collective' | 'powder-alliance' | 'ny-ski3' | 'rcr-rockies' | 'lest-go' | 'local';
export type StatusFilter = 'all' | 'open' | 'closed';

interface StateOption {
  code: string;
  name: string;
}

interface CountryOption {
  code: string;
  name: string;
}

interface RegionOption {
  slug: string;
  name: string;
}

interface DirectoryFiltersProps {
  sortBy: SortOption;
  passFilter: PassFilter;
  statusFilter: StatusFilter;
  stateFilter: string;
  countryFilter: string;
  regionFilter: string;
  onSortChange: (sort: SortOption) => void;
  onPassFilterChange: (pass: PassFilter) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onStateFilterChange: (state: string) => void;
  onCountryFilterChange: (country: string) => void;
  onRegionFilterChange: (region: string) => void;
  totalResorts: number;
  filteredCount: number;
  availableStates: StateOption[];
  availableCountries: CountryOption[];
  availableRegions: RegionOption[];
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
  { value: 'distance', label: 'Nearest' },
];

const passOptions: { value: PassFilter; label: string }[] = [
  { value: 'all', label: 'All Passes' },
  { value: 'epic', label: 'Epic Pass' },
  { value: 'ikon', label: 'Ikon Pass' },
  { value: 'indy', label: 'Indy Pass' },
  { value: 'mountain-collective', label: 'Mountain Collective' },
  { value: 'powder-alliance', label: 'Powder Alliance' },
  { value: 'ny-ski3', label: 'NY SKI3' },
  { value: 'rcr-rockies', label: 'RCR Rockies' },
  { value: 'lest-go', label: "L'EST GO" },
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
  stateFilter,
  countryFilter,
  regionFilter,
  onSortChange,
  onPassFilterChange,
  onStatusFilterChange,
  onStateFilterChange,
  onCountryFilterChange,
  onRegionFilterChange,
  totalResorts,
  filteredCount,
  availableStates,
  availableCountries,
  availableRegions,
}: DirectoryFiltersProps) {
  // Only show country filter if there are multiple countries
  const showCountryFilter = availableCountries.length > 1;

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

        {/* Country Filter Dropdown - Only show if multiple countries */}
        {showCountryFilter && (
          <div className="relative">
            <label htmlFor="country-select" className="sr-only">
              Filter by country
            </label>
            <select
              id="country-select"
              value={countryFilter}
              onChange={(e) => onCountryFilterChange(e.target.value)}
              className={cn(
                'appearance-none bg-white border border-gray-300 rounded-lg',
                'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
                'cursor-pointer hover:border-gray-400 transition-colors',
                countryFilter && 'border-ski-blue bg-ski-blue/5'
              )}
            >
              <option value="">All Countries</option>
              {availableCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        )}

        {/* Region Filter Dropdown */}
        <div className="relative">
          <label htmlFor="region-select" className="sr-only">
            Filter by region
          </label>
          <select
            id="region-select"
            value={regionFilter}
            onChange={(e) => onRegionFilterChange(e.target.value)}
            className={cn(
              'appearance-none bg-white border border-gray-300 rounded-lg',
              'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
              'cursor-pointer hover:border-gray-400 transition-colors',
              regionFilter && 'border-ski-blue bg-ski-blue/5'
            )}
          >
            <option value="">All Regions</option>
            {availableRegions.map((region) => (
              <option key={region.slug} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* State Filter Dropdown */}
        <div className="relative">
          <label htmlFor="state-select" className="sr-only">
            Filter by state
          </label>
          <select
            id="state-select"
            value={stateFilter}
            onChange={(e) => onStateFilterChange(e.target.value)}
            className={cn(
              'appearance-none bg-white border border-gray-300 rounded-lg',
              'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
              'cursor-pointer hover:border-gray-400 transition-colors',
              stateFilter && 'border-ski-blue bg-ski-blue/5'
            )}
          >
            <option value="">All States</option>
            {availableStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
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
