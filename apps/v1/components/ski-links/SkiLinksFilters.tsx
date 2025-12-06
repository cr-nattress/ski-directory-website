'use client';

import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SkiLinkType,
  SkiLinkRegion,
  SkiLinkAudience,
  SKI_LINK_TYPE_LABELS,
  SKI_LINK_REGION_LABELS,
  SKI_LINK_AUDIENCE_LABELS,
} from '@/lib/types/ski-links';

export type TypeFilter = SkiLinkType | 'all';
export type RegionFilter = SkiLinkRegion | 'all';
export type AudienceFilter = SkiLinkAudience | 'all';

interface SkiLinksFiltersProps {
  typeFilter: TypeFilter;
  regionFilter: RegionFilter;
  audienceFilter: AudienceFilter;
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
  typeFilter,
  regionFilter,
  audienceFilter,
  onTypeChange,
  onRegionChange,
  onAudienceChange,
  totalLinks,
  filteredCount,
}: SkiLinksFiltersProps) {
  const hasActiveFilters =
    typeFilter !== 'all' || regionFilter !== 'all' || audienceFilter !== 'all';

  const clearFilters = () => {
    onTypeChange('all');
    onRegionChange('all');
    onAudienceChange('all');
  };

  return (
    <div className="pb-4 border-b border-gray-200">
      {/* Filter dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full sm:w-auto">
          {/* Type Filter */}
          <div className="relative w-full sm:w-auto">
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
                'w-full sm:w-auto',
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
          <div className="relative w-full sm:w-auto">
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
                'w-full sm:w-auto',
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
          <div className="relative w-full sm:w-auto">
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
                'w-full sm:w-auto',
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
              className="text-sm text-ski-blue hover:text-ski-blue/80 font-medium flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start"
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
