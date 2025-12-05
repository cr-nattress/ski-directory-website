/**
 * Calculate distance between two coordinates using the Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if coordinates are within a reasonable range for North America
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  // North America bounds (roughly)
  const isValidLat = lat >= 24 && lat <= 72;
  const isValidLng = lng >= -170 && lng <= -50;
  return isValidLat && isValidLng;
}

/**
 * Determine if a shop is "on mountain" based on distance from resort
 * @param distanceMiles Distance from resort in miles
 * @returns true if distance is less than 1 mile
 */
export function isOnMountain(distanceMiles: number): boolean {
  return distanceMiles < 1;
}
