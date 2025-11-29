import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Supabase client for client-side usage
 * Uses the anon key which respects Row Level Security
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client for server-side usage
 * This should only be used in server components or API routes
 */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    // Fall back to anon key if service role not available
    return supabase;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
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
  return getAssetUrl(assetPath, "images/card.jpg");
}

/**
 * Get hero image URL for a resort
 */
export function getHeroImageUrl(assetPath: string): string {
  return getAssetUrl(assetPath, "images/hero.jpg");
}

/**
 * Get trail map URL for a resort
 */
export function getTrailMapUrl(assetPath: string): string {
  return getAssetUrl(assetPath, "trailmaps/current.jpg");
}
