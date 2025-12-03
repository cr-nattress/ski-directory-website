/**
 * @module API
 * @purpose Service layer for resort data operations
 * @context Used by hooks and components to fetch resort data from Supabase
 *
 * @exports
 * - resortService: Singleton instance for all resort data operations
 * - API types: Response types, filters, pagination, alerts
 *
 * @dependencies Supabase client via supabase-resort-service.ts
 *
 * @architecture
 * ```
 * Components/Hooks
 *       │
 *       ▼
 * resort-service.ts (facade)
 *       │
 *       ▼
 * supabase-resort-service.ts (implementation)
 *       │
 *       ▼
 * supabase-resort-adapter.ts (DB → Frontend type conversion)
 * ```
 */

export { resortService } from './resort-service';
export * from './types';
