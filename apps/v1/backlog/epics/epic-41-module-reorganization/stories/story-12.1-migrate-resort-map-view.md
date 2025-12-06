# Story 12.1: Migrate ResortMapView Component

## Description
Move the ResortMapView component from `components/` to `modules/dashboard/components/map/`.

## Acceptance Criteria
- [ ] ResortMapView copied to `modules/dashboard/components/map/ResortMapView.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Map view renders correctly with pins

## Files to Migrate
- `components/ResortMapView.tsx` → `modules/dashboard/components/map/ResortMapView.tsx`

## Tasks

1. Create `modules/dashboard/components/map/` directory
2. Copy `components/ResortMapView.tsx` to new location
3. Update any internal imports if needed
4. Update `components/ResortMapView.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/map/ResortMapView';
   ```
5. Create `modules/dashboard/components/map/index.ts` barrel export
6. Update `modules/dashboard/index.ts` to include map exports

## Testing
- `npm run build` passes
- Map renders with Leaflet
- Resort pins show correctly
- Pin popups work

## Notes
- Ensure dynamic import with `ssr: false` is maintained for Leaflet compatibility

## Estimated Effort
15 minutes
