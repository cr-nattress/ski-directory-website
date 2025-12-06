/**
 * Formatting utility functions
 * Number, distance, rating, and snowfall formatters
 */

/** Format number with locale-appropriate separators */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/** Format snowfall in inches (e.g., '6" new' or 'No new snow') */
export function formatSnowfall(inches: number): string {
  if (inches === 0) return 'No new snow';
  return `${inches}" new`;
}

/** Format distance in miles (e.g., '75 mi') */
export function formatDistance(miles: number): string {
  return `${miles} mi`;
}

/** Format rating to one decimal place (e.g., '4.5') */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
