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
 * Supabase client singleton
 * Uses lazy initialization to handle both SSR and client-side usage
 */
let _supabase: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client (creates one if needed)
 * Works on both server and client side
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase;

  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  _supabase = createClient<Database>(url, anonKey);
  return _supabase;
}

/**
 * Supabase client for general usage
 * Uses the anon key which respects Row Level Security
 */
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient<Database>];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

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
