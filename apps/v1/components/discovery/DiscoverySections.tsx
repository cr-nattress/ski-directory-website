'use client';

import { useThemedResorts, THEMED_SECTIONS } from '@shared/api';
import { ResortRow, ResortRowSkeleton } from './ResortRow';

/**
 * Netflix-style discovery sections for the landing page.
 *
 * Renders themed horizontal scrolling rows:
 * - Top Destinations
 * - Hidden Gems
 * - Night Skiing & Terrain Parks
 * - Powder & Steeps
 * - Lost Ski Areas
 *
 * Each section only renders if it has resorts to show.
 */
export function DiscoverySections() {
  const { sections, isLoading, error } = useThemedResorts();

  // Loading state - show skeletons
  if (isLoading) {
    return (
      <div className="space-y-2">
        <ResortRowSkeleton />
        <ResortRowSkeleton />
        <ResortRowSkeleton />
      </div>
    );
  }

  // Error state - fail silently, don't block the page
  if (error) {
    console.error('DiscoverySections error:', error);
    return null;
  }

  // No sections data
  if (!sections) {
    console.warn('DiscoverySections: sections is null/undefined');
    return null;
  }

  // Debug: log section counts
  console.log('DiscoverySections loaded:', {
    topDestinations: sections.topDestinations?.length ?? 0,
    hiddenGems: sections.hiddenGems?.length ?? 0,
    nightAndPark: sections.nightAndPark?.length ?? 0,
    powderAndSteeps: sections.powderAndSteeps?.length ?? 0,
    lostSkiAreas: sections.lostSkiAreas?.length ?? 0,
  });

  const sectionConfig = THEMED_SECTIONS;

  return (
    <div className="space-y-2">
      {/* Top Destinations */}
      {sections.topDestinations.length > 0 && (
        <ResortRow
          title={sectionConfig[0].title}
          icon={sectionConfig[0].icon}
          resorts={sections.topDestinations}
        />
      )}

      {/* Hidden Gems */}
      {sections.hiddenGems.length > 0 && (
        <ResortRow
          title={sectionConfig[1].title}
          icon={sectionConfig[1].icon}
          resorts={sections.hiddenGems}
        />
      )}

      {/* Night Skiing & Terrain Parks */}
      {sections.nightAndPark.length > 0 && (
        <ResortRow
          title={sectionConfig[2].title}
          icon={sectionConfig[2].icon}
          resorts={sections.nightAndPark}
        />
      )}

      {/* Powder & Steeps */}
      {sections.powderAndSteeps.length > 0 && (
        <ResortRow
          title={sectionConfig[3].title}
          icon={sectionConfig[3].icon}
          resorts={sections.powderAndSteeps}
        />
      )}

      {/* Lost Ski Areas - hidden for now */}
      {/* {sections.lostSkiAreas.length > 0 && (
        <ResortRow
          title={sectionConfig[4].title}
          icon={sectionConfig[4].icon}
          resorts={sections.lostSkiAreas}
        />
      )} */}
    </div>
  );
}
