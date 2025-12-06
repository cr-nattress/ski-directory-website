'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SocialLink, SocialTopic } from '@/lib/types/social-links';
import {
  filterSocialLinks,
  sortSocialLinks,
  groupSocialLinksByTopic,
} from '@/lib/data/social-links';
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

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(initialPlatform);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>(initialTopic);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(initialRegion);

  // Update URL when filters change
  const updateURL = (
    platform: PlatformFilter,
    topic: TopicFilter,
    region: RegionFilter
  ) => {
    const params = new URLSearchParams();
    if (platform !== 'all') params.set('platform', platform);
    if (topic !== 'all') params.set('topic', topic);
    if (region !== 'all') params.set('region', region);

    const queryString = params.toString();
    router.push(queryString ? `/social?${queryString}` : '/social', { scroll: false });
  };

  const handlePlatformChange = (platform: PlatformFilter) => {
    setPlatformFilter(platform);
    updateURL(platform, topicFilter, regionFilter);
  };

  const handleTopicChange = (topic: TopicFilter) => {
    setTopicFilter(topic);
    updateURL(platformFilter, topic, regionFilter);
  };

  const handleRegionChange = (region: RegionFilter) => {
    setRegionFilter(region);
    updateURL(platformFilter, topicFilter, region);
  };

  // Filter and group links
  const { filteredLinks, groupedLinks, showGroupHeadings } = useMemo(() => {
    const filtered = filterSocialLinks(links, {
      platform: platformFilter !== 'all' ? platformFilter : null,
      topic: topicFilter !== 'all' ? topicFilter : null,
      region: regionFilter !== 'all' ? regionFilter : null,
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
  }, [links, platformFilter, topicFilter, regionFilter]);

  const clearFilters = () => {
    setPlatformFilter('all');
    setTopicFilter('all');
    setRegionFilter('all');
    router.push('/social', { scroll: false });
  };

  return (
    <div className="space-y-6">
      <SocialLinksFilters
        platformFilter={platformFilter}
        topicFilter={topicFilter}
        regionFilter={regionFilter}
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
