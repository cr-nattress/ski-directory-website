# Story 29.5: Add Testing Infrastructure with Vitest

## Priority: High

## Context

The codebase has no testing infrastructure. Adding tests for critical paths enables confident refactoring and catches regressions early.

## Current State

- No test files in repository
- No testing framework configured
- No test scripts in package.json

## Requirements

1. Install Vitest and React Testing Library
2. Configure Vitest for Next.js
3. Create initial test suite for critical paths
4. Add test scripts to package.json
5. Set up CI integration (optional)

## Implementation

### Step 1: Install Dependencies

```bash
cd apps/v1
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

### Step 2: Create Vitest Config

Create `apps/v1/vitest.config.ts`:

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
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts', 'components/**/*.tsx'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
```

### Step 3: Create Setup File

Create `apps/v1/vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as Storage;
```

### Step 4: Add Test Scripts

Update `apps/v1/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 5: Create Initial Tests

#### Test: Supabase Adapter

Create `apps/v1/lib/api/supabase-resort-adapter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { adaptResortFromSupabase } from './supabase-resort-adapter';

describe('adaptResortFromSupabase', () => {
  it('transforms database fields to frontend types', () => {
    const dbResort = {
      id: '123',
      slug: 'vail',
      name: 'Vail',
      state: 'colorado',
      country: 'us',
      // ... minimal fields
    };

    const result = adaptResortFromSupabase(dbResort);

    expect(result.id).toBe('123');
    expect(result.slug).toBe('vail');
    expect(result.stateCode).toBe('colorado');
  });

  it('handles null optional fields', () => {
    const dbResort = {
      id: '123',
      slug: 'test',
      name: 'Test',
      major_city_name: null,
      // ...
    };

    const result = adaptResortFromSupabase(dbResort);

    expect(result.majorCityName).toBeUndefined();
  });
});
```

#### Test: Feature Flags

Create `apps/v1/lib/config/feature-flags.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { featureFlags, getFeatureFlag, isFeatureEnabled } from './feature-flags';

describe('featureFlags', () => {
  it('has expected flags defined', () => {
    expect(featureFlags.liveConditions).toBeDefined();
    expect(featureFlags.infiniteScroll).toBeDefined();
  });

  it('getFeatureFlag returns correct value', () => {
    expect(getFeatureFlag('liveConditions')).toBe(true);
    expect(getFeatureFlag('planYourVisitCard')).toBe(false);
  });

  it('isFeatureEnabled checks boolean true', () => {
    expect(isFeatureEnabled('liveConditions')).toBe(true);
    expect(isFeatureEnabled('planYourVisitCard')).toBe(false);
  });
});
```

#### Test: Utility Functions

Create `apps/v1/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatNumber, formatSnowfall, formatDistance, formatRating } from './utils';

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatSnowfall', () => {
  it('formats zero as no new snow', () => {
    expect(formatSnowfall(0)).toBe('No new snow');
  });

  it('formats positive inches', () => {
    expect(formatSnowfall(6)).toBe('6" new');
  });
});

describe('formatDistance', () => {
  it('formats miles', () => {
    expect(formatDistance(75)).toBe('75 mi');
  });
});

describe('formatRating', () => {
  it('formats to one decimal', () => {
    expect(formatRating(4.567)).toBe('4.6');
  });
});
```

### Step 6: Add TypeScript Config for Tests

Update `apps/v1/tsconfig.json`:

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.test.ts",
    "**/*.test.tsx",
    ".next/types/**/*.ts"
  ]
}
```

## Acceptance Criteria

- [ ] Vitest installed and configured
- [ ] Test setup file handles mocks
- [ ] At least 5 test files created
- [ ] `npm test` runs tests successfully
- [ ] Coverage report generated
- [ ] Tests pass in CI (if configured)

## Priority Test Targets

1. `lib/api/supabase-resort-adapter.ts` - Data transformation
2. `lib/config/feature-flags.ts` - Flag logic
3. `lib/utils.ts` - Utility functions
4. `lib/hooks/useViewMode.ts` - State management
5. `lib/api/schemas.ts` - Zod validation (after Story 29.3)

## Testing

```bash
npm test           # Watch mode
npm run test:run   # Single run
npm run test:coverage  # With coverage
```

## Effort: Large (4-8 hours)
