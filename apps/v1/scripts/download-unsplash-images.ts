/**
 * Download ski resort images from Unsplash API
 *
 * This script:
 * 1. Searches Unsplash for each resort
 * 2. Downloads the best matching image
 * 3. Saves to the local migration folder structure
 * 4. Generates a manifest for GCS upload
 *
 * Prerequisites:
 * - Set UNSPLASH_ACCESS_KEY in .env.local
 * - npm install node-fetch (if not available)
 *
 * Run: npx ts-node --esm scripts/download-unsplash-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Unsplash API configuration
// Get your free API key at https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

// Output directory for downloaded images
const OUTPUT_DIR = path.join(__dirname, '../../migration/resorts');

// Resorts that need images (from the check script)
const RESORTS_NEEDING_IMAGES = [
  // Top Destinations (highest priority)
  { name: 'Big Sky Resort', slug: 'big-sky', path: 'us/montana/big-sky', searchTerms: ['Big Sky Montana skiing', 'Big Sky ski resort'] },
  { name: 'Whistler Blackcomb', slug: 'whistler-blackcomb', path: 'ca/british-columbia/whistler-blackcomb', searchTerms: ['Whistler Blackcomb skiing', 'Whistler ski resort'] },
  { name: 'Park City Mountain Resort', slug: 'park-city-mountain', path: 'us/utah/park-city-mountain', searchTerms: ['Park City Utah skiing', 'Park City ski resort'] },
  { name: 'Palisades Tahoe', slug: 'palisades-tahoe', path: 'us/california/palisades-tahoe', searchTerms: ['Squaw Valley skiing', 'Palisades Tahoe ski'] },
  { name: 'Heavenly Mountain Resort', slug: 'heavenly', path: 'us/california/heavenly', searchTerms: ['Heavenly Lake Tahoe skiing', 'Heavenly ski resort'] },
  { name: 'Mammoth Mountain', slug: 'mammoth-mountain', path: 'us/california/mammoth-mountain', searchTerms: ['Mammoth Mountain skiing', 'Mammoth ski California'] },
  { name: 'Mt. Bachelor', slug: 'mt-bachelor', path: 'us/oregon/mt-bachelor', searchTerms: ['Mt Bachelor Oregon skiing', 'Mount Bachelor ski'] },
  { name: 'Lake Louise Ski Resort', slug: 'lake-louise', path: 'ca/alberta/lake-louise', searchTerms: ['Lake Louise skiing', 'Lake Louise Banff ski'] },
  { name: 'Powder Mountain', slug: 'powder-mountain', path: 'us/utah/powder-mountain', searchTerms: ['Powder Mountain Utah skiing', 'Utah powder skiing'] },
  { name: 'Sunshine Village', slug: 'sunshine-village', path: 'ca/alberta/sunshine-village', searchTerms: ['Sunshine Village Banff skiing', 'Banff ski resort'] },
  { name: 'Sun Peaks Resort', slug: 'sun-peaks', path: 'ca/british-columbia/sun-peaks', searchTerms: ['Sun Peaks skiing', 'Sun Peaks BC ski'] },
  { name: 'Panorama Mountain Resort', slug: 'panorama', path: 'ca/british-columbia/panorama', searchTerms: ['Panorama BC skiing', 'British Columbia ski resort'] },

  // Hidden Gems
  { name: 'Sunday River', slug: 'sunday-river', path: 'us/maine/sunday-river', searchTerms: ['Sunday River Maine skiing', 'Maine ski resort'] },
  { name: 'Whiteface Mountain', slug: 'whiteface-mountain', path: 'us/new-york/whiteface-mountain', searchTerms: ['Whiteface Mountain skiing', 'Lake Placid ski'] },
  { name: 'Sugarbush Resort', slug: 'sugarbush', path: 'us/vermont/sugarbush', searchTerms: ['Sugarbush Vermont skiing', 'Vermont ski resort'] },
  { name: 'Gore Mountain', slug: 'gore-mountain', path: 'us/new-york/gore-mountain', searchTerms: ['Gore Mountain skiing', 'Adirondacks ski'] },
  { name: 'Okemo Mountain Resort', slug: 'okemo', path: 'us/vermont/okemo', searchTerms: ['Okemo Vermont skiing', 'Vermont skiing'] },
  { name: 'Arizona Snowbowl', slug: 'arizona-snowbowl', path: 'us/arizona/arizona-snowbowl', searchTerms: ['Arizona Snowbowl skiing', 'Flagstaff ski'] },
  { name: 'Mountain High', slug: 'mountain-high', path: 'us/california/mountain-high', searchTerms: ['Mountain High California skiing', 'Southern California ski'] },
  { name: 'Stowe Mountain Resort', slug: 'stowe', path: 'us/vermont/stowe', searchTerms: ['Stowe Vermont skiing', 'Stowe ski resort'] },
  { name: 'Montana Snowbowl', slug: 'montana-snowbowl', path: 'us/montana/montana-snowbowl', searchTerms: ['Montana Snowbowl skiing', 'Missoula ski'] },
  { name: 'Mont Tremblant', slug: 'mont-tremblant', path: 'ca/quebec/mont-tremblant', searchTerms: ['Mont Tremblant skiing', 'Quebec ski resort'] },
  { name: 'Cannon Mountain', slug: 'cannon-mountain', path: 'us/new-hampshire/cannon-mountain', searchTerms: ['Cannon Mountain skiing', 'New Hampshire ski'] },
  { name: 'Mt. Hood Skibowl', slug: 'mt-hood-skibowl', path: 'us/oregon/mt-hood-skibowl', searchTerms: ['Mt Hood skiing', 'Mount Hood Oregon ski'] },

  // Powder & Steeps only
  { name: 'Snowbird', slug: 'snowbird', path: 'us/utah/snowbird', searchTerms: ['Snowbird Utah skiing', 'Snowbird ski resort'] },
  { name: 'Jackson Hole Mountain Resort', slug: 'jackson-hole', path: 'us/wyoming/jackson-hole', searchTerms: ['Jackson Hole skiing', 'Jackson Hole Wyoming ski'] },
  { name: 'Snowbasin', slug: 'snowbasin', path: 'us/utah/snowbasin', searchTerms: ['Snowbasin Utah skiing', 'Snowbasin ski resort'] },
];

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
  };
  user: {
    name: string;
    username: string;
  };
  links: {
    download_location: string;
  };
  alt_description: string | null;
}

interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Search Unsplash for photos
 */
async function searchUnsplash(query: string): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.error('❌ UNSPLASH_ACCESS_KEY not set in environment');
    return null;
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;

  return new Promise((resolve) => {
    const options = {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const result: UnsplashSearchResult = JSON.parse(data);
          if (result.results && result.results.length > 0) {
            resolve(result.results[0]);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Download an image from URL to local file
 */
async function downloadImage(imageUrl: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(outputPath);

    https.get(imageUrl, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(true);
            });
          }).on('error', () => resolve(false));
        } else {
          resolve(false);
        }
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }
    }).on('error', () => {
      fs.unlink(outputPath, () => {});
      resolve(false);
    });
  });
}

/**
 * Trigger download tracking on Unsplash (required by API terms)
 */
async function trackDownload(downloadLocation: string): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY) return;

  return new Promise((resolve) => {
    const url = `${downloadLocation}?client_id=${UNSPLASH_ACCESS_KEY}`;
    https.get(url, () => resolve()).on('error', () => resolve());
  });
}

/**
 * Create assets.json metadata file
 */
function createAssetsJson(
  resortPath: string,
  photo: UnsplashPhoto,
  resortName: string
): void {
  const assetsJsonPath = path.join(OUTPUT_DIR, resortPath, 'assets.json');
  const pathParts = resortPath.split('/');

  const assetsData = {
    slug: pathParts[pathParts.length - 1],
    country: pathParts[0],
    state: pathParts[1],
    lastUpdated: new Date().toISOString(),
    images: {
      card: {
        path: 'images/card.jpg',
        contentType: 'image/jpeg',
        description: `${resortName} ski resort`,
        source: 'unsplash',
        photographer: photo.user.name,
        photographerUrl: `https://unsplash.com/@${photo.user.username}`,
        unsplashId: photo.id,
        license: 'Unsplash License',
      },
    },
    totalAssets: 1,
  };

  fs.writeFileSync(assetsJsonPath, JSON.stringify(assetsData, null, 2));
}

/**
 * Main execution
 */
async function main() {
  console.log('🎿 Downloading ski resort images from Unsplash\n');

  if (!UNSPLASH_ACCESS_KEY) {
    console.error('❌ Error: UNSPLASH_ACCESS_KEY environment variable not set');
    console.log('\nTo get an API key:');
    console.log('1. Go to https://unsplash.com/developers');
    console.log('2. Create a new application');
    console.log('3. Copy your Access Key');
    console.log('4. Add to .env.local: UNSPLASH_ACCESS_KEY=your_key_here');
    console.log('\nOr run with: UNSPLASH_ACCESS_KEY=your_key npx ts-node --esm scripts/download-unsplash-images.ts');
    return;
  }

  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  const results: { resort: string; success: boolean; photo?: string; error?: string }[] = [];
  const attributions: { resort: string; photographer: string; url: string }[] = [];

  for (const resort of RESORTS_NEEDING_IMAGES) {
    console.log(`\n🔍 Searching for: ${resort.name}`);

    let photo: UnsplashPhoto | null = null;

    // Try each search term until we find a result
    for (const searchTerm of resort.searchTerms) {
      photo = await searchUnsplash(searchTerm);
      if (photo) {
        console.log(`   Found image: "${photo.alt_description || 'ski resort photo'}"`);
        break;
      }
      // Rate limiting - wait between requests
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!photo) {
      // Fallback to generic ski search
      photo = await searchUnsplash('ski resort mountain snow');
    }

    if (!photo) {
      console.log(`   ❌ No image found`);
      results.push({ resort: resort.name, success: false, error: 'No image found' });
      continue;
    }

    // Download the image
    const outputPath = path.join(OUTPUT_DIR, resort.path, 'images', 'card.jpg');
    // Use regular size (1080px width) for card images
    const imageUrl = photo.urls.regular;

    console.log(`   📥 Downloading to: ${resort.path}/images/card.jpg`);

    const success = await downloadImage(imageUrl, outputPath);

    if (success) {
      // Track the download (required by Unsplash API terms)
      await trackDownload(photo.links.download_location);

      // Create assets.json
      createAssetsJson(resort.path, photo, resort.name);

      console.log(`   ✅ Downloaded successfully`);
      console.log(`   📷 Photo by ${photo.user.name} on Unsplash`);

      results.push({ resort: resort.name, success: true, photo: photo.id });
      attributions.push({
        resort: resort.name,
        photographer: photo.user.name,
        url: `https://unsplash.com/@${photo.user.username}`,
      });
    } else {
      console.log(`   ❌ Download failed`);
      results.push({ resort: resort.name, success: false, error: 'Download failed' });
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed resorts:');
    failed.forEach((r) => console.log(`  - ${r.resort}: ${r.error}`));
  }

  // Attribution file
  if (attributions.length > 0) {
    console.log('\n\n' + '='.repeat(60));
    console.log('📝 PHOTO ATTRIBUTIONS (required by Unsplash license)');
    console.log('='.repeat(60));

    const attributionText = attributions
      .map((a) => `${a.resort}: Photo by ${a.photographer} (${a.url})`)
      .join('\n');

    console.log(attributionText);

    // Save attribution file
    const attributionPath = path.join(OUTPUT_DIR, 'PHOTO_ATTRIBUTIONS.txt');
    fs.writeFileSync(
      attributionPath,
      `Photo Attributions for Ski Resort Images\n` +
        `Source: Unsplash (https://unsplash.com)\n` +
        `License: Unsplash License (free for commercial and personal use)\n` +
        `Downloaded: ${new Date().toISOString()}\n\n` +
        attributionText
    );
    console.log(`\n💾 Saved attributions to: ${attributionPath}`);
  }

  // GCS upload instructions
  console.log('\n\n' + '='.repeat(60));
  console.log('📤 NEXT STEPS: Upload to GCS');
  console.log('='.repeat(60));
  console.log(`
To upload the images to Google Cloud Storage:

1. Make sure you have gcloud CLI installed and authenticated

2. Run the following command to upload all images:
   gsutil -m cp -r ${OUTPUT_DIR}/* gs://sda-assets-prod/resorts/

3. Or upload individual resort folders:
   gsutil -m cp -r ${OUTPUT_DIR}/us/montana/big-sky gs://sda-assets-prod/resorts/us/montana/

4. Verify the upload:
   gsutil ls gs://sda-assets-prod/resorts/us/montana/big-sky/images/
`);
}

main().catch(console.error);
