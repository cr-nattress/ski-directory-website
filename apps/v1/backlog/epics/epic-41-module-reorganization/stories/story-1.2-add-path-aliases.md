# Story 1.2: Add TypeScript Path Aliases

## Description
Add TypeScript path aliases to enable clean imports from the new module structure.

## Acceptance Criteria
- [ ] `@modules/*` alias points to `./modules/*`
- [ ] `@ui/*` alias points to `./ui/*`
- [ ] `@shared/*` alias points to `./shared/*`
- [ ] `@services/*` alias points to `./services/*`
- [ ] TypeScript recognizes the aliases
- [ ] Next.js resolves the aliases correctly

## Tasks

1. Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],
         "@modules/*": ["./modules/*"],
         "@ui/*": ["./ui/*"],
         "@shared/*": ["./shared/*"],
         "@services/*": ["./services/*"]
       }
     }
   }
   ```

2. Verify Next.js config doesn't need updates (App Router handles this automatically)

3. Test alias resolution with a simple import

## Testing
- `npm run build` passes
- Create a test import to verify aliases work
- Remove test import after verification

## Estimated Effort
15 minutes
