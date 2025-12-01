/**
 * Resort Data Service
 *
 * Provides data access functions for resort data from Supabase.
 * Use these functions in server components and API routes.
 */

import { supabase, createServerClient } from "@/lib/supabase";
import type { ResortFull, ResortListItem, StateStats, PassProgram } from "@/types/supabase";

// ============================================================================
// Types
// ============================================================================

export interface ResortFilters {
  search?: string;
  state?: string;
  country?: "us" | "ca";
  status?: "active" | "defunct";
  pass?: string;
  hasFeature?: keyof ResortFull["features"];
}

export interface ResortSortOptions {
  field: "name" | "state" | "skiable_acres" | "vertical_drop";
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Single Resort Queries
// ============================================================================

/**
 * Get a single resort by slug
 */
export async function getResortBySlug(slug: string): Promise<ResortFull | null> {
  const { data, error } = await supabase
    .from("resorts_full")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching resort:", error);
    return null;
  }

  return data;
}

/**
 * Get a single resort by ID
 */
export async function getResortById(id: string): Promise<ResortFull | null> {
  const { data, error } = await supabase
    .from("resorts_full")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching resort:", error);
    return null;
  }

  return data;
}

// ============================================================================
// Resort List Queries
// ============================================================================

/**
 * Get all resorts with optional filters
 */
export async function getResorts(
  filters?: ResortFilters,
  sort?: ResortSortOptions
): Promise<ResortFull[]> {
  let query = supabase.from("resorts_full").select("*");

  // Apply filters
  if (filters) {
    if (filters.search) {
      query = query.textSearch("fts", filters.search, {
        type: "websearch",
        config: "english",
      });
    }
    if (filters.state) {
      query = query.eq("state", filters.state);
    }
    if (filters.country) {
      query = query.eq("country", filters.country);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.pass) {
      query = query.contains("pass_affiliations", [filters.pass]);
    }
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === "asc" });
  } else {
    query = query.order("name", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching resorts:", error);
    return [];
  }

  return data || [];
}

/**
 * Get resorts with pagination
 */
export async function getResortsPaginated(
  filters?: ResortFilters,
  sort?: ResortSortOptions,
  pagination?: PaginationOptions
): Promise<PaginatedResult<ResortFull>> {
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("resorts_full").select("*", { count: "exact" });

  // Apply filters
  if (filters) {
    if (filters.state) {
      query = query.eq("state", filters.state);
    }
    if (filters.country) {
      query = query.eq("country", filters.country);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.pass) {
      query = query.contains("pass_affiliations", [filters.pass]);
    }
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === "asc" });
  } else {
    query = query.order("name", { ascending: true });
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching resorts:", error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: data || [],
    count: totalCount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get resorts by state
 */
export async function getResortsByState(stateSlug: string): Promise<ResortFull[]> {
  const { data, error } = await supabase
    .from("resorts_full")
    .select("*")
    .eq("state", stateSlug)
    .order("name");

  if (error) {
    console.error("Error fetching resorts by state:", error);
    return [];
  }

  return data || [];
}

/**
 * Get active resorts by state (for main listings)
 */
export async function getActiveResortsByState(stateSlug: string): Promise<ResortFull[]> {
  const { data, error } = await supabase
    .from("resorts_full")
    .select("*")
    .eq("state", stateSlug)
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Error fetching active resorts:", error);
    return [];
  }

  return data || [];
}

/**
 * Get defunct/lost resorts by state
 */
export async function getLostResortsByState(stateSlug: string): Promise<ResortFull[]> {
  const { data, error } = await supabase
    .from("resorts_full")
    .select("*")
    .eq("state", stateSlug)
    .eq("status", "defunct")
    .order("name");

  if (error) {
    console.error("Error fetching lost resorts:", error);
    return [];
  }

  return data || [];
}

/**
 * Get resorts by pass affiliation
 */
export async function getResortsByPass(passSlug: string): Promise<ResortFull[]> {
  const { data, error } = await supabase
    .from("resorts_full")
    .select("*")
    .contains("pass_affiliations", [passSlug])
    .order("name");

  if (error) {
    console.error("Error fetching resorts by pass:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Search
// ============================================================================

/**
 * Search resorts by name, description, or city
 */
export async function searchResorts(query: string, limit = 20): Promise<ResortListItem[]> {
  const { data, error } = await supabase
    .from("resorts_list")
    .select("*")
    .textSearch("fts", query, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) {
    console.error("Error searching resorts:", error);
    return [];
  }

  return data || [];
}

/**
 * Get resorts matching a name prefix (for autocomplete)
 */
export async function getResortSuggestions(prefix: string, limit = 10): Promise<ResortListItem[]> {
  const { data, error } = await supabase
    .from("resorts_list")
    .select("*")
    .ilike("name", `${prefix}%`)
    .order("name")
    .limit(limit);

  if (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// State & Statistics
// ============================================================================

/**
 * Get all states with resort counts
 */
export async function getStatesWithCounts(): Promise<StateStats[]> {
  const { data, error } = await supabase
    .from("resorts_by_state")
    .select("*")
    .order("country_code")
    .order("state_name");

  if (error) {
    console.error("Error fetching states:", error);
    return [];
  }

  return data || [];
}

/**
 * Get states for a specific country
 */
export async function getStatesByCountry(countryCode: "us" | "ca"): Promise<StateStats[]> {
  const { data, error } = await supabase
    .from("resorts_by_state")
    .select("*")
    .eq("country_code", countryCode)
    .order("state_name");

  if (error) {
    console.error("Error fetching states by country:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all pass programs
 */
export async function getPassPrograms(): Promise<PassProgram[]> {
  const { data, error } = await supabase
    .from("pass_programs")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching pass programs:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Static Params (for Next.js generateStaticParams)
// ============================================================================

/**
 * Get all resort slugs for static generation
 */
export async function getAllResortSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("resorts")
    .select("slug")
    .order("slug");

  if (error) {
    console.error("Error fetching resort slugs:", error);
    return [];
  }

  return data?.map((r: { slug: string }) => r.slug) || [];
}

/**
 * Get all state slugs for static generation
 */
export async function getAllStateSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("states")
    .select("slug")
    .order("slug");

  if (error) {
    console.error("Error fetching state slugs:", error);
    return [];
  }

  return data?.map((s: { slug: string }) => s.slug) || [];
}

/**
 * Get resort slugs by state (for nested static generation)
 */
export async function getResortSlugsByState(
  stateSlug: string
): Promise<{ slug: string; state: string }[]> {
  const { data, error } = await supabase
    .from("resorts")
    .select("slug, state_slug")
    .eq("state_slug", stateSlug)
    .order("slug");

  if (error) {
    console.error("Error fetching resort slugs by state:", error);
    return [];
  }

  return data?.map((r: { slug: string; state_slug: string }) => ({ slug: r.slug, state: r.state_slug })) || [];
}

// ============================================================================
// Aggregate Statistics
// ============================================================================

/**
 * Get overall statistics across all resorts
 */
export async function getOverallStats(): Promise<{
  totalResorts: number;
  activeResorts: number;
  totalStates: number;
  totalCountries: number;
}> {
  const { count: totalResorts } = await supabase
    .from("resorts")
    .select("*", { count: "exact", head: true });

  const { count: activeResorts } = await supabase
    .from("resorts")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalStates } = await supabase
    .from("states")
    .select("*", { count: "exact", head: true });

  return {
    totalResorts: totalResorts || 0,
    activeResorts: activeResorts || 0,
    totalStates: totalStates || 0,
    totalCountries: 2, // US and Canada
  };
}
