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
