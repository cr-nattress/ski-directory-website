# Story 29.3: Add Zod Validation to API Routes

## Priority: High

## Context

API routes currently use manual validation which is verbose and doesn't provide type inference. Zod provides runtime validation with automatic TypeScript type inference, making the code more maintainable and type-safe.

## Current State

**Location:** `apps/v1/app/api/engagement/route.ts`

**Current Code:**
```typescript
function validateEvent(event: unknown): event is EngagementEvent {
  if (typeof event !== 'object' || event === null) return false;
  const e = event as Record<string, unknown>;
  if (typeof e.resort_id !== 'string' || !e.resort_id) return false;
  if (typeof e.resort_slug !== 'string' || !e.resort_slug) return false;
  if (typeof e.event_type !== 'string' || !isValidEventType(e.event_type)) return false;
  // ... more manual checks
}
```

## Requirements

1. Install Zod as a dependency
2. Create Zod schemas for API request bodies
3. Replace manual validation with Zod parsing
4. Return structured error responses on validation failure
5. Apply to all API routes (engagement, conditions)

## Implementation

### Step 1: Install Zod

```bash
cd apps/v1
npm install zod
```

### Step 2: Create Validation Schemas

Create `apps/v1/lib/api/schemas.ts`:

```typescript
import { z } from 'zod';

// Engagement API schemas
export const EventTypeSchema = z.enum(['impression', 'click', 'dwell']);
export const EventContextSchema = z.enum(['landing', 'directory', 'search', 'themed_section', 'map']);

export const EngagementEventSchema = z.object({
  resort_id: z.string().uuid(),
  resort_slug: z.string().min(1).max(100),
  event_type: EventTypeSchema,
  context: EventContextSchema.optional(),
  section_id: z.string().max(50).optional(),
  position_index: z.number().int().min(0).optional(),
  page_number: z.number().int().min(1).optional(),
  session_id: z.string().uuid().optional(),
  dwell_seconds: z.number().min(0).optional(),
});

export const EngagementRequestSchema = z.object({
  events: z.array(EngagementEventSchema).min(1).max(100),
});

// Infer types from schemas
export type EngagementEvent = z.infer<typeof EngagementEventSchema>;
export type EngagementRequest = z.infer<typeof EngagementRequestSchema>;
```

### Step 3: Update API Route

```typescript
import { EngagementRequestSchema } from '@/lib/api/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const result = EngagementRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: result.error.issues.map(i => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { events } = result.data;

    // Insert events - now fully typed
    const { error } = await supabase
      .from('resort_impressions')
      .insert(events);

    // ...
  } catch (error) {
    // ...
  }
}
```

### Step 4: Apply to Conditions API

Create schema for slug parameter validation if needed.

## Acceptance Criteria

- [ ] Zod installed as dependency
- [ ] Validation schemas created in `lib/api/schemas.ts`
- [ ] Engagement API uses Zod validation
- [ ] Conditions API validates slug parameter
- [ ] Error responses include structured validation errors
- [ ] All type definitions derived from Zod schemas
- [ ] Manual validation functions removed

## Testing

1. Send valid engagement event - should succeed
2. Send event with missing required field - should return 400 with field path
3. Send event with invalid type - should return 400 with type error
4. Send more than 100 events - should return 400 with max length error
5. Test conditions API with invalid slug format

## Effort: Medium (2-4 hours)
