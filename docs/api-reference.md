---
title: "API Reference"
description: "Supabase services, React hooks, and API endpoints for the Ski Resort Directory"
tags:
  - api
  - supabase
  - hooks
  - endpoints
  - typescript
---

# API Reference

Supabase services, React hooks, and API endpoints.

## Table of Contents

- [Supabase Resort Service](#supabase-resort-service)
- [React Hooks](#react-hooks)
- [API Endpoints](#api-endpoints)
- [Validation Schemas](#validation-schemas)

## Supabase Resort Service

Located at `lib/api/supabase-resort-service.ts`.

### `getResortBySlug(slug)`

Fetch a single resort by URL slug.

```typescript
const result = await supabaseResortService.getResortBySlug('vail');
// Returns: ApiResponse<Resort | null>
```

### `getResortById(id)`

Fetch a single resort by UUID.

```typescript
const result = await supabaseResortService.getResortById('uuid-here');
// Returns: ApiResponse<Resort | null>
```

### `getResorts(options)`

Fetch paginated resort list with filters.

```typescript
const result = await supabaseResortService.getResorts({
  filters: {
    search: 'vail',
    passAffiliation: ['epic'],
    status: 'open',
    tags: ['family-friendly'],
  },
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  pageSize: 10,
});
// Returns: PaginatedResponse<Resort>
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filters.search` | string | - | Full-text search |
| `filters.passAffiliation` | string[] | - | Filter by pass types |
| `filters.status` | string | - | 'open' or 'closed' |
| `filters.tags` | string[] | - | Filter by tags |
| `sortBy` | string | 'name' | Sort field |
| `sortOrder` | string | 'asc' | 'asc' or 'desc' |
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page |

### `getAllResorts()`

Fetch all active resorts without pagination.

```typescript
const result = await supabaseResortService.getAllResorts();
// Returns: ApiResponse<Resort[]>
```

### `getMapPins()`

Fetch lightweight data for map markers.

```typescript
const result = await supabaseResortService.getMapPins();
// Returns: ApiResponse<ResortMapPin[]>
```

### `getResortsByState(stateSlug)`

Fetch all resorts in a specific state.

```typescript
const result = await supabaseResortService.getResortsByState('colorado');
// Returns: ApiResponse<Resort[]>
```

### `getResortsByPass(passType)`

Fetch all resorts with a specific pass affiliation.

```typescript
const result = await supabaseResortService.getResortsByPass('epic');
// Returns: ApiResponse<Resort[]>
```

### `getResortConditions(resortId)`

Fetch real-time conditions for a resort.

```typescript
const conditions = await supabaseResortService.getResortConditions('uuid');
// Returns: ResortConditions | null
```

### `searchResorts(query)`

Full-text search across resort names and descriptions.

```typescript
const result = await supabaseResortService.searchResorts('powder');
// Returns: ApiResponse<Resort[]>
```

## React Hooks

### `useMapPins()`

Fetch map pins with localStorage caching (5-minute TTL).

```typescript
import { useMapPins } from '@/lib/hooks/useMapPins';

function MapComponent() {
  const { pins, isLoading, error, refetch } = useMapPins();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <Map pins={pins} />;
}
```

### `useResorts(options)`

Fetch filtered resort list.

```typescript
import { useResorts } from '@/lib/hooks/useResorts';

function ResortList() {
  const { resorts, isLoading } = useResorts({
    state: 'colorado',
    pass: 'epic',
  });

  return resorts.map(r => <ResortCard key={r.id} resort={r} />);
}
```

### `useResort(slug)`

Fetch single resort by slug.

```typescript
import { useResort } from '@/lib/hooks/useResort';

function ResortPage({ slug }: { slug: string }) {
  const { resort, isLoading, error } = useResort(slug);

  if (isLoading) return <Spinner />;
  if (!resort) return <NotFound />;

  return <ResortDetail resort={resort} />;
}
```

### `useInfiniteResorts()`

Infinite scroll pagination for landing page.

```typescript
import { useInfiniteResorts } from '@/lib/hooks/useInfiniteResorts';

function InfiniteList() {
  const { resorts, loadMore, hasMore, isLoading } = useInfiniteResorts();

  return (
    <>
      {resorts.map(r => <ResortCard key={r.id} resort={r} />)}
      {hasMore && <LoadMoreButton onClick={loadMore} loading={isLoading} />}
    </>
  );
}
```

### `useViewMode()`

Toggle between cards and map view with localStorage persistence.

```typescript
import { useViewMode } from '@/lib/hooks/useViewMode';

function ViewToggle() {
  const { viewMode, setViewMode, isHydrated } = useViewMode();

  if (!isHydrated) return null; // Prevent hydration mismatch

  return (
    <button onClick={() => setViewMode(viewMode === 'cards' ? 'map' : 'cards')}>
      {viewMode === 'cards' ? 'Show Map' : 'Show Cards'}
    </button>
  );
}
```

### `useFeatureFlag(flag)`

Check if a feature flag is enabled.

```typescript
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

function WeatherSection() {
  const enabled = useFeatureFlag('weatherForecastCard');

  if (!enabled) return null;

  return <WeatherCard />;
}
```

## API Endpoints

### `POST /api/engagement`

Log engagement events (impressions, clicks, dwell time).

**Request:**
```json
{
  "events": [
    {
      "resort_id": "uuid",
      "resort_slug": "vail",
      "event_type": "impression",
      "context": "landing",
      "position_index": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "logged": 1
}
```

**Rate Limit:** 100 requests/minute

### `GET /api/resorts/[slug]/conditions`

Fetch real-time conditions for a resort.

**Response:**
```json
{
  "conditions": {
    "lifts_open": 12,
    "lifts_total": 31,
    "lifts_percentage": 38.7,
    "weather_high": 28,
    "weather_condition": "Partly Cloudy",
    "webcams": [
      {
        "name": "Base Area",
        "image": "https://..."
      }
    ]
  }
}
```

**Cache:** 5 minutes (stale-while-revalidate 15 minutes)
**Rate Limit:** 60 requests/minute

## Validation Schemas

Located at `lib/validation/api-schemas.ts`.

### `engagementEventSchema`

```typescript
const engagementEventSchema = z.object({
  resort_id: z.string().min(1),
  resort_slug: z.string().min(1),
  event_type: z.enum(['impression', 'click', 'dwell']),
  context: z.enum(['landing', 'directory', 'search', 'themed_section', 'map']).optional(),
  section_id: z.string().optional(),
  position_index: z.number().int().nonnegative().optional(),
  page_number: z.number().int().positive().optional(),
  session_id: z.string().optional(),
  dwell_seconds: z.number().nonnegative().optional(),
});
```

### `engagementRequestSchema`

```typescript
const engagementRequestSchema = z.object({
  events: z.array(engagementEventSchema)
    .min(1, 'At least one event is required')
    .max(100, 'Maximum 100 events per request'),
});
```

### `resortSlugSchema`

```typescript
const resortSlugSchema = z.string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format');
```

## Related

- [Architecture](./architecture.md) - System design
- [Data Model](./data-model.md) - Type definitions
- [Development Guide](./development.md) - Setup and patterns
