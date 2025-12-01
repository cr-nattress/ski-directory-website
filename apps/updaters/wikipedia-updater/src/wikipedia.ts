import { config } from './config.js';

/**
 * Wikipedia API response types
 */
interface WikipediaSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

interface WikipediaPage {
  pageid: number;
  title: string;
  extract?: string;
  fullurl?: string;
  categories?: Array<{ title: string }>;
  coordinates?: Array<{
    lat: number;
    lon: number;
  }>;
  images?: Array<{ title: string }>;
  links?: Array<{ title: string }>;
  extlinks?: Array<{ '*': string }>;
}

interface WikipediaInfobox {
  [key: string]: string | undefined;
}

/**
 * Wikipedia media item from the REST API
 */
export interface WikipediaMediaItem {
  title: string;
  type: string;
  leadImage: boolean;
  sectionId: number;
  caption?: string;
  srcset: Array<{
    src: string;
    scale: string;
  }>;
}

/**
 * Parsed Wikipedia data for a ski resort
 */
export interface WikipediaResortData {
  title: string;
  pageid: number;
  url: string;
  extract: string;
  fullExtract: string;
  categories: string[];
  coordinates: { lat: number; lng: number } | null;
  infobox: WikipediaInfobox;
  media: WikipediaMediaItem[];
  lastUpdated: string;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make a Wikipedia API request
 */
async function wikiApiRequest<T>(params: Record<string, string>): Promise<T> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': config.wikipedia.userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Check if a Wikipedia article title is a generic list/comparison page (not a dedicated resort article)
 */
function isGenericListArticle(title: string): boolean {
  const titleLower = title.toLowerCase();
  const genericPatterns = [
    'list of',
    'comparison of',
    'lists of',
    'category:',
    'ski areas and resorts in',
    'ski resorts in',
    '(disambiguation)',
  ];
  return genericPatterns.some(pattern => titleLower.includes(pattern));
}

/**
 * Check if the article title is likely a dedicated article for this resort
 * by comparing the resort name against the article title
 */
function isDedicatedResortArticle(resortName: string, articleTitle: string, snippet: string): boolean {
  const resortLower = resortName.toLowerCase();
  const titleLower = articleTitle.toLowerCase();
  const snippetLower = snippet.toLowerCase();

  // Remove common suffixes for comparison
  const cleanResort = resortLower
    .replace(/\s*(ski\s*)?(resort|area|mountain|ski area|ski resort)$/i, '')
    .trim();
  const cleanTitle = titleLower
    .replace(/\s*\([^)]+\)$/i, '') // Remove parenthetical like "(ski area)"
    .replace(/\s*(ski\s*)?(resort|area|mountain|ski area|ski resort)$/i, '')
    .trim();

  // The title must contain the core resort name (or vice versa)
  const nameMatches = cleanTitle.includes(cleanResort) || cleanResort.includes(cleanTitle);
  if (!nameMatches) {
    return false;
  }

  // The article must be about skiing/resorts (check title or snippet)
  const skiRelatedTerms = ['ski', 'resort', 'skiing', 'slopes', 'lifts', 'snowboard', 'mountain resort', 'ski area'];
  const combined = titleLower + ' ' + snippetLower;
  const isSkiRelated = skiRelatedTerms.some(term => combined.includes(term));

  return isSkiRelated;
}

/**
 * Search Wikipedia for a ski resort - only returns dedicated resort articles
 */
async function searchWikipedia(resortName: string, stateName: string): Promise<WikipediaSearchResult | null> {
  // Try different search queries in order of specificity
  const searchQueries = [
    `${resortName} ski resort ${stateName}`,
    `${resortName} ski area ${stateName}`,
    `${resortName} ${stateName} skiing`,
    `${resortName} ski resort`,
    `${resortName} ski area`,
    resortName,
  ];

  for (const query of searchQueries) {
    const result = await wikiApiRequest<{
      query?: { search?: WikipediaSearchResult[] };
    }>({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: '10',
    });

    const searchResults = result.query?.search ?? [];

    // Look for a dedicated resort article (not a generic list)
    for (const item of searchResults) {
      // Skip generic list/comparison articles
      if (isGenericListArticle(item.title)) {
        continue;
      }

      // Check if this appears to be a dedicated article for this resort
      if (isDedicatedResortArticle(resortName, item.title, item.snippet)) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Get full page content from Wikipedia
 */
async function getPageContent(pageid: number): Promise<WikipediaPage | null> {
  const result = await wikiApiRequest<{
    query?: { pages?: Record<string, WikipediaPage> };
  }>({
    action: 'query',
    pageids: pageid.toString(),
    prop: 'extracts|info|categories|coordinates|images|links|extlinks',
    exintro: '0', // Get full extract, not just intro
    explaintext: '1', // Plain text, no HTML
    exsectionformat: 'plain',
    inprop: 'url',
    cllimit: '50',
    imlimit: '20',
    pllimit: '50',
    ellimit: '20',
  });

  const pages = result.query?.pages;
  if (!pages) return null;

  return pages[pageid.toString()] ?? null;
}

/**
 * Get just the intro extract from Wikipedia
 */
async function getIntroExtract(pageid: number): Promise<string> {
  const result = await wikiApiRequest<{
    query?: { pages?: Record<string, { extract?: string }> };
  }>({
    action: 'query',
    pageids: pageid.toString(),
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
  });

  return result.query?.pages?.[pageid.toString()]?.extract ?? '';
}

/**
 * Parse infobox data from the page wikitext
 */
async function getInfobox(title: string): Promise<WikipediaInfobox> {
  interface RevisionData {
    slots?: { main?: { '*': string } };
    '*'?: string;
  }

  const result = await wikiApiRequest<{
    query?: { pages?: Record<string, { revisions?: RevisionData[] }> };
  }>({
    action: 'query',
    titles: title,
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    rvsection: '0',
  });

  const pages = result.query?.pages;
  if (!pages) return {};

  const pageData = Object.values(pages)[0];
  const revision = pageData?.revisions?.[0];
  // Handle both old and new API response formats
  const wikitext = revision?.slots?.main?.['*'] ?? revision?.['*'] ?? '';

  return parseInfobox(wikitext);
}

/**
 * Fetch media list from Wikipedia REST API
 * Uses the /page/media-list/{title} endpoint
 */
async function fetchMediaList(title: string): Promise<WikipediaMediaItem[]> {
  try {
    // Use REST API instead of Action API for media list
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodedTitle}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': config.wikipedia.userAgent,
      },
    });

    if (!response.ok) {
      console.log(`  Media list API returned ${response.status} for "${title}"`);
      return [];
    }

    interface MediaListResponse {
      items?: Array<{
        title: string;
        type: string;
        leadImage?: boolean;
        section_id?: number;
        caption?: { text?: string };
        showInGallery?: boolean;
        srcset?: Array<{
          src: string;
          scale: string;
        }>;
      }>;
    }

    const data = await response.json() as MediaListResponse;
    const items = data.items ?? [];

    // Filter to only images that should show in gallery and have srcset
    const mediaItems: WikipediaMediaItem[] = items
      .filter(item =>
        item.type === 'image' &&
        item.showInGallery &&
        item.srcset &&
        item.srcset.length > 0 &&
        // Skip SVG logos and icons
        !item.title.toLowerCase().includes('logo') &&
        !item.title.toLowerCase().includes('icon') &&
        !item.title.toLowerCase().endsWith('.svg')
      )
      .map(item => ({
        title: item.title,
        type: item.type,
        leadImage: item.leadImage ?? false,
        sectionId: item.section_id ?? 0,
        caption: item.caption?.text,
        srcset: item.srcset!.map(s => ({
          src: s.src.startsWith('//') ? `https:${s.src}` : s.src,
          scale: s.scale,
        })),
      }));

    return mediaItems;
  } catch (error) {
    console.error(`  Error fetching media list for "${title}":`, error);
    return [];
  }
}

/**
 * Get the highest resolution image URL from srcset
 */
export function getBestImageUrl(media: WikipediaMediaItem): string | null {
  if (!media.srcset || media.srcset.length === 0) return null;

  // Prefer 2x scale, then 1.5x, then 1x
  const scales = ['2x', '1.5x', '1x'];
  for (const scale of scales) {
    const src = media.srcset.find(s => s.scale === scale);
    if (src) return src.src;
  }

  // Fallback to first available
  return media.srcset[0]?.src ?? null;
}

/**
 * Process {{convert|value|unit|...}} templates to readable text
 */
function processConvertTemplate(template: string): string {
  // Match {{convert|value|fromUnit|toUnit|...}} or {{convert|value|unit|...}}
  const match = template.match(/\{\{convert\|([^|]+)\|([^|}]+)(?:\|([^|}]+))?/i);
  if (!match) return template;

  const value = match[1].trim();
  const unit = match[2].trim();

  // Map common unit abbreviations
  const unitMap: Record<string, string> = {
    ft: 'ft',
    m: 'm',
    mi: 'miles',
    km: 'km',
    acre: 'acres',
    in: 'inches',
    cm: 'cm',
  };

  const displayUnit = unitMap[unit] || unit;
  return `${value} ${displayUnit}`;
}

/**
 * Clean wiki markup from a value
 */
function cleanWikiMarkup(value: string): string {
  let cleaned = value;

  // Process {{convert|...}} templates first (before removing all templates)
  cleaned = cleaned.replace(/\{\{convert\|[^}]+\}\}/gi, (match) => processConvertTemplate(match));

  // Process {{spaces|N}} template - just remove it
  cleaned = cleaned.replace(/\{\{spaces\|\d+\}\}/gi, '');

  // Extract URL from external links [http://url text] -> url
  cleaned = cleaned.replace(/\[https?:\/\/([^\s\]]+)\s*([^\]]*)\]/gi, (_, url, text) => {
    return text.trim() || `https://${url}`;
  });

  // Clean up wiki markup
  cleaned = cleaned
    .replace(/\[\[File:[^\]]+\]\]/g, '') // Remove file links
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[link|text]] -> text
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[link]] -> link
    .replace(/\{\{coord\|[^}]+\}\}/gi, '') // Remove coord templates (we get coords separately)
    .replace(/\{\{[^}]+\}\}/g, '') // Remove remaining templates
    .replace(/<br\s*\/?>/gi, ', ') // Convert <br> to comma
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/''+/g, '') // Remove wiki bold/italic markers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return cleaned;
}

/**
 * Parse an infobox from wikitext
 */
function parseInfobox(wikitext: string): WikipediaInfobox {
  const infobox: WikipediaInfobox = {};

  // Find the start of the infobox
  const infoboxStart = wikitext.search(/\{\{[Ii]nfobox\s+[^|]+/);
  if (infoboxStart === -1) return infobox;

  // Find the matching closing braces by counting brace depth
  let depth = 0;
  let infoboxEnd = infoboxStart;
  for (let i = infoboxStart; i < wikitext.length - 1; i++) {
    if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
      depth++;
      i++; // Skip next char
    } else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
      depth--;
      i++; // Skip next char
      if (depth === 0) {
        infoboxEnd = i + 1;
        break;
      }
    }
  }

  const infoboxContent = wikitext.substring(infoboxStart, infoboxEnd);

  // Parse key-value pairs - handle multi-line values
  const lines = infoboxContent.split('\n');
  let currentKey: string | null = null;
  let currentValue = '';

  for (const line of lines) {
    // Check if this line starts a new key-value pair
    const keyMatch = line.match(/^\s*\|\s*([\w_]+)\s*=\s*(.*)$/);
    if (keyMatch) {
      // Save previous key-value pair if exists
      if (currentKey && currentValue) {
        infobox[currentKey] = cleanWikiMarkup(currentValue);
      }
      currentKey = keyMatch[1].trim().toLowerCase();
      currentValue = keyMatch[2];
    } else if (currentKey && !line.match(/^\s*\|/) && !line.match(/^\s*\}\}/)) {
      // Continue previous value (multi-line)
      currentValue += ' ' + line.trim();
    }
  }

  // Don't forget the last key-value pair
  if (currentKey && currentValue) {
    infobox[currentKey] = cleanWikiMarkup(currentValue);
  }

  // Map Wikipedia ski resort infobox field names to our standardized names
  const fieldMappings: Record<string, string> = {
    number_trails: 'trails',
    liftsystem: 'lifts',
    lift_system: 'lifts',
    terrainparks: 'terrain_parks',
    terrain_parks: 'terrain_parks',
    nightskiing: 'night_skiing',
    night_skiing: 'night_skiing',
    skiable_area: 'skiable_area',
    top_elevation: 'summit_elevation',
    base_elevation: 'base_elevation',
    vertical: 'vertical_drop',
    longest_run: 'longest_run',
    nearest_city: 'nearest_city',
  };

  // Create mapped aliases
  for (const [wikiField, ourField] of Object.entries(fieldMappings)) {
    if (infobox[wikiField] && !infobox[ourField]) {
      infobox[ourField] = infobox[wikiField];
    }
  }

  return infobox;
}

/**
 * Fetch Wikipedia data for a ski resort
 */
export async function fetchWikipediaData(
  resortName: string,
  stateName: string
): Promise<WikipediaResortData | null> {
  try {
    // Search for the resort
    const searchResult = await searchWikipedia(resortName, stateName);
    if (!searchResult) {
      console.log(`  No Wikipedia article found for "${resortName}"`);
      return null;
    }

    // Rate limiting
    await sleep(config.wikipedia.rateLimitMs);

    // Get full page content
    const page = await getPageContent(searchResult.pageid);
    if (!page) {
      console.log(`  Could not fetch page content for "${searchResult.title}"`);
      return null;
    }

    // Rate limiting
    await sleep(config.wikipedia.rateLimitMs);

    // Get intro extract separately for summary
    const introExtract = await getIntroExtract(searchResult.pageid);

    // Rate limiting
    await sleep(config.wikipedia.rateLimitMs);

    // Get infobox data
    const infobox = await getInfobox(searchResult.title);

    // Rate limiting
    await sleep(config.wikipedia.rateLimitMs);

    // Get media list from REST API
    const media = await fetchMediaList(searchResult.title);

    // Parse categories
    const categories = (page.categories ?? [])
      .map(c => c.title.replace('Category:', ''))
      .filter(c => !c.includes('Articles') && !c.includes('Webarchive'));

    // Parse coordinates
    const coords = page.coordinates?.[0];
    const coordinates = coords ? { lat: coords.lat, lng: coords.lon } : null;

    return {
      title: page.title,
      pageid: page.pageid,
      url: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      extract: introExtract,
      fullExtract: page.extract ?? '',
      categories,
      coordinates,
      infobox,
      media,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  Error fetching Wikipedia data for "${resortName}":`, error);
    return null;
  }
}
