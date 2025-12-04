/**
 * API Schema Validation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  engagementEventSchema,
  engagementRequestSchema,
  resortSlugSchema,
  eventTypeSchema,
  eventContextSchema,
} from '../api-schemas';

describe('eventTypeSchema', () => {
  it('accepts valid event types', () => {
    expect(eventTypeSchema.safeParse('impression').success).toBe(true);
    expect(eventTypeSchema.safeParse('click').success).toBe(true);
    expect(eventTypeSchema.safeParse('dwell').success).toBe(true);
  });

  it('rejects invalid event types', () => {
    expect(eventTypeSchema.safeParse('view').success).toBe(false);
    expect(eventTypeSchema.safeParse('hover').success).toBe(false);
    expect(eventTypeSchema.safeParse('').success).toBe(false);
  });
});

describe('eventContextSchema', () => {
  it('accepts valid contexts', () => {
    expect(eventContextSchema.safeParse('landing').success).toBe(true);
    expect(eventContextSchema.safeParse('directory').success).toBe(true);
    expect(eventContextSchema.safeParse('search').success).toBe(true);
    expect(eventContextSchema.safeParse('themed_section').success).toBe(true);
    expect(eventContextSchema.safeParse('map').success).toBe(true);
  });

  it('rejects invalid contexts', () => {
    expect(eventContextSchema.safeParse('home').success).toBe(false);
    expect(eventContextSchema.safeParse('detail').success).toBe(false);
  });
});

describe('engagementEventSchema', () => {
  it('accepts valid event with required fields only', () => {
    const result = engagementEventSchema.safeParse({
      resort_id: 'uuid-123',
      resort_slug: 'vail',
      event_type: 'impression',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid event with all fields', () => {
    const result = engagementEventSchema.safeParse({
      resort_id: 'uuid-123',
      resort_slug: 'vail',
      event_type: 'click',
      context: 'landing',
      section_id: 'featured',
      position_index: 0,
      page_number: 1,
      session_id: 'session-abc',
      dwell_seconds: 5.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects event missing resort_id', () => {
    const result = engagementEventSchema.safeParse({
      resort_slug: 'vail',
      event_type: 'impression',
    });
    expect(result.success).toBe(false);
  });

  it('rejects event with empty resort_id', () => {
    const result = engagementEventSchema.safeParse({
      resort_id: '',
      resort_slug: 'vail',
      event_type: 'impression',
    });
    expect(result.success).toBe(false);
  });

  it('rejects event with invalid event_type', () => {
    const result = engagementEventSchema.safeParse({
      resort_id: 'uuid-123',
      resort_slug: 'vail',
      event_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects event with negative position_index', () => {
    const result = engagementEventSchema.safeParse({
      resort_id: 'uuid-123',
      resort_slug: 'vail',
      event_type: 'impression',
      position_index: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('engagementRequestSchema', () => {
  it('accepts valid request with one event', () => {
    const result = engagementRequestSchema.safeParse({
      events: [
        {
          resort_id: 'uuid-123',
          resort_slug: 'vail',
          event_type: 'impression',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid request with multiple events', () => {
    const result = engagementRequestSchema.safeParse({
      events: [
        { resort_id: 'uuid-1', resort_slug: 'vail', event_type: 'impression' },
        { resort_id: 'uuid-2', resort_slug: 'aspen', event_type: 'click' },
        { resort_id: 'uuid-3', resort_slug: 'telluride', event_type: 'dwell', dwell_seconds: 10 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty events array', () => {
    const result = engagementRequestSchema.safeParse({
      events: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects request with more than 100 events', () => {
    const events = Array.from({ length: 101 }, (_, i) => ({
      resort_id: `uuid-${i}`,
      resort_slug: `resort-${i}`,
      event_type: 'impression' as const,
    }));
    const result = engagementRequestSchema.safeParse({ events });
    expect(result.success).toBe(false);
  });

  it('rejects request missing events field', () => {
    const result = engagementRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('resortSlugSchema', () => {
  it('accepts valid slugs', () => {
    expect(resortSlugSchema.safeParse('vail').success).toBe(true);
    expect(resortSlugSchema.safeParse('park-city').success).toBe(true);
    expect(resortSlugSchema.safeParse('copper-mountain').success).toBe(true);
    expect(resortSlugSchema.safeParse('snowbird-utah').success).toBe(true);
    expect(resortSlugSchema.safeParse('a1').success).toBe(true);
  });

  it('rejects empty slug', () => {
    expect(resortSlugSchema.safeParse('').success).toBe(false);
  });

  it('rejects slugs with uppercase letters', () => {
    expect(resortSlugSchema.safeParse('Vail').success).toBe(false);
    expect(resortSlugSchema.safeParse('VAIL').success).toBe(false);
  });

  it('rejects slugs with spaces', () => {
    expect(resortSlugSchema.safeParse('park city').success).toBe(false);
  });

  it('rejects slugs with special characters', () => {
    expect(resortSlugSchema.safeParse('vail!').success).toBe(false);
    expect(resortSlugSchema.safeParse('vail_resort').success).toBe(false);
    expect(resortSlugSchema.safeParse('vail.com').success).toBe(false);
  });
});
