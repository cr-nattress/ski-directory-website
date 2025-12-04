import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");

// Construct the direct postgres connection string
// Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const connectionString = `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function addIsOpenColumn() {
  console.log("Adding is_open column and setting all resorts to closed...");

  let sql: ReturnType<typeof postgres> | null = null;

  try {
    sql = postgres(connectionString, { ssl: 'require' });

    // Add the column
    await sql`ALTER TABLE resorts ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT false`;
    console.log("Added is_open column");

    // Set all resorts to closed
    const result = await sql`UPDATE resorts SET is_open = false WHERE country_code IN ('us', 'ca') RETURNING id, name`;
    console.log(`Updated ${result.length} resorts to closed status`);

  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error("Error:", err.message);

    if (err.code === '42701') {
      console.log("Column already exists, proceeding with update...");

      // Try just the update
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data, error: updateError } = await supabase
        .from("resorts")
        .update({ is_open: false })
        .in("country_code", ["us", "ca"])
        .select("id, name");

      if (updateError) {
        console.error("Update error:", updateError);
      } else {
        console.log(`Updated ${data?.length || 0} resorts to closed status`);
      }
    } else {
      console.log("\n=== MANUAL STEP REQUIRED ===");
      console.log("Please run this SQL in the Supabase dashboard SQL editor:");
      console.log("\nALTER TABLE resorts ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT false;");
      console.log("UPDATE resorts SET is_open = false WHERE country_code IN ('us', 'ca');");
    }
  } finally {
    if (sql) await sql.end();
    process.exit(0);
  }
}

addIsOpenColumn();
