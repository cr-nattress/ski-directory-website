/**
 * API Request Validation Schemas
 *
 * Zod schemas for validating API request bodies and parameters.
 * Used by API routes to ensure type-safe input handling.
 */

import { z } from 'zod';

/**
 * Event types for engagement tracking
 */
export const eventTypeSchema = z.enum(['impression', 'click', 'dwell']);

/**
 * Context where engagement event occurred
 */
export const eventContextSchema = z.enum([
  'landing',
  'directory',
  'search',
  'themed_section',
  'map',
]);

/**
 * Single engagement event schema
 */
export const engagementEventSchema = z.object({
  resort_id: z.string().min(1, 'resort_id is required'),
  resort_slug: z.string().min(1, 'resort_slug is required'),
  event_type: eventTypeSchema,
  context: eventContextSchema.optional(),
  section_id: z.string().optional(),
  position_index: z.number().int().nonnegative().optional(),
  page_number: z.number().int().positive().optional(),
  session_id: z.string().optional(),
  dwell_seconds: z.number().nonnegative().optional(),
});

/**
 * Batch engagement events request schema
 */
export const engagementRequestSchema = z.object({
  events: z
    .array(engagementEventSchema)
    .min(1, 'At least one event is required')
    .max(100, 'Maximum 100 events per request'),
});

/**
 * Resort slug parameter schema
 */
export const resortSlugSchema = z.string().min(1).regex(
  /^[a-z0-9-]+$/,
  'Invalid slug format: must be lowercase alphanumeric with hyphens'
);

/**
 * Type exports derived from schemas
 */
export type EventType = z.infer<typeof eventTypeSchema>;
export type EventContext = z.infer<typeof eventContextSchema>;
export type EngagementEvent = z.infer<typeof engagementEventSchema>;
export type EngagementRequest = z.infer<typeof engagementRequestSchema>;

// =============================================================================
// localStorage Cache Schemas
// =============================================================================

/**
 * Pass affiliation enum for validation
 */
const passAffiliationSchema = z.enum([
  'epic',
  'ikon',
  'indy',
  'mountain-collective',
  'powder-alliance',
  'ny-ski3',
  'rcr-rockies',
  'lest-go',
  'freedom',
  'ski-big-3',
  'local',
]);

/**
 * Resort status enum for validation
 */
const resortStatusSchema = z.enum(['open', 'closed', 'opening-soon']);

/**
 * Map pin schema for cached data validation
 */
export const mapPinSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  nearestCity: z.string(),
  stateCode: z.string(),
  countryCode: z.string(),
  passAffiliations: z.array(passAffiliationSchema),
  rating: z.number(),
  status: resortStatusSchema,
  isActive: z.boolean(),
  isLost: z.boolean(),
  terrainOpenPercent: z.number().optional(),
  snowfall24h: z.number().optional(),
  liftsOpen: z.number().optional(),
  liftsTotal: z.number().optional(),
  liftsPercentage: z.number().optional(),
  weatherCondition: z.string().optional(),
  weatherHigh: z.number().optional(),
});

/**
 * Cached map pins data schema with timestamp
 */
export const cachedMapPinsSchema = z.object({
  pins: z.array(mapPinSchema),
  timestamp: z.number(),
});

/**
 * View mode enum for localStorage validation
 */
export const viewModeSchema = z.enum(['cards', 'map']);

/**
 * Type exports for localStorage cache
 */
export type CachedMapPins = z.infer<typeof cachedMapPinsSchema>;
export type ValidatedViewMode = z.infer<typeof viewModeSchema>;
