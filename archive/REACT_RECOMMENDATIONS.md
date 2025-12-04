# React/Next.js Codebase Audit - Recommendations

**Audit Date:** 2025-12-03
**Next.js Version:** 14.1.0
**TypeScript Version:** 5.3.3
**React Version:** 18.2.0

## Executive Summary

This ski resort directory application demonstrates **strong overall code quality** with well-organized architecture patterns. The codebase follows modern React/Next.js best practices including proper server/client component separation, comprehensive TypeScript typing, and a clean data layer abstraction.

**Overall Score: 7.5/10**

**Key Strengths:**
- Clean data layer with facade/adapter pattern for Supabase integration
- Proper `'use client'` directive usage across 34 client components
- Feature flag system enabling progressive rollouts
- Error boundary implementation with logging
- Comprehensive JSDoc documentation

**Key Areas for Improvement:**
- TypeScript strict mode disabled
- Some `any` type assertions
- Inconsistent use of Next.js Image component
- Missing input validation with Zod

**Key Metrics:**
- Total Components Analyzed: 64 (34 client, 30 server)
- Source Files: 54 TypeScript files
- Custom Hooks: 16
- API Routes: 2
- Critical Issues: 1
- High Priority Issues: 3
- Medium Priority Issues: 6
- Low Priority Issues: 4

---

## 1. Component Architecture

### Strengths
- Clear separation between client and server components
- Proper `'use client'` directives on all interactive components
- Well-organized component directory structure (`components/resort-detail/`, `components/directory/`, etc.)
- Consistent PascalCase naming convention
- Feature flag pattern for conditional rendering (`FeatureFlag` component)
- Error boundary implemented and wrapped at root layout level

### Issues Found

#### Missing Accessibility Attributes - Medium
**Location:** `apps/v1/components/ResortCard.tsx:134-271`
**Description:** The ResortCard is wrapped in a Link but uses semantic HTML that might not convey the full interactive nature to screen readers.
**Current Code:**
```typescript
<Link
  href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
  className="card group cursor-pointer"
>
```
**Recommended Fix:**
```typescript
<Link
  href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
  className="card group cursor-pointer"
  aria-label={`View details for ${resort.name} ski resort`}
>
```
**Impact:** Accessibility

---

#### Inline Helper Component Without Memoization - Low
**Location:** `apps/v1/components/resort-detail/ResortDetail.tsx:233-239`
**Description:** The `StatCard` helper component is defined inside the parent component, causing it to be recreated on each render.
**Current Code:**
```typescript
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
  );
}
```
**Recommended Fix:**
Move to a separate file or move outside the parent function:
```typescript
// At module level or in a separate file
const StatCard = memo(function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
  );
});
```
**Impact:** Minor performance

---

## 2. TypeScript Quality

### Strengths
- Comprehensive type definitions in `types/supabase.ts` and `lib/types/`
- Proper use of interfaces for props and data structures
- Type-safe Supabase client with generated Database types
- Good use of utility types (`Record`, `Partial`, etc.)
- Exported type aliases for convenience

### Issues Found

#### TypeScript Strict Mode Disabled - High
**Location:** `apps/v1/tsconfig.json:7`
**Description:** The `strict` option is set to `false`, which disables important type safety checks including strict null checks, strict function types, and implicit any detection.
**Current Code:**
```json
{
  "compilerOptions": {
    "strict": false,
    // ...
  }
}
```
**Recommended Fix:**
Enable strict mode incrementally:
```json
{
  "compilerOptions": {
    "strict": true,
    // Or enable incrementally:
    // "strictNullChecks": true,
    // "noImplicitAny": true,
    // "strictFunctionTypes": true
  }
}
```
**Impact:** Type Safety - This is the single most impactful change for catching bugs at compile time

---

#### Use of `any` Type Assertions - Medium
**Location:** Multiple files
**Description:** Several `as any` type assertions bypass TypeScript's type checking.
**Locations:**
- `apps/v1/lib/api/supabase-resort-service.ts:407` - View not in generated types
- `apps/v1/lib/api/supabase-resort-service.ts:447` - Data transformation
- `apps/v1/components/directory/DirectoryContent.tsx:130` - Pass filter type
- `apps/v1/components/ResortMapView.tsx:104` - Leaflet internal property

**Current Code:**
```typescript
// supabase-resort-service.ts:407
const { data, error } = await supabase
  .from("resorts_map_pins" as any)
  .select("*");
```
**Recommended Fix:**
Extend the Supabase types or use type guards:
```typescript
// In types/supabase.ts, add the view to Views type
// Or create a separate type file for custom views
interface ResortMapPinsView {
  id: string;
  slug: string;
  // ... other fields
}

// Use a type assertion with the specific type
const { data, error } = await supabase
  .from("resorts_map_pins")
  .select("*") as unknown as { data: ResortMapPinsView[] | null; error: PostgrestError | null };
```
**Impact:** Type Safety

---

#### Missing Return Type Annotations - Low
**Location:** Various hook files
**Description:** While TypeScript infers return types, explicit annotations improve readability and catch errors earlier.
**Example Location:** `apps/v1/lib/hooks/useMapPins.ts:51`
**Recommended Fix:**
Already done in this codebase - this is more of a positive note. The codebase properly defines result interfaces like `UseMapPinsResult`.

---

## 3. State Management

### Strengths
- Appropriate use of local state with `useState` for component-specific state
- Custom hooks properly encapsulate state logic
- `useRef` for values that shouldn't trigger re-renders
- `useCallback` for memoized callbacks
- Hydration-safe pattern with `isHydrated` flag in `useViewMode`

### Issues Found

#### No Global State Management - Low
**Location:** N/A
**Description:** The application relies entirely on prop drilling and local state. For the current scope, this is appropriate. However, as features like user authentication and saved resorts are added, consider introducing a lightweight state manager.
**Recommendation:** When implementing `userAuthentication` or `savedResorts` features, consider:
- React Context for auth state
- Zustand for global UI state (simpler than Redux)
- TanStack Query for server state caching (already doing manual caching)
**Impact:** Future scalability

---

#### localStorage Caching Without Validation - Medium
**Location:** `apps/v1/lib/hooks/useMapPins.ts:60-73`
**Description:** Cached data from localStorage is parsed and used without validating its structure matches expected types.
**Current Code:**
```typescript
const { pins: cachedPins, timestamp }: CachedData = JSON.parse(cached);
if (Date.now() - timestamp < CACHE_DURATION_MS) {
  setPins(cachedPins);
  setIsLoading(false);
  return;
}
```
**Recommended Fix:**
Add runtime validation:
```typescript
function isValidCachedData(data: unknown): data is CachedData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.pins) && typeof d.timestamp === 'number';
}

const parsed = JSON.parse(cached);
if (isValidCachedData(parsed) && Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
  setPins(parsed.pins);
  setIsLoading(false);
  return;
}
```
**Impact:** Type Safety, Error Prevention

---

## 4. Data Fetching & API Routes

### Strengths
- Clean facade pattern with `resortService` abstracting data source
- Proper adapter pattern for DB → Frontend type conversion
- Well-structured API response types (`ApiResponse`, `PaginatedResponse`)
- API route validation with type guards
- Batch event limiting in engagement API

### Issues Found

#### Missing Request Validation with Zod - High
**Location:** `apps/v1/app/api/engagement/route.ts`
**Description:** While manual validation is implemented, using Zod would provide better type inference and more robust validation.
**Current Code:**
```typescript
function validateEvent(event: unknown): event is EngagementEvent {
  if (typeof event !== 'object' || event === null) return false;
  const e = event as Record<string, unknown>;
  if (typeof e.resort_id !== 'string' || !e.resort_id) return false;
  // ... manual checks
}
```
**Recommended Fix:**
```typescript
import { z } from 'zod';

const EventTypeSchema = z.enum(['impression', 'click', 'dwell']);
const EventContextSchema = z.enum(['landing', 'directory', 'search', 'themed_section', 'map']);

const EngagementEventSchema = z.object({
  resort_id: z.string().min(1),
  resort_slug: z.string().min(1),
  event_type: EventTypeSchema,
  context: EventContextSchema.optional(),
  section_id: z.string().optional(),
  position_index: z.number().optional(),
  page_number: z.number().optional(),
  session_id: z.string().optional(),
  dwell_seconds: z.number().optional(),
});

// In POST handler:
const result = z.object({ events: z.array(EngagementEventSchema).max(100) }).safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error.issues }, { status: 400 });
}
```
**Impact:** Type Safety, Maintainability

---

#### Missing Rate Limiting on API Routes - High
**Location:** `apps/v1/app/api/engagement/route.ts`
**Description:** The engagement API has no rate limiting beyond batch size, making it vulnerable to abuse.
**Recommended Fix:**
Implement rate limiting using Vercel Edge Config, Upstash Redis, or middleware:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  // ... rest of handler
}
```
**Impact:** Security

---

#### No Caching Headers on Conditions API - Medium
**Location:** `apps/v1/app/api/resorts/[slug]/conditions/route.ts:64-72`
**Description:** Good practice - cache headers are already implemented. This is a strength.
```typescript
'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900'
```

---

## 5. Performance Optimization

### Strengths
- Dynamic imports for Leaflet (SSR safety)
- localStorage caching with TTL for map pins
- Pagination with infinite scroll
- Next.js Image component used in most places
- Optimized image formats configured (AVIF, WebP)
- Device sizes and cache TTL configured in next.config.js

### Issues Found

#### Native `<img>` Tags Instead of Next.js Image - Critical
**Location:** Multiple files
**Description:** External images (webcams, galleries) use native `<img>` tags, missing optimization benefits.
**Locations:**
- `apps/v1/components/resort-detail/WebcamGallery.tsx:60, 113`
- `apps/v1/components/resort-detail/PhotoGallery.tsx:51, 67, 88, 116`

**Current Code:**
```typescript
// eslint-disable-next-line @next/next/no-img-element
<img
  src={webcam.image}
  alt={webcam.name}
  className="w-full h-full object-cover"
/>
```
**Recommended Fix:**
For external images where Next.js Image can't optimize:
```typescript
// Option 1: Add domains to next.config.js
// Option 2: Use unoptimized prop
<Image
  src={webcam.image}
  alt={webcam.name}
  fill
  className="object-cover"
  unoptimized // For external domains not in remotePatterns
  sizes="(max-width: 768px) 50vw, 33vw"
/>
```
**Note:** The eslint-disable comment acknowledges this - webcam images come from various external sources that can't all be whitelisted. Consider using `unoptimized` with Next.js Image for consistency and better lazy loading.
**Impact:** Performance, Core Web Vitals

---

#### Missing `useMemo` for Expensive Computations - Medium
**Location:** `apps/v1/components/ResortMapView.tsx:145-248`
**Description:** The map markers are recreated on every render.
**Recommended Fix:**
```typescript
const markers = useMemo(() => {
  return pins.filter(pin => pin.latitude && pin.longitude).map(pin => ({
    pin,
    icon: createMarkerIcon(pin.passAffiliations[0] || 'local', pin.isLost),
  }));
}, [pins]);
```
**Impact:** Performance

---

#### Bundle Size - Consider Code Splitting - Low
**Location:** `apps/v1/components/ResortMapView.tsx`
**Description:** Already using dynamic import for Leaflet. This is a strength.
**Improvement Suggestion:** Consider lazy loading the directory filters and social links components since they're below the fold.

---

## 6. Project Structure & Organization

### Strengths
- Clear separation: `app/`, `components/`, `lib/`, `types/`
- Feature-based component organization
- Path aliases (`@/*`) for clean imports
- Centralized type exports in index files
- Configuration files in `lib/config/`

### Issues Found

#### Inconsistent Hook File Organization - Low
**Location:** `apps/v1/lib/hooks/`
**Description:** Hooks mixing data fetching, UI state, and tracking concerns. Consider subcategories.
**Recommended Structure:**
```
lib/hooks/
├── data/
│   ├── useMapPins.ts
│   ├── useResort.ts
│   └── useInfiniteResorts.ts
├── ui/
│   ├── useViewMode.ts
│   └── useFeatureFlag.ts
└── tracking/
    ├── useImpressionTracking.ts
    └── useLogger.ts
```
**Impact:** Maintainability

---

## 7. Security Considerations

### Strengths
- Environment variables for sensitive keys
- Service role key only used server-side
- Input validation on API routes
- Batch size limits
- No sensitive data in error messages
- `rel="noopener noreferrer"` on external links

### Issues Found

#### Non-null Assertions on Environment Variables - Medium
**Location:** `apps/v1/lib/supabase.ts:22-23`, `apps/v1/app/api/engagement/route.ts:16-17`
**Description:** Using `!` assertions assumes env vars exist. Runtime guard exists but assertion happens first.
**Current Code:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
```
**Recommended Fix:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Now TypeScript knows they're defined
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```
**Impact:** Type Safety

---

#### Consider Content Security Policy - Low
**Location:** `next.config.js`
**Description:** No CSP headers defined. While not critical for this app, adding basic CSP improves security.
**Recommended Fix:**
Add security headers via middleware or next.config.js:
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://storage.googleapis.com https://*.tile.openstreetmap.org; style-src 'self' 'unsafe-inline';"
  }
];
```
**Impact:** Security Hardening

---

## 8. Testing Coverage

### Assessment
- No test files found in the repository
- No testing framework configured

### Recommendations

#### Add Testing Infrastructure - High Priority
1. Install testing dependencies:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

2. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
```

3. Priority test targets:
   - Data adapters (`supabase-resort-adapter.ts`)
   - Custom hooks (`useMapPins`, `useInfiniteResorts`)
   - API route handlers
   - Feature flag logic

---

## Priority Action Items

### Critical (Fix Immediately)
1. [Native img tags in galleries](#native-img-tags-instead-of-nextjs-image---critical) - Performance impact

### High Priority (Fix This Week)
1. [Enable TypeScript strict mode](#typescript-strict-mode-disabled---high) - Type safety foundation
2. [Add Zod validation to API routes](#missing-request-validation-with-zod---high) - Security & type safety
3. [Add rate limiting](#missing-rate-limiting-on-api-routes---high) - Security

### Medium Priority (Fix This Sprint)
1. [Reduce `any` type assertions](#use-of-any-type-assertions---medium) - Type safety
2. [Add localStorage cache validation](#localstorage-caching-without-validation---medium) - Error prevention
3. [Add accessibility attributes](#missing-accessibility-attributes---medium) - Accessibility
4. [Memoize expensive computations](#missing-usememo-for-expensive-computations---medium) - Performance
5. [Environment variable handling](#non-null-assertions-on-environment-variables---medium) - Type safety

### Low Priority (Future Improvement)
1. [Extract inline components](#inline-helper-component-without-memoization---low)
2. [Organize hooks by category](#inconsistent-hook-file-organization---low)
3. [Add Content Security Policy](#consider-content-security-policy---low)
4. [Consider global state management](#no-global-state-management---low)

---

## Quick Wins

1. **Enable `strictNullChecks` in tsconfig.json** - Estimated: 30m
   - Single line change, incremental step toward strict mode
   - Will surface potential null reference bugs

2. **Add `aria-label` to ResortCard links** - Estimated: 10m
   - Quick accessibility improvement
   - Copy name into aria-label attribute

3. **Replace `as any` with proper type assertions** - Estimated: 1h
   - Update the 6 occurrences with specific types
   - Improves code documentation

4. **Add `.env.example` file** - Estimated: 5m
   - Document required environment variables
   - Helps new developers onboard

5. **Configure Dependabot** - Estimated: 5m
   - Add `.github/dependabot.yml`
   - Keep dependencies updated automatically

---

## Best Practice Checklist

Use this checklist for future development:

- [x] All components have proper TypeScript interfaces for props
- [x] Server/Client components are correctly designated
- [ ] No use of `any` type without justification (6 occurrences)
- [x] Async operations have proper error handling
- [x] Images use Next.js Image component (mostly - galleries pending)
- [x] API routes validate input data (manually - consider Zod)
- [ ] Environment variables are properly typed (using non-null assertions)
- [x] Custom hooks follow naming conventions (use*)
- [x] Components are under 250 lines when possible
- [x] Reusable logic is extracted into hooks/utilities
- [ ] Tests exist for critical paths (no tests)
- [ ] Accessibility considerations in interactive elements (partial)

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Web Vitals](https://web.dev/vitals/)

---

**Next Review:** Schedule follow-up audit in 2-4 weeks after implementing critical fixes.
