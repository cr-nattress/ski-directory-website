/**
 * @module Supabase
 * @purpose Supabase client initialization and GCS asset URL helpers
 * @context Database access and image/asset URL construction
 *
 * @exports
 * - supabase: Client-side Supabase client (uses anon key, respects RLS)
 * - createServerClient: Server-side client factory (uses service role key)
 * - GCS URL helpers: getCardImageUrl, getHeroImageUrl, getTrailMapUrl
 *
 * @dependencies
 * - NEXT_PUBLIC_SUPABASE_URL (required)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (required)
 * - SUPABASE_SERVICE_ROLE_KEY (optional, for server-side)
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "@/lib/config/env";

/**
 * Create Supabase client lazily to avoid build-time errors
 * when env vars aren't available during static generation
 */
let _supabase: SupabaseClient<Database> | null = null;

/**
 * Supabase client for client-side usage
 * Uses the anon key which respects Row Level Security
 */
export const supabase: SupabaseClient<Database> = (() => {
  // Return existing client if already created
  if (_supabase) return _supabase;

  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  // Validate required env vars
  if (!url || !anonKey) {
    // During build/SSG, env vars may not be available - create a dummy client
    // that will be replaced at runtime
    if (typeof window === 'undefined') {
      // Server-side during build - return a placeholder
      return createClient<Database>(
        'https://placeholder.supabase.co',
        'placeholder-key'
      );
    }
    throw new Error(
      'Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  _supabase = createClient<Database>(url, anonKey);
  return _supabase;
})();

/**
 * Create a Supabase client for server-side usage
 * This should only be used in server components or API routes
 */
export function createServerClient() {
  const serviceRoleKey = env.supabase.serviceRoleKey;

  if (!serviceRoleKey) {
    // Fall back to anon key if service role not available
    return supabase;
  }

  return createClient<Database>(env.supabase.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Helper to construct GCS asset URLs from asset_path
 */
export function getAssetUrl(assetPath: string, fileName: string): string {
  return `https://storage.googleapis.com/sda-assets-prod/resorts/${assetPath}/${fileName}`;
}

/**
 * Get card image URL for a resort
 */
export function getCardImageUrl(assetPath: string): string {
  return getAssetUrl(assetPath, "images/card.png");
}

/**
 * Get hero image URL for a resort
 */
export function getHeroImageUrl(assetPath: string): string {
  return getAssetUrl(assetPath, "images/hero.jpg");
}

/**
 * Get primary image URL for a resort (Wikipedia-sourced image)
 * This is the main image uploaded by the wikipedia-updater
 */
export function getPrimaryImageUrl(assetPath: string): string {
  return getAssetUrl(assetPath, "wikipedia/primary.jpg");
}

/**
 * Get trail map URL for a resort
 */
export function getTrailMapUrl(assetPath: string): string {
  return getAssetUrl(assetPath, "trailmaps/current.jpg");
}
