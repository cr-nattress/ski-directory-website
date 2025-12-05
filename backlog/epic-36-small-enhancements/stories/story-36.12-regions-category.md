# Story 36.12: Add Regions Category for Resorts

## Description

Add a "Regions" category to allow users to browse resorts by geographic region (e.g., Rocky Mountains, New England, Pacific Northwest, Alps, etc.).

## Acceptance Criteria

- [ ] Regions category available in filtering/browsing
- [ ] Resorts tagged with appropriate region(s)
- [ ] Region filter works in directory
- [ ] Region displayed on resort cards/detail pages (optional)

## Regions to Consider

### North America
- Rocky Mountains
- Pacific Northwest
- Sierra Nevada
- New England
- Great Lakes
- Appalachian
- Canadian Rockies
- Laurentian Mountains

### Europe (if applicable)
- Alps
- Pyrenees
- Scandinavian

## Data Requirements

- [ ] Add `region` field to resort data model
- [ ] Backfill region data for existing resorts
- [ ] May require Supabase migration

## Technical Notes

- Could be implemented as single value or array (resort spans multiple regions)
- Consider using a lookup table for regions

## Effort

Medium-Large (2-4 hours data + 2-4 hours UI)
