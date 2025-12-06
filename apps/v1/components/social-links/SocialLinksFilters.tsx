'use client';

import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SocialPlatform,
  SocialTopic,
  SocialRegion,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_TOPIC_LABELS,
  SOCIAL_REGION_LABELS,
} from '@/lib/types/social-links';

export type PlatformFilter = SocialPlatform | 'all';
export type TopicFilter = SocialTopic | 'all';
export type RegionFilter = SocialRegion | 'all';

interface SocialLinksFiltersProps {
  platformFilter: PlatformFilter;
  topicFilter: TopicFilter;
  regionFilter: RegionFilter;
  onPlatformChange: (platform: PlatformFilter) => void;
  onTopicChange: (topic: TopicFilter) => void;
  onRegionChange: (region: RegionFilter) => void;
  totalLinks: number;
  filteredCount: number;
}

const platformOptions: { value: PlatformFilter; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'discord', label: 'Discord' },
  { value: 'forum', label: 'Forums' },
];

const topicOptions: { value: TopicFilter; label: string }[] = [
  { value: 'all', label: 'All Topics' },
  { value: 'instruction', label: 'Instruction & Technique' },
  { value: 'trip-vlog', label: 'Trip Reports & Vlogs' },
  { value: 'gear', label: 'Gear & Reviews' },
  { value: 'resort-official', label: 'Resort & Official' },
  { value: 'backcountry', label: 'Backcountry & Touring' },
  { value: 'safety', label: 'Safety & Education' },
  { value: 'news', label: 'News & Commentary' },
  { value: 'meme', label: 'Memes & Culture' },
  { value: 'park', label: 'Park & Freestyle' },
  { value: 'race', label: 'Racing' },
  { value: 'family', label: 'Family & Kids' },
  { value: 'beginner-focus', label: 'Beginner Focused' },
  { value: 'community', label: 'Communities & Groups' },
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

export function SocialLinksFilters({
  platformFilter,
  topicFilter,
  regionFilter,
  onPlatformChange,
  onTopicChange,
  onRegionChange,
  totalLinks,
  filteredCount,
}: SocialLinksFiltersProps) {
  const hasActiveFilters =
    platformFilter !== 'all' ||
    topicFilter !== 'all' ||
    regionFilter !== 'all';

  const clearFilters = () => {
    onPlatformChange('all');
    onTopicChange('all');
    onRegionChange('all');
  };

  return (
    <div className="pb-4 border-b border-gray-200">
      {/* Filter dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full sm:w-auto">
          {/* Platform Filter */}
          <div className="relative w-full sm:w-auto">
            <label htmlFor="platform-select" className="sr-only">
              Filter by platform
            </label>
            <select
              id="platform-select"
              value={platformFilter}
              onChange={(e) => onPlatformChange(e.target.value as PlatformFilter)}
              className={cn(
                'appearance-none bg-white border border-gray-300 rounded-lg',
                'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
                'cursor-pointer hover:border-gray-400 transition-colors',
                'w-full sm:w-auto',
                platformFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
              )}
            >
              {platformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Topic Filter */}
          <div className="relative w-full sm:w-auto">
            <label htmlFor="topic-select" className="sr-only">
              Filter by topic
            </label>
            <select
              id="topic-select"
              value={topicFilter}
              onChange={(e) => onTopicChange(e.target.value as TopicFilter)}
              className={cn(
                'appearance-none bg-white border border-gray-300 rounded-lg',
                'pl-3 pr-10 py-2 text-sm font-medium text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:border-ski-blue',
                'cursor-pointer hover:border-gray-400 transition-colors',
                'w-full sm:w-auto',
                topicFilter !== 'all' && 'border-ski-blue bg-ski-blue/5'
              )}
            >
              {topicOptions.map((option) => (
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

        {/* Channel count */}
        <div className="text-sm text-gray-500" role="status" aria-live="polite">
          {filteredCount === totalLinks ? (
            <span>Showing all {totalLinks} channels</span>
          ) : (
            <span>
              Showing {filteredCount} of {totalLinks} channels
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
