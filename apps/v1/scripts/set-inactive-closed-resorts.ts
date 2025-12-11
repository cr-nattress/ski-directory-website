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

/**
 * Sets all resorts that are not open (is_open = false) to is_visible = false.
 *
 * This hides seasonally closed resorts from listings without marking them as
 * defunct/lost. The is_visible column controls whether a resort appears in
 * the main listings while preserving its active/defunct status.
 */
async function setInvisibleClosedResorts() {
  console.log("Checking if is_visible column exists...\n");

  // Test if is_visible column exists by trying to query it
  const { error: testError } = await supabase
    .from("resorts")
    .select("is_visible")
    .limit(1);

  if (testError && testError.message.includes("is_visible")) {
    console.log("The is_visible column doesn't exist yet.");
    console.log("\n=== MANUAL STEP REQUIRED ===");
    console.log("Please run this SQL in the Supabase dashboard SQL editor:\n");
    console.log("ALTER TABLE resorts ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;");
    console.log("\nThen run this script again.");
    process.exit(1);
  }

  console.log("Fetching resorts that are not open...\n");

  // Get all resorts that are not open and currently visible
  const { data: closedResorts, error: fetchError } = await supabase
    .from("resorts")
    .select("id, name, slug, state_slug, is_open, is_visible")
    .eq("is_open", false)
    .eq("is_visible", true);

  if (fetchError) {
    console.error("Error fetching resorts:", fetchError);
    process.exit(1);
  }

  if (!closedResorts || closedResorts.length === 0) {
    console.log("No closed resorts that are visible found. Nothing to update.");
    process.exit(0);
  }

  console.log(`Found ${closedResorts.length} closed resorts that are currently visible:\n`);
  closedResorts.slice(0, 30).forEach(resort => {
    console.log(`  - ${resort.name} (${resort.state_slug})`);
  });
  if (closedResorts.length > 30) {
    console.log(`  ... and ${closedResorts.length - 30} more`);
  }

  // Update is_visible to false for closed resorts
  console.log("\nSetting closed resorts to is_visible = false...");

  const resortIds = closedResorts.map(r => r.id);

  const { data: updatedResorts, error: updateError } = await supabase
    .from("resorts")
    .update({ is_visible: false })
    .in("id", resortIds)
    .select("id, name, state_slug, is_visible");

  if (updateError) {
    console.error("Error updating resorts:", updateError);
    process.exit(1);
  }

  console.log(`\n✅ Successfully set ${updatedResorts?.length || 0} resorts to is_visible = false!`);

  if (updatedResorts && updatedResorts.length > 0) {
    console.log("\nUpdated resorts (first 20):");
    updatedResorts.slice(0, 20).forEach(resort => {
      console.log(`  ✓ ${resort.name} (${resort.state_slug}) - is_visible: ${resort.is_visible}`);
    });
    if (updatedResorts.length > 20) {
      console.log(`  ... and ${updatedResorts.length - 20} more`);
    }
  }

  process.exit(0);
}

setInvisibleClosedResorts();
