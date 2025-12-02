import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Resorts that are currently open (from open-resorts.md)
// Normalized names for matching against database
const openResorts = [
  // Colorado
  "Arapahoe Basin",
  "Beaver Creek Resort",
  "Breckenridge Resort",
  "Copper Mountain Resort",
  "Crested Butte Mountain Resort",
  "Eldora Mountain Resort",
  "Keystone Resort",
  "Loveland Ski Area",
  "Monarch",
  "Ski Granby Ranch",
  "Ski Santa Fe", // New Mexico but listed under Colorado
  "Snowmass",
  "Solitude Ski Resort", // Utah
  "Steamboat",
  "Vail Resort",
  "Winter Park",
  "Wolf Creek",
  // California
  "Boreal Mountain Resort",
  "Heavenly",
  "Mammoth Mountain",
  "Mountain High Ski Area",
  "Mt. Baldy",
  "Mt. Rose",
  // Nevada
  "Lee Canyon",
  // Utah
  "Brighton Ski Resort",
  "Brian Head",
  // Arizona
  "Arizona Snowbowl",
  // Montana
  "Big Sky Resort",
  // Wisconsin
  "Alpine Valley Resort",
  "Pine Knob Ski Resort",
  "Trollhaugen",
  "Tyrol Basin",
  "Wild Mountain",
  // New York
  "Belleayre Mountain",
  "Gore Mountain",
  "Hunter Mountain",
  "Whiteface Mountain Resort",
  // New Hampshire
  "Bretton Woods",
  "Cannon Mountain",
  "Loon Mountain",
  "Waterville Valley",
  // Vermont
  "Jay Peak",
  "Killington",
  "Mount Snow",
  "Haystack",
  "Okemo Mountain Resort",
  "Smugglers Notch",
  "Stowe",
  "Stratton",
  "Sugarbush",
  // Maine
  "Sugarloaf",
  "Sunday River",
  // Michigan
  "Ski Mt. Holly",
  "Mt. Holly",
  "Ski Brule",
  // British Columbia
  "Whistler Blackcomb",
  // Alberta
  "Banff Sunshine",
  "Sunshine Village",
  "Lake Louise",
  "Mt. Norquay",
  "Nakiska Ski Area",
];

// Create search patterns for fuzzy matching
function normalizeForSearch(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .replace(/ski area|ski resort|resort|mountain resort|ski & summer resort/gi, "")
    .replace(/mt\./gi, "mount")
    .trim();
}

async function setOpenResorts() {
  console.log("Fetching all resorts from database...\n");

  // First, get all resorts
  const { data: allResorts, error: fetchError } = await supabase
    .from("resorts")
    .select("id, name, slug, state_slug, country_code")
    .in("country_code", ["us", "ca"]);

  if (fetchError) {
    console.error("Error fetching resorts:", fetchError);
    process.exit(1);
  }

  console.log(`Found ${allResorts?.length || 0} resorts in database\n`);

  // Match open resorts to database entries
  const matchedIds: string[] = [];
  const matchedNames: string[] = [];
  const unmatchedOpenResorts: string[] = [];

  for (const openResortName of openResorts) {
    const normalizedOpen = normalizeForSearch(openResortName);

    // Find matching resort in database
    const match = allResorts?.find(dbResort => {
      const normalizedDb = normalizeForSearch(dbResort.name);

      // Exact match after normalization
      if (normalizedDb === normalizedOpen) return true;

      // Contains match
      if (normalizedDb.includes(normalizedOpen) || normalizedOpen.includes(normalizedDb)) return true;

      // Slug-based match
      const slugNormalized = dbResort.slug.replace(/-/g, " ");
      if (slugNormalized.includes(normalizedOpen) || normalizedOpen.includes(slugNormalized)) return true;

      return false;
    });

    if (match && !matchedIds.includes(match.id)) {
      matchedIds.push(match.id);
      matchedNames.push(`${match.name} (${match.state_slug})`);
    } else if (!match) {
      unmatchedOpenResorts.push(openResortName);
    }
  }

  console.log(`Matched ${matchedIds.length} resorts to set as OPEN:\n`);
  matchedNames.forEach(name => console.log(`  ✓ ${name}`));

  if (unmatchedOpenResorts.length > 0) {
    console.log(`\nCould not match ${unmatchedOpenResorts.length} resorts:`);
    unmatchedOpenResorts.forEach(name => console.log(`  ✗ ${name}`));
  }

  // First, set ALL resorts to closed
  console.log("\n\nStep 1: Setting all resorts to closed...");
  const { error: closeError } = await supabase
    .from("resorts")
    .update({ is_open: false })
    .in("country_code", ["us", "ca"]);

  if (closeError) {
    if (closeError.code === 'PGRST204') {
      console.error("\n=== MANUAL STEP REQUIRED ===");
      console.error("The is_open column doesn't exist yet.");
      console.error("Please run this SQL in the Supabase dashboard SQL editor:\n");
      console.error("ALTER TABLE resorts ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT false;");
      console.error("\nThen run this script again.");
      process.exit(1);
    }
    console.error("Error setting resorts to closed:", closeError);
    process.exit(1);
  }

  console.log("All resorts set to closed.");

  // Then, set matched resorts to open
  console.log("\nStep 2: Setting matched resorts to open...");
  const { data: updatedResorts, error: openError } = await supabase
    .from("resorts")
    .update({ is_open: true })
    .in("id", matchedIds)
    .select("id, name");

  if (openError) {
    console.error("Error setting resorts to open:", openError);
    process.exit(1);
  }

  console.log(`\n✅ Successfully updated ${updatedResorts?.length || 0} resorts to OPEN status!`);
  process.exit(0);
}

setOpenResorts();
