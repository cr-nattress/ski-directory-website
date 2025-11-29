/**
 * Verify Database Schema
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verify() {
  console.log("Verifying Supabase schema...\n");
  console.log("URL:", SUPABASE_URL);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check countries
  const { data: countries, error: e1 } = await supabase.from("countries").select("*");
  console.log("✓ Countries:", countries?.length ?? 0, "rows", e1 ? `(Error: ${e1.message})` : "");

  // Check pass_programs
  const { data: passes, error: e2 } = await supabase.from("pass_programs").select("*");
  console.log("✓ Pass Programs:", passes?.length ?? 0, "rows", e2 ? `(Error: ${e2.message})` : "");

  // Check states (may be empty)
  const { count: stateCount, error: e3 } = await supabase
    .from("states")
    .select("*", { count: "exact", head: true });
  console.log("✓ States:", stateCount ?? 0, "rows", e3 ? `(Error: ${e3.message})` : "");

  // Check resorts (may be empty)
  const { count: resortCount, error: e4 } = await supabase
    .from("resorts")
    .select("*", { count: "exact", head: true });
  console.log("✓ Resorts:", resortCount ?? 0, "rows", e4 ? `(Error: ${e4.message})` : "");

  if (countries && countries.length > 0 && passes && passes.length > 0) {
    console.log("\n✅ Schema verified! Ready for data migration.");
    console.log("\nRun: npm run db:migrate");
  } else {
    console.log("\n❌ Schema not found. Please run the migration SQL first.");
  }
}

verify().catch(console.error);
