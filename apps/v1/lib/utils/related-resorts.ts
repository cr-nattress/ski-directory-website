import { Resort } from '@/lib/types';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get resorts with the same pass affiliation
 */
export function getRelatedResortsByPass(
  currentResort: Resort,
  allResorts: Resort[],
  limit: number = 6
): Resort[] {
  if (currentResort.passAffiliations.length === 0) return [];

  return allResorts
    .filter(
      (r) =>
        r.id !== currentResort.id &&
        r.isActive &&
        r.passAffiliations.some((pass) =>
          currentResort.passAffiliations.includes(pass)
        )
    )
    .slice(0, limit);
}

/**
 * Get resorts in the same state
 */
export function getResortsInState(
  currentResort: Resort,
  allResorts: Resort[],
  limit: number = 6
): Resort[] {
  return allResorts
    .filter(
      (r) =>
        r.id !== currentResort.id &&
        r.isActive &&
        r.stateCode === currentResort.stateCode
    )
    .slice(0, limit);
}

/**
 * Get nearby resorts by distance
 */
export function getNearbyResorts(
  currentResort: Resort,
  allResorts: Resort[],
  maxDistanceMiles: number = 100,
  limit: number = 6
): Resort[] {
  if (!currentResort.location?.lat || !currentResort.location?.lng) {
    return [];
  }

  return allResorts
    .filter(
      (r) =>
        r.id !== currentResort.id &&
        r.isActive &&
        r.location?.lat &&
        r.location?.lng
    )
    .map((r) => ({
      resort: r,
      distance: calculateDistance(
        currentResort.location.lat,
        currentResort.location.lng,
        r.location.lat,
        r.location.lng
      ),
    }))
    .filter((r) => r.distance <= maxDistanceMiles)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((r) => r.resort);
}
