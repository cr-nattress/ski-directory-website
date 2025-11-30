# Plan: Fix Hardcoded /colorado/ URLs

## Problem Summary

Non-Colorado resorts incorrectly use `/colorado/` in their URLs instead of their actual state. The app has **11 instances of hardcoded "/colorado/"** across 5 components, plus a missing `stateCode` field in the Resort type.

## Root Cause

1. **Resort type lacks `stateCode`** - The main Resort interface doesn't have a direct `stateCode` field (only buried in `assetLocation.state`)
2. **Components hardcode `/colorado/`** - When building URLs, components use template literals with hardcoded state
3. **Mock data hardcodes 'CO'** - The mock data fallback always returns 'CO' as stateCode

## Solution

### Step 1: Add `stateCode` to Resort Type

**File:** `apps/v1/lib/mock-data/types.ts`

Add `stateCode: string` to the Resort interface for direct access.

### Step 2: Update Supabase Adapter

**File:** `apps/v1/lib/api/supabase-resort-adapter.ts`

Ensure `stateCode` is populated from `state_code` database column when adapting Resort objects.

### Step 3: Update Mock Data Service (if still used)

**File:** `apps/v1/lib/api/resort-service.ts`

Update mock data to derive stateCode from `assetLocation.state` instead of hardcoding 'CO'.

### Step 4: Fix Components (6 files, 11 instances)

Replace hardcoded `/colorado/` with dynamic `/${resort.stateCode}/` or equivalent:

| File | Lines to Fix | Change |
|------|--------------|--------|
| `components/ResortCard.tsx` | 33 | `/colorado/${resort.slug}` → `/${resort.stateCode}/${resort.slug}` |
| `components/directory/DirectoryTable.tsx` | 188, 366 | Same pattern (2 instances) |
| `components/directory/DirectoryList.tsx` | 49, 251 | Same pattern (2 instances) |
| `components/resort-detail/ResortStructuredData.tsx` | 71, 74 | Same pattern (2 instances) |
| `components/resort-detail/ResortDetail.tsx` | 24, 37 | Same pattern (2 instances) |

**Note:** `ResortMapView.tsx` already correctly uses `pin.stateCode` - no changes needed.

### Step 5: Add Helper Function (Optional)

Create a utility function for consistent URL generation:

```typescript
// lib/utils/resort-url.ts
export function getResortUrl(stateCode: string, slug: string): string {
  return `/${stateCode.toLowerCase()}/${slug}`;
}
```

## Files to Modify

1. `apps/v1/lib/mock-data/types.ts` - Add stateCode to Resort interface
2. `apps/v1/lib/api/supabase-resort-adapter.ts` - Map state_code to stateCode
3. `apps/v1/lib/api/resort-service.ts` - Fix mock data stateCode derivation
4. `apps/v1/components/ResortCard.tsx` - Dynamic URL
5. `apps/v1/components/directory/DirectoryTable.tsx` - Dynamic URLs (2x)
6. `apps/v1/components/directory/DirectoryList.tsx` - Dynamic URLs (2x)
7. `apps/v1/components/resort-detail/ResortStructuredData.tsx` - Dynamic URLs (2x)
8. `apps/v1/components/resort-detail/ResortDetail.tsx` - Dynamic URLs (2x)

## Testing

After changes:
1. Verify Colorado resorts still work: `/colorado/vail`
2. Verify non-Colorado resorts work: `/utah/park-city`, `/vermont/stowe`
3. Check map popup "View Details" links
4. Check directory page links
5. Check resort card links on home page
6. Verify breadcrumbs show correct state
7. Inspect JSON-LD structured data for correct URLs

## Risk Assessment

- **Low risk** - Changes are straightforward string replacements
- **Backward compatible** - Colorado URLs unchanged
- **SEO impact** - Structured data URLs will be corrected (positive change)
