# Story 29.6: Replace `any` Type Assertions

## Priority: Medium

## Context

The codebase contains 6 `as any` type assertions that bypass TypeScript's type checking. These should be replaced with proper types or documented justifications.

## Current State

**Locations:**
1. `apps/v1/lib/api/supabase-resort-service.ts:407` - Supabase view query
2. `apps/v1/lib/api/supabase-resort-service.ts:447` - Data transformation
3. `apps/v1/components/directory/DirectoryContent.tsx:130` - Pass filter type
4. `apps/v1/components/ResortMapView.tsx:104` - Leaflet internal property
5. `apps/v1/components/resort-detail/LocationMapCard.tsx:21` - Leaflet internal property
6. `apps/v1/scripts/update-colorado-locations.ts:96` - Script (lower priority)

## Requirements

1. Replace each `as any` with proper type assertion
2. If unavoidable, add comment explaining why
3. Update Supabase types for views not in generated types

## Implementation

### Fix 1: Supabase View Query (Line 407)

**Current:**
```typescript
const { data, error } = await supabase
  .from("resorts_map_pins" as any)
  .select("*");
```

**Fix:** Add view type to `types/supabase.ts`:
```typescript
// In Database interface, under Views:
resorts_map_pins: {
  Row: {
    id: string;
    slug: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    nearest_city: string | null;
    country_code: string;
    state_code: string;
    pass_affiliations: string[];
    rating: number;
    is_open: boolean;
    is_active: boolean;
    is_lost: boolean;
    terrain_open_percent: number | null;
    snowfall_24h: number | null;
  };
};
```

Then use:
```typescript
const { data, error } = await supabase
  .from("resorts_map_pins")
  .select("*");
```

### Fix 2: Data Transformation (Line 447)

**Current:**
```typescript
const pins: ResortMapPin[] = ((data as any[]) || [])
```

**Fix:** Use the proper view type:
```typescript
type MapPinRow = Database['public']['Views']['resorts_map_pins']['Row'];
const pins: ResortMapPin[] = (data as MapPinRow[] || [])
  .filter(row => row.is_active)
  .map(row => ({ /* ... */ }));
```

### Fix 3: Pass Filter Type (DirectoryContent.tsx:130)

**Current:**
```typescript
resort.passAffiliations.includes(passFilter as any)
```

**Fix:** Type the passFilter properly:
```typescript
import type { PassAffiliation } from '@/lib/types';

// Ensure passFilter is typed as PassAffiliation | 'all'
const passFilter: PassAffiliation | 'all' = // ...

// Then use type guard
if (passFilter !== 'all') {
  resort.passAffiliations.includes(passFilter)
}
```

### Fix 4 & 5: Leaflet Internal Property

**Current:**
```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
```

**Justification:** This is a known Leaflet workaround for webpack. Add comment:
```typescript
// Leaflet workaround: Delete default icon URL to prevent webpack issues
// See: https://github.com/Leaflet/Leaflet/issues/4968
// @ts-expect-error - Accessing internal Leaflet property
delete L.Icon.Default.prototype._getIconUrl;
```

Or create a typed helper:
```typescript
function fixLeafletDefaultIcon(L: typeof import('leaflet')) {
  const proto = L.Icon.Default.prototype as { _getIconUrl?: unknown };
  delete proto._getIconUrl;
}
```

## Acceptance Criteria

- [ ] View types added to `types/supabase.ts`
- [ ] Supabase queries use proper types
- [ ] PassFilter typed correctly
- [ ] Leaflet fixes documented with comments
- [ ] No unexplained `as any` remaining
- [ ] TypeScript compiles without errors

## Testing

1. Run `npx tsc --noEmit`
2. Test map pin loading
3. Test directory filtering
4. Verify map renders correctly

## Effort: Small (< 2 hours)
