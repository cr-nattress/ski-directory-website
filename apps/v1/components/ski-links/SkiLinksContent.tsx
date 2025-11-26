'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SkiLink,
  SkiLinkType,
  SKI_LINK_TYPE_ORDER,
} from '@/lib/mock-data/ski-links-types';
import { filterSkiLinks, sortSkiLinks, groupSkiLinksByType } from '@/lib/mock-data/ski-links';
import {
  SkiLinksFilters,
  TypeFilter,
  RegionFilter,
  AudienceFilter,
} from './SkiLinksFilters';
import { SkiLinksList } from './SkiLinksList';

interface SkiLinksContentProps {
  links: SkiLink[];
}

export function SkiLinksContent({ links }: SkiLinksContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL params
  const initialType = (searchParams.get('type') as TypeFilter) || 'all';
  const initialRegion = (searchParams.get('region') as RegionFilter) || 'all';
  const initialAudience = (searchParams.get('audience') as AudienceFilter) || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(initialRegion);
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>(initialAudience);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Update URL when filters change
  const updateURL = (
    type: TypeFilter,
    region: RegionFilter,
    audience: AudienceFilter,
    query: string
  ) => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (region !== 'all') params.set('region', region);
    if (audience !== 'all') params.set('audience', audience);
    if (query) params.set('q', query);

    const queryString = params.toString();
    router.push(queryString ? `/ski-links?${queryString}` : '/ski-links', { scroll: false });
  };

  const handleTypeChange = (type: TypeFilter) => {
    setTypeFilter(type);
    updateURL(type, regionFilter, audienceFilter, searchQuery);
  };

  const handleRegionChange = (region: RegionFilter) => {
    setRegionFilter(region);
    updateURL(typeFilter, region, audienceFilter, searchQuery);
  };

  const handleAudienceChange = (audience: AudienceFilter) => {
    setAudienceFilter(audience);
    updateURL(typeFilter, regionFilter, audience, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL(typeFilter, regionFilter, audienceFilter, query);
  };

  // Filter and group links
  const { filteredLinks, groupedLinks, showGroupHeadings } = useMemo(() => {
    const filtered = filterSkiLinks(links, {
      type: typeFilter !== 'all' ? typeFilter : null,
      region: regionFilter !== 'all' ? regionFilter : null,
      audience: audienceFilter !== 'all' ? audienceFilter : null,
      query: searchQuery || undefined,
    });

    const sorted = sortSkiLinks(filtered);
    const grouped = groupSkiLinksByType(sorted);

    // If a specific type is selected, don't show group headings
    const showHeadings = typeFilter === 'all';

    return {
      filteredLinks: sorted,
      groupedLinks: grouped,
      showGroupHeadings: showHeadings,
    };
  }, [links, typeFilter, regionFilter, audienceFilter, searchQuery]);

  const clearFilters = () => {
    setTypeFilter('all');
    setRegionFilter('all');
    setAudienceFilter('all');
    setSearchQuery('');
    router.push('/ski-links', { scroll: false });
  };

  return (
    <div className="space-y-6">
      <SkiLinksFilters
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        regionFilter={regionFilter}
        audienceFilter={audienceFilter}
        onSearchChange={handleSearchChange}
        onTypeChange={handleTypeChange}
        onRegionChange={handleRegionChange}
        onAudienceChange={handleAudienceChange}
        totalLinks={links.length}
        filteredCount={filteredLinks.length}
      />

      <SkiLinksList groupedLinks={groupedLinks} showGroupHeadings={showGroupHeadings} />

      {filteredLinks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No links match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-ski-blue hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
