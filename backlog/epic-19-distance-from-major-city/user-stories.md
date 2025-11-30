# Epic 19: Distance from Major City Feature

## Overview

Replace the hardcoded "Distance from Denver" references throughout the codebase with a dynamic "Distance from Major City" feature. Each state/province will have a designated major city, and resorts will display their distance from that city. This makes the feature relevant for all states, not just Colorado.

## Problem Statement

Currently, the application has hardcoded references to "Denver" for distance calculations:
- `distanceFromDenver` and `driveTimeFromDenver` fields in Resort type
- UI displays "X miles from Denver" regardless of the resort's state
- Sorting by "Nearest to Denver" in directory filters
- Colorado-centric language that doesn't make sense for Utah, Vermont, California, etc.

## Solution

1. Create a `major_cities` reference table in Supabase mapping each state to its ski-centric major city
2. Add `distance_from_major_city` and `drive_time_to_major_city` columns to resorts table
3. Add `major_city_id` foreign key to resorts table
4. Update all UI components to display the dynamic city name
5. Update type definitions and adapters
6. Migrate existing Denver data for Colorado resorts

## Major Cities by State (Initial List)

| State | Major City | Rationale |
|-------|------------|-----------|
| Colorado | Denver | Front Range population center |
| Utah | Salt Lake City | Main airport and population hub |
| California | Los Angeles / San Francisco | Split by region (SoCal/NorCal) |
| Vermont | Burlington | Largest city, airport |
| New Hampshire | Boston, MA | Primary visitor market |
| Montana | Missoula / Bozeman | Split by region |
| Wyoming | Denver, CO | Closest major airport for Jackson |
| Idaho | Boise | State capital, population center |
| Washington | Seattle | Major population and airport |
| Oregon | Portland | Major population and airport |
| New York | New York City | Primary visitor market |
| Michigan | Detroit | Major population center |
| British Columbia | Vancouver | Major city and airport |
| Alberta | Calgary | Gateway to Banff/Lake Louise |
| Quebec | Montreal | Major population center |
| Ontario | Toronto | Major population center |

---

## User Stories

### Phase 1: Database Schema Updates

#### Story 19.1: Create Major Cities Reference Table
**Priority:** High | **Effort:** Small

**As a** developer
**I want** a major_cities reference table in Supabase
**So that** each state can have a designated major city for distance calculations

**Acceptance Criteria:**
- [ ] Create `major_cities` table with columns:
  - `id` (UUID, primary key)
  - `city_name` (TEXT, not null) - e.g., "Denver"
  - `state_slug` (TEXT, foreign key to states) - e.g., "colorado"
  - `latitude` (DECIMAL)
  - `longitude` (DECIMAL)
  - `is_primary` (BOOLEAN) - for states with multiple cities
  - `created_at`, `updated_at` timestamps
- [ ] Add unique constraint on (state_slug, is_primary) where is_primary = true
- [ ] Populate initial data for all states with ski resorts
- [ ] Create migration file: `20251130_001_major_cities_table.sql`

**Technical Notes:**
- Some states may have multiple cities (California: LA + SF)
- `is_primary` flag determines which city is used by default
- Consider adding `region` field for states with regional splits

---

#### Story 19.2: Add Distance Fields to Resorts Table
**Priority:** High | **Effort:** Small

**As a** developer
**I want** generic distance fields on the resorts table
**So that** each resort can store its distance from its state's major city

**Acceptance Criteria:**
- [ ] Add columns to `resorts` table:
  - `major_city_id` (UUID, foreign key to major_cities, nullable)
  - `distance_from_major_city` (INTEGER, miles)
  - `drive_time_to_major_city` (INTEGER, minutes)
- [ ] Create index on `major_city_id`
- [ ] Create migration file: `20251130_002_resort_distance_fields.sql`
- [ ] Add foreign key constraint to major_cities table

**Technical Notes:**
- Fields are nullable to support gradual migration
- Distance stored in miles (can convert to km in UI if needed)
- Drive time stored in minutes

---

#### Story 19.3: Update resorts_full View
**Priority:** High | **Effort:** Small

**As a** developer
**I want** the resorts_full view to include major city information
**So that** the API returns the city name along with distance data

**Acceptance Criteria:**
- [ ] Update `resorts_full` view to join with `major_cities`
- [ ] Include fields:
  - `major_city_name` (from major_cities.city_name)
  - `distance_from_major_city`
  - `drive_time_to_major_city`
- [ ] Create migration file: `20251130_003_update_resorts_full_view.sql`
- [ ] Verify view returns correct data

---

#### Story 19.4: Migrate Colorado Distance Data
**Priority:** High | **Effort:** Medium

**As a** developer
**I want** to migrate existing Colorado distance data to the new schema
**So that** Colorado resorts retain their distance from Denver information

**Acceptance Criteria:**
- [ ] Create Denver entry in major_cities table
- [ ] Create migration script to:
  - Set `major_city_id` for all Colorado resorts
  - Copy existing distance values (if stored elsewhere) or calculate from coordinates
- [ ] Verify all 76 Colorado resorts have distance data
- [ ] Create migration file: `20251130_004_migrate_colorado_distances.sql`

**Technical Notes:**
- Current mock data has `distanceFromDenver` values
- May need to calculate actual distances using PostGIS
- Denver coordinates: 39.7392° N, 104.9903° W

---

### Phase 2: TypeScript Type Updates

#### Story 19.5: Update Supabase Types
**Priority:** High | **Effort:** Small

**As a** developer
**I want** the Supabase TypeScript types updated
**So that** the new fields are properly typed in the application

**Acceptance Criteria:**
- [ ] Regenerate types with `npx supabase gen types typescript`
- [ ] Verify `MajorCity` type is generated
- [ ] Verify `ResortFull` includes new distance fields
- [ ] Update `types/supabase.ts` file
- [ ] Add custom type exports if needed

---

#### Story 19.6: Update Resort Frontend Type
**Priority:** High | **Effort:** Small

**As a** developer
**I want** the frontend Resort type updated to use generic distance fields
**So that** components can display city-specific distance information

**Acceptance Criteria:**
- [ ] Update `lib/mock-data/types.ts`:
  - Replace `distanceFromDenver: number` with `distanceFromMajorCity: number`
  - Replace `driveTimeFromDenver: number` with `driveTimeToMajorCity: number`
  - Add `majorCityName: string`
- [ ] Mark old fields as deprecated with JSDoc comments
- [ ] Update any dependent type imports

**File:** `apps/v1/lib/mock-data/types.ts`

---

#### Story 19.7: Update Supabase Resort Adapter
**Priority:** High | **Effort:** Small

**As a** developer
**I want** the Supabase adapter to map the new distance fields
**So that** data flows correctly from database to frontend

**Acceptance Criteria:**
- [ ] Update `adaptResortFromSupabase()` function:
  - Map `major_city_name` → `majorCityName`
  - Map `distance_from_major_city` → `distanceFromMajorCity`
  - Map `drive_time_to_major_city` → `driveTimeToMajorCity`
- [ ] Remove hardcoded `distanceFromDenver: 0` defaults
- [ ] Handle null values gracefully (default to 0 or undefined)

**File:** `apps/v1/lib/api/supabase-resort-adapter.ts`

---

### Phase 3: UI Component Updates

#### Story 19.8: Update ResortCard Distance Display
**Priority:** High | **Effort:** Small

**As a** user
**I want** to see the distance from the relevant major city on resort cards
**So that** I can quickly understand how far each resort is from the nearest metro area

**Acceptance Criteria:**
- [ ] Update `ResortCard.tsx` to use `distanceFromMajorCity`
- [ ] Display city name dynamically (not hardcoded "Denver")
- [ ] Format: "X mi from [City]" or just "X mi" with tooltip
- [ ] Handle cases where distance data is missing

**File:** `apps/v1/components/ResortCard.tsx`

**Current Code:**
```tsx
<span>{formatDistance(resort.distanceFromDenver)}</span>
```

**New Code:**
```tsx
<span>{formatDistance(resort.distanceFromMajorCity)}</span>
// Or with city name: `${formatDistance(resort.distanceFromMajorCity)} from ${resort.majorCityName}`
```

---

#### Story 19.9: Update LocationCard Distance Display
**Priority:** High | **Effort:** Small

**As a** user viewing a resort detail page
**I want** to see the distance from the relevant major city
**So that** I can plan my trip with accurate location context

**Acceptance Criteria:**
- [ ] Update `LocationCard.tsx` to use new distance fields
- [ ] Display: "X miles from [City Name]"
- [ ] Display: "X minute drive"
- [ ] Remove hardcoded "Denver" text

**File:** `apps/v1/components/resort-detail/LocationCard.tsx`

**Current Code:**
```tsx
<p className="text-sm text-gray-600">
  {resort.distanceFromDenver} miles from Denver
</p>
<p className="text-sm text-gray-600">
  {resort.driveTimeFromDenver} minute drive
</p>
```

**New Code:**
```tsx
<p className="text-sm text-gray-600">
  {resort.distanceFromMajorCity} miles from {resort.majorCityName}
</p>
<p className="text-sm text-gray-600">
  {resort.driveTimeToMajorCity} minute drive
</p>
```

---

#### Story 19.10: Update DirectoryTable Distance Display
**Priority:** High | **Effort:** Small

**As a** user viewing the A-Z directory
**I want** to see the distance from the relevant major city in the table
**So that** I can compare resort distances in the sortable directory

**Acceptance Criteria:**
- [ ] Update `DirectoryTable.tsx` subtitle to use new fields
- [ ] Display: "X mi from [City]" under resort name
- [ ] Handle cases where city name is missing

**File:** `apps/v1/components/directory/DirectoryTable.tsx`

**Current Code:**
```tsx
<div className="text-xs text-gray-500 mt-0.5">
  {resort.distanceFromDenver} mi from Denver
</div>
```

**New Code:**
```tsx
<div className="text-xs text-gray-500 mt-0.5">
  {resort.distanceFromMajorCity} mi from {resort.majorCityName}
</div>
```

---

#### Story 19.11: Update DirectoryFilters Sort Label
**Priority:** Medium | **Effort:** Small

**As a** user filtering the directory
**I want** the sort option to say "Nearest" instead of "Nearest to Denver"
**So that** the label makes sense for all states

**Acceptance Criteria:**
- [ ] Update sort option label from "Nearest to Denver" to "Nearest to City" or just "Nearest"
- [ ] Consider showing current state's city name if filtering by state
- [ ] Update aria labels for accessibility

**File:** `apps/v1/components/directory/DirectoryFilters.tsx`

**Current Code:**
```tsx
{ value: 'distance', label: 'Nearest to Denver' },
```

**New Code:**
```tsx
{ value: 'distance', label: 'Nearest' },
```

---

### Phase 4: Service Layer Updates

#### Story 19.12: Update Resort Service Distance Filtering
**Priority:** Medium | **Effort:** Small

**As a** developer
**I want** the resort service to filter/sort by the new distance field
**So that** distance-based queries work correctly

**Acceptance Criteria:**
- [ ] Update `getNearbyResorts()` to use `distanceFromMajorCity`
- [ ] Update distance sorting logic to use new field
- [ ] Update any distance filters in `filterResorts()`
- [ ] Ensure backward compatibility during migration

**File:** `apps/v1/lib/api/resort-service.ts`

**Current Code:**
```typescript
.filter((r) => r.distanceFromDenver <= maxDistance)
.sort((a, b) => a.distanceFromDenver - b.distanceFromDenver)
```

**New Code:**
```typescript
.filter((r) => r.distanceFromMajorCity <= maxDistance)
.sort((a, b) => a.distanceFromMajorCity - b.distanceFromMajorCity)
```

---

#### Story 19.13: Update Mock Data Distance Fields
**Priority:** Low | **Effort:** Medium

**As a** developer
**I want** the mock data updated with new field names
**So that** the application works when Supabase is disabled

**Acceptance Criteria:**
- [ ] Update `lib/mock-data/resorts.ts`:
  - Rename `distanceFromDenver` → `distanceFromMajorCity`
  - Rename `driveTimeFromDenver` → `driveTimeToMajorCity`
  - Add `majorCityName: 'Denver'` for all Colorado resorts
- [ ] Update `lib/mock-data/resorts-from-json.ts` similarly
- [ ] Ensure mock data index exports work

**Files:**
- `apps/v1/lib/mock-data/resorts.ts`
- `apps/v1/lib/mock-data/resorts-from-json.ts`

---

### Phase 5: Documentation & Cleanup

#### Story 19.14: Update CLAUDE.md Documentation
**Priority:** Low | **Effort:** Small

**As a** developer
**I want** CLAUDE.md updated with the new data model
**So that** future development has accurate documentation

**Acceptance Criteria:**
- [ ] Update Resort data model documentation
- [ ] Document major_cities table
- [ ] Update common gotchas if applicable
- [ ] Add notes about state-specific distance display

---

#### Story 19.15: Remove Deprecated Denver Fields
**Priority:** Low | **Effort:** Medium

**As a** developer
**I want** deprecated Denver-specific fields removed
**So that** the codebase is clean and consistent

**Acceptance Criteria:**
- [ ] Remove `distanceFromDenver` from Resort type
- [ ] Remove `driveTimeFromDenver` from Resort type
- [ ] Remove any remaining hardcoded "Denver" strings
- [ ] Run full build to catch any missed references
- [ ] Update any tests that reference old fields

**Prerequisites:** All other stories completed and tested

---

## Summary

| Phase | Stories | Effort |
|-------|---------|--------|
| Phase 1: Database | 19.1-19.4 | Medium |
| Phase 2: Types | 19.5-19.7 | Small |
| Phase 3: UI | 19.8-19.11 | Small |
| Phase 4: Services | 19.12-19.13 | Small |
| Phase 5: Cleanup | 19.14-19.15 | Small |

**Total Stories:** 15
**Estimated Total Effort:** Medium

## Dependencies

- Epic 17: Supabase Migration (completed)
- Existing resort data with coordinates for distance calculation

## Files to Modify

### Database/Migrations
- `apps/v1/supabase/migrations/20251130_001_major_cities_table.sql` (new)
- `apps/v1/supabase/migrations/20251130_002_resort_distance_fields.sql` (new)
- `apps/v1/supabase/migrations/20251130_003_update_resorts_full_view.sql` (new)
- `apps/v1/supabase/migrations/20251130_004_migrate_colorado_distances.sql` (new)

### Types
- `apps/v1/types/supabase.ts` (regenerate)
- `apps/v1/lib/mock-data/types.ts` (modify)

### Adapters/Services
- `apps/v1/lib/api/supabase-resort-adapter.ts` (modify)
- `apps/v1/lib/api/resort-service.ts` (modify)
- `apps/v1/lib/services/resort-service.ts` (verify)

### Components
- `apps/v1/components/ResortCard.tsx` (modify)
- `apps/v1/components/resort-detail/LocationCard.tsx` (modify)
- `apps/v1/components/directory/DirectoryTable.tsx` (modify)
- `apps/v1/components/directory/DirectoryFilters.tsx` (modify)

### Mock Data
- `apps/v1/lib/mock-data/resorts.ts` (modify ~50 occurrences)
- `apps/v1/lib/mock-data/resorts-from-json.ts` (modify)

### Documentation
- `CLAUDE.md` (update)
