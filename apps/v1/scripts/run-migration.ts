/**
 * Run Database Migration
 *
 * This script executes the full schema migration against Supabase.
 * It reads the SQL file and executes it via the Supabase client.
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing environment variables!");
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log("Starting database migration...\n");

  // Read the SQL file
  const sqlPath = path.join(__dirname, "../supabase/migrations/20251128_000_full_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("Executing schema migration...");

  // Execute via RPC (need to create a function first) or use direct connection
  // For now, we'll split and run individual statements

  // Split SQL into statements (simplified - doesn't handle all cases)
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement || statement.startsWith("--")) continue;

    try {
      // Use the rpc method with a raw SQL executor if available,
      // otherwise we need to use the REST API directly
      const { error } = await supabase.rpc("exec_sql", { sql: statement });

      if (error) {
        // If exec_sql doesn't exist, try direct execution
        console.log(`  Statement: ${statement.substring(0, 50)}...`);
        console.log(`  Error: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.log(`  Error executing: ${statement.substring(0, 50)}...`);
      errorCount++;
    }
  }

  console.log(`\nMigration complete: ${successCount} successful, ${errorCount} errors`);
  console.log("\nNote: If errors occurred, please run the migration manually:");
  console.log("1. Go to https://supabase.com/dashboard/project/pczgfwlaywxbvgvvtafo/sql");
  console.log("2. Copy and paste the contents of:");
  console.log("   apps/v1/supabase/migrations/20251128_000_full_schema.sql");
  console.log("3. Click 'Run' to execute the migration");
}

runMigration().catch(console.error);
