/**
 * Themed Resorts API Service
 *
 * Provides specialized queries for themed resort sections on the landing page.
 * Each query targets a specific theme (e.g., "Hidden Gems", "Night Skiing & Parks").
 */

import { supabase } from '@/lib/supabase';
import { adaptResortFromSupabase } from './supabase-resort-adapter';
import type { Resort } from '@/lib/types';
import { applyDiversityConstraints, DEFAULT_DIVERSITY_CONFIG } from '@/lib/scoring/diversity';

/**
 * Themed section configuration
 */
export interface ThemedSectionConfig {
  id: string;
  title: string;
  icon: string;
  description: string;
}

/**
 * Available themed sections
 */
export const THEMED_SECTIONS: ThemedSectionConfig[] = [
  {
    id: 'topDestinations',
    title: 'Top Destinations',
    icon: '⭐',
    description: 'The highest-rated and most popular ski resorts',
  },
  {
    id: 'hiddenGems',
    title: 'Hidden Gems',
    icon: '💎',
    description: 'Smaller mountains with big appeal',
  },
  {
    id: 'nightAndPark',
    title: 'Night Skiing & Terrain Parks',
    icon: '🌙',
    description: 'Best for night riding and park sessions',
  },
  {
    id: 'powderAndSteeps',
    title: 'Powder & Steeps',
    icon: '🏔️',
    description: 'Expert terrain and serious snowfall',
  },
  {
    id: 'lostSkiAreas',
    title: 'Lost Ski Areas',
    icon: '👻',
    description: 'Explore the history of closed resorts',
  },
];

/**
 * Result from themed queries
 */
export interface ThemedSections {
  topDestinations: Resort[];
  hiddenGems: Resort[];
  nightAndPark: Resort[];
  powderAndSteeps: Resort[];
  lostSkiAreas: Resort[];
}

class ThemedResortsService {
  /**
   * Get top destinations (highest ranking score with diversity constraints)
   *
   * Applies diversity algorithm to ensure variety:
   * - Max 3 resorts from same state
   * - Max 5 from same pass program
   * - Mix of large/medium/small resorts
   */
  async getTopDestinations(limit: number = 12): Promise<Resort[]> {
    // Fetch more than needed to allow diversity filtering
    const fetchLimit = Math.max(limit * 3, 36);

    console.log('[ThemedResortsService] Fetching top destinations...');

    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .limit(fetchLimit);

    if (error) {
      console.error('[ThemedResortsService] Error fetching top destinations:', error);
      return [];
    }

    console.log('[ThemedResortsService] Top destinations raw data count:', data?.length ?? 0);

    const resorts = (data || []).map(adaptResortFromSupabase);

    // Apply diversity constraints
    const diversifiedResorts = applyDiversityConstraints(resorts, {
      ...DEFAULT_DIVERSITY_CONFIG,
      resultLimit: limit,
    });

    console.log('[ThemedResortsService] Top destinations after diversity:', diversifiedResorts.length);

    return diversifiedResorts;
  }

  /**
   * Get hidden gems (high score + smaller size)
   * Smaller resorts (< 1000 acres) with good scores
   *
   * Note: JSON field filtering isn't well supported in PostgREST,
   * so we fetch more data and filter client-side.
   */
  async getHiddenGems(limit: number = 12): Promise<Resort[]> {
    // Fetch more to allow client-side filtering
    const fetchLimit = limit * 5;

    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .limit(fetchLimit);

    if (error) {
      console.error('Error fetching hidden gems:', error);
      return [];
    }

    // Client-side filter for smaller resorts
    const resorts = (data || [])
      .map(adaptResortFromSupabase)
      .filter(resort => resort.stats.skiableAcres < 1000)
      .slice(0, limit);

    return resorts;
  }

  /**
   * Get night skiing and terrain park resorts
   *
   * Note: JSON field filtering isn't well supported in PostgREST,
   * so we fetch more data and filter client-side.
   */
  async getNightAndPark(limit: number = 12): Promise<Resort[]> {
    // Fetch more to allow client-side filtering
    const fetchLimit = limit * 5;

    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .limit(fetchLimit);

    if (error) {
      console.error('Error fetching night/park resorts:', error);
      return [];
    }

    // Client-side filter for night skiing or terrain parks
    const resorts = (data || [])
      .map(adaptResortFromSupabase)
      .filter(resort => resort.features.hasPark || resort.features.hasNightSkiing)
      .slice(0, limit);

    return resorts;
  }

  /**
   * Get powder and steep terrain resorts
   * High expert percentage (> 15%) or high snowfall (> 300")
   *
   * Note: JSON field filtering isn't well supported in PostgREST,
   * so we fetch more data and filter client-side.
   */
  async getPowderAndSteeps(limit: number = 12): Promise<Resort[]> {
    // Fetch more to allow client-side filtering
    const fetchLimit = limit * 5;

    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .limit(fetchLimit);

    if (error) {
      console.error('Error fetching powder/steep resorts:', error);
      return [];
    }

    // Client-side filter for expert terrain or high snowfall
    const resorts = (data || [])
      .map(adaptResortFromSupabase)
      .filter(resort =>
        resort.terrain.expert > 15 ||
        resort.stats.avgAnnualSnowfall > 300
      )
      .slice(0, limit);

    return resorts;
  }

  /**
   * Get lost (closed/defunct) ski areas
   */
  async getLostSkiAreas(limit: number = 12): Promise<Resort[]> {
    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_lost', true)
      .order('ranking_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching lost ski areas:', error);
      return [];
    }

    return (data || []).map(adaptResortFromSupabase);
  }

  /**
   * Get all themed sections at once
   * More efficient than individual calls for initial page load
   */
  async getAllThemedSections(): Promise<ThemedSections> {
    console.log('[ThemedResortsService] Starting getAllThemedSections');

    try {
      // Run all queries in parallel
      const [topDestinations, hiddenGems, nightAndPark, powderAndSteeps, lostSkiAreas] =
        await Promise.all([
          this.getTopDestinations(),
          this.getHiddenGems(),
          this.getNightAndPark(),
          this.getPowderAndSteeps(),
          this.getLostSkiAreas(),
        ]);

      console.log('[ThemedResortsService] Completed getAllThemedSections:', {
        topDestinations: topDestinations.length,
        hiddenGems: hiddenGems.length,
        nightAndPark: nightAndPark.length,
        powderAndSteeps: powderAndSteeps.length,
        lostSkiAreas: lostSkiAreas.length,
      });

      return {
        topDestinations,
        hiddenGems,
        nightAndPark,
        powderAndSteeps,
        lostSkiAreas,
      };
    } catch (error) {
      console.error('[ThemedResortsService] Error in getAllThemedSections:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const themedResortsService = new ThemedResortsService();
