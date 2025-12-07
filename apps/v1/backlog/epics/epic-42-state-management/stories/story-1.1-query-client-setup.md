# Story 1.1: Install Dependencies and Configure QueryClient

## Description
Install TanStack Query and create the QueryClient configuration with appropriate defaults for the ski directory app.

## Acceptance Criteria
- [ ] TanStack Query v5 installed as dependency
- [ ] QueryClient created with sensible defaults
- [ ] QueryClientProvider added to root layout
- [ ] App continues to function with no changes to existing code

## Technical Details

### Dependencies to Install
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Files to Create

**`shared/api/queryClient.ts`**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 2 minutes - data is fresh for this duration
      staleTime: 2 * 60 * 1000,
      // Cache time: 5 minutes - keep unused data in cache
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
  },
});
```

**`shared/api/QueryProvider.tsx`**
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './queryClient';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Files to Modify

**`app/layout.tsx`**
- Wrap children with `<QueryProvider>`

## Testing
- [ ] App loads without errors
- [ ] React Query Devtools visible in development
- [ ] No console warnings about missing provider

## Estimate
Small (1-2 hours)
