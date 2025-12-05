/**
 * Service for fetching ski shop data from GCS
 * Provides server-side data access with caching
 */

import {
  SkiShopsData,
  SkiShop,
  ShopType,
  sortShopsByProximity,
} from '@/lib/types/ski-shop';

const GCS_BUCKET = 'sda-assets-prod';
const GCS_BASE_URL = `https://storage.googleapis.com/${GCS_BUCKET}`;

// In-memory cache for server-side rendering
const cache = new Map<string, { data: SkiShopsData | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch ski shops data from GCS for a resort
 *
 * @param assetPath - Resort's asset path (e.g., "us/colorado/vail")
 * @returns SkiShopsData or null if not found/error
 */
export async function getSkiShopsFromGCS(
  assetPath: string | null | undefined
): Promise<SkiShopsData | null> {
  if (!assetPath) {
    return null;
  }

  // Check cache
  const cacheKey = assetPath;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `${GCS_BASE_URL}/resorts/${assetPath}/ski-shops.json`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Next.js cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No ski shops data for this resort - cache the null result
        cache.set(cacheKey, { data: null, timestamp: Date.now() });
        return null;
      }
      throw new Error(`GCS fetch failed: ${response.status}`);
    }

    const data: SkiShopsData = await response.json();

    // Sort shops by proximity before caching
    data.shops = sortShopsByProximity(data.shops);

    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    console.error(`Failed to fetch ski shops for ${assetPath}:`, error);
    // Cache the failure to avoid repeated requests
    cache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  }
}

/**
 * Get just the shops array for a resort (convenience function)
 */
export async function getSkiShops(
  assetPath: string | null | undefined
): Promise<SkiShop[]> {
  const data = await getSkiShopsFromGCS(assetPath);
  return data?.shops || [];
}

/**
 * Get ski shops count for a resort (for stat cards)
 */
export async function getSkiShopsCount(
  assetPath: string | null | undefined
): Promise<number> {
  const data = await getSkiShopsFromGCS(assetPath);
  return data?.statistics?.shops_valid || 0;
}

/**
 * Check if resort has ski shops data
 */
export async function hasSkiShops(
  assetPath: string | null | undefined
): Promise<boolean> {
  const data = await getSkiShopsFromGCS(assetPath);
  return (data?.shops?.length || 0) > 0;
}

/**
 * Get on-mountain shops only
 */
export async function getOnMountainShops(
  assetPath: string | null | undefined
): Promise<SkiShop[]> {
  const shops = await getSkiShops(assetPath);
  return shops.filter((shop) => shop.is_on_mountain);
}

/**
 * Get shops by type
 */
export async function getShopsByType(
  assetPath: string | null | undefined,
  type: ShopType
): Promise<SkiShop[]> {
  const shops = await getSkiShops(assetPath);
  return shops.filter((shop) => shop.shop_type.includes(type));
}
