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
 * Search Wikipedia for a ski resort
 */
async function searchWikipedia(resortName: string, stateName: string): Promise<WikipediaSearchResult | null> {
  // Try different search queries in order of specificity
  const searchQueries = [
    `${resortName} ski resort ${stateName}`,
    `${resortName} ski area ${stateName}`,
    `${resortName} ${stateName} skiing`,
    `${resortName} ski resort`,
    resortName,
  ];

  for (const query of searchQueries) {
    const result = await wikiApiRequest<{
      query?: { search?: WikipediaSearchResult[] };
    }>({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: '5',
    });

    const searchResults = result.query?.search ?? [];

    // Look for a result that seems relevant to skiing
    for (const item of searchResults) {
      const titleLower = item.title.toLowerCase();
      const snippetLower = item.snippet.toLowerCase();
      const combined = titleLower + ' ' + snippetLower;

      // Check if it's likely a ski resort article
      if (
        combined.includes('ski') ||
        combined.includes('resort') ||
        combined.includes('skiing') ||
        combined.includes('mountain') ||
        combined.includes('slopes')
      ) {
        return item;
      }
    }

    // If no skiing-related result found, take the first result from the most specific query
    if (searchResults.length > 0 && query === searchQueries[0]) {
      return searchResults[0];
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
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  Error fetching Wikipedia data for "${resortName}":`, error);
    return null;
  }
}
