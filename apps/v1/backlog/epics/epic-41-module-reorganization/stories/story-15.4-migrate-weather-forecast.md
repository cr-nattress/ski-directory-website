# Story 15.4: Migrate WeatherForecastCard Component

## Description
Move the WeatherForecastCard component from `components/resort-detail/` to `modules/resort-detail/components/conditions/`.

## Acceptance Criteria
- [ ] WeatherForecastCard copied to `modules/resort-detail/components/conditions/WeatherForecastCard.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Weather forecast displays correctly

## Files to Migrate
- `components/resort-detail/WeatherForecastCard.tsx` → `modules/resort-detail/components/conditions/WeatherForecastCard.tsx`

## Tasks

1. Copy component to `modules/resort-detail/components/conditions/WeatherForecastCard.tsx`
2. Update any internal imports if needed
3. Update old file to re-export
4. Add to `modules/resort-detail/components/conditions/index.ts` barrel export

## Testing
- `npm run build` passes
- Weather forecast displays
- Temperature, snow forecast shown

## Estimated Effort
10 minutes
