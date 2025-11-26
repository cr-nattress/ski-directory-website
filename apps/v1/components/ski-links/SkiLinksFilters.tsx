'use client';

import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SkiLinkType,
  SkiLinkRegion,
  SkiLinkAudience,
  SKI_LINK_TYPE_LABELS,
  SKI_LINK_REGION_LABELS,
  SKI_LINK_AUDIENCE_LABELS,
} from '@/lib/mock-data/ski-links-types';

export type TypeFilter = SkiLinkType | 'all';
export type RegionFilter = SkiLinkRegion | 'all';
export type AudienceFilter = SkiLinkAudience | 'all';

interface SkiLinksFiltersProps {
  searchQuery: string;
  typeFilter: TypeFilter;
  regionFilter: RegionFilter;
  audienceFilter: AudienceFilter;
  onSearchChange: (query: string) => void;
  onTypeChange: (type: TypeFilter) => void;
  onRegionChange: (region: RegionFilter) => void;
  onAudienceChange: (audience: AudienceFilter) => void;
  totalLinks: number;
  filteredCount: number;
}

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'resort', label: 'Resort & Mountain Sites' },
  { value: 'snow-weather', label: 'Snow Reports & Weather' },
  { value: 'webcam-trailmap', label: 'Webcams & Trail Maps' },
  { value: 'trip-planning', label: 'Trip Planning & Lodging' },
  { value: 'gear-reviews', label: 'Gear & Reviews' },
  { value: 'education', label: 'Lessons, Safety & Education' },
  { value: 'community', label: 'Communities & Forums' },
  { value: 'news', label: 'News & Editorial' },
];

const regionOptions: { value: RegionFilter; label: string }[] = [
  { value: 'all', label: 'All Regions' },
  { value: 'colorado', label: 'Colorado' },
  { value: 'us', label: 'United States' },
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'japan', label: 'Japan' },
  { value: 'global', label: 'Global' },
];

const audienceOptions: { value: AudienceFilter; label: string }[] = [
  { value: 'all', label: 'All Audiences' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'family', label: 'Family' },
  { value: 'backcountry', label: 'Backcountry' },
  { value: 'park', label: 'Park & Freestyle' },
];

export function SkiLinksFilters({
  searchQuery,
  typeFilter,
  regionFilter,
  audienceFilter,
  onSearchChange,
  onTypeChange,
  onRegionChange,
  onAudienceChange,
  totalLinks,
  filteredCount,
}: SkiLinksFiltersProps) {
  const hasActiveFilters =
    searchQuery || typeFilter !== 'all' || regionFilter !== 'all' || audienceFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onRegionChange('all');
    onAudienceChange('all');
  };

  return (
    <div className="space-y-4 pb-4 border-b border-gray-200">
      {/* Search bar */}
      <div className="relative max-w-md">
        <label htmlFor="link-search" className="sr-only">
          Search links
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="link-search"
          type="text"
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
            'placeholder:text-gray-400'
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="relative">
            <label htmlFor="type-select" className="sr-only">
              Filter by type
            </label>
            <select
              id="type-select"
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value as TypeFilter)}
              className={cn(
                'appearance-none bg-white border border-gray-300 rounded-lg',
                'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
                'cursor-pointer hover:border-gray-400 transition-colors',
                typeFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
              )}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Region Filter */}
          <div className="relative">
            <label htmlFor="region-select" className="sr-only">
              Filter by region
            </label>
            <select
              id="region-select"
              value={regionFilter}
              onChange={(e) => onRegionChange(e.target.value as RegionFilter)}
              className={cn(
                'appearance-none bg-white border border-gray-300 rounded-lg',
                'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
                'cursor-pointer hover:border-gray-400 transition-colors',
                regionFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
              )}
            >
              {regionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Audience Filter */}
          <div className="relative">
            <label htmlFor="audience-select" className="sr-only">
              Filter by audience
            </label>
            <select
              id="audience-select"
              value={audienceFilter}
              onChange={(e) => onAudienceChange(e.target.value as AudienceFilter)}
              className={cn(
                'appearance-none bg-white border border-gray-300 rounded-lg',
                'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
                'cursor-pointer hover:border-gray-400 transition-colors',
                audienceFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
              )}
            >
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-ski-blue hover:text-ski-blue/80 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Link count */}
        <div className="text-sm text-gray-500" role="status" aria-live="polite">
          {filteredCount === totalLinks ? (
            <span>Showing all {totalLinks} links</span>
          ) : (
            <span>
              Showing {filteredCount} of {totalLinks} links
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
