/**
 * Resort Data Migration Script
 *
 * Migrates resort data from GCS (resort.json files) to Supabase.
 *
 * Prerequisites:
 *   1. Run the schema migration first (20251128_000_full_schema.sql)
 *   2. Set environment variables in .env.local
 *   3. Have Google Cloud credentials configured (gcloud auth application-default login)
 *
 * Usage:
 *   npx tsx scripts/migrate-resorts.ts
 *
 * Options:
 *   --dry-run    Show what would be migrated without making changes
 *   --state=XX   Only migrate resorts from a specific state (e.g., --state=colorado)
 *   --limit=N    Limit number of resorts to migrate
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Load environment variables
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GCS_BUCKET = "sda-assets-prod";
const GCS_BASE_URL = `https://storage.googleapis.com/${GCS_BUCKET}`;

// ============================================================================
// Types
// ============================================================================

interface ResortJson {
  id: string;
  slug: string;
  name: string;
  country: "us" | "ca";
  countryName: string;
  state: string;
  stateName: string;
  status: "active" | "defunct";
  isActive: boolean;
  isLost: boolean;
  location?: { lat: number; lng: number };
  nearestCity?: string;
  stats?: {
    skiableAcres?: number;
    liftsCount?: number;
    runsCount?: number;
    verticalDrop?: number;
    baseElevation?: number;
    summitElevation?: number;
    avgAnnualSnowfall?: number;
  };
  terrain?: {
    beginner?: number;
    intermediate?: number;
    advanced?: number;
    expert?: number;
  };
  features?: {
    hasPark?: boolean;
    hasHalfpipe?: boolean;
    hasNightSkiing?: boolean;
    hasBackcountryAccess?: boolean;
    hasSpaVillage?: boolean;
  };
  passAffiliations: string[];
  websiteUrl?: string;
  description?: string;
  tags: string[];
  assetLocation: {
    country: string;
    state: string;
    slug: string;
  };
  lastUpdated: string;
}

interface MigrationStats {
  statesProcessed: number;
  statesInserted: number;
  resortsProcessed: number;
  resortsInserted: number;
  resortsUpdated: number;
  passesInserted: number;
  tagsInserted: number;
  errors: string[];
}

// ============================================================================
// State/Province Data
// ============================================================================

const US_STATES: Record<string, { name: string; abbr: string }> = {
  alaska: { name: "Alaska", abbr: "AK" },
  arizona: { name: "Arizona", abbr: "AZ" },
  california: { name: "California", abbr: "CA" },
  colorado: { name: "Colorado", abbr: "CO" },
  connecticut: { name: "Connecticut", abbr: "CT" },
  idaho: { name: "Idaho", abbr: "ID" },
  illinois: { name: "Illinois", abbr: "IL" },
  indiana: { name: "Indiana", abbr: "IN" },
  iowa: { name: "Iowa", abbr: "IA" },
  maine: { name: "Maine", abbr: "ME" },
  maryland: { name: "Maryland", abbr: "MD" },
  massachusetts: { name: "Massachusetts", abbr: "MA" },
  michigan: { name: "Michigan", abbr: "MI" },
  minnesota: { name: "Minnesota", abbr: "MN" },
  missouri: { name: "Missouri", abbr: "MO" },
  montana: { name: "Montana", abbr: "MT" },
  nevada: { name: "Nevada", abbr: "NV" },
  "new-hampshire": { name: "New Hampshire", abbr: "NH" },
  "new-jersey": { name: "New Jersey", abbr: "NJ" },
  "new-mexico": { name: "New Mexico", abbr: "NM" },
  "new-york": { name: "New York", abbr: "NY" },
  "north-carolina": { name: "North Carolina", abbr: "NC" },
  "north-dakota": { name: "North Dakota", abbr: "ND" },
  ohio: { name: "Ohio", abbr: "OH" },
  oregon: { name: "Oregon", abbr: "OR" },
  pennsylvania: { name: "Pennsylvania", abbr: "PA" },
  "rhode-island": { name: "Rhode Island", abbr: "RI" },
  "south-dakota": { name: "South Dakota", abbr: "SD" },
  tennessee: { name: "Tennessee", abbr: "TN" },
  utah: { name: "Utah", abbr: "UT" },
  vermont: { name: "Vermont", abbr: "VT" },
  virginia: { name: "Virginia", abbr: "VA" },
  washington: { name: "Washington", abbr: "WA" },
  "west-virginia": { name: "West Virginia", abbr: "WV" },
  wisconsin: { name: "Wisconsin", abbr: "WI" },
  wyoming: { name: "Wyoming", abbr: "WY" },
};

const CA_PROVINCES: Record<string, { name: string; abbr: string }> = {
  alberta: { name: "Alberta", abbr: "AB" },
  "british-columbia": { name: "British Columbia", abbr: "BC" },
  manitoba: { name: "Manitoba", abbr: "MB" },
  "new-brunswick": { name: "New Brunswick", abbr: "NB" },
  "newfoundland-and-labrador": { name: "Newfoundland and Labrador", abbr: "NL" },
  "nova-scotia": { name: "Nova Scotia", abbr: "NS" },
  ontario: { name: "Ontario", abbr: "ON" },
  "prince-edward-island": { name: "Prince Edward Island", abbr: "PE" },
  quebec: { name: "Quebec", abbr: "QC" },
  saskatchewan: { name: "Saskatchewan", abbr: "SK" },
  yukon: { name: "Yukon", abbr: "YT" },
  "northwest-territories": { name: "Northwest Territories", abbr: "NT" },
};

// ============================================================================
// Helper Functions
// ============================================================================

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function listGcsFolder(prefix: string): Promise<string[]> {
  // Use GCS JSON API to list objects
  const url = `https://storage.googleapis.com/storage/v1/b/${GCS_BUCKET}/o?prefix=${encodeURIComponent(prefix)}&delimiter=/`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to list ${prefix}: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { prefixes?: string[] };
    return data.prefixes || [];
  } catch (err) {
    console.error(`Error listing ${prefix}:`, err);
    return [];
  }
}

function formatLocation(lat: number, lng: number): string {
  return `POINT(${lng} ${lat})`;
}

// ============================================================================
// Migration Functions
// ============================================================================

async function ensureStatesExist(
  supabase: SupabaseClient,
  stats: MigrationStats,
  dryRun: boolean
): Promise<void> {
  console.log("\n📍 Ensuring states exist...");

  // Get list of states from GCS
  const usStates = await listGcsFolder("resorts/us/");
  const caProvinces = await listGcsFolder("resorts/ca/");

  const statesToInsert: { slug: string; country_code: string; name: string; abbreviation: string }[] = [];

  // Process US states
  for (const statePrefix of usStates) {
    const slug = statePrefix.replace("resorts/us/", "").replace("/", "");
    const stateInfo = US_STATES[slug];
    if (stateInfo) {
      statesToInsert.push({
        slug,
        country_code: "us",
        name: stateInfo.name,
        abbreviation: stateInfo.abbr,
      });
    } else {
      // Try to generate name from slug
      const name = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      statesToInsert.push({
        slug,
        country_code: "us",
        name,
        abbreviation: "",
      });
    }
  }

  // Process Canadian provinces
  for (const provPrefix of caProvinces) {
    const slug = provPrefix.replace("resorts/ca/", "").replace("/", "");
    const provInfo = CA_PROVINCES[slug];
    if (provInfo) {
      statesToInsert.push({
        slug,
        country_code: "ca",
        name: provInfo.name,
        abbreviation: provInfo.abbr,
      });
    } else {
      const name = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      statesToInsert.push({
        slug,
        country_code: "ca",
        name,
        abbreviation: "",
      });
    }
  }

  stats.statesProcessed = statesToInsert.length;
  console.log(`  Found ${statesToInsert.length} states/provinces`);

  if (dryRun) {
    console.log("  [DRY RUN] Would insert states:", statesToInsert.map((s) => s.slug).join(", "));
    return;
  }

  // Upsert states
  const { error } = await supabase.from("states").upsert(statesToInsert, {
    onConflict: "slug",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("  Error inserting states:", error.message);
    stats.errors.push(`States: ${error.message}`);
  } else {
    stats.statesInserted = statesToInsert.length;
    console.log(`  ✅ Inserted/updated ${statesToInsert.length} states`);
  }
}

async function migrateResort(
  supabase: SupabaseClient,
  resort: ResortJson,
  stats: MigrationStats,
  dryRun: boolean
): Promise<void> {
  stats.resortsProcessed++;

  // Transform to database format
  const dbResort = {
    id: resort.id,
    slug: resort.slug,
    name: resort.name,
    country_code: resort.country,
    state_slug: resort.state,
    status: resort.status,
    location: resort.location ? formatLocation(resort.location.lat, resort.location.lng) : null,
    nearest_city: resort.nearestCity || null,
    website_url: resort.websiteUrl || null,
    description: resort.description || null,
    stats: resort.stats || {},
    terrain: resort.terrain || {},
    features: resort.features || {},
    asset_path: `${resort.country}/${resort.state}/${resort.slug}`,
  };

  if (dryRun) {
    console.log(`    [DRY RUN] Would upsert: ${resort.name}`);
    return;
  }

  // Upsert resort
  const { error: resortError } = await supabase.from("resorts").upsert(dbResort, {
    onConflict: "id",
  });

  if (resortError) {
    console.error(`    ❌ Error inserting ${resort.name}: ${resortError.message}`);
    stats.errors.push(`${resort.slug}: ${resortError.message}`);
    return;
  }

  stats.resortsInserted++;

  // Insert pass affiliations
  if (resort.passAffiliations && resort.passAffiliations.length > 0) {
    const passRecords = resort.passAffiliations.map((pass) => ({
      resort_id: resort.id,
      pass_slug: pass,
    }));

    // Delete existing passes first
    await supabase.from("resort_passes").delete().eq("resort_id", resort.id);

    const { error: passError } = await supabase.from("resort_passes").insert(passRecords);

    if (passError) {
      // Might fail if pass doesn't exist in pass_programs
      console.warn(`    ⚠️ Pass error for ${resort.slug}: ${passError.message}`);
    } else {
      stats.passesInserted += passRecords.length;
    }
  }

  // Insert tags
  if (resort.tags && resort.tags.length > 0) {
    const tagRecords = resort.tags.map((tag) => ({
      resort_id: resort.id,
      tag,
    }));

    // Delete existing tags first
    await supabase.from("resort_tags").delete().eq("resort_id", resort.id);

    const { error: tagError } = await supabase.from("resort_tags").insert(tagRecords);

    if (tagError) {
      console.warn(`    ⚠️ Tag error for ${resort.slug}: ${tagError.message}`);
    } else {
      stats.tagsInserted += tagRecords.length;
    }
  }
}

async function migrateState(
  supabase: SupabaseClient,
  country: string,
  state: string,
  stats: MigrationStats,
  dryRun: boolean,
  limit?: number
): Promise<void> {
  console.log(`\n  📂 ${country.toUpperCase()}/${state}`);

  // List resort folders in this state
  const prefix = `resorts/${country}/${state}/`;
  const resortFolders = await listGcsFolder(prefix);

  let processed = 0;
  for (const folder of resortFolders) {
    if (limit && processed >= limit) break;

    const slug = folder.replace(prefix, "").replace("/", "");
    const resortJsonUrl = `${GCS_BASE_URL}/${prefix}${slug}/resort.json`;

    const resort = await fetchJson<ResortJson>(resortJsonUrl);
    if (!resort) {
      console.log(`    ⚠️ No resort.json for ${slug}`);
      continue;
    }

    await migrateResort(supabase, resort, stats, dryRun);
    processed++;

    // Progress indicator
    if (processed % 10 === 0) {
      console.log(`    ... processed ${processed} resorts`);
    }
  }

  console.log(`    ✅ Processed ${processed} resorts in ${state}`);
}

async function runMigration(options: {
  dryRun: boolean;
  stateFilter?: string;
  limit?: number;
}): Promise<void> {
  console.log("🎿 Resort Data Migration");
  console.log("========================");
  console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  if (options.stateFilter) console.log(`State filter: ${options.stateFilter}`);
  if (options.limit) console.log(`Limit: ${options.limit} resorts per state`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("\n❌ Missing environment variables!");
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stats: MigrationStats = {
    statesProcessed: 0,
    statesInserted: 0,
    resortsProcessed: 0,
    resortsInserted: 0,
    resortsUpdated: 0,
    passesInserted: 0,
    tagsInserted: 0,
    errors: [],
  };

  // Step 1: Ensure states exist
  await ensureStatesExist(supabase, stats, options.dryRun);

  // Step 2: Get list of countries and states
  console.log("\n🏔️ Migrating resorts...");

  const countries = ["us", "ca"];
  for (const country of countries) {
    const stateFolders = await listGcsFolder(`resorts/${country}/`);

    for (const stateFolder of stateFolders) {
      const state = stateFolder.replace(`resorts/${country}/`, "").replace("/", "");

      // Apply state filter if provided
      if (options.stateFilter && state !== options.stateFilter) {
        continue;
      }

      await migrateState(supabase, country, state, stats, options.dryRun, options.limit);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary");
  console.log("=".repeat(50));
  console.log(`States processed:  ${stats.statesProcessed}`);
  console.log(`States inserted:   ${stats.statesInserted}`);
  console.log(`Resorts processed: ${stats.resortsProcessed}`);
  console.log(`Resorts inserted:  ${stats.resortsInserted}`);
  console.log(`Passes linked:     ${stats.passesInserted}`);
  console.log(`Tags added:        ${stats.tagsInserted}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more`);
    }
  }

  console.log("\n✅ Migration complete!");
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const stateArg = args.find((a) => a.startsWith("--state="));
const limitArg = args.find((a) => a.startsWith("--limit="));

const stateFilter = stateArg?.split("=")[1];
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;

runMigration({ dryRun, stateFilter, limit }).catch(console.error);
