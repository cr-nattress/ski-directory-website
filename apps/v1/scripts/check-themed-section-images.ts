/**
 * Script to check which resorts in themed sections are missing images
 *
 * Run: npx ts-node --project tsconfig.json scripts/check-themed-section-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const GCS_BUCKET = 'sda-assets-prod';

interface Resort {
  id: string;
  name: string;
  slug: string;
  asset_path: string | null;
  country: string;  // column name in resorts_full view
  state: string;    // column name in resorts_full view
  ranking_score?: number;
}

/**
 * Check if an image URL exists (returns 200)
 */
async function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Get card image URL for a resort
 */
function getCardImageUrl(assetPath: string): string {
  return `https://storage.googleapis.com/${GCS_BUCKET}/resorts/${assetPath}/images/card.jpg`;
}

/**
 * Fetch resorts from a themed query
 */
async function fetchThemedResorts(queryName: string, query: any): Promise<Resort[]> {
  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching ${queryName}:`, error.message);
    return [];
  }
  return data || [];
}

async function main() {
  console.log('🎿 Checking themed section images...\n');

  // Define themed queries - use 'country' and 'state' columns from resorts_full view
  const themedQueries = {
    'Top Destinations': supabase
      .from('resorts_ranked')
      .select('id, name, slug, asset_path, country, state, ranking_score')
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .limit(12),

    'Hidden Gems': supabase
      .from('resorts_ranked')
      .select('id, name, slug, asset_path, country, state, ranking_score')
      .eq('is_active', true)
      .lt('stats->skiableAcres', 1000)
      .order('ranking_score', { ascending: false })
      .limit(12),

    'Night & Park': supabase
      .from('resorts_ranked')
      .select('id, name, slug, asset_path, country, state, ranking_score')
      .eq('is_active', true)
      .or('features->hasPark.eq.true,features->hasNightSkiing.eq.true')
      .order('ranking_score', { ascending: false })
      .limit(12),

    'Powder & Steeps': supabase
      .from('resorts_ranked')
      .select('id, name, slug, asset_path, country, state, ranking_score')
      .eq('is_active', true)
      .or('terrain->expert.gt.15,stats->avgAnnualSnowfall.gt.300')
      .order('ranking_score', { ascending: false })
      .limit(12),

    'Lost Ski Areas': supabase
      .from('resorts_ranked')
      .select('id, name, slug, asset_path, country, state, ranking_score')
      .eq('is_lost', true)
      .order('ranking_score', { ascending: false })
      .limit(12),
  };

  const allMissingImages: { section: string; resort: Resort; expectedUrl: string }[] = [];
  const allWithImages: { section: string; resort: Resort }[] = [];

  for (const [sectionName, query] of Object.entries(themedQueries)) {
    console.log(`\n📂 ${sectionName}`);
    console.log('─'.repeat(50));

    const resorts = await fetchThemedResorts(sectionName, query);

    if (resorts.length === 0) {
      console.log('  (No resorts in this section)');
      continue;
    }

    for (const resort of resorts) {
      const hasAssetPath = !!resort.asset_path;
      const expectedUrl = hasAssetPath ? getCardImageUrl(resort.asset_path!) : 'N/A';

      let imageExists = false;
      if (hasAssetPath) {
        imageExists = await checkImageExists(expectedUrl);
      }

      const status = !hasAssetPath
        ? '❌ No asset_path'
        : imageExists
          ? '✅ Has image'
          : '⚠️  Missing image';

      console.log(`  ${status} | ${resort.name} (${resort.country}/${resort.state}/${resort.slug})`);

      if (!hasAssetPath || !imageExists) {
        allMissingImages.push({
          section: sectionName,
          resort,
          expectedUrl: hasAssetPath ? expectedUrl : `gs://${GCS_BUCKET}/resorts/${resort.country}/${resort.state}/${resort.slug}/images/card.jpg`,
        });
      } else {
        allWithImages.push({ section: sectionName, resort });
      }
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Resorts with images: ${allWithImages.length}`);
  console.log(`❌ Resorts missing images: ${allMissingImages.length}`);

  if (allMissingImages.length > 0) {
    console.log('\n\n' + '='.repeat(60));
    console.log('📋 RESORTS NEEDING IMAGES');
    console.log('='.repeat(60));

    // Group by unique resort (may appear in multiple sections)
    const uniqueResorts = new Map<string, { resort: Resort; sections: string[] }>();
    for (const item of allMissingImages) {
      const key = item.resort.slug;
      if (!uniqueResorts.has(key)) {
        uniqueResorts.set(key, { resort: item.resort, sections: [] });
      }
      uniqueResorts.get(key)!.sections.push(item.section);
    }

    console.log('\nUnique resorts needing images:');
    for (const [slug, { resort, sections }] of uniqueResorts) {
      const path = `${resort.country}/${resort.state}/${slug}`;
      console.log(`\n  ${resort.name}`);
      console.log(`    Path: resorts/${path}/images/card.jpg`);
      console.log(`    Sections: ${sections.join(', ')}`);
      console.log(`    Search: "${resort.name} ski resort" OR "${resort.name} skiing"`);
    }

    // Output as JSON for scripting
    console.log('\n\n' + '='.repeat(60));
    console.log('📄 JSON OUTPUT (for scripting)');
    console.log('='.repeat(60));

    const jsonOutput = Array.from(uniqueResorts.values()).map(({ resort, sections }) => ({
      name: resort.name,
      slug: resort.slug,
      path: `${resort.country}/${resort.state}/${resort.slug}`,
      gcsPath: `gs://${GCS_BUCKET}/resorts/${resort.country}/${resort.state}/${resort.slug}/images/card.jpg`,
      sections,
      searchQuery: `${resort.name} ski resort`,
    }));

    console.log(JSON.stringify(jsonOutput, null, 2));
  }
}

main().catch(console.error);
