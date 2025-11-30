/**
 * Geographic name mappings for states and countries
 * Used for displaying human-readable names in the UI
 */

// US States with ski resorts
export const US_STATE_NAMES: Record<string, string> = {
  alaska: 'Alaska',
  arizona: 'Arizona',
  california: 'California',
  colorado: 'Colorado',
  connecticut: 'Connecticut',
  idaho: 'Idaho',
  illinois: 'Illinois',
  indiana: 'Indiana',
  iowa: 'Iowa',
  maine: 'Maine',
  maryland: 'Maryland',
  massachusetts: 'Massachusetts',
  michigan: 'Michigan',
  minnesota: 'Minnesota',
  missouri: 'Missouri',
  montana: 'Montana',
  nevada: 'Nevada',
  'new-hampshire': 'New Hampshire',
  'new-jersey': 'New Jersey',
  'new-mexico': 'New Mexico',
  'new-york': 'New York',
  'north-carolina': 'North Carolina',
  'north-dakota': 'North Dakota',
  ohio: 'Ohio',
  oregon: 'Oregon',
  pennsylvania: 'Pennsylvania',
  'rhode-island': 'Rhode Island',
  'south-dakota': 'South Dakota',
  tennessee: 'Tennessee',
  utah: 'Utah',
  vermont: 'Vermont',
  virginia: 'Virginia',
  washington: 'Washington',
  'west-virginia': 'West Virginia',
  wisconsin: 'Wisconsin',
  wyoming: 'Wyoming',
};

// Canadian Provinces with ski resorts
export const CA_PROVINCE_NAMES: Record<string, string> = {
  alberta: 'Alberta',
  'british-columbia': 'British Columbia',
  manitoba: 'Manitoba',
  'new-brunswick': 'New Brunswick',
  'newfoundland-and-labrador': 'Newfoundland and Labrador',
  'nova-scotia': 'Nova Scotia',
  ontario: 'Ontario',
  'prince-edward-island': 'Prince Edward Island',
  quebec: 'Quebec',
  saskatchewan: 'Saskatchewan',
  yukon: 'Yukon',
};

// All states/provinces combined
export const STATE_NAMES: Record<string, string> = {
  ...US_STATE_NAMES,
  ...CA_PROVINCE_NAMES,
};

// Country codes to names
export const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States',
  ca: 'Canada',
};

/**
 * Get the display name for a state/province code
 */
export function getStateName(stateCode: string): string {
  return STATE_NAMES[stateCode.toLowerCase()] || stateCode;
}

/**
 * Get the display name for a country code
 */
export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode.toLowerCase()] || countryCode.toUpperCase();
}

/**
 * Get list of states for a specific country
 */
export function getStatesForCountry(countryCode: string): { code: string; name: string }[] {
  const stateMap = countryCode.toLowerCase() === 'ca' ? CA_PROVINCE_NAMES : US_STATE_NAMES;
  return Object.entries(stateMap)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
