/**
 * Liftie.info API Client
 *
 * Fetches real-time lift status, weather, and webcam data
 * directly from the Liftie.info API.
 */

import { config } from './config.js';

export interface LiftieApiResponse {
  id: string;
  name: string;
  ll: [number, number]; // [lng, lat]
  timestamp: {
    lifts?: number;
    weather?: number;
    webcams?: number;
  };
  lifts?: {
    status: Record<string, 'open' | 'closed' | 'hold' | 'scheduled'>;
    stats: {
      open: number;
      hold: number;
      scheduled: number;
      closed: number;
      percentage: {
        open: number;
        hold: number;
        scheduled: number;
        closed: number;
      };
    };
  };
  weather?: {
    date: string;
    icon: string[];
    text: string;
    conditions: string;
    temperature: {
      max: number;
    };
  };
  webcams?: Array<{
    name: string;
    source: string;
    image: string;
  }>;
  open?: boolean;
}

const LIFTIE_API_BASE = 'https://liftie.info/api/resort';

/**
 * Fetch resort list from Liftie
 */
export async function fetchLiftieResortList(): Promise<string[]> {
  try {
    const response = await fetch('https://liftie.info/api/resorts');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    // Returns an object where keys are resort IDs
    return Object.keys(data);
  } catch (error) {
    console.error('Error fetching Liftie resort list:', error);
    return [];
  }
}

/**
 * Fetch data for a single resort from Liftie API
 */
export async function fetchLiftieResort(liftieId: string): Promise<LiftieApiResponse | null> {
  try {
    const response = await fetch(`${LIFTIE_API_BASE}/${liftieId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (config.processing.verbose) {
      console.error(`  Error fetching Liftie data for ${liftieId}:`, error);
    }
    return null;
  }
}

/**
 * Check if a resort has data on Liftie
 */
export async function hasLiftieResort(liftieId: string): Promise<boolean> {
  const data = await fetchLiftieResort(liftieId);
  return data !== null;
}
