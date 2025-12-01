import type { Resort } from './supabase.js';
import type { WikipediaResortData } from './wikipedia.js';

/**
 * Format Wikipedia data into a README markdown document
 */
export function formatReadme(resort: Resort, wikiData: WikipediaResortData | null): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${resort.name}`);
  lines.push('');

  // Location info
  lines.push(`**Location:** ${resort.nearest_city ? `${resort.nearest_city}, ` : ''}${resort.state_name}, ${resort.country_name}`);
  lines.push('');

  // Status
  if (resort.is_lost) {
    lines.push('> **Status:** This ski area is no longer operational (Lost Ski Area)');
    lines.push('');
  } else if (!resort.is_active) {
    lines.push('> **Status:** This ski area is currently inactive');
    lines.push('');
  }

  // Wikipedia Summary
  if (wikiData) {
    lines.push('## Overview');
    lines.push('');
    lines.push(wikiData.extract || 'No summary available.');
    lines.push('');

    // Infobox data as quick facts
    if (Object.keys(wikiData.infobox).length > 0) {
      lines.push('## Quick Facts');
      lines.push('');
      lines.push('| Attribute | Value |');
      lines.push('|-----------|-------|');

      const infoboxFields = [
        { key: 'status', label: 'Status' },
        { key: 'location', label: 'Location' },
        { key: 'nearest_city', label: 'Nearest City' },
        { key: 'summit_elevation', label: 'Summit Elevation' },
        { key: 'top_elevation', label: 'Summit Elevation' },
        { key: 'base_elevation', label: 'Base Elevation' },
        { key: 'vertical_drop', label: 'Vertical Drop' },
        { key: 'vertical', label: 'Vertical Drop' },
        { key: 'skiable_area', label: 'Skiable Area' },
        { key: 'trails', label: 'Trails' },
        { key: 'number_trails', label: 'Trails' },
        { key: 'runs', label: 'Runs' },
        { key: 'lifts', label: 'Lifts' },
        { key: 'liftsystem', label: 'Lifts' },
        { key: 'longest_run', label: 'Longest Run' },
        { key: 'terrain_parks', label: 'Terrain Parks' },
        { key: 'terrainparks', label: 'Terrain Parks' },
        { key: 'snowfall', label: 'Annual Snowfall' },
        { key: 'snowmaking', label: 'Snowmaking' },
        { key: 'night_skiing', label: 'Night Skiing' },
        { key: 'nightskiing', label: 'Night Skiing' },
        { key: 'season', label: 'Season' },
        { key: 'opened', label: 'Opened' },
        { key: 'closed', label: 'Closed' },
        { key: 'owner', label: 'Owner' },
        { key: 'operator', label: 'Operator' },
        { key: 'website', label: 'Website' },
      ];

      // Track which labels we've already added to avoid duplicates
      const addedLabels = new Set<string>();
      for (const field of infoboxFields) {
        const value = wikiData.infobox[field.key];
        if (value && !addedLabels.has(field.label)) {
          // Clean up the value for table display
          const cleanValue = value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
          lines.push(`| ${field.label} | ${cleanValue} |`);
          addedLabels.add(field.label);
        }
      }
      lines.push('');
    }

    // Full article content (if different from summary)
    if (wikiData.fullExtract && wikiData.fullExtract !== wikiData.extract) {
      lines.push('## Detailed Information');
      lines.push('');

      // Split into sections based on common Wikipedia headings
      const sections = splitIntoSections(wikiData.fullExtract);
      for (const section of sections) {
        if (section.heading) {
          lines.push(`### ${section.heading}`);
          lines.push('');
        }
        lines.push(section.content);
        lines.push('');
      }
    }

    // Categories
    if (wikiData.categories.length > 0) {
      lines.push('## Categories');
      lines.push('');
      lines.push(wikiData.categories.map(c => `- ${c}`).join('\n'));
      lines.push('');
    }

    // Coordinates
    if (wikiData.coordinates) {
      lines.push('## Coordinates');
      lines.push('');
      lines.push(`- **Latitude:** ${wikiData.coordinates.lat}`);
      lines.push(`- **Longitude:** ${wikiData.coordinates.lng}`);
      lines.push('');
    }

    // Source attribution
    lines.push('---');
    lines.push('');
    lines.push('## Source');
    lines.push('');
    lines.push(`This information was sourced from Wikipedia: [${wikiData.title}](${wikiData.url})`);
    lines.push('');
    lines.push(`*Last updated: ${wikiData.lastUpdated}*`);
  } else {
    // No Wikipedia data available
    lines.push('## Overview');
    lines.push('');
    if (resort.description) {
      lines.push(resort.description);
    } else {
      lines.push(`${resort.name} is a ski ${resort.is_lost ? 'area that was formerly located' : 'resort located'} in ${resort.state_name}, ${resort.country_name}.`);
    }
    lines.push('');
    lines.push('*No Wikipedia article found for this ski area.*');
  }

  // Links section
  lines.push('');
  lines.push('## Links');
  lines.push('');
  if (resort.website_url) {
    lines.push(`- [Official Website](${resort.website_url})`);
  }
  if (wikiData) {
    lines.push(`- [Wikipedia Article](${wikiData.url})`);
  }
  lines.push(`- [View on Ski Directory](https://skidirectory.com/${resort.country}/${resort.state}/${resort.slug})`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Split full extract into sections based on common patterns
 */
function splitIntoSections(text: string): Array<{ heading: string | null; content: string }> {
  const sections: Array<{ heading: string | null; content: string }> = [];

  // Common Wikipedia section headings for ski resorts
  const sectionHeadings = [
    'History',
    'Terrain',
    'Lifts',
    'Facilities',
    'Snow conditions',
    'Snowmaking',
    'Events',
    'Access',
    'Transportation',
    'Lodging',
    'Notable events',
    'Gallery',
    'See also',
    'References',
    'External links',
  ];

  // Build regex to match section headings
  const headingPattern = new RegExp(
    `(?:^|\\n\\n)(${sectionHeadings.join('|')})\\s*(?:\\n|$)`,
    'gi'
  );

  let lastIndex = 0;
  let lastHeading: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(text)) !== null) {
    // Add content before this heading
    const content = text.slice(lastIndex, match.index).trim();
    if (content) {
      sections.push({ heading: lastHeading, content });
    }

    lastHeading = match[1];
    lastIndex = match.index + match[0].length;
  }

  // Add remaining content
  const remainingContent = text.slice(lastIndex).trim();
  if (remainingContent) {
    sections.push({ heading: lastHeading, content: remainingContent });
  }

  // If no sections were found, return the whole text
  if (sections.length === 0) {
    sections.push({ heading: null, content: text.trim() });
  }

  return sections;
}

/**
 * Generate a filename-safe version of the resort name
 */
export function getReadmeFilename(): string {
  return 'README.md';
}
