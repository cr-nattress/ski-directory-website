/**
 * Configuration for the migration tool
 */

import * as path from 'path';

export const config = {
  // GCS bucket
  bucket: 'sda-assets-prod',
  basePath: 'resorts',

  // Local paths (relative to project root)
  regionsPath: path.resolve(__dirname, '../../../regions'),

  // Service account key file path
  keyFilePath: path.resolve(__dirname, '../../../gcp/service-account-key.json'),

  // Cache control settings
  cacheControl: {
    json: 'public, max-age=300',  // 5 minutes for JSON
    index: 'public, max-age=60',   // 1 minute for indexes
  },

  // Country mappings
  countries: {
    us: { code: 'us', name: 'United States' },
    ca: { code: 'ca', name: 'Canada' },
  } as Record<string, { code: string; name: string }>,

  // State/Province name mappings
  stateNames: {
    // US States
    'alabama': 'Alabama',
    'alaska': 'Alaska',
    'arizona': 'Arizona',
    'california': 'California',
    'colorado': 'Colorado',
    'connecticut': 'Connecticut',
    'georgia': 'Georgia',
    'idaho': 'Idaho',
    'illinois': 'Illinois',
    'indiana': 'Indiana',
    'iowa': 'Iowa',
    'maine': 'Maine',
    'maryland': 'Maryland',
    'massachusetts': 'Massachusetts',
    'michigan': 'Michigan',
    'minnesota': 'Minnesota',
    'missouri': 'Missouri',
    'montana': 'Montana',
    'nevada': 'Nevada',
    'new-hampshire': 'New Hampshire',
    'new-jersey': 'New Jersey',
    'new-mexico': 'New Mexico',
    'new-york': 'New York',
    'north-carolina': 'North Carolina',
    'north-dakota': 'North Dakota',
    'ohio': 'Ohio',
    'oregon': 'Oregon',
    'pennsylvania': 'Pennsylvania',
    'rhode-island': 'Rhode Island',
    'south-dakota': 'South Dakota',
    'tennessee': 'Tennessee',
    'utah': 'Utah',
    'vermont': 'Vermont',
    'virginia': 'Virginia',
    'washington': 'Washington',
    'west-virginia': 'West Virginia',
    'wisconsin': 'Wisconsin',
    'wyoming': 'Wyoming',
    // Canadian Provinces
    'alberta': 'Alberta',
    'british-columbia': 'British Columbia',
    'manitoba': 'Manitoba',
    'new-brunswick': 'New Brunswick',
    'newfoundland-and-labrador': 'Newfoundland and Labrador',
    'nova-scotia': 'Nova Scotia',
    'ontario': 'Ontario',
    'prince-edward-island': 'Prince Edward Island',
    'quebec': 'Quebec',
    'saskatchewan': 'Saskatchewan',
    'yukon': 'Yukon',
  } as Record<string, string>,
};
