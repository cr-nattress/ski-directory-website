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
  const result = await wikiApiRequest<{
    query?: { pages?: Record<string, { revisions?: Array<{ '*': string }> }> };
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
  const wikitext = pageData?.revisions?.[0]?.['*'] ?? '';

  return parseInfobox(wikitext);
}

/**
 * Parse an infobox from wikitext
 */
function parseInfobox(wikitext: string): WikipediaInfobox {
  const infobox: WikipediaInfobox = {};

  // Match infobox template
  const infoboxMatch = wikitext.match(/\{\{[Ii]nfobox[^}]*\n([\s\S]*?)\n\}\}/);
  if (!infoboxMatch) return infobox;

  const content = infoboxMatch[1];

  // Parse key-value pairs
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*\|\s*(\w+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      let value = match[2].trim();

      // Clean up wiki markup
      value = value
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[link|text]] -> text
        .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[link]] -> link
        .replace(/\{\{[^}]+\}\}/g, '') // Remove templates
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (value) {
        infobox[key] = value;
      }
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
