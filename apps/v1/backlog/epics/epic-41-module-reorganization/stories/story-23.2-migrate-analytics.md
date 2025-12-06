# Story 23.2: Migrate Analytics Components

## Description
Move analytics-related components to `shared/analytics/`.

## Acceptance Criteria
- [ ] Analytics components copied to `shared/analytics/`
- [ ] Old locations re-export from new location
- [ ] Build passes
- [ ] Analytics tracking works

## Files to Migrate
- `components/GoogleAnalytics.tsx` → `shared/analytics/GoogleAnalytics.tsx`
- `components/WebVitals.tsx` → `shared/analytics/WebVitals.tsx`
- Any other analytics components

## Tasks

1. Create `shared/analytics/` directory
2. Copy analytics components to new location
3. Update any internal imports if needed
4. Update old files to re-export from new location
5. Create `shared/analytics/index.ts` barrel export
6. Update `shared/index.ts` to include analytics exports

## Testing
- `npm run build` passes
- Google Analytics loads (check network tab)
- Web vitals reporting works

## Estimated Effort
15 minutes
