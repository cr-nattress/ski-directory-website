/**
 * @module SupabaseResortAdapter
 * @purpose Convert between Supabase database types and frontend Resort types
 * @context Data transformation layer between database and UI
 *
 * @pattern Adapter - Transforms ResortFull (DB) → Resort (Frontend)
 *
 * @decision
 * Keep database types (snake_case) separate from frontend types (camelCase)
 * to allow independent evolution and maintain backward compatibility.
 *
 * @assumes
 * - ResortFull matches the `resorts_full` view in Supabase
 * - GCS asset paths are structured as: resorts/{country}/{state}/{slug}/
 * - Wikipedia-sourced images are preferred for hero/card display
 */

import type { ResortFull } from "@/types/supabase";
import type { Resort, ResortImage, PassAffiliation } from "@/lib/types";
import { getTrailMapUrl, getPrimaryImageUrl } from "@/lib/supabase";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/resort-images";

/**
 * Convert a Supabase ResortFull record to the frontend Resort type
 *
 * @param supabaseResort - Raw database record from `resorts_full` view
 * @returns Resort object ready for UI consumption
 *
 * @decision
 * - Default ratings to 4.5/100 reviews until user ratings are implemented
 * - Use PLACEHOLDER_IMAGE when no GCS assets exist
 * - Map `is_open` boolean to 'open'/'closed' status enum
 */
export function adaptResortFromSupabase(supabaseResort: ResortFull): Resort {
  const assetPath = supabaseResort.asset_path;

  // Build images array from GCS assets
  // Primary images are sourced from Wikipedia via the wikipedia-updater
  const images: ResortImage[] = [];

  if (assetPath) {
    // Use the Wikipedia-sourced primary image for both card and hero
    const primaryImageUrl = getPrimaryImageUrl(assetPath);

    images.push({
      url: primaryImageUrl,
      alt: `${supabaseResort.name} ski resort`,
      priority: 1,
      isCardImage: true,
      isHeroImage: true,
    });
  } else {
    // Fallback to placeholder if no asset path
    images.push({
      url: PLACEHOLDER_IMAGE,
      alt: `${supabaseResort.name} ski resort`,
      priority: 1,
      isCardImage: true,
      isHeroImage: false,
    });
  }

  // Map pass affiliations, filtering out invalid ones
  const validPasses: PassAffiliation[] = ["epic", "ikon", "indy", "local"];
  const passAffiliations = (supabaseResort.pass_affiliations || []).filter(
    (pass): pass is PassAffiliation => validPasses.includes(pass as PassAffiliation)
  );

  return {
    id: supabaseResort.id,
    slug: supabaseResort.slug,
    name: supabaseResort.name,
    tagline: supabaseResort.tagline || undefined,
    description: supabaseResort.description || "",
    isActive: supabaseResort.is_active,
    isLost: supabaseResort.is_lost,

    // Country and state codes for URL routing
    countryCode: supabaseResort.country,
    stateCode: supabaseResort.state,

    // Region information
    regionSlug: supabaseResort.region_slug || undefined,
    regionName: supabaseResort.region_name || undefined,

    // Location
    location: {
      lat: supabaseResort.lat || 0,
      lng: supabaseResort.lng || 0,
    },
    nearestCity: supabaseResort.nearest_city || "",

    // Distance from major city (dynamic based on state)
    majorCityName: supabaseResort.major_city_name || "Denver",
    distanceFromMajorCity: supabaseResort.distance_from_major_city || 0,
    driveTimeToMajorCity: supabaseResort.drive_time_to_major_city || 0,

    // Deprecated fields (kept for backward compatibility)
    distanceFromDenver: supabaseResort.distance_from_major_city || 0,
    driveTimeFromDenver: supabaseResort.drive_time_to_major_city || 0,

    // Stats from JSONB
    stats: {
      skiableAcres: supabaseResort.stats?.skiableAcres || 0,
      liftsCount: supabaseResort.stats?.liftsCount || 0,
      runsCount: supabaseResort.stats?.runsCount || 0,
      verticalDrop: supabaseResort.stats?.verticalDrop || 0,
      baseElevation: supabaseResort.stats?.baseElevation || 0,
      summitElevation: supabaseResort.stats?.summitElevation || 0,
      avgAnnualSnowfall: supabaseResort.stats?.avgAnnualSnowfall || 0,
    },

    // Terrain breakdown from JSONB
    terrain: {
      beginner: supabaseResort.terrain?.beginner || 0,
      intermediate: supabaseResort.terrain?.intermediate || 0,
      advanced: supabaseResort.terrain?.advanced || 0,
      expert: supabaseResort.terrain?.expert || 0,
    },

    // Conditions - uses is_open from database for seasonal status
    conditions: {
      snowfall24h: 0,
      snowfall72h: 0,
      baseDepth: 0,
      terrainOpen: supabaseResort.is_open ? 100 : 0,
      liftsOpen: supabaseResort.is_open ? (supabaseResort.stats?.liftsCount || 0) : 0,
      status: supabaseResort.is_open ? "open" : "closed",
    },

    // Pass information
    passAffiliations,

    // Ratings - defaults for now
    rating: 4.5,
    reviewCount: 100,

    // Images
    heroImage: assetPath ? getPrimaryImageUrl(assetPath) : PLACEHOLDER_IMAGE,
    images: images.length > 0 ? images : undefined,
    trailMapUrl: assetPath ? getTrailMapUrl(assetPath) : undefined,

    // Website
    websiteUrl: supabaseResort.website_url || undefined,

    // GCS Asset Location
    assetLocation: assetPath
      ? {
          country: supabaseResort.country,
          state: supabaseResort.state,
          slug: supabaseResort.slug,
        }
      : undefined,
    hasGcsAssets: !!assetPath,

    // Features from JSONB
    features: {
      hasPark: supabaseResort.features?.hasPark || false,
      hasHalfpipe: supabaseResort.features?.hasHalfpipe || false,
      hasNightSkiing: supabaseResort.features?.hasNightSkiing || false,
      hasBackcountryAccess: supabaseResort.features?.hasBackcountryAccess || false,
      hasSpaVillage: supabaseResort.features?.hasSpaVillage || false,
    },

    // Tags
    tags: supabaseResort.tags || [],
  };
}

/**
 * Convert an array of Supabase resorts to frontend Resort types
 */
export function adaptResortsFromSupabase(supabaseResorts: ResortFull[]): Resort[] {
  return supabaseResorts.map(adaptResortFromSupabase);
}
