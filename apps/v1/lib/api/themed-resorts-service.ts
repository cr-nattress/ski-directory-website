/**
 * Themed Resorts API Service
 *
 * Provides specialized queries for themed resort sections on the landing page.
 * Each query targets a specific theme (e.g., "Hidden Gems", "Night Skiing & Parks").
 */

import { supabase } from '@/lib/supabase';
import { adaptResortFromSupabase } from './supabase-resort-adapter';
import type { Resort } from '@/lib/types';

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
   * Get top destinations (highest ranking score)
   */
  async getTopDestinations(limit: number = 12): Promise<Resort[]> {
    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top destinations:', error);
      return [];
    }

    return (data || []).map(adaptResortFromSupabase);
  }

  /**
   * Get hidden gems (high score + smaller size)
   * Smaller resorts (< 1000 acres, < 2000 vertical) with good scores
   */
  async getHiddenGems(limit: number = 12): Promise<Resort[]> {
    // Query for smaller resorts with decent data completeness
    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .lt('stats->skiableAcres', 1000) // Smaller acreage
      .gt('content_score', 0.3) // Has decent content
      .order('ranking_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching hidden gems:', error);
      return [];
    }

    return (data || []).map(adaptResortFromSupabase);
  }

  /**
   * Get night skiing and terrain park resorts
   */
  async getNightAndPark(limit: number = 12): Promise<Resort[]> {
    // Query for resorts with night skiing or terrain parks
    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .or('features->hasPark.eq.true,features->hasNightSkiing.eq.true')
      .order('ranking_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching night/park resorts:', error);
      return [];
    }

    return (data || []).map(adaptResortFromSupabase);
  }

  /**
   * Get powder and steep terrain resorts
   * High expert percentage (> 15%) or high snowfall
   */
  async getPowderAndSteeps(limit: number = 12): Promise<Resort[]> {
    // Query for expert terrain or high snowfall
    const { data, error } = await supabase
      .from('resorts_ranked' as 'resorts_full')
      .select('*')
      .eq('is_active', true)
      .or('terrain->expert.gt.15,stats->avgAnnualSnowfall.gt.300')
      .order('ranking_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching powder/steep resorts:', error);
      return [];
    }

    return (data || []).map(adaptResortFromSupabase);
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
    // Run all queries in parallel
    const [topDestinations, hiddenGems, nightAndPark, powderAndSteeps, lostSkiAreas] =
      await Promise.all([
        this.getTopDestinations(),
        this.getHiddenGems(),
        this.getNightAndPark(),
        this.getPowderAndSteeps(),
        this.getLostSkiAreas(),
      ]);

    return {
      topDestinations,
      hiddenGems,
      nightAndPark,
      powderAndSteeps,
      lostSkiAreas,
    };
  }
}

// Export singleton instance
export const themedResortsService = new ThemedResortsService();
