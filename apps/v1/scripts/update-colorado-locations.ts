/**
 * Script to update Colorado resort locations in Supabase
 *
 * The Colorado resorts were migrated without location data.
 * This script updates them with coordinates from the mock data.
 *
 * Usage: npx tsx scripts/update-colorado-locations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Colorado resort coordinates from mock data
const coloradoResortLocations: Record<string, { lat: number; lng: number }> = {
  'vail': { lat: 39.6061, lng: -106.3550 },
  'breckenridge': { lat: 39.4817, lng: -106.0384 },
  'snowmass': { lat: 39.2091, lng: -106.9461 },
  'aspen-highlands': { lat: 39.1869, lng: -106.8181 },
  'aspen-mountain': { lat: 39.1811, lng: -106.8578 },
  'buttermilk': { lat: 39.2069, lng: -106.8628 },
  'steamboat': { lat: 40.4850, lng: -106.8317 },
  'keystone': { lat: 39.6425, lng: -105.8719 },
  'arapahoe-basin': { lat: 39.6804, lng: -105.8978 },
  'copper-mountain': { lat: 39.5019, lng: -106.1503 },
  'winter-park': { lat: 39.8868, lng: -105.7625 },
  'loveland': { lat: 39.6800, lng: -105.8978 },
  'eldora': { lat: 39.9372, lng: -105.5828 },
  'telluride': { lat: 37.9375, lng: -107.8123 },
  'crested-butte': { lat: 38.8986, lng: -106.9653 },
  'monarch': { lat: 38.5122, lng: -106.3322 },
  'purgatory': { lat: 37.6303, lng: -107.8139 },
  'wolf-creek': { lat: 37.4736, lng: -106.7936 },
  'silverton': { lat: 37.8853, lng: -107.6644 },
  'ski-cooper': { lat: 39.3614, lng: -106.3047 },
  'powderhorn': { lat: 39.0694, lng: -108.1508 },
  'sunlight': { lat: 39.3992, lng: -107.3392 },
  'howelsen-hill': { lat: 40.4847, lng: -106.8342 },
  'echo-mountain': { lat: 39.6847, lng: -105.5281 },
  'kendall-mountain': { lat: 37.8119, lng: -107.6642 },
  'hesperus': { lat: 37.3017, lng: -108.0550 },
  'granby-ranch': { lat: 40.0408, lng: -105.9117 },
  'ski-granby-ranch': { lat: 40.0408, lng: -105.9117 },
  'beaver-creek': { lat: 39.6042, lng: -106.5164 },
  // Lost/closed resorts
  'berthoud-pass': { lat: 39.7986, lng: -105.7778 },
  'geneva-basin': { lat: 39.5833, lng: -105.7500 },
  'hidden-valley': { lat: 40.3939, lng: -105.6514 },
  'conquistador': { lat: 38.9500, lng: -105.1833 },
  'cuchara': { lat: 37.3500, lng: -105.1000 },
  'ski-broadmoor': { lat: 38.7833, lng: -104.8500 },
  'arrowhead': { lat: 39.6250, lng: -106.5250 },
  'pike-peak': { lat: 38.8403, lng: -105.0422 },
  'chapman-hill-ski-area': { lat: 37.2750, lng: -107.8750 },
  'lake-eldora': { lat: 39.9372, lng: -105.5828 },
  'sharktooth': { lat: 37.9667, lng: -107.5833 },
  'stoner': { lat: 37.6167, lng: -108.4500 },
  'williams-pass': { lat: 38.5333, lng: -106.3500 },
  'climax': { lat: 39.3833, lng: -106.1833 },
};

async function updateColoradoLocations() {
  console.log('Starting Colorado location updates...\n');

  let updated = 0;
  let failed = 0;
  let notFound = 0;

  for (const [slug, location] of Object.entries(coloradoResortLocations)) {
    try {
      // Use ST_SetSRID and ST_MakePoint for proper PostGIS insertion
      const { data, error } = await supabase.rpc('update_resort_location', {
        resort_slug: slug,
        lat: location.lat,
        lng: location.lng,
      });

      if (error) {
        // Try direct update with raw SQL point format
        const pointWkt = `SRID=4326;POINT(${location.lng} ${location.lat})`;
        const { error: updateError } = await supabase
          .from('resorts')
          .update({ location: pointWkt } as any)
          .eq('slug', slug)
          .eq('state_slug', 'colorado');

        if (updateError) {
          console.log(`  ❌ ${slug}: ${updateError.message}`);
          failed++;
        } else {
          console.log(`  ✓ ${slug}: Updated via direct SQL`);
          updated++;
        }
      } else {
        console.log(`  ✓ ${slug}: Updated via RPC`);
        updated++;
      }
    } catch (err) {
      console.log(`  ❌ ${slug}: ${err}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Not found: ${notFound}`);
  console.log(`========================================`);
}

updateColoradoLocations().catch(console.error);
