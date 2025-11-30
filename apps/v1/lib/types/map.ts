/**
 * Map Types
 * Lightweight data models optimized for map display
 */

import type { PassAffiliation } from './resort';

/**
 * Lightweight resort data optimized for map pin display
 * Used by the interactive map view on the landing page
 */
export interface ResortMapPin {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  nearestCity: string;
  stateCode: string;
  passAffiliations: PassAffiliation[];
  rating: number;
  status: 'open' | 'closed' | 'opening-soon';
  isActive: boolean;
  isLost: boolean;
  terrainOpenPercent?: number;
  snowfall24h?: number;
}
