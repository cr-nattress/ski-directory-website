/**
 * Shared API module - TanStack Query infrastructure
 *
 * @example
 * import { QueryProvider, queryKeys, getQueryClient } from '@shared/api';
 */

// Query client
export { createQueryClient, getQueryClient } from './queryClient';

// React provider
export { QueryProvider } from './QueryProvider';

// Query keys factory
export { queryKeys } from './queryKeys';

// Query hooks
export * from './queries';
