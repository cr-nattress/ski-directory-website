import { Resort, PassAffiliation } from './types';
import resortsData from './resorts_rows.json';

// Raw JSON structure from database
interface RawResort {
  id: string;
  slug: string;
  name: string;
  type: 'area' | 'resort';
  country_code: string;
  region: string;
  nearest_town: string;
  latitude: number;
  longitude: number;
  elevation_base_m: number;
  elevation_top_m: number;
  runs_count: number;
  lifts_count: number;
  is_active: boolean;
  website_url: string;
}

// Helper to determine pass affiliations based on resort name
function getPassAffiliations(name: string, slug: string): PassAffiliation[] {
  const nameLower = name.toLowerCase();
  const slugLower = slug.toLowerCase();

  // Epic Pass resorts
  if (
    slugLower.includes('vail') ||
    slugLower.includes('breckenridge') ||
    slugLower.includes('keystone') ||
    slugLower.includes('beaver-creek') ||
    slugLower.includes('crested-butte')
  ) {
    return ['epic'];
  }

  // Ikon Pass resorts
  if (
    slugLower.includes('aspen') ||
    slugLower.includes('snowmass') ||
    slugLower.includes('steamboat') ||
    slugLower.includes('winter-park') ||
    slugLower.includes('copper') ||
    slugLower.includes('eldora') ||
    slugLower.includes('arapahoe') ||
    slugLower.includes('telluride')
  ) {
    return ['ikon'];
  }

  // Indy Pass resorts
  if (
    slugLower.includes('monarch') ||
    slugLower.includes('powderhorn') ||
    slugLower.includes('hesperus') ||
    slugLower.includes('sunlight')
  ) {
    return ['indy'];
  }

  // Default to local
  return ['local'];
}

// Helper to generate terrain breakdown based on runs count
function getTerrainBreakdown(runsCount: number, type: string): Resort['terrain'] {
  if (type === 'area' || runsCount < 30) {
    // Smaller areas tend to be beginner-friendly
    return { beginner: 30, intermediate: 50, advanced: 15, expert: 5 };
  } else if (runsCount < 80) {
    // Medium resorts
    return { beginner: 15, intermediate: 40, advanced: 30, expert: 15 };
  } else {
    // Large resorts with diverse terrain
    return { beginner: 18, intermediate: 32, advanced: 30, expert: 20 };
  }
}

// Seeded random number generator for consistent server/client rendering
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Helper to generate mock conditions
function generateConditions(runsCount: number, seed: number) {
  const baseSnowfall = Math.floor(seededRandom(seed) * 20) + 5; // 5-25 inches
  return {
    snowfall24h: baseSnowfall,
    snowfall72h: baseSnowfall + Math.floor(seededRandom(seed + 1) * 15) + 5,
    baseDepth: Math.floor(seededRandom(seed + 2) * 50) + 60, // 60-110 inches
    terrainOpen: Math.floor(seededRandom(seed + 3) * 25) + 75, // 75-100%
    liftsOpen: Math.floor(runsCount * 0.7), // Approximate lifts open
    status: 'open' as const,
  };
}

// Helper to generate rating and review count
function generateRating(runsCount: number, type: string, seed: number) {
  // Larger resorts tend to have more reviews
  const baseReviews = type === 'resort' ? 500 : 100;
  const reviewMultiplier = Math.floor(runsCount / 20);

  return {
    rating: 4.3 + seededRandom(seed) * 0.6, // 4.3-4.9
    reviewCount: baseReviews + (reviewMultiplier * 100) + Math.floor(seededRandom(seed + 1) * 500),
  };
}

// Helper to get features based on resort characteristics
function getFeatures(runsCount: number, elevationTop: number): Resort['features'] {
  return {
    hasPark: runsCount > 50,
    hasHalfpipe: runsCount > 100,
    hasNightSkiing: runsCount < 30, // Smaller areas often have night skiing
    hasBackcountryAccess: elevationTop > 3500,
    hasSpaVillage: runsCount > 150,
  };
}

// Helper to get tags
function getTags(name: string, slug: string, runsCount: number, type: string, passAffiliations: PassAffiliation[]): string[] {
  const tags: string[] = [];

  // Size
  if (runsCount > 150) tags.push('large');
  else if (runsCount > 80) tags.push('medium');
  else tags.push('small');

  // Type
  if (type === 'resort') tags.push('destination');

  // Pass
  passAffiliations.forEach(pass => tags.push(`${pass}-pass`));

  // Special characteristics
  if (slug.includes('wolf-creek')) tags.push('most-snow');
  if (slug.includes('silverton')) tags.push('expert', 'guided-only');
  if (slug.includes('loveland') || slug.includes('arapahoe') || slug.includes('echo')) {
    tags.push('near-denver');
  }
  if (runsCount < 40) tags.push('family-friendly');
  if (slug.includes('aspen')) tags.push('luxury');

  return tags;
}

// Helper to calculate distance from Denver (approximate based on location)
function getDistanceFromDenver(lat: number, lng: number): { distance: number; driveTime: number } {
  // Denver coordinates
  const denverLat = 39.7392;
  const denverLng = -104.9903;

  // Rough distance calculation (not accurate, just for mock data)
  const latDiff = Math.abs(lat - denverLat);
  const lngDiff = Math.abs(lng - denverLng);
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Miles per degree

  // Estimate drive time (assuming 50-60 mph average with mountain roads)
  const driveTime = Math.floor(distance * 1.3); // Add 30% for mountain driving

  return {
    distance: Math.floor(distance),
    driveTime: Math.floor(driveTime),
  };
}

// Helper to get hero image URL
function getHeroImage(slug: string, idx: number): string {
  // Using Lorem Picsum for reliable placeholder images
  // Each resort gets a consistent image based on its index
  // Image IDs chosen to provide variety and mountain-like landscapes
  const imageIds = [237, 251, 433, 582, 659, 783, 839, 1015, 1036, 1074];

  const imageId = imageIds[idx % imageIds.length];
  return `https://picsum.photos/id/${imageId}/800/600`;
}

// Convert raw resort to our Resort type
function transformResort(raw: RawResort, idx: number): Resort {
  const passAffiliations = getPassAffiliations(raw.name, raw.slug);
  const { distance, driveTime } = getDistanceFromDenver(raw.latitude, raw.longitude);
  const terrain = getTerrainBreakdown(raw.runs_count, raw.type);
  const conditions = generateConditions(raw.runs_count, idx * 100);
  const { rating, reviewCount } = generateRating(raw.runs_count, raw.type, idx * 100 + 50);
  const features = getFeatures(raw.runs_count, raw.elevation_top_m);
  const tags = getTags(raw.name, raw.slug, raw.runs_count, raw.type, passAffiliations);

  // Calculate vertical drop
  const verticalDrop = Math.floor((raw.elevation_top_m - raw.elevation_base_m) * 3.28084); // meters to feet

  // Generate tagline
  const taglines: Record<string, string> = {
    'vail': 'Legendary Back Bowls and upscale village charm',
    'breckenridge': 'Five peaks of adventure above a historic mining town',
    'aspen-snowmass': 'Four mountains, one unforgettable experience',
    'steamboat': 'Ski Town USA with legendary Champagne Powder',
    'telluride': "The most beautiful place you'll ever ski",
    'winter-park': "Denver's favorite mountain",
    'arapahoe-basin': 'The Legend - High altitude expert terrain',
    'loveland': 'High and dry - closest to Denver',
    'copper-mountain': 'Naturally divided terrain for every ability',
    'keystone': 'Night skiing and family adventure',
  };

  const tagline = taglines[raw.slug] || `${raw.runs_count} runs across ${Math.floor(verticalDrop / 1000)}k+ vertical feet`;

  return {
    id: `resort:${raw.slug}`,
    slug: raw.slug,
    name: raw.name,
    tagline,
    description: `${raw.name} offers ${raw.runs_count} runs serviced by ${raw.lifts_count} lifts near ${raw.nearest_town}, Colorado.`,
    location: {
      lat: raw.latitude,
      lng: raw.longitude,
    },
    nearestCity: raw.nearest_town,
    distanceFromDenver: distance,
    driveTimeFromDenver: driveTime,
    stats: {
      skiableAcres: Math.floor(raw.runs_count * 15), // Approximate
      liftsCount: raw.lifts_count,
      runsCount: raw.runs_count,
      verticalDrop,
      baseElevation: Math.floor(raw.elevation_base_m * 3.28084),
      summitElevation: Math.floor(raw.elevation_top_m * 3.28084),
      avgAnnualSnowfall: Math.floor(seededRandom(idx * 100 + 75) * 150) + 250, // 250-400 inches
    },
    terrain,
    conditions,
    passAffiliations,
    rating: Number(rating.toFixed(1)),
    reviewCount,
    heroImage: getHeroImage(raw.slug, idx),
    features,
    tags,
    isActive: true,
    isLost: false,
  };
}

// Transform all resorts
export const allColoradoResorts: Resort[] = (resortsData as RawResort[])
  .filter(resort => resort.is_active)
  .map((resort, idx) => transformResort(resort, idx))
  .sort((a, b) => a.name.localeCompare(b.name));

// Export count
export const totalColoradoResorts = allColoradoResorts.length;
