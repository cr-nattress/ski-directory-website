'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SocialLink, SocialTopic } from '@/lib/mock-data/social-links-types';
import {
  filterSocialLinks,
  sortSocialLinks,
  groupSocialLinksByTopic,
} from '@/lib/mock-data/social-links';
import {
  SocialLinksFilters,
  PlatformFilter,
  TopicFilter,
  RegionFilter,
} from './SocialLinksFilters';
import { SocialLinksList } from './SocialLinksList';

interface SocialLinksContentProps {
  links: SocialLink[];
}

export function SocialLinksContent({ links }: SocialLinksContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL params
  const initialPlatform = (searchParams.get('platform') as PlatformFilter) || 'all';
  const initialTopic = (searchParams.get('topic') as TopicFilter) || 'all';
  const initialRegion = (searchParams.get('region') as RegionFilter) || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(initialPlatform);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>(initialTopic);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(initialRegion);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Update URL when filters change
  const updateURL = (
    platform: PlatformFilter,
    topic: TopicFilter,
    region: RegionFilter,
    query: string
  ) => {
    const params = new URLSearchParams();
    if (platform !== 'all') params.set('platform', platform);
    if (topic !== 'all') params.set('topic', topic);
    if (region !== 'all') params.set('region', region);
    if (query) params.set('q', query);

    const queryString = params.toString();
    router.push(queryString ? `/social-links?${queryString}` : '/social-links', { scroll: false });
  };

  const handlePlatformChange = (platform: PlatformFilter) => {
    setPlatformFilter(platform);
    updateURL(platform, topicFilter, regionFilter, searchQuery);
  };

  const handleTopicChange = (topic: TopicFilter) => {
    setTopicFilter(topic);
    updateURL(platformFilter, topic, regionFilter, searchQuery);
  };

  const handleRegionChange = (region: RegionFilter) => {
    setRegionFilter(region);
    updateURL(platformFilter, topicFilter, region, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL(platformFilter, topicFilter, regionFilter, query);
  };

  // Filter and group links
  const { filteredLinks, groupedLinks, showGroupHeadings } = useMemo(() => {
    const filtered = filterSocialLinks(links, {
      platform: platformFilter !== 'all' ? platformFilter : null,
      topic: topicFilter !== 'all' ? topicFilter : null,
      region: regionFilter !== 'all' ? regionFilter : null,
      query: searchQuery || undefined,
    });

    const sorted = sortSocialLinks(filtered);
    const grouped = groupSocialLinksByTopic(sorted);

    // If a specific topic is selected, don't show group headings
    const showHeadings = topicFilter === 'all';

    return {
      filteredLinks: sorted,
      groupedLinks: grouped,
      showGroupHeadings: showHeadings,
    };
  }, [links, platformFilter, topicFilter, regionFilter, searchQuery]);

  const clearFilters = () => {
    setPlatformFilter('all');
    setTopicFilter('all');
    setRegionFilter('all');
    setSearchQuery('');
    router.push('/social-links', { scroll: false });
  };

  return (
    <div className="space-y-6">
      <SocialLinksFilters
        searchQuery={searchQuery}
        platformFilter={platformFilter}
        topicFilter={topicFilter}
        regionFilter={regionFilter}
        onSearchChange={handleSearchChange}
        onPlatformChange={handlePlatformChange}
        onTopicChange={handleTopicChange}
        onRegionChange={handleRegionChange}
        totalLinks={links.length}
        filteredCount={filteredLinks.length}
      />

      <SocialLinksList groupedLinks={groupedLinks} showGroupHeadings={showGroupHeadings} />

      {filteredLinks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No channels match your filters.</p>
          <button onClick={clearFilters} className="mt-4 text-ski-blue hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
