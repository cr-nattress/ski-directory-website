import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Adding tagline column...');

  // Add tagline column
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE resorts ADD COLUMN IF NOT EXISTS tagline TEXT;'
  });

  if (alterError) {
    console.log('Note: Direct SQL execution may not be available, trying alternative approach...');

    // Try updating a record to see if tagline column exists
    const { data, error: testError } = await supabase
      .from('resorts')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error:', testError);
      return;
    }

    console.log('Note: tagline column needs to be added manually in Supabase dashboard');
    console.log('SQL to run:');
    console.log(`
ALTER TABLE resorts ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Then recreate the view:
CREATE OR REPLACE VIEW resorts_full AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.tagline,
  r.description,
  r.website_url,
  r.nearest_city,
  r.status,
  r.is_active,
  r.is_lost,
  r.asset_path,
  r.stats,
  r.terrain,
  r.features,
  r.created_at,
  r.updated_at,
  s.slug AS state,
  s.name AS state_name,
  c.code AS country,
  c.name AS country_name,
  ST_Y(r.location::geometry) AS lat,
  ST_X(r.location::geometry) AS lng
FROM resorts r
JOIN states s ON r.state_slug = s.slug
JOIN countries c ON r.country_code = c.code;
`);
  } else {
    console.log('Migration completed successfully!');
  }
}

runMigration();
