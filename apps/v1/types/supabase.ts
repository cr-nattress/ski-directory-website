/**
 * Supabase Database Types
 *
 * These types are generated based on the database schema.
 * To regenerate, run: npx supabase gen types typescript --project-id pczgfwlaywxbvgvvtafo
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          code: string;
          name: string;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      states: {
        Row: {
          slug: string;
          country_code: string;
          name: string;
          abbreviation: string | null;
          created_at: string;
        };
        Insert: {
          slug: string;
          country_code: string;
          name: string;
          abbreviation?: string | null;
          created_at?: string;
        };
        Update: {
          slug?: string;
          country_code?: string;
          name?: string;
          abbreviation?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "states_country_code_fkey";
            columns: ["country_code"];
            referencedRelation: "countries";
            referencedColumns: ["code"];
          }
        ];
      };
      pass_programs: {
        Row: {
          slug: string;
          name: string;
          website_url: string | null;
          logo_url: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          website_url?: string | null;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          website_url?: string | null;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      resorts: {
        Row: {
          id: string;
          slug: string;
          name: string;
          country_code: string;
          state_slug: string;
          status: "active" | "defunct";
          location: unknown | null; // PostGIS geography
          nearest_city: string | null;
          website_url: string | null;
          description: string | null;
          stats: ResortStats;
          terrain: ResortTerrain;
          features: ResortFeatures;
          asset_path: string;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          is_lost: boolean;
          fts: unknown | null; // tsvector
          major_city_id: string | null;
          distance_from_major_city: number | null;
          drive_time_to_major_city: number | null;
        };
        Insert: {
          id: string;
          slug: string;
          name: string;
          country_code: string;
          state_slug: string;
          status?: "active" | "defunct";
          location?: unknown | null;
          nearest_city?: string | null;
          website_url?: string | null;
          description?: string | null;
          stats?: ResortStats;
          terrain?: ResortTerrain;
          features?: ResortFeatures;
          asset_path: string;
          created_at?: string;
          updated_at?: string;
          major_city_id?: string | null;
          distance_from_major_city?: number | null;
          drive_time_to_major_city?: number | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          country_code?: string;
          state_slug?: string;
          status?: "active" | "defunct";
          location?: unknown | null;
          nearest_city?: string | null;
          website_url?: string | null;
          description?: string | null;
          stats?: ResortStats;
          terrain?: ResortTerrain;
          features?: ResortFeatures;
          asset_path?: string;
          created_at?: string;
          updated_at?: string;
          major_city_id?: string | null;
          distance_from_major_city?: number | null;
          drive_time_to_major_city?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "resorts_country_code_fkey";
            columns: ["country_code"];
            referencedRelation: "countries";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "resorts_state_slug_fkey";
            columns: ["state_slug"];
            referencedRelation: "states";
            referencedColumns: ["slug"];
          }
        ];
      };
      resort_passes: {
        Row: {
          resort_id: string;
          pass_slug: string;
          created_at: string;
        };
        Insert: {
          resort_id: string;
          pass_slug: string;
          created_at?: string;
        };
        Update: {
          resort_id?: string;
          pass_slug?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resort_passes_resort_id_fkey";
            columns: ["resort_id"];
            referencedRelation: "resorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resort_passes_pass_slug_fkey";
            columns: ["pass_slug"];
            referencedRelation: "pass_programs";
            referencedColumns: ["slug"];
          }
        ];
      };
      resort_tags: {
        Row: {
          resort_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          resort_id: string;
          tag: string;
          created_at?: string;
        };
        Update: {
          resort_id?: string;
          tag?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resort_tags_resort_id_fkey";
            columns: ["resort_id"];
            referencedRelation: "resorts";
            referencedColumns: ["id"];
          }
        ];
      };
      major_cities: {
        Row: {
          id: string;
          city_name: string;
          state_slug: string;
          latitude: number;
          longitude: number;
          is_primary: boolean;
          region: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_name: string;
          state_slug: string;
          latitude: number;
          longitude: number;
          is_primary?: boolean;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_name?: string;
          state_slug?: string;
          latitude?: number;
          longitude?: number;
          is_primary?: boolean;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "major_cities_state_slug_fkey";
            columns: ["state_slug"];
            referencedRelation: "states";
            referencedColumns: ["slug"];
          }
        ];
      };
    };
    Views: {
      resorts_full: {
        Row: {
          id: string;
          slug: string;
          name: string;
          country: string;
          country_name: string;
          state: string;
          state_name: string;
          status: "active" | "defunct";
          is_active: boolean;
          is_lost: boolean;
          lat: number | null;
          lng: number | null;
          nearest_city: string | null;
          stats: ResortStats;
          terrain: ResortTerrain;
          features: ResortFeatures;
          website_url: string | null;
          description: string | null;
          asset_path: string;
          created_at: string;
          updated_at: string;
          major_city_name: string | null;
          distance_from_major_city: number | null;
          drive_time_to_major_city: number | null;
          pass_affiliations: string[];
          tags: string[];
        };
      };
      resorts_list: {
        Row: {
          id: string;
          slug: string;
          name: string;
          country: string;
          state: string;
          state_name: string;
          status: "active" | "defunct";
          is_active: boolean;
          lat: number | null;
          lng: number | null;
          nearest_city: string | null;
          skiable_acres: string | null;
          vertical_drop: string | null;
          lifts_count: string | null;
          asset_path: string;
          major_city_name: string | null;
          distance_from_major_city: number | null;
          drive_time_to_major_city: number | null;
          pass_affiliations: string[];
        };
      };
      resorts_by_state: {
        Row: {
          state_slug: string;
          state_name: string;
          country_code: string;
          country_name: string;
          resort_count: number;
          active_count: number;
          defunct_count: number;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}

// ============================================================================
// JSONB Types
// ============================================================================

export interface ResortStats {
  skiableAcres?: number;
  liftsCount?: number;
  runsCount?: number;
  verticalDrop?: number;
  baseElevation?: number;
  summitElevation?: number;
  avgAnnualSnowfall?: number;
}

export interface ResortTerrain {
  beginner?: number;
  intermediate?: number;
  advanced?: number;
  expert?: number;
}

export interface ResortFeatures {
  hasPark?: boolean;
  hasHalfpipe?: boolean;
  hasNightSkiing?: boolean;
  hasBackcountryAccess?: boolean;
  hasSpaVillage?: boolean;
}

// ============================================================================
// Convenience Types
// ============================================================================

export type Country = Database["public"]["Tables"]["countries"]["Row"];
export type State = Database["public"]["Tables"]["states"]["Row"];
export type PassProgram = Database["public"]["Tables"]["pass_programs"]["Row"];
export type Resort = Database["public"]["Tables"]["resorts"]["Row"];
export type ResortPass = Database["public"]["Tables"]["resort_passes"]["Row"];
export type ResortTag = Database["public"]["Tables"]["resort_tags"]["Row"];
export type MajorCity = Database["public"]["Tables"]["major_cities"]["Row"];

export type ResortFull = Database["public"]["Views"]["resorts_full"]["Row"];
export type ResortListItem = Database["public"]["Views"]["resorts_list"]["Row"];
export type StateStats = Database["public"]["Views"]["resorts_by_state"]["Row"];

// ============================================================================
// Query Result Types
// ============================================================================

export interface ResortWithRelations extends Resort {
  countries: Country;
  states: State;
  resort_passes: ResortPass[];
  resort_tags: ResortTag[];
}
