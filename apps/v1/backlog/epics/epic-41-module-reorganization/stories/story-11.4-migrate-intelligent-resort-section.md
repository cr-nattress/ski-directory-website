# Story 11.4: Migrate IntelligentResortSection Component

## Description
Move the IntelligentResortSection component from `components/` to `modules/dashboard/components/`.

## Acceptance Criteria
- [ ] IntelligentResortSection copied to `modules/dashboard/components/IntelligentResortSection.tsx`
- [ ] Old location re-exports from new location
- [ ] Build passes
- [ ] Intelligent sections render based on conditions

## Files to Migrate
- `components/IntelligentResortSection.tsx` → `modules/dashboard/components/IntelligentResortSection.tsx`

## Tasks

1. Copy `components/IntelligentResortSection.tsx` to `modules/dashboard/components/IntelligentResortSection.tsx`
2. Update any internal imports if needed
3. Update `components/IntelligentResortSection.tsx` to re-export:
   ```typescript
   export * from '@modules/dashboard/components/IntelligentResortSection';
   ```
4. Add to `modules/dashboard/index.ts` barrel export

## Testing
- `npm run build` passes
- Intelligent sections show correct content
- Personalized recommendations work

## Estimated Effort
10 minutes
