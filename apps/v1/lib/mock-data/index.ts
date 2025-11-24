export * from './types';
export * from './categories';
export * from './articles';

// Use real Colorado resorts data with weather and enhanced features
import { mockResorts as resortsData } from './resorts';
import { Resort } from './types';

// Export all resorts
export const mockResorts = resortsData;

export function getResortBySlug(slug: string): Resort | undefined {
  return mockResorts.find((resort) => resort.slug === slug);
}

export function filterResorts(
  resorts: Resort[],
  filters: {
    category?: string;
    search?: string;
    maxDistance?: number;
    passAffiliation?: string[];
  }
): Resort[] {
  let filtered = [...resorts];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (resort) =>
        resort.name.toLowerCase().includes(query) ||
        resort.description.toLowerCase().includes(query) ||
        resort.nearestCity.toLowerCase().includes(query)
    );
  }

  if (filters.maxDistance) {
    filtered = filtered.filter(
      (resort) => resort.distanceFromDenver <= filters.maxDistance!
    );
  }

  if (filters.passAffiliation && filters.passAffiliation.length > 0) {
    filtered = filtered.filter((resort) =>
      filters.passAffiliation!.some((pass) =>
        resort.passAffiliations.includes(pass as any)
      )
    );
  }

  return filtered;
}

export function sortResorts(
  resorts: Resort[],
  sortBy: 'distance' | 'rating' | 'snow' | 'name' = 'name'
): Resort[] {
  const sorted = [...resorts];

  switch (sortBy) {
    case 'distance':
      return sorted.sort((a, b) => a.distanceFromDenver - b.distanceFromDenver);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'snow':
      return sorted.sort(
        (a, b) => b.conditions.snowfall24h - a.conditions.snowfall24h
      );
    case 'name':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Regional stats
export function getRegionalStats() {
  const totalResorts = mockResorts.length;
  const openResorts = mockResorts.filter(
    (r) => r.conditions.status === 'open'
  ).length;
  const avgSnowfall24h =
    mockResorts.reduce((sum, r) => sum + r.conditions.snowfall24h, 0) /
    totalResorts;
  const avgSnowfall =
    mockResorts.reduce((sum, r) => sum + r.stats.avgAnnualSnowfall, 0) /
    totalResorts;

  return {
    totalResorts,
    openResorts,
    avgSnowfall24h: Math.round(avgSnowfall24h),
    avgAnnualSnowfall: Math.round(avgSnowfall),
  };
}
